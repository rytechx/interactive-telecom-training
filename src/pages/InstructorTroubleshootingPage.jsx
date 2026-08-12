import { useEffect } from 'react'
import InstructorLoadingState from '../components/instructor/InstructorLoadingState.jsx'
import InstructorStatePanel from '../components/instructor/InstructorStatePanel.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useInstructorStore from '../store/useInstructorStore.js'
import {
  formatDuration,
  formatScore,
} from '../utils/instructorFormatters.js'

export default function InstructorTroubleshootingPage() {
  const analytics = useInstructorStore((state) => state.troubleshooting)
  const isLoading = useInstructorStore((state) => state.troubleshootingLoading)
  const error = useInstructorStore((state) => state.troubleshootingError)
  const loadAnalytics = useInstructorStore((state) => state.loadTroubleshooting)

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  if (!analytics && isLoading) {
    return <InstructorLoadingState label="Loading troubleshooting analytics..." />
  }

  if (!analytics && error) {
    return (
      <InstructorStatePanel
        title="Unable to load troubleshooting analytics"
        message={error}
        onAction={() => void loadAnalytics({ force: true })}
      />
    )
  }

  if (!analytics) return null

  return (
    <div className="application-page instructor-page instructor-troubleshooting-page">
      <PageHeader
        eyebrow="Diagnostic Performance"
        title="Troubleshooting Analytics"
        description="Review student performance across the six virtual network fault scenarios."
      />

      {analytics.totalNetworkAttempts === 0 ? (
        <InstructorStatePanel
          title="No troubleshooting activity yet"
          message="Scenario analytics will appear after students begin Network training attempts."
        />
      ) : (
        <>
          <section className="instructor-panel challenging-scenarios-panel">
            <header>
              <div>
                <span>Instructional Focus</span>
                <h2>Most Challenging Scenarios</h2>
              </div>
            </header>
            {analytics.mostChallenging.length ? (
              <ol>
                {analytics.mostChallenging.map((scenario) => (
                  <li key={scenario.scenarioKey}>
                    <strong>{scenario.scenarioTitle}</strong>
                    <span>Average Score: {formatScore(scenario.averageScore)}</span>
                    <small>
                      Average incorrect diagnoses: {formatScore(scenario.averageIncorrectDiagnoses)}
                    </small>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No completed scenarios are available for ranking.</p>
            )}
          </section>

          <section className="instructor-scenario-grid" aria-label="Scenario analytics">
            {analytics.scenarios.map((scenario, index) => (
              <article key={scenario.scenarioKey}>
                <header>
                  <span>Scenario {index + 1}</span>
                  <h2>{scenario.scenarioTitle}</h2>
                </header>
                <div className="instructor-progress-track" aria-hidden="true">
                  <span style={{ width: `${scenario.completionRate}%` }} />
                </div>
                <dl>
                  <div><dt>Students Attempted</dt><dd>{scenario.studentsAttempted}</dd></div>
                  <div><dt>Average Score</dt><dd>{formatScore(scenario.averageScore)}</dd></div>
                  <div><dt>Average Time</dt><dd>{formatDuration(scenario.averageCompletionTime)}</dd></div>
                  <div><dt>Diagnosis Attempts</dt><dd>{formatScore(scenario.averageDiagnosisAttempts)}</dd></div>
                  <div><dt>Wrong Diagnoses</dt><dd>{formatScore(scenario.averageIncorrectDiagnoses)}</dd></div>
                  <div><dt>Repair Attempts</dt><dd>{formatScore(scenario.averageRepairAttempts)}</dd></div>
                  <div><dt>Hints Used</dt><dd>{formatScore(scenario.averageHintsUsed)}</dd></div>
                  <div><dt>Completion Rate</dt><dd>{formatScore(scenario.completionRate, '%')}</dd></div>
                </dl>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
