import { useShallow } from 'zustand/react/shallow'
import SettingToggle from '../components/settings/SettingToggle.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useSettingsStore from '../store/useSettingsStore.js'

function VolumeRange({ id, label, description, value, disabled, onChange }) {
  return (
    <label className="settings-range-row" htmlFor={id}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <output htmlFor={id}>{Math.round(value * 100)}%</output>
      <input
        id={id}
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

export default function SettingsPage() {
  const settings = useSettingsStore(useShallow((state) => ({
    showHints: state.showHints,
    showHoverLabels: state.showHoverLabels,
    confirmRestart: state.confirmRestart,
    showProcedureGuide: state.showProcedureGuide,
    mouseSensitivity: state.mouseSensitivity,
    showControlGuide: state.showControlGuide,
    reducedMotion: state.reducedMotion,
    largeText: state.largeText,
    highContrast: state.highContrast,
    alwaysShowLabels: state.alwaysShowLabels,
    masterVolume: state.masterVolume,
    effectsVolume: state.effectsVolume,
    ambientVolume: state.ambientVolume,
    muteAll: state.muteAll,
  })))
  const updateSetting = useSettingsStore((state) => state.updateSetting)
  const resetControlPreferences = useSettingsStore(
    (state) => state.resetControlPreferences,
  )
  const resetAudioPreferences = useSettingsStore(
    (state) => state.resetAudioPreferences,
  )
  const resetSettings = useSettingsStore((state) => state.resetSettings)

  return (
    <div className="application-page settings-page">
      <PageHeader
        eyebrow="Student Preferences"
        title="Settings"
        description="Personalize your TeleSim interface and laboratory controls. Preferences are stored only in this browser."
        action={(
          <button type="button" className="secondary" onClick={resetSettings}>
            Reset All Preferences
          </button>
        )}
      />

      <div className="settings-grid">
        <section className="settings-card" aria-labelledby="training-preferences-title">
          <header>
            <span>Learning Experience</span>
            <h2 id="training-preferences-title">Training Preferences</h2>
          </header>
          <SettingToggle
            id="show-training-hints"
            label="Show Training Hints"
            description="Hint visibility will be configurable after all module hint systems share one control."
            checked={settings.showHints}
            disabled
          />
          <SettingToggle
            id="show-hover-labels"
            label="Show Object Hover Labels"
            description="Display contextual names when hovering interactive tools, ports, and equipment."
            checked={settings.showHoverLabels}
            onChange={(value) => updateSetting('showHoverLabels', value)}
          />
          <SettingToggle
            id="confirm-restart"
            label="Confirm Before Restarting Module"
            description="Ask before clearing the current step or module progress."
            checked={settings.confirmRestart}
            onChange={(value) => updateSetting('confirmRestart', value)}
          />
          <SettingToggle
            id="show-procedure-guidance"
            label="Show Procedure Guidance"
            description="Procedure panels remain required until compact guidance is available."
            checked={settings.showProcedureGuide}
            disabled
          />
        </section>

        <section className="settings-card" aria-labelledby="controls-settings-title">
          <header>
            <span>Laboratory Input</span>
            <h2 id="controls-settings-title">Controls</h2>
          </header>
          <label className="settings-range-row" htmlFor="mouse-sensitivity">
            <span>
              <strong>Mouse Sensitivity</strong>
              <small>Adjust first-person mouse-look response without changing movement speed.</small>
            </span>
            <output htmlFor="mouse-sensitivity">
              {Math.round(settings.mouseSensitivity * 100)}%
            </output>
            <input
              id="mouse-sensitivity"
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.mouseSensitivity}
              onChange={(event) =>
                updateSetting('mouseSensitivity', Number(event.target.value))
              }
            />
          </label>
          <SettingToggle
            id="show-control-guide"
            label="Show Control Guide"
            description="Show the laboratory help action and first-person control reminder."
            checked={settings.showControlGuide}
            onChange={(value) => updateSetting('showControlGuide', value)}
          />
          <button
            type="button"
            className="settings-reset-button"
            onClick={resetControlPreferences}
          >
            Reset Control Preferences
          </button>
        </section>

        <section className="settings-card" aria-labelledby="accessibility-settings-title">
          <header>
            <span>Display Assistance</span>
            <h2 id="accessibility-settings-title">Accessibility</h2>
          </header>
          <SettingToggle
            id="reduced-motion"
            label="Reduced Motion"
            description="Minimize interface animation and transition effects."
            checked={settings.reducedMotion}
            onChange={(value) => updateSetting('reducedMotion', value)}
          />
          <SettingToggle
            id="larger-interface-text"
            label="Larger Interface Text"
            description="Increase the scale of dashboard and settings content."
            checked={settings.largeText}
            onChange={(value) => updateSetting('largeText', value)}
          />
          <SettingToggle
            id="high-contrast"
            label="High Contrast"
            description="Strengthen panel borders and foreground text separation."
            checked={settings.highContrast}
            onChange={(value) => updateSetting('highContrast', value)}
          />
          <SettingToggle
            id="always-show-labels"
            label="Always Show Interactive Labels"
            description="Keep compact labels visible for objects that are currently actionable."
            checked={settings.alwaysShowLabels}
            onChange={(value) => updateSetting('alwaysShowLabels', value)}
          />
        </section>

        <section className="settings-card" aria-labelledby="audio-settings-title">
          <header>
            <span>Laboratory Sound</span>
            <h2 id="audio-settings-title">Audio</h2>
          </header>
          <SettingToggle
            id="mute-all-audio"
            label="Mute All"
            description="Disable all interface, training, and ambient laboratory sound."
            checked={settings.muteAll}
            onChange={(value) => updateSetting('muteAll', value)}
          />
          <VolumeRange
            id="master-volume"
            label="Master Volume"
            description="Set the overall TeleSim audio level."
            value={settings.masterVolume}
            disabled={settings.muteAll}
            onChange={(value) => updateSetting('masterVolume', value)}
          />
          <VolumeRange
            id="effects-volume"
            label="Effects Volume"
            description="Control interface, tools, equipment, and confirmation cues."
            value={settings.effectsVolume}
            disabled={settings.muteAll}
            onChange={(value) => updateSetting('effectsVolume', value)}
          />
          <VolumeRange
            id="ambient-volume"
            label="Ambient Volume"
            description="Control the subtle HVAC and electronics room tone."
            value={settings.ambientVolume}
            disabled={settings.muteAll}
            onChange={(value) => updateSetting('ambientVolume', value)}
          />
          <button
            type="button"
            className="settings-reset-button"
            onClick={resetAudioPreferences}
          >
            Reset Audio Preferences
          </button>
        </section>

        <section className="settings-card appearance-settings-card" aria-labelledby="appearance-settings-title">
          <header>
            <span>Visual Theme</span>
            <h2 id="appearance-settings-title">Appearance</h2>
          </header>
          <div className="settings-theme-row">
            <span>
              <strong>Theme</strong>
              <small>TeleSim currently supports its optimized dark laboratory theme.</small>
            </span>
            <b>Dark</b>
          </div>
        </section>
      </div>
    </div>
  )
}
