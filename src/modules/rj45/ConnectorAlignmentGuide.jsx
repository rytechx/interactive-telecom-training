import {
  CONNECTOR_ALIGNED_POSITION,
  CONNECTOR_REAR_ENTRY_Z,
} from './RJ45ConnectorModel.jsx'
import { CONNECTOR_WIRE_CENTER_X } from './wireDefinitions.js'

const GUIDE_SEGMENTS = 4

export default function ConnectorAlignmentGuide({ isAligned }) {
  const pathStartZ = 0.035
  const pathEndZ = CONNECTOR_REAR_ENTRY_Z + 0.035
  const pathColor = isAligned ? '#75d792' : '#70c8e8'

  return (
    <group>
      {Array.from({ length: GUIDE_SEGMENTS }, (_, index) => {
        const segmentProgress = index / (GUIDE_SEGMENTS - 1)

        return (
          <mesh
            key={index}
            position={[
              CONNECTOR_WIRE_CENTER_X,
              CONNECTOR_ALIGNED_POSITION[1],
              pathStartZ + (pathEndZ - pathStartZ) * segmentProgress,
            ]}
          >
            <boxGeometry args={[0.009, 0.009, 0.014]} />
            <meshStandardMaterial
              color={pathColor}
              emissive={pathColor}
              emissiveIntensity={0.5}
              toneMapped={false}
            />
          </mesh>
        )
      })}

      <mesh
        position={[
          CONNECTOR_WIRE_CENTER_X,
          CONNECTOR_ALIGNED_POSITION[1],
          pathEndZ - 0.018,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <coneGeometry args={[0.016, 0.045, 8]} />
        <meshStandardMaterial
          color={pathColor}
          emissive={pathColor}
          emissiveIntensity={0.42}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
