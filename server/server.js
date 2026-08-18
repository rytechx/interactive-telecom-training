import app from './src/app.js'
import { databasePool, verifyDatabaseConnection } from './src/config/database.js'
import environment from './src/config/environment.js'

function verifyDatabaseAfterStartup() {
  return verifyDatabaseConnection()
    .then(() => {
      console.log('MySQL connection successful')
    })
    .catch((error) => {
      console.error('Database connection failed during startup.')
      console.error(`Error code: ${error.code ?? 'DATABASE_CONNECTION_ERROR'}`)
    })
}

function startServer() {
  const server = app.listen(environment.port, () => {
    console.log(`TeleSim API running on port ${environment.port}`)
  })

  void verifyDatabaseAfterStartup()

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down TeleSim API.`)
    server.close(async () => {
      await databasePool.end()
      process.exit(0)
    })
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))
}

startServer()
