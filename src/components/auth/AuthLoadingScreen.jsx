export default function AuthLoadingScreen() {
  return (
    <div className="auth-loading-screen" role="status">
      <span className="application-brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <strong>TeleSim 3D</strong>
      <p>Checking your secure training session...</p>
      <div className="auth-loading-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}
