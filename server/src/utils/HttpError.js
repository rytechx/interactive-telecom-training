export default class HttpError extends Error {
  constructor(status, message, code = null, data = null) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.data = data
  }
}
