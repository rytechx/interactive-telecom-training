import { create } from 'zustand'
import trainingApi from '../api/trainingApi.js'

const MODULE_KEYS = Object.freeze(['rj45', 'fiber', 'network'])
const emptyModuleValues = () => Object.fromEntries(
  MODULE_KEYS.map((moduleKey) => [moduleKey, null]),
)
const emptyModuleStatuses = () => Object.fromEntries(
  MODULE_KEYS.map((moduleKey) => [moduleKey, 'idle']),
)

let requestGeneration = 0
let progressPromise = null
const startPromises = new Map()
const completionPromises = new Map()
const scenarioPromises = new Map()

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback
}

function replaceModuleValue(values, moduleKey, value) {
  return { ...values, [moduleKey]: value }
}

function createInitialPersistenceState() {
  return {
    ownerUserId: null,
    activeAttemptIds: emptyModuleValues(),
    progress: null,
    attempts: [],
    attemptDetails: {},
    attemptFilters: { moduleKey: null, status: null, limit: 50 },
    isLoadingProgress: false,
    progressError: null,
    isLoadingAttempts: false,
    attemptsError: null,
    detailLoadingId: null,
    detailError: null,
    startStatus: emptyModuleStatuses(),
    startErrors: emptyModuleValues(),
    completionStatus: emptyModuleStatuses(),
    completionErrors: emptyModuleValues(),
    pendingCompletions: emptyModuleValues(),
    scenarioSaveStatus: {},
    scenarioSaveErrors: {},
    pendingScenarios: {},
  }
}

