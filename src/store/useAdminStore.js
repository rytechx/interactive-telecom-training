import { create } from 'zustand'
import instructorApi from '../api/instructorApi.js'

let userListRequestId = 0

function getErrorMessage(error, fallback) {
  if (error?.status === 403) {
    return 'Administrator access is required for account management.'
  }
  return error?.message || fallback
}

const initialState = {
  users: [],
  pagination: null,
  isLoading: false,
  error: null,
  updatingUserId: null,
  isCreating: false,
  mutationError: null,
  mutationMessage: null,
}

const useAdminStore = create((set) => ({
  ...initialState,

  loadUsers: async (filters) => {
    const requestId = ++userListRequestId
    set({ isLoading: true, error: null })

    try {
      const data = await instructorApi.getUsers(filters)
      if (requestId !== userListRequestId) return
      set({
        users: data.users,
        pagination: data.pagination,
        isLoading: false,
      })
    } catch (error) {
      if (requestId !== userListRequestId) return
      set({
        isLoading: false,
        error: getErrorMessage(error, 'Unable to load user accounts.'),
      })
    }
  },

  createStaffAccount: async (account) => {
    set({
      isCreating: true,
      mutationError: null,
      mutationMessage: null,
    })

    try {
      const user = await instructorApi.createStaffAccount(account)
      set({
        isCreating: false,
        mutationMessage: `Created ${user.fullName}'s ${user.role} account.`,
      })
      return { success: true, user }
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create staff account.')
      set({ isCreating: false, mutationError: message })
      return {
        success: false,
        message,
        errors: error?.errors ?? {},
      }
    }
  },

  updateUserRole: async (userId, role) => {
    set({
      updatingUserId: userId,
      mutationError: null,
      mutationMessage: null,
    })

    try {
      const updatedUser = await instructorApi.updateUserRole(userId, role)
      set((state) => ({
        users: state.users.map((user) => (
          user.id === updatedUser.id ? updatedUser : user
        )),
        updatingUserId: null,
        mutationMessage: `Updated ${updatedUser.fullName}'s role.`,
      }))
      return true
    } catch (error) {
      set({
        updatingUserId: null,
        mutationError: getErrorMessage(error, 'Unable to update account role.'),
      })
      return false
    }
  },

  updateUserStatus: async (userId, isActive) => {
    set({
      updatingUserId: userId,
      mutationError: null,
      mutationMessage: null,
    })

    try {
      const updatedUser = await instructorApi.updateUserStatus(userId, isActive)
      set((state) => ({
        users: state.users.map((user) => (
          user.id === updatedUser.id ? updatedUser : user
        )),
        updatingUserId: null,
        mutationMessage: `${updatedUser.fullName} is now ${isActive ? 'active' : 'inactive'}.`,
      }))
      return true
    } catch (error) {
      set({
        updatingUserId: null,
        mutationError: getErrorMessage(
          error,
          'Unable to update account status.',
        ),
      })
      return false
    }
  },

  clearMutationState: () => set({
    mutationError: null,
    mutationMessage: null,
  }),

  reset: () => {
    userListRequestId += 1
    set(initialState)
  },
}))

export default useAdminStore
