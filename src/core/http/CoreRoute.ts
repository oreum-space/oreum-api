import { Path } from 'path-parser'
import { HttpHandler } from '@/core/http/CoreHttp'
import CoreRequest from '@/core/http/CoreRequest'
import CoreResponse from '@/core/http/CoreResponse'

interface CoreRouteOptions {
  subdomain?: string
  path?: string
  handlers?: Array<HttpHandler>
  method?: string
}

export default class CoreRoute {
  private readonly routes: Array<CoreRoute>
  private readonly subdomain?: string
  private readonly path?: Path
  private readonly handlers?: Array<HttpHandler>
  readonly #method?: string

  constructor (options: CoreRouteOptions) {
    this.subdomain = options.subdomain
    this.path = options.path ? new Path(options.path) : void 0
    this.handlers = options.handlers
    this.#method = options.method
    this.routes = []
  }

  private async handleRouter (request: CoreRequest, response: CoreResponse) {
    if (this.path && !this.path?.partialTest(request.path)) return

    for (const route of this.routes) {
      if (response.closed) return
      await route.handle(request, response)
    }
  }

  private async handleEndpoint (request: CoreRequest, response: CoreResponse) {
    if (this.#method !== request.method) return
    const params = this.path?.test(request.path)

    if (this.path && !params) return
    if (!this.handlers) return
    request.setParams(params ?? {})
    for (const handler of this.handlers) {
      if (response.closed) return
      await handler(request, response)
    }
  }

  public async handle (request: CoreRequest, response: CoreResponse) {
    // any
    if (!this.subdomain && !this.path && !this.#method && this.handlers)  {
      for (const handler of this.handlers) {
        if (response.closed) return
        await handler(request, response)
      }
    }
    if (this.subdomain && this.subdomain !== request.subdomain) return
    if (this.#method) {
      await this.handleEndpoint(request, response)
      return
    }
    await this.handleRouter(request, response)
  }

  public route (path?: string): CoreRoute {
    const route = new CoreRoute({ path })
    this.routes.push(route)
    return route
  }

  public method (method: string, path?: string, ...handlers: Array<HttpHandler>) {
    const route = new CoreRoute({ method, path, handlers })
    this.routes?.push(route)
    return route
  }

  public get (path?: string, ...handlers: Array<HttpHandler>) {
    this.method('get', path, ...handlers)
    return this
  }

  public post (path?: string, ...handlers: Array<HttpHandler>) {
    this.method('post', path, ...handlers)
    return this
  }

  public patch (path?: string, ...handlers: Array<HttpHandler>) {
    this.method('patch', path, ...handlers)
    return this
  }

  public delete (path?: string, ...handlers: Array<HttpHandler>) {
    this.method('delete', path, ...handlers)
    return this
  }

  public any (...handlers: Array<HttpHandler>) {
    const route = new CoreRoute({ handlers })
    this.routes.push(route)
    return route
  }
}