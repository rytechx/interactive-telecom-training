import { useEffect } from 'react'
import useInteractionStore from '../store/useInteractionStore.js'

function releasePointerLock() {
  if (document.pointerLockElement) {
    document.exitPointerLock()
  }
}

export default function InteractionSystem() {
  const nearbyInteractable = useInteractionStore(
    (state) => state.nearbyInteractable,
  )
  const isPointerLocked = useInteractionStore(
    (state) => state.isPointerLocked,
  )
  const isTrainingMode = useInteractionStore(
    (state) => state.isTrainingMode,
  )
  const trainingStarted = useInteractionStore(
    (state) => state.trainingStarted,
  )
  const beginTraining = useInteractionStore((state) => state.beginTraining)
  const exitTraining = useInteractionStore((state) => state.exitTraining)
  const canInteract =
    Boolean(nearbyInteractable) && isPointerLocked && !isTrainingMode

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) {
        return
      }

      const interactionState = useInteractionStore.getState()

      if (
        event.code === 'KeyE' &&
        interactionState.nearbyInteractable &&
        interactionState.isPointerLocked &&
        !interactionState.isTrainingMode
      ) {
        event.preventDefault()
        releasePointerLock()
        interactionState.enterTraining(interactionState.nearbyInteractable)
        return
      }

      if (event.code === 'Escape' && interactionState.isTrainingMode) {
        event.preventDefault()
        event.stopPropagation()
        interactionState.exitTraining()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      {canInteract && (
        <div className="interaction-prompt" role="status">
          Press <kbd>E</kbd> to interact
        </div>
      )}

      {isTrainingMode && (
        <div className="training-overlay">
          <section
            className="training-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="training-title"
          >
            <h1 id="training-title">RJ45 Cable Termination</h1>

            {trainingStarted && (
              <p className="training-step">
                Step 1: Inspect the tools on the workbench.
              </p>
            )}

            <div className="training-actions">
              <button
                type="button"
                onClick={beginTraining}
                disabled={trainingStarted}
              >
                Begin Training
              </button>
              <button type="button" className="secondary" onClick={exitTraining}>
                Exit
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
