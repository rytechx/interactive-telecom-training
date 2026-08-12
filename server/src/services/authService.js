import jwt from 'jsonwebtoken'
import { databasePool } from '../config/database.js'
import environment from '../config/environment.js'
import HttpError from '../utils/HttpError.js'
import { hashPassword, verifyPassword } from '../utils/passwordSecurity.js'

const INVALID_CREDENTIALS_MESSAGE =
  'Invalid email/student number or password.'
const STAFF_ROLES = Object.freeze(['instructor', 'admin'])

function mapSafeUser(user) {
  return {
    id: user.id,
    studentNumber: user.student_number,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    isActive: Boolean(user.is_active),
  }
}

async function registerStudent({
  studentNumber,
  firstName,
  lastName,
  email,
  password,
}) {
  const [existingUsers] = await databasePool.execute(
    `SELECT student_number, email
     FROM users
     WHERE student_number = ? OR email = ?
     LIMIT 2`,
    [studentNumber, email],
  )

  const emailExists = existingUsers.some((user) => user.email === email)
  const studentNumberExists = existingUsers.some(
    (user) => user.student_number === studentNumber,
  )

  if (emailExists) {
    throw new HttpError(
      409,
      'An account with that email already exists.',
      'EMAIL_EXISTS',
    )
  }

  if (studentNumberExists) {
    throw new HttpError(
      409,
      'Student number is already registered.',
      'STUDENT_NUMBER_EXISTS',
    )
  }

  const passwordHash = await hashPassword(password)

  try {
    const [result] = await databasePool.execute(
      `INSERT INTO users
        (student_number, first_name, last_name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?, 'student')`,
      [studentNumber, firstName, lastName, email, passwordHash],
    )

    return {
      id: result.insertId,
      studentNumber,
      firstName,
      lastName,
      email,
      role: 'student',
      isActive: true,
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateMessage = error.message.includes('uq_users_email')
        ? 'An account with that email already exists.'
        : 'Student number is already registered.'

      throw new HttpError(409, duplicateMessage, 'DUPLICATE_USER')
    }

    throw error
  }
}

async function authenticateUser(
  { identifier, password },
  {
    allowedRoles,
    invalidCredentialsMessage = INVALID_CREDENTIALS_MESSAGE,
    roleErrorMessage,
    roleErrorCode,
  } = {},
) {
  const [users] = await databasePool.execute(
    `SELECT id, student_number, first_name, last_name, email,
            password_hash, role, is_active
     FROM users
     WHERE email = ? OR student_number = ?
     LIMIT 1`,
    [identifier, identifier],
  )
  const user = users[0]

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, invalidCredentialsMessage, 'INVALID_CREDENTIALS')
  }

  if (!user.is_active) {
    throw new HttpError(403, 'This account is inactive.', 'ACCOUNT_INACTIVE')
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new HttpError(403, roleErrorMessage, roleErrorCode)
  }

  return mapSafeUser(user)
}

function authenticateStudent(credentials) {
  return authenticateUser(credentials, {
    allowedRoles: ['student'],
    roleErrorMessage: 'Use the Staff Portal to sign in to this account.',
    roleErrorCode: 'STUDENT_ACCESS_REQUIRED',
  })
}

function authenticateStaff(credentials) {
  return authenticateUser(credentials, {
    allowedRoles: STAFF_ROLES,
    invalidCredentialsMessage: 'Invalid staff email or password.',
    roleErrorMessage: 'This account does not have staff access.',
    roleErrorCode: 'STAFF_ACCESS_REQUIRED',
  })
}

async function getUserById(userId) {
  const [users] = await databasePool.execute(
    `SELECT id, student_number, first_name, last_name, email, role, is_active
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId],
  )

  return users[0] ? mapSafeUser(users[0]) : null
}

function createSessionToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    environment.jwtSecret,
    { expiresIn: environment.jwtExpiresIn },
  )
}

function verifySessionToken(token) {
  return jwt.verify(token, environment.jwtSecret)
}

export {
  authenticateStaff,
  authenticateStudent,
  authenticateUser,
  createSessionToken,
  getUserById,
  registerStudent,
  verifySessionToken,
}
