import HttpError from './HttpError.js'
import {
  getEmailValidationError,
  getPasswordValidationError,
  normalizeText,
} from './validation.js'

const ACCOUNT_ROLES = Object.freeze(['student', 'instructor', 'admin'])
const STAFF_ROLES = Object.freeze(['instructor', 'admin'])
const ACCOUNT_STATUSES = Object.freeze(['active', 'inactive'])
const PAGE_LIMITS = Object.freeze([20, 50])

function normalizeOptionalValue(value) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return normalized && normalized !== 'all' ? normalized : null
}

function parsePage(value) {
  if (value === undefined) return 1
  const page = Number.parseInt(value, 10)

  if (!Number.isInteger(page) || page < 1 || String(page) !== String(value)) {
    throw new HttpError(400, 'Page must be a positive integer.', 'INVALID_PAGE')
  }

  return page
}

function parseLimit(value) {
  if (value === undefined) return 20
  const limit = Number.parseInt(value, 10)

  if (!PAGE_LIMITS.includes(limit) || String(limit) !== String(value)) {
    throw new HttpError(400, 'Limit must be 20 or 50.', 'INVALID_LIMIT')
  }

  return limit
}

function parseAdminUserListQuery(query = {}) {
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const role = normalizeOptionalValue(query.role)
  const status = normalizeOptionalValue(query.status)

  if (search.length > 100) {
    throw new HttpError(
      400,
      'Search must be 100 characters or fewer.',
      'INVALID_SEARCH',
    )
  }

  if (role && !ACCOUNT_ROLES.includes(role)) {
    throw new HttpError(400, 'Account role filter is invalid.', 'INVALID_ROLE')
  }

  if (status && !ACCOUNT_STATUSES.includes(status)) {
    throw new HttpError(
      400,
      'Account status filter is invalid.',
      'INVALID_ACCOUNT_STATUS',
    )
  }

  return {
    search,
    role,
    status,
    page: parsePage(query.page),
    limit: parseLimit(query.limit),
  }
}

function parseRoleUpdate(input = {}) {
  const role = typeof input.role === 'string' ? input.role.trim().toLowerCase() : ''

  if (!ACCOUNT_ROLES.includes(role)) {
    throw new HttpError(
      400,
      'Role must be student, instructor, or admin.',
      'INVALID_ROLE',
    )
  }

  return role
}

function parseStatusUpdate(input = {}) {
  if (typeof input.isActive !== 'boolean') {
    throw new HttpError(
      400,
      'isActive must be true or false.',
      'INVALID_ACCOUNT_STATUS',
    )
  }

  return input.isActive
}

function validateStaffAccountInput(input = {}) {
  const values = {
    firstName: normalizeText(input.firstName),
    lastName: normalizeText(input.lastName),
    email: normalizeText(input.email).toLowerCase(),
    password: typeof input.password === 'string' ? input.password : '',
    role: normalizeText(input.role).toLowerCase(),
  }
  const errors = {}

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
  const passwordError = getPasswordValidationError(values.password, 12)

  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError
  if (!STAFF_ROLES.includes(values.role)) {
    errors.role = 'Role must be instructor or admin.'
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export {
  ACCOUNT_ROLES,
  ACCOUNT_STATUSES,
  STAFF_ROLES,
  parseAdminUserListQuery,
  parseRoleUpdate,
  parseStatusUpdate,
  validateStaffAccountInput,
}
