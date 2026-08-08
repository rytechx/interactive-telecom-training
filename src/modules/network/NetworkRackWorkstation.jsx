import { Html } from '@react-three/drei'
import { useEffect } from 'react'
import NetworkRack from '../../objects/telecom/NetworkRack.jsx'
import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import NetworkCable from './NetworkCable.jsx'
import NetworkDevice from './NetworkDevice.jsx'
import NetworkPort from './NetworkPort.jsx'
import {
  NETWORK_CABLE_CONFIGS,
  NETWORK_CABLE_IDS,
} from './networkCableConfigs.js'
import {
  NETWORK_DEVICE_CONFIGS,
  NETWORK_DEVICE_IDS,
  NETWORK_PORTS,
  NETWORK_PORT_TYPES,
  NETWORK_RACK_CONFIG,
  NETWORK_RACK_SLOTS,
  PDU_PORTS,
} from './networkDeviceConfigs.js'
import { NETWORK_PROCEDURE_STEPS } from './networkProcedure.js'

const selectionStepDeviceIds = Object.freeze({
  [NETWORK_PROCEDURE_STEPS.SELECT_PATCH_PANEL]:
    NETWORK_DEVICE_IDS.PATCH_PANEL,
  [NETWORK_PROCEDURE_STEPS.SELECT_SWITCH]:
    NETWORK_DEVICE_IDS.MANAGED_SWITCH,
  [NETWORK_PROCEDURE_STEPS.SELECT_ROUTER]: NETWORK_DEVICE_IDS.ROUTER,
})

const installationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.INSTALL_PATCH_PANEL,
  NETWORK_PROCEDURE_STEPS.INSTALL_SWITCH,
  NETWORK_PROCEDURE_STEPS.INSTALL_ROUTER,
])

const powerConnectionSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONNECT_POWER,
  NETWORK_PROCEDURE_STEPS.POWER_CONNECTED,
])

const cableSelectionStepIds = Object.freeze({
  [NETWORK_PROCEDURE_STEPS.CONNECT_PATCH_TO_SWITCH]: Object.freeze([
    NETWORK_CABLE_IDS.PATCH_TO_SWITCH,
  ]),
  [NETWORK_PROCEDURE_STEPS.CONNECT_SWITCH_TO_ROUTER]: Object.freeze([
    NETWORK_CABLE_IDS.SWITCH_TO_ROUTER,
  ]),
  [NETWORK_PROCEDURE_STEPS.CONNECT_PC_TO_SWITCH]: Object.freeze([
    NETWORK_CABLE_IDS.PC_TO_SWITCH,
  ]),
  [NETWORK_PROCEDURE_STEPS.CONNECT_POWER]: Object.freeze([
    NETWORK_CABLE_IDS.ROUTER_POWER,
    NETWORK_CABLE_IDS.SWITCH_POWER,
  ]),
})

function PreparationCart({ showLabel = false }) {
  const shelfHeights = [0.28, 0.58, 0.88]

  return (
    <group position={[1.82, 0, 0.42]}>
      {shelfHeights.map((shelfY) => (
        <mesh key={shelfY} position={[0, shelfY, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.95, 0.07, 1.05]} />
          <meshStandardMaterial color="#555f65" metalness={0.5} roughness={0.55} />
        </mesh>
      ))}
      {[-0.88, 0.88].flatMap((positionX) =>
        [-0.44, 0.44].map((positionZ) => (
          <mesh
            key={`${positionX}-${positionZ}`}
            position={[positionX, 0.46, positionZ]}
            castShadow
          >
            <boxGeometry args={[0.07, 0.92, 0.07]} />
            <meshStandardMaterial color="#30383d" metalness={0.55} roughness={0.5} />
          </mesh>
        )),
      )}
      {showLabel && (
        <Html position={[0, 1.28, 0.1]} center>
          <span className="network-prep-label">Equipment Preparation</span>
        </Html>
      )}
    </group>
  )
}

