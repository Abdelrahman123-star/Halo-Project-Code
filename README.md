# HALO

AI-powered personal fashion platform (Android & iOS): scan yourself → stylized 3D avatar →
photograph your clothes → AI garment analysis → dress your avatar.

> **Status:** early development. Only the **auth smoke test** exists (register, login, a
> welcome screen reading your profile from Supabase). Avatar, wardrobe, AI and backend are
> **not built yet**. See [docs/PROGRESS.md](docs/PROGRESS.md) for the verified state.

## Planned stack
Expo + React Native + TypeScript · three.js (R3F native, to be validated) · Supabase (Auth,
Postgres, private Storage, RLS) · FastAPI (Python) for AI processing.

## Prerequisites
- Node 22+ and npm (verified: Node 22.14, npm 11.11)
- A free [Supabase](https://supabase.com) project
- An Android phone with **Expo Go** (same Wi-Fi as the PC) **or** Android Studio emulator

## Run the app (auth smoke test)

### 1. Create the database tables (once)
1. Supabase Dashboard → **SQL Editor** → **New query**.
2. Paste the contents of [`supabase/migrations/0001_profiles.sql`](supabase/migrations/0001_profiles.sql) → **Run**.
3. Check **Table Editor** → `profiles` exists (RLS shown as enabled).
4. **Authentication → Sign In / Providers → Email**: for quick testing turn **Confirm email**
   off. If you leave it on, registration shows "Check your email" and you must click the link before logging in.

### 2. Configure the app
```powershell
cd apps/mobile
copy .env.example .env
```
Edit `.env`: set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
(Dashboard → Project Settings → API). Use the **anon** key only — never the service_role key.

### 3. Install and start
```powershell
cd apps/mobile
npm install --legacy-peer-deps
npx expo start -c
```
- **Phone:** scan the QR code with Expo Go (Android) — phone and PC on the same Wi-Fi.
  If it can't connect, try `npx expo start --tunnel`.
- **Emulator:** start a device in Android Studio, then press `a` in the Expo terminal.

### 4. What to test
1. Register → (confirm email if enabled) → you land on **Welcome, <your name>**
   with a green "Connected… through RLS" banner.
2. Supabase → Table Editor → `profiles`: your row exists; Authentication → Users: your user exists.
3. Log out → log in again → close and reopen the app: you stay logged in.
4. Wrong password → "Incorrect email or password."

## Checks
```powershell
cd apps/mobile
npm run typecheck
npm test
```

## Troubleshooting
| Symptom | Fix |
|---|---|
| "Setup needed" screen | `.env` missing/placeholder values; fix and run `npx expo start -c` |
| 404 in Supabase auth logs | `EXPO_PUBLIC_SUPABASE_URL` had `/rest/v1/`; use base `https://<id>.supabase.co` |
| "Unmatched Route halo:///" | restart with `npx expo start -c` so updated route configuration is loaded |
| Welcome shows "no profile row" | migration not run, or user created before it (see DATABASE.md) |
| `npm` ERESOLVE errors | use `--legacy-peer-deps` (react-dom peer conflict from expo-router) |
| Expo Go version mismatch | update Expo Go from the Play Store |

## Documentation map
| Doc | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | engineering rules for devs & AI agents |
| [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) | roadmap, phases, risks |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | current task plan |
| [docs/PROGRESS.md](docs/PROGRESS.md) | verified status & next step |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | components & data flow |
| [docs/DATABASE.md](docs/DATABASE.md) | schema, RLS, storage |
| [docs/API.md](docs/API.md) | backend contract (planned) |
| [docs/AI_MODELS.md](docs/AI_MODELS.md) | models, licences, status |
| [docs/THREED_PIPELINE.md](docs/THREED_PIPELINE.md) | avatar & garment 3D |
| [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md) | security controls |
| [docs/TESTING.md](docs/TESTING.md) | test strategy |
| [docs/DECISIONS/](docs/DECISIONS/) | ADRs |

## Honest scope
Avatar = rigged stylized base model with scan-derived body proportions (approximate) and
user-editable appearance — **not** photo-to-3D reconstruction. Garments = template-based 3D
items textured from detected colour/pattern. The live smart-display try-on is a separate
future product and is **not** implemented.
