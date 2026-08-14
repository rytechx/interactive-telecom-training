function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatLocalDate(
  value,
  { includeTime = true, fallback = '—' } = {},
) {
  const date = parseDate(value)

  if (!date) return fallback

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)

  if (!includeTime) return formattedDate

  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)

  return `${formattedDate} • ${formattedTime}`
}

function formatClockDuration(durationSeconds, fallback = '—') {
  if (!Number.isFinite(durationSeconds)) return fallback
  const normalizedSeconds = Math.max(0, Math.round(durationSeconds))
  const minutes = Math.floor(normalizedSeconds / 60)
  const seconds = normalizedSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export { formatClockDuration, formatLocalDate }
