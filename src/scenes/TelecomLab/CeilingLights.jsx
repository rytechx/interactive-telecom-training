function CeilingLightFixture({ position }) {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[3.2, 0.08, 1.2]} />
        <meshStandardMaterial color="#d9dde0" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.9, 0.025, 0.92]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#f4f8ff"
          emissiveIntensity={1.5}
          roughness={0.2}
        />
      </mesh>
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
