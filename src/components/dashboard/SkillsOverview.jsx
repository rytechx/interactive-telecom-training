import { TRAINING_MODULE_IDS, TRAINING_MODULE_STATUS } from '../../app/trainingModules.js'

const skillDefinitions = Object.freeze([
  Object.freeze({ label: 'Copper Cabling', moduleId: TRAINING_MODULE_IDS.RJ45 }),
  Object.freeze({ label: 'Fiber Optics', moduleId: TRAINING_MODULE_IDS.FIBER }),
  Object.freeze({ label: 'Network Installation', moduleId: TRAINING_MODULE_IDS.NETWORK }),
  Object.freeze({ label: 'IPv4 Configuration', moduleId: TRAINING_MODULE_IDS.NETWORK }),
  Object.freeze({ label: 'CLI Configuration', moduleId: TRAINING_MODULE_IDS.NETWORK }),
  Object.freeze({ label: 'Network Troubleshooting', moduleId: TRAINING_MODULE_IDS.NETWORK }),
])

function getSkillStatus(moduleStatus) {
  if (moduleStatus === TRAINING_MODULE_STATUS.COMPLETED) {
    return 'Completed'
  }

  if (moduleStatus === TRAINING_MODULE_STATUS.IN_PROGRESS) {
    return 'Developing'
  }

  return 'Not Started'
}

export default function SkillsOverview({ modules }) {
  return (
    <section className="dashboard-panel skills-overview-panel">
      <div className="section-heading">
        <div>
          <span>Learning Coverage</span>
          <h2>Skills Overview</h2>
        </div>
      </div>
      <ul>
        {skillDefinitions.map((skill) => {
          const module = modules.find((item) => item.id === skill.moduleId)
          const status = getSkillStatus(module.status)

          return (
            <li key={skill.label}>
              <span>{skill.label}</span>
              <strong className={`is-${status.toLowerCase().replace(' ', '-')}`}>
                {status}
              </strong>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
