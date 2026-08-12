const DEFAULT_AUDIO_SETTINGS = Object.freeze({
  masterVolume: 0.75,
  effectsVolume: 0.65,
  ambientVolume: 0.22,
  muteAll: false,
})

const effectCooldowns = new Map()
let audioContext = null
let masterGain = null
let effectsGain = null
let ambientGain = null
let ambienceSource = null
let ambienceFilter = null
let audioSettings = { ...DEFAULT_AUDIO_SETTINGS }

function getAudioContextClass() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.AudioContext ?? window.webkitAudioContext ?? null
}

function setGain(gainNode, value) {
  if (!gainNode || !audioContext) {
    return
  }

  gainNode.gain.setTargetAtTime(value, audioContext.currentTime, 0.025)
}

function applyAudioSettings() {
  const mutedMultiplier = audioSettings.muteAll ? 0 : 1

  setGain(masterGain, audioSettings.masterVolume * mutedMultiplier)
  setGain(effectsGain, audioSettings.effectsVolume)
  setGain(ambientGain, audioSettings.ambientVolume)
}

function createAudioGraph() {
  const AudioContextClass = getAudioContextClass()

  if (!AudioContextClass) {
    return null
  }

  audioContext = new AudioContextClass()
  masterGain = audioContext.createGain()
  effectsGain = audioContext.createGain()
  ambientGain = audioContext.createGain()
  effectsGain.connect(masterGain)
  ambientGain.connect(masterGain)
  masterGain.connect(audioContext.destination)
  applyAudioSettings()

  return audioContext
}

function ensureAudioContext() {
  return audioContext ?? createAudioGraph()
}

function createNoiseBuffer(context, duration = 1.5) {
  const frameCount = Math.floor(context.sampleRate * duration)
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const channel = buffer.getChannelData(0)

  for (let index = 0; index < frameCount; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * 0.34
  }

  return buffer
}

function startAmbience() {
  const context = ensureAudioContext()

  if (!context || ambienceSource) {
    return
  }

  ambienceSource = context.createBufferSource()
  ambienceFilter = context.createBiquadFilter()
  const ambienceLevel = context.createGain()

  ambienceSource.buffer = createNoiseBuffer(context)
  ambienceSource.loop = true
  ambienceFilter.type = 'lowpass'
  ambienceFilter.frequency.value = 175
  ambienceFilter.Q.value = 0.35
  ambienceLevel.gain.value = 0.045
  ambienceSource.connect(ambienceFilter)
  ambienceFilter.connect(ambienceLevel)
  ambienceLevel.connect(ambientGain)
  ambienceSource.start()
}

async function unlockAudio() {
  const context = ensureAudioContext()

  if (!context) {
    return false
  }

  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return false
    }
  }

  startAmbience()
  return context.state === 'running'
}

function scheduleTone({
  frequency,
  duration,
  gain = 0.12,
  type = 'sine',
  delay = 0,
  endFrequency = frequency,
}) {
  if (!audioContext || audioContext.state !== 'running' || !effectsGain) {
    return
  }

  const startsAt = audioContext.currentTime + delay
  const endsAt = startsAt + duration
  const oscillator = audioContext.createOscillator()
  const envelope = audioContext.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startsAt)
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(endFrequency, 1),
    endsAt,
  )
  envelope.gain.setValueAtTime(0.0001, startsAt)
  envelope.gain.exponentialRampToValueAtTime(gain, startsAt + 0.012)
  envelope.gain.exponentialRampToValueAtTime(0.0001, endsAt)
  oscillator.connect(envelope)
  envelope.connect(effectsGain)
  oscillator.start(startsAt)
  oscillator.stop(endsAt + 0.02)
}

function scheduleNoise({ duration = 0.08, gain = 0.05, delay = 0, cutoff = 1800 }) {
  if (!audioContext || audioContext.state !== 'running' || !effectsGain) {
    return
  }

  const startsAt = audioContext.currentTime + delay
  const source = audioContext.createBufferSource()
  const filter = audioContext.createBiquadFilter()
  const envelope = audioContext.createGain()

  source.buffer = createNoiseBuffer(audioContext, duration + 0.04)
  filter.type = 'lowpass'
  filter.frequency.value = cutoff
  envelope.gain.setValueAtTime(0.0001, startsAt)
  envelope.gain.exponentialRampToValueAtTime(gain, startsAt + 0.008)
  envelope.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration)
  source.connect(filter)
  filter.connect(envelope)
  envelope.connect(effectsGain)
  source.start(startsAt)
  source.stop(startsAt + duration + 0.04)
}

