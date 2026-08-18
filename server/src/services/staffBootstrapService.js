import { databasePool } from '../config/database.js'
import { createStaffAccount } from './adminService.js'
import { validateStaffAccountInput } from '../utils/adminValidation.js'

const BOOTSTRAP_ACCOUNTS = Object.freeze([
  Object.freeze({
    key: 'admin',
    label: 'Admin',
    prefix: 'BOOTSTRAP_ADMIN',
    role: 'admin',
  }),
  Object.freeze({
    key: 'instructor',
    label: 'Instructor',
    prefix: 'BOOTSTRAP_INSTRUCTOR',
    role: 'instructor',
  }),
])
const DRY_RUN_MINIMUM_PASSWORD_LENGTH = 6

async function findUserByEmail(email) {
  const [users] = await databasePool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  )

  return users[0] ?? null
}

function readAccountInput(environment, account) {
  return {
    firstName: environment[`${account.prefix}_FIRST_NAME`],
    lastName: environment[`${account.prefix}_LAST_NAME`],
    email: environment[`${account.prefix}_EMAIL`],
    password: environment[`${account.prefix}_PASSWORD`],
    role: account.role,
  }
}

function validateAccount(environment, account, validateStaff, validationOptions) {
  const validation = validateStaff(
    readAccountInput(environment, account),
    validationOptions,
  )

  if (!validation.isValid) {
    const error = new Error(`${account.label} bootstrap configuration is invalid.`)
    error.code = 'INVALID_STAFF_BOOTSTRAP_INPUT'
    error.fields = Object.keys(validation.errors)
    throw error
  }

  return validation.values
}

async function ensureStaffAccount(input, { findExistingUser, createStaff }) {
  if (await findExistingUser(input.email)) {
    return 'already_exists'
  }

  try {
    await createStaff(input)
    return 'created'
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') {
      return 'already_exists'
    }

    throw error
  }
}

async function bootstrapProductionStaff({
  environment = process.env,
  findExistingUser = findUserByEmail,
  createStaff = createStaffAccount,
  validateStaff = validateStaffAccountInput,
} = {}) {
  if (environment.STAFF_BOOTSTRAP_ENABLED !== 'true') {
    return undefined
  }

  const validationOptions =
    environment.STAFF_BOOTSTRAP_DRY_RUN === 'true'
      ? { minimumPasswordLength: DRY_RUN_MINIMUM_PASSWORD_LENGTH }
      : undefined
  const validatedAccounts = BOOTSTRAP_ACCOUNTS.map((account) => ({
    ...account,
    input: validateAccount(
      environment,
      account,
      validateStaff,
      validationOptions,
    ),
  }))
  const summary = {}

  for (const account of validatedAccounts) {
    summary[account.key] = await ensureStaffAccount(account.input, {
      findExistingUser,
      createStaff,
    })
  }

  return summary
}

export { bootstrapProductionStaff }
