import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseAttemptListQuery,
  parseInstructorListQuery,
  parsePositiveId,
} from '../src/utils/instructorValidation.js'

test('instructor list filters normalize safe pagination and search values', () => {
  assert.deepEqual(
    parseInstructorListQuery({
      search: ' 21-0387 ',
      status: 'IN_PROGRESS',
      module: 'RJ45',
      page: '2',
      limit: '50',
    }),
    {
      search: '21-0387',
      status: 'in_progress',
      moduleKey: 'rj45',
      page: 2,
      limit: 50,
    },
  )
})

test('instructor list filters reject unsupported values and oversized searches', () => {
  assert.throws(
    () => parseInstructorListQuery({ status: 'suspended' }),
    { code: 'INVALID_STATUS' },
  )
  assert.throws(
    () => parseInstructorListQuery({ module: 'unknown' }),
    { code: 'INVALID_MODULE' },
  )
  assert.throws(
    () => parseInstructorListQuery({ search: 'x'.repeat(101) }),
    { code: 'INVALID_SEARCH' },
  )
  assert.throws(
    () => parseInstructorListQuery({ limit: '1000' }),
    { code: 'INVALID_LIMIT' },
  )
})

test('attempt filters validate score bands and calendar date ranges', () => {
  assert.deepEqual(
    parseAttemptListQuery({
      scoreBand: '85_94',
      fromDate: '2026-08-01',
      toDate: '2026-08-10',
    }),
    {
      search: '',
      status: null,
      moduleKey: null,
      page: 1,
      limit: 20,
      scoreBand: '85_94',
      fromDate: '2026-08-01',
      toDate: '2026-08-10',
    },
  )
  assert.throws(
    () => parseAttemptListQuery({ fromDate: '2026-02-30' }),
    { code: 'INVALID_DATE_FILTER' },
  )
  assert.throws(
    () => parseAttemptListQuery({
      fromDate: '2026-08-10',
      toDate: '2026-08-01',
    }),
    { code: 'INVALID_DATE_RANGE' },
  )
})

test('record identifiers must be canonical positive integers', () => {
  assert.equal(parsePositiveId('42', 'Student'), 42)
  assert.throws(() => parsePositiveId('0'), { code: 'INVALID_RECORD_ID' })
  assert.throws(() => parsePositiveId('01'), { code: 'INVALID_RECORD_ID' })
})
