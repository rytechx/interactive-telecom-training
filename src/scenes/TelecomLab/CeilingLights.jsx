function CeilingLightFixture({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.15, 0.1, 1.12]} />
        <meshStandardMaterial
          color="#aeb7bb"
          metalness={0.28}
          roughness={0.52}
        />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.86, 0.026, 0.84]} />
        <meshStandardMaterial
          color="#f4f7f3"
          emissive="#e5f2f5"
          emissiveIntensity={0.82}
          roughness={0.34}
        />
      </mesh>
      <rectAreaLight
        position={[0, -0.08, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        width={2.8}
        height={0.8}
        color="#e5f5f8"
        intensity={2.1}
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
