import CoreHttp from '@/core/http/CoreHttp'
import CoreModule from '@/core/module/CoreModule'

export default class ApiModule extends CoreModule {
  constructor () {
    super('api')
  }

  http (http: CoreHttp) {
    super.http(http)

    const apiRoute = http.subdomain('api')
    apiRoute.get('/', async (request, response) => {
      await response.json({
        subdomain: request.subdomain,
        domain: request.domain,
        path: request.path,
        method: request.method,
        params: request.params,
        json: await request.json()
      })
    })
  }
}