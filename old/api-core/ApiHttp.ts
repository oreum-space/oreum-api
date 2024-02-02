import { readFileSync } from 'fs'
import { ServerHttp2Stream, IncomingHttpHeaders, createSecureServer } from 'http2'
import ApiError from './ApiError'
import ApiLogger from './ApiLogger'
import ApiCore from './ApiCore'
import ApiStream from './ApiStream'

export default class ApiHttp {
  private readonly apiCore: ApiCore
  private static readonly secureServerOptions = {
    cert: readFileSync(process.env.HTTPS_CERTIFICATE ?? ''),
    key: readFileSync(process.env.HTTPS_PRIVATE_KEY ?? '')
  }

  private static readonly domains = (process.env.DOMAIN_NAME ?? '...').split(' ')

  constructor (apiCore: ApiCore) {
    this.apiCore = apiCore
  }

  private errorHandler (error: Error) {
    ApiLogger.error(error.message)
  }

  private checkDomainName (apiStream: ApiStream): void | never {
    if (apiStream.authority.domainName === void 0) throw new ApiError('no-authority', 403)
    if (!ApiHttp.domains.includes(apiStream.authority.domainName)) throw new ApiError('bad-authority', 403)
  }

  private checkMethod (apiStream: ApiStream): void | never {
    if (apiStream.method === 'unknown') throw new ApiError('bad-method', 403)
  }

  private async streamHandler (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) {
    const apiStream = new ApiStream(stream, headers)
    try {
      this.checkDomainName(apiStream)
      this.checkMethod(apiStream)

      await this.apiCore.modules.find((module) => module.subdomain === apiStream.authority.subdomain)?.handleApiStream(apiStream)
      await apiStream.notFound()
    } catch (error) {
      const localError = error instanceof ApiError
        ? error
        : new ApiError(
          error instanceof Error
            ? error.message
            : void 0
        )
      ApiLogger.error(error)
      return await apiStream.error(localError)
    }
  }

  public mount () {
    const port = process.env.HTTPS_PORT ?? 443
    const domains = (process.env.DOMAIN_NAME ?? 'unknown.local').split(' ')
    createSecureServer(ApiHttp.secureServerOptions)
      .on('error', this.errorHandler.bind(this))
      .on('stream', this.streamHandler.bind(this))
      .listen(port)

    ApiLogger.log(`HTTPS server started! Allowed domains: [${ domains.join(', ') }]`)
  }
}