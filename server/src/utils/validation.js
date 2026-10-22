const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STUDENT_NUMBER_PATTERN = /^[A-Za-z0-9-]+$/
const CLASS_CODE_PATTERN = /^TS-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/
const PASSWORD_RESET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getEmailValidationError(email) {
  if (!email) return 'Email is required.'
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address.'
  }
  return null
}

function getPasswordValidationError(password, minimumLength = 8) {
  if (!password) return 'Password is required.'
  if (password.length < minimumLength) {
    return `Password must be at least ${minimumLength} characters.`
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'Password must be 72 bytes or fewer.'
  }
  return null
}

function validateRegistrationInput(input = {}) {
  const values = {
    studentNumber: normalizeText(input.studentNumber),
    firstName: normalizeText(input.firstName),
    lastName: normalizeText(input.lastName),
    email: normalizeText(input.email).toLowerCase(),
    password: typeof input.password === 'string' ? input.password : '',
    confirmPassword:
      typeof input.confirmPassword === 'string' ? input.confirmPassword : '',
    classCode: normalizeText(input.classCode).toUpperCase(),
  }
  const errors = {}

  if (!values.studentNumber) {
    errors.studentNumber = 'Student number is required.'
  } else if (
    values.studentNumber.length < 4 ||
    values.studentNumber.length > 32 ||
    !STUDENT_NUMBER_PATTERN.test(values.studentNumber)
  ) {
    errors.studentNumber =
      'Student number must be 4 to 32 letters, numbers, or hyphens.'
  }

  if (!values.firstName) {
    errors.firstName = 'First name is required.'
  } else if (values.firstName.length > 80) {
    errors.firstName = 'First name must be 80 characters or fewer.'
  }

  if (!values.lastName) {
    errors.lastName = 'Last name is required.'
  } else if (values.lastName.length > 80) {
    errors.lastName = 'Last name must be 80 characters or fewer.'
  }

  const emailError = getEmailValidationError(values.email)
  const passwordError = getPasswordValidationError(values.password)

  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (values.classCode && !CLASS_CODE_PATTERN.test(values.classCode)) {
    errors.classCode = 'Enter a valid class code in the format TS-XXXXXX.'
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

function validateLoginInput(input = {}) {
  const values = {
    identifier: normalizeText(input.identifier).toLowerCase(),
    password: typeof input.password === 'string' ? input.password : '',
  }
  const errors = {}

  if (!values.identifier) {
    errors.identifier = 'Email or student number is required.'
  } else if (values.identifier.length > 254) {
    errors.identifier = 'Email or student number is too long.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

function validateStaffLoginInput(input = {}) {
  const email = normalizeText(input.email).toLowerCase()
  const values = {
    identifier: email,
    password: typeof input.password === 'string' ? input.password : '',
  }
  const errors = {}
  const emailError = getEmailValidationError(email)

  if (emailError) errors.email = emailError
  if (!values.password) errors.password = 'Password is required.'

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

function validateForgotPasswordInput(input = {}) {
  const values = {
    email: normalizeText(input.email).toLowerCase(),
  }
  const errors = {}
  const emailError = getEmailValidationError(values.email)

  if (emailError) errors.email = emailError

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

function validateResetPasswordInput(input = {}) {
  const values = {
    token: normalizeText(input.token),
    password: typeof input.password === 'string' ? input.password : '',
    confirmPassword:
      typeof input.confirmPassword === 'string' ? input.confirmPassword : '',
  }
  const errors = {}

  if (!values.token || !PASSWORD_RESET_TOKEN_PATTERN.test(values.token)) {
    errors.token = 'This password reset link is invalid or has expired.'
  }

  const passwordError = getPasswordValidationError(values.password)

  if (passwordError) errors.password = passwordError
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your new password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export {
  getEmailValidationError,
  getPasswordValidationError,
  normalizeText,
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegistrationInput,
  validateResetPasswordInput,
  validateStaffLoginInput,
}
