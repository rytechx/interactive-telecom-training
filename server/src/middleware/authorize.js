import HttpError from '../utils/HttpError.js'

export default function authorize(...allowedRoles) {
  const permittedRoles = new Set(allowedRoles)

  return (request, response, next) => {
    void response
    if (!request.user) {
      next(new HttpError(401, 'Authentication required.', 'AUTH_REQUIRED'))
      return
    }

    if (!permittedRoles.has(request.user.role)) {
      next(
        new HttpError(
          403,
          'You do not have permission to access this resource.',
          'FORBIDDEN',
        ),
      )
      return
    }

    next()
  }
}
