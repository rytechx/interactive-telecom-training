import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseAdminUserListQuery,
  parseRoleUpdate,
  parseStatusUpdate,
  validateStaffAccountInput,
} from '../src/utils/adminValidation.js'

const TEST_PASSWORD = 'x'.repeat(16)

test('admin user filters normalize supported role and status values', () => {
  assert.deepEqual(
    parseAdminUserListQuery({
      search: ' staff ',
      role: 'ADMIN',
      status: 'ACTIVE',
      page: '2',
      limit: '50',
    }),
    {
      search: 'staff',
      role: 'admin',
      status: 'active',
      page: 2,
      limit: 50,
    },
  )
})

test('admin user filters reject unsupported values', () => {
  assert.throws(
    () => parseAdminUserListQuery({ role: 'owner' }),
    { code: 'INVALID_ROLE' },
  )
  assert.throws(
    () => parseAdminUserListQuery({ status: 'suspended' }),
    { code: 'INVALID_ACCOUNT_STATUS' },
  )
})

test('admin mutations accept only explicit roles and boolean statuses', () => {
  assert.equal(parseRoleUpdate({ role: ' Instructor ' }), 'instructor')
  assert.equal(parseStatusUpdate({ isActive: false }), false)
  assert.throws(
    () => parseRoleUpdate({ role: 'superadmin' }),
    { code: 'INVALID_ROLE' },
  )
  assert.throws(
    () => parseStatusUpdate({ isActive: 'false' }),
    { code: 'INVALID_ACCOUNT_STATUS' },
  )
})

test('staff account validation accepts only strong instructor or admin accounts', () => {
  const valid = validateStaffAccountInput({
    firstName: ' Staff ',
    lastName: ' Member ',
    email: ' STAFF@TEST.LOCAL ',
    password: TEST_PASSWORD,
    role: 'INSTRUCTOR',
  })
  const invalid = validateStaffAccountInput({
    firstName: '',
    lastName: '',
    email: 'invalid',
    password: 'short',
    role: 'student',
  })

  assert.equal(valid.isValid, true)
  assert.equal(valid.values.email, 'staff@test.local')
  assert.equal(valid.values.role, 'instructor')
  assert.equal(invalid.isValid, false)
  assert.ok(invalid.errors.firstName)
  assert.ok(invalid.errors.lastName)
  assert.ok(invalid.errors.email)
  assert.ok(invalid.errors.password)
  assert.ok(invalid.errors.role)
})

test('staff password validation keeps its default and supports an explicit minimum', () => {
  const input = {
    firstName: 'Dry',
    lastName: 'Run',
    email: 'dry-run@test.local',
    password: 'x'.repeat(6),
    role: 'admin',
  }
  const normalValidation = validateStaffAccountInput(input)
  const dryRunValidation = validateStaffAccountInput(input, {
    minimumPasswordLength: 6,
  })
  const tooShortValidation = validateStaffAccountInput(
    { ...input, password: 'x'.repeat(5) },
    { minimumPasswordLength: 6 },
  )

  assert.equal(normalValidation.isValid, false)
  assert.ok(normalValidation.errors.password)
  assert.equal(dryRunValidation.isValid, true)
  assert.equal(tooShortValidation.isValid, false)
  assert.ok(tooShortValidation.errors.password)
})
