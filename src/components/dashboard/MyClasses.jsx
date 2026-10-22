import { useEffect, useState } from 'react'
import useClassStore from '../../store/useClassStore.js'

const CLASS_CODE_PATTERN = /^TS-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/

export default function MyClasses() {
  const [classCode, setClassCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const classes = useClassStore((state) => state.studentClasses)
  const isLoading = useClassStore((state) => state.studentClassesLoading)
  const error = useClassStore((state) => state.studentClassesError)
  const message = useClassStore((state) => state.joinMessage)
  const loadClasses = useClassStore((state) => state.loadStudentClasses)
  const joinClass = useClassStore((state) => state.joinStudentClass)
  const clearFeedback = useClassStore((state) => state.clearJoinFeedback)

  useEffect(() => {
    void loadClasses()
  }, [loadClasses])

  const submit = async (event) => {
    event.preventDefault()
    const normalizedCode = classCode.trim().toUpperCase()
    clearFeedback()
    if (!CLASS_CODE_PATTERN.test(normalizedCode)) return
    setSubmitting(true)
    const result = await joinClass(normalizedCode)
    setSubmitting(false)
    if (result.success) setClassCode('')
  }

  const normalizedCode = classCode.trim().toUpperCase()

  return (
    <section className="dashboard-panel dashboard-classes-panel" aria-labelledby="my-classes-title">
      <div className="section-heading">
        <div>
          <span>Class Enrollment</span>
          <h2 id="my-classes-title">My Classes</h2>
        </div>
      </div>

      {isLoading && !classes.length ? (
        <p className="dashboard-class-note">Loading class enrollment...</p>
      ) : (
        <div className="dashboard-class-content">
          <div className="dashboard-class-list">
            {classes.length ? classes.map((classRecord) => (
              <article key={classRecord.id}>
                <div>
                  <strong>{classRecord.name}</strong>
                  <span>Instructor: {classRecord.instructorName}</span>
                </div>
                <code>{classRecord.classCode}</code>
                <span className="dashboard-class-enrolled">Enrolled</span>
              </article>
            )) : (
              <div className="dashboard-class-empty">
                <strong>You haven&apos;t joined a class yet.</strong>
                <span>Training remains available while you wait for an instructor code.</span>
              </div>
            )}
          </div>

          <form className="dashboard-class-join" onSubmit={submit}>
            <label htmlFor="dashboard-class-code">Class Code</label>
            <div>
              <input
                id="dashboard-class-code"
                value={classCode}
                onChange={(event) => {
                  setClassCode(event.target.value.toUpperCase())
                  clearFeedback()
                }}
                placeholder="TS-______"
                maxLength={9}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={submitting || !CLASS_CODE_PATTERN.test(normalizedCode)}
              >
                {submitting ? 'Joining...' : 'Join Class'}
              </button>
            </div>
            {(message || error) && (
              <p className={error ? 'is-error' : 'is-success'} role="status">
                {error || message}
              </p>
            )}
          </form>
        </div>
      )}
    </section>
  )
}
