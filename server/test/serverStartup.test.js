import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import net from 'node:net'
import { once } from 'node:events'
import test from 'node:test'

const serverDirectory = fileURLToPath(new URL('../', import.meta.url))

async function reservePorts(total) {
  const listeners = []

  try {
    for (let index = 0; index < total; index += 1) {
      const listener = net.createServer()
      await new Promise((resolve, reject) => {
        listener.once('error', reject)
        listener.listen(0, '127.0.0.1', resolve)
      })
      listeners.push(listener)
    }

    return listeners.map((listener) => listener.address().port)
  } finally {
    await Promise.all(
      listeners.map(
        (listener) => new Promise((resolve) => listener.close(resolve)),
      ),
    )
  }
}

async function waitForHealth(url, childProcess) {
  const deadline = Date.now() + 15000

  while (Date.now() < deadline) {
    if (childProcess.exitCode !== null) {
      throw new Error('API process exited before serving HTTP.')
    }

    try {
      return await fetch(url)
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  throw new Error('API did not begin serving HTTP within the test window.')
}

async function waitForOutput(readOutput, expectedText) {
  const deadline = Date.now() + 3000

  while (Date.now() < deadline) {
    if (readOutput().includes(expectedText)) return
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  throw new Error(`Expected process output was not written: ${expectedText}`)
}

test('server keeps serving when the startup database check fails', async (context) => {
  const [httpPort, unavailableDatabasePort] = await reservePorts(2)
  const databasePassword = randomBytes(24).toString('base64url')
  const jwtSecret = randomBytes(48).toString('base64url')
  const childProcess = spawn(process.execPath, ['server.js'], {
    cwd: serverDirectory,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(httpPort),
      DB_HOST: '127.0.0.1',
      DB_PORT: String(unavailableDatabasePort),
      DB_USER: 'startup-test-user',
      DB_PASSWORD: databasePassword,
      DB_NAME: 'startup-test-database',
      DB_CONNECT_TIMEOUT_MS: '250',
      JWT_SECRET: jwtSecret,
      JWT_EXPIRES_IN: '8h',
      CLIENT_ORIGIN: 'http://localhost:5173',
      COOKIE_SECURE: 'false',
      COOKIE_SAME_SITE: 'lax',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let standardOutput = ''
  let errorOutput = ''

  childProcess.stdout.setEncoding('utf8')
  childProcess.stderr.setEncoding('utf8')
  childProcess.stdout.on('data', (chunk) => {
    standardOutput += chunk
  })
  childProcess.stderr.on('data', (chunk) => {
    errorOutput += chunk
  })

  context.after(async () => {
    if (childProcess.exitCode === null) {
      const exitPromise = once(childProcess, 'exit')
      childProcess.kill('SIGTERM')
      await exitPromise
    }
  })

  const response = await waitForHealth(
    `http://127.0.0.1:${httpPort}/api/health`,
    childProcess,
  )
  const payload = await response.json()

  await waitForOutput(
    () => errorOutput,
    'Database connection failed during startup.',
  )

  assert.equal(response.status, 503)
  assert.equal(payload.success, false)
  assert.equal(payload.data.database, 'unavailable')
  assert.equal(childProcess.exitCode, null)
  assert.match(standardOutput, new RegExp(`port ${httpPort}`))
  assert.match(errorOutput, /Error code: ECONNREFUSED/)
  assert.doesNotMatch(errorOutput, new RegExp(databasePassword))
  assert.doesNotMatch(errorOutput, new RegExp(jwtSecret))
})
