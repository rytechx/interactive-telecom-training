import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const environmentModuleUrl = new URL(
  '../src/config/environment.js',
  import.meta.url,
).href
const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const importScript = `
  import(process.env.TEST_ENVIRONMENT_MODULE)
    .then(() => process.stdout.write('configuration accepted'))
    .catch((error) => {
      process.stderr.write(error.message)
      process.exitCode = 1
    })
`

function productionEnvironment(overrides = {}) {
  return {
    ...process.env,
    TEST_ENVIRONMENT_MODULE: environmentModuleUrl,
    NODE_ENV: 'production',
    PORT: '3001',
    DB_HOST: 'database.example',
    DB_PORT: '3306',
    DB_USER: 'telesim_app',
    DB_PASSWORD: randomBytes(16).toString('hex'),
    DB_NAME: 'telesim3d',
    JWT_SECRET: 'x'.repeat(48),
    JWT_EXPIRES_IN: '8h',
    CLIENT_ORIGIN: 'https://training.example',
    COOKIE_SECURE: 'true',
    COOKIE_SAME_SITE: 'lax',
    ...overrides,
  }
}

function loadEnvironment(overrides = {}) {
  return spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', importScript],
    {
      cwd: projectRoot,
      encoding: 'utf8',
      env: productionEnvironment(overrides),
    },
  )
}

test('production environment accepts secure explicit configuration', () => {
  const result = loadEnvironment()

  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, 'configuration accepted')
})

test('password reset can remain disabled without SMTP configuration', () => {
  const result = loadEnvironment({ PASSWORD_RESET_ENABLED: 'false' })

  assert.equal(result.status, 0, result.stderr)
})

test('enabled password reset requires SMTP configuration', () => {
  const missingSmtp = loadEnvironment({ PASSWORD_RESET_ENABLED: 'true' })
  const configuredSmtp = loadEnvironment({
    PASSWORD_RESET_ENABLED: 'true',
    SMTP_HOST: 'smtp.example',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'mailer',
    SMTP_PASS: 'test-secret',
    MAIL_FROM: 'TeleSim 3D <no-reply@example.com>',
  })

  assert.notEqual(missingSmtp.status, 0)
  assert.match(missingSmtp.stderr, /SMTP_HOST/)
  assert.equal(configuredSmtp.status, 0, configuredSmtp.stderr)
})

test('password reset accepts OTP defaults and rejects more than three attempts', () => {
  const configured = loadEnvironment({
    PASSWORD_RESET_ENABLED: 'true',
    PASSWORD_RESET_OTP_TTL_MINUTES: '10',
    PASSWORD_RESET_MAX_ATTEMPTS: '3',
    PASSWORD_RESET_COOLDOWN_SECONDS: '60',
    SMTP_HOST: 'smtp.example',
    SMTP_PORT: '465',
    SMTP_SECURE: 'true',
    SMTP_USER: 'mailer',
    SMTP_PASS: 'test-secret',
    MAIL_FROM: 'TeleSim 3D <no-reply@example.com>',
  })
  const unsafeAttempts = loadEnvironment({
    PASSWORD_RESET_MAX_ATTEMPTS: '4',
  })

  assert.equal(configured.status, 0, configured.stderr)
  assert.notEqual(unsafeAttempts.status, 0)
  assert.match(unsafeAttempts.stderr, /PASSWORD_RESET_MAX_ATTEMPTS/)
})

test('production environment rejects an empty database password', () => {
  const result = loadEnvironment({ DB_PASSWORD: '' })

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /DB_PASSWORD/)
})

test('production environment requires a strong JWT secret', () => {
  const result = loadEnvironment({ JWT_SECRET: 'too-short' })

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /JWT_SECRET/)
})

test('production environment requires HTTPS and secure cookies', () => {
  const insecureOrigin = loadEnvironment({
    CLIENT_ORIGIN: 'http://training.example',
  })
  const insecureCookie = loadEnvironment({ COOKIE_SECURE: 'false' })

  assert.notEqual(insecureOrigin.status, 0)
  assert.match(insecureOrigin.stderr, /CLIENT_ORIGIN/)
  assert.notEqual(insecureCookie.status, 0)
  assert.match(insecureCookie.stderr, /COOKIE_SECURE/)
})
