import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InstructorLoadingState from '../components/instructor/InstructorLoadingState.jsx'
import InstructorStatePanel from '../components/instructor/InstructorStatePanel.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useAuthStore from '../store/useAuthStore.js'
import useClassStore from '../store/useClassStore.js'
import { formatDate } from '../utils/instructorFormatters.js'

export default function InstructorClassesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const classes = useClassStore((state) => state.staffClasses)
  const isLoading = useClassStore((state) => state.staffClassesLoading)
  const error = useClassStore((state) => state.staffClassesError)
  const loadClasses = useClassStore((state) => state.loadStaffClasses)
  const createClass = useClassStore((state) => state.createStaffClass)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [className, setClassName] = useState('')
  const [createError, setCreateError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createdClass, setCreatedClass] = useState(null)
  const [copyMessage, setCopyMessage] = useState(null)

  useEffect(() => {
    void loadClasses()
  }, [loadClasses])

  const copyText = async (value, message) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyMessage(message)
      window.setTimeout(() => setCopyMessage(null), 2400)
    } catch {
      setCopyMessage('Clipboard access is unavailable. Copy the code manually.')
    }
  }

  const submitClass = async (event) => {
    event.preventDefault()
    const name = className.trim()
    if (!name) {
      setCreateError('Class name is required.')
      return
    }

    setCreating(true)
    setCreateError(null)
    try {
      const classRecord = await createClass(name)
      setCreatedClass(classRecord)
      setClassName('')
    } catch (requestError) {
      setCreateError(requestError.message || 'Unable to create the class.')
    } finally {
      setCreating(false)
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setCreatedClass(null)
    setCreateError(null)
    setClassName('')
  }

  return (
    <div className="application-page instructor-page instructor-classes-page">
      <PageHeader
        eyebrow="Class Management"
        title="My Classes"
        description={user?.role === 'admin'
          ? 'Review classes across the TeleSim instructor network.'
          : 'Manage your classes and monitor enrolled students.'}
        action={user?.role === 'instructor' ? (
          <button type="button" onClick={() => setDialogOpen(true)}>
            + Create Class
          </button>
        ) : null}
      />

      {copyMessage && <div className="class-copy-feedback" role="status">{copyMessage}</div>}

      {isLoading && !classes.length ? (
        <InstructorLoadingState label="Loading classes..." />
      ) : error ? (
        <InstructorStatePanel
          title="Unable to load classes"
          message={error}
          onAction={() => void loadClasses()}
        />
      ) : classes.length ? (
        <section className="instructor-class-grid" aria-label="Classes">
          {classes.map((classRecord) => {
            const inviteUrl = `${window.location.origin}/register?class=${encodeURIComponent(classRecord.classCode)}`
            return (
              <article key={classRecord.id} className="instructor-class-card">
                <header>
                  <div>
                    <span>Class</span>
                    <h2>{classRecord.name}</h2>
                  </div>
                  <span className={`instructor-status ${classRecord.isActive ? 'is-completed' : 'is-inactive'}`}>
                    {classRecord.isActive ? 'Active' : 'Inactive'}
                  </span>
                </header>
                <div className="instructor-class-code">
                  <span>Class Code</span>
                  <code>{classRecord.classCode}</code>
                </div>
                <dl>
                  <div><dt>Students</dt><dd>{classRecord.studentCount}</dd></div>
                  <div><dt>Created</dt><dd>{formatDate(classRecord.createdAt)}</dd></div>
                  {user?.role === 'admin' && (
                    <div><dt>Instructor</dt><dd>{classRecord.instructorName}</dd></div>
                  )}
                </dl>
                <footer>
                  <button
                    type="button"
                    onClick={() => navigate(`/instructor/classes/${classRecord.id}/students`)}
                  >
                    View Students
                  </button>
                  <button type="button" onClick={() => void copyText(classRecord.classCode, 'Class code copied.')}>
                    Copy Code
                  </button>
                  <button type="button" onClick={() => void copyText(inviteUrl, 'Invite link copied.')}>
                    Copy Invite Link
                  </button>
                </footer>
              </article>
            )
          })}
        </section>
      ) : (
        <InstructorStatePanel
          title="No classes yet"
          message={user?.role === 'admin'
            ? 'No instructor classes have been created.'
            : 'Create your first class to receive a secure class code and invite link.'}
          actionLabel="Create Class"
          onAction={user?.role === 'instructor' ? () => setDialogOpen(true) : undefined}
        />
      )}

      {dialogOpen && (
        <div className="class-dialog-backdrop" role="presentation" onMouseDown={closeDialog}>
          <section
            className="class-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-class-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <span>Instructor Workspace</span>
              <h2 id="create-class-title">{createdClass ? 'Class Created' : 'Create Class'}</h2>
            </header>
            {createdClass ? (
              <div className="class-created-result">
                <strong>{createdClass.name}</strong>
                <span>Class Code</span>
                <code>{createdClass.classCode}</code>
                <p>Share this code or its invite link with your students.</p>
              </div>
            ) : (
              <form onSubmit={submitClass}>
                <label htmlFor="class-name">Class Name</label>
                <input
                  id="class-name"
                  value={className}
                  onChange={(event) => {
                    setClassName(event.target.value)
                    setCreateError(null)
                  }}
                  placeholder="BSIT 4A - Networking"
                  maxLength={120}
                  autoFocus
                />
                {createError && <p role="alert">{createError}</p>}
                <footer>
                  <button type="button" onClick={closeDialog}>Cancel</button>
                  <button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Class'}
                  </button>
                </footer>
              </form>
            )}
            {createdClass && <button type="button" className="class-dialog-done" onClick={closeDialog}>Done</button>}
          </section>
        </div>
      )}
    </div>
  )
}
