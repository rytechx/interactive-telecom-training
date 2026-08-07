import { Html } from '@react-three/drei'
import { BoxGeometry, MeshStandardMaterial } from 'three'

const unitBoxGeometry = new BoxGeometry(1, 1, 1)
const targetMaterial = new MeshStandardMaterial({
  color: '#7d9ca7',
  emissive: '#315b67',
  emissiveIntensity: 0.2,
  transparent: true,
  opacity: 0.42,
  roughness: 0.5,
})
const highlightedTargetMaterial = new MeshStandardMaterial({
  color: '#a9dae3',
  emissive: '#4c9bb0',
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.64,
  roughness: 0.4,
})
const crimpActionMaterial = new MeshStandardMaterial({
  color: '#c6a75c',
  emissive: '#6d4c18',
  emissiveIntensity: 0.28,
  transparent: true,
  opacity: 0.48,
  roughness: 0.44,
})
const highlightedCrimpMaterial = new MeshStandardMaterial({
  color: '#f3d58a',
  emissive: '#b57a20',
  emissiveIntensity: 0.58,
  transparent: true,
  opacity: 0.68,
  roughness: 0.36,
})

function GuidePart({ position, scale, material }) {
  return (
    <mesh
      geometry={unitBoxGeometry}
      material={material}
      position={position}
      scale={scale}
    />
  )
}

export default function CrimpingGuide({
  connectorTargetPosition,
  crimpActionPosition,
  isPositioned,
  canPosition,
  canCrimp,
  isPositionHovered,
  isCrimpHovered,
  onPositionPointerEnter,
  onPositionPointerLeave,
  onPositionClick,
  onCrimpPointerEnter,
  onCrimpPointerLeave,
  onCrimpClick,
}) {
  const slotMaterial = isPositionHovered
    ? highlightedTargetMaterial
    : targetMaterial
  const actionMaterial = isCrimpHovered
    ? highlightedCrimpMaterial
    : crimpActionMaterial

  return (
    <group>
      {!isPositioned && (
        <group position={connectorTargetPosition}>
          <GuidePart
            position={[0, -0.078, 0]}
            scale={[0.25, 0.012, 0.18]}
            material={slotMaterial}
          />
          <mesh
            geometry={unitBoxGeometry}
            position={[0, 0, 0]}
            scale={[0.31, 0.2, 0.4]}
            onPointerEnter={onPositionPointerEnter}
            onPointerLeave={onPositionPointerLeave}
            onClick={onPositionClick}
          >
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {isPositionHovered && canPosition && (
            <Html position={[0, 0.2, 0]} center>
              <div className="tool-tooltip" role="tooltip">
                Position Connector
              </div>
            </Html>
          )}
        </group>
      )}

      {isPositioned && canCrimp && (
        <group position={crimpActionPosition}>
          <GuidePart
            position={[0, 0, 0]}
            scale={[0.14, 0.012, 0.08]}
            material={actionMaterial}
          />
          <mesh
            geometry={unitBoxGeometry}
            position={[0, 0, 0]}
            scale={[0.36, 0.22, 0.3]}
            onPointerEnter={onCrimpPointerEnter}
            onPointerLeave={onCrimpPointerLeave}
            onClick={onCrimpClick}
          >
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {isCrimpHovered && canCrimp && (
            <Html position={[0, 0.2, 0]} center>
              <div className="tool-tooltip" role="tooltip">
                Crimp Connector
              </div>
            </Html>
          )}
        </group>
      )}
    </group>
  )
}
