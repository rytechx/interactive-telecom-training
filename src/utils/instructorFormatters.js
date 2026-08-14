const statusLabels = Object.freeze({
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  needs_practice: 'Needs Practice',
  inactive: 'Inactive',
  abandoned: 'Abandoned',
})

function formatStatus(status) {
  return statusLabels[status] ?? 'Not Started'
}

function formatScore(value, suffix = '') {
  if (!Number.isFinite(value)) return 'Not available'
  const rounded = Number.isInteger(value) ? value : Math.round(value * 10) / 10
  return `${rounded}${suffix}`
}

function formatDuration(durationSeconds) {
  return formatClockDuration(durationSeconds, 'Not available')
}

function formatDate(value, { includeTime = false } = {}) {
  return formatLocalDate(value, {
    includeTime,
    fallback: 'No activity',
  })
}

function getStatusClass(status) {
  return `is-${String(status).replaceAll('_', '-')}`
}

export {
  formatDate,
  formatDuration,
  formatScore,
  formatStatus,
  getStatusClass,
}
import {
  formatClockDuration,
  formatLocalDate,
} from './formatters.js'
