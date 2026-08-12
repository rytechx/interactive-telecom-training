import { useEffect } from 'react'
import {
  playEffect,
  setAudioSettings,
  unlockAudio,
} from '../audio/audioManager.js'
import useFiberTrainingStore from '../store/useFiberTrainingStore.js'
import useNetworkTrainingStore from '../store/useNetworkTrainingStore.js'
import useSettingsStore from '../store/useSettingsStore.js'
import useTrainingStore from '../store/useTrainingStore.js'

function getProcedureEffect(currentStep = '') {
  const normalizedStep = String(currentStep).toLowerCase()

  if (normalizedStep.includes('strip')) return 'strip'
  if (normalizedStep.includes('trim')) return 'trim'
  if (normalizedStep.includes('crimp')) return 'crimp'
  if (normalizedStep.includes('test')) return 'tester-beep'
  if (normalizedStep.includes('clean')) return 'wipe'
  if (normalizedStep.includes('cleav')) return 'cleave'
  if (normalizedStep.includes('align')) return 'alignment'
  if (normalizedStep.includes('fus')) return 'arc-fusion'
  if (normalizedStep.includes('lid') || normalizedStep.includes('clamp')) return 'lid'
  if (normalizedStep.includes('heat')) return 'mechanical'
  if (normalizedStep.includes('install')) return 'rack-mount'
  if (normalizedStep.includes('connect')) return 'cable-connect'
  if (normalizedStep.includes('power')) return 'power-switch'

  return 'mechanical'
}

function getFeedbackEffect(feedback) {
  const normalizedFeedback = String(feedback ?? '').toLowerCase()

  if (!normalizedFeedback) return null
  if (
    normalizedFeedback.includes('incorrect') ||
    normalizedFeedback.includes('wrong') ||
    normalizedFeedback.includes('fail') ||
    normalizedFeedback.includes('cannot') ||
    normalizedFeedback.includes('not required')
  ) {
    return 'warning'
  }
  if (
    normalizedFeedback.includes('success') ||
    normalizedFeedback.includes('pass') ||
    normalizedFeedback.includes('complete') ||
    normalizedFeedback.includes('connected') ||
    normalizedFeedback.includes('installed') ||
    normalizedFeedback.includes('configured')
  ) {
    return 'success'
  }

  return null
}

function subscribeToTrainingStore(store, stepKey, completionKey) {
  return store.subscribe((state, previousState) => {
    if (
      state.isProcedureAnimating &&
      !previousState.isProcedureAnimating
    ) {
      playEffect(getProcedureEffect(state[stepKey]), { cooldown: 120 })
    }

    if (state.procedureFeedback !== previousState.procedureFeedback) {
      const feedbackEffect = getFeedbackEffect(state.procedureFeedback)

      if (feedbackEffect) {
        playEffect(feedbackEffect, { cooldown: 180 })
      }
    }

    if (
      completionKey &&
      state[completionKey] &&
      !previousState[completionKey]
    ) {
      playEffect('assessment-complete', { cooldown: 800 })
    }
  })
}

export default function useAudioSystem() {
  const masterVolume = useSettingsStore((state) => state.masterVolume)
  const effectsVolume = useSettingsStore((state) => state.effectsVolume)
  const ambientVolume = useSettingsStore((state) => state.ambientVolume)
  const muteAll = useSettingsStore((state) => state.muteAll)

  useEffect(() => {
    setAudioSettings({
      masterVolume,
      effectsVolume,
      ambientVolume,
      muteAll,
    })
  }, [ambientVolume, effectsVolume, masterVolume, muteAll])

  useEffect(() => {
    const handleUnlock = () => {
      unlockAudio()
    }
    const handleDocumentClick = (event) => {
      if (
        event.target.closest(
          'button, a, [role="button"], input[type="checkbox"]',
        )
      ) {
        playEffect('ui-click')
      }
    }

    document.addEventListener('pointerdown', handleUnlock, true)
    document.addEventListener('keydown', handleUnlock, true)
    document.addEventListener('click', handleDocumentClick, true)

    const unsubscribeRJ45 = subscribeToTrainingStore(
      useTrainingStore,
      'currentStep',
      'moduleCompleted',
    )
    const unsubscribeFiber = subscribeToTrainingStore(
      useFiberTrainingStore,
      'currentStep',
      'fiberModuleCompleted',
    )
    const unsubscribeNetwork = subscribeToTrainingStore(
      useNetworkTrainingStore,
      'networkCurrentStep',
      null,
    )
    const unsubscribeTester = useTrainingStore.subscribe(
      (state, previousState) => {
        if (state.finalTestResult !== previousState.finalTestResult) {
          playEffect(
            state.finalTestResult === 'PASS' ? 'success' : 'warning',
            { cooldown: 350 },
          )
        }
      },
    )
    const unsubscribeHeater = useFiberTrainingStore.subscribe(
      (state, previousState) => {
        if (state.heatingComplete && !previousState.heatingComplete) {
          playEffect('heater-complete', { cooldown: 500 })
        }
      },
    )
    const unsubscribePower = useNetworkTrainingStore.subscribe(
      (state, previousState) => {
        if (state.networkPowered && !previousState.networkPowered) {
          playEffect('link-established', { cooldown: 500 })
        }

        if (
          state.networkCurrentStep === 'logical-configuration-complete' &&
          previousState.networkCurrentStep !==
            'logical-configuration-complete'
        ) {
          playEffect('assessment-complete', { cooldown: 800 })
        }
      },
    )

    return () => {
      document.removeEventListener('pointerdown', handleUnlock, true)
      document.removeEventListener('keydown', handleUnlock, true)
      document.removeEventListener('click', handleDocumentClick, true)
      unsubscribeRJ45()
      unsubscribeFiber()
      unsubscribeNetwork()
      unsubscribeTester()
      unsubscribeHeater()
      unsubscribePower()
    }
  }, [])
}
