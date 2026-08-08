from pathlib import Path
from typing import Dict, List
from uuid import uuid4
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).parent
candidates = json.loads((ROOT / "candidates.json").read_text(encoding="utf-8"))
curriculum = json.loads((ROOT / "curriculum.json").read_text(encoding="utf-8"))
sessions: Dict[str, dict] = {}

app = FastAPI(title="IntelliHire AI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://intelli-hire-nu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InterviewStart(BaseModel):
    candidate_id: str

class AnswerPayload(BaseModel):
    answer: str


def get_candidate(candidate_id: str) -> dict:
    candidate = next((item for item in candidates if item["id"] == candidate_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


def score_answer(answer: str) -> int:
    words = len(answer.split())
    signals = sum(1 for term in ("because", "impact", "trade-off", "measure", "learn", "team") if term in answer.lower())
    return min(96, 58 + min(words, 28) + signals * 3)

@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "intellihire-api"}

@app.get("/api/candidates")
def list_candidates() -> List[dict]:
    return candidates

@app.get("/api/curriculum")
def get_curriculum() -> dict:
    return curriculum

@app.post("/api/interviews")
def start_interview(payload: InterviewStart) -> dict:
    candidate = get_candidate(payload.candidate_id)
    session_id = str(uuid4())
    sessions[session_id] = {"candidate_id": candidate["id"], "answers": [], "question_index": 0}
    return {"sessionId": session_id, "candidate": candidate, "question": "Tell me about a project where you changed the outcome, not just the output."}

@app.post("/api/interviews/{session_id}/answer")
def submit_answer(session_id: str, payload: AnswerPayload) -> dict:
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    answer = payload.answer.strip()
    if not answer:
        raise HTTPException(status_code=400, detail="Answer cannot be empty")
    score = score_answer(answer)
    session["answers"].append({"answer": answer, "score": score})
    session["question_index"] += 1
    questions = [
        "What was the hardest trade-off you made, and how did you bring the team with you?",
        "How did you measure whether your solution was working after launch?",
        "What would you do differently if you had another month?",
    ]
    is_complete = session["question_index"] >= 3
    return {"complete": is_complete, "score": score, "question": questions[session["question_index"] - 1] if not is_complete else None, "progress": min(100, session["question_index"] / 3 * 100)}

@app.get("/api/interviews/{session_id}/report")
def get_report(session_id: str) -> dict:
    session = sessions.get(session_id)
    if not session or not session["answers"]:
        raise HTTPException(status_code=404, detail="Interview report not found")
    candidate = get_candidate(session["candidate_id"])
    overall = round(sum(item["score"] for item in session["answers"]) / len(session["answers"]))
    strengths = ["Structured problem solving", "Clear ownership", "Strong product judgment"]
    weaknesses = ["Quantifying long-term impact", "Making trade-offs explicit"]
    return {"candidate": candidate, "overallScore": overall, "strengths": strengths, "weaknesses": weaknesses, "learningTopics": curriculum["topics"][:2], "recommendation": "Strong hire" if overall >= 75 else "Review with team", "answers": session["answers"]}
