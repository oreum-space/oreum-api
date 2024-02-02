import ApiHttp from './ApiHttp'
import ApiDataBase from './ApiDataBase'
import ApiLogger from './ApiLogger'
import ApiModule from './ApiModule'

export default class ApiCore {
  public readonly modules: ReadonlyArray<ApiModule>
  private readonly http: ApiHttp
  public readonly db: ApiDataBase

  constructor (...modules: Array<ApiModule>) {
    console.clear()
    this.http = new ApiHttp(this)
    this.db = new ApiDataBase()
    this.modules = [...modules]
    this.create().catch((error) => {
      ApiLogger.error(error?.message ?? 'unknown')
      process.exit(-1)
    })
  }

  async create() {
    for (const module of this.modules) {
      await module.create()
    }
    await this.mount()
  }

  async mount() {
    await this.db.mount()
    this.http.mount()
    for (const module of this.modules) {
      await module.mount()
    }
  }
}