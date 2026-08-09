import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import environment from '../src/config/environment.js'

const migrationPath = fileURLToPath(
  new URL('../sql/002_training_results.sql', import.meta.url),
)
const migrationSql = await readFile(migrationPath, 'utf8')
const connection = await mysql.createConnection({
  host: environment.database.host,
  port: environment.database.port,
  user: environment.database.user,
  password: environment.database.password,
  database: environment.database.name,
  multipleStatements: true,
})

try {
  await connection.query(migrationSql)
  console.log('Training results migration completed successfully.')
} finally {
  await connection.end()
}
