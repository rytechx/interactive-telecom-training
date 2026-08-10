import SettingToggle from '../components/settings/SettingToggle.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useSettingsStore from '../store/useSettingsStore.js'

export default function SettingsPage() {
  const settings = useSettingsStore()
  const updateSetting = useSettingsStore((state) => state.updateSetting)
  const resetControlPreferences = useSettingsStore(
    (state) => state.resetControlPreferences,
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
            description="Persistent 3D labels require a future performance-safe scene update."
            checked={settings.alwaysShowLabels}
            disabled
          />
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
