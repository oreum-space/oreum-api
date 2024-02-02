import ApiModule from '../../api-core/ApiModule'
import account from './account'

export default class AccountModule extends ApiModule {
  constructor () {
    super('api')
  }

  async create () {
    account(this)
    await super.create()
  }
}