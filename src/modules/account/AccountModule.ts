import CoreModule from '@/core/module/CoreModule'
import CoreHttp from '@/core/http/CoreHttp'
import CoreEnv from '@/core/CoreEnv'
import { connect } from 'node:http2'
import CoreDecoder from '@/core/CoreDecoder'
import CoreEncoder from '@/core/CoreEncoder'
import { readFile } from 'fs/promises'
import CoreWebSocket from '@/core/web-socket/CoreWebSocket'
import { WebSocket } from 'ws'
import { IncomingMessage } from 'node:http'

export default class AccountModule extends CoreModule {
  constructor () {
    super('account')
  }

  http (http: CoreHttp) {
    super.http(http)

    const accountRoute = http.subdomain(this.name)

    if (CoreEnv.ACCOUNT_PROXY && CoreEnv.ACCOUNT_PROXY_CA) {
      accountRoute.get(void 0, async (request, response) => {
        await response.proxy(request, CoreEnv.ACCOUNT_PROXY, { ca: await CoreEnv.ACCOUNT_PROXY_CA })
      })
    }
  }

  webSocket (webSocket: CoreWebSocket) {
    super.webSocket(webSocket)

    webSocket.handler(async (socket: WebSocket, request: IncomingMessage) => {
      if (!request.headers.host?.startsWith(this.name)) return
      await webSocket.proxy(socket, request, CoreEnv.ACCOUNT_WS_PROXY, await CoreEnv.ACCOUNT_PROXY_CA)
    })
  }
}