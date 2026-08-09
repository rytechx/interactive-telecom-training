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
})

async function verifyDatabaseConnection() {
  let connection

  try {
    connection = await databasePool.getConnection()
    await connection.ping()
  } catch (error) {
    const databaseError = new Error(
      'Unable to connect to MySQL. Check the XAMPP MySQL service and server environment configuration.',
    )
    databaseError.code = error.code
    throw databaseError
  } finally {
    connection?.release()
  }
}

export { databasePool, verifyDatabaseConnection }
