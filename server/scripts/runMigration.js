import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import environment from '../src/config/environment.js'

const migrationDirectory = fileURLToPath(
  new URL('../sql/', import.meta.url),
)
const connection = await mysql.createConnection({
  host: environment.database.host,
  port: environment.database.port,
  user: environment.database.user,
  password: environment.database.password,
  database: environment.database.name,
  multipleStatements: true,
})

try {
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((fileName) => /^\d{3}_.+\.sql$/.test(fileName))
    .sort()

  for (const migrationFile of migrationFiles) {
    const migrationSql = await readFile(
      `${migrationDirectory}/${migrationFile}`,
      'utf8',
    )
    await connection.query(migrationSql)
    console.log(`Applied ${migrationFile}.`)
  }

  console.log('TeleSim database migrations completed successfully.')
} finally {
  await connection.end()
}
