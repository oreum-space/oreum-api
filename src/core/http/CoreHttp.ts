import CoreEnv from '@/core/CoreEnv'
import CoreRequest from '@/core/http/CoreRequest'
import CoreResponse from '@/core/http/CoreResponse'
import CoreRoute from '@/core/http/CoreRoute'
import { readFileSync } from 'fs'
import {
  createSecureServer,
  IncomingHttpHeaders,
  ServerHttp2Stream
} from 'http2'
import { Http2SecureServer } from 'node:http2'

export type HttpHandler = (request: CoreRequest, response: CoreResponse) => Promise<void> | void

export default class CoreHttp {
  public readonly server: Http2SecureServer
  private readonly routes: Array<CoreRoute>

  constructor () {
    this.routes = []
    this.server = createSecureServer({ cert: readFileSync(CoreEnv.CORE_HTTP_CERT), key: readFileSync(CoreEnv.CORE_HTTP_KEY), allowHTTP1: true })
      .on('error', this.error.bind(this))
      .on('stream', this.stream.bind(this))
      .on('unknownProtocol', this.unknownProtocol.bind(this))
      .listen(+CoreEnv.CORE_HTTP_PORT, () => {
        console.clear()
        console.log(`Listening ${ CoreEnv.CORE_HTTP_PORT }...`)
      })
  }

  private unknownProtocol () {
    console.log('unknownProtocol')
  }

  private error (error: any) {
    console.error(error)
  }

  private async stream (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) {
    try {
      const request = new CoreRequest(stream, headers)
      const response = new CoreResponse(stream)

      for (const route of this.routes) {
        if (response.closed) return
        await route.handle(request, response)
      }

      response.respond({ 'status': 404 })
      await response.end()
    } catch (error) {
      console.error(error)
      try {
        if (stream.closed) return
        if (!stream.headersSent) stream.respond({ ':status': 500 })
        stream.end()
      } finally {
        console.error(error)
      }
    }
  }

  public route (path?: string): CoreRoute {
    const route = new CoreRoute({ path })
    this.routes.push(route)
    return route
  }

  subdomain (subdomain: string): CoreRoute {
    const route = new CoreRoute({ subdomain })
    this.routes.push(route)
    return route
  }

  public method (method: string, path: string, ...handlers: Array<HttpHandler>) {
    const route = new CoreRoute({ method, path, handlers })
    this.routes.push(route)
    return route
  }

  public get (path: string, ...handlers: Array<HttpHandler>) {
    this.method('get', path, ...handlers)
    return this
  }

  public post (path: string, ...handlers: Array<HttpHandler>) {
    this.method('post', path, ...handlers)
    return this
  }

  public patch (path: string, ...handlers: Array<HttpHandler>) {
    this.method('patch', path, ...handlers)
    return this
  }

  public delete (path: string, ...handlers: Array<HttpHandler>) {
    this.method('delete', path, ...handlers)
    return this
  }
}