const DEFAULT_API_URL = 'http://localhost:3001/api'
const API_BASE_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/$/, '')

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

async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new ApiError('Unable to connect to the TeleSim server.')
  }

  const payload = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(
      payload?.message || 'The TeleSim server could not complete this request.',
      {
        status: response.status,
        code: payload?.code ?? null,
        errors: payload?.errors ?? null,
      },
    )
  }

  return payload
}

const authApi = Object.freeze({
  checkSession: (signal) => apiRequest('/auth/me', { signal }),
  login: (credentials) =>
    apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (registration) =>
    apiRequest('/auth/register', { method: 'POST', body: registration }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
})

export { ApiError, apiRequest, authApi }
