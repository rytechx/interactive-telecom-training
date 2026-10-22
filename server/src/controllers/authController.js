import environment from '../config/environment.js'
import {
  authenticateStaff,
  authenticateStudent,
  createSessionToken,
  registerStudent,
} from '../services/authService.js'
import {
  FORGOT_PASSWORD_PUBLIC_MESSAGE,
  requestPasswordReset,
  resetPassword as resetAccountPassword,
} from '../services/passwordResetService.js'
import {
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegistrationInput,
  validateResetPasswordInput,
  validateStaffLoginInput,
} from '../utils/validation.js'

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: environment.cookie.sameSite,
    secure: environment.cookie.secure,
    maxAge: environment.sessionMaxAge,
    path: '/',
  }
}

async function register(request, response, next) {
  const validation = validateRegistrationInput(request.body)

  if (!validation.isValid) {
    response.status(400).json({
      success: false,
      message: 'Please correct the highlighted registration fields.',
      errors: validation.errors,
    })
    return
  }

  try {
    const user = await registerStudent(validation.values)

    response.status(201).json({
      success: true,
      message: 'Account created successfully. Please sign in.',
      data: { user },
    })
  } catch (error) {
    next(error)
  }
}

async function login(request, response, next) {
  const validation = validateLoginInput(request.body)

  if (!validation.isValid) {
    response.status(400).json({
      success: false,
      message: 'Enter your email or student number and password.',
      errors: validation.errors,
    })
    return
  }

  try {
    const user = await authenticateStudent(validation.values)
    establishSession(response, user)
  } catch (error) {
    next(error)
  }
}

async function staffLogin(request, response, next) {
  const validation = validateStaffLoginInput(request.body)

  if (!validation.isValid) {
    response.status(400).json({
      success: false,
      message: 'Enter your staff email and password.',
      errors: validation.errors,
    })
    return
  }

  try {
    const user = await authenticateStaff(validation.values)
    establishSession(response, user)
  } catch (error) {
    next(error)
  }
}

async function forgotPassword(request, response, next) {
  const validation = validateForgotPasswordInput(request.body)

  response.set('Cache-Control', 'no-store')

  if (!validation.isValid) {
    response.status(400).json({
      success: false,
      message: 'Enter a valid email address.',
      errors: validation.errors,
    })
    return
  }

  try {
    await requestPasswordReset(validation.values.email)
    response.json({
      success: true,
      message: FORGOT_PASSWORD_PUBLIC_MESSAGE,
    })
  } catch (error) {
    next(error)
  }
}

async function resetPassword(request, response, next) {
  const validation = validateResetPasswordInput(request.body)

  response.set('Cache-Control', 'no-store')

  if (!validation.isValid) {
    response.status(400).json({
      success: false,
      message: 'Please correct the password reset fields.',
      errors: validation.errors,
    })
    return
  }

  try {
    const result = await resetAccountPassword(validation.values)

    response.json({
      success: true,
      message: 'Your password has been reset successfully.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

function establishSession(response, user) {
  const token = createSessionToken(user)

  response.cookie(
    environment.sessionCookieName,
    token,
    getSessionCookieOptions(),
  )
  response.json({
    success: true,
    data: { user },
  })
}

function currentUser(request, response) {
  response.json({
    success: true,
    data: { user: request.user },
  })
}

function logout(request, response) {
  void request
  const cookieOptions = getSessionCookieOptions()

  response.clearCookie(environment.sessionCookieName, {
    httpOnly: cookieOptions.httpOnly,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
    path: cookieOptions.path,
  })
  response.json({
    success: true,
    message: 'Signed out successfully.',
  })
}

export {
  currentUser,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  staffLogin,
}