function playEffectPattern(effectName) {
  switch (effectName) {
    case 'ui-click':
      scheduleTone({ frequency: 520, endFrequency: 430, duration: 0.045, gain: 0.055, type: 'triangle' })
      break
    case 'training-start':
      scheduleTone({ frequency: 380, endFrequency: 520, duration: 0.09, gain: 0.065, type: 'triangle' })
      scheduleTone({ frequency: 520, endFrequency: 680, duration: 0.12, gain: 0.055, type: 'triangle', delay: 0.085 })
      break
    case 'success':
    case 'link-established':
      scheduleTone({ frequency: 520, endFrequency: 620, duration: 0.1, gain: 0.075, type: 'sine' })
      scheduleTone({ frequency: 720, endFrequency: 820, duration: 0.14, gain: 0.06, type: 'sine', delay: 0.075 })
      break
    case 'assessment-complete':
      scheduleTone({ frequency: 420, endFrequency: 520, duration: 0.12, gain: 0.08, type: 'triangle' })
      scheduleTone({ frequency: 620, endFrequency: 720, duration: 0.16, gain: 0.07, type: 'triangle', delay: 0.1 })
      scheduleTone({ frequency: 820, endFrequency: 920, duration: 0.18, gain: 0.06, type: 'triangle', delay: 0.22 })
      break
    case 'warning':
      scheduleTone({ frequency: 245, endFrequency: 205, duration: 0.11, gain: 0.07, type: 'square' })
      scheduleTone({ frequency: 205, endFrequency: 180, duration: 0.1, gain: 0.055, type: 'square', delay: 0.12 })
      break
    case 'tester-beep':
    case 'cli-confirm':
      scheduleTone({ frequency: 880, duration: 0.065, gain: 0.055, type: 'sine' })
      break
    case 'power-switch':
      scheduleNoise({ duration: 0.06, gain: 0.07, cutoff: 850 })
      scheduleTone({ frequency: 110, endFrequency: 72, duration: 0.12, gain: 0.05, type: 'square' })
      break
    case 'arc-fusion':
      scheduleNoise({ duration: 0.17, gain: 0.045, cutoff: 3200 })
      scheduleTone({ frequency: 1250, endFrequency: 680, duration: 0.19, gain: 0.035, type: 'sawtooth' })
      break
    case 'wipe':
      scheduleNoise({ duration: 0.16, gain: 0.035, cutoff: 2200 })
      break
    case 'mechanical':
    case 'strip':
    case 'trim':
    case 'crimp':
    case 'cleave':
    case 'lid':
    case 'rack-mount':
    case 'cable-connect':
      scheduleNoise({ duration: 0.055, gain: 0.065, cutoff: 1250 })
      scheduleTone({ frequency: 180, endFrequency: 105, duration: 0.075, gain: 0.05, type: 'triangle' })
      break
    case 'alignment':
      scheduleTone({ frequency: 640, endFrequency: 710, duration: 0.18, gain: 0.045, type: 'sine' })
      break
    case 'heater-complete':
      scheduleTone({ frequency: 620, duration: 0.08, gain: 0.05, type: 'sine' })
      scheduleTone({ frequency: 780, duration: 0.12, gain: 0.05, type: 'sine', delay: 0.1 })
      break
    default:
      break
  }
}

function playEffect(effectName, { cooldown = 70 } = {}) {
  if (
    audioSettings.muteAll ||
    audioSettings.masterVolume <= 0 ||
    audioSettings.effectsVolume <= 0 ||
    !audioContext ||
    audioContext.state !== 'running'
  ) {
    return false
  }

  const now = performance.now()
  const previousPlayedAt = effectCooldowns.get(effectName) ?? 0

  if (now - previousPlayedAt < cooldown) {
    return false
  }

  effectCooldowns.set(effectName, now)
  playEffectPattern(effectName)
  return true
}

function setAudioSettings(nextSettings) {
  audioSettings = {
    ...audioSettings,
    ...nextSettings,
  }
  applyAudioSettings()
}

export {
  DEFAULT_AUDIO_SETTINGS,
  playEffect,
  setAudioSettings,
  unlockAudio,
}
