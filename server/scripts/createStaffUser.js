import { databasePool } from '../src/config/database.js'
import { createStaffAccount } from '../src/services/adminService.js'
import { validateStaffAccountInput } from '../src/utils/adminValidation.js'

function readArgument(name) {
  const prefix = `--${name}=`
  const argument = process.argv.slice(2).find((value) => value.startsWith(prefix))
  return argument ? argument.slice(prefix.length).trim() : ''
}

function requireValue(value, label) {
  if (!value) {
    throw new Error(`Missing required staff value: ${label}`)
  }
  return value
}

function readStaffInput() {
  const input = {
    firstName: readArgument('first-name') || process.env.STAFF_FIRST_NAME,
    lastName: readArgument('last-name') || process.env.STAFF_LAST_NAME,
    email: readArgument('email') || process.env.STAFF_EMAIL,
    role: readArgument('role') || process.env.STAFF_ROLE,
    password: process.env.STAFF_PASSWORD,
  }
  Object.entries(input).forEach(([key, value]) => requireValue(value, key))
  const validation = validateStaffAccountInput(input)

  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors).join(' '))
  }

  return validation.values
}

async function createStaffUser() {
  const input = readStaffInput()
  const user = await createStaffAccount(input)

  console.log(
    `Created ${user.role} account ${user.email} with user ID ${user.id}.`,
  )
}

try {
  await createStaffUser()
} catch (error) {
  console.error(`Unable to create staff account: ${error.message}`)
  process.exitCode = 1
} finally {
  await databasePool.end()
}
