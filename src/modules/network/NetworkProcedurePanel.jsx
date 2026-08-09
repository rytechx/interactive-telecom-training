import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import LogicalNetworkStatus from './LogicalNetworkStatus.jsx'
import { getNetworkCableConfig } from './networkCableConfigs.js'
import {
  getNetworkDeviceConfig,
  getNetworkPortConfig,
  NETWORK_REQUIRED_VERIFICATION_PORT_IDS,
} from './networkDeviceConfigs.js'
import {
  getNetworkProcedureStep,
  isLogicalNetworkStep,
  isNetworkCablingStep,
  isNetworkContinuationStep,
  isNetworkRestartableStep,
  NETWORK_PROCEDURE_STEPS,
  NETWORK_TOTAL_STEPS,
} from './networkProcedure.js'

export default function NetworkProcedurePanel({
  onContinue,
  onPowerOn,
  onRestartStep,
  onRestartModule,
  onExit,
}) {
  const networkCurrentStep = useNetworkTrainingStore(
    (state) => state.networkCurrentStep,
  )
  const procedureFeedback = useNetworkTrainingStore(
    (state) => state.procedureFeedback,
  )
  const isProcedureAnimating = useNetworkTrainingStore(
    (state) => state.isProcedureAnimating,
  )
  const selectedNetworkDeviceId = useNetworkTrainingStore(
    (state) => state.selectedNetworkDeviceId,
  )
  const selectedCableId = useNetworkTrainingStore(
    (state) => state.selectedCableId,
  )
  const selectedSourcePortId = useNetworkTrainingStore(
    (state) => state.selectedSourcePortId,
  )
  const selectedNetworkPortId = useNetworkTrainingStore(
    (state) => state.selectedNetworkPortId,
  )
  const hoveredNetworkLabel = useNetworkTrainingStore(
    (state) => state.hoveredNetworkLabel,
  )
  const patchPanelInstalled = useNetworkTrainingStore(
    (state) => state.patchPanelInstalled,
  )
  const switchInstalled = useNetworkTrainingStore(
    (state) => state.switchInstalled,
  )
  const routerInstalled = useNetworkTrainingStore(
    (state) => state.routerInstalled,
  )
  const routerPowerConnected = useNetworkTrainingStore(
    (state) => state.routerPowerConnected,
  )
  const switchPowerConnected = useNetworkTrainingStore(
    (state) => state.switchPowerConnected,
  )
  const patchSwitchConnected = useNetworkTrainingStore(
    (state) => state.patchSwitchConnected,
  )
  const switchRouterConnected = useNetworkTrainingStore(
    (state) => state.switchRouterConnected,
  )
  const pcSwitchConnected = useNetworkTrainingStore(
    (state) => state.pcSwitchConnected,
  )
  const networkPowered = useNetworkTrainingStore(
    (state) => state.networkPowered,
  )
  const verifiedLinkPortIds = useNetworkTrainingStore(
    (state) => state.verifiedLinkPortIds,
  )
  const physicalLinksVerified = useNetworkTrainingStore(
    (state) => state.physicalLinksVerified,
  )
  const procedureStep = getNetworkProcedureStep(networkCurrentStep)
  const selectedDevice = getNetworkDeviceConfig(selectedNetworkDeviceId)
  const selectedCable = getNetworkCableConfig(selectedCableId)
  const selectedSourcePort = getNetworkPortConfig(selectedSourcePortId)
  const selectedPort = getNetworkPortConfig(selectedNetworkPortId)
  const destinationPort = selectedCable
    ? getNetworkPortConfig(selectedCable.destinationPortId)
    : null
  const canContinue = isNetworkContinuationStep(networkCurrentStep)
  const isPhysicalComplete =
    networkCurrentStep ===
      NETWORK_PROCEDURE_STEPS.PHYSICAL_INSTALLATION_COMPLETE &&
    physicalLinksVerified
  const isLogicalStage = isLogicalNetworkStep(networkCurrentStep)
  const isCablingInteraction = isNetworkCablingStep(networkCurrentStep)
  const isLogicalComplete =
    networkCurrentStep ===
    NETWORK_PROCEDURE_STEPS.LOGICAL_CONFIGURATION_COMPLETE
  const hasError =
    procedureFeedback?.includes('Incorrect') ||
    procedureFeedback?.includes('cannot') ||
    procedureFeedback?.includes('not required') ||
    procedureFeedback?.includes('Select a power cable') ||
    procedureFeedback?.includes('already occupied') ||
    procedureFeedback?.includes('before startup') ||
    procedureFeedback?.includes('Invalid') ||
    procedureFeedback?.includes('incorrect') ||
    procedureFeedback?.includes('failed')
  const hasSuccess =
    procedureFeedback?.includes('installed') ||
    procedureFeedback?.includes('connected') ||
    procedureFeedback?.includes('LINK ACTIVE') ||
    procedureFeedback?.includes('PASS') ||
    procedureFeedback?.includes('successfully') ||
    procedureFeedback?.includes('complete') ||
    procedureFeedback?.includes('verified')

  return (
    <section
      className={`training-panel procedure-panel network-procedure-panel${
        isCablingInteraction ? ' is-cabling-compact' : ''
      }`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="network-procedure-title"
    >
      <span className="procedure-step-number">
        Step {procedureStep.stepNumber} of {NETWORK_TOTAL_STEPS}
      </span>
      <h1 id="network-procedure-title">
        Network Device Installation &amp; Troubleshooting
      </h1>
      <h2>{procedureStep.title}</h2>
      <p className="procedure-instruction">{procedureStep.instruction}</p>

      {(selectedDevice || selectedCable || selectedSourcePort || selectedPort) && (
        <dl className="network-selection-status">
          {selectedDevice && (
            <div>
              <dt>Selected Device</dt>
              <dd>{selectedDevice.shortName}</dd>
            </div>
          )}
          {selectedCable && (
            <div>
              <dt>Selected Cable</dt>
              <dd>{selectedCable.name}</dd>
            </div>
          )}
          {selectedSourcePort && (
            <div>
              <dt>Source Port</dt>
              <dd>{selectedSourcePort.name}</dd>
            </div>
          )}
          {destinationPort && (
            <div>
              <dt>Destination</dt>
              <dd>{destinationPort.name}</dd>
            </div>
          )}
          {!destinationPort && selectedPort && selectedPort.id !== selectedSourcePort?.id && (
            <div>
              <dt>Selected Port</dt>
              <dd>{selectedPort.name}</dd>
            </div>
          )}
        </dl>
      )}

      {hoveredNetworkLabel && (
        <p className="network-hover-status" role="status">
          <span>Hovering</span>
          <strong>{hoveredNetworkLabel}</strong>
        </p>
      )}

      {procedureFeedback && (
        <p
          className={`procedure-feedback${
            hasError ? ' is-error' : hasSuccess ? ' is-success' : ''
          }`}
          role="status"
        >
          {procedureFeedback}
        </p>
      )}

      <div className="network-installation-status" aria-label="Installation status">
        <span className={patchPanelInstalled ? 'is-complete' : ''}>
          Patch Panel <strong>{patchPanelInstalled ? 'RU 4' : 'PENDING'}</strong>
        </span>
        <span className={switchInstalled ? 'is-complete' : ''}>
          Managed Switch <strong>{switchInstalled ? 'RU 5' : 'PENDING'}</strong>
        </span>
        <span className={routerInstalled ? 'is-complete' : ''}>
          Router <strong>{routerInstalled ? 'RU 6' : 'PENDING'}</strong>
        </span>
      </div>

      {(networkCurrentStep === NETWORK_PROCEDURE_STEPS.CONNECT_POWER ||
        networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWER_CONNECTED ||
        networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK ||
        networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK ||
        networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_LINKS ||
        isPhysicalComplete ||
        isLogicalStage) && (
        <div
          className="network-power-status network-device-power-status"
          aria-label="Network power status"
        >
          <span>
            Router Power
            <strong className={networkPowered || routerPowerConnected ? 'is-connected' : ''}>
              {networkPowered
                ? 'ON'
                : routerPowerConnected
                  ? 'CONNECTED'
                  : 'NOT CONNECTED'}
            </strong>
          </span>
          <span>
            Switch Power
            <strong className={networkPowered || switchPowerConnected ? 'is-connected' : ''}>
              {networkPowered
                ? 'ON'
                : switchPowerConnected
                  ? 'CONNECTED'
                  : 'NOT CONNECTED'}
            </strong>
          </span>
        </div>
      )}

      {(patchSwitchConnected || switchRouterConnected || pcSwitchConnected) && (
        <div className="network-power-status" aria-label="Ethernet cabling status">
          <span>
            Patch Panel → Switch
            <strong>{patchSwitchConnected ? 'CONNECTED' : 'PENDING'}</strong>
          </span>
          <span>
            Switch → Router
            <strong>{switchRouterConnected ? 'CONNECTED' : 'PENDING'}</strong>
          </span>
          <span>
            PC → Switch
            <strong>{pcSwitchConnected ? 'CONNECTED' : 'PENDING'}</strong>
          </span>
        </div>
      )}

      {(networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_LINKS ||
        isPhysicalComplete) && (
        <div className="network-link-verification">
          <strong>Physical Link Verification</strong>
          {NETWORK_REQUIRED_VERIFICATION_PORT_IDS.map((portId) => (
            <span
              key={portId}
              className={
                verifiedLinkPortIds.includes(portId) ? 'is-complete' : ''
              }
            >
              {getNetworkPortConfig(portId)?.name}
              <b>
                {verifiedLinkPortIds.includes(portId) ? 'LINK' : 'INSPECT'}
              </b>
            </span>
          ))}
        </div>
      )}

      {isPhysicalComplete && (
        <div className="network-completion-summary" role="status">
          <strong>PHYSICAL NETWORK STATUS</strong>
          <span>Router Power: ON</span>
          <span>Switch Power: ON</span>
          <span>Patch Panel → Switch: CONNECTED</span>
          <span>Switch → Router: CONNECTED</span>
          <span>PC → Switch: CONNECTED</span>
          <span>Link Indicators: ACTIVE</span>
          <b>PHYSICAL INSTALLATION PASS</b>
          <p>
            Next Training Stage: Configure IP addressing and network devices.
          </p>
        </div>
      )}

      {isLogicalStage && <LogicalNetworkStatus />}

      {isLogicalComplete && (
        <div className="network-completion-summary" role="status">
          <strong>LOGICAL NETWORK CONFIGURATION</strong>
          <span>Workstation IPv4: PASS</span>
          <span>Router Interface: PASS</span>
          <span>Switch Management: PASS</span>
          <span>PC → Router: PASS</span>
          <span>PC → Switch: PASS</span>
          <b>NETWORK CONFIGURATION PASS</b>
          <p>
            Network devices are physically and logically configured correctly.
          </p>
          <p>Next Training Stage: Diagnose and troubleshoot network faults.</p>
        </div>
      )}

      {canContinue && (
        <div className="training-actions procedure-primary-actions">
          <button
            type="button"
            onClick={onContinue}
            disabled={isProcedureAnimating}
          >
            {networkCurrentStep ===
            NETWORK_PROCEDURE_STEPS.PHYSICAL_INSTALLATION_COMPLETE
              ? 'Continue to Network Configuration'
              : networkCurrentStep === NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS
                ? 'View Results'
                : 'Continue'}
          </button>
        </div>
      )}

      {networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWER_ON_NETWORK && (
        <div className="training-actions procedure-primary-actions">
          <button
            type="button"
            onClick={onPowerOn}
            disabled={isProcedureAnimating}
          >
            Power On Network
          </button>
        </div>
      )}

      <div className="training-actions procedure-secondary-actions">
        {isNetworkRestartableStep(networkCurrentStep) && (
          <button
            type="button"
            className="secondary"
            onClick={onRestartStep}
            disabled={isProcedureAnimating}
          >
            Restart Step
          </button>
        )}
        <button
          type="button"
          className="secondary"
          onClick={onRestartModule}
          disabled={isProcedureAnimating}
        >
          Restart Module
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onExit}
          disabled={isProcedureAnimating}
        >
          Exit
        </button>
      </div>
    </section>
  )
}
