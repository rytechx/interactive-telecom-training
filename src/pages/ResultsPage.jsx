import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAINING_MODULES } from '../app/trainingModules.js'
import PageHeader from '../components/layout/PageHeader.jsx'
import useTrainingPersistenceStore from '../store/useTrainingPersistenceStore.js'
import TelecomIcon from '../ui/TelecomIcon.jsx'

const resultFilters = Object.freeze([
  Object.freeze({ key: 'all', label: 'All Modules', moduleKey: null }),
  Object.freeze({ key: 'rj45', label: 'RJ45', moduleKey: 'rj45' }),
  Object.freeze({ key: 'fiber', label: 'Fiber', moduleKey: 'fiber' }),
  Object.freeze({ key: 'network', label: 'Network', moduleKey: 'network' }),
])

const metricLabels = Object.freeze({
  mistakes: 'Recorded Mistakes',
  wrongToolSelections: 'Wrong Tool Selections',
  incorrectT568BAttempts: 'Incorrect T568B Attempts',
  restartStepCount: 'Restart Step Count',
  cableTest: 'Cable Test',
  terminationStandard: 'Termination Standard',
  t568bVerified: 'T568B Verified',
  spliceLossDb: 'Splice Loss',
  alignment: 'Alignment',
  fusion: 'Fusion',
  protection: 'Protection',
  heater: 'Heater Cycle',
  finalInspection: 'Final Inspection',
  physicalInstallation: 'Physical Installation',
  routerConfiguration: 'Router Configuration',
  switchConfiguration: 'Switch Configuration',
  pcToRouter: 'PC to Router',
  pcToSwitch: 'PC to Switch',
  troubleshootingCompleted: 'Scenarios Completed',
  averageScore: 'Scenario Average',
})

