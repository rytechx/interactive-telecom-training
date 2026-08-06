import { useEffect, useRef } from 'react'

const initialControls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  run: false,
}

const keyActions = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
}

export default function useKeyboardControls() {
  const controls = useRef({ ...initialControls })

  useEffect(() => {
    const updateControl = (event, isPressed) => {
      const action = keyActions[event.code]

      if (!action) {
        return
      }

      event.preventDefault()
      controls.current[action] = isPressed
    }

    const handleKeyDown = (event) => updateControl(event, true)
    const handleKeyUp = (event) => updateControl(event, false)
    const resetControls = () => {
      controls.current = { ...initialControls }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', resetControls)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', resetControls)
    }
  }, [])

  return controls
}
