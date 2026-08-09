import TelecomIcon from '../../ui/TelecomIcon.jsx'

export default function DashboardHeader({ onEnterLab }) {
  return (
    <header className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <span className="dashboard-eyebrow">Virtual Skills Laboratory</span>
        <h1>TeleSim 3D</h1>
        <h2>Interactive Telecom Training Application</h2>
        <p>
          Practice telecommunications procedures in a realistic, repeatable
          virtual laboratory built for technical education.
        </p>
        <button type="button" onClick={() => onEnterLab()}>
          Enter Telecom Lab
          <TelecomIcon name="arrow" size={18} />
        </button>
      </div>
      <div className="dashboard-signal-graphic" aria-hidden="true">
        <div className="signal-node signal-node-primary" />
        <div className="signal-node signal-node-secondary" />
        <div className="signal-node signal-node-tertiary" />
        <span className="signal-line signal-line-one" />
        <span className="signal-line signal-line-two" />
        <span className="signal-line signal-line-three" />
        <div className="signal-status">
          <small>Training Environment</small>
          <strong>Systems Ready</strong>
        </div>
      </div>
    </header>
  )
}
