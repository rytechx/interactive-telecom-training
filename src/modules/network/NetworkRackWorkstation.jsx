import { Html } from '@react-three/drei'
import { useEffect } from 'react'
import NetworkRack from '../../objects/telecom/NetworkRack.jsx'
import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import NetworkCable from './NetworkCable.jsx'
import NetworkDevice from './NetworkDevice.jsx'
import NetworkPort from './NetworkPort.jsx'
import NetworkWorkstationMonitor from './NetworkWorkstationMonitor.jsx'
import {
  getActiveNetworkLinkPortIds,
  isRouterPowered,
  isSwitchPowered,
} from './networkConnectivity.js'
import {
  NETWORK_CABLE_CONFIGS,
  NETWORK_CABLE_IDS,
} from './networkCableConfigs.js'
import {
  NETWORK_DEVICE_CONFIGS,
  NETWORK_DEVICE_IDS,
  NETWORK_PORTS,
  NETWORK_PORT_TYPES,
  NETWORK_PDU_CONFIG,
  NETWORK_RACK_CONFIG,
  NETWORK_RACK_SLOTS,
  NETWORK_REQUIRED_VERIFICATION_PORT_IDS,
  PDU_PORTS,
} from './networkDeviceConfigs.js'
import { NETWORK_PROCEDURE_STEPS } from './networkProcedure.js'
import {
  getTroubleshootingScenario,
  NETWORK_TROUBLESHOOTING_MODES,
} from './troubleshooting/troubleshootingScenarios.js'
import { NETWORK_WORKSTATION_LAYOUT } from './networkWorkstationLayout.js'

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

const routerConfigurationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.OPEN_ROUTER_CLI,
  NETWORK_PROCEDURE_STEPS.CONFIGURE_ROUTER,
])

const switchConfigurationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.OPEN_SWITCH_CLI,
  NETWORK_PROCEDURE_STEPS.CONFIGURE_SWITCH,
])

