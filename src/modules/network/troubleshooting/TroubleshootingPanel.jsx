import { NETWORK_OVERLAYS } from '../../../store/useNetworkTrainingStore.js'
import { NETWORK_TOPOLOGY } from '../networkTopology.js'
import {
  NETWORK_TROUBLESHOOTING_DIAGNOSES,
  NETWORK_TROUBLESHOOTING_MODES,
} from './troubleshootingScenarios.js'

const troubleshootingMethodology = Object.freeze([
  'Identify symptoms',
  'Check physical connectivity',
  'Verify device power',
  'Check link indicators',
  'Inspect IP configuration',
  'Test connectivity',
  'Inspect interface configuration',
  'Identify root cause',
  'Apply repair',
  'Verify service restoration',
])

export default function TroubleshootingPanel({
  scenario,
  mode,
  diagnosisId,
  diagnosisConfirmed,
  feedback,
  hintLevel,
  methodologyVisible,
  verificationResults,
  metrics,
  selectedCableName,
  repairTargetName,
  onDiagnosisChange,
  onSubmitDiagnosis,
  onVerifyRepair,
  onRequestHint,
  onToggleMethodology,
  onOpenTool,
  onRestart,
  onExit,
  onNextScenario,
  onReturnToSelection,
  onReturnToLaboratory,
}) {
  const complete = mode === NETWORK_TROUBLESHOOTING_MODES.COMPLETE
  const elapsedSeconds = metrics.scenarioStartTime
    ? Math.max(
        0,
        Math.round(
          ((metrics.scenarioEndTime ?? metrics.scenarioStartTime) -
            metrics.scenarioStartTime) /
            1000,
        ),
      )
    : 0

  return (
    <section
      className={`training-panel procedure-panel network-troubleshooting-panel${
        selectedCableName && !complete ? ' is-port-repair' : ''
      }`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="network-troubleshooting-title"
    >
      <span className="procedure-step-number">
        Scenario {scenario.number} of 6
      </span>
      <h1 id="network-troubleshooting-title">Network Troubleshooting</h1>

      {!complete ? (
        <>
          <div className="troubleshooting-incident">
            <strong>Incident</strong>
            <p>{scenario.symptom}</p>
          </div>

          <dl className="troubleshooting-status-grid">
            <div>
              <dt>Diagnosis</dt>
              <dd className={diagnosisConfirmed ? 'is-pass' : ''}>
                {diagnosisConfirmed ? 'Confirmed' : 'Not Submitted'}
              </dd>
            </div>
            <div>
              <dt>Repair</dt>
              <dd>Not Verified</dd>
            </div>
          </dl>

          {selectedCableName && (
            <dl className="troubleshooting-repair-selection">
              <div>
                <dt>Selected Cable</dt>
                <dd>{selectedCableName}</dd>
              </div>
              {repairTargetName && (
                <div>
                  <dt>Valid Destination</dt>
                  <dd>{repairTargetName}</dd>
                </div>
              )}
            </dl>
          )}

          <div className="troubleshooting-tools">
            <strong>Diagnostic Tools</strong>
            <div>
              <button
                type="button"
                onClick={() =>
                  onOpenTool(NETWORK_OVERLAYS.WORKSTATION_TERMINAL)
                }
              >
                PC Terminal
              </button>
              <button
                type="button"
                onClick={() => onOpenTool(NETWORK_OVERLAYS.PC_SETTINGS)}
              >
                IPv4 Settings
              </button>
              <button
                type="button"
                onClick={() => onOpenTool(NETWORK_OVERLAYS.ROUTER_TERMINAL)}
              >
                Router CLI
              </button>
              <button
                type="button"
                onClick={() => onOpenTool(NETWORK_OVERLAYS.SWITCH_TERMINAL)}
              >
                Switch CLI
              </button>
            </div>
          </div>

          <label className="troubleshooting-diagnosis-field">
            <span>Likely Diagnosis</span>
            <select
              value={diagnosisId}
              onChange={(event) => onDiagnosisChange(event.target.value)}
              disabled={diagnosisConfirmed}
            >
              <option value="">Select a diagnosis</option>
              {NETWORK_TROUBLESHOOTING_DIAGNOSES.map((diagnosis) => (
                <option key={diagnosis.id} value={diagnosis.id}>
                  {diagnosis.label}
                </option>
              ))}
            </select>
          </label>

          {feedback && (
            <p className="troubleshooting-feedback" role="status">
              {feedback}
            </p>
          )}

          {hintLevel > 0 && (
            <div className="troubleshooting-hints">
              <strong>Progressive Hints</strong>
              {scenario.hints.slice(0, hintLevel).map((hint, index) => (
                <p key={hint}>
                  Hint {index + 1}: {hint}
                </p>
              ))}
            </div>
          )}

          <div className="training-actions procedure-primary-actions troubleshooting-primary-actions">
            <button type="button" onClick={onSubmitDiagnosis}>
              Submit Diagnosis
            </button>
            <button type="button" onClick={onVerifyRepair}>
              Verify Repair
            </button>
          </div>

          <div className="troubleshooting-reference-actions">
            <button
              type="button"
              className="secondary"
              onClick={onRequestHint}
              disabled={hintLevel >= scenario.hints.length}
            >
              {hintLevel >= scenario.hints.length ? 'All Hints Used' : 'Show Hint'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={onToggleMethodology}
            >
              {methodologyVisible ? 'Hide Method' : 'Methodology'}
            </button>
          </div>

          {methodologyVisible && (
            <ol className="troubleshooting-methodology">
              {troubleshootingMethodology.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}

          <div className="training-actions procedure-secondary-actions">
            <button type="button" className="secondary" onClick={onRestart}>
              Restart Scenario
            </button>
            <button type="button" className="secondary" onClick={onExit}>
              Exit Troubleshooting
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="troubleshooting-success" role="status">
            <strong>Troubleshooting Complete</strong>
            <dl>
              <div>
                <dt>Root Cause</dt>
                <dd>{scenario.rootCause}</dd>
              </div>
              <div>
                <dt>Repair</dt>
                <dd>{scenario.repair}</dd>
              </div>
              <div>
                <dt>Relevant Layer</dt>
                <dd>{scenario.relevantLayer}</dd>
              </div>
            </dl>
          </div>

          <div className="troubleshooting-verification">
            <strong>Verification: Pass</strong>
            <span>PC to Router: {verificationResults.routerPing ? 'PASS' : 'FAIL'}</span>
            <span>PC to Switch: {verificationResults.switchPing ? 'PASS' : 'FAIL'}</span>
            {scenario.id === 'wrong-default-gateway' && (
              <span>
                PC to {NETWORK_TOPOLOGY.remoteHost.name}:{' '}
                {verificationResults.remotePing ? 'PASS' : 'FAIL'}
              </span>
            )}
            <span>
              Physical Links: {verificationResults.physicalLinksActive ? 'ACTIVE' : 'DOWN'}
            </span>
            <span>Required Power: {verificationResults.requiredPowerOn ? 'ON' : 'OFF'}</span>
          </div>

          <div className="troubleshooting-metrics-summary">
            <span>Time <strong>{elapsedSeconds}s</strong></span>
            <span>Commands <strong>{metrics.diagnosticCommandsUsed.length}</strong></span>
            <span>Pings <strong>{metrics.pingAttempts}</strong></span>
            <span>Hints <strong>{metrics.hintsUsed}</strong></span>
          </div>

          <div className="training-actions procedure-primary-actions troubleshooting-complete-actions">
            <button type="button" onClick={onNextScenario}>
              Next Scenario
            </button>
            <button type="button" onClick={onReturnToSelection}>
              Scenario Selection
            </button>
          </div>
          <div className="training-actions procedure-secondary-actions">
            <button
              type="button"
              className="secondary"
              onClick={onReturnToLaboratory}
            >
              Return to Laboratory
            </button>
          </div>
        </>
      )}
    </section>
  )
}
