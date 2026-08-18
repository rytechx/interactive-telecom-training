import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { after, before, test } from 'node:test'

process.env.NODE_ENV = 'production'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_USER = 'production-route-test-user'
process.env.DB_PASSWORD = randomBytes(16).toString('hex')
process.env.DB_NAME = 'telesim3d'
process.env.JWT_SECRET = randomBytes(48).toString('hex')
process.env.JWT_EXPIRES_IN = '8h'
process.env.CLIENT_ORIGIN = 'https://training.example'
process.env.COOKIE_SECURE = 'true'
process.env.COOKIE_SAME_SITE = 'lax'

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

test('production logout clears a secure HTTP-only session cookie', async () => {
  const response = await fetch(`${apiBaseUrl}/auth/logout`, {
    method: 'POST',
    headers: { Origin: 'https://training.example' },
  })
  const setCookieHeader = response.headers.get('set-cookie')

  assert.equal(response.status, 200)
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    'https://training.example',
  )
  assert.match(setCookieHeader, /HttpOnly/i)
  assert.match(setCookieHeader, /;\s*Secure/i)
  assert.match(setCookieHeader, /SameSite=Lax/i)
})

test('production CORS omits authorization for another origin', async () => {
  const response = await fetch(`${apiBaseUrl}/health`, {
    headers: { Origin: 'https://untrusted.example' },
  })

  assert.equal(response.status, 503)
  assert.equal(response.headers.get('access-control-allow-origin'), null)
})
