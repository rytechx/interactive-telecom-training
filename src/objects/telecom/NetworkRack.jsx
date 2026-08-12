import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three'

const boxGeometry = new BoxGeometry(1, 1, 1)
const cylinderGeometry = new CylinderGeometry(1, 1, 1, 12)
const frameMaterial = new MeshStandardMaterial({
  color: '#3f4a50',
  metalness: 0.64,
  roughness: 0.43,
})
const railMaterial = new MeshStandardMaterial({
  color: '#647178',
  metalness: 0.72,
  roughness: 0.38,
})
const rearMaterial = new MeshStandardMaterial({
  color: '#293238',
  metalness: 0.48,
  roughness: 0.58,
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

function RackBeam({ position, scale, material = frameMaterial }) {
  return (
    <mesh
      geometry={boxGeometry}
      material={material}
      position={position}
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
  const railHolePositions = Array.from(
    { length: 13 },
    (_, index) => 0.24 + index * 0.2,
  )

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RackBeam position={[0, 0.06, 0]} scale={[width, 0.12, depth]} />
      <RackBeam
        position={[0, height - 0.06, 0]}
        scale={[width, 0.12, depth]}
      />
      <RackBeam
        position={[0, height / 2, -depth / 2 + 0.035]}
        scale={[width - 0.2, height - 0.2, 0.07]}
        material={rearMaterial}
      />

      {postPositions.map((postPosition) => (
        <RackBeam
          key={postPosition.join('-')}
          position={postPosition}
          scale={[0.12, height, 0.12]}
        />
      ))}

      {[0.34, height - 0.34].flatMap((yPosition) =>
        [-1, 1].map((side) => (
          <RackBeam
            key={`${yPosition}-${side}`}
            position={[side * postX, yPosition, 0]}
            scale={[0.08, 0.08, depth - 0.12]}
          />
        )),
      )}

      {[-width / 2 + 0.11, width / 2 - 0.11].map((railX) => (
        <group key={railX} position={[railX, 0, depth / 2 + 0.005]}>
          <RackBeam
            position={[0, height / 2, 0]}
            scale={[0.1, height - 0.22, 0.065]}
            material={railMaterial}
          />
          {railHolePositions.map((holeY) => (
            <mesh
              key={holeY}
              geometry={boxGeometry}
              material={holeMaterial}
              position={[0, holeY, 0.038]}
              scale={[0.038, 0.04, 0.012]}
            />
          ))}
        </group>
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
