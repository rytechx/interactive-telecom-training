const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STUDENT_NUMBER_PATTERN = /^[A-Za-z0-9-]+$/

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
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

  if (!values.email) {
    errors.email = 'Email is required.'
  } else if (values.email.length > 254 || !EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else if (Buffer.byteLength(values.password, 'utf8') > 72) {
    errors.password = 'Password must be 72 bytes or fewer.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
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

export { validateLoginInput, validateRegistrationInput }
