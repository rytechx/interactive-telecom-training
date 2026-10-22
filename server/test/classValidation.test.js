import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CLASS_CODE_PATTERN,
  normalizeClassCode,
  validateClassCode,
  validateClassCreateInput,
  validateClassUpdateInput,
} from '../src/utils/classValidation.js'
import { validateRegistrationInput } from '../src/utils/validation.js'

const TEST_PASSWORD = 'x'.repeat(16)

test('class codes normalize to the secure human-readable format', () => {
  assert.equal(normalizeClassCode(' ts-k7m4q2 '), 'TS-K7M4Q2')
  assert.equal(CLASS_CODE_PATTERN.test('TS-K7M4Q2'), true)
  assert.equal(CLASS_CODE_PATTERN.test('TS-O0I1L2'), false)
})

test('class input validation rejects invalid names, codes, and updates', () => {
  assert.equal(validateClassCreateInput({ name: ' Networking 4A ' }).values.name, 'Networking 4A')
  assert.ok(validateClassCreateInput({ name: '' }).errors.name)
  assert.ok(validateClassCode('invalid').error)
  assert.equal(validateClassCode(' ts-k7m4q2 ').error, null)
  assert.ok(validateClassUpdateInput({ isActive: 'yes' }).errors.isActive)
  assert.throws(() => validateClassUpdateInput({}), /Provide a class name or status/)
})

test('registration accepts an optional normalized class code', () => {
  const baseInput = {
    studentNumber: '2026-9001',
    firstName: 'Class',
    lastName: 'Student',
    email: 'class-student@test.local',
    password: TEST_PASSWORD,
    confirmPassword: TEST_PASSWORD,
  }
  const withoutCode = validateRegistrationInput(baseInput)
  const withCode = validateRegistrationInput({ ...baseInput, classCode: ' ts-k7m4q2 ' })
  const invalidCode = validateRegistrationInput({ ...baseInput, classCode: 'TS-ABC' })

  assert.equal(withoutCode.isValid, true)
  assert.equal(withCode.isValid, true)
  assert.equal(withCode.values.classCode, 'TS-K7M4Q2')
  assert.ok(invalidCode.errors.classCode)
})
