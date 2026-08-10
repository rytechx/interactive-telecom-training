import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import InstructorAttemptDetail from '../components/instructor/InstructorAttemptDetail.jsx'
import InstructorLoadingState from '../components/instructor/InstructorLoadingState.jsx'
import InstructorPagination from '../components/instructor/InstructorPagination.jsx'
import InstructorStatePanel from '../components/instructor/InstructorStatePanel.jsx'
import useInstructorStore from '../store/useInstructorStore.js'
import {
  formatDate,
  formatDuration,
  formatScore,
  formatStatus,
  getStatusClass,
} from '../utils/instructorFormatters.js'

export default function InstructorStudentDetailPage() {
  const navigate = useNavigate()
  const { studentId } = useParams()
  const [attemptPage, setAttemptPage] = useState(1)
  const [selectedAttemptId, setSelectedAttemptId] = useState(null)
  const studentDetail = useInstructorStore((state) => state.selectedStudent)
  const detailLoading = useInstructorStore((state) => state.studentDetailLoading)
  const detailError = useInstructorStore((state) => state.studentDetailError)
  const attempts = useInstructorStore((state) => state.studentAttempts)
  const attemptPagination = useInstructorStore(
    (state) => state.studentAttemptPagination,
  )
  const attemptsLoading = useInstructorStore(
    (state) => state.studentAttemptsLoading,
  )
  const attemptsError = useInstructorStore((state) => state.studentAttemptsError)
  const attemptDetail = useInstructorStore((state) => state.attemptDetail)
  const attemptDetailLoading = useInstructorStore(
    (state) => state.attemptDetailLoading,
  )
  const attemptDetailError = useInstructorStore(
    (state) => state.attemptDetailError,
  )
  const loadStudentDetail = useInstructorStore((state) => state.loadStudentDetail)
  const loadStudentAttempts = useInstructorStore(
    (state) => state.loadStudentAttempts,
  )
  const loadAttemptDetail = useInstructorStore((state) => state.loadAttemptDetail)
  const clearAttemptDetail = useInstructorStore((state) => state.clearAttemptDetail)

  useEffect(() => {
    void loadStudentDetail(studentId)
  }, [loadStudentDetail, studentId])

  useEffect(() => {
    void loadStudentAttempts(studentId, { page: attemptPage, limit: 20 })
  }, [attemptPage, loadStudentAttempts, studentId])

  const openAttempt = (attemptId) => {
    setSelectedAttemptId(attemptId)
    void loadAttemptDetail(studentId, attemptId)
  }

  const closeAttempt = () => {
    setSelectedAttemptId(null)
    clearAttemptDetail()
  }

  if (!studentDetail && detailLoading) {
    return <InstructorLoadingState label="Loading student detail..." />
  }

  if (!studentDetail && detailError) {
    return (
      <InstructorStatePanel
        title="Unable to load student record"
        message={detailError}
        onAction={() => void loadStudentDetail(studentId)}
      />
    )
  }

  if (!studentDetail) return null
  const { student, summary, modules } = studentDetail

  return (
    <div className="application-page instructor-page instructor-student-detail-page">
      <header className="instructor-student-header">
        <button type="button" onClick={() => navigate('/instructor/students')}>
          Back to Students
        </button>
        <div>
          <span>Student Record</span>
          <h1>{student.fullName}</h1>
          <p>{student.studentNumber} · {student.email}</p>
        </div>
        <dl>
          <div><dt>Role</dt><dd>Student</dd></div>
          <div><dt>Account</dt><dd>{student.isActive ? 'Active' : 'Inactive'}</dd></div>
        </dl>
      </header>

      <section className="instructor-summary-grid" aria-label="Student training summary">
        <article><span>Modules Completed</span><strong>{summary.modulesCompleted} / {summary.totalModules}</strong></article>
        <article><span>Overall Progress</span><strong>{summary.overallProgress}%</strong></article>
        <article><span>Average Best Score</span><strong>{formatScore(summary.averageBestScore)}</strong></article>
        <article><span>Total Attempts</span><strong>{summary.totalAttempts}</strong></article>
        <article><span>Latest Activity</span><strong>{formatDate(summary.latestActivity)}</strong></article>
      </section>

      <section className="instructor-panel instructor-student-modules">
        <header>
          <div>
            <span>Module Summary</span>
            <h2>Training Progress</h2>
          </div>
        </header>
        <div className="instructor-student-module-grid">
          {modules.map((module) => (
            <article key={module.moduleKey}>
              <header>
                <div>
                  <span>{module.category}</span>
                  <h3>{module.moduleName}</h3>
                </div>
                <b className={`instructor-status ${getStatusClass(module.status)}`}>
                  {formatStatus(module.status)}
                </b>
              </header>
              <dl>
                <div><dt>Attempts</dt><dd>{module.attempts}</dd></div>
                <div><dt>Latest Score</dt><dd>{formatScore(module.latestScore)}</dd></div>
                <div><dt>Best Score</dt><dd>{formatScore(module.bestScore)}</dd></div>
                <div><dt>Performance</dt><dd>{module.performanceRating ?? 'Not available'}</dd></div>
                <div><dt>Latest Completion</dt><dd>{formatDate(module.latestCompletion)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="instructor-panel instructor-attempt-history">
        <header>
          <div>
            <span>Historical Records</span>
            <h2>Attempt History</h2>
          </div>
        </header>
        {attemptsLoading && !attempts.length ? (
          <InstructorLoadingState label="Loading attempt history..." />
        ) : attemptsError ? (
          <InstructorStatePanel
            title="Unable to load attempt history"
            message={attemptsError}
            onAction={() => void loadStudentAttempts(studentId, {
              page: attemptPage,
              limit: 20,
            })}
          />
        ) : attempts.length ? (
          <>
            <div className="instructor-table-scroll">
              <table className="instructor-table">
                <thead>
                  <tr>
                    <th scope="col">Module</th>
                    <th scope="col">Attempt</th>
                    <th scope="col">Status</th>
                    <th scope="col">Score</th>
                    <th scope="col">Performance</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Started</th>
                    <th scope="col">Completed</th>
                    <th scope="col"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.attemptId}>
                      <td><strong>{attempt.moduleName}</strong></td>
                      <td>#{attempt.attemptNumber}</td>
                      <td>{formatStatus(attempt.status)}</td>
                      <td>{formatScore(attempt.score)}</td>
                      <td>{attempt.performanceRating ?? 'Not available'}</td>
                      <td>{formatDuration(attempt.durationSeconds)}</td>
                      <td>{formatDate(attempt.startedAt, { includeTime: true })}</td>
                      <td>{formatDate(attempt.completedAt, { includeTime: true })}</td>
                      <td><button type="button" onClick={() => openAttempt(attempt.attemptId)}>View Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <InstructorPagination
              pagination={attemptPagination}
              onPageChange={setAttemptPage}
            />
          </>
        ) : (
          <div className="instructor-empty-state">
            <strong>No training attempts yet.</strong>
            <p>This student has not started a training module.</p>
          </div>
        )}
      </section>

      {selectedAttemptId && (
        <InstructorAttemptDetail
          attempt={attemptDetail}
          isLoading={attemptDetailLoading}
          error={attemptDetailError}
          onClose={closeAttempt}
          onRetry={() => void loadAttemptDetail(studentId, selectedAttemptId)}
        />
      )}
    </div>
  )
}
