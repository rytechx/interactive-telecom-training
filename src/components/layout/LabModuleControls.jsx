import TelecomIcon from '../../ui/TelecomIcon.jsx'

export default function LabModuleControls({
  helpVisible,
  fullscreenVisible,
  isFullscreen,
  showHelp,
  onBack,
  onToggleFullscreen,
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
        {fullscreenVisible && (
          <button
            type="button"
            className={`lab-fullscreen-button${isFullscreen ? ' is-active' : ''}`}
            onClick={onToggleFullscreen}
            aria-pressed={isFullscreen}
          >
            <span aria-hidden="true">{isFullscreen ? '×' : '⛶'}</span>
            <span className="lab-fullscreen-label">
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </span>
          </button>
        )}
      </nav>
    </header>
  )
}
