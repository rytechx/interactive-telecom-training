export default function LandingNetworkVisual() {
  return (
    <div className="landing-network-visual" aria-hidden="true">
      <div className="landing-visual-status">
        <span><i /> Virtual Lab Online</span>
        <strong>NETWORK TRAINING ENVIRONMENT</strong>
      </div>

      <div className="landing-network-grid">
        <span className="landing-network-line line-one" />
        <span className="landing-network-line line-two" />
        <span className="landing-network-line line-three" />
        <i className="landing-network-node node-one" />
        <i className="landing-network-node node-two" />
        <i className="landing-network-node node-three" />
        <i className="landing-network-node node-four" />

        <div className="landing-rack">
          <div className="landing-rack-heading">
            <span>TELESIM / RACK 01</span>
            <i />
          </div>
          <div className="landing-rack-unit is-switch">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="landing-rack-unit is-router">
            <strong>CORE</strong>
            <span />
            <span />
            <i />
          </div>
          <div className="landing-rack-unit is-panel">
            {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
          </div>
          <div className="landing-rack-footer">
            <span>LINK</span>
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="landing-signal-card signal-one">
          <span>01</span>
          <strong>COPPER</strong>
          <i />
        </div>
        <div className="landing-signal-card signal-two">
          <span>02</span>
          <strong>FIBER</strong>
          <i />
        </div>
        <div className="landing-signal-card signal-three">
          <span>03</span>
          <strong>NETWORK</strong>
          <i />
        </div>
      </div>

      <div className="landing-visual-metrics">
        <span><strong>3</strong> Practical Workstations</span>
        <span><strong>6</strong> Core Skill Areas</span>
        <span><strong>LIVE</strong> Guided Assessment</span>
      </div>
    </div>
  )
}
