import { create } from 'zustand'

const WORKSTATION_PHASES = Object.freeze({
  EXPLORATION: 'exploration',
  ENTERING: 'entering',
  FOCUSED: 'focused',
  EXITING: 'exiting',
})

const useInteractionStore = create((set) => ({
  nearbyInteractable: null,
  activeInteractable: null,
  isPointerLocked: false,
  isTrainingMode: false,
  workstationPhase: WORKSTATION_PHASES.EXPLORATION,

  setPointerLocked: (isPointerLocked) => {
    set((state) => ({
      isPointerLocked:
        state.workstationPhase === WORKSTATION_PHASES.EXPLORATION &&
        isPointerLocked,
    }))
  },
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
  requestWorkstationFocus: (interactable) => {
    set((state) => {
      if (
        state.workstationPhase !== WORKSTATION_PHASES.EXPLORATION ||
        state.activeInteractable
      ) {
        return {}
      }

      return {
        activeInteractable: interactable,
        isPointerLocked: false,
        isTrainingMode: false,
        workstationPhase: WORKSTATION_PHASES.ENTERING,
      }
    })
  },
  completeWorkstationFocus: () => {
    set((state) =>
      state.workstationPhase === WORKSTATION_PHASES.ENTERING
        ? {
            isTrainingMode: true,
            workstationPhase: WORKSTATION_PHASES.FOCUSED,
          }
        : {},
    )
  },
  requestWorkstationExit: () => {
    set((state) => {
      if (
        state.workstationPhase !== WORKSTATION_PHASES.ENTERING &&
        state.workstationPhase !== WORKSTATION_PHASES.FOCUSED
      ) {
        return {}
      }

      return {
        isPointerLocked: false,
        isTrainingMode: false,
        workstationPhase: WORKSTATION_PHASES.EXITING,
      }
    })
  },
  completeWorkstationExit: () => {
    set((state) =>
      state.workstationPhase === WORKSTATION_PHASES.EXPLORATION
        ? {}
        : {
            activeInteractable: null,
            isPointerLocked: false,
            isTrainingMode: false,
            workstationPhase: WORKSTATION_PHASES.EXPLORATION,
          },
    )
  },
}))

export default useInteractionStore
export { WORKSTATION_PHASES }
