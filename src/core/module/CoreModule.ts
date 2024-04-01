import CoreHttp from '@/core/http/CoreHttp'
import CoreWebSocket from '@/core/web-socket/CoreWebSocket'

export default class CoreModule {
  name: string

  constructor (name: string) {
    this.name = name
  }

  public http (http: CoreHttp) {
  }

  public webSocket (webSocket: CoreWebSocket) {
  }
}