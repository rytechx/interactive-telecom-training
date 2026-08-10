import { useEffect, useState } from 'react'
import InstructorLoadingState from '../components/instructor/InstructorLoadingState.jsx'
import InstructorStatePanel from '../components/instructor/InstructorStatePanel.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useInstructorStore from '../store/useInstructorStore.js'
import { formatDuration, formatScore } from '../utils/instructorFormatters.js'

const diagnosticLabels = Object.freeze({
  averageMistakes: 'Average Mistakes',
  averageWrongToolSelections: 'Wrong Tool Selections',
  averageT568BValidationAttempts: 'T568B Validation Attempts',
  cableTestPassRate: 'Cable Test PASS Rate',
  averagePreparationErrors: 'Preparation Errors',
  averageSpliceLoss: 'Average Splice Loss',
  alignmentPassRate: 'Alignment PASS Rate',
  fusionPassRate: 'Fusion PASS Rate',
  finalInspectionPassRate: 'Final Inspection PASS Rate',
  configurationCompletionRate: 'Configuration Completion',
  pcToRouterPassRate: 'PC to Router PASS Rate',
  pcToSwitchPassRate: 'PC to Switch PASS Rate',
  averageTroubleshootingScenarioScore: 'Scenario Average Score',
  scenariosCompleted: 'Scenarios Completed',
})

function formatDiagnostic(key, value) {
  if (!Number.isFinite(value)) return 'Not available'
  if (key === 'averageSpliceLoss') return `${value.toFixed(2)} dB`
  if (key.toLowerCase().includes('rate')) return `${formatScore(value)}%`
  return formatScore(value)
}

export default function InstructorModulesPage() {
  const [selectedModuleKey, setSelectedModuleKey] = useState('rj45')
  const analytics = useInstructorStore((state) => state.moduleAnalytics)
  const isLoading = useInstructorStore((state) => state.moduleAnalyticsLoading)
  const error = useInstructorStore((state) => state.moduleAnalyticsError)
  const loadAnalytics = useInstructorStore((state) => state.loadModuleAnalytics)

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  if (!analytics && isLoading) {
    return <InstructorLoadingState label="Loading module analytics..." />
  }

  if (!analytics && error) {
    return (
      <InstructorStatePanel
        title="Unable to load module analytics"
        message={error}
        onAction={() => void loadAnalytics({ force: true })}
      />
    )
  }

  if (!analytics) return null
  if (!analytics.modules.length) {
    return (
      <InstructorStatePanel
        title="No module analytics available"
        message="Training module records are not available in the database."
      />
    )
  }

  const selectedModule = analytics.modules.find(
    (module) => module.moduleKey === selectedModuleKey,
  ) ?? analytics.modules[0]
  const maxDistribution = Math.max(
    1,
    ...selectedModule.scoreDistribution.map((band) => band.total),
  )

  return (
    <div className="application-page instructor-page instructor-modules-page">
      <PageHeader
        eyebrow="Program Analytics"
        title="Module Analytics"
        description="Compare participation, completion, assessment scores, and common problem indicators."
      />

      <section className="instructor-module-analytics-grid">
        {analytics.modules.map((module) => (
          <button
            key={module.moduleKey}
            type="button"
            className={selectedModule.moduleKey === module.moduleKey ? 'is-selected' : ''}
            onClick={() => setSelectedModuleKey(module.moduleKey)}
          >
            <span>{module.category}</span>
            <strong>{module.moduleName}</strong>
            <dl>
              <div><dt>Total Attempts</dt><dd>{module.totalAttempts}</dd></div>
              <div><dt>Students Attempted</dt><dd>{module.studentsAttempted}</dd></div>
              <div><dt>Students Completed</dt><dd>{module.studentsCompleted}</dd></div>
              <div><dt>Completion Rate</dt><dd>{module.completionRate}%</dd></div>
              <div><dt>Average Score</dt><dd>{formatScore(module.averageScore)}</dd></div>
              <div><dt>Average Best</dt><dd>{formatScore(module.averageBestScore)}</dd></div>
            </dl>
          </button>
        ))}
      </section>

      <section className="instructor-panel instructor-module-detail">
        <header>
          <div>
            <span>{selectedModule.category}</span>
            <h2>{selectedModule.moduleName}</h2>
          </div>
          <strong>{selectedModule.completionRate}% completed</strong>
        </header>

        <div className="instructor-module-detail-grid">
          <section>
            <h3>Score Distribution</h3>
            <div className="instructor-distribution-chart">
              {selectedModule.scoreDistribution.map((band) => (
                <div key={band.key}>
                  <span>{band.label}</span>
                  <div aria-hidden="true">
                    <i style={{ width: `${(band.total / maxDistribution) * 100}%` }} />
                  </div>
                  <b>{band.total}</b>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Completion &amp; Duration</h3>
            <div className="instructor-completion-visual">
              <div className="instructor-progress-track" aria-hidden="true">
                <span style={{ width: `${selectedModule.completionRate}%` }} />
              </div>
              <p>
                {selectedModule.studentsCompleted} of {selectedModule.totalStudents} students completed this module.
              </p>
              <dl>
                <div><dt>Average Duration</dt><dd>{formatDuration(selectedModule.averageDurationSeconds)}</dd></div>
                <div><dt>Average Score</dt><dd>{formatScore(selectedModule.averageScore)}</dd></div>
                <div><dt>Average Best Score</dt><dd>{formatScore(selectedModule.averageBestScore)}</dd></div>
              </dl>
            </div>
          </section>

          <section className="instructor-diagnostic-section">
            <h3>Common Performance Indicators</h3>
            <dl>
              {Object.entries(selectedModule.diagnostics).map(([key, value]) => (
                <div key={key}>
                  <dt>{diagnosticLabels[key]}</dt>
                  <dd>{formatDiagnostic(key, value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </section>
    </div>
  )
}
