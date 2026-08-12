import TelecomIcon from '../../ui/TelecomIcon.jsx'

export default function LabModuleControls({
  helpVisible,
  showHelp,
  onBack,
  onToggleHelp,
}) {
  return (
    <header className="lab-module-header">
      <nav className="lab-page-controls" aria-label="Laboratory navigation">
        <button type="button" className="lab-back-button" onClick={onBack}>
          <span aria-hidden="true">&larr;</span>
          Back to Dashboard
        </button>
        {showHelp && (
          <button
            type="button"
            className={`lab-help-button${helpVisible ? ' is-active' : ''}`}
            onClick={onToggleHelp}
            aria-expanded={helpVisible}
            aria-controls="lab-help-panel"
          >
            <TelecomIcon name="help" size={17} />
            Help
          </button>
        )}
      </nav>
    </header>
  )
}
