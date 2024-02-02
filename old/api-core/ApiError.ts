export default class ApiError extends Error {
  type = 'ApiError'
  error: string
  status: number

  constructor (message: string = 'unknown', status = 500) {
    super(message)
    this.error = message
    this.status = status
  }

  get message () {
    return super.message
  }
}