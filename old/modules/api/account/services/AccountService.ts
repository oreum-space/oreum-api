import { hash } from 'bcrypt'
import { v4 } from 'uuid'
import ApiError from '../../../../api-core/ApiError'
import AccountModel from '../models/AccountModel'
import {
  AccountCreateAuthTransfer,
  AccountTransfer
} from '../transfer/AccountTransfer'
import MailService from './MailService'
import TokenService from './TokenService'

export default class AccountService {
  static async create (username: string, rawPassword: string, auth: AccountCreateAuthTransfer, agent: string) {
    const candidate = await AccountModel.findOne({ username })
    if (candidate) throw new ApiError('account-with-same-username-already-exists')

    const password = await hash(rawPassword, 3)

    if ('email' in auth) {
      const candidate = await AccountModel.findOne({ email: auth.email })

      if (candidate) {
        throw new ApiError('account-with-same-email-already-exists')
      }

      const confirmation = v4()

      const account = await AccountModel.create({
        username,
        password,
        type: 'email',
        email: auth.email,
        confirmation
      })

      try {
        await MailService.sendActivation(auth.email, account._id, confirmation)
      } catch (error) {
        console.error(error)
        throw new ApiError('failed-to-send-email')
      }

      const accountTransfer = new AccountTransfer(account)
      const tokens = TokenService.createTokens({ ...accountTransfer })

      await TokenService.save(accountTransfer.id, agent, tokens.refresh)

      return {
        ...tokens,
        account: accountTransfer
      }
    }
    throw new ApiError('auth-not-found', 400)
  }

  static async activate (id: string, confirmation: string) {
    const account = await AccountModel.findOne({ _id: id })

    if (!account) throw new ApiError('account-not-found')
    if (!account.confirmation) throw new ApiError('account-already-activated')
    if (account.confirmation !== confirmation) throw new ApiError('incorrect-link')

    account.confirmation = void 0
    await account.save()
  }
}