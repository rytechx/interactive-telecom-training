import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import InstructorLoadingState from '../components/instructor/InstructorLoadingState.jsx'
import InstructorStatePanel from '../components/instructor/InstructorStatePanel.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useInstructorStore from '../store/useInstructorStore.js'
import {
  formatDate,
  formatScore,
} from '../utils/instructorFormatters.js'

const metricDefinitions = Object.freeze([
  Object.freeze({ key: 'totalStudents', label: 'Total Students' }),
  Object.freeze({ key: 'activeStudents', label: 'Active Students' }),
  Object.freeze({ key: 'studentsWithActivity', label: 'With Training Activity' }),
  Object.freeze({ key: 'studentsCompletingAllModules', label: 'Completed All Modules' }),
  Object.freeze({ key: 'averageOverallScore', label: 'Average Overall Score', score: true }),
  Object.freeze({ key: 'totalCompletedAttempts', label: 'Completed Attempts' }),
])

export default function InstructorOverviewPage() {
  const navigate = useNavigate()
  const overview = useInstructorStore((state) => state.overview)
  const isLoading = useInstructorStore((state) => state.overviewLoading)
  const error = useInstructorStore((state) => state.overviewError)
  const loadOverview = useInstructorStore((state) => state.loadOverview)

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  if (!overview && isLoading) {
    return <InstructorLoadingState label="Loading instructor overview..." />
  }

  if (!overview && error) {
    return (
      <InstructorStatePanel
        title="Unable to load student analytics"
        message={error}
        onAction={() => void loadOverview({ force: true })}
      />
    )
  }

  if (!overview) return null

  return (
    <div className="application-page instructor-page instructor-overview-page">
      <PageHeader
        eyebrow="Training Management"
        title="Instructor Overview"
        description="Monitor student participation, module completion, and recent assessment outcomes."
      />

      <section className="instructor-kpi-grid" aria-label="Training overview metrics">
        {metricDefinitions.map((metric) => (
          <article key={metric.key}>
            <span>{metric.label}</span>
            <strong>
              {metric.score
                ? formatScore(overview.metrics[metric.key])
                : overview.metrics[metric.key]}
            </strong>
          </article>
        ))}
      </section>

      <div className="instructor-overview-grid">
        <section className="instructor-panel instructor-module-completion">
          <header>
            <div>
              <span>Completion Summary</span>
              <h2>Core Training Modules</h2>
            </div>
            <button type="button" onClick={() => navigate('/instructor/modules')}>
              View Analytics
            </button>
          </header>
          <div>
            {overview.modules.map((module) => (
              <article key={module.moduleKey}>
                <div>
                  <strong>{module.moduleName}</strong>
                  <span>
                    {module.studentsCompleted} / {module.totalStudents} completed
                  </span>
                </div>
                <b>{module.completionRate}%</b>
                <div className="instructor-progress-track" aria-hidden="true">
                  <span style={{ width: `${module.completionRate}%` }} />
                </div>
                <small>
                  Average Best Score: {formatScore(module.averageBestScore)}
                </small>
              </article>
            ))}
          </div>
        </section>

        <section className="instructor-panel instructor-status-breakdown">
          <header>
            <div>
              <span>Student Status</span>
              <h2>Training Progress Breakdown</h2>
            </div>
          </header>
          <dl>
            <div><dt>Not Started</dt><dd>{overview.statusBreakdown.notStarted}</dd></div>
            <div><dt>In Progress</dt><dd>{overview.statusBreakdown.inProgress}</dd></div>
            <div><dt>Completed</dt><dd>{overview.statusBreakdown.completed}</dd></div>
            <div><dt>Needs Practice</dt><dd>{overview.statusBreakdown.needsPractice}</dd></div>
          </dl>
          <p>
            Needs Practice identifies students with at least one best module score below {overview.statusPolicy.needsPracticeThreshold}.
          </p>
        </section>
      </div>

      <section className="instructor-panel instructor-recent-activity">
        <header>
          <div>
            <span>Recent Activity</span>
            <h2>Completed Training Attempts</h2>
          </div>
          {overview.recentActivity.length > 0 && (
            <button type="button" onClick={() => navigate('/instructor/results')}>
              View All Results
            </button>
          )}
        </header>
        {overview.recentActivity.length ? (
          <div className="instructor-activity-list">
            {overview.recentActivity.map((attempt) => (
              <article key={attempt.attemptId}>
                <div>
                  <strong>{attempt.studentName}</strong>
                  <span>Completed {attempt.moduleName}</span>
                </div>
                <b>{formatScore(attempt.score, '%')}</b>
                <time dateTime={attempt.completedAt}>
                  {formatDate(attempt.completedAt, { includeTime: true })}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className="instructor-empty-state">
            <strong>No student training activity yet.</strong>
            <p>Student results will appear here after training attempts are completed.</p>
          </div>
        )}
      </section>
    </div>
  )
}
