import StorageCabinet from '../../objects/furniture/StorageCabinet.jsx'
import Stool from '../../objects/furniture/Stool.jsx'
import Workbench from '../../objects/furniture/Workbench.jsx'
import Interactable from '../../interaction/Interactable.jsx'
import useInteractionStore, {
  WORKSTATION_PHASES,
} from '../../store/useInteractionStore.js'
import {
  FIBER_WORKSTATION,
  RJ45_WORKSTATION,
} from '../../workstations/workstationConfigs.js'
import WorkstationStationLabel from './WorkstationStationLabel.jsx'

export default function LabFurniture({
  rj45WorkbenchPosition = [-5, 0, -2.5],
  fiberWorkbenchPosition = [5, 0, -2.5],
  storageCabinetPosition = [4.8, 0, -9.4],
}) {
  const workstationPhase = useInteractionStore(
    (state) => state.workstationPhase,
  )
  const showStationLabels =
    workstationPhase === WORKSTATION_PHASES.EXPLORATION
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
  const rj45StationLabelPosition = [
    rj45WorkbenchPosition[0],
    rj45WorkbenchPosition[1] + 2.05,
    rj45WorkbenchPosition[2] - 0.72,
  ]
  const fiberStationLabelPosition = [
    fiberWorkbenchPosition[0],
    fiberWorkbenchPosition[1] + 2.05,
    fiberWorkbenchPosition[2] - 0.72,
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
      {showStationLabels && (
        <>
          <WorkstationStationLabel
            position={rj45StationLabelPosition}
            workstation={RJ45_WORKSTATION}
          />
          <WorkstationStationLabel
            position={fiberStationLabelPosition}
            workstation={FIBER_WORKSTATION}
          />
        </>
      )}
      <Stool position={rj45StoolPosition} />
      <Stool position={fiberStoolPosition} />
      <StorageCabinet position={storageCabinetPosition} />
    </group>
  )
}
