import {
  model,
  Schema
} from 'mongoose'

const required = true

export interface Token {
  account: Schema.Types.ObjectId,
  refresh: string,
  agent: string
}

const TokenSchema = new Schema<Token>({
  account: { type: Schema.Types.ObjectId, ref: 'Account' },
  refresh: { type: String, required },
  agent: { type: String, required }
}, { timestamps: true })

export default model('Token', TokenSchema)