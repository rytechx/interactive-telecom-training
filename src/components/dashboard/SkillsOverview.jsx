export default function SkillsOverview({ skills }) {
  return (
    <section className="dashboard-panel skills-overview-panel">
      <div className="section-heading">
        <div>
          <span>Learning Coverage</span>
          <h2>Skills Overview</h2>
        </div>
      </div>
      <ul>
        {skills.map((skill) => (
          <li key={skill.id}>
            <div>
              <span>{skill.label}</span>
              <strong className={`is-${skill.status.toLowerCase().replaceAll(' ', '-')}`}>
                {skill.status}
              </strong>
            </div>
            <div className="skill-progress-row">
              <div
                className="skill-progress-track"
                role="progressbar"
                aria-label={`${skill.label} progress`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={skill.progress}
              >
                <span style={{ width: `${skill.progress}%` }} />
              </div>
              <b>{skill.progress}%</b>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
