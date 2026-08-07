import { Html } from '@react-three/drei'
import {
  CONNECTOR_ALIGNED_POSITION,
  CONNECTOR_REAR_ENTRY_Z,
  CONNECTOR_WIDTH,
} from './RJ45ConnectorModel.jsx'
import { GUIDE_CENTER_X } from './wireDefinitions.js'

const GUIDE_SEGMENTS = 7

export default function ConnectorAlignmentGuide({ isAligned }) {
  const pathStartZ = 0.08
  const pathLength = pathStartZ - CONNECTOR_REAR_ENTRY_Z
  const pathColor = isAligned ? '#75d792' : '#70c8e8'

  return (
    <group>
      {Array.from({ length: GUIDE_SEGMENTS }, (_, index) => {
        const segmentProgress = index / (GUIDE_SEGMENTS - 1)

        return (
          <mesh
            key={index}
            position={[
              GUIDE_CENTER_X,
              0.018,
              pathStartZ - pathLength * segmentProgress,
            ]}
          >
            <boxGeometry args={[0.025, 0.012, 0.025]} />
            <meshStandardMaterial
              color={pathColor}
              emissive={pathColor}
              emissiveIntensity={0.66}
              toneMapped={false}
            />
          </mesh>
        )
      })}

      <mesh
        position={[GUIDE_CENTER_X, 0.03, CONNECTOR_REAR_ENTRY_Z + 0.035]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <coneGeometry args={[0.055, 0.12, 8]} />
        <meshStandardMaterial
          color={pathColor}
          emissive={pathColor}
          emissiveIntensity={0.45}
          toneMapped={false}
        />
      </mesh>

      <group
        position={[
          CONNECTOR_ALIGNED_POSITION[0],
          CONNECTOR_ALIGNED_POSITION[1],
          CONNECTOR_REAR_ENTRY_Z,
        ]}
      >
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * CONNECTOR_WIDTH * 0.51, 0, 0]}>
            <boxGeometry args={[0.022, 0.3, 0.03]} />
            <meshStandardMaterial
              color={pathColor}
              emissive={pathColor}
              emissiveIntensity={0.38}
            />
          </mesh>
        ))}
      </group>

      <Html position={[GUIDE_CENTER_X, 0.3, -0.01]} center>
        <div className="connector-insertion-label" role="note">
          Insert conductors
        </div>
      </Html>

      <Html
        position={[
          CONNECTOR_ALIGNED_POSITION[0],
          0.5,
          CONNECTOR_ALIGNED_POSITION[2],
        ]}
        center
      >
        <div className="connector-orientation-guide" role="note">
          <strong>Contacts up, locking tab down.</strong>
          <span>Pin 1 &rarr; Pin 8</span>
        </div>
      </Html>
    </group>
  )
}
