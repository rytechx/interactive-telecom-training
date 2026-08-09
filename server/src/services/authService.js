import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { databasePool } from '../config/database.js'
import environment from '../config/environment.js'
import HttpError from '../utils/HttpError.js'

const PASSWORD_HASH_ROUNDS = 12
const INVALID_CREDENTIALS_MESSAGE =
  'Invalid email/student number or password.'

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

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS)

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

async function authenticateUser({ identifier, password }) {
  const [users] = await databasePool.execute(
    `SELECT id, student_number, first_name, last_name, email,
            password_hash, role, is_active
     FROM users
     WHERE email = ? OR student_number = ?
     LIMIT 1`,
    [identifier, identifier],
  )
  const user = users[0]

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, INVALID_CREDENTIALS_MESSAGE, 'INVALID_CREDENTIALS')
  }

  if (!user.is_active) {
    throw new HttpError(403, 'This account is inactive.', 'ACCOUNT_INACTIVE')
  }

  return mapSafeUser(user)
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
  authenticateUser,
  createSessionToken,
  getUserById,
  registerStudent,
  verifySessionToken,
}
