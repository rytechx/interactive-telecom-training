import CableTester from '../../objects/telecom/CableTester.jsx'
import NetworkRack from '../../objects/telecom/NetworkRack.jsx'
import RJ45ToolSet from '../../objects/telecom/RJ45ToolSet.jsx'

export default function TelecomEquipment({
  rj45WorkbenchPosition = [-5, 0, -2.5],
  networkRackPosition = [-4.8, 0, -9.2],
}) {
  const workbenchSurfaceY = rj45WorkbenchPosition[1] + 0.9

  return (
    <group>
      <NetworkRack position={networkRackPosition} />
      <CableTester
        position={[
          rj45WorkbenchPosition[0] - 0.8,
          workbenchSurfaceY,
          rj45WorkbenchPosition[2] - 0.05,
        ]}
      />
      <RJ45ToolSet
        position={[
          rj45WorkbenchPosition[0] + 0.35,
          workbenchSurfaceY,
          rj45WorkbenchPosition[2],
        ]}
      />
    </group>
  )
}