const workstationConfigurationSteps = Object.freeze([
  NETWORK_PROCEDURE_STEPS.CONFIGURE_PC_IPV4,
  NETWORK_PROCEDURE_STEPS.VERIFY_PC_CONFIG,
  NETWORK_PROCEDURE_STEPS.PC_CONFIG_VERIFIED,
  NETWORK_PROCEDURE_STEPS.PING_ROUTER,
  NETWORK_PROCEDURE_STEPS.ROUTER_PING_PASS,
  NETWORK_PROCEDURE_STEPS.PING_SWITCH,
  NETWORK_PROCEDURE_STEPS.SWITCH_PING_PASS,
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

function PreparationBench({ showLabels = false }) {
  const {
    preparationBenchDepth,
    preparationBenchHeight,
    preparationBenchLegOffsetX,
    preparationBenchLegOffsetZ,
    preparationBenchPosition,
    preparationBenchTopThickness,
    preparationBenchWidth,
    preparationZoneMarkings,
  } = NETWORK_WORKSTATION_LAYOUT
  const legHeight = preparationBenchHeight - preparationBenchTopThickness

  return (
    <group position={preparationBenchPosition}>
      <mesh
        position={[0, preparationBenchHeight - preparationBenchTopThickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            preparationBenchWidth,
            preparationBenchTopThickness,
            preparationBenchDepth,
          ]}
        />
        <meshStandardMaterial color="#778287" metalness={0.28} roughness={0.62} />
      </mesh>

      {preparationZoneMarkings.map((zone) => (
        <mesh key={zone.id} position={zone.position} receiveShadow>
          <boxGeometry args={zone.dimensions} />
          <meshStandardMaterial color={zone.color} metalness={0.08} roughness={0.82} />
        </mesh>
      ))}

      {[-preparationBenchLegOffsetX, preparationBenchLegOffsetX].flatMap(
        (positionX) =>
          [-preparationBenchLegOffsetZ, preparationBenchLegOffsetZ].map((positionZ) => (
          <mesh
            key={`${positionX}-${positionZ}`}
            position={[positionX, legHeight / 2, positionZ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.09, legHeight, 0.09]} />
            <meshStandardMaterial
              color="#465158"
              metalness={0.58}
              roughness={0.48}
            />
          </mesh>
          )),
      )}

      <mesh position={[0, 0.4, -0.68]} castShadow receiveShadow>
        <boxGeometry args={[preparationBenchWidth - 0.2, 0.08, 0.08]} />
        <meshStandardMaterial color="#4c585e" metalness={0.52} roughness={0.5} />
      </mesh>

      {showLabels && preparationZoneMarkings.map((zone) => (
        <Html
          key={`${zone.id}-label`}
          position={[zone.position[0], 0.76, 0.92]}
          center
          zIndexRange={[2, 0]}
        >
          <span className="network-bench-zone-label">{zone.label}</span>
        </Html>
      ))}
    </group>
  )
}

function RackCableManagement() {
  return (
    <group>
      <mesh position={NETWORK_WORKSTATION_LAYOUT.rackCableGuidePosition} receiveShadow>
        <boxGeometry args={[0.13, 2.18, 0.1]} />
        <meshStandardMaterial color="#56636a" metalness={0.62} roughness={0.46} />
      </mesh>
      <mesh
        position={NETWORK_WORKSTATION_LAYOUT.rackHorizontalManagerPosition}
        receiveShadow
      >
        <boxGeometry args={[1.5, 0.09, 0.11]} />
        <meshStandardMaterial color="#4b585f" metalness={0.58} roughness={0.5} />
      </mesh>
    </group>
  )
}

function WorkstationDesk() {
  const {
    workstationDeskDepth,
    workstationDeskHeight,
    workstationDeskLegInset,
    workstationDeskLegThickness,
    workstationDeskPosition,
    workstationDeskTopThickness,
    workstationDeskWidth,
  } = NETWORK_WORKSTATION_LAYOUT
  const legHeight = workstationDeskHeight - workstationDeskTopThickness
  const legOffsetX = workstationDeskWidth / 2 - workstationDeskLegInset
  const legOffsetZ = workstationDeskDepth / 2 - workstationDeskLegInset

  return (
    <group position={workstationDeskPosition}>
      <mesh
        position={[
          0,
          workstationDeskHeight - workstationDeskTopThickness / 2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            workstationDeskWidth,
            workstationDeskTopThickness,
            workstationDeskDepth,
          ]}
        />
        <meshStandardMaterial color="#69767c" metalness={0.34} roughness={0.6} />
      </mesh>
      {[-legOffsetX, legOffsetX].flatMap((positionX) =>
        [-legOffsetZ, legOffsetZ].map((positionZ) => (
          <mesh
            key={`${positionX}-${positionZ}`}
            position={[positionX, legHeight / 2, positionZ]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                workstationDeskLegThickness,
                legHeight,
                workstationDeskLegThickness,
              ]}
            />
            <meshStandardMaterial
              color="#465158"
              metalness={0.48}
              roughness={0.52}
            />
          </mesh>
        )),
      )}
    </group>
  )
}

function WorkstationCableRaceway() {
  const {
    workstationDeskRacewayDimensions,
    workstationDeskRacewayPosition,
    workstationRacewayClipPositions,
    workstationRacewayDimensions,
    workstationRacewayPosition,
  } = NETWORK_WORKSTATION_LAYOUT

  return (
    <group>
      <mesh position={workstationDeskRacewayPosition} receiveShadow>
        <boxGeometry args={workstationDeskRacewayDimensions} />
        <meshStandardMaterial color="#47545a" metalness={0.46} roughness={0.54} />
      </mesh>
      <mesh position={workstationRacewayPosition} receiveShadow>
        <boxGeometry args={workstationRacewayDimensions} />
        <meshStandardMaterial color="#47545a" metalness={0.46} roughness={0.54} />
      </mesh>
      {workstationRacewayClipPositions.map((clipPosition) => (
        <mesh key={clipPosition.join('-')} position={clipPosition}>
          <boxGeometry args={[0.06, 0.035, 0.22]} />
          <meshStandardMaterial color="#77858b" metalness={0.58} roughness={0.46} />
        </mesh>
      ))}
      {[0.25, 0.85, 1.45].map((positionZ) => (
        <mesh key={positionZ} position={[-4.33, 0.12, positionZ]}>
          <boxGeometry args={[0.22, 0.035, 0.06]} />
          <meshStandardMaterial color="#77858b" metalness={0.58} roughness={0.46} />
        </mesh>
      ))}
    </group>
  )
}

function RackPdu({
  networkPowered,
  interactivePortIds,
  hoveredObjectId,
  selectedPortId,
  targetPortId,
  onHover,
  onHoverEnd,
  onSelectPort,
}) {
  return (
    <group>
      {NETWORK_PDU_CONFIG.mountingBracketPositions.map((bracketPosition) => (
        <mesh
          key={bracketPosition.join('-')}
          position={bracketPosition}
          castShadow
          receiveShadow
        >
          <boxGeometry args={NETWORK_PDU_CONFIG.mountingBracketDimensions} />
          <meshStandardMaterial
            color="#465158"
            metalness={0.64}
            roughness={0.46}
          />
        </mesh>
      ))}
      <mesh
        position={NETWORK_PDU_CONFIG.position}
        rotation={NETWORK_PDU_CONFIG.rotation}
        castShadow
        receiveShadow
      >
        <boxGeometry args={NETWORK_PDU_CONFIG.dimensions} />
        <meshStandardMaterial color="#59666d" metalness={0.58} roughness={0.48} />
      </mesh>
      <mesh
        position={NETWORK_PDU_CONFIG.facePosition}
        rotation={NETWORK_PDU_CONFIG.rotation}
      >
        <boxGeometry args={NETWORK_PDU_CONFIG.faceDimensions} />
        <meshStandardMaterial color="#738188" metalness={0.38} roughness={0.56} />
      </mesh>
      <mesh
        position={NETWORK_PDU_CONFIG.accentPosition}
        rotation={NETWORK_PDU_CONFIG.rotation}
      >
        <boxGeometry args={[0.22, 0.012, 0.012]} />
        <meshStandardMaterial color="#39464c" metalness={0.45} roughness={0.58} />
      </mesh>
      <mesh position={[1.55, 1.19, 0.35]} rotation={NETWORK_PDU_CONFIG.rotation}>
        <boxGeometry args={[0.105, 0.08, 0.028]} />
        <meshStandardMaterial
          color="#2a3439"
          emissive={networkPowered ? '#1b6546' : '#000000'}
          emissiveIntensity={networkPowered ? 0.36 : 0}
          roughness={0.58}
        />
      </mesh>
      <mesh position={[1.5, 1.19, 0.37]} rotation={NETWORK_PDU_CONFIG.rotation}>
        <circleGeometry args={[0.014, 12]} />
        <meshBasicMaterial
          color={networkPowered ? '#68e0a3' : '#5c666a'}
          toneMapped={false}
        />
      </mesh>
      <mesh
        position={[1.55, 0.18, 0.22]}
        rotation={[Math.PI / 2, 0, 0.18]}
        castShadow
      >
        <cylinderGeometry args={[0.055, 0.065, 0.12, 12]} />
        <meshStandardMaterial color="#20282c" roughness={0.8} />
      </mesh>
      <Html position={NETWORK_PDU_CONFIG.labelPosition} center zIndexRange={[2, 0]}>
        <span className="network-port-marking is-pdu-title">RACK PDU</span>
      </Html>
      {PDU_PORTS.map((port) => (
        <NetworkPort
          key={port.id}
          port={port}
          isInteractive={interactivePortIds.includes(port.id)}
          isHovered={hoveredObjectId === port.id}
          isSelected={selectedPortId === port.id}
          isTarget={targetPortId === port.id}
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
  rotation = [0, 0, 0],
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
  const networkPowered = useNetworkTrainingStore(
    (state) => state.networkPowered,
  )
  const powerOnStartedAt = useNetworkTrainingStore(
    (state) => state.powerOnStartedAt,
  )
  const switchPowerOnStartedAt = useNetworkTrainingStore(
    (state) => state.switchPowerOnStartedAt,
  )
  const pcLinkOnStartedAt = useNetworkTrainingStore(
    (state) => state.pcLinkOnStartedAt,
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
  const selectedSourcePortId = useNetworkTrainingStore(
    (state) => state.selectedSourcePortId,
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
  const troubleshootingMode = useNetworkTrainingStore(
    (state) => state.troubleshootingMode,
  )
  const selectedTroubleshootingScenarioId = useNetworkTrainingStore(
    (state) => state.selectedTroubleshootingScenarioId,
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
  const openWorkstationConfiguration = useNetworkTrainingStore(
    (state) => state.openWorkstationConfiguration,
  )
  const openNetworkDeviceTerminal = useNetworkTrainingStore(
    (state) => state.openNetworkDeviceTerminal,
  )
  const isPoweringOn =
    networkCurrentStep === NETWORK_PROCEDURE_STEPS.POWERING_ON_NETWORK
  const selectedCable = NETWORK_CABLE_CONFIGS.find(
    (cable) => cable.id === selectedCableId,
  )
  const targetPortId = selectedCable
    ? selectedSourcePortId
      ? selectedCable.destinationPortId
      : selectedCable.sourcePortId
    : null
  const isPowerConnectionStep = powerConnectionSteps.includes(
    networkCurrentStep,
  )
  const troubleshootingActive =
    troubleshootingMode === NETWORK_TROUBLESHOOTING_MODES.ACTIVE
  const troubleshootingScenario = troubleshootingActive
    ? getTroubleshootingScenario(selectedTroubleshootingScenarioId)
    : null
  const interactivePortIds = selectedCable
    ? troubleshootingActive && selectedSourcePortId
      ? [selectedCable.destinationPortId]
      : selectedCable.type === NETWORK_PORT_TYPES.POWER
        ? Object.values(NETWORK_PORTS)
            .filter((port) => port.type === NETWORK_PORT_TYPES.POWER)
            .map((port) => port.id)
        : [selectedCable.sourcePortId, selectedCable.destinationPortId]
    : networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_LINKS
      ? NETWORK_REQUIRED_VERIFICATION_PORT_IDS
      : []
  const liveNetworkState = useNetworkTrainingStore.getState()
  const activeLinkPortIds = getActiveNetworkLinkPortIds(liveNetworkState)
  const selectableCableIds = troubleshootingScenario?.repairCableId
    ? [troubleshootingScenario.repairCableId]
    : cableSelectionStepIds[networkCurrentStep] ?? []
  const selectedStepDeviceId = selectionStepDeviceIds[networkCurrentStep]
  const isSelectingDevice = Boolean(selectedStepDeviceId)
  const isInstallingDevice = installationSteps.includes(networkCurrentStep)
  const configurationDeviceId = routerConfigurationSteps.includes(networkCurrentStep)
    ? NETWORK_DEVICE_IDS.ROUTER
    : switchConfigurationSteps.includes(networkCurrentStep)
      ? NETWORK_DEVICE_IDS.MANAGED_SWITCH
      : null
  const canConfigureWorkstation = workstationConfigurationSteps.includes(
    networkCurrentStep,
  )
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
    <group position={position} rotation={rotation}>
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
            canConfigure={
              !selectedCableId &&
              (configurationDeviceId === device.id ||
                (troubleshootingActive &&
                  [
                    NETWORK_DEVICE_IDS.ROUTER,
                    NETWORK_DEVICE_IDS.MANAGED_SWITCH,
                  ].includes(device.id)))
            }
            configurationLabel={
              device.id === NETWORK_DEVICE_IDS.ROUTER
                ? 'Open Router Console'
                : 'Open Switch Console'
            }
            powered={
              device.id === NETWORK_DEVICE_IDS.ROUTER
                ? isRouterPowered(liveNetworkState) || isPoweringOn
                : device.id === NETWORK_DEVICE_IDS.MANAGED_SWITCH
                  ? isSwitchPowered(liveNetworkState) || isPoweringOn
                  : device.id === NETWORK_DEVICE_IDS.WORKSTATION_PC &&
                    (networkPowered || isPoweringOn)
            }
            networkPowered={
              device.id === NETWORK_DEVICE_IDS.ROUTER
                ? isRouterPowered(liveNetworkState) || isPoweringOn
                : device.id === NETWORK_DEVICE_IDS.MANAGED_SWITCH
                  ? isSwitchPowered(liveNetworkState) || isPoweringOn
                  : networkPowered || isPoweringOn
            }
            powerOnStartedAt={
              device.id === NETWORK_DEVICE_IDS.MANAGED_SWITCH
                ? switchPowerOnStartedAt ?? powerOnStartedAt
                : powerOnStartedAt
            }
            linkPowerOnStartedAt={
              switchPowerOnStartedAt ?? powerOnStartedAt
            }
            linkPowerOnStartedAtByPortId={{
              'pc-eth0': pcLinkOnStartedAt,
              'switch-port-2': pcLinkOnStartedAt,
            }}
            linkDelayByPortId={{
              'pc-eth0': 0.7,
              'switch-port-2': 0.7,
            }}
            activeLinkPortIds={activeLinkPortIds}
            interactivePortIds={interactivePortIds}
            hoveredObjectId={hoveredObjectId}
            selectedPortId={selectedNetworkPortId}
            targetPortId={targetPortId}
            showLabel={false}
            onHover={handleHover}
            onHoverEnd={handleHoverEnd}
            onSelectDevice={selectNetworkDevice}
            onConfigure={openNetworkDeviceTerminal}
            onSelectPort={
              networkCurrentStep === NETWORK_PROCEDURE_STEPS.VERIFY_LINKS
                ? verifyNetworkLinkPort
                : selectNetworkPort
            }
            onInstallationComplete={completeNetworkDeviceInstallation}
          />
        ))}

        <NetworkWorkstationMonitor
          canConfigure={canConfigureWorkstation || troubleshootingActive}
          isHovered={hoveredObjectId === 'workstation-monitor'}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          onConfigure={openWorkstationConfiguration}
        />

        <RackPdu
          networkPowered={networkPowered || isPoweringOn}
          interactivePortIds={interactivePortIds}
          hoveredObjectId={hoveredObjectId}
          selectedPortId={selectedNetworkPortId}
          targetPortId={targetPortId}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          onSelectPort={selectNetworkPort}
        />

        <RackCableManagement />

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
                <Html
                  position={[
                    slot.position[0],
                    slot.position[1] + 0.22,
                    0.62,
                  ]}
                  center
                  zIndexRange={[3, 0]}
                >
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
          return (
            <NetworkCable
              key={cable.id}
              config={cable}
              connected={connection?.connected}
              sourceConnected={connection?.sourceConnected}
              destinationConnected={connection?.destinationConnected}
              connecting={activeConnectionId === cable.id}
              selected={selectedCableId === cable.id}
              canSelect={
                networkTrainingStarted &&
                selectableCableIds.includes(cable.id) &&
                !connection?.connected
              }
              canReject={false}
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

      <PreparationBench showLabels={networkTrainingStarted} />
      <WorkstationDesk />
      <WorkstationCableRaceway />

      <pointLight
        position={NETWORK_WORKSTATION_LAYOUT.stationLightPosition}
        color="#edf9ff"
        intensity={networkTrainingStarted ? 2.35 : 0}
        distance={7.2}
        decay={2}
      />
      <pointLight
        position={NETWORK_WORKSTATION_LAYOUT.rackLightPosition}
        color="#f4fbff"
        intensity={networkTrainingStarted ? 1.25 : 0}
        distance={4.4}
        decay={2}
      />
      <pointLight
        position={NETWORK_WORKSTATION_LAYOUT.rackRearLightPosition}
        color="#eef7fa"
        intensity={networkTrainingStarted ? 0.9 : 0}
        distance={3.8}
        decay={2}
      />
      <pointLight
        position={NETWORK_WORKSTATION_LAYOUT.workstationLightPosition}
        color="#eef8fb"
        intensity={networkTrainingStarted ? 1.1 : 0}
        distance={3.6}
        decay={2}
      />
    </group>
  )
}
