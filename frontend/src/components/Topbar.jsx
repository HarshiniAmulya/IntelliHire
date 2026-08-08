export function Topbar({ onReset, step }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onReset} aria-label="Return to dashboard">
        <span className="brand-mark">i</span>
        <span>intellihire<span className="brand-dot">.</span>ai</span>
      </button>
      <div className="topbar-meta">
        <span className="status-dot" />
        <span>AI interviewer online</span>
        <span className="step-label">{step === 'landing' ? 'Workspace' : `Step ${step === 'candidate' ? '01' : step === 'interview' ? '02' : '03'} / 03`}</span>
      </div>
    </header>
  )
}
