import { Server, WebSocket, WebSocketServer } from 'ws'
import { Http2SecureServer } from 'node:http2'
import { createServer, IncomingMessage } from 'node:http'
import CoreDecoder from '@/core/CoreDecoder'

export default class CoreWebSocket {
  private readonly handlers: Array<(socket: WebSocket, request: IncomingMessage) => Promise<void>>

  constructor (server: Http2SecureServer) {
    const wss = new WebSocketServer({
      server: server as unknown as ReturnType<typeof createServer>
    })

    this.handlers = []

    wss.on('connection', async (socket, request) => {
      try {
        await this.connection(socket, request)
      } catch (error) {
        console.error(error)
      }
    })
  }

  private async connection (socket: WebSocket, request: IncomingMessage) {
    if (socket.readyState >= 2) return
    for (const handler of this.handlers) {
      await handler(socket,request)
      if (socket.readyState >= 2) return
    }
    socket.close(4404)
  }

  handler (handler: (socket: WebSocket, request: IncomingMessage) => Promise<void>) {
    this.handlers.push(handler)
  }

  public proxy (socket: WebSocket, request: IncomingMessage, address: string, ca?: Buffer) {
    return new Promise<void>((resolve) => {
      new WebSocket(address, 'vite-hmr', { ca })
        .on('error', (error) => {
          console.error(error)
          socket.close(4503)
          resolve()
        })
        .on('ping', function (buffer) { socket.ping(buffer) })
        .on('pong', function (buffer) { socket.pong(buffer) })
        .once('open', function () {
          socket.on('message', (data, isBinary) => this.send(isBinary ? data : CoreDecoder.decode(<Uint8Array>data)))
          socket.on('close', (code, reason) => {
            this.close(code, reason)
          })
        })
        .on('message', (data, isBinary) => {
          socket.send(isBinary ? data : CoreDecoder.decode(<Uint8Array>data))
        })
        .on('close', () => {
          socket.close()
          resolve()
        })
    })
  }
}