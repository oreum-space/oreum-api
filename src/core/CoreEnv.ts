import 'dotenv/config'
import { readFile } from 'fs/promises'

const env = process.env

function getEnv (key: string) {
  const value = env[key]

  if (!value) throw Error(`.env ${ key } required!`)

  return value
}

export default class CoreEnv {
  // Core
  static CORE_HTTP_PORT = getEnv('CORE_HTTP_PORT')
  static CORE_HTTP_CERT = getEnv('CORE_HTTP_CERT')
  static CORE_HTTP_KEY = getEnv('CORE_HTTP_KEY')

  // Account
  static ACCOUNT_PROXY = getEnv('ACCOUNT_PROXY')
  static ACCOUNT_WS_PROXY = getEnv('ACCOUNT_WS_PROXY')
  static #ACCOUNT_PROXY_CA = getEnv('ACCOUNT_PROXY_CA')
  static ACCOUNT_PROXY_CA= readFile(this.#ACCOUNT_PROXY_CA)

  // UI
  static UI_PROXY = getEnv('UI_PROXY')
  static UI_WS_PROXY = getEnv('UI_WS_PROXY')
  static #UI_PROXY_CA = getEnv('UI_PROXY_CA')
  static UI_PROXY_CA= readFile(this.#UI_PROXY_CA)


  // Launcher
  static LAUNCHER_PROXY= getEnv('LAUNCHER_PROXY')
}
