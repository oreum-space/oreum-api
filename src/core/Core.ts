import CoreMail from '@/core/CoreMail'
import CoreHttp from '@/core/http/CoreHttp'
import CoreModule from '@/core/module/CoreModule'
import CoreWebSocket from '@/core/web-socket/CoreWebSocket'

export default class Core {
  public readonly http: CoreHttp
  public readonly mail: CoreMail
  public readonly webSocket: CoreWebSocket
  public readonly modules: Record<string, CoreModule>
  constructor (...modules: Array<CoreModule>) {
    this.http = new CoreHttp()
    this.webSocket = new CoreWebSocket(this.http.server)
    this.mail = new CoreMail()
    this.modules = {}

    if (modules) {
      for (const module of modules) {
        this.modules[module.name] = module

        module.http(this.http)
        module.webSocket(this.webSocket)
      }
    }
  }
}