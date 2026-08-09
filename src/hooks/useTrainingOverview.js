import { useMemo } from 'react'
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
import {
  getRJ45ProcedureStep,
  RJ45_TOTAL_STEPS,
} from '../modules/rj45/rj45Procedure.js'
import useAppSessionStore from '../store/useAppSessionStore.js'
import useFiberTrainingStore from '../store/useFiberTrainingStore.js'
import useNetworkTrainingStore from '../store/useNetworkTrainingStore.js'
import useTrainingStore from '../store/useTrainingStore.js'

function getModuleStatus(result, started) {
  if (started) {
    return TRAINING_MODULE_STATUS.IN_PROGRESS
  }

  return result
    ? TRAINING_MODULE_STATUS.COMPLETED
    : TRAINING_MODULE_STATUS.NOT_ATTEMPTED
}

export default function useTrainingOverview() {
  const moduleResults = useAppSessionStore((state) => state.moduleResults)
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

  return useMemo(() => {
    const progressByModule = {
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
      const result = moduleResults[module.id] ?? null
      const progress = progressByModule[module.id]
      const status = getModuleStatus(result, progress.started)

      return {
        ...module,
        result,
        status,
        progressLabel:
          status === TRAINING_MODULE_STATUS.IN_PROGRESS
            ? progress.step.title
            : null,
        progressPercent:
          status === TRAINING_MODULE_STATUS.IN_PROGRESS
            ? Math.min(
                99,
                Math.round(
                  (progress.step.stepNumber / progress.totalSteps) * 100,
                ),
              )
            : status === TRAINING_MODULE_STATUS.COMPLETED
              ? 100
              : 0,
      }
    })
    const completedModules = modules.filter(
      (module) => module.status === TRAINING_MODULE_STATUS.COMPLETED,
    )
    const averageScore = completedModules.length
      ? Math.round(
          completedModules.reduce(
            (total, module) => total + module.result.latestScore,
            0,
          ) / completedModules.length,
        )
      : null

    return {
      modules,
      completedCount: completedModules.length,
      overallProgress: Math.round(
        (completedModules.length / TRAINING_MODULES.length) * 100,
      ),
      averageScore,
      recentResults: completedModules
        .map((module) => ({ ...module.result, module }))
        .sort((first, second) => second.completedAt - first.completedAt),
    }
  }, [
    fiberStarted,
    fiberStepId,
    moduleResults,
    networkStarted,
    networkStepId,
    rj45Started,
    rj45StepId,
  ])
}
