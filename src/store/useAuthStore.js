import { create } from 'zustand'
import { ApiError, authApi } from '../api/apiClient.js'

let sessionCheckPromise = null

function getAuthFailure(error) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      errors: error.errors ?? {},
    }
  }

  return {
    message: 'The authentication request could not be completed.',
    errors: {},
  }
}

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionChecked: false,
  authError: null,

  checkSession: async () => {
    if (sessionCheckPromise) {
      return sessionCheckPromise
    }

    set({ isLoading: true })
    sessionCheckPromise = authApi
      .checkSession()
      .then((response) => {
        const user = response.data.user
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          sessionChecked: true,
          authError: null,
        })
        return user
      })
      .catch(() => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sessionChecked: true,
          authError: null,
        })
        return null
      })
      .finally(() => {
        sessionCheckPromise = null
      })

    return sessionCheckPromise
  },

  login: async (credentials) => {
    set({ isLoading: true, authError: null })

    try {
      const response = await authApi.login(credentials)
      const user = response.data.user

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        sessionChecked: true,
        authError: null,
      })
      return { success: true, user }
    } catch (error) {
      const failure = getAuthFailure(error)

      set({ isLoading: false, authError: failure.message })
      return { success: false, ...failure }
    }
  },

  staffLogin: async (credentials) => {
    set({ isLoading: true, authError: null })

    try {
      const response = await authApi.staffLogin(credentials)
      const user = response.data.user

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        sessionChecked: true,
        authError: null,
      })
      return { success: true, user }
    } catch (error) {
      const failure = getAuthFailure(error)

      set({ isLoading: false, authError: failure.message })
      return { success: false, ...failure }
    }
  },

  register: async (registration) => {
    set({ isLoading: true, authError: null })

    try {
      const response = await authApi.register(registration)

      set({ isLoading: false, authError: null })
      return {
        success: true,
        message: response.message,
      }
    } catch (error) {
      const failure = getAuthFailure(error)

      set({ isLoading: false, authError: failure.message })
      return { success: false, ...failure }
    }
  },

  logout: async () => {
    set({ isLoading: true, authError: null })

    try {
      await authApi.logout()
    } catch {
      return false
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionChecked: true,
        authError: null,
      })
    }

    return true
  },

  clearAuthError: () => set({ authError: null }),
}))

export default useAuthStore
