import { create } from 'zustand'
import { getTrainingModule } from '../app/trainingModules.js'

const useAppSessionStore = create((set) => ({
  selectedTrainingModule: null,
  moduleResults: {},

  selectTrainingModule: (moduleId) => {
    set({
      selectedTrainingModule: getTrainingModule(moduleId) ? moduleId : null,
    })
  },
  clearTrainingObjective: () => set({ selectedTrainingModule: null }),
  recordModuleResult: (result) => {
    set((state) => {
      if (
        !getTrainingModule(result.moduleId) ||
        !Number.isFinite(result.score) ||
        !result.completionId
      ) {
        return {}
      }

      const previousResult = state.moduleResults[result.moduleId]

      if (previousResult?.completionId === result.completionId) {
        return {}
      }

      const bestScore = Math.max(previousResult?.bestScore ?? 0, result.score)

      return {
        moduleResults: {
          ...state.moduleResults,
          [result.moduleId]: {
            ...result,
            latestScore: result.score,
            bestScore,
            attempts: (previousResult?.attempts ?? 0) + 1,
          },
        },
      }
    })
  },
}))

export default useAppSessionStore
