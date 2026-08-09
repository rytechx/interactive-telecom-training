const inspectionViews = Object.freeze([
  Object.freeze({ id: 'front', label: 'Front' }),
  Object.freeze({ id: 'left', label: 'Left' }),
  Object.freeze({ id: 'right', label: 'Right' }),
  Object.freeze({ id: 'rear', label: 'Rear' }),
])

export default function NetworkInspectionToolbar({
  disabled = false,
  onSelectView,
}) {
  return (
    <nav className="network-inspection-toolbar" aria-label="Rack camera views">
      <span>Drag to inspect · Wheel to zoom</span>
      <div>
        {inspectionViews.map((view) => (
          <button
            key={view.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectView(view.id)}
          >
            {view.label}
          </button>
        ))}
        <button
          type="button"
          className="is-reset"
          disabled={disabled}
          onClick={() => onSelectView('reset')}
        >
          Reset View
        </button>
      </div>
    </nav>
  )
}
