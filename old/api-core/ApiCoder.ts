export default class ApiCoder {
  private static decoder = new TextDecoder()
  private static encoder = new TextEncoder()

  static encode (input?: string) {
    return this.encoder.encode(input)
  }

  static decode (input?: AllowSharedBufferSource) {
    return this.decoder.decode(input)
  }
}