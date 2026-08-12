import assert from 'node:assert/strict'
import test from 'node:test'
import authorize from '../src/middleware/authorize.js'

function runAuthorization(role) {
  let nextValue = Symbol('not-called')
  const middleware = authorize('instructor', 'admin')
  const request = role ? { user: { role } } : {}

  middleware(request, {}, (value) => {
    nextValue = value
  })

  return nextValue
}

test('instructor authorization rejects missing authentication', () => {
  const error = runAuthorization()

  assert.equal(error.status, 401)
  assert.equal(error.code, 'AUTH_REQUIRED')
})

test('instructor authorization rejects student accounts', () => {
  const error = runAuthorization('student')

  assert.equal(error.status, 403)
  assert.equal(error.code, 'FORBIDDEN')
})

test('instructor authorization accepts instructor and admin accounts', () => {
  assert.equal(runAuthorization('instructor'), undefined)
  assert.equal(runAuthorization('admin'), undefined)
})

test('admin authorization rejects instructors and accepts administrators', () => {
  let instructorError
  let adminError = Symbol('not-called')
  const middleware = authorize('admin')

  middleware({ user: { role: 'instructor' } }, {}, (error) => {
    instructorError = error
  })
  middleware({ user: { role: 'admin' } }, {}, (error) => {
    adminError = error
  })

  assert.equal(instructorError.status, 403)
  assert.equal(instructorError.code, 'FORBIDDEN')
  assert.equal(adminError, undefined)
})
