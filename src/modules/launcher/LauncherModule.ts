import CoreModule from '@/core/module/CoreModule'
import CoreHttp from '@/core/http/CoreHttp'
import CoreEnv from '@/core/CoreEnv'
import CoreWebSocket from '@/core/web-socket/CoreWebSocket'
import { WebSocket } from 'ws'
import { IncomingMessage } from 'node:http'

export default class LauncherModule extends CoreModule {
  constructor () {
    super('launch')
  }

  http (http: CoreHttp) {
    super.http(http)

    const launcherRoute = http.subdomain(this.name)

    launcherRoute.any(async (request, response) => {
      console.log(request.headers)
    })

    if (CoreEnv.LAUNCHER_PROXY) {
      launcherRoute.get(void 0, async (request, response) => {
        const proxyResponse = await fetch(CoreEnv.LAUNCHER_PROXY + request.path)
        response.respond({ ':status': proxyResponse.status })
        const arrayBuffer = await proxyResponse.arrayBuffer()
        await response.end(new Uint8Array(arrayBuffer))
      })
    }
  }

  webSocket (webSocket: CoreWebSocket) {
    super.webSocket(webSocket)

    webSocket.handler(async (socket: WebSocket, request: IncomingMessage) => {
      if (!request.headers.host?.startsWith(this.name)) return
      console.log(request.headers)
      // await webSocket.proxy(socket, request, CoreEnv.UI_WS_PROXY)
    })
  }
}