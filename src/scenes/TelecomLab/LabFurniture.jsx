import StorageCabinet from '../../objects/furniture/StorageCabinet.jsx'
import Stool from '../../objects/furniture/Stool.jsx'
import Workbench from '../../objects/furniture/Workbench.jsx'
import Interactable from '../../interaction/Interactable.jsx'

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
        id="rj45-workbench"
        label="RJ45 Cable Termination"
        position={rj45WorkbenchPosition}
        interactionDistance={2.2}
      >
        <Workbench position={rj45WorkbenchPosition} topColor="#9b7147" />
      </Interactable>
      <Workbench position={fiberWorkbenchPosition} topColor="#aeb8be" />
      <Stool position={rj45StoolPosition} color="#46545d" />
      <Stool position={fiberStoolPosition} color="#46545d" />
      <StorageCabinet position={storageCabinetPosition} />
    </group>
  )
}
