import { CuboidCollider, RigidBody } from '@react-three/rapier'
import {
  NETWORK_DEVICE_CONFIGS,
  NETWORK_DEVICE_IDS,
  NETWORK_RACK_CONFIG,
} from '../../modules/network/networkDeviceConfigs.js'
import {
  getNetworkWorkstationWorldPosition,
  NETWORK_WORKSTATION_LAYOUT,
} from '../../modules/network/networkWorkstationLayout.js'

export default function LabColliders({
  width = 20,
  depth = 20,
  height = 4,
  wallThickness = 0.2,
  rj45WorkbenchPosition = [-5, 0, -2.5],
  fiberWorkbenchPosition = [5, 0, -2.5],
  networkRackPosition = [0, 0, 7.7],
  networkRackRotation = [0, Math.PI, 0],
  storageCabinetPosition = [4.8, 0, -9.4],
}) {
  const wallX = width / 2 - wallThickness / 2
  const wallZ = depth / 2 - wallThickness / 2
  const rj45StoolPosition = [
    rj45WorkbenchPosition[0],
    0.325,
    rj45WorkbenchPosition[2] + 1.55,
  ]
  const fiberStoolPosition = [
    fiberWorkbenchPosition[0],
    0.325,
    fiberWorkbenchPosition[2] + 1.55,
  ]
  const networkPreparationPosition = getNetworkWorkstationWorldPosition(
    NETWORK_WORKSTATION_LAYOUT.preparationBenchPosition,
    networkRackPosition,
    networkRackRotation,
  )
  const networkDeskTopPosition = getNetworkWorkstationWorldPosition(
    [
      NETWORK_WORKSTATION_LAYOUT.workstationDeskPosition[0],
      NETWORK_WORKSTATION_LAYOUT.workstationDeskHeight -
        NETWORK_WORKSTATION_LAYOUT.workstationDeskTopThickness / 2,
      NETWORK_WORKSTATION_LAYOUT.workstationDeskPosition[2],
    ],
    networkRackPosition,
    networkRackRotation,
  )
  const workstationDeskLegHeight =
    NETWORK_WORKSTATION_LAYOUT.workstationDeskHeight -
    NETWORK_WORKSTATION_LAYOUT.workstationDeskTopThickness
  const workstationDeskLegOffsetX =
    NETWORK_WORKSTATION_LAYOUT.workstationDeskWidth / 2 -
    NETWORK_WORKSTATION_LAYOUT.workstationDeskLegInset
  const workstationDeskLegOffsetZ =
    NETWORK_WORKSTATION_LAYOUT.workstationDeskDepth / 2 -
    NETWORK_WORKSTATION_LAYOUT.workstationDeskLegInset
  const networkDeskLegPositions = [
    -workstationDeskLegOffsetX,
    workstationDeskLegOffsetX,
  ].flatMap((offsetX) =>
    [-workstationDeskLegOffsetZ, workstationDeskLegOffsetZ].map((offsetZ) =>
      getNetworkWorkstationWorldPosition(
        [
          NETWORK_WORKSTATION_LAYOUT.workstationDeskPosition[0] + offsetX,
          workstationDeskLegHeight / 2,
          NETWORK_WORKSTATION_LAYOUT.workstationDeskPosition[2] + offsetZ,
        ],
        networkRackPosition,
        networkRackRotation,
      ),
    ),
  )
  const workstationPcConfig =
    NETWORK_DEVICE_CONFIGS[NETWORK_DEVICE_IDS.WORKSTATION_PC]
  const networkPcPosition = getNetworkWorkstationWorldPosition(
    NETWORK_WORKSTATION_LAYOUT.workstationPcPosition,
    networkRackPosition,
    networkRackRotation,
  )

  return (
    <RigidBody type="fixed" colliders={false} friction={0.9} restitution={0}>
      <CuboidCollider
        name="floor-collider"
        args={[width / 2, 0.1, depth / 2]}
        position={[0, -0.1, 0]}
      />

      <CuboidCollider
        name="front-wall-collider"
        args={[width / 2, height / 2, wallThickness / 2]}
        position={[0, height / 2, -wallZ]}
      />
      <CuboidCollider
        name="back-wall-collider"
        args={[width / 2, height / 2, wallThickness / 2]}
        position={[0, height / 2, wallZ]}
      />
      <CuboidCollider
        name="left-wall-collider"
        args={[wallThickness / 2, height / 2, depth / 2]}
        position={[-wallX, height / 2, 0]}
      />
      <CuboidCollider
        name="right-wall-collider"
        args={[wallThickness / 2, height / 2, depth / 2]}
        position={[wallX, height / 2, 0]}
      />

      <CuboidCollider
        name="rj45-workbench-collider"
        args={[1.8, 0.45, 0.7]}
        position={[
          rj45WorkbenchPosition[0],
          0.45,
          rj45WorkbenchPosition[2],
        ]}
      />
      <CuboidCollider
        name="fiber-workbench-collider"
        args={[1.8, 0.45, 0.7]}
        position={[
          fiberWorkbenchPosition[0],
          0.45,
          fiberWorkbenchPosition[2],
        ]}
      />
      <CuboidCollider
        name="rj45-stool-collider"
        args={[0.35, 0.325, 0.35]}
        position={rj45StoolPosition}
      />
      <CuboidCollider
        name="fiber-stool-collider"
        args={[0.35, 0.325, 0.35]}
        position={fiberStoolPosition}
      />
      <CuboidCollider
        name="network-rack-collider"
        args={[
          NETWORK_RACK_CONFIG.colliderWidth / 2,
          NETWORK_RACK_CONFIG.height / 2,
          NETWORK_RACK_CONFIG.depth / 2,
        ]}
        position={[
          networkRackPosition[0],
          NETWORK_RACK_CONFIG.height / 2,
          networkRackPosition[2],
        ]}
        rotation={networkRackRotation}
      />
      <CuboidCollider
        name="network-preparation-table-collider"
        args={[
          NETWORK_WORKSTATION_LAYOUT.preparationBenchWidth / 2,
          NETWORK_WORKSTATION_LAYOUT.preparationBenchHeight / 2,
          NETWORK_WORKSTATION_LAYOUT.preparationBenchDepth / 2,
        ]}
        position={[
          networkPreparationPosition[0],
          NETWORK_WORKSTATION_LAYOUT.preparationBenchHeight / 2,
          networkPreparationPosition[2],
        ]}
        rotation={networkRackRotation}
      />
      <CuboidCollider
        name="network-workstation-desk-top-collider"
        args={[
          NETWORK_WORKSTATION_LAYOUT.workstationDeskWidth / 2,
          NETWORK_WORKSTATION_LAYOUT.workstationDeskTopThickness / 2,
          NETWORK_WORKSTATION_LAYOUT.workstationDeskDepth / 2,
        ]}
        position={networkDeskTopPosition}
        rotation={networkRackRotation}
      />
      {networkDeskLegPositions.map((legPosition, index) => (
        <CuboidCollider
          key={`network-workstation-desk-leg-${index + 1}`}
          name={`network-workstation-desk-leg-${index + 1}-collider`}
          args={[
            NETWORK_WORKSTATION_LAYOUT.workstationDeskLegThickness / 2,
            workstationDeskLegHeight / 2,
            NETWORK_WORKSTATION_LAYOUT.workstationDeskLegThickness / 2,
          ]}
          position={legPosition}
          rotation={networkRackRotation}
        />
      ))}
      <CuboidCollider
        name="network-workstation-pc-collider"
        args={workstationPcConfig.dimensions.map((dimension) => dimension / 2)}
        position={networkPcPosition}
        rotation={networkRackRotation}
      />
      <CuboidCollider
        name="storage-cabinet-collider"
        args={[1, 1.2, 0.35]}
        position={[
          storageCabinetPosition[0],
          1.2,
          storageCabinetPosition[2],
        ]}
      />
    </RigidBody>
  )
}