function PowerPreparationTray({ visible }) {
  if (!visible) {
    return null
  }

  return (
    <group>
      <mesh position={[1.82, 0.96, 0.72]} castShadow receiveShadow>
        <boxGeometry args={[1.95, 0.06, 0.9]} />
        <meshStandardMaterial color="#7a878d" metalness={0.08} roughness={0.82} />
      </mesh>
      <mesh position={[1.82, 0.997, 0.72]} receiveShadow>
        <boxGeometry args={[0.025, 0.018, 0.82]} />
        <meshStandardMaterial color="#d6e1e5" roughness={0.72} />
      </mesh>
      <Html position={[1.82, 1.27, 0.32]} center>
        <span className="network-power-tray-label">POWER LEADS</span>
      </Html>
    </group>
  )
}

function RackPdu({
  interactivePortIds,
  hoveredObjectId,
  selectedPortId,
  onHover,
  onHoverEnd,
  onSelectPort,
}) {
  return (
    <group>
      <mesh position={[1.04, 0.96, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.17, 1.35, 0.25]} />
        <meshStandardMaterial color="#252c31" metalness={0.6} roughness={0.48} />
      </mesh>
      <mesh position={[1.04, 0.96, 0.155]}>
        <boxGeometry args={[0.12, 1.24, 0.018]} />
        <meshStandardMaterial color="#11171a" metalness={0.44} roughness={0.58} />
      </mesh>
      <Html position={[1.04, 1.72, 0.16]} center>
        <span className="network-power-port-label">RACK PDU</span>
      </Html>
      {PDU_PORTS.map((port) => (
        <NetworkPort
          key={port.id}
          port={port}
          isInteractive={interactivePortIds.includes(port.id)}
          isHovered={hoveredObjectId === port.id}
          isSelected={selectedPortId === port.id}
          onPointerEnter={(hoveredPort) =>
            onHover(hoveredPort.id, hoveredPort.name)
          }
          onPointerLeave={(hoveredPort) => onHoverEnd(hoveredPort.id)}
          onSelect={onSelectPort}
        />
      ))}
    </group>
  )
}

