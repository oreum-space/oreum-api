import {
  Document,
  model,
  Schema,
  Types
} from 'mongoose'
import Timestamp from './types/Timestamp'

const required = true, unique = true

export interface Account extends Timestamp {
  username: string,
  password: string,
  type: 'email'
  email?: string,
  confirmation?: string
}

const AccountSchema = new Schema<Account>({
  username: { type: String, required, unique },
  password: { type: String, required },
  type: { type: String },
  email: { type: String, unique },
  confirmation: { type: String }
}, { timestamps: true })

const AccountModel = model('Account', AccountSchema)

export type AccountDocument = Document<unknown, {}, Account> & Account & { _id: Types.ObjectId }

export default AccountModel
