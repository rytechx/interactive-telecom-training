import bcrypt from 'bcryptjs'
import { databasePool } from '../src/config/database.js'

const PASSWORD_HASH_ROUNDS = 12
const ALLOWED_STAFF_ROLES = new Set(['instructor', 'admin'])

function requireValue(name) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function readStaffInput() {
  const role = requireValue('STAFF_ROLE').toLowerCase()
  const identifier = requireValue('STAFF_IDENTIFIER')
  const firstName = requireValue('STAFF_FIRST_NAME')
  const lastName = requireValue('STAFF_LAST_NAME')
  const email = requireValue('STAFF_EMAIL').toLowerCase()
  const password = requireValue('STAFF_PASSWORD')

  if (!ALLOWED_STAFF_ROLES.has(role)) {
    throw new Error('STAFF_ROLE must be instructor or admin.')
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/.test(identifier)) {
    throw new Error(
      'STAFF_IDENTIFIER must be 3-32 characters using letters, numbers, dots, underscores, or hyphens.',
    )
  }

  if (firstName.length > 80 || lastName.length > 80) {
    throw new Error('Staff first and last names must be 80 characters or fewer.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('STAFF_EMAIL must be a valid email address.')
  }

  if (password.length < 12 || password.length > 128) {
    throw new Error('STAFF_PASSWORD must be between 12 and 128 characters.')
  }

  return { role, identifier, firstName, lastName, email, password }
}

async function createStaffUser() {
  const input = readStaffInput()
  const [existingUsers] = await databasePool.execute(
    `SELECT id
     FROM users
     WHERE student_number = ? OR email = ?
     LIMIT 1`,
    [input.identifier, input.email],
  )

  if (existingUsers.length) {
    throw new Error(
      'A user with that staff identifier or email already exists. No account was changed.',
    )
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    PASSWORD_HASH_ROUNDS,
  )
  const [result] = await databasePool.execute(
    `INSERT INTO users
      (student_number, first_name, last_name, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.identifier,
      input.firstName,
      input.lastName,
      input.email,
      passwordHash,
      input.role,
    ],
  )

  console.log(
    `Created ${input.role} account ${input.identifier} with user ID ${result.insertId}.`,
  )
}

try {
  await createStaffUser()
} catch (error) {
  console.error(`Unable to create staff account: ${error.message}`)
  process.exitCode = 1
} finally {
  await databasePool.end()
}
