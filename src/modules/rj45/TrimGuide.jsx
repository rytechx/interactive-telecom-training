import { Html } from '@react-three/drei'
import {
  GUIDE_CENTER_X,
  GUIDE_WIDTH,
  TRIMMED_TIP_Z,
} from './wireDefinitions.js'

const CUTTING_LINE_SEGMENTS = 12

export default function TrimGuide({
  canInteract,
  isHovered,
  onClick,
  onPointerEnter,
  onPointerLeave,
}) {
  return (
    <group>
      <mesh
        position={[GUIDE_CENTER_X, -0.002, TRIMMED_TIP_Z]}
        receiveShadow
      >
        <boxGeometry args={[GUIDE_WIDTH + 0.1, 0.035, 0.1]} />
        <meshStandardMaterial
          color="#20282e"
          metalness={0.48}
          roughness={0.5}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[
            GUIDE_CENTER_X + (side * (GUIDE_WIDTH + 0.05)) / 2,
            0.09,
            TRIMMED_TIP_Z,
          ]}
          castShadow
        >
          <boxGeometry args={[0.045, 0.18, 0.1]} />
          <meshStandardMaterial
            color="#303b42"
            metalness={0.44}
            roughness={0.48}
          />
        </mesh>
      ))}

      <mesh
        position={[GUIDE_CENTER_X, 0.17, TRIMMED_TIP_Z]}
        castShadow
      >
        <boxGeometry args={[GUIDE_WIDTH + 0.1, 0.035, 0.1]} />
        <meshStandardMaterial
          color="#303b42"
          metalness={0.44}
          roughness={0.48}
        />
      </mesh>

      {Array.from({ length: CUTTING_LINE_SEGMENTS }, (_, index) => {
        const segmentSpacing = GUIDE_WIDTH / CUTTING_LINE_SEGMENTS
        const segmentX =
          GUIDE_CENTER_X - GUIDE_WIDTH / 2 + segmentSpacing * (index + 0.5)

        return (
          <mesh
            key={segmentX}
            position={[segmentX, 0.073, TRIMMED_TIP_Z]}
          >
            <boxGeometry args={[segmentSpacing * 0.58, 0.018, 0.018]} />
            <meshStandardMaterial
              color={isHovered ? '#fff0a8' : '#f3b84c'}
              emissive={isHovered ? '#ffcf5a' : '#9f6814'}
              emissiveIntensity={isHovered ? 1.2 : 0.58}
              toneMapped={false}
            />
          </mesh>
        )
      })}

      <mesh
        position={[GUIDE_CENTER_X, 0.085, TRIMMED_TIP_Z]}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        <boxGeometry args={[GUIDE_WIDTH + 0.16, 0.2, 0.18]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <Html
        position={[GUIDE_CENTER_X, 0.25, TRIMMED_TIP_Z - 0.055]}
        center
      >
        <div className="trim-guide-label" role="note">
          Cutting line
        </div>
      </Html>

      {isHovered && canInteract && (
        <Html
          position={[GUIDE_CENTER_X, 0.36, TRIMMED_TIP_Z]}
          center
        >
          <div className="tool-tooltip" role="tooltip">
            Trim Conductors
          </div>
        </Html>
      )}
    </group>
  )
}
