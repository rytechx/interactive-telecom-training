const DEFAULT_API_URL = 'http://localhost:3001/api'
const API_BASE_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/$/, '')
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000
const SESSION_EXPIRED_EVENT = 'telesim:session-expired'
const AUTH_ENTRY_PATHS = new Set([
  '/auth/login',
  '/auth/staff/login',
  '/auth/register',
  '/auth/logout',
  '/auth/me',
])
let sessionExpiryNotified = false

class ApiError extends Error {
  constructor(message, { status = 0, code = null, errors = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

async function parseResponse(response) {
  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw new ApiError('The TeleSim server returned an invalid response.', {
      status: response.status,
    })
  }
}

function notifySessionExpired(path) {
  if (
    sessionExpiryNotified ||
    AUTH_ENTRY_PATHS.has(path) ||
    typeof window === 'undefined'
  ) {
    return
  }

  sessionExpiryNotified = true
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}

async function apiRequest(
  path,
  { method = 'GET', body, signal, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS } = {},
) {
  const requestController = new AbortController()
  let requestTimedOut = false
  const handleExternalAbort = () => requestController.abort()
  const timeoutId = window.setTimeout(() => {
    requestTimedOut = true
    requestController.abort()
  }, timeoutMs)

  signal?.addEventListener('abort', handleExternalAbort, { once: true })

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: requestController.signal,
    })
    const payload = await parseResponse(response)

    if (!response.ok) {
      if (response.status === 401) {
        notifySessionExpired(path)
      }

      throw new ApiError(
        payload?.message || 'The TeleSim server could not complete this request.',
        {
          status: response.status,
          code: payload?.code ?? null,
          errors: payload?.errors ?? null,
        },
      )
    }

    if (AUTH_ENTRY_PATHS.has(path)) {
      sessionExpiryNotified = false
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error.name === 'AbortError') {
      if (signal?.aborted) {
        throw error
      }

      if (requestTimedOut) {
        throw new ApiError('The TeleSim server took too long to respond.', {
          code: 'REQUEST_TIMEOUT',
        })
      }
    }

    throw new ApiError('Unable to connect to the TeleSim server.')
  } finally {
    window.clearTimeout(timeoutId)
    signal?.removeEventListener('abort', handleExternalAbort)
  }
}

const authApi = Object.freeze({
  checkSession: (signal) => apiRequest('/auth/me', { signal }),
  login: (credentials) =>
    apiRequest('/auth/login', { method: 'POST', body: credentials }),
  staffLogin: (credentials) =>
    apiRequest('/auth/staff/login', { method: 'POST', body: credentials }),
  register: (registration) =>
    apiRequest('/auth/register', { method: 'POST', body: registration }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
})

export { ApiError, SESSION_EXPIRED_EVENT, apiRequest, authApi }
