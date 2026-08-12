import HttpError from './HttpError.js'

const INSTRUCTOR_ROLES = Object.freeze(['instructor', 'admin'])
const MODULE_KEYS = Object.freeze(['rj45', 'fiber', 'network'])
const STUDENT_STATUSES = Object.freeze([
  'not_started',
  'in_progress',
  'completed',
  'needs_practice',
])
const SCORE_BANDS = Object.freeze([
  'below_70',
  '70_84',
  '85_94',
  '95_100',
])
const PAGE_LIMITS = Object.freeze([20, 50])
const PERFORMANCE_RATINGS = Object.freeze({
  outstanding: 'Outstanding',
  excellent: 'Excellent',
  very_good: 'Very Good',
  good: 'Good',
  needs_practice: 'Needs Practice',
  repeat_training: 'Repeat Training',
})

function parsePositiveId(value, label = 'Record') {
  const parsedValue = Number.parseInt(value, 10)

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0 ||
    String(parsedValue) !== String(value)
  ) {
    throw new HttpError(
      400,
      `${label} ID must be a positive integer.`,
      'INVALID_RECORD_ID',
    )
  }

  return parsedValue
}

function normalizeOptionalValue(value) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized && normalized.toLowerCase() !== 'all'
    ? normalized.toLowerCase()
    : null
}

function parsePage(value) {
  if (value === undefined) return 1
  const page = Number.parseInt(value, 10)

  if (!Number.isInteger(page) || page < 1 || String(page) !== String(value)) {
    throw new HttpError(400, 'Page must be a positive integer.', 'INVALID_PAGE')
  }

  return page
}

function parseLimit(value) {
  if (value === undefined) return 20
  const limit = Number.parseInt(value, 10)

  if (!PAGE_LIMITS.includes(limit) || String(limit) !== String(value)) {
    throw new HttpError(400, 'Limit must be 20 or 50.', 'INVALID_LIMIT')
  }

  return limit
}

function parseDate(value, fieldName) {
  if (!value) return null

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(
      400,
      `${fieldName} must use YYYY-MM-DD.`,
      'INVALID_DATE_FILTER',
    )
  }

  const date = new Date(`${value}T00:00:00Z`)

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new HttpError(400, `${fieldName} is invalid.`, 'INVALID_DATE_FILTER')
  }

  return value
}

function parseInstructorListQuery(query = {}) {
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  if (search.length > 100) {
    throw new HttpError(
      400,
      'Search must be 100 characters or fewer.',
      'INVALID_SEARCH',
    )
  }

  const status = normalizeOptionalValue(query.status)
  const moduleKey = normalizeOptionalValue(query.module)

  if (status && !STUDENT_STATUSES.includes(status)) {
    throw new HttpError(400, 'Student status filter is invalid.', 'INVALID_STATUS')
  }

  if (moduleKey && !MODULE_KEYS.includes(moduleKey)) {
    throw new HttpError(400, 'Module filter is invalid.', 'INVALID_MODULE')
  }

  return {
    search,
    status,
    moduleKey,
    page: parsePage(query.page),
    limit: parseLimit(query.limit),
  }
}

function parseAttemptListQuery(query = {}) {
  const filters = parseInstructorListQuery({
    search: query.search,
    page: query.page,
    limit: query.limit,
  })
  const moduleKey = normalizeOptionalValue(query.module)
  const scoreBand = normalizeOptionalValue(query.scoreBand)
  const performanceKey = normalizeOptionalValue(query.performance)

  if (moduleKey && !MODULE_KEYS.includes(moduleKey)) {
    throw new HttpError(400, 'Module filter is invalid.', 'INVALID_MODULE')
  }

  if (scoreBand && !SCORE_BANDS.includes(scoreBand)) {
    throw new HttpError(400, 'Score range is invalid.', 'INVALID_SCORE_RANGE')
  }

  if (performanceKey && !PERFORMANCE_RATINGS[performanceKey]) {
    throw new HttpError(
      400,
      'Performance filter is invalid.',
      'INVALID_PERFORMANCE',
    )
  }

  const fromDate = parseDate(query.fromDate, 'Start date')
  const toDate = parseDate(query.toDate, 'End date')

  if (fromDate && toDate && fromDate > toDate) {
    throw new HttpError(
      400,
      'Start date must be on or before end date.',
      'INVALID_DATE_RANGE',
    )
  }

  return {
    ...filters,
    moduleKey,
    scoreBand,
    performanceRating: performanceKey
      ? PERFORMANCE_RATINGS[performanceKey]
      : null,
    fromDate,
    toDate,
  }
}

export {
  INSTRUCTOR_ROLES,
  MODULE_KEYS,
  PAGE_LIMITS,
  PERFORMANCE_RATINGS,
  SCORE_BANDS,
  STUDENT_STATUSES,
  parseAttemptListQuery,
  parseInstructorListQuery,
  parsePositiveId,
}
