# HALO API (FastAPI)

Backend for garment analysis (dev endpoint) and avatar preprocessing. See `docs/API.md`.

## Setup (Windows, PowerShell, from `services/api`)
```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python scripts\download_models.py     # MediaPipe .task files → models/ (git-ignored)
Copy-Item .env.example .env                         # then fill in SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
```
Python 3.14 works for everything except `inference-sdk` (no 3.14 wheels yet). It is skipped by an
environment marker; only the dev endpoint `POST /v1/garment/analyze-test` needs it.

## Run
```powershell
# Reachable from your phone on the same Wi-Fi:
.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- Health check: `http://<your-PC-IP>:8000/health` → `{"status":"ok"}`. API docs: `/docs`.
- The first time, Windows Firewall asks whether Python may accept connections: allow **Private networks**.

## Checks
```powershell
.venv\Scripts\python -m pytest -q
.venv\Scripts\ruff check app\ai\avatar app\auth.py app\errors.py app\supabase_rest.py app\avatar_store.py app\routers\avatar.py scripts
# The older garment modules predate ruff.toml and still have 17 lint findings (cleanup pending).
# Real-model timing on three local photos (do not commit personal photos):
.venv\Scripts\python scripts\benchmark_avatar.py front.jpg back.jpg face.jpg --runs 5 --show-report
```
`local_test_photos/` is git-ignored for photos you use with the benchmark.
