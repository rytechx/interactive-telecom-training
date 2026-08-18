import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import test from 'node:test'
import { bootstrapProductionStaff } from '../src/services/staffBootstrapService.js'
import { validateStaffAccountInput } from '../src/utils/adminValidation.js'

function createEnvironment(overrides = {}) {
  const suffix = randomBytes(8).toString('hex')

  return {
    STAFF_BOOTSTRAP_ENABLED: 'true',
    BOOTSTRAP_ADMIN_FIRST_NAME: 'Admin',
    BOOTSTRAP_ADMIN_LAST_NAME: 'Account',
    BOOTSTRAP_ADMIN_EMAIL: `admin-${suffix}@test.local`,
    BOOTSTRAP_ADMIN_PASSWORD: randomBytes(24).toString('base64url'),
    BOOTSTRAP_INSTRUCTOR_FIRST_NAME: 'Instructor',
    BOOTSTRAP_INSTRUCTOR_LAST_NAME: 'Account',
    BOOTSTRAP_INSTRUCTOR_EMAIL: `instructor-${suffix}@test.local`,
    BOOTSTRAP_INSTRUCTOR_PASSWORD: randomBytes(24).toString('base64url'),
    ...overrides,
  }
}

test('bootstrap does nothing unless explicitly enabled', async () => {
  for (const enabledValue of [undefined, 'false', 'TRUE', '1', ' true ']) {
    let dependencyCalls = 0
    const environment = createEnvironment({
      STAFF_BOOTSTRAP_ENABLED: enabledValue,
    })
    const summary = await bootstrapProductionStaff({
      environment,
      findExistingUser: async () => {
        dependencyCalls += 1
      },
      createStaff: async () => {
        dependencyCalls += 1
      },
      validateStaff: () => {
        dependencyCalls += 1
      },
    })

    assert.equal(summary, undefined)
    assert.equal(dependencyCalls, 0)
  }
})

test('bootstrap creates the Admin account with the existing staff service', async () => {
  const environment = createEnvironment()
  const createdAccounts = []
  const summary = await bootstrapProductionStaff({
    environment,
    findExistingUser: async (email) =>
      email === environment.BOOTSTRAP_INSTRUCTOR_EMAIL ? { id: 1 } : null,
    createStaff: async (input) => {
      createdAccounts.push(input)
    },
  })

  assert.equal(summary.admin, 'created')
  assert.equal(createdAccounts.length, 1)
  assert.equal(createdAccounts[0].email, environment.BOOTSTRAP_ADMIN_EMAIL)
  assert.equal(createdAccounts[0].role, 'admin')
})

test('bootstrap creates the Instructor account with the existing staff service', async () => {
  const environment = createEnvironment()
  const createdAccounts = []
  const summary = await bootstrapProductionStaff({
    environment,
    findExistingUser: async (email) =>
      email === environment.BOOTSTRAP_ADMIN_EMAIL ? { id: 1 } : null,
    createStaff: async (input) => {
      createdAccounts.push(input)
    },
  })

  assert.equal(summary.instructor, 'created')
  assert.equal(createdAccounts.length, 1)
  assert.equal(createdAccounts[0].email, environment.BOOTSTRAP_INSTRUCTOR_EMAIL)
  assert.equal(createdAccounts[0].role, 'instructor')
})

test('bootstrap skips an existing Admin without overwriting it', async () => {
  const environment = createEnvironment()
  const createdEmails = []
  const summary = await bootstrapProductionStaff({
    environment,
    findExistingUser: async (email) =>
      email === environment.BOOTSTRAP_ADMIN_EMAIL ? { id: 1 } : null,
    createStaff: async (input) => {
      createdEmails.push(input.email)
    },
  })

  assert.equal(summary.admin, 'already_exists')
  assert.ok(!createdEmails.includes(environment.BOOTSTRAP_ADMIN_EMAIL))
})

test('bootstrap skips an existing Instructor without overwriting it', async () => {
  const environment = createEnvironment()
  const createdEmails = []
  const summary = await bootstrapProductionStaff({
    environment,
    findExistingUser: async (email) =>
      email === environment.BOOTSTRAP_INSTRUCTOR_EMAIL ? { id: 1 } : null,
    createStaff: async (input) => {
      createdEmails.push(input.email)
    },
  })

  assert.equal(summary.instructor, 'already_exists')
  assert.ok(!createdEmails.includes(environment.BOOTSTRAP_INSTRUCTOR_EMAIL))
})

test('repeated bootstrap runs do not create duplicate accounts', async () => {
  const environment = createEnvironment()
  const existingEmails = new Set()
  const createdEmails = []
  const dependencies = {
    environment,
    findExistingUser: async (email) =>
      existingEmails.has(email) ? { id: 1 } : null,
    createStaff: async (input) => {
      createdEmails.push(input.email)
      existingEmails.add(input.email)
    },
  }

  const firstSummary = await bootstrapProductionStaff(dependencies)
  const secondSummary = await bootstrapProductionStaff(dependencies)

  assert.deepEqual(firstSummary, {
    admin: 'created',
    instructor: 'created',
  })
  assert.deepEqual(secondSummary, {
    admin: 'already_exists',
    instructor: 'already_exists',
  })
  assert.equal(createdEmails.length, 2)
  assert.equal(new Set(createdEmails).size, 2)
})

test('bootstrap rejects invalid account input before querying the database', async () => {
  const environment = createEnvironment({
    BOOTSTRAP_ADMIN_EMAIL: 'invalid-email',
  })
  let databaseQueries = 0

  await assert.rejects(
    bootstrapProductionStaff({
      environment,
      findExistingUser: async () => {
        databaseQueries += 1
        return null
      },
      createStaff: async () => {},
    }),
    { code: 'INVALID_STAFF_BOOTSTRAP_INPUT' },
  )

  const invalidRole = validateStaffAccountInput({
    firstName: 'Invalid',
    lastName: 'Role',
    email: environment.BOOTSTRAP_ADMIN_EMAIL.replace(
      'invalid-email',
      'invalid-role@test.local',
    ),
    password: environment.BOOTSTRAP_ADMIN_PASSWORD,
    role: 'student',
  })

  assert.equal(databaseQueries, 0)
  assert.equal(invalidRole.isValid, false)
  assert.ok(invalidRole.errors.role)
})

test('bootstrap summaries never contain staff passwords', async () => {
  const environment = createEnvironment()
  const summary = await bootstrapProductionStaff({
    environment,
    findExistingUser: async () => null,
    createStaff: async () => {},
  })
  const serializedSummary = JSON.stringify(summary)

  assert.deepEqual(summary, {
    admin: 'created',
    instructor: 'created',
  })
  assert.ok(!serializedSummary.includes(environment.BOOTSTRAP_ADMIN_PASSWORD))
  assert.ok(
    !serializedSummary.includes(environment.BOOTSTRAP_INSTRUCTOR_PASSWORD),
  )
})

test('bootstrap treats a concurrent duplicate insertion as already existing', async () => {
  const environment = createEnvironment()
  const summary = await bootstrapProductionStaff({
    environment,
    findExistingUser: async () => null,
    createStaff: async (input) => {
      if (input.role === 'admin') {
        const error = new Error('Duplicate account')
        error.code = 'EMAIL_EXISTS'
        throw error
      }
    },
  })

  assert.deepEqual(summary, {
    admin: 'already_exists',
    instructor: 'created',
  })
})
