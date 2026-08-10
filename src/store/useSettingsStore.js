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
})

const CONTROL_DEFAULTS = Object.freeze({
  mouseSensitivity: DEFAULT_SETTINGS.mouseSensitivity,
  showControlGuide: DEFAULT_SETTINGS.showControlGuide,
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
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'telesim-ui-preferences',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(settingKeys.map((setting) => [setting, state[setting]])),
    },
  ),
)

export { DEFAULT_SETTINGS }
export default useSettingsStore
