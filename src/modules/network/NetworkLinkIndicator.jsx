import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { BoxGeometry } from 'three'
import useSettingsStore from '../../store/useSettingsStore.js'

const indicatorGeometry = new BoxGeometry(1, 1, 1)

function PulsingIndicatorMaterial({ color }) {
  const materialRef = useRef(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        0.78 + Math.sin(state.clock.elapsedTime * 7) * 0.2
    }
  })

  return (
    <meshStandardMaterial
      ref={materialRef}
      color={color}
      emissive={color}
      emissiveIntensity={0.78}
      transparent
      opacity={0.96}
      toneMapped={false}
    />
  )
}

export default function NetworkLinkIndicator({
  position = [0, 0, 0],
  active = false,
  powerOnStartedAt = null,
  delay = 0,
  color = '#55d486',
  size = [0.045, 0.026, 0.018],
  pulse = false,
}) {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion)
  const [completedPowerStart, setCompletedPowerStart] = useState(null)

  useEffect(() => {
    if (!powerOnStartedAt) {
      return undefined
    }

    const remainingDelay = delay * 1000 - (Date.now() - powerOnStartedAt)
    const timeoutId = window.setTimeout(
      () => setCompletedPowerStart(powerOnStartedAt),
      Math.max(0, remainingDelay),
    )

    return () => window.clearTimeout(timeoutId)
  }, [delay, powerOnStartedAt])

  const delayComplete =
    !powerOnStartedAt ||
    delay <= 0 ||
    completedPowerStart === powerOnStartedAt
  const isLit = active && delayComplete
  const shouldPulse = isLit && pulse && !reducedMotion

  return (
    <mesh position={position} geometry={indicatorGeometry} scale={size}>
      {shouldPulse ? (
        <PulsingIndicatorMaterial color={color} />
      ) : (
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isLit ? 1 : 0.025}
          transparent
          opacity={isLit ? 0.96 : 0.38}
          toneMapped={false}
        />
      )}
    </mesh>
  )
}
