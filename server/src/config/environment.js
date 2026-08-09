import dotenv from 'dotenv'

dotenv.config({ quiet: true })

function getRequiredEnvironmentValue(name, { allowEmpty = false } = {}) {
  const value = process.env[name]

  if (value === undefined || (!allowEmpty && !value.trim())) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return allowEmpty ? value : value.trim()
}

function getPositiveInteger(name, fallback) {
  const value = process.env[name]

  if (value === undefined || value === '') {
    return fallback
  }

  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} must be a positive integer.`)
  }

  return parsedValue
}

function parseDurationToMilliseconds(value) {
  const match = /^(\d+)(s|m|h|d)$/.exec(value)

  if (!match) {
    throw new Error('JWT_EXPIRES_IN must use a value such as 30m, 8h, or 7d.')
  }

  const amount = Number.parseInt(match[1], 10)
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return amount * multipliers[match[2]]
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || '8h'

const environment = Object.freeze({
  nodeEnvironment: process.env.NODE_ENV?.trim() || 'development',
  port: getPositiveInteger('PORT', 3001),
  database: Object.freeze({
    host: getRequiredEnvironmentValue('DB_HOST'),
    port: getPositiveInteger('DB_PORT', 3306),
    user: getRequiredEnvironmentValue('DB_USER'),
    password: getRequiredEnvironmentValue('DB_PASSWORD', { allowEmpty: true }),
    name: getRequiredEnvironmentValue('DB_NAME'),
  }),
  jwtSecret: getRequiredEnvironmentValue('JWT_SECRET'),
  jwtExpiresIn,
  sessionMaxAge: parseDurationToMilliseconds(jwtExpiresIn),
  sessionCookieName: 'telesim_session',
  clientOrigin: getRequiredEnvironmentValue('CLIENT_ORIGIN'),
})

export default environment
