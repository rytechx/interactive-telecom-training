import { useEffect, useRef } from 'react'

export default function AdminAccountActionDialog({
  action,
  isLoading,
  onCancel,
  onConfirm,
}) {
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    if (!action) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [action, isLoading, onCancel])

  if (!action) return null

  const isRoleChange = action.type === 'role'
  const title = isRoleChange ? 'Confirm role change' : 'Confirm status change'
  const description = isRoleChange
    ? `Change ${action.user.fullName}'s role from ${action.user.role} to ${action.nextRole}?`
    : `${action.nextIsActive ? 'Activate' : 'Deactivate'} ${action.user.fullName}'s account? Training history will be preserved.`

  return (
    <div className="admin-confirm-backdrop" role="presentation">
      <section
        className="admin-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
      >
        <span>Administrator Action</span>
        <h2 id="admin-confirm-title">{title}</h2>
        <p>{description}</p>
        <div>
          <button
            ref={cancelButtonRef}
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={action.nextIsActive === false ? 'is-warning' : ''}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Confirm Update'}
          </button>
        </div>
      </section>
    </div>
  )
}