const useTrainingPersistenceStore = create((set, get) => ({
  ...createInitialPersistenceState(),

  initializeForUser: (userId) => {
    if (!userId) {
      requestGeneration += 1
      progressPromise = null
      startPromises.clear()
      completionPromises.clear()
      scenarioPromises.clear()
      set(createInitialPersistenceState())
      return Promise.resolve(null)
    }

    if (get().ownerUserId !== userId) {
      requestGeneration += 1
      progressPromise = null
      startPromises.clear()
      completionPromises.clear()
      scenarioPromises.clear()
      set({ ...createInitialPersistenceState(), ownerUserId: userId })
    }

    return get().loadProgress()
  },

  loadProgress: () => {
    if (progressPromise) return progressPromise

    const generation = requestGeneration
    set({ isLoadingProgress: true, progressError: null })
    const request = trainingApi
      .getTrainingProgress()
      .then((progress) => {
        if (generation === requestGeneration) {
          set({ progress, isLoadingProgress: false, progressError: null })
        }
        return progress
      })
      .catch((error) => {
        if (generation === requestGeneration) {
          set({
            isLoadingProgress: false,
            progressError: getErrorMessage(
              error,
              'Unable to load training progress.',
            ),
          })
        }
        return null
      })
      .finally(() => {
        if (progressPromise === request) {
          progressPromise = null
        }
      })

    progressPromise = request
    return progressPromise
  },

  loadAttempts: async (filters = get().attemptFilters) => {
    const generation = requestGeneration
    const normalizedFilters = {
      moduleKey: filters.moduleKey || null,
      status: filters.status || null,
      limit: filters.limit || 50,
    }
    set({
      isLoadingAttempts: true,
      attemptsError: null,
      attemptFilters: normalizedFilters,
    })

    try {
      const attempts = await trainingApi.getAttempts(normalizedFilters)
      if (generation === requestGeneration) {
        set({ attempts, isLoadingAttempts: false, attemptsError: null })
      }
      return attempts
    } catch (error) {
      if (generation === requestGeneration) {
        set({
          isLoadingAttempts: false,
          attemptsError: getErrorMessage(
            error,
            'Unable to load training attempts.',
          ),
        })
      }
      return null
    }
  },

  loadAttemptDetail: async (attemptId) => {
    const generation = requestGeneration
    set({ detailLoadingId: attemptId, detailError: null })

    try {
      const detail = await trainingApi.getAttemptDetail(attemptId)
      if (generation === requestGeneration) {
        set((state) => ({
          attemptDetails: {
            ...state.attemptDetails,
            [attemptId]: detail,
          },
          detailLoadingId: null,
          detailError: null,
        }))
      }
      return detail
    } catch (error) {
      if (generation === requestGeneration) {
        set({
          detailLoadingId: null,
          detailError: getErrorMessage(
            error,
            'Unable to load this training result.',
          ),
        })
      }
      return null
    }
  },

  startAttempt: (moduleKey) => {
    if (startPromises.has(moduleKey)) return startPromises.get(moduleKey)

    const generation = requestGeneration
    set((state) => ({
      startStatus: replaceModuleValue(state.startStatus, moduleKey, 'saving'),
      startErrors: replaceModuleValue(state.startErrors, moduleKey, null),
    }))

    const promise = trainingApi
      .startAttempt(moduleKey)
      .then((attempt) => {
        if (generation === requestGeneration) {
          set((state) => ({
            activeAttemptIds: replaceModuleValue(
              state.activeAttemptIds,
              moduleKey,
              attempt.attemptId,
            ),
            startStatus: replaceModuleValue(
              state.startStatus,
              moduleKey,
              'saved',
            ),
            completionStatus: replaceModuleValue(
              state.completionStatus,
              moduleKey,
              'idle',
            ),
            completionErrors: replaceModuleValue(
              state.completionErrors,
              moduleKey,
              null,
            ),
            pendingCompletions: replaceModuleValue(
              state.pendingCompletions,
              moduleKey,
              null,
            ),
            ...(moduleKey === 'network'
              ? {
                  scenarioSaveStatus: {},
                  scenarioSaveErrors: {},
                  pendingScenarios: {},
                }
              : {}),
          }))
        }
        void get().loadProgress()
        return attempt
      })
      .catch((error) => {
        if (generation === requestGeneration) {
          set((state) => ({
            startStatus: replaceModuleValue(
              state.startStatus,
              moduleKey,
              'error',
            ),
            startErrors: replaceModuleValue(
              state.startErrors,
              moduleKey,
              getErrorMessage(error, 'Unable to start this training attempt.'),
            ),
          }))
        }
        return null
      })
      .finally(() => {
        startPromises.delete(moduleKey)
      })

    startPromises.set(moduleKey, promise)
    return promise
  },

  completeAttempt: (moduleKey, payload) => {
    const attemptId = get().activeAttemptIds[moduleKey]

    if (!attemptId) {
      set((state) => ({
        completionStatus: replaceModuleValue(
          state.completionStatus,
          moduleKey,
          'error',
        ),
        completionErrors: replaceModuleValue(
          state.completionErrors,
          moduleKey,
          'This result has no active database attempt. Start a new attempt before retrying.',
        ),
      }))
      return Promise.resolve(null)
    }

    if (completionPromises.has(moduleKey)) {
      return completionPromises.get(moduleKey)
    }

    const generation = requestGeneration
    set((state) => ({
      completionStatus: replaceModuleValue(
        state.completionStatus,
        moduleKey,
        'saving',
      ),
      completionErrors: replaceModuleValue(
        state.completionErrors,
        moduleKey,
        null,
      ),
      pendingCompletions: replaceModuleValue(
        state.pendingCompletions,
        moduleKey,
        payload,
      ),
    }))

    const promise = trainingApi
      .completeAttempt(attemptId, payload)
      .then((attempt) => {
        if (generation === requestGeneration) {
          set((state) => ({
            activeAttemptIds: replaceModuleValue(
              state.activeAttemptIds,
              moduleKey,
              null,
            ),
            completionStatus: replaceModuleValue(
              state.completionStatus,
              moduleKey,
              'saved',
            ),
            completionErrors: replaceModuleValue(
              state.completionErrors,
              moduleKey,
              null,
            ),
            pendingCompletions: replaceModuleValue(
              state.pendingCompletions,
              moduleKey,
              null,
            ),
          }))
        }
        void Promise.all([
          get().loadProgress(),
          get().loadAttempts(get().attemptFilters),
        ])
        return attempt
      })
      .catch((error) => {
        if (generation === requestGeneration) {
          set((state) => ({
            completionStatus: replaceModuleValue(
              state.completionStatus,
              moduleKey,
              'error',
            ),
            completionErrors: replaceModuleValue(
              state.completionErrors,
              moduleKey,
              getErrorMessage(error, 'The completed result could not be saved.'),
            ),
          }))
        }
        return null
      })
      .finally(() => {
        completionPromises.delete(moduleKey)
      })

    completionPromises.set(moduleKey, promise)
    return promise
  },

  retryCompletion: (moduleKey) => {
    const payload = get().pendingCompletions[moduleKey]
    return payload ? get().completeAttempt(moduleKey, payload) : Promise.resolve(null)
  },

  saveScenarioResult: (payload) => {
    const attemptId = get().activeAttemptIds.network
    const scenarioKey = payload.scenarioKey

    if (!attemptId) {
      set((state) => ({
        scenarioSaveStatus: { ...state.scenarioSaveStatus, [scenarioKey]: 'error' },
        scenarioSaveErrors: {
          ...state.scenarioSaveErrors,
          [scenarioKey]: 'This scenario has no active Network attempt.',
        },
      }))
      return Promise.resolve(null)
    }

    if (scenarioPromises.has(scenarioKey)) {
      return scenarioPromises.get(scenarioKey)
    }

    const generation = requestGeneration
    set((state) => ({
      scenarioSaveStatus: { ...state.scenarioSaveStatus, [scenarioKey]: 'saving' },
      scenarioSaveErrors: { ...state.scenarioSaveErrors, [scenarioKey]: null },
      pendingScenarios: { ...state.pendingScenarios, [scenarioKey]: payload },
    }))

    const promise = trainingApi
      .saveScenarioResult(attemptId, payload)
      .then((scenario) => {
        if (generation === requestGeneration) {
          set((state) => ({
            scenarioSaveStatus: {
              ...state.scenarioSaveStatus,
              [scenarioKey]: 'saved',
            },
            scenarioSaveErrors: {
              ...state.scenarioSaveErrors,
              [scenarioKey]: null,
            },
            pendingScenarios: {
              ...state.pendingScenarios,
              [scenarioKey]: null,
            },
          }))
        }
        return scenario
      })
      .catch((error) => {
        if (generation === requestGeneration) {
          set((state) => ({
            scenarioSaveStatus: {
              ...state.scenarioSaveStatus,
              [scenarioKey]: 'error',
            },
            scenarioSaveErrors: {
              ...state.scenarioSaveErrors,
              [scenarioKey]: getErrorMessage(
                error,
                'The scenario result could not be saved.',
              ),
            },
          }))
        }
        return null
      })
      .finally(() => {
        scenarioPromises.delete(scenarioKey)
      })

    scenarioPromises.set(scenarioKey, promise)
    return promise
  },

  retryScenarioSave: (scenarioKey) => {
    const payload = get().pendingScenarios[scenarioKey]
    return payload ? get().saveScenarioResult(payload) : Promise.resolve(null)
  },
}))

export default useTrainingPersistenceStore
