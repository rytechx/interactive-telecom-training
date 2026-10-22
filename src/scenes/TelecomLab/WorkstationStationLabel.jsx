import { Html } from '@react-three/drei'

export default function WorkstationStationLabel({ position, workstation }) {
  return (
    <Html
      position={position}
      center
      zIndexRange={[2, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="lab-station-sign"
        aria-label={`Station ${workstation.stationNumber}: ${workstation.displayName}`}
      >
        <span>Station {workstation.stationNumber}</span>
        <strong>{workstation.displayName}</strong>
      </div>
    </Html>
  )
}
