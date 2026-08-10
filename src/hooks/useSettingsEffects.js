import { useEffect } from 'react'
import useSettingsStore from '../store/useSettingsStore.js'

const preferenceClasses = Object.freeze({
  reducedMotion: 'settings-reduced-motion',
  largeText: 'settings-large-text',
  highContrast: 'settings-high-contrast',
})

export default function useSettingsEffects() {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion)
  const largeText = useSettingsStore((state) => state.largeText)
  const highContrast = useSettingsStore((state) => state.highContrast)
  const showHoverLabels = useSettingsStore((state) => state.showHoverLabels)
  const theme = useSettingsStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle(preferenceClasses.reducedMotion, reducedMotion)
    root.classList.toggle(preferenceClasses.largeText, largeText)
    root.classList.toggle(preferenceClasses.highContrast, highContrast)
    root.classList.toggle('settings-hide-hover-labels', !showHoverLabels)
    root.dataset.theme = theme

    return () => {
      Object.values(preferenceClasses).forEach((className) => {
        root.classList.remove(className)
      })
      root.classList.remove('settings-hide-hover-labels')
      delete root.dataset.theme
    }
  }, [highContrast, largeText, reducedMotion, showHoverLabels, theme])
}
