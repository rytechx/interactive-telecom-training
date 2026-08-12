import environment from '../config/environment.js'
import {
  authenticateStaff,
  authenticateStudent,
  createSessionToken,
  registerStudent,
} from '../services/authService.js'
import {
  validateLoginInput,
  validateRegistrationInput,
  validateStaffLoginInput,
} from '../utils/validation.js'

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: environment.nodeEnvironment === 'production',
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

export { currentUser, login, logout, register, staffLogin }
