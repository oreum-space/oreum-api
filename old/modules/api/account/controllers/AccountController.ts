import ApiStream from '../../../../api-core/ApiStream'
import AccountService from '../services/AccountService'
import { AccountCreateTransfer } from '../transfer/AccountTransfer'

export default class AccountController {

  static async create (apiStream: ApiStream) {
    const { username, password, auth } = new AccountCreateTransfer(await apiStream.data.json<AccountCreateTransfer>(true))
    const accountData = await AccountService.create(username, password, auth, apiStream.headers['user-agent'] ?? 'unknown')

    await apiStream.json(accountData, {
      'set-cookie': `refresh-token=${ accountData.refresh }; Domain=${ apiStream.authority.domainName }; Max-Age=${ 30 * 24 * 60 * 60_000 } ; HttpOnly`
    })
  }

  static async login (apiStream: ApiStream) {
    const { username, password } = new AccountCreateTranser()
  }

  static async logout (apiStream: ApiStream) {
  }

  static async refresh (apiStream: ApiStream) {
  }

  static async activate (apiStream: ApiStream) {
    const splitPath = apiStream.path.split('/')
    const id = splitPath.at(-2)!
    const confirmation = splitPath.at(-1)!

    await AccountService.activate(id, confirmation)

    await apiStream.json({ success: true })
  }

  static async accounts (apiStream: ApiStream) {
  }
}