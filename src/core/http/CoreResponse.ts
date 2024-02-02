import CoreEncoder from '@/core/CoreEncoder'
import contentTypes from '@/dictionaries/contentTypes'
import { ServerHttp2Stream } from 'http2'
import { OutgoingHttpHeaders } from 'node:http'
import { ServerStreamResponseOptions } from 'node:http2'

export default class CoreResponse {
  private readonly stream: ServerHttp2Stream
  private readonly headers: OutgoingHttpHeaders

  constructor (stream: ServerHttp2Stream) {
    this.stream = stream
    this.headers = {}
  }

  public respond (headers?: OutgoingHttpHeaders, options?: ServerStreamResponseOptions): this {
    if (!this.headersSent) this.stream.respond(headers, options)
    return this
  }

  public async end (chunk?: any) {
    if (this.closed) return
    return await new Promise<void>((resolve) => {
      this.stream.end(chunk, resolve)
    })
  }

  public get headersSent () {
    return this.stream.headersSent
  }

  public get closed () {
    return this.stream.closed
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
}