import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

const runIntegration = process.env.RUN_DB_INTEGRATION === '1'

if (!runIntegration) {
  test('database health integration requires RUN_DB_INTEGRATION=1', {
    skip: true,
  }, () => {})
} else {
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

  test('health endpoint reports connected database state', async () => {
    const response = await fetch(`${apiBaseUrl}/health`)
    const payload = await response.json()

    assert.equal(response.status, 200)
    assert.equal(payload.success, true)
    assert.deepEqual(payload.data, {
      status: 'ok',
      service: 'TeleSim 3D API',
      database: 'connected',
    })
  })
}
