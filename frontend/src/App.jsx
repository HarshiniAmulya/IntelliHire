import { useEffect, useState } from 'react'
import './App.css'
import { CandidateCard } from './components/CandidateCard'
import { ProgressRail } from './components/ProgressRail'
import { ReportCard } from './components/ReportCard'
import { Topbar } from './components/Topbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function requestJson(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new Error('Unable to connect to the IntelliHire API. Confirm that FastAPI is running on port 8000.')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.detail || `API request failed (${response.status})`)
  }
  return data
}

function App() {
  const [screen, setScreen] = useState('landing')
  const [candidates, setCandidates] = useState([])
  const [candidate, setCandidate] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [questionNumber, setQuestionNumber] = useState(1)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    requestJson('/candidates').then((data) => {
      if (active) setCandidates(Array.isArray(data) ? data : [])
    }).catch((requestError) => {
      if (active) setError(requestError.message)
    })
    return () => { active = false }
  }, [])

  const reset = () => {
    setScreen('landing'); setCandidate(null); setSessionId(null); setReport(null); setAnswer(''); setQuestionNumber(1); setError('')
  }

  const startInterview = async () => {
    if (!candidate || loading) return
    setLoading(true); setError('')
    try {
      const data = await requestJson('/interviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_id: candidate.id }) })
      if (!data?.sessionId || !data?.question) throw new Error('The API returned an incomplete interview session.')
      setSessionId(data.sessionId); setQuestion(data.question); setScreen('interview')
    } catch (requestError) { setError(requestError.message || 'Unable to start interview.') } finally { setLoading(false) }
  }

  const submitAnswer = async (event) => {
    event.preventDefault()
    if (!answer.trim() || !sessionId) return
    setLoading(true); setError('')
    try {
      const data = await requestJson(`/interviews/${sessionId}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: answer.trim() }) })
      if (data.complete) {
        const reportData = await requestJson(`/interviews/${sessionId}/report`)
        if (!reportData?.candidate || typeof reportData.overallScore !== 'number') throw new Error('The API returned an incomplete evaluation report.')
        setReport(reportData); setScreen('report')
      } else { setQuestion(data.question); setQuestionNumber((number) => number + 1); setAnswer('') }
    } catch (requestError) { setError(requestError.message || 'Unable to submit answer.') } finally { setLoading(false) }
  }

  return (
    <main className="app-shell">
      <Topbar onReset={reset} step={screen} />
      {screen === 'landing' && <section className="landing-view"><div className="landing-copy"><span className="eyebrow">The hiring signal, clarified</span><h1>Meet the people<br /><em>behind the resume.</em></h1><p>IntelliHire pairs thoughtful questions with structured evidence, so great hiring decisions feel less like a hunch.</p><button className="primary-button" onClick={() => { setScreen('candidate'); setError('') }}>Start an evaluation <span>↗</span></button><div className="proof-row"><strong>03</strong><span>candidates ready<br />for review</span><i /> <strong>12m</strong><span>average<br />time to signal</span></div></div><div className="landing-art"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-card"><span>INTELLIHIRE / 01</span><strong>Signal<br /><em>over noise.</em></strong><small>AI-assisted evaluation<br />for modern teams</small></div><div className="art-note">✦ <span>Evidence<br />first</span></div></div></section>}
      {screen === 'candidate' && <section className="workspace-view"><ProgressRail current="candidate" /><div className="view-heading"><div><span className="eyebrow">01 / Candidate selection</span><h1>Who are we<br /><em>meeting today?</em></h1></div><p>Choose a profile to begin a focused, adaptive interview.</p></div><div className="candidate-grid">{candidates.map((item) => <CandidateCard key={item.id} candidate={item} selected={candidate?.id === item.id} onSelect={setCandidate} />)}</div><div className="action-row"><span>{candidate ? `${candidate.name} selected` : 'Select a candidate to continue'}</span><button className="primary-button compact" disabled={!candidate || loading} onClick={startInterview}>{loading ? 'Starting...' : 'Begin interview'} <span>↗</span></button></div></section>}
      {screen === 'interview' && <section className="workspace-view interview-view"><ProgressRail current="interview" /><div className="interview-layout"><aside className="interview-aside"><span className="avatar large">{candidate.avatar}</span><span className="eyebrow">Now interviewing</span><h2>{candidate.name}</h2><p>{candidate.role}</p><div className="interview-meta"><span>Session ID</span><code>{sessionId?.slice(0, 8)}...</code></div></aside><div className="question-panel"><div className="question-top"><span className="eyebrow">Question 0{questionNumber} / 03</span><span>{Math.round((questionNumber / 3) * 100)}% complete</span></div><div className="progress-bar"><i style={{ width: `${(questionNumber / 3) * 100}%` }} /></div><h1>{question}</h1><form onSubmit={submitAnswer}><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Take your time. Share the context, your decision, and what changed..." rows="7" autoFocus /><div className="answer-footer"><span>Be specific. The best signals live in the details.</span><button className="primary-button compact" disabled={!answer.trim() || loading}>{loading ? 'Scoring...' : questionNumber === 3 ? 'Finish interview' : 'Send answer'} <span>↗</span></button></div></form></div></div></section>}
      {screen === 'report' && report && <><ProgressRail current="report" /><ReportCard report={report} onReset={reset} /></>}
      {error && <div className="error-toast">{error}</div>}
    </main>
  )
}

export default App
