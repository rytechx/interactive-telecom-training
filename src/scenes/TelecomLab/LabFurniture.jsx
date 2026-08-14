import StorageCabinet from '../../objects/furniture/StorageCabinet.jsx'
import Stool from '../../objects/furniture/Stool.jsx'
import Workbench from '../../objects/furniture/Workbench.jsx'
import Interactable from '../../interaction/Interactable.jsx'
import {
  FIBER_WORKSTATION,
  RJ45_WORKSTATION,
} from '../../workstations/workstationConfigs.js'

export default function LabFurniture({
  rj45WorkbenchPosition = [-5, 0, -2.5],
  fiberWorkbenchPosition = [5, 0, -2.5],
  storageCabinetPosition = [4.8, 0, -9.4],
}) {
  const rj45StoolPosition = [
    rj45WorkbenchPosition[0],
    rj45WorkbenchPosition[1],
    rj45WorkbenchPosition[2] + 1.55,
  ]
  const fiberStoolPosition = [
    fiberWorkbenchPosition[0],
    fiberWorkbenchPosition[1],
    fiberWorkbenchPosition[2] + 1.55,
  ]

  return (
    <group>
      <Interactable
        id={RJ45_WORKSTATION.id}
        label={RJ45_WORKSTATION.displayName}
        position={rj45WorkbenchPosition}
        interactionDistance={2.2}
      >
        <Workbench position={rj45WorkbenchPosition} />
      </Interactable>
      <Interactable
        id={FIBER_WORKSTATION.id}
        label={FIBER_WORKSTATION.displayName}
        position={fiberWorkbenchPosition}
        interactionDistance={2.2}
      >
        <Workbench position={fiberWorkbenchPosition} />
      </Interactable>
      <Stool position={rj45StoolPosition} />
      <Stool position={fiberStoolPosition} />
      <StorageCabinet position={storageCabinetPosition} />
    </group>
  )
}
