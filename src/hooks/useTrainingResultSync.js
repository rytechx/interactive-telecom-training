import { useEffect } from 'react'
import { TRAINING_MODULE_IDS } from '../app/trainingModules.js'
import { calculateFinalNetworkAssessment } from '../modules/network/troubleshooting/networkAssessment.js'
import useAppSessionStore from '../store/useAppSessionStore.js'
import useFiberTrainingStore from '../store/useFiberTrainingStore.js'
import useNetworkTrainingStore from '../store/useNetworkTrainingStore.js'
import useTrainingStore from '../store/useTrainingStore.js'

function captureRJ45Result(state) {
  if (!state.assessmentEndTime || !Number.isFinite(state.finalScore)) {
    return
  }

  useAppSessionStore.getState().recordModuleResult({
    moduleId: TRAINING_MODULE_IDS.RJ45,
    score: state.finalScore,
    performanceRating: state.performanceRating,
    completionId: `rj45:${state.assessmentEndTime}`,
    completedAt: state.assessmentEndTime,
    details: {
      procedureAccuracy: state.procedureAccuracy,
      mistakes: state.mistakeCount,
      elapsedTimeMs: state.elapsedTimeMs,
      result: state.finalTestResult,
    },
  })
}

function captureFiberResult(state) {
  if (!state.assessmentEndTime || !Number.isFinite(state.finalScore)) {
    return
  }

  useAppSessionStore.getState().recordModuleResult({
    moduleId: TRAINING_MODULE_IDS.FIBER,
    score: state.finalScore,
    performanceRating: state.performanceRating,
    completionId: `fiber:${state.assessmentEndTime}`,
    completedAt: state.assessmentEndTime,
    details: {
      procedureAccuracy: state.procedureAccuracy,
      mistakes: state.mistakeCount,
      elapsedTimeMs: state.elapsedTimeMs,
      spliceLossDb: state.spliceLossDb,
      result: state.assessmentOverallResult,
    },
  })
}

function captureNetworkResult(state) {
  const assessment = calculateFinalNetworkAssessment(state.scenarioResults)

  if (!assessment) {
    return
  }

  const completedAt = Math.max(
    ...Object.values(state.scenarioResults).map(
      (result) => result.latestResult?.completedAt ?? 0,
    ),
  )

  useAppSessionStore.getState().recordModuleResult({
    moduleId: TRAINING_MODULE_IDS.NETWORK,
    score: assessment.finalScore,
    performanceRating: assessment.performanceRating,
    completionId: `network:${completedAt}`,
    completedAt,
    details: {
      averageScore: assessment.averageScore,
      scenariosCompleted: assessment.scenarioScores.length,
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
    const unsubscribeNetwork =
      useNetworkTrainingStore.subscribe(captureNetworkResult)

    return () => {
      unsubscribeRJ45()
      unsubscribeFiber()
      unsubscribeNetwork()
    }
  }, [])
}
