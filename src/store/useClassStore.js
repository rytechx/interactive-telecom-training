import { create } from 'zustand'
import classApi from '../api/classApi.js'
import instructorApi from '../api/instructorApi.js'

let classStudentRequestId = 0

function getErrorMessage(error, fallback) {
  return error?.message || fallback
}

const initialState = {
  staffClasses: [],
  staffClassesLoading: false,
  staffClassesError: null,
  selectedClass: null,
  classStudents: [],
  classStudentPagination: null,
  classStudentsLoading: false,
  classStudentsError: null,
  studentClasses: [],
  studentClassesLoading: false,
  studentClassesError: null,
  joinMessage: null,
}

const useClassStore = create((set) => ({
  ...initialState,

  loadStaffClasses: async () => {
    set({ staffClassesLoading: true, staffClassesError: null })
    try {
      const data = await instructorApi.getClasses()
      set({ staffClasses: data.classes, staffClassesLoading: false })
    } catch (error) {
      set({
        staffClassesLoading: false,
        staffClassesError: getErrorMessage(error, 'Unable to load classes.'),
      })
    }
  },

  createStaffClass: async (name) => {
    const classRecord = await instructorApi.createClass({ name })
    set((state) => ({ staffClasses: [classRecord, ...state.staffClasses] }))
    return classRecord
  },

  loadClassStudents: async (classId, filters) => {
    const requestId = ++classStudentRequestId
    set({ classStudentsLoading: true, classStudentsError: null })
    try {
      const data = await instructorApi.getClassStudents(classId, filters)
      if (requestId !== classStudentRequestId) return
      set({
        selectedClass: data.class,
        classStudents: data.students,
        classStudentPagination: data.pagination,
        classStudentsLoading: false,
      })
    } catch (error) {
      if (requestId !== classStudentRequestId) return
      set({
        selectedClass: null,
        classStudents: [],
        classStudentsLoading: false,
        classStudentsError: getErrorMessage(
          error,
          'Unable to load class students.',
        ),
      })
    }
  },

  loadStudentClasses: async () => {
    set({ studentClassesLoading: true, studentClassesError: null })
    try {
      const data = await classApi.getMyClasses()
      set({ studentClasses: data.classes, studentClassesLoading: false })
    } catch (error) {
      set({
        studentClassesLoading: false,
        studentClassesError: getErrorMessage(error, 'Unable to load your classes.'),
      })
    }
  },

  joinStudentClass: async (classCode) => {
    set({ studentClassesError: null, joinMessage: null })
    try {
      const data = await classApi.joinClass(classCode)
      const classes = await classApi.getMyClasses()
      set({ studentClasses: classes.classes, joinMessage: data.message })
      return { success: true, message: data.message }
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to join this class.')
      set({ studentClassesError: message })
      return { success: false, message }
    }
  },

  clearJoinFeedback: () => set({ studentClassesError: null, joinMessage: null }),
  reset: () => {
    classStudentRequestId += 1
    set(initialState)
  },
}))

export default useClassStore
