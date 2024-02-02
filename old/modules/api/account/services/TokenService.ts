import {
  JwtPayload,
  sign
} from 'jsonwebtoken'
import { Types } from 'mongoose'
import TokenModel from '../models/tokenModel'


export default class TokenService {
  static createTokens (payload: JwtPayload) {
    if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET')
    if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET')
    const access = sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' })
    const refresh = sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' })

    return {
      access,
      refresh
    }
  }

  static async save (account: Types.ObjectId, agent: string, refresh: string) {
    const tokenData = await TokenModel.findOne({ account, agent })
    if (tokenData) {
      tokenData.refresh = refresh
      return await tokenData.save()
    }
    return await TokenModel.create({ account, agent, refresh })
  }
}