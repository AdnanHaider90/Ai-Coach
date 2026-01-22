# AI Coach MVP – Life, Career & Finance Coach

Monorepo containing:
- `backend_python/` FastAPI (Python) REST API
- `frontend/` Next.js 14 (App Router) + Tailwind, deployable to Vercel
- Supabase (PostgreSQL + Auth) for users, sessions, messages, goals

## Prerequisites
- Python 3.9+
- Node 18+
- Supabase project with `Session`, `Message`, `Goal` tables
- Google Gemini API key

## Quickstart
```bash
# Backend
cd backend_python
# Create venv and install dependencies
python -m venv venv
./venv/Scripts/activate # Windows
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

## Environment
Copy `.env.example` files and fill values.

`backend_python/.env`
- `SUPABASE_URL`, `SUPABASE_KEY` (Anon key)
- `GEMINI_API_KEY`
- `PORT` (default 8000)

`frontend/.env`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE` (Backend base, defaults to `http://localhost:8000`)

## API (Backend)
- `POST /chat` -> `{ sessionId, message }`
- `GET /sessions` -> List of sessions
- `POST /sessions` -> Create new session
- `GET /messages?sessionId=...` -> List of messages

## Deployment
- Backend: Render or similar python host.
- Frontend: Vercel → set env vars, connect repo, `npm run build`.

## Known limitations
- Minimal validation on payloads; no streaming responses.
- Supabase operations are simple upserts; adjust RLS as needed.
- No advanced analytics or notifications per requirements.
