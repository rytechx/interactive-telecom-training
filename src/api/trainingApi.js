import { apiRequest } from './apiClient.js'

function buildQuery(filters = {}) {
  const query = new URLSearchParams()

  if (filters.moduleKey) query.set('moduleKey', filters.moduleKey)
  if (filters.status) query.set('status', filters.status)
  if (filters.limit) query.set('limit', String(filters.limit))

  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

const trainingApi = Object.freeze({
  startAttempt: (moduleKey) =>
    apiRequest('/training/attempts', {
      method: 'POST',
      body: { moduleKey },
    }).then((response) => response.data),
  completeAttempt: (attemptId, payload) =>
    apiRequest(`/training/attempts/${attemptId}/complete`, {
      method: 'POST',
      body: payload,
    }).then((response) => response.data),
  saveScenarioResult: (attemptId, payload) =>
    apiRequest(`/training/attempts/${attemptId}/scenarios`, {
      method: 'POST',
      body: payload,
    }).then((response) => response.data),
  getTrainingProgress: () =>
    apiRequest('/training/progress').then((response) => response.data),
  getAttempts: (filters) =>
    apiRequest(`/training/attempts${buildQuery(filters)}`).then(
      (response) => response.data.attempts,
    ),
  getAttemptDetail: (attemptId) =>
    apiRequest(`/training/attempts/${attemptId}`).then(
      (response) => response.data,
    ),
})

export default trainingApi
