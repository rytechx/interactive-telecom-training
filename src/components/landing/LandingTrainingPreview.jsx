const previewTools = Object.freeze([
  'Wire Stripper',
  'RJ45 Plug',
  'Crimping Tool',
  'Cable Tester',
])

const conductorColors = Object.freeze([
  'white-orange',
  'orange',
  'white-green',
  'blue',
  'white-blue',
  'green',
  'white-brown',
  'brown',
])

export default function LandingTrainingPreview() {
  return (
    <section
      id="preview"
      className="landing-section landing-preview-section"
      aria-labelledby="landing-preview-title"
    >
      <div className="landing-container landing-preview-layout">
        <div className="landing-preview-copy" data-reveal>
          <span className="landing-eyebrow">Inside the Training Experience</span>
          <h2 id="landing-preview-title">From Procedure to Practical Performance</h2>
          <p>
            Clear objectives, interactive equipment, guided procedures, and
            practical checks keep every task focused on applied technical skills.
          </p>
          <div className="landing-preview-benefits">
            <span><i /> Step-based guidance</span>
            <span><i /> Tool and equipment interaction</span>
            <span><i /> Persistent assessment results</span>
          </div>
        </div>

        <div className="landing-workstation-preview" data-reveal>
          <header>
            <div>
              <span>Current Training</span>
              <strong>RJ45 Cable Termination</strong>
            </div>
            <span className="landing-preview-live"><i /> Guided Session</span>
          </header>

          <div className="landing-preview-progress">
            <div>
              <span>Step 05 / 19</span>
              <strong>Arrange the Conductors</strong>
            </div>
            <span>26%</span>
          </div>
          <div className="landing-preview-progress-bar"><i /></div>

          <div className="landing-preview-instruction">
            <span>Procedure Instruction</span>
            <p>Arrange the wires using the T568B wiring standard.</p>
            <div className="landing-conductor-order" aria-label="T568B conductor order">
              {conductorColors.map((color, index) => (
                <i className={color} key={color} title={`Conductor ${index + 1}`} />
              ))}
            </div>
          </div>

          <div className="landing-preview-lower-grid">
            <div>
              <span>Available Tools</span>
              <ul>
                {previewTools.map((tool) => <li key={tool}>{tool}</li>)}
              </ul>
            </div>
            <div className="landing-preview-status">
              <span>Training Status</span>
              <p><i /> Procedure Guided</p>
              <p><i /> Assessment Active</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
