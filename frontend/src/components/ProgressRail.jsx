export function ProgressRail({ current }) {
  const items = [['candidate', 'Candidate'], ['interview', 'Interview'], ['report', 'Report']]
  return <div className="progress-rail">{items.map(([id, label], index) => <div className={`rail-step ${current === id ? 'active' : ''} ${items.findIndex(([item]) => item === current) > index ? 'done' : ''}`} key={id}><span>{items.findIndex(([item]) => item === current) > index ? '✓' : `0${index + 1}`}</span><strong>{label}</strong></div>)}</div>
}
