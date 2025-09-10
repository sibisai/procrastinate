# Procrastinate — MVP

Minimal task starter. Create a task. The backend generates the **smallest possible first action** (micro-step) using an LLM or a local fallback. Frontend shows tasks and lets you mark micro-steps done or complete the task.

---

## Repo layout

```
procrastinate/
├─ backend/
│  ├─ app/                # FastAPI app
│  │  ├─ main.py          # routes + background generation
│  │  ├─ models.py        # SQLAlchemy models
│  │  ├─ schemas.py       # Pydantic schemas
│  │  ├─ db.py            # engine + SessionLocal
│  │  └─ llm.py           # OpenAI SDK call + fallback
│  ├─ requirements.txt
│  ├─ .env.example
│  └─ app.db              # SQLite (auto-created)
└─ frontend/
   ├─ src/                # React app (Vite)
   ├─ index.html
   ├─ package.json
   └─ .env.example
```

---

## Prerequisites

- Python 3.11+ (tested on 3.12)
- Node 18+ (Node 20/22 recommended) and npm
- OpenAI API key (optional; falls back to local rules if absent)

---

## Backend — run locally

1. Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...  (optional)
```

2. Start API

```bash
uvicorn app.main:app --reload --port 8000
```

- SQLite file `app.db` is created on first run.
- Background job generates a micro-step after task creation.

3. REST endpoints

- `POST /tasks` `{ "title": "Write research paper" }` → create task
- `GET /tasks` → list tasks with latest micro-step
- `POST /tasks/{id}/generate` → force regenerate micro-step
- `PATCH /microsteps/{id}` `{ "status": "done" }`
- `PATCH /tasks/{id}` `{ "status": "done" | "open" | "archived" }`
- `GET /stats` → `{ "active_tasks": N }`

4. Quick cURL

```bash
# Create
curl -s -X POST localhost:8000/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Write research paper"}'

# Generate (usually auto via background)
curl -s -X POST localhost:8000/tasks/1/generate

# List
curl -s localhost:8000/tasks | jq

# Mark micro-step done
curl -s -X PATCH localhost:8000/microsteps/1 \\
  -H "Content-Type: application/json" -d '{"status":"done"}'

# Complete task
curl -s -X PATCH localhost:8000/tasks/1 \\
  -H "Content-Type: application/json" -d '{"status":"done"}'

# Stats
curl -s localhost:8000/stats
```

---

## Frontend — run locally

1. Setup

```bash
cd frontend
cp .env.example .env
# If backend runs at a non-default URL, set:
# VITE_API_BASE=http://localhost:8000
npm install
```

2. Dev server

```bash
npm run dev
# open http://localhost:5173
```

3. Notes

- Tailwind/PostCSS already configured. If you see PostCSS/autoprefixer errors:
  ```bash
  npm i -D tailwindcss postcss autoprefixer
  ```
- The UI immediately shows the task; the micro-step appears when the background call completes. The app bursts a couple of refetches to pick it up.

---

## Environment variables

### backend/.env

```
OPENAI_API_KEY=sk-...   # optional; when missing the app uses a deterministic fallback
OPENAI_MODEL=gpt-5-nano # default in code
```

### frontend/.env

```
VITE_API_BASE=http://localhost:8000
```

---

## Behavior

- **Create task** returns immediately. A FastAPI `BackgroundTasks` worker calls OpenAI and writes the micro-step.
- If the LLM errors or is unset, the backend stores a **fallback** step (e.g., “Open a blank document”).
- Frontend polls briefly after create/regenerate and shows “Generating first step…” until the micro-step row exists.

---

## Troubleshooting

- `ModuleNotFoundError: sqlalchemy` → `pip install -r requirements.txt` inside the venv.
- `BadRequest: temperature not supported` → you’re hitting the Responses API model (gpt-5-nano). The code already avoids `temperature`.
- `NameError: SessionLocal is not defined` → ensure `from .db import SessionLocal` in `app/main.py`.
- PostCSS “Cannot find module 'autoprefixer'” → `npm i -D autoprefixer`.
