const restartMessages = Object.freeze({
  step: 'Restart the current step? Progress made in this step will be cleared.',
  scenario: 'Restart this scenario? Current diagnosis and repair progress will be cleared.',
  module: 'Restart this module? Current module progress will be cleared.',
})

function confirmTrainingRestart(scope, confirmationEnabled) {
  return (
    !confirmationEnabled ||
    window.confirm(restartMessages[scope] ?? restartMessages.module)
  )
}

export { confirmTrainingRestart }
