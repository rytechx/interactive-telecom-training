import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  TRAINING_MODULE_IDS,
  TRAINING_MODULE_STATUS,
  TRAINING_MODULES,
} from '../app/trainingModules.js'
import {
  FIBER_TOTAL_STEPS,
  getFiberProcedureStep,
} from '../modules/fiber/fiberProcedure.js'
import {
  getNetworkProcedureStep,
  NETWORK_TOTAL_STEPS,
} from '../modules/network/networkProcedure.js'
import { NETWORK_TROUBLESHOOTING_SCENARIOS } from '../modules/network/troubleshooting/troubleshootingScenarios.js'
import {
  getRJ45ProcedureStep,
  RJ45_TOTAL_STEPS,
} from '../modules/rj45/rj45Procedure.js'
import useFiberTrainingStore from '../store/useFiberTrainingStore.js'
import useNetworkTrainingStore from '../store/useNetworkTrainingStore.js'
import useTrainingPersistenceStore from '../store/useTrainingPersistenceStore.js'
import useTrainingStore from '../store/useTrainingStore.js'
import { deriveTrainingSkills } from '../utils/trainingSkills.js'

const persistedStatusMap = Object.freeze({
  not_attempted: TRAINING_MODULE_STATUS.NOT_ATTEMPTED,
  in_progress: TRAINING_MODULE_STATUS.IN_PROGRESS,
  completed: TRAINING_MODULE_STATUS.COMPLETED,
})

export default function useTrainingOverview() {
  const progress = useTrainingPersistenceStore((state) => state.progress)
  const isLoadingProgress = useTrainingPersistenceStore(
    (state) => state.isLoadingProgress,
  )
  const progressError = useTrainingPersistenceStore(
    (state) => state.progressError,
  )
  const loadProgress = useTrainingPersistenceStore((state) => state.loadProgress)
  const rj45Started = useTrainingStore((state) => state.trainingStarted)
  const rj45StepId = useTrainingStore((state) => state.currentStep)
  const fiberStarted = useFiberTrainingStore((state) => state.trainingStarted)
  const fiberStepId = useFiberTrainingStore((state) => state.currentStep)
  const networkStarted = useNetworkTrainingStore(
    (state) => state.networkTrainingStarted,
  )
  const networkStepId = useNetworkTrainingStore(
    (state) => state.networkCurrentStep,
  )
  const networkMilestones = useNetworkTrainingStore(
    useShallow((state) => ({
      patchPanelInstalled: state.patchPanelInstalled,
      switchInstalled: state.switchInstalled,
      routerInstalled: state.routerInstalled,
      routerPowerConnected: state.routerPowerConnected,
      switchPowerConnected: state.switchPowerConnected,
      patchSwitchConnected: state.patchSwitchConnected,
      switchRouterConnected: state.switchRouterConnected,
      pcSwitchConnected: state.pcSwitchConnected,
      physicalLinksVerified: state.physicalLinksVerified,
      workstationIpConfigured: state.workstationIpConfigured,
      routerLanConfigured: state.routerLanConfigured,
      switchManagementConfigured: state.switchManagementConfigured,
      scenarioResults: state.scenarioResults,
    })),
  )

  return useMemo(() => {
    const liveProgress = {
      [TRAINING_MODULE_IDS.RJ45]: {
        started: rj45Started,
        step: getRJ45ProcedureStep(rj45StepId),
        totalSteps: RJ45_TOTAL_STEPS,
      },
      [TRAINING_MODULE_IDS.FIBER]: {
        started: fiberStarted,
        step: getFiberProcedureStep(fiberStepId),
        totalSteps: FIBER_TOTAL_STEPS,
      },
      [TRAINING_MODULE_IDS.NETWORK]: {
        started: networkStarted,
        step: getNetworkProcedureStep(networkStepId),
        totalSteps: NETWORK_TOTAL_STEPS,
      },
    }
    const modules = TRAINING_MODULES.map((module) => {
      const persisted = progress?.modules?.[module.id] ?? null
      const current = liveProgress[module.id]
      const status = current.started
        ? TRAINING_MODULE_STATUS.IN_PROGRESS
        : persistedStatusMap[persisted?.status] ??
          TRAINING_MODULE_STATUS.NOT_ATTEMPTED
      const result = persisted?.latestScore === null || !persisted
        ? null
        : {
            latestScore: persisted.latestScore,
            bestScore: persisted.bestScore,
            performanceRating: persisted.performanceRating,
            attempts: persisted.attemptCount,
            completedAttempts: persisted.completedAttemptCount,
            completedAt: persisted.latestCompletedAt,
          }

      return {
        ...module,
        result,
        attemptCount: persisted?.attemptCount ?? 0,
        status,
        progressLabel: current.started
          ? current.step.title
          : status === TRAINING_MODULE_STATUS.IN_PROGRESS
            ? 'Previous attempt remains incomplete'
            : null,
        progressPercent: current.started
          ? Math.min(
              99,
              Math.round((current.step.stepNumber / current.totalSteps) * 100),
            )
          : status === TRAINING_MODULE_STATUS.COMPLETED
            ? 100
            : status === TRAINING_MODULE_STATUS.IN_PROGRESS
              ? 15
              : 0,
      }
    })
    const recentResults = (progress?.recentActivity ?? []).map((result) => ({
      ...result,
      latestScore: result.score,
      module: TRAINING_MODULES.find(
        (module) => module.id === result.moduleKey,
      ),
    }))
    const skills = deriveTrainingSkills({
      modules,
      networkState: networkMilestones,
      scenarioCount: NETWORK_TROUBLESHOOTING_SCENARIOS.length,
    })

    return {
      modules,
      skills,
      completedCount: progress?.modulesCompleted ?? null,
      overallProgress: progress?.overallProgress ?? null,
      averageScore: progress?.averageScore ?? null,
      recentResults,
      hasProgress: Boolean(progress),
      isLoadingProgress,
      progressError,
      retryProgress: loadProgress,
    }
  }, [
    fiberStarted,
    fiberStepId,
    isLoadingProgress,
    loadProgress,
    networkStarted,
    networkStepId,
    networkMilestones,
    progress,
    progressError,
    rj45Started,
    rj45StepId,
  ])
}
