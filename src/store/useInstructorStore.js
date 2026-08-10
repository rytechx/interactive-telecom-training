import { create } from 'zustand'
import instructorApi from '../api/instructorApi.js'

const OVERVIEW_CACHE_MS = 60_000
let overviewLoadedAt = 0
let studentListRequestId = 0
let resultListRequestId = 0

function getErrorMessage(error, fallback) {
  if (error?.status === 403) return 'You do not have permission to view this data.'
  return error?.message || fallback
}

const initialState = {
  overview: null,
  overviewLoading: false,
  overviewError: null,
  students: [],
  studentPagination: null,
  studentsLoading: false,
  studentsError: null,
  selectedStudent: null,
  studentDetailLoading: false,
  studentDetailError: null,
  studentAttempts: [],
  studentAttemptPagination: null,
  studentAttemptsLoading: false,
  studentAttemptsError: null,
  attemptDetail: null,
  attemptDetailLoading: false,
  attemptDetailError: null,
  moduleAnalytics: null,
  moduleAnalyticsLoading: false,
  moduleAnalyticsError: null,
  results: [],
  resultPagination: null,
  resultsLoading: false,
  resultsError: null,
  troubleshooting: null,
  troubleshootingLoading: false,
  troubleshootingError: null,
}

const useInstructorStore = create((set, get) => ({
  ...initialState,

  loadOverview: async ({ force = false } = {}) => {
    if (
      !force &&
      get().overview &&
      Date.now() - overviewLoadedAt < OVERVIEW_CACHE_MS
    ) {
      return
    }

    set({ overviewLoading: true, overviewError: null })
    try {
      const overview = await instructorApi.getOverview()
      overviewLoadedAt = Date.now()
      set({ overview, overviewLoading: false })
    } catch (error) {
      set({
        overviewLoading: false,
        overviewError: getErrorMessage(
          error,
          'Unable to load student analytics.',
        ),
      })
    }
  },

  loadStudents: async (filters) => {
    const requestId = ++studentListRequestId
    set({ studentsLoading: true, studentsError: null })
    try {
      const data = await instructorApi.getStudents(filters)
      if (requestId !== studentListRequestId) return
      set({
        students: data.students,
        studentPagination: data.pagination,
        studentsLoading: false,
      })
    } catch (error) {
      if (requestId !== studentListRequestId) return
      set({
        studentsLoading: false,
        studentsError: getErrorMessage(error, 'Unable to load student records.'),
      })
    }
  },

  loadStudentDetail: async (studentId) => {
    set({ studentDetailLoading: true, studentDetailError: null })
    try {
      const selectedStudent = await instructorApi.getStudentDetail(studentId)
      set({ selectedStudent, studentDetailLoading: false })
    } catch (error) {
      set({
        selectedStudent: null,
        studentDetailLoading: false,
        studentDetailError: getErrorMessage(
          error,
          'Unable to load the student record.',
        ),
      })
    }
  },

  loadStudentAttempts: async (studentId, filters) => {
    set({ studentAttemptsLoading: true, studentAttemptsError: null })
    try {
      const data = await instructorApi.getStudentAttempts(studentId, filters)
      set({
        studentAttempts: data.attempts,
        studentAttemptPagination: data.pagination,
        studentAttemptsLoading: false,
      })
    } catch (error) {
      set({
        studentAttemptsLoading: false,
        studentAttemptsError: getErrorMessage(
          error,
          'Unable to load attempt history.',
        ),
      })
    }
  },

  loadAttemptDetail: async (studentId, attemptId) => {
    set({ attemptDetailLoading: true, attemptDetailError: null })
    try {
      const attemptDetail = await instructorApi.getAttemptDetail(
        studentId,
        attemptId,
      )
      set({ attemptDetail, attemptDetailLoading: false })
    } catch (error) {
      set({
        attemptDetailLoading: false,
        attemptDetailError: getErrorMessage(
          error,
          'Unable to load attempt details.',
        ),
      })
    }
  },

  clearAttemptDetail: () => set({
    attemptDetail: null,
    attemptDetailError: null,
    attemptDetailLoading: false,
  }),

  loadModuleAnalytics: async ({ force = false } = {}) => {
    if (!force && get().moduleAnalytics) return
    set({ moduleAnalyticsLoading: true, moduleAnalyticsError: null })
    try {
      const moduleAnalytics = await instructorApi.getModules()
      set({ moduleAnalytics, moduleAnalyticsLoading: false })
    } catch (error) {
      set({
        moduleAnalyticsLoading: false,
        moduleAnalyticsError: getErrorMessage(
          error,
          'Unable to load module analytics.',
        ),
      })
    }
  },

  loadResults: async (filters) => {
    const requestId = ++resultListRequestId
    set({ resultsLoading: true, resultsError: null })
    try {
      const data = await instructorApi.getResults(filters)
      if (requestId !== resultListRequestId) return
      set({
        results: data.attempts,
        resultPagination: data.pagination,
        resultsLoading: false,
      })
    } catch (error) {
      if (requestId !== resultListRequestId) return
      set({
        resultsLoading: false,
        resultsError: getErrorMessage(error, 'Unable to load training results.'),
      })
    }
  },

  loadTroubleshooting: async ({ force = false } = {}) => {
    if (!force && get().troubleshooting) return
    set({ troubleshootingLoading: true, troubleshootingError: null })
    try {
      const troubleshooting = await instructorApi.getTroubleshooting()
      set({ troubleshooting, troubleshootingLoading: false })
    } catch (error) {
      set({
        troubleshootingLoading: false,
        troubleshootingError: getErrorMessage(
          error,
          'Unable to load troubleshooting analytics.',
        ),
      })
    }
  },

  reset: () => {
    overviewLoadedAt = 0
    studentListRequestId += 1
    resultListRequestId += 1
    set(initialState)
  },
}))

export default useInstructorStore
