import { apiRequest } from './apiClient.js'

const classApi = Object.freeze({
  getMyClasses: () =>
    apiRequest('/classes/me').then((response) => response.data),
  joinClass: (classCode) =>
    apiRequest('/classes/join', {
      method: 'POST',
      body: { classCode },
    }).then((response) => response.data),
})

export default classApi
