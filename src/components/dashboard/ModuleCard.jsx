import { TRAINING_MODULE_STATUS } from '../../app/trainingModules.js'
import TelecomIcon from '../../ui/TelecomIcon.jsx'

const statusLabels = Object.freeze({
  [TRAINING_MODULE_STATUS.NOT_ATTEMPTED]: 'Not Attempted',
  [TRAINING_MODULE_STATUS.IN_PROGRESS]: 'In Progress',
  [TRAINING_MODULE_STATUS.COMPLETED]: 'Completed',
})

export default function ModuleCard({ module, onLaunch, compact = false }) {
  const completed = module.status === TRAINING_MODULE_STATUS.COMPLETED
  const inProgress = module.status === TRAINING_MODULE_STATUS.IN_PROGRESS
  const actionLabel = completed ? 'Retry' : inProgress ? 'Continue' : 'Start Training'

  return (
    <article className={`training-module-card module-${module.id}${compact ? ' is-compact' : ''}`}>
      <header>
        <div className="training-module-icon">
          <TelecomIcon name={module.icon} size={28} />
        </div>
        <span className={`module-status is-${module.status}`}>
          {completed ? 'PASS · ' : ''}
          {statusLabels[module.status]}
        </span>
      </header>
      <div className="training-module-card-body">
        <span className="module-category">{module.category}</span>
        <h3>{module.title}</h3>
        <p>{module.description}</p>
      </div>
      <div className="module-card-meta">
        <span>Difficulty <strong>{module.difficulty}</strong></span>
        {module.result && (
          <span>
            Latest <strong>{module.result.latestScore}%</strong>
            {module.result.bestScore !== module.result.latestScore && (
              <small>Best {module.result.bestScore}%</small>
            )}
          </span>
        )}
        {inProgress && (
          <span>Current Stage <strong>{module.progressLabel}</strong></span>
        )}
      </div>
      <div className="module-card-progress" aria-hidden="true">
        <span style={{ width: `${module.progressPercent}%` }} />
      </div>
      <button type="button" onClick={() => onLaunch(module.id)}>
        {actionLabel}
        <TelecomIcon name="arrow" size={16} />
      </button>
    </article>
  )
}
