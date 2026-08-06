import { CuboidCollider, RigidBody } from '@react-three/rapier'

export default function LabColliders({
  width = 20,
  depth = 20,
  height = 4,
  wallThickness = 0.2,
  rj45WorkbenchPosition = [-5, 0, -2.5],
  fiberWorkbenchPosition = [5, 0, -2.5],
  networkRackPosition = [-4.8, 0, -9.2],
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
        args={[1, 1.25, 0.5]}
        position={[
          networkRackPosition[0],
          1.25,
          networkRackPosition[2],
        ]}
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
