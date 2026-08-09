import environment from '../config/environment.js'
import {
  getUserById,
  verifySessionToken,
} from '../services/authService.js'
import HttpError from '../utils/HttpError.js'

export default async function authenticate(request, response, next) {
  void response
  const token = request.cookies?.[environment.sessionCookieName]

  if (!token) {
    next(new HttpError(401, 'Authentication required.', 'AUTH_REQUIRED'))
    return
  }

  try {
    const payload = verifySessionToken(token)
    const userId = Number(payload.userId)

    if (!Number.isInteger(userId) || userId <= 0) {
      next(new HttpError(401, 'Authentication required.', 'INVALID_SESSION'))
      return
    }

    const user = await getUserById(userId)

    if (!user) {
      next(new HttpError(401, 'Authentication required.', 'INVALID_SESSION'))
      return
    }

    if (!user.isActive) {
      next(new HttpError(403, 'This account is inactive.', 'ACCOUNT_INACTIVE'))
      return
    }

    request.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new HttpError(401, 'Authentication required.', 'INVALID_SESSION'))
      return
    }

    next(error)
  }
}
