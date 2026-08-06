import { create } from 'zustand'

const TOOL_VIEW_STATES = Object.freeze({
  IDLE: 'idle',
  ENTERING: 'entering',
  INSPECTING: 'inspecting',
  EXITING: 'exiting',
})

const initialToolState = {
  hoveredToolId: null,
  selectedToolId: null,
  activeToolId: null,
  toolViewState: TOOL_VIEW_STATES.IDLE,
}

const useToolStore = create((set) => ({
  ...initialToolState,

  setHoveredTool: (toolId) => {
    set((state) =>
      state.toolViewState === TOOL_VIEW_STATES.IDLE && !state.activeToolId
        ? { hoveredToolId: toolId }
        : {},
    )
  },
  clearHoveredTool: (toolId) => {
    set((state) =>
      state.hoveredToolId === toolId ? { hoveredToolId: null } : {},
    )
  },
  requestToolInspection: (toolId) => {
    set((state) => {
      if (
        state.toolViewState !== TOOL_VIEW_STATES.IDLE ||
        state.selectedToolId ||
        state.activeToolId
      ) {
        return {}
      }

      return {
        hoveredToolId: null,
        selectedToolId: toolId,
        toolViewState: TOOL_VIEW_STATES.ENTERING,
      }
    })
  },
  completeToolInspection: () => {
    set((state) =>
      state.toolViewState === TOOL_VIEW_STATES.ENTERING &&
      state.selectedToolId
        ? { toolViewState: TOOL_VIEW_STATES.INSPECTING }
        : {},
    )
  },
  requestToolViewExit: () => {
    set((state) =>
      (state.toolViewState === TOOL_VIEW_STATES.ENTERING ||
        state.toolViewState === TOOL_VIEW_STATES.INSPECTING) &&
      state.selectedToolId
        ? {
            hoveredToolId: null,
            toolViewState: TOOL_VIEW_STATES.EXITING,
          }
        : {},
    )
  },
  activateSelectedTool: () => {
    set((state) =>
      state.toolViewState === TOOL_VIEW_STATES.INSPECTING &&
      state.selectedToolId &&
      !state.activeToolId
        ? {
            activeToolId: state.selectedToolId,
            hoveredToolId: null,
            toolViewState: TOOL_VIEW_STATES.EXITING,
          }
        : {},
    )
  },
  completeToolViewExit: () => {
    set((state) =>
      state.toolViewState === TOOL_VIEW_STATES.EXITING
        ? {
            selectedToolId: null,
            toolViewState: TOOL_VIEW_STATES.IDLE,
          }
        : {},
    )
  },
  returnActiveTool: () => {
    set((state) =>
      state.activeToolId
        ? { activeToolId: null, hoveredToolId: null }
        : {},
    )
  },
  resetToolState: () => set(initialToolState),
}))

export default useToolStore
export { TOOL_VIEW_STATES }
