import { useEffect } from 'react'
import { calculateFinalNetworkAssessment } from '../modules/network/troubleshooting/networkAssessment.js'
import { NETWORK_TROUBLESHOOTING_MODES } from '../modules/network/troubleshooting/troubleshootingScenarios.js'
import useFiberTrainingStore from '../store/useFiberTrainingStore.js'
import useNetworkTrainingStore from '../store/useNetworkTrainingStore.js'
import useTrainingPersistenceStore from '../store/useTrainingPersistenceStore.js'
import useTrainingStore from '../store/useTrainingStore.js'

const observedCompletions = new Set()
const observedScenarios = new Set()

function toDurationSeconds(elapsedTimeMs) {
  return Math.max(0, Math.round((elapsedTimeMs ?? 0) / 1000))
}

function captureRJ45Result(state) {
  if (!state.assessmentEndTime || !Number.isFinite(state.finalScore)) return

  const persistenceState = useTrainingPersistenceStore.getState()
  const attemptId = persistenceState.activeAttemptIds.rj45
  const completionKey = `rj45:${attemptId}:${state.assessmentEndTime}`

  if (!attemptId || observedCompletions.has(completionKey)) return
  observedCompletions.add(completionKey)
  void persistenceState.completeAttempt('rj45', {
    moduleKey: 'rj45',
    score: state.finalScore,
    performanceRating: state.performanceRating,
    procedureAccuracy: state.procedureAccuracy,
    durationSeconds: toDurationSeconds(state.elapsedTimeMs),
    metrics: {
      mistakes: state.mistakeCount,
      wrongToolSelections: state.wrongToolCount,
      incorrectT568BAttempts: state.t568bValidationAttempts,
      restartStepCount: state.restartStepCount,
      procedureRetryCount: state.procedureRetryCount,
      hintCount: state.hintCount,
      cableTest: state.finalTestResult,
      terminationStandard: 'T568B',
      t568bVerified: state.crimpVerification?.t568bVerified ?? false,
      completedProcedureStages: state.completedProcedureSteps,
    },
  })
}

function captureFiberResult(state) {
  if (!state.assessmentEndTime || !Number.isFinite(state.finalScore)) return

  const persistenceState = useTrainingPersistenceStore.getState()
  const attemptId = persistenceState.activeAttemptIds.fiber
  const completionKey = `fiber:${attemptId}:${state.assessmentEndTime}`

  if (!attemptId || observedCompletions.has(completionKey)) return
  observedCompletions.add(completionKey)
  void persistenceState.completeAttempt('fiber', {
    moduleKey: 'fiber',
    score: state.finalScore,
    performanceRating: state.performanceRating,
    procedureAccuracy: state.procedureAccuracy,
    durationSeconds: toDurationSeconds(state.elapsedTimeMs),
    metrics: {
      mistakes: state.mistakeCount,
      wrongToolSelections: state.wrongToolCount,
      sequenceErrors: state.sequenceErrorCount,
      preparationErrors: state.preparationErrorCount,
      incorrectActions: state.incorrectActionCount,
      restartStepCount: state.restartStepCount,
      spliceLossDb: state.spliceLossDb,
      alignment: state.assessmentAlignmentResult,
      fusion: state.assessmentFusionResult,
      protection: state.assessmentProtectionResult,
      heater: state.assessmentHeaterResult,
      finalInspection: state.assessmentFinalInspectionResult,
      overallResult: state.assessmentOverallResult,
      completedProcedureStages: state.completedProcedureStages,
    },
  })
}

function captureNetworkScenarios(state, persistenceState, attemptId) {
  Object.values(state.scenarioResults).forEach((record) => {
    const result = record.latestResult

    if (!result) return
    const scenarioSaveKey = `${attemptId}:${result.scenarioId}`

    if (observedScenarios.has(scenarioSaveKey)) return
    observedScenarios.add(scenarioSaveKey)
    const metrics = result.metrics
    void persistenceState.saveScenarioResult({
      scenarioKey: result.scenarioId,
      scenarioTitle: result.scenarioTitle,
      score: result.finalScore,
      performanceRating: result.performanceRating,
      durationSeconds: toDurationSeconds(metrics.elapsedTime),
      diagnosisAttempts: metrics.diagnosisAttempts,
      incorrectDiagnosisAttempts: metrics.incorrectDiagnosisAttempts,
      repairAttempts: metrics.repairAttempts,
      failedRepairAttempts: metrics.failedRepairAttempts,
      hintsUsed: metrics.hintsUsed,
      diagnosticCommands: metrics.diagnosticCommandsUsed,
      metrics: {
        rootCauseIdentified: metrics.rootCauseIdentified,
        scenarioCompleted: metrics.scenarioCompleted,
        repairVerified: metrics.repairVerified,
        verificationPassed: result.verification?.passed ?? false,
        scoreBreakdown: result.scoreBreakdown,
        hintDeduction: result.hintDeduction,
        timeline: metrics.timeline,
        verification: result.verification,
      },
    })
  })
}

function captureNetworkResult(state) {
  const persistenceState = useTrainingPersistenceStore.getState()
  const attemptId = persistenceState.activeAttemptIds.network

  if (!attemptId) return
  captureNetworkScenarios(state, persistenceState, attemptId)
  const assessment = calculateFinalNetworkAssessment(state.scenarioResults)

  if (
    !assessment ||
    state.troubleshootingMode !==
      NETWORK_TROUBLESHOOTING_MODES.FINAL_ASSESSMENT
  ) {
    return
  }

  const completedAt = Math.max(
    ...Object.values(state.scenarioResults).map(
      (record) => record.latestResult?.completedAt ?? 0,
    ),
  )
  const completionKey = `network:${attemptId}:${completedAt}`

  if (observedCompletions.has(completionKey)) return
  observedCompletions.add(completionKey)
  const durationSeconds = Object.values(state.scenarioResults).reduce(
    (total, record) =>
      total + toDurationSeconds(record.latestResult?.metrics?.elapsedTime),
    0,
  )

  void persistenceState.completeAttempt('network', {
    moduleKey: 'network',
    score: assessment.finalScore,
    performanceRating: assessment.performanceRating,
    procedureAccuracy: null,
    durationSeconds,
    metrics: {
      physicalInstallation: state.physicalLinksVerified ? 'PASS' : 'FAIL',
      routerConfiguration: state.routerLanConfigured ? 'PASS' : 'FAIL',
      switchConfiguration: state.switchManagementConfigured ? 'PASS' : 'FAIL',
      pcToRouter: state.routerPingPassed ? 'PASS' : 'FAIL',
      pcToSwitch: state.switchPingPassed ? 'PASS' : 'FAIL',
      troubleshootingCompleted: assessment.scenarioScores.length,
      averageScore: assessment.averageScore,
      scenarioScores: assessment.scenarioScores,
      competencies: assessment.competencies,
    },
  })
}

export default function useTrainingResultSync() {
  useEffect(() => {
    captureRJ45Result(useTrainingStore.getState())
    captureFiberResult(useFiberTrainingStore.getState())
    captureNetworkResult(useNetworkTrainingStore.getState())

    const unsubscribeRJ45 = useTrainingStore.subscribe(captureRJ45Result)
    const unsubscribeFiber = useFiberTrainingStore.subscribe(captureFiberResult)
    const unsubscribeNetwork = useNetworkTrainingStore.subscribe(
      captureNetworkResult,
    )

    return () => {
      unsubscribeRJ45()
      unsubscribeFiber()
      unsubscribeNetwork()
    }
  }, [])
}
