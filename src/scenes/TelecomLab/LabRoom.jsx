import Ceiling from './Ceiling.jsx'
import {
  FIBER_WORKSTATION,
  NETWORK_WORKSTATION,
  RJ45_WORKSTATION,
} from '../../workstations/workstationConfigs.js'
import CeilingLights from './CeilingLights.jsx'
import Door from './Door.jsx'
import Floor from './Floor.jsx'
import LabColliders from './LabColliders.jsx'
import LabEnvironmentProps from './LabEnvironmentProps.jsx'
import LabFurniture from './LabFurniture.jsx'
import TelecomEquipment from './TelecomEquipment.jsx'
import WorkbenchAccessories from './WorkbenchAccessories.jsx'
import Walls from './Walls.jsx'
import Windows from './Windows.jsx'

const rj45WorkbenchPosition = RJ45_WORKSTATION.interactionPosition
const fiberWorkbenchPosition = FIBER_WORKSTATION.interactionPosition
const networkRackPosition = NETWORK_WORKSTATION.interactionPosition
const networkRackRotation = NETWORK_WORKSTATION.rotation
const storageCabinetPosition = [4.8, 0, -9.4]

export default function LabRoom({ width = 20, depth = 20, height = 4 }) {
  const wallThickness = 0.2

  return (
    <group>
      <Floor width={width} depth={depth} />
      <Walls
        width={width}
        depth={depth}
        height={height}
        thickness={wallThickness}
      />
      <Ceiling width={width} depth={depth} height={height} />
      <Door roomDepth={depth} wallThickness={wallThickness} />
      <Windows roomWidth={width} wallThickness={wallThickness} />
      <CeilingLights roomHeight={height} />
      <LabEnvironmentProps depth={depth} />
      <LabFurniture
        rj45WorkbenchPosition={rj45WorkbenchPosition}
        fiberWorkbenchPosition={fiberWorkbenchPosition}
        storageCabinetPosition={storageCabinetPosition}
      />
      <TelecomEquipment
        rj45WorkbenchPosition={rj45WorkbenchPosition}
      />
      <WorkbenchAccessories
        rj45WorkbenchPosition={rj45WorkbenchPosition}
        fiberWorkbenchPosition={fiberWorkbenchPosition}
      />
      <LabColliders
        width={width}
        depth={depth}
        height={height}
        wallThickness={wallThickness}
        rj45WorkbenchPosition={rj45WorkbenchPosition}
        fiberWorkbenchPosition={fiberWorkbenchPosition}
        networkRackPosition={networkRackPosition}
        networkRackRotation={networkRackRotation}
        storageCabinetPosition={storageCabinetPosition}
      />
    </group>
  )
}
