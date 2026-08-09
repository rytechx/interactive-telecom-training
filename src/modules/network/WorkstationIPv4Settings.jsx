import { useState } from 'react'
import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'

export default function WorkstationIPv4Settings() {
  const workstationIp = useNetworkTrainingStore((state) => state.workstationIp)
  const workstationMask = useNetworkTrainingStore(
    (state) => state.workstationMask,
  )
  const workstationGateway = useNetworkTrainingStore(
    (state) => state.workstationGateway,
  )
  const [ipAddress, setIpAddress] = useState(workstationIp)
  const [subnetMask, setSubnetMask] = useState(workstationMask)
  const [defaultGateway, setDefaultGateway] = useState(workstationGateway)
  const settingsFeedback = useNetworkTrainingStore(
    (state) => state.settingsFeedback,
  )
  const settingsFeedbackType = useNetworkTrainingStore(
    (state) => state.settingsFeedbackType,
  )
  const applyWorkstationIPv4 = useNetworkTrainingStore(
    (state) => state.applyWorkstationIPv4,
  )
  const closeNetworkOverlay = useNetworkTrainingStore(
    (state) => state.closeNetworkOverlay,
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    applyWorkstationIPv4({ ipAddress, subnetMask, defaultGateway })
  }

  return (
    <section
      className="network-settings-window"
      role="dialog"
      aria-modal="false"
      aria-labelledby="network-settings-title"
    >
      <header className="network-window-header">
        <div>
          <span>Ethernet Adapter</span>
          <h2 id="network-settings-title">IPv4 Properties</h2>
        </div>
        <button
          type="button"
          className="network-window-close"
          onClick={closeNetworkOverlay}
          aria-label="Close IPv4 settings"
        >
          ×
        </button>
      </header>

      <p className="network-settings-intro">
        Enter the static IPv4 configuration specified by the training topology.
      </p>

      <form className="network-settings-form" onSubmit={handleSubmit}>
        <label>
          <span>IP Address</span>
          <input
            type="text"
            inputMode="decimal"
            value={ipAddress}
            onChange={(event) => setIpAddress(event.target.value)}
            placeholder="192.168.x.x"
            autoComplete="off"
            autoFocus
          />
        </label>
        <label>
          <span>Subnet Mask</span>
          <input
            type="text"
            inputMode="decimal"
            value={subnetMask}
            onChange={(event) => setSubnetMask(event.target.value)}
            placeholder="255.255.x.x"
            autoComplete="off"
          />
        </label>
        <label>
          <span>Default Gateway</span>
          <input
            type="text"
            inputMode="decimal"
            value={defaultGateway}
            onChange={(event) => setDefaultGateway(event.target.value)}
            placeholder="192.168.x.x"
            autoComplete="off"
          />
        </label>

        {settingsFeedback && (
          <p
            className={`network-settings-feedback is-${settingsFeedbackType}`}
            role="status"
          >
            {settingsFeedback}
          </p>
        )}

        <div className="network-window-actions">
          <button type="submit">Apply</button>
          <button type="button" className="secondary" onClick={closeNetworkOverlay}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}
