import ApiStream from './ApiStream'

async function streamHandler (
  stream: ApiStream, ...handlers: Array<(stream: ApiStream) => Promise<void>>): Promise<void> {
  for (const handler of handlers) {
    if (stream.closed) return
    await handler(stream)
  }
}

export default class ApiRoute {
  public readonly path?: string | ((path: string) => boolean) | RegExp
  public handlers: Record<string, ((stream: ApiStream) => Promise<void>) | void>

  constructor (path?: ApiRoute['path']) {
    this.path = path
    this.handlers = {
      get: void 0,
      post: void 0,
      patch: void 0,
      delete: void 0
    }
  }

  match (path?: string): boolean {
    if (this.path === '*') return true
    if (typeof this.path === 'string' || path === void 0) return this.path === path
    if (typeof this.path === 'function') return this.path(path)
    if (this.path instanceof RegExp) return this.path.test(path)
    return false
  }

  get (...handlers: Array<(stream: ApiStream) => Promise<void>>) {
    this.handlers.get = async (stream: ApiStream) => await streamHandler(stream, ...handlers)
  }

  post (...handlers: Array<(stream: ApiStream) => Promise<void>>) {
    this.handlers.post = async (stream: ApiStream) => await streamHandler(stream, ...handlers)
  }

  patch (...handlers: Array<(stream: ApiStream) => Promise<void>>) {
    this.handlers.patch = async (stream: ApiStream) => await streamHandler(stream, ...handlers)
  }

  delete (...handlers: Array<(stream: ApiStream) => Promise<void>>) {
    this.handlers.delete = async (stream: ApiStream) => await streamHandler(stream, ...handlers)
  }
}