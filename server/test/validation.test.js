import assert from 'node:assert/strict'
import test from 'node:test'
import {
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegistrationInput,
  validateResetPasswordInput,
  validateStaffLoginInput,
  validateVerifyResetOtpInput,
} from '../src/utils/validation.js'

const TEST_PASSWORD = 'x'.repeat(16)

test('registration validation normalizes safe student input', () => {
  const result = validateRegistrationInput({
    studentNumber: ' 2026-0001 ',
    firstName: ' Test ',
    lastName: ' Student ',
    email: ' STUDENT@Test.Local ',
    password: TEST_PASSWORD,
    confirmPassword: TEST_PASSWORD,
    role: 'admin',
  })

  assert.equal(result.isValid, true)
  assert.equal(result.values.studentNumber, '2026-0001')
  assert.equal(result.values.email, 'student@test.local')
  assert.equal(result.values.role, undefined)
})

test('registration validation rejects mismatched short passwords', () => {
  const result = validateRegistrationInput({
    studentNumber: '2026-0001',
    firstName: 'Test',
    lastName: 'Student',
    email: 'student@test.local',
    password: 'short',
    confirmPassword: 'different',
  })

  assert.equal(result.isValid, false)
  assert.equal(result.errors.password, 'Password must be at least 8 characters.')
  assert.equal(result.errors.confirmPassword, 'Passwords do not match.')
})

test('registration validation rejects invalid email and student number', () => {
  const result = validateRegistrationInput({
    studentNumber: '1!',
    firstName: 'Test',
    lastName: 'Student',
    email: 'invalid-email',
    password: TEST_PASSWORD,
    confirmPassword: TEST_PASSWORD,
  })

  assert.equal(result.isValid, false)
  assert.ok(result.errors.studentNumber)
  assert.ok(result.errors.email)
})

test('login validation requires both identifier and password', () => {
  const result = validateLoginInput({})

  assert.equal(result.isValid, false)
  assert.ok(result.errors.identifier)
  assert.ok(result.errors.password)
})

test('staff login validation requires a valid email and password', () => {
  const valid = validateStaffLoginInput({
    email: ' STAFF@TEST.LOCAL ',
    password: TEST_PASSWORD,
  })
  const invalid = validateStaffLoginInput({ email: 'not-an-email' })

  assert.equal(valid.isValid, true)
  assert.equal(valid.values.identifier, 'staff@test.local')
  assert.equal(invalid.isValid, false)
  assert.ok(invalid.errors.email)
  assert.ok(invalid.errors.password)
})

test('forgot-password validation rejects malformed email input', () => {
  const invalid = validateForgotPasswordInput({ email: 'not-an-email' })
  const valid = validateForgotPasswordInput({ email: ' USER@TEST.LOCAL ' })

  assert.equal(invalid.isValid, false)
  assert.equal(invalid.errors.email, 'Enter a valid email address.')
  assert.equal(valid.isValid, true)
  assert.equal(valid.values.email, 'user@test.local')
})

test('OTP verification requires a normalized email and six digits', () => {
  const invalid = validateVerifyResetOtpInput({
    email: 'not-an-email',
    otp: '12a45',
  })
  const valid = validateVerifyResetOtpInput({
    email: ' USER@TEST.LOCAL ',
    otp: '004271',
  })

  assert.equal(invalid.isValid, false)
  assert.ok(invalid.errors.email)
  assert.equal(invalid.errors.otp, 'Enter the 6-digit verification code.')
  assert.equal(valid.isValid, true)
  assert.equal(valid.values.email, 'user@test.local')
  assert.equal(valid.values.otp, '004271')
})

test('reset-password validation requires authorization and matching password', () => {
  const result = validateResetPasswordInput({
    resetAuthorization: 'invalid',
    password: 'short',
    confirmPassword: 'different',
  })

  assert.equal(result.isValid, false)
  assert.match(result.errors.resetAuthorization, /invalid or has expired/)
  assert.equal(result.errors.password, 'Password must be at least 8 characters.')
  assert.equal(result.errors.confirmPassword, 'Passwords do not match.')
})

test('reset-password validation accepts the bcrypt input limit', () => {
  const password = 'x'.repeat(72)
  const result = validateResetPasswordInput({
    resetAuthorization: 'a'.repeat(43),
    password,
    confirmPassword: password,
  })

  assert.equal(result.isValid, true)
})
