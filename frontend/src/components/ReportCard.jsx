export function ReportCard({ report, onReset }) {
  return <section className="report-view">
    <div className="report-heading"><div><span className="eyebrow">Interview complete</span><h1>Decision intelligence<br /><em>for {report.candidate.name}.</em></h1></div><div className="score-orb"><strong>{report.overallScore}</strong><span>overall score</span></div></div>
    <div className="report-grid">
      <div className="report-panel recommendation"><span className="panel-label">Recommendation</span><h2>{report.recommendation}</h2><p>Evidence suggests a strong match for the {report.candidate.role} role.</p><div className="confidence"><span>Confidence</span><strong>High</strong><div><i /></div></div></div>
      <div className="report-panel"><span className="panel-label">Observed strengths</span>{report.strengths.map((item) => <p className="report-item" key={item}><b>+</b>{item}</p>)}</div>
      <div className="report-panel"><span className="panel-label">Growth edges</span>{report.weaknesses.map((item) => <p className="report-item" key={item}><b>↗</b>{item}</p>)}</div>
      <div className="report-panel learning"><span className="panel-label">Recommended learning</span>{report.learningTopics.map((topic) => <div className="learning-row" key={topic.id}><span>{topic.title}</span><small>{topic.description}</small><b>→</b></div>)}</div>
    </div>
    <button className="primary-button compact" onClick={onReset}>Evaluate another candidate <span>↗</span></button>
  </section>
}
