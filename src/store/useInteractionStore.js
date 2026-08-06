import { create } from 'zustand'

const useInteractionStore = create((set) => ({
  nearbyInteractable: null,
  activeInteractable: null,
  isPointerLocked: false,
  isTrainingMode: false,
  trainingStarted: false,

  setPointerLocked: (isPointerLocked) => set({ isPointerLocked }),
  setNearbyInteractable: (interactable) => {
    set({ nearbyInteractable: interactable })
  },
  clearNearbyInteractable: (interactableId) => {
    set((state) =>
      state.nearbyInteractable?.id === interactableId
        ? { nearbyInteractable: null }
        : {},
    )
  },
  enterTraining: (interactable) => {
    set({
      activeInteractable: interactable,
      isPointerLocked: false,
      isTrainingMode: true,
      trainingStarted: false,
    })
  },
  beginTraining: () => {
    set((state) => (state.isTrainingMode ? { trainingStarted: true } : {}))
  },
  exitTraining: () => {
    set({
      activeInteractable: null,
      isPointerLocked: false,
      isTrainingMode: false,
      trainingStarted: false,
    })
  },
}))

export default useInteractionStore
