import { readFile } from 'fs/promises'
import { ServerHttp2Stream, IncomingHttpHeaders } from 'http2'
import { OutgoingHttpHeaders } from 'node:http'
import { DeepPartial } from '../types/DeepPartial'
import ApiCoder from './ApiCoder'
import ApiError from './ApiError'
import ApiLogger from './ApiLogger'

const REGEX_AUTHORITY_WITHOUT_SUBDOMAIN = /^[a-z]+\.[a-z]+$/
const REGEX_AUTHORITY_WITH_SUBDOMAIN = /^[a-z]+\.[a-z]+\.[a-z]+$/

class ApiStreamAuthority {
  authority: string
  subdomain?: string
  domain?: string
  tdl?: string

  constructor (authority: string) {
    this.authority = authority

    if (REGEX_AUTHORITY_WITH_SUBDOMAIN.test(authority)) {
      const [subdomain, domain, tdl] = authority.split('.')
      this.subdomain = subdomain
      this.domain = domain
      this.tdl = tdl
      return
    }

    if (REGEX_AUTHORITY_WITHOUT_SUBDOMAIN.test(authority)) {
      const [domain, tdl] = authority.split('.')
      this.domain = domain
      this.tdl = tdl
      return
    }
  }

  public get domainName () {
    if (!this.domain) return void 0
    return `${ this.domain }.${ this.tdl }`
  }
}

class ApiStreamData {
  promise: Promise<Uint8Array>
  chunk?: Uint8Array

  constructor (apiStream: ApiStream) {
    this.promise = new Promise((resolve) => {
      const chunks: Array<Uint8Array> = []

      apiStream.stream.on('data', (chunk: string | Uint8Array) => chunks.push(typeof chunk === 'string' ? ApiCoder.encode(chunk) : chunk))
      apiStream.stream.on('end', () => {
        this.chunk = <Uint8Array>Buffer.concat(chunks)
        resolve(this.chunk)
      })
    })
  }

  async json <T extends unknown>(required?: false): Promise<DeepPartial<T> | void>
  async json <T extends unknown>(required: true): Promise<DeepPartial<T>>
  async json <T extends unknown>(required: boolean = false): Promise<DeepPartial<T> | void> {
    const chunk = await this.promise
    const data = JSON.parse(ApiCoder.decode(chunk))
    if (required && !data) throw new ApiError('data-required', 400)
    return data
  }
}

export interface ApiStreamSend {
  status: number,
  type: string,
  data: Uint8Array
}

export type ApiStreamIterator = AsyncGenerator<string, ReturnType<typeof JSON.parse>, boolean>

export type ApiStreamGenerator = (apiStream: ApiStream) => ApiStreamIterator

export default class ApiStream {
  stream: ServerHttp2Stream
  headers: IncomingHttpHeaders
  method: string
  path: string
  authority: ApiStreamAuthority
  closed: boolean
  data: ApiStreamData

  constructor (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) {
    this.stream = stream
    this.headers = headers
    this.method = (headers[':method'] || 'unknown').toLowerCase()
    this.path = headers[':path'] ?? ''
    this.authority = new ApiStreamAuthority(headers[':authority'] ?? '')
    this.closed = false
    this.data = new ApiStreamData(this)
  }

  /*
  async respond (response: {
    status: number,
    'content-type': string,
    data: Uint8Array
  }) {
    return new Promise<void>((resolve) => {
      try {
        if (this.closed) return resolve()
        this.stream.respond({ ':status': response.status, 'content-type': response['content-type'] })
        this.stream.write(response.data, () => {
          this.stream.end()
          this.closed = true
          resolve()
        })
      } catch (error) {
        ApiLogger.error(error)
        resolve()
      }
    })
  }
  */

  async send (data: ApiStreamSend) {
    await new Promise<void>((resolve) => {
      if (this.closed) return resolve()
      this.closed = true
      this.stream.respond({
        ':status': data.status,
        'content-type': data.type,
        'content-length': data.data.length
      })
      this.stream.end(data.data, resolve)
    })
  }

  async json (data?: ReturnType<typeof JSON.parse>, headers?: OutgoingHttpHeaders) {
    await new Promise<void>((resolve) => {
      if (this.closed) return resolve()
      this.closed = true
      const buffer = ApiCoder.encode(JSON.stringify(data))
      this.stream.respond({
        ':status': 200,
        'content-type': 'application/json',
        'content-length': buffer.length,
        'access-control-allow-origin': this.authority.domainName,
        ...headers
      })
      this.stream.end(buffer, resolve)
    })
  }

  /* async respond (generator: ApiStreamGenerator) {
    if (this.closed) return
    this.closed = true

    this.stream.respond({
      ':status': 200,
      ':content-type': 'application/async.oreum.space+json'
    })

    const iterator = generator(this)
    let current = await iterator.next()

    while (!current.done) {

    }
    /* this.stream.respond()
    ApiLogger.debug('respond')
    const iterator = generator(this)
    let current = await iterator.next()
    let index = 0

    while (!current.done) {
      ApiLogger.debug('respond iterator', current)
      this.stream.additionalHeaders({
        [`oreum-progress[${ index }]`]: current.value
      })
      current = await iterator.next()
    }

    ApiLogger.debug('respond iterator', current)

    const { value } = current

    await new Promise<void>((resolve) => {
      if (this.closed) return resolve()
      this.closed = true
      this.stream.additionalHeaders({
        ':status': value.status,
        'content-type': value.type,
        'content-length': value.data.length
      })
      this.stream.end(value.data, resolve)
    })
  } */

  async error (apiError: ApiError) {
    await this.send({
      status: apiError.status,
      type: 'application/json',
      data: ApiCoder.encode(JSON.stringify({ error: apiError.message }))
    })
  }

  async notFound () {
    await this.error(new ApiError('page-not-found', 404))
  }

  private static MIME_TYPES: Record<string, string> = {
    bin: 'application/octet-stream',
    css: 'text/css',
    gz: 'application/gz',
    gif: 'image/gif',
    htm: 'text/html',
    html: 'text/html',
    ico: 'image/vnd.microsoft.icon',
    json: 'application/json',
    js: 'text/javascript',
    mjs: 'text/javascript',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    png: 'image/png',
    pdf: 'application/pdf',
    rar: 'application/vnd.rar',
    svg: 'image/svg+xml',
    tar: 'application/x-tar',
    txt: 'text/plain',
    wav: 'audio/wav',
    weba: 'audio/webm',
    webm: 'video/webm',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    xhtml: 'application/xhtml+xml',
    xml: 'application/xml',
    zip: 'application/zip',
    '7z': 'application/x-7z-compressed',
    default: 'text/plain'
  }

  private getMimeType (path: string): string {
    const extension = path.split('.').at(-1)?.split('/').at(0) ?? 'default'
    return ApiStream.MIME_TYPES[extension] ?? ApiStream.MIME_TYPES.default
  }

  async file (path: string) {
    if (this.closed) return
    try {
      await this.send({
        status: 200,
        type: this.getMimeType(path),
        data: await readFile(path)
      })
    } catch (error) {
      ApiLogger.error('file', 'not-found', path)
    }
  }

  // async json (data: unknown) {
  //   const dataString = JSON.stringify(data)
  //   try {
  //     await this.respond({
  //       status: 200,
  //       'content-type': 'application/json',
  //       data: dataString
  //     })
  //   } catch (error) {
  //     ApiLogger.error('json', 'unknown-error', dataString)
  //   }
  // }
}
