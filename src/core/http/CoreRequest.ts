import CoreDecoder from '@/core/CoreDecoder'
import CoreEncoder from '@/core/CoreEncoder'
import regexp from '@/regexp/regexp'
import {
  IncomingHttpHeaders,
  ServerHttp2Stream
} from 'http2'
import { DeepPartial } from '@/types/DeepPartial'

export default class CoreRequest {
  private readonly stream: ServerHttp2Stream
  private readonly headers: IncomingHttpHeaders
  #params: Record<string, any>
  private readonly dataPromise: Promise<Uint8Array>

  constructor (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) {
    this.stream = stream
    this.headers = headers
    this.#params = {}
    this.dataPromise = new Promise<Uint8Array>((resolve) => {
      const chunks: Array<Uint8Array> = []
      this.stream
        .on('data', (c: string | Uint8Array) => chunks.push(typeof c === 'string' ? CoreEncoder.encode(c) : c))
        .on('end', () => resolve(<Uint8Array>Buffer.concat(chunks)))
    })
  }

  get authority () {
    return this.headers[':authority']
  }

  #domain?: string
  get domain () {
    return this.#domain ?? (
      this.authority && regexp.domain.test(this.authority) ? (this.#domain = this.authority) : void 0
    )
  }

  #subdomain?: string
  get subdomain () {
    if (!this.domain) return

    const split = this.domain.split('.')

    if (split.length >= 3) {
      this.#subdomain = split.at(-3)
    }
    return this.#subdomain
  }

  #path?: string
  get path () {
    return this.#path ?? (this.#path = this.headers[':path'] ?? '/')
  }

  #method?: string
  get method () {
    return this.#method ?? (this.#method = this.headers[':method']?.toLowerCase() ?? 'get')
  }

  public setParams (params: Record<string, any>) {
    this.#params = params
  }

  get params () {
    return this.#params
  }

  async json <T extends unknown>(): Promise<DeepPartial<T> | void> {
    try {
      return JSON.parse(CoreDecoder.decode(await this.dataPromise))
    } catch {
      return void 0
    }
  }
}