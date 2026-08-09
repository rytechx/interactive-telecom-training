import assert from 'node:assert/strict'
import test from 'node:test'
import {
  validateLoginInput,
  validateRegistrationInput,
} from '../src/utils/validation.js'

test('registration validation normalizes safe student input', () => {
  const result = validateRegistrationInput({
    studentNumber: ' 2026-0001 ',
    firstName: ' Test ',
    lastName: ' Student ',
    email: ' STUDENT@Test.Local ',
    password: 'training123',
    confirmPassword: 'training123',
  })

  assert.equal(result.isValid, true)
  assert.equal(result.values.studentNumber, '2026-0001')
  assert.equal(result.values.email, 'student@test.local')
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
    password: 'training123',
    confirmPassword: 'training123',
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
