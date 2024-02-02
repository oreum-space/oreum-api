import CoreMail from '@/core/CoreMail'
import CoreHttp from '@/core/http/CoreHttp'
import CoreModule from '@/core/module/CoreModule'
import CoreSocket from '@/core/socket/CoreSocket'

export default class Core {
  public readonly http: CoreHttp
  public readonly mail: CoreMail
  public readonly socket: CoreSocket
  public readonly modules: Record<string, CoreModule>

  constructor (...modules: Array<CoreModule>) {
    console.clear()
    this.http = new CoreHttp()
    this.mail = new CoreMail()
    this.socket = new CoreSocket()
    this.modules = {}

    if (modules) {
      for (const module of modules) {
        this.modules[module.name] = module

        module.http(this.http)
        module.socket(this.socket)
      }
    }
  }
}