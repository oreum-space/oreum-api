import CoreHttp from '@/core/http/CoreHttp'
import CoreSocket from '@/core/socket/CoreSocket'

export default class CoreModule {
  name: string

  constructor (name: string) {
    this.name = name
  }

  public http (http: CoreHttp) {
  }

  public socket (socket: CoreSocket) {
  }
}