import useNetworkTrainingStore from '../../../store/useNetworkTrainingStore.js'
import { getNetworkCableConfig } from '../networkCableConfigs.js'
import { getNetworkPortConfig } from '../networkDeviceConfigs.js'
import ScenarioSelection from './ScenarioSelection.jsx'
import TroubleshootingPanel from './TroubleshootingPanel.jsx'
import {
  getTroubleshootingScenario,
  NETWORK_TROUBLESHOOTING_MODES,
} from './troubleshootingScenarios.js'

export default function NetworkTroubleshooting({ onReturnToLaboratory }) {
  const mode = useNetworkTrainingStore((state) => state.troubleshootingMode)
  const scenarioId = useNetworkTrainingStore(
    (state) => state.selectedTroubleshootingScenarioId,
  )
  const diagnosisId = useNetworkTrainingStore(
    (state) => state.troubleshootingDiagnosisId,
  )
  const diagnosisConfirmed = useNetworkTrainingStore(
    (state) => state.troubleshootingDiagnosisConfirmed,
  )
  const feedback = useNetworkTrainingStore(
    (state) => state.troubleshootingFeedback,
  )
  const hintLevel = useNetworkTrainingStore(
    (state) => state.troubleshootingHintLevel,
  )
  const methodologyVisible = useNetworkTrainingStore(
    (state) => state.troubleshootingMethodologyVisible,
  )
  const verificationResults = useNetworkTrainingStore(
    (state) => state.troubleshootingVerificationResults,
  )
  const metrics = useNetworkTrainingStore(
    (state) => state.troubleshootingMetrics,
  )
  const selectedCableId = useNetworkTrainingStore(
    (state) => state.selectedCableId,
  )
  const selectedSourcePortId = useNetworkTrainingStore(
    (state) => state.selectedSourcePortId,
  )
  const startScenario = useNetworkTrainingStore(
    (state) => state.startTroubleshootingScenario,
  )
  const startRandomScenario = useNetworkTrainingStore(
    (state) => state.startRandomTroubleshootingScenario,
  )
  const setDiagnosis = useNetworkTrainingStore(
    (state) => state.setTroubleshootingDiagnosis,
  )
  const submitDiagnosis = useNetworkTrainingStore(
    (state) => state.submitTroubleshootingDiagnosis,
  )
  const verifyRepair = useNetworkTrainingStore(
    (state) => state.verifyTroubleshootingRepair,
  )
  const requestHint = useNetworkTrainingStore(
    (state) => state.requestTroubleshootingHint,
  )
  const toggleMethodology = useNetworkTrainingStore(
    (state) => state.toggleTroubleshootingMethodology,
  )
  const openTool = useNetworkTrainingStore(
    (state) => state.openTroubleshootingTool,
  )
  const restartScenario = useNetworkTrainingStore(
    (state) => state.restartTroubleshootingScenario,
  )
  const nextScenario = useNetworkTrainingStore(
    (state) => state.startNextTroubleshootingScenario,
  )
  const returnToSelection = useNetworkTrainingStore(
    (state) => state.returnToTroubleshootingSelection,
  )
  const exitTroubleshooting = useNetworkTrainingStore(
    (state) => state.exitTroubleshooting,
  )

  if (mode === NETWORK_TROUBLESHOOTING_MODES.SELECTION) {
    return (
      <ScenarioSelection
        onSelectScenario={startScenario}
        onSelectRandom={startRandomScenario}
        onExit={exitTroubleshooting}
      />
    )
  }

  const scenario = getTroubleshootingScenario(scenarioId)
  const selectedCable = getNetworkCableConfig(selectedCableId)
  const repairTarget = selectedCable && selectedSourcePortId
    ? getNetworkPortConfig(selectedCable.destinationPortId)
    : null

  if (!scenario) {
    return null
  }

  return (
    <TroubleshootingPanel
      scenario={scenario}
      mode={mode}
      diagnosisId={diagnosisId}
      diagnosisConfirmed={diagnosisConfirmed}
      feedback={feedback}
      hintLevel={hintLevel}
      methodologyVisible={methodologyVisible}
      verificationResults={verificationResults}
      metrics={metrics}
      selectedCableName={selectedCable?.name ?? null}
      repairTargetName={repairTarget?.name ?? null}
      onDiagnosisChange={setDiagnosis}
      onSubmitDiagnosis={submitDiagnosis}
      onVerifyRepair={verifyRepair}
      onRequestHint={requestHint}
      onToggleMethodology={toggleMethodology}
      onOpenTool={openTool}
      onRestart={restartScenario}
      onExit={exitTroubleshooting}
      onNextScenario={nextScenario}
      onReturnToSelection={returnToSelection}
      onReturnToLaboratory={onReturnToLaboratory}
    />
  )
}
