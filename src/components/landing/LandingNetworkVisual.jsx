export default function LandingNetworkVisual() {
  return (
    <div
      className="landing-network-visual"
      role="img"
      aria-label="TeleSim training environment showing copper, fiber, networking, and diagnostic systems online"
    >
      <div className="landing-console-header">
        <div>
          <span>TeleSim</span>
          <strong>Training Environment</strong>
        </div>
        <span className="landing-console-online"><i /> Virtual Lab Online</span>
      </div>

      <div className="landing-console-body">
        <div className="landing-console-topology">
          <svg viewBox="0 0 380 240" aria-hidden="true">
            <path className="path-copper" d="M40 52 C118 52 110 116 188 116" />
            <path className="path-fiber" d="M40 188 C118 188 110 124 188 124" />
            <path className="path-network" d="M238 116 C298 116 292 55 344 55" />
            <path className="path-diagnostic" d="M238 124 C298 124 292 185 344 185" />
            <circle className="landing-console-pulse pulse-one" cx="91" cy="65" r="4" />
            <circle className="landing-console-pulse pulse-two" cx="292" cy="95" r="4" />
          </svg>

          <span className="landing-topology-node node-copper"><i /> RJ45</span>
          <span className="landing-topology-node node-fiber"><i /> Optical</span>
          <span className="landing-topology-node node-network"><i /> Switch</span>
          <span className="landing-topology-node node-diagnostic"><i /> Test</span>

          <div className="landing-rack">
            <div className="landing-rack-heading">
              <span>Rack / Core 01</span>
              <i />
            </div>
            <div className="landing-rack-unit is-switch">
              {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
            </div>
            <div className="landing-rack-unit is-router">
              <strong>RTR</strong>
              <span />
              <span />
              <i />
            </div>
            <div className="landing-rack-unit is-panel">
              {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
            </div>
            <div className="landing-rack-footer">
              <span>Signal Path</span>
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>

        <div className="landing-console-channels">
          <div><span>Copper</span><strong>RJ45 / Ethernet</strong><i /></div>
          <div><span>Fiber</span><strong>Fusion / Optical Link</strong><i /></div>
          <div><span>Network</span><strong>Router / Switch</strong><i /></div>
          <div><span>Diagnostics</span><strong>Fault Isolation</strong><i /></div>
        </div>
      </div>

      <div className="landing-console-footer">
        <span><i /> Signal Paths Nominal</span>
        <span><i /> Guidance Ready</span>
        <strong>TS-NOC / ONLINE</strong>
      </div>
    </div>
  )
}
