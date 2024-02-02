import 'dotenv/config'

const env = process.env

function getEnv (key: string) {
  const value = env[key]

  if (!value) throw Error(`.env ${ key } required!`)

  return value
}

export default class CoreEnv {
  static CORE_HTTP_PORT = getEnv('CORE_HTTP_PORT')

  static CORE_HTTP_CERT = getEnv('CORE_HTTP_CERT')
  static CORE_HTTP_KEY = getEnv('CORE_HTTP_KEY')
}
