import * as mongoose from 'mongoose'
import ApiLogger from './ApiLogger'

export default class ApiDataBase {
  async mount () {
    if (!process.env.DB_URL) throw new Error('DB_URL not specified!')
    if (!process.env.DB_NAME) throw new Error('DB_NAME not specified!')
    await mongoose.connect(process.env.DB_URL, { dbName: process.env.DB_NAME })
    ApiLogger.log('Connected to DB!')
  }
}