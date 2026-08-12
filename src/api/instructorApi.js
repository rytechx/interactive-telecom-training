import { apiRequest } from './apiClient.js'

function buildQuery(filters = {}) {
  const query = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '' && value !== 'all') {
      query.set(key, String(value))
    }
  })

  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

const instructorApi = Object.freeze({
  getOverview: () =>
    apiRequest('/instructor/overview').then((response) => response.data),
  getStudents: (filters) =>
    apiRequest(`/instructor/students${buildQuery(filters)}`).then(
      (response) => response.data,
    ),
  getStudentDetail: (studentId) =>
    apiRequest(`/instructor/students/${studentId}`).then(
      (response) => response.data,
    ),
  getStudentAttempts: (studentId, filters) =>
    apiRequest(
      `/instructor/students/${studentId}/attempts${buildQuery(filters)}`,
    ).then((response) => response.data),
  getAttemptDetail: (studentId, attemptId) =>
    apiRequest(`/instructor/students/${studentId}/attempts/${attemptId}`).then(
      (response) => response.data,
    ),
  getModules: () =>
    apiRequest('/instructor/modules').then((response) => response.data),
  getResults: (filters) =>
    apiRequest(`/instructor/results${buildQuery(filters)}`).then(
      (response) => response.data,
    ),
  getTroubleshooting: () =>
    apiRequest('/instructor/troubleshooting').then(
      (response) => response.data,
    ),
  getUsers: (filters) =>
    apiRequest(`/instructor/users${buildQuery(filters)}`).then(
      (response) => response.data,
    ),
  createStaffAccount: (account) =>
    apiRequest('/instructor/users/staff', {
      method: 'POST',
      body: account,
    }).then((response) => response.data.user),
  updateUserRole: (userId, role) =>
    apiRequest(`/instructor/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    }).then((response) => response.data.user),
  updateUserStatus: (userId, isActive) =>
    apiRequest(`/instructor/users/${userId}/status`, {
      method: 'PATCH',
      body: { isActive },
    }).then((response) => response.data.user),
})

export default instructorApi
