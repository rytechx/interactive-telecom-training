import app from './src/app.js'
import { databasePool, verifyDatabaseConnection } from './src/config/database.js'
import environment from './src/config/environment.js'
import { bootstrapProductionStaff } from './src/services/staffBootstrapService.js'

function verifyDatabaseAfterStartup() {
  return verifyDatabaseConnection()
    .then(() => {
      console.log('MySQL connection successful')
    })
    .catch((error) => {
      console.error('Database connection failed during startup.')
      console.error(`Error code: ${error.code ?? 'DATABASE_CONNECTION_ERROR'}`)
      console.error(`Error number: ${error.errno ?? 'unavailable'}`)
      console.error(`SQL state: ${error.sqlState ?? 'unavailable'}`)
      console.error(`MySQL message: ${error.sqlMessage ?? 'unavailable'}`)
      console.error(`Database host: ${environment.database.host}`)
      console.error(`Database port: ${environment.database.port}`)
      console.error(`Database user: ${environment.database.user}`)
      console.error(`Database name: ${environment.database.name}`)
    })
}

async function runProductionStaffBootstrap() {
  if (process.env.STAFF_BOOTSTRAP_ENABLED !== 'true') {
    return
  }

  console.log('Production staff bootstrap started.')

  try {
    const summary = await bootstrapProductionStaff()
    const adminStatus = summary.admin === 'created' ? 'created' : 'already exists'
    const instructorStatus =
      summary.instructor === 'created' ? 'created' : 'already exists'

    console.log(`Admin bootstrap: ${adminStatus}.`)
    console.log(`Instructor bootstrap: ${instructorStatus}.`)
    console.log('Production staff bootstrap completed.')
  } catch (error) {
    console.error('Production staff bootstrap failed.')
    console.error(`Error code: ${error.code ?? 'STAFF_BOOTSTRAP_ERROR'}`)
  }
}

function startServer() {
  const server = app.listen(environment.port, () => {
    console.log(`TeleSim API running on port ${environment.port}`)
    void verifyDatabaseAfterStartup()
    void runProductionStaffBootstrap()
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
}

startServer()