export default function NetworkRackWorkstation({
  position,
  hoveredObjectId,
  onHoveredObjectChange,
}) {
  const networkCurrentStep = useNetworkTrainingStore(
    (state) => state.networkCurrentStep,
  )
  const networkTrainingStarted = useNetworkTrainingStore(
    (state) => state.networkTrainingStarted,
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
  const networkPowered = useNetworkTrainingStore(
    (state) => state.networkPowered,
  )
  const powerOnStartedAt = useNetworkTrainingStore(
    (state) => state.powerOnStartedAt,
  )
  const selectedNetworkDeviceId = useNetworkTrainingStore(
    (state) => state.selectedNetworkDeviceId,
  )
  const selectedCableId = useNetworkTrainingStore(
    (state) => state.selectedCableId,
  )
  const selectedNetworkPortId = useNetworkTrainingStore(
    (state) => state.selectedNetworkPortId,
  )
  const activeInstallationDeviceId = useNetworkTrainingStore(
    (state) => state.activeInstallationDeviceId,
  )
  const activeConnectionId = useNetworkTrainingStore(
    (state) => state.activeConnectionId,
  )
  const networkConnections = useNetworkTrainingStore(
    (state) => state.networkConnections,
  )
  const portOccupancy = useNetworkTrainingStore(
    (state) => state.portOccupancy,
  )
  const inspectNetworkRack = useNetworkTrainingStore(
    (state) => state.inspectNetworkRack,
  )
  const selectNetworkDevice = useNetworkTrainingStore(
    (state) => state.selectNetworkDevice,
  )
  const selectNetworkRackSlot = useNetworkTrainingStore(
    (state) => state.selectNetworkRackSlot,
  )
  const completeNetworkDeviceInstallation = useNetworkTrainingStore(
    (state) => state.completeNetworkDeviceInstallation,
  )
  const selectNetworkCable = useNetworkTrainingStore(
    (state) => state.selectNetworkCable,
  )
  const selectNetworkPort = useNetworkTrainingStore(
    (state) => state.selectNetworkPort,
  )
  const completeNetworkConnection = useNetworkTrainingStore(
    (state) => state.completeNetworkConnection,
  )
  const completeNetworkPowerOn = useNetworkTrainingStore(
    (state) => state.completeNetworkPowerOn,
  )
  const verifyNetworkLinkPort = useNetworkTrainingStore(
    (state) => state.verifyNetworkLinkPort,
  )
  const setHoveredNetworkObject = useNetworkTrainingStore(
    (state) => state.setHoveredNetworkObject,
  )
  const clearHoveredNetworkObject = useNetworkTrainingStore(
    (state) => state.clearHoveredNetworkObject,
  )
  const isPoweringOn =
    networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK
  const selectedCable = NETWORK_CABLE_CONFIGS.find(
    (cable) => cable.id === selectedCableId,
  )
  const isPowerConnectionStep = powerConnectionSteps.includes(
    networkCurrentStep,
  )
  const ethernetPortIds = Object.values(NETWORK_PORTS)
    .filter((port) => port.type === NETWORK_PORT_TYPES.ETHERNET)
    .map((port) => port.id)
  const interactivePortIds = selectedCable
    ? Object.values(NETWORK_PORTS)
        .filter((port) => port.type === selectedCable.type)
        .map((port) => port.id)
    : networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_LINKS
      ? ethernetPortIds
      : []
  const activeLinkPortIds = Object.keys(portOccupancy)
  const selectableCableIds = cableSelectionStepIds[networkCurrentStep] ?? []
  const selectedStepDeviceId = selectionStepDeviceIds[networkCurrentStep]
  const isSelectingDevice = Boolean(selectedStepDeviceId)
  const isInstallingDevice = installationSteps.includes(networkCurrentStep)
  const installedByDeviceId = {
    [NETWORK_DEVICE_IDS.PATCH_PANEL]: patchPanelInstalled,
    [NETWORK_DEVICE_IDS.MANAGED_SWITCH]: switchInstalled,
    [NETWORK_DEVICE_IDS.ROUTER]: routerInstalled,
    [NETWORK_DEVICE_IDS.WORKSTATION_PC]: true,
  }

  useEffect(() => {
    if (!isPoweringOn || !powerOnStartedAt) {
      return undefined
    }

    const timeoutId = window.setTimeout(completeNetworkPowerOn, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [completeNetworkPowerOn, isPoweringOn, powerOnStartedAt])

  const handleHover = (objectId, label) => {
    setHoveredNetworkObject(objectId, label)
    onHoveredObjectChange?.(objectId)
  }

  const handleHoverEnd = (objectId) => {
    clearHoveredNetworkObject(objectId)
    if (hoveredObjectId === objectId) {
      onHoveredObjectChange?.(null)
    }
  }

  const handleRackInspect = (event) => {
    if (networkCurrentStep !== NETWORK_PROCEDURE_STEPS.INSPECT_RACK) {
      return
    }

    event.stopPropagation()
    inspectNetworkRack()
  }

  return (
    <group position={position}>
      <NetworkRack
        width={NETWORK_RACK_CONFIG.width}
        height={NETWORK_RACK_CONFIG.height}
        depth={NETWORK_RACK_CONFIG.depth}
      >
        {Object.values(NETWORK_DEVICE_CONFIGS).map((device) => (
          <NetworkDevice
            key={device.id}
            config={device}
            installed={installedByDeviceId[device.id]}
            installing={activeInstallationDeviceId === device.id}
            selected={selectedNetworkDeviceId === device.id}
            canSelect={
              isSelectingDevice && device.type === 'rack-device'
            }
            powered={
              (networkPowered || isPoweringOn) &&
              (device.id === NETWORK_DEVICE_IDS.ROUTER
                ? routerPowerConnected
                : device.id === NETWORK_DEVICE_IDS.MANAGED_SWITCH
                  ? switchPowerConnected
                  : device.id === NETWORK_DEVICE_IDS.WORKSTATION_PC)
            }
            networkPowered={networkPowered || isPoweringOn}
            powerOnStartedAt={powerOnStartedAt}
            activeLinkPortIds={activeLinkPortIds}
            interactivePortIds={interactivePortIds}
            hoveredObjectId={hoveredObjectId}
            selectedPortId={selectedNetworkPortId}
            showLabel={networkTrainingStarted}
            onHover={handleHover}
            onHoverEnd={handleHoverEnd}
            onSelectDevice={selectNetworkDevice}
            onSelectPort={
              networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_LINKS
                ? verifyNetworkLinkPort
                : selectNetworkPort
            }
            onInstallationComplete={completeNetworkDeviceInstallation}
          />
        ))}

        <RackPdu
          interactivePortIds={interactivePortIds}
          hoveredObjectId={hoveredObjectId}
          selectedPortId={selectedNetworkPortId}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          onSelectPort={selectNetworkPort}
        />

        {NETWORK_RACK_SLOTS.map((slot) => {
          const selectedDevice = NETWORK_DEVICE_CONFIGS[slot.expectedDeviceId]
          const isExpected =
            isInstallingDevice &&
            selectedNetworkDeviceId === slot.expectedDeviceId
          const isOccupied = installedByDeviceId[slot.expectedDeviceId]
          const isSlotHovered = hoveredObjectId === slot.id

          return (
            <group key={slot.id} visible={!isOccupied}>
              <mesh
                position={slot.position}
                onPointerEnter={(event) => {
                  if (!isInstallingDevice) {
                    return
                  }

                  event.stopPropagation()
                  handleHover(
                    slot.id,
                    isExpected
                      ? `Install ${selectedDevice.shortName}`
                      : slot.label,
                  )
                }}
                onPointerLeave={(event) => {
                  event.stopPropagation()
                  handleHoverEnd(slot.id)
                }}
                onClick={(event) => {
                  if (!isInstallingDevice) {
                    return
                  }

                  event.stopPropagation()
                  selectNetworkRackSlot(slot.id)
                }}
              >
                <boxGeometry args={[1.8, 0.24, 0.12]} />
                <meshStandardMaterial
                  color={isExpected ? '#64c8e7' : '#44525a'}
                  emissive={isExpected ? '#2e8bad' : '#000000'}
                  emissiveIntensity={isExpected ? 0.55 : 0}
                  transparent
                  opacity={isExpected ? 0.55 : isSlotHovered ? 0.25 : 0.06}
                  depthWrite={false}
                />
              </mesh>
              {isSlotHovered && (
                <Html position={[slot.position[0], slot.position[1] + 0.22, 0.62]} center>
                  <div className="network-object-tooltip" role="tooltip">
                    {isExpected
                      ? `Install ${selectedDevice.shortName}`
                      : slot.label}
                  </div>
                </Html>
              )}
            </group>
          )
        })}

        {NETWORK_CABLE_CONFIGS.map((cable) => {
          const connection = networkConnections.find(
            (item) => item.id === cable.id,
          )
          const isPowerCable = cable.type === NETWORK_PORT_TYPES.POWER
          const isWrongCableCandidate =
            isPowerConnectionStep &&
            cable.type === NETWORK_PORT_TYPES.ETHERNET &&
            !connection?.connected

          if (isPowerCable && !connection?.connected && !isPowerConnectionStep) {
            return null
          }

          return (
            <NetworkCable
              key={cable.id}
              config={cable}
              connected={connection?.connected}
              connecting={activeConnectionId === cable.id}
              selected={selectedCableId === cable.id}
              canSelect={
                networkTrainingStarted &&
                selectableCableIds.includes(cable.id) &&
                !connection?.connected
              }
              canReject={networkTrainingStarted && isWrongCableCandidate}
              muted={isPowerConnectionStep && !isPowerCable}
              hoveredObjectId={hoveredObjectId}
              onHover={handleHover}
              onHoverEnd={handleHoverEnd}
              onSelect={selectNetworkCable}
              onConnectionComplete={completeNetworkConnection}
            />
          )
        })}

        <mesh
          position={[0, NETWORK_RACK_CONFIG.height / 2, 0.22]}
          onPointerEnter={(event) => {
            if (networkCurrentStep !== NETWORK_PROCEDURE_STEPS.INSPECT_RACK) {
              return
            }

            event.stopPropagation()
            handleHover('network-rack-inspection', 'Inspect Network Rack')
          }}
          onPointerLeave={(event) => {
            event.stopPropagation()
            handleHoverEnd('network-rack-inspection')
          }}
          onClick={handleRackInspect}
        >
          <boxGeometry
            args={[
              NETWORK_RACK_CONFIG.width,
              NETWORK_RACK_CONFIG.height,
              0.34,
            ]}
          />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </NetworkRack>

      <PreparationCart showLabel={networkTrainingStarted} />
      <PowerPreparationTray visible={isPowerConnectionStep} />

      <pointLight
        position={[0.4, 3.1, 1.8]}
        color="#edf9ff"
        intensity={networkTrainingStarted ? 1.8 : 0}
        distance={5}
        decay={2}
      />
    </group>
  )
}
