import CoreEncoder from '@/core/CoreEncoder'
import contentTypes from '@/dictionaries/contentTypes'
import { ClientSessionOptions, SecureClientSessionOptions, ServerHttp2Stream } from 'http2'
import { OutgoingHttpHeaders } from 'node:http'
import { connect, ServerStreamResponseOptions } from 'node:http2'
import CoreRequest from '@/core/http/CoreRequest'

export default class CoreResponse {
  private readonly stream: ServerHttp2Stream
  private readonly headers: OutgoingHttpHeaders

  constructor (stream: ServerHttp2Stream) {
    this.stream = stream
    this.headers = {}
  }

  public respond (headers?: OutgoingHttpHeaders, options?: ServerStreamResponseOptions): this {
    if (this.headersSent || this.destroyed || !this.writable) return this
    this.stream.respond(headers, options)
    return this
  }

  public async end (chunk?: any) {
    if (this.closed || this.destroyed) return
    return await new Promise<void>((resolve) => {
      if (chunk && this.writable) this.stream.write(chunk, () => this.stream.end(resolve))
      else this.stream.end(resolve)
    })
  }

  public get destroyed () {
    return this.stream.destroyed
  }

  public get headersSent () {
    return this.stream.headersSent
  }

  public get closed () {
    return this.stream.closed
  }

  public get writable () {
    return this.stream.writable
  }

  public get open () {
    return !this.stream.headersSent && !this.stream.closed
  }

  public addHeader (key: string, value: string) {
    this.headers[key] = value
  }

  private stringify (data: any) {
    try {
      return {
        payload: JSON.stringify(data),
        status: 200
      }
    } catch {
      return {
        status: 500,
        payload: '{ "error": "failed-json-stringify" }'
      }
    }
  }

  public async json (data?: any) {
    const { payload, status } = this.stringify(data ?? null)
    const chunk = CoreEncoder.encode(payload)

    this.respond({
      ':status': status,
      'content-type': contentTypes.json,
      'content-length': chunk.length,
      ...this.headers
    })

    await this.end(chunk)
  }

  /* public legacyProxy (request: CoreRequest, options: http1.RequestOptions) {
    return new Promise<void>((resolve) => {
      http1.request(options, (proxyResponse) => {
        const proxyChunks: Array<Uint8Array> = []
        console.log('proxyResponse')
        proxyResponse
          .setEncoding('utf8')
          .on('data', (c) => {
            console.log('legacyProxy data', c)
            proxyChunks.push(typeof c === 'string' ? CoreEncoder.encode(c) : c)
          })
          .on('end', async () => {
            console.log('legacyProxy end')
            await this.end(<Uint8Array>Buffer.concat(proxyChunks))
            resolve()
          })
          .on('error', async (error) => {
            this.respond({ ':status': 503 })
            await this.end(CoreEncoder.encode(JSON.stringify({
              error: {
                type: 'proxy',
                message: error.message
              }
            })))
            resolve()
          })
      })
    })
  } */

  public proxy (request: CoreRequest, origin: string, options?: ClientSessionOptions | SecureClientSessionOptions) {
    return new Promise<void>((resolve) => {
      console.log('connect')
      connect(origin, options, (proxySession) => {
        const proxyChunks: Array<Uint8Array> = []
        console.log('before request')
        proxySession.request(request.headers)
          .on('response', (proxyResponseHeaders) => {
            this.respond(proxyResponseHeaders)
          })
          .on('error', async (error) => {
            this.respond({ ':status': 503 })
            await this.end(CoreEncoder.encode(JSON.stringify({
              error: {
                type: 'proxy',
                message: error instanceof Error ? error.message : 'unknown'
              }
            })))
            resolve()
          })
          .on('data', c => proxyChunks.push(typeof c === 'string' ? CoreEncoder.encode(c) : c))
          .on('end', async () => {
            await this.end(<Uint8Array>Buffer.concat(proxyChunks))
            proxySession.close()
            resolve()
          })
      }).on('error', async (error) => {
        this.respond({ ':status': 503 })
        await this.end(CoreEncoder.encode(JSON.stringify({
          error: {
            type: 'proxy',
            message: error instanceof Error ? error.message : 'unknown'
          }
        })))
        resolve()
      })
    })
  }
}