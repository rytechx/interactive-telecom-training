import PersistenceStatus from '../../../components/training/PersistenceStatus.jsx'
import useSettingsStore from '../../../store/useSettingsStore.js'
import { confirmTrainingRestart } from '../../../utils/trainingConfirmations.js'
import { calculateFinalNetworkAssessment } from './networkAssessment.js'

const completionSummary = Object.freeze([
  'Physical Installation',
  'IPv4 Configuration',
  'Router Configuration',
  'Switch Configuration',
  'PC → Router',
  'PC → Switch',
])

const procedureChecklist = Object.freeze([
  'Installed network equipment',
  'Connected device power',
  'Connected Ethernet links',
  'Verified link indicators',
  'Configured workstation IPv4',
  'Configured router LAN',
  'Configured switch management',
  'Verified PC → Router',
  'Verified PC → Switch',
  'Completed all troubleshooting scenarios',
])

export default function NetworkAssessment({
  scenarioResults,
  onRetryWeakScenarios,
  onReturnToSelection,
  onRestartNetworkModule,
  onReturnToLaboratory,
}) {
  const confirmRestart = useSettingsStore((state) => state.confirmRestart)
  const assessment = calculateFinalNetworkAssessment(scenarioResults)
  const handleRestartNetworkModule = () => {
    if (confirmTrainingRestart('module', confirmRestart)) {
      onRestartNetworkModule()
    }
  }

  if (!assessment) {
    return null
  }

  return (
    <section
      className="rj45-assessment-panel network-assessment-panel network-final-assessment"
      role="dialog"
      aria-modal="true"
      aria-labelledby="network-final-assessment-title"
    >
      <header className="assessment-header">
        <div>
          <span className="assessment-eyebrow">
            Network Device Installation &amp; Troubleshooting
          </span>
          <h1 id="network-final-assessment-title">Training Complete</h1>
        </div>
        <div className="assessment-score-summary" aria-label="Final network score">
          <span>Final Score</span>
          <strong>{assessment.finalScore} / 100</strong>
          <small>
            <span>Performance</span>
            {assessment.performanceRating}
          </small>
          <em>Scenario average: {assessment.averageScore}</em>
        </div>
      </header>

      <div className="assessment-content-grid network-assessment-grid">
        <div className="assessment-column">
          <section className="assessment-section">
            <h2>Network Training Summary</h2>
            <ul className="network-final-status-list">
              {completionSummary.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                  <strong>PASS</strong>
                </li>
              ))}
              <li>
                <span>Troubleshooting Scenarios</span>
                <strong>6 / 6 COMPLETE</strong>
              </li>
            </ul>
          </section>

          <section className="assessment-section">
            <h2>Scenario Scores</h2>
            <ol className="network-final-scenario-list">
              {assessment.scenarioScores.map((scenario) => (
                <li key={scenario.scenarioId}>
                  <span>
                    <small>Scenario {scenario.scenarioNumber}</small>
                    {scenario.scenarioTitle}
                  </span>
                  <strong>{scenario.score}</strong>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="assessment-column">
          <section className="assessment-section">
            <h2>Skill Summary</h2>
            <ul className="network-competency-list">
              {assessment.competencies.map((competency) => (
                <li key={competency.label}>
                  <span>{competency.label}</span>
                  <strong className={competency.status === 'PASS' ? 'is-pass' : ''}>
                    {competency.status}
                  </strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="assessment-section">
            <h2>Final Procedure Checklist</h2>
            <ul className="assessment-checklist network-final-checklist">
              {procedureChecklist.map((item) => (
                <li key={item} className="is-complete">
                  <span aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="assessment-actions network-assessment-actions">
        <button
          type="button"
          onClick={onRetryWeakScenarios}
          disabled={!assessment.weakScenarioIds.length}
        >
          Retry Weak Scenarios
        </button>
        <button type="button" className="secondary" onClick={onReturnToSelection}>
          Scenario Selection
        </button>
        <button type="button" className="secondary" onClick={handleRestartNetworkModule}>
          Restart Network Module
        </button>
        <button type="button" className="secondary" onClick={onReturnToLaboratory}>
          Return to Laboratory
        </button>
      </footer>
      <PersistenceStatus moduleKey="network" />
    </section>
  )
}
