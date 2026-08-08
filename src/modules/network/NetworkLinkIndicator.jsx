import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export default function NetworkLinkIndicator({
  position = [0, 0, 0],
  active = false,
  powerOnStartedAt = null,
  delay = 0,
  color = '#55d486',
  size = [0.045, 0.026, 0.018],
}) {
  const materialRef = useRef(null)

  useFrame(() => {
    const material = materialRef.current

    if (!material) {
      return
    }

    const delayComplete =
      !powerOnStartedAt || Date.now() - powerOnStartedAt >= delay * 1000
    const isLit = active && delayComplete

    material.emissiveIntensity = isLit ? 1.15 : 0.03
    material.opacity = isLit ? 1 : 0.4
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
