export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.34} color="#e4e8e5" />
      <hemisphereLight
        args={['#f0f4f3', '#747c7f', 0.98]}
        position={[0, 4, 0]}
      />
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.14}
        color="#fffdf5"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.00025}
        shadow-normalBias={0.04}
      />
    </>
  )
}
