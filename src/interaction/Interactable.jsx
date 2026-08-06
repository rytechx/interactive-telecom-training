import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import useInteractionStore from '../store/useInteractionStore.js'

export default function Interactable({
  id,
  label,
  position,
  interactionDistance = 2.2,
  children,
}) {
  const camera = useThree((state) => state.camera)
  const wasInRange = useRef(false)
  const setNearbyInteractable = useInteractionStore(
    (state) => state.setNearbyInteractable,
  )
  const clearNearbyInteractable = useInteractionStore(
    (state) => state.clearNearbyInteractable,
  )

  useFrame(() => {
    const distanceX = camera.position.x - position[0]
    const distanceZ = camera.position.z - position[2]
    const isInRange =
      distanceX * distanceX + distanceZ * distanceZ <=
      interactionDistance * interactionDistance

    if (isInRange === wasInRange.current) {
      return
    }

    wasInRange.current = isInRange

    if (isInRange) {
      setNearbyInteractable({ id, label })
    } else {
      clearNearbyInteractable(id)
    }
  })

  useEffect(
    () => () => {
      clearNearbyInteractable(id)
    },
    [clearNearbyInteractable, id],
  )

  return children
}
