import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export default function NetworkLinkIndicator({
  position = [0, 0, 0],
  active = false,
  powerOnStartedAt = null,
  delay = 0,
  color = '#55d486',
  size = [0.045, 0.026, 0.018],
  pulse = false,
}) {
  const materialRef = useRef(null)

  useFrame((state) => {
    const material = materialRef.current

    if (!material) {
      return
    }

    const delayComplete =
      !powerOnStartedAt || Date.now() - powerOnStartedAt >= delay * 1000
    const isLit = active && delayComplete

    const activeIntensity = pulse
      ? 0.78 + Math.sin(state.clock.elapsedTime * 7) * 0.2
      : 1

    material.emissiveIntensity = isLit ? activeIntensity : 0.025
    material.opacity = isLit ? 0.96 : 0.38
  })

  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.03}
        transparent
        opacity={0.4}
        toneMapped={false}
      />
    </mesh>
  )
}
