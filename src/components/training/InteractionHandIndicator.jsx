import { Html } from '@react-three/drei'

const DEFAULT_OFFSET = Object.freeze([0, 0.34, 0])

export default function InteractionHandIndicator({
  position,
  label,
  offset = DEFAULT_OFFSET,
}) {
  const indicatorPosition = [
    position[0] + offset[0],
    position[1] + offset[1],
    position[2] + offset[2],
  ]

  return (
    <Html
      position={indicatorPosition}
      center
      zIndexRange={[3, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div className="interaction-hand-indicator" aria-hidden="true">
        <span className="interaction-hand-icon">
          <svg viewBox="0 0 48 48" focusable="false">
            <path d="M20.5 24.5V8.8a3.3 3.3 0 0 1 6.6 0v12.5-3.7a3.1 3.1 0 0 1 6.2 0v4.3-2.8a3 3 0 0 1 6 0v8.8c0 9.1-5.5 14.6-14 14.6h-1.9c-4.4 0-7.8-1.9-10.2-5.6L8.9 30a3.4 3.4 0 0 1 5.5-4l6.1 7.2" />
            <path className="interaction-hand-click" d="M12.8 8.5 9.7 5.4M10 15H5.6M15.2 5.8V1.5" />
          </svg>
        </span>
        {label && <span className="interaction-hand-label">{label}</span>}
      </div>
    </Html>
  )
}
