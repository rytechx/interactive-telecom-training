import useTrainingPersistenceStore from '../../store/useTrainingPersistenceStore.js'

export default function PersistenceStatus({ moduleKey, scenarioKey = null }) {
  const completionStatus = useTrainingPersistenceStore(
    (state) => state.completionStatus[moduleKey],
  )
  const completionError = useTrainingPersistenceStore(
    (state) => state.completionErrors[moduleKey],
  )
  const attemptStartError = useTrainingPersistenceStore(
    (state) => state.startErrors[moduleKey],
  )
  const scenarioStatus = useTrainingPersistenceStore(
    (state) => scenarioKey ? state.scenarioSaveStatus[scenarioKey] : null,
  )
  const scenarioError = useTrainingPersistenceStore(
    (state) => scenarioKey ? state.scenarioSaveErrors[scenarioKey] : null,
  )
  const retryCompletion = useTrainingPersistenceStore(
    (state) => state.retryCompletion,
  )
  const retryScenarioSave = useTrainingPersistenceStore(
    (state) => state.retryScenarioSave,
  )
  const status = scenarioKey ? scenarioStatus : completionStatus
  const error = scenarioKey ? scenarioError : completionError

  if (attemptStartError) {
    return (
      <div className="persistence-status is-error" role="alert">
        New attempt could not be started. {attemptStartError}
      </div>
    )
  }

  if (!status || status === 'idle') return null

  if (status === 'saving') {
    return (
      <div className="persistence-status is-saving" role="status">
        Saving training result...
      </div>
    )
  }

  if (status === 'saved') {
    return (
      <div className="persistence-status is-saved" role="status">
        Training result saved.
      </div>
    )
  }

  return (
    <div className="persistence-status is-error" role="alert">
      <span>
        Training completed, but the result could not be saved. {error}
      </span>
      <button
        type="button"
        onClick={() => {
          if (scenarioKey) {
            void retryScenarioSave(scenarioKey)
          } else {
            void retryCompletion(moduleKey)
          }
        }}
      >
        Retry Save
      </button>
    </div>
  )
}
