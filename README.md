# IntelliHire AI

A focused AI-assisted interview workspace for structured candidate evaluation. The app pairs a responsive React + Vite interface with a FastAPI service, using `backend/candidates.json` and `backend/curriculum.json` as its source data.

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:8000`.

## API

- `GET /api/candidates`
- `GET /api/curriculum`
- `POST /api/interviews` with `{ "candidate_id": "..." }`
- `POST /api/interviews/{sessionId}/answer` with `{ "answer": "..." }`
- `GET /api/interviews/{sessionId}/report`

The local interviewer is deterministic and requires no secret. For production, replace the scoring adapter with a provider-backed implementation, store sessions in a database, lock down CORS, and add authentication/rate limiting.

## Deployment

Build the frontend with `npm run build`; deploy `frontend/dist` to a static host and run the FastAPI service with `uvicorn main:app --host 0.0.0.0 --port $PORT`.
