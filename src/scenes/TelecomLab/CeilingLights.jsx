import { MeshStandardMaterial } from 'three'

const fixtureMaterial = new MeshStandardMaterial({
  color: '#aeb7b7',
  metalness: 0.24,
  roughness: 0.58,
})
const diffuserMaterial = new MeshStandardMaterial({
  color: '#f5f6f1',
  emissive: '#eef3ef',
  emissiveIntensity: 0.52,
  roughness: 0.48,
})

function CeilingLightFixture({ position }) {
  return (
    <group position={position}>
      <mesh material={fixtureMaterial} receiveShadow>
        <boxGeometry args={[3.15, 0.1, 1.12]} />
      </mesh>
      <mesh material={diffuserMaterial} position={[0, -0.05, 0]}>
        <boxGeometry args={[2.86, 0.026, 0.84]} />
      </mesh>
      <rectAreaLight
        position={[0, -0.08, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        width={2.8}
        height={0.8}
        color="#f1f5f1"
        intensity={1.7}
      />
    </group>
  )
}

export default function CeilingLights({ roomHeight = 4 }) {
  const fixtureHeight = roomHeight - 0.05
  const fixturePositions = [
    [-4.5, fixtureHeight, -4.5],
    [4.5, fixtureHeight, -4.5],
    [-4.5, fixtureHeight, 4.5],
    [4.5, fixtureHeight, 4.5],
  ]

  return (
    <group>
      {fixturePositions.map((position) => (
        <CeilingLightFixture key={position.join('-')} position={position} />
      ))}
    </group>
  )
}
