import ApiLogger from './ApiLogger'
import ApiRoute from './ApiRoute'
import ApiStream from './ApiStream'

export default class ApiModule {
  public readonly subdomain?: string
  private readonly routes: Array<ApiRoute>

  constructor (subdomain?: string) {
    if (subdomain) this.subdomain = subdomain

    this.routes = []
  }

  public route (path?: ApiRoute['path']) {
    const route = new ApiRoute(path)

    this.routes.push(route)

    return route
  }

  async handleApiStream (apiStream: ApiStream) {
    for (const route of this.routes) {
      if (apiStream.closed) return
      if (route.match(apiStream.path)) {
        await route.handlers[apiStream.method]?.(apiStream)
      }
    }
  }

  async create () {
    ApiLogger.debug(`${ this.subdomain } ${ process.env.DOMAIN_NAME ?? 'unknown.local' } module created!`)
  }

  async mount () {
    ApiLogger.debug(`${ this.subdomain } ${ process.env.DOMAIN_NAME ?? 'unknown.local' } module mounted!`)
  }
}