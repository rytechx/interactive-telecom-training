import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { after, before, test } from 'node:test'

process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_USER = 'route-test-user'
process.env.DB_PASSWORD = randomBytes(16).toString('hex')
process.env.DB_NAME = 'telesim3d'
process.env.JWT_SECRET = randomBytes(48).toString('hex')
process.env.JWT_EXPIRES_IN = '8h'
process.env.CLIENT_ORIGIN = 'http://localhost:5173'

const { default: app } = await import('../src/app.js')
const { databasePool } = await import('../src/config/database.js')

let server
let apiBaseUrl

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const address = server.address()
      apiBaseUrl = `http://127.0.0.1:${address.port}/api`
      resolve()
    })
  })
})

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  await databasePool.end()
})

test('health endpoint returns the safe API status', async () => {
  const response = await fetch(`${apiBaseUrl}/health`, {
    headers: { Origin: 'http://localhost:5173' },
  })
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173')
  assert.equal(payload.success, true)
  assert.equal(payload.data.service, 'TeleSim 3D API')
  assert.equal(response.headers.get('x-powered-by'), null)
})

test('CORS does not authorize an unconfigured frontend origin', async () => {
  const response = await fetch(`${apiBaseUrl}/health`, {
    headers: { Origin: 'https://untrusted.example' },
  })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), null)
})

test('registration endpoint rejects invalid input before database access', async () => {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'invalid-email' }),
  })
  const payload = await response.json()

  assert.equal(response.status, 400)
  assert.equal(payload.success, false)
  assert.ok(payload.errors.studentNumber)
  assert.ok(payload.errors.password)
})

test('login endpoint validates credentials without exposing account details', async () => {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  const payload = await response.json()

  assert.equal(response.status, 400)
  assert.equal(payload.success, false)
  assert.equal(
    payload.message,
    'Enter your email or student number and password.',
  )
})

test('staff login endpoint requires a staff email and password', async () => {
  const response = await fetch(`${apiBaseUrl}/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  const payload = await response.json()

  assert.equal(response.status, 400)
  assert.equal(payload.success, false)
  assert.equal(payload.message, 'Enter your staff email and password.')
  assert.ok(payload.errors.email)
})

test('current-user endpoint rejects requests without a session cookie', async () => {
  const response = await fetch(`${apiBaseUrl}/auth/me`)
  const payload = await response.json()

  assert.equal(response.status, 401)
  assert.equal(payload.success, false)
  assert.equal(payload.code, 'AUTH_REQUIRED')
})

test('training progress endpoint requires an authenticated session', async () => {
  const response = await fetch(`${apiBaseUrl}/training/progress`)
  const payload = await response.json()

  assert.equal(response.status, 401)
  assert.equal(payload.success, false)
  assert.equal(payload.code, 'AUTH_REQUIRED')
})

test('training attempt endpoint requires an authenticated session', async () => {
  const response = await fetch(`${apiBaseUrl}/training/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleKey: 'rj45' }),
  })
  const payload = await response.json()

  assert.equal(response.status, 401)
  assert.equal(payload.success, false)
  assert.equal(payload.code, 'AUTH_REQUIRED')
})

test('instructor analytics require an authenticated session', async () => {
  const response = await fetch(`${apiBaseUrl}/instructor/overview`)
  const payload = await response.json()

  assert.equal(response.status, 401)
  assert.equal(payload.success, false)
  assert.equal(payload.code, 'AUTH_REQUIRED')
})

test('admin user management requires an authenticated session', async () => {
  const response = await fetch(`${apiBaseUrl}/instructor/users`)
  const payload = await response.json()

  assert.equal(response.status, 401)
  assert.equal(payload.success, false)
  assert.equal(payload.code, 'AUTH_REQUIRED')
})

test('staff account creation requires an authenticated admin session', async () => {
  const response = await fetch(`${apiBaseUrl}/instructor/users/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  const payload = await response.json()

  assert.equal(response.status, 401)
  assert.equal(payload.success, false)
  assert.equal(payload.code, 'AUTH_REQUIRED')
})

test('logout endpoint clears the HTTP-only session cookie', async () => {
  const response = await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST' })
  const setCookieHeader = response.headers.get('set-cookie')

  assert.equal(response.status, 200)
  assert.match(setCookieHeader, /^telesim_session=/)
  assert.match(setCookieHeader, /HttpOnly/i)
  assert.match(setCookieHeader, /SameSite=Lax/i)
  assert.doesNotMatch(setCookieHeader, /;\s*Secure/i)
})
