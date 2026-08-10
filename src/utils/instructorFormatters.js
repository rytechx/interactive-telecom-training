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
  if (!Number.isFinite(durationSeconds)) return 'Not available'
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = Math.max(0, Math.round(durationSeconds % 60))
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatDate(value, { includeTime = false } = {}) {
  if (!value) return 'No activity'
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'No activity'

  return new Intl.DateTimeFormat(undefined, includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(date)
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
