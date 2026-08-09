import HttpError from '../utils/HttpError.js'

function notFound(request, response) {
  void request
  response.status(404).json({
    success: false,
    message: 'API route not found.',
  })
}

function errorHandler(error, request, response, next) {
  void request
  if (response.headersSent) {
    next(error)
    return
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    response.status(400).json({
      success: false,
      message: 'Request body must contain valid JSON.',
    })
    return
  }

  const status = error instanceof HttpError ? error.status : 500
  const message =
    error instanceof HttpError
      ? error.message
      : 'The TeleSim server could not complete this request.'

  if (status >= 500) {
    console.error('TeleSim API request failed.', {
      name: error.name,
      code: error.code ?? null,
    })
  }

  response.status(status).json({
    success: false,
    message,
    ...(error instanceof HttpError && error.code ? { code: error.code } : {}),
  })
}

export { errorHandler, notFound }
