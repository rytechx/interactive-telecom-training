import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three'

const boxGeometry = new BoxGeometry(1, 1, 1)
const cylinderGeometry = new CylinderGeometry(1, 1, 1, 12)
const frameMaterial = new MeshStandardMaterial({
  color: '#333e44',
  metalness: 0.7,
  roughness: 0.4,
})
const railMaterial = new MeshStandardMaterial({
  color: '#59666d',
  metalness: 0.76,
  roughness: 0.34,
})
const holeMaterial = new MeshStandardMaterial({
  color: '#080b0d',
  roughness: 0.78,
})
const casterMaterial = new MeshStandardMaterial({
  color: '#151b1f',
  metalness: 0.12,
  roughness: 0.82,
})

function RackBeam({
  position,
  rotation = [0, 0, 0],
  scale,
  material = frameMaterial,
}) {
  return (
    <mesh
      geometry={boxGeometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  )
}

export default function NetworkRack({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 2.05,
  height = 2.85,
  depth = 0.9,
  children,
}) {
  const postX = width / 2 - 0.08
  const postZ = depth / 2 - 0.08
  const postPositions = [
    [-postX, height / 2, -postZ],
    [postX, height / 2, -postZ],
    [-postX, height / 2, postZ],
    [postX, height / 2, postZ],
  ]
  const rackUnitCenters = Array.from(
    { length: 14 },
    (_, index) => 0.24 + index * 0.185,
  )
  const railDepthPositions = [-depth / 2 - 0.004, depth / 2 + 0.004]

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[0.1, height - 0.1].flatMap((positionY) =>
        [-postZ, postZ].map((positionZ) => (
          <RackBeam
            key={`horizontal-${positionY}-${positionZ}`}
            position={[0, positionY, positionZ]}
            scale={[width, 0.12, 0.12]}
          />
        )),
      )}

      {[0.1, height - 0.1].flatMap((positionY) =>
        [-postX, postX].map((positionX) => (
          <RackBeam
            key={`depth-${positionY}-${positionX}`}
            position={[positionX, positionY, 0]}
            scale={[0.12, 0.12, depth]}
          />
        )),
      )}

      {postPositions.map((postPosition) => (
        <RackBeam
          key={postPosition.join('-')}
          position={postPosition}
          scale={[0.12, height, 0.12]}
        />
      ))}

      {[0.38, height / 2, height - 0.38].flatMap((yPosition) =>
        [-1, 1].map((side) => (
          <RackBeam
            key={`${yPosition}-${side}`}
            position={[side * postX, yPosition, 0]}
            scale={[0.075, 0.075, depth - 0.12]}
          />
        )),
      )}

      {railDepthPositions.flatMap((railZ) =>
        [-width / 2 + 0.11, width / 2 - 0.11].map((railX) => (
          <group key={`${railX}-${railZ}`} position={[railX, 0, railZ]}>
            <RackBeam
              position={[0, height / 2, 0]}
              scale={[0.095, height - 0.22, 0.06]}
              material={railMaterial}
            />
            {rackUnitCenters.flatMap((unitCenter) =>
              [-0.047, 0, 0.047].map((holeOffset) => (
                <mesh
                  key={`${unitCenter}-${holeOffset}`}
                  geometry={boxGeometry}
                  material={holeMaterial}
                  position={[
                    0,
                    unitCenter + holeOffset,
                    railZ > 0 ? 0.036 : -0.036,
                  ]}
                  scale={[0.032, 0.023, 0.012]}
                />
              )),
            )}
          </group>
        )),
      )}

      {[0.42, height - 0.42].map((positionY) => (
        <RackBeam
          key={`rear-crossbar-${positionY}`}
          position={[0, positionY, -postZ]}
          scale={[width - 0.18, 0.075, 0.075]}
        />
      ))}

      {[-1, 1].flatMap((sideX) =>
        [-1, 1].map((sideZ) => (
          <group
            key={`${sideX}-${sideZ}`}
            position={[sideX * (postX - 0.01), 0.025, sideZ * (postZ - 0.01)]}
          >
            <RackBeam position={[0, 0.035, 0]} scale={[0.18, 0.07, 0.16]} />
            <mesh
              geometry={cylinderGeometry}
              material={casterMaterial}
              position={[0, -0.02, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.075, 0.045, 0.075]}
              castShadow
            />
          </group>
        )),
      )}

      {children}
    </group>
  )
}
