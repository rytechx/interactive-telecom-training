import { create } from 'zustand'
import { getTrainingModule } from '../app/trainingModules.js'

const useAppSessionStore = create((set) => ({
  selectedTrainingModule: null,

  selectTrainingModule: (moduleId) => {
    set({
      selectedTrainingModule: getTrainingModule(moduleId) ? moduleId : null,
    })
  },
  clearTrainingObjective: () => set({ selectedTrainingModule: null }),
}))

export default useAppSessionStore
