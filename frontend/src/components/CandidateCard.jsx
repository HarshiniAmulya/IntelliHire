export function CandidateCard({ candidate, selected, onSelect }) {
  return (
    <button className={`candidate-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(candidate)}>
      <div className="candidate-card-head">
        <span className="avatar">{candidate.avatar}</span>
        <span className="candidate-signal">{candidate.signal}</span>
      </div>
      <div className="candidate-copy">
        <h3>{candidate.name}</h3>
        <p>{candidate.role}</p>
        <span>{candidate.experience} <i /> {candidate.location}</span>
      </div>
      <div className="skill-list">
        {candidate.skills.map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <div className="select-indicator">{selected ? 'Selected' : 'Select candidate'} <span>↗</span></div>
    </button>
  )
}
