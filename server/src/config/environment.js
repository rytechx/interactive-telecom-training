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

function getBoolean(name, fallback) {
  const value = process.env[name]?.trim().toLowerCase()

  if (!value) {
    return fallback
  }

  if (value === 'true') return true
  if (value === 'false') return false

  throw new Error(`${name} must be true or false.`)
}

function getClientOrigin() {
  const value = getRequiredEnvironmentValue('CLIENT_ORIGIN')

  if (value === '*') {
    throw new Error('CLIENT_ORIGIN must be an explicit frontend origin.')
  }

  let parsedOrigin

  try {
    parsedOrigin = new URL(value)
  } catch {
    throw new Error('CLIENT_ORIGIN must be a valid HTTP or HTTPS origin.')
  }

  if (
    !['http:', 'https:'].includes(parsedOrigin.protocol) ||
    parsedOrigin.username ||
    parsedOrigin.password ||
    parsedOrigin.pathname !== '/' ||
    parsedOrigin.search ||
    parsedOrigin.hash
  ) {
    throw new Error('CLIENT_ORIGIN must be a valid HTTP or HTTPS origin.')
  }

  return parsedOrigin.origin
}

function getSameSitePolicy() {
  const value = process.env.COOKIE_SAME_SITE?.trim().toLowerCase() || 'lax'

  if (!['lax', 'strict', 'none'].includes(value)) {
    throw new Error('COOKIE_SAME_SITE must be lax, strict, or none.')
  }

  return value
}

function parseDurationToMilliseconds(value) {
  const match = /^(\d+)(s|m|h|d)$/.exec(value)

  if (!match) {
    throw new Error('JWT_EXPIRES_IN must use a value such as 30m, 8h, or 7d.')
  }

  const amount = Number.parseInt(match[1], 10)

  if (amount <= 0) {
    throw new Error('JWT_EXPIRES_IN must be greater than zero.')
  }

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return amount * multipliers[match[2]]
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || '8h'
const nodeEnvironment = process.env.NODE_ENV?.trim().toLowerCase() || 'development'

if (!['development', 'test', 'production'].includes(nodeEnvironment)) {
  throw new Error('NODE_ENV must be development, test, or production.')
}

const isProduction = nodeEnvironment === 'production'
const jwtSecret = getRequiredEnvironmentValue('JWT_SECRET')
const clientOrigin = getClientOrigin()
const cookieSecure = getBoolean('COOKIE_SECURE', isProduction)
const cookieSameSite = getSameSitePolicy()

if (isProduction && Buffer.byteLength(jwtSecret, 'utf8') < 32) {
  throw new Error('JWT_SECRET must be at least 32 bytes in production.')
}

if (isProduction && new URL(clientOrigin).protocol !== 'https:') {
  throw new Error('CLIENT_ORIGIN must use HTTPS in production.')
}

if (isProduction && !cookieSecure) {
  throw new Error('COOKIE_SECURE must be true in production.')
}

if (cookieSameSite === 'none' && !cookieSecure) {
  throw new Error('COOKIE_SECURE must be true when COOKIE_SAME_SITE is none.')
}

const environment = Object.freeze({
  nodeEnvironment,
  port: getPositiveInteger('PORT', 3001),
  database: Object.freeze({
    host: getRequiredEnvironmentValue('DB_HOST'),
    port: getPositiveInteger('DB_PORT', 3306),
    user: getRequiredEnvironmentValue('DB_USER'),
    password: getRequiredEnvironmentValue('DB_PASSWORD', {
      allowEmpty: !isProduction,
    }),
    name: getRequiredEnvironmentValue('DB_NAME'),
    connectTimeout: getPositiveInteger('DB_CONNECT_TIMEOUT_MS', 3000),
  }),
  jwtSecret,
  jwtExpiresIn,
  sessionMaxAge: parseDurationToMilliseconds(jwtExpiresIn),
  sessionCookieName: 'telesim_session',
  clientOrigin,
  cookie: Object.freeze({
    secure: cookieSecure,
    sameSite: cookieSameSite,
  }),
})

export default environment
