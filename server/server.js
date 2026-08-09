import app from './src/app.js'
import { databasePool, verifyDatabaseConnection } from './src/config/database.js'
import environment from './src/config/environment.js'

async function startServer() {
  try {
    await verifyDatabaseConnection()
    console.log('MySQL connection successful')

    const server = app.listen(environment.port, () => {
      console.log(`TeleSim API running on port ${environment.port}`)
    })

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down TeleSim API.`)
      server.close(async () => {
        await databasePool.end()
        process.exit(0)
      })
    }

    process.once('SIGINT', () => shutdown('SIGINT'))
    process.once('SIGTERM', () => shutdown('SIGTERM'))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

startServer()
