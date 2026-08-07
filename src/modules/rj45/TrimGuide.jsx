import { Html } from '@react-three/drei'
import {
  GUIDE_CENTER_X,
  GUIDE_WIDTH,
  TRIMMED_TIP_Z,
} from './wireDefinitions.js'

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
        position={[GUIDE_CENTER_X, 0.014, TRIMMED_TIP_Z]}
        castShadow
      >
        <boxGeometry args={[GUIDE_WIDTH + 0.04, 0.028, 0.035]} />
        <meshStandardMaterial
          color={isHovered ? '#ffe197' : '#d7a64c'}
          emissive={isHovered ? '#ce8c22' : '#684717'}
          emissiveIntensity={isHovered ? 0.62 : 0.24}
          metalness={0.56}
          roughness={0.38}
        />
      </mesh>

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

      {isHovered && canInteract && (
        <Html
          position={[GUIDE_CENTER_X, 0.18, TRIMMED_TIP_Z]}
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
