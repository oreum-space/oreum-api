import { Types } from 'mongoose'
import ApiError from '../../../../api-core/ApiError'
import { DeepPartial } from '../../../../types/DeepPartial'
import { AccountDocument } from '../models/AccountModel'

export class AccountCreateAuthTransfer {
  email: string

  constructor ({ email }: DeepPartial<AccountCreateAuthTransfer>) {
    if (!email) throw new ApiError('auth-email-required', 400)
    this.email = email
  }
}

export class AccountCreateTransfer {
  username: string
  password: string
  auth: AccountCreateAuthTransfer

  constructor ({ username, password, auth }: DeepPartial<AccountCreateTransfer>) {
    if (!username) throw new ApiError('username-required', 400)
    this.username = username
    if (!password) throw new ApiError('password-required', 400)
    this.password = password
    if (!auth) throw new ApiError('auth-required', 400)
    this.auth = new AccountCreateAuthTransfer(auth)
  }
}

export class AccountTransfer {
  id: Types.ObjectId
  username: string

  constructor (model: AccountDocument) {
    this.id = model._id
    this.username = model.username
  }
}