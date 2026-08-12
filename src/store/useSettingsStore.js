import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const DEFAULT_SETTINGS = Object.freeze({
  showHints: true,
  showHoverLabels: true,
  confirmRestart: true,
  showProcedureGuide: true,
  mouseSensitivity: 1,
  showControlGuide: true,
  reducedMotion: false,
  largeText: false,
  highContrast: false,
  alwaysShowLabels: false,
  theme: 'dark',
  masterVolume: 0.75,
  effectsVolume: 0.65,
  ambientVolume: 0.22,
  muteAll: false,
})

const CONTROL_DEFAULTS = Object.freeze({
  mouseSensitivity: DEFAULT_SETTINGS.mouseSensitivity,
  showControlGuide: DEFAULT_SETTINGS.showControlGuide,
})

const AUDIO_DEFAULTS = Object.freeze({
  masterVolume: DEFAULT_SETTINGS.masterVolume,
  effectsVolume: DEFAULT_SETTINGS.effectsVolume,
  ambientVolume: DEFAULT_SETTINGS.ambientVolume,
  muteAll: DEFAULT_SETTINGS.muteAll,
})

const settingKeys = Object.freeze(Object.keys(DEFAULT_SETTINGS))

const useSettingsStore = create(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSetting: (setting, value) => {
        if (settingKeys.includes(setting)) {
          set({ [setting]: value })
        }
      },
      resetControlPreferences: () => set(CONTROL_DEFAULTS),
      resetAudioPreferences: () => set(AUDIO_DEFAULTS),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'telesim-ui-preferences',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedSettings) => ({
        ...DEFAULT_SETTINGS,
        ...persistedSettings,
      }),
      partialize: (state) =>
        Object.fromEntries(settingKeys.map((setting) => [setting, state[setting]])),
    },
  ),
)

export { DEFAULT_SETTINGS }
export default useSettingsStore
