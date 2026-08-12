import bcrypt from 'bcryptjs'

const PASSWORD_HASH_ROUNDS = 12

function hashPassword(password) {
  return bcrypt.hash(password, PASSWORD_HASH_ROUNDS)
}

function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

export { hashPassword, PASSWORD_HASH_ROUNDS, verifyPassword }
