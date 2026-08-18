import mysql from 'mysql2/promise'
import environment from './environment.js'

const databasePool = mysql.createPool({
  host: environment.database.host,
  port: environment.database.port,
  user: environment.database.user,
  password: environment.database.password,
  database: environment.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: environment.database.connectTimeout,
})

async function verifyDatabaseConnection() {
  let connection

  try {
    connection = await databasePool.getConnection()
    await connection.ping()
  } catch (error) {
    const databaseError = new Error(
      'Unable to connect to MySQL. Verify the database service and DB_* environment configuration.',
    )
    databaseError.code = error.code ?? 'DATABASE_CONNECTION_ERROR'

    for (const property of ['errno', 'sqlState', 'sqlMessage']) {
      if (error[property] !== undefined) {
        databaseError[property] = error[property]
      }
    }

    throw databaseError
  } finally {
    connection?.release()
  }
}

export { databasePool, verifyDatabaseConnection }
