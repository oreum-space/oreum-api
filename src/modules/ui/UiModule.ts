import CoreModule from '@/core/module/CoreModule'
import CoreHttp from '@/core/http/CoreHttp'
import CoreEnv from '@/core/CoreEnv'
import CoreWebSocket from '@/core/web-socket/CoreWebSocket'
import { WebSocket } from 'ws'
import { IncomingMessage } from 'node:http'

export default class UiModule extends CoreModule {
  constructor () {
    super('ui')
  }

  http (http: CoreHttp) {
    super.http(http)

    const accountRoute = http.subdomain(this.name)

    if (CoreEnv.UI_PROXY) {
      accountRoute.get(void 0, async (request, response) => {
        await response.proxy(request, CoreEnv.UI_PROXY, { ca: await CoreEnv.UI_PROXY_CA })
      })
    }
  }

  webSocket (webSocket: CoreWebSocket) {
    super.webSocket(webSocket)

    webSocket.handler(async (socket: WebSocket, request: IncomingMessage) => {
      if (!request.headers.host?.startsWith(this.name)) return
      await webSocket.proxy(socket, request, CoreEnv.UI_WS_PROXY, await CoreEnv.UI_PROXY_CA)
    })
  }
}