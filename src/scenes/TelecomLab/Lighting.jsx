export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.38} color="#dce7e8" />
      <hemisphereLight
        args={['#edf7fb', '#778084', 1.15]}
        position={[0, 4, 0]}
      />
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.35}
        color="#fff6e5"
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
      />
    </>
  )
}