function formatDuration(durationSeconds) {
  if (!Number.isFinite(durationSeconds)) return '—'
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatMetricValue(key, value) {
  if (key === 'spliceLossDb' && Number.isFinite(value)) {
    return `${value.toFixed(2)} dB`
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return `${value.length} recorded`
  if (value && typeof value === 'object') return 'Recorded'
  return String(value)
}

function AttemptDetails({ attempt, isLoading, error, onClose, onRetry }) {
  if (isLoading) {
    return (
      <aside className="attempt-detail-panel" aria-busy="true">
        Loading result details...
      </aside>
    )
  }

  if (error) {
    return (
      <aside className="attempt-detail-panel result-load-error" role="alert">
        <p>{error}</p>
        <div>
          <button type="button" onClick={onRetry}>Retry</button>
          <button type="button" className="secondary" onClick={onClose}>Close</button>
        </div>
      </aside>
    )
  }

  if (!attempt) return null
  const visibleMetrics = Object.entries(attempt.metrics ?? {}).filter(
    ([key]) => metricLabels[key],
  )

  return (
    <aside className="attempt-detail-panel" aria-labelledby="attempt-detail-title">
      <header>
        <div>
          <span>{attempt.moduleName}</span>
          <h2 id="attempt-detail-title">Attempt #{attempt.attemptNumber}</h2>
        </div>
        <button type="button" className="secondary" onClick={onClose}>Close</button>
      </header>

      <dl className="attempt-detail-summary">
        <div><dt>Score</dt><dd>{attempt.score}%</dd></div>
        <div><dt>Performance</dt><dd>{attempt.performanceRating}</dd></div>
        <div><dt>Accuracy</dt><dd>{attempt.procedureAccuracy ?? '—'}{attempt.procedureAccuracy !== null ? '%' : ''}</dd></div>
        <div><dt>Duration</dt><dd>{formatDuration(attempt.durationSeconds)}</dd></div>
      </dl>

      {visibleMetrics.length > 0 && (
        <section className="historical-metrics">
          <h3>Assessment Metrics</h3>
          <dl>
            {visibleMetrics.map(([key, value]) => (
              <div key={key}>
                <dt>{metricLabels[key]}</dt>
                <dd>{formatMetricValue(key, value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {attempt.scenarios?.length > 0 && (
        <section className="historical-scenarios">
          <h3>Network Scenario Results</h3>
          <div className="historical-scenario-list">
            {attempt.scenarios.map((scenario) => (
              <article key={scenario.scenarioKey}>
                <div>
                  <strong>{scenario.scenarioTitle}</strong>
                  <span>{scenario.performanceRating}</span>
                </div>
                <b>{scenario.score}%</b>
              </article>
            ))}
          </div>
        </section>
      )}
    </aside>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedAttemptId, setSelectedAttemptId] = useState(null)
  const attempts = useTrainingPersistenceStore((state) => state.attempts)
  const attemptDetails = useTrainingPersistenceStore(
    (state) => state.attemptDetails,
  )
  const isLoadingAttempts = useTrainingPersistenceStore(
    (state) => state.isLoadingAttempts,
  )
  const attemptsError = useTrainingPersistenceStore(
    (state) => state.attemptsError,
  )
  const detailLoadingId = useTrainingPersistenceStore(
    (state) => state.detailLoadingId,
  )
  const detailError = useTrainingPersistenceStore((state) => state.detailError)
  const loadAttempts = useTrainingPersistenceStore((state) => state.loadAttempts)
  const loadAttemptDetail = useTrainingPersistenceStore(
    (state) => state.loadAttemptDetail,
  )
  const selectedFilter = resultFilters.find(
    (filter) => filter.key === activeFilter,
  )

  useEffect(() => {
    void loadAttempts({
      moduleKey: selectedFilter.moduleKey,
      status: 'completed',
      limit: 100,
    })
  }, [loadAttempts, selectedFilter.moduleKey])

  const handleViewDetails = (attemptId) => {
    setSelectedAttemptId(attemptId)
    if (!attemptDetails[attemptId]) {
      void loadAttemptDetail(attemptId)
    }
  }

  return (
    <div className="application-page results-page">
      <PageHeader
        eyebrow="Persistent History"
        title="Training Results"
        description="Review completed attempts and assessment details saved to your student account."
      />

      <div className="results-filter-bar" aria-label="Filter training results">
        {resultFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={activeFilter === filter.key ? 'is-active' : ''}
            onClick={() => {
              setActiveFilter(filter.key)
              setSelectedAttemptId(null)
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoadingAttempts ? (
        <section className="results-loading-state" aria-busy="true">
          Loading training history...
        </section>
      ) : attemptsError ? (
        <section className="results-empty-state" role="alert">
          <h2>Unable to load training results</h2>
          <p>{attemptsError}</p>
          <button type="button" onClick={() => void loadAttempts({
            moduleKey: selectedFilter.moduleKey,
            status: 'completed',
            limit: 100,
          })}>
            Retry
          </button>
        </section>
      ) : attempts.length === 0 ? (
        <section className="results-empty-state">
          <div><TelecomIcon name="results" size={34} /></div>
          <h2>No completed results yet</h2>
          <p>Complete a training module to add a persistent result here.</p>
          <button type="button" onClick={() => navigate('/training')}>
            View Training Modules
          </button>
        </section>
      ) : (
        <section className="attempt-history" aria-label="Completed training attempts">
          <div className="attempt-history-header" aria-hidden="true">
            <span>Module</span>
            <span>Attempt</span>
            <span>Score</span>
            <span>Performance</span>
            <span>Duration</span>
            <span>Completed</span>
            <span />
          </div>
          {attempts.map((attempt) => {
            const module = TRAINING_MODULES.find(
              (item) => item.id === attempt.moduleKey,
            )

            return (
              <article key={attempt.attemptId} className="attempt-history-row">
                <strong>{module?.shortTitle ?? attempt.moduleName}</strong>
                <span>#{attempt.attemptNumber}</span>
                <b>{attempt.score}%</b>
                <span>{attempt.performanceRating}</span>
                <span>{formatDuration(attempt.durationSeconds)}</span>
                <time dateTime={attempt.completedAt}>
                  {formatDate(attempt.completedAt)}
                </time>
                <button type="button" onClick={() => handleViewDetails(attempt.attemptId)}>
                  View Details
                </button>
              </article>
            )
          })}
        </section>
      )}

      {selectedAttemptId && (
        <AttemptDetails
          attempt={attemptDetails[selectedAttemptId]}
          isLoading={detailLoadingId === selectedAttemptId}
          error={detailError}
          onClose={() => setSelectedAttemptId(null)}
          onRetry={() => void loadAttemptDetail(selectedAttemptId)}
        />
      )}
    </div>
  )
}
