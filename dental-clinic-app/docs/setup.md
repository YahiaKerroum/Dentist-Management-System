# Setup & Quick start — Dental Clinic Management System

This document explains how to start the application from scratch on a developer machine (Windows / PowerShell). It covers prerequisites, database setup, installing dependencies, running migrations & seed data, and starting both backend and frontend in development and production modes.

If you prefer another shell (bash, zsh) the commands are similar — this file uses PowerShell (`pwsh`) where appropriate.

## 1) Prerequisites

- Node.js (recommended: 18+; project README recommends Node 20+). Verify with:

```pwsh
node -v
```

- npm (comes with Node) or pnpm (optional). If you use pnpm, substitute `pnpm` for `npm` where shown.
- Docker (optional) — recommended for quickly running PostgreSQL locally.

## 2) Clone the repo

```pwsh
git clone https://github.com/YahiaKerroum/Dentist-Management-System.git
cd Dentist-Management-System/dental-clinic-app
```

## 3) Database — PostgreSQL

This project uses PostgreSQL (see `backend/prisma/schema.prisma`). You can run Postgres locally or via Docker.

Option A — Run PostgreSQL with Docker (recommended):

```pwsh
# Run a Postgres container bound to local port 5432
docker run -d --name dcms-postgres \
	-e POSTGRES_USER=postgres \
	-e POSTGRES_PASSWORD=postgres \
	-e POSTGRES_DB=dental_clinic_db \
	-p 5432:5432 \
	postgres:15
```

Option B — Install Postgres locally and create a database named `dental_clinic_db`.

## 4) Configure environment variables

Create the backend `.env` file at `dental-clinic-app/backend/.env` (don't commit secrets). Example contents:

```properties
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dental_clinic_db?schema=public"
JWT_SECRET="change_this_to_a_strong_secret"
PORT=4000
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

Adjust `DATABASE_URL` user/password/host/port to match your Postgres setup.

## 5) Install dependencies

Install backend and frontend dependencies separately (the repo has separate package.json files):

```pwsh
# Backend
cd dental-clinic-app/backend
npm install

# In a new terminal/tab, frontend
cd ..\frontend
npm install
```

If you prefer pnpm (workspace):

```pwsh
pnpm install
```

Notes:
- If a dev tooling binary like `ts-node-dev` is reported as missing ("'ts-node-dev' is not recognized"), running `npm install` in the `backend` folder should add the dev dependency (it is listed in `devDependencies`). If it still fails, use the `npx` fallback shown in Troubleshooting below.

## 6) Prisma: generate client, migrate, seed

From `dental-clinic-app/backend` run:

```pwsh
# generate the Prisma client
npx prisma generate

# create migrations and apply to the database (interactive), name the migration `init`
npx prisma migrate dev --name init

# run the seed script to populate example data
npm run seed
```

If the repository configured `prisma.seed` script, you can also run `npx prisma db seed`.

## 7) Start the backend (development)

From `dental-clinic-app/backend`:

```pwsh
npm run dev
```

This runs the script `ts-node-dev --respawn --transpile-only src/server.ts` defined in `backend/package.json`. After successful start you should see log lines indicating the server port and a health-check URL (e.g. `http://localhost:4000/health`).

Fallback (if the package script fails because of missing global binaries or path issues):

```pwsh
# Use npx to run the binary directly
npx ts-node-dev --respawn --transpile-only src/server.ts

# Or, if server entry point differs, run the actual file the repo contains (example)
npx ts-node-dev --respawn --transpile-only src/services/tobecontinued/server.ts
```

Note: the repository may point to `src/server.ts` in package.json — if that file is not present, inspect `backend/src/` to find the actual startup file (look for `startServer()` or a `Health` log). Running `npx ts-node-dev` against the file that contains `startServer()` will start the server.

## 8) Start the frontend (development)

From `dental-clinic-app/frontend`:

```pwsh
npm run dev
```

Vite will start a dev server (typically on `http://localhost:5173`). The console will show the exact URL.

## 9) Production build (optional)

Build frontend and backend for production:

```pwsh
# frontend build
cd dental-clinic-app/frontend
npm run build

# backend build
cd ..\backend
npm run build

# Start built backend
npm start
```

To run everything in Docker, you can build images using the Dockerfiles in `backend/` and `frontend/` and use a `docker-compose.yml` to wire services together (this repo currently has a placeholder `docker-compose.yml` — create one tying `db`, `backend`, and `frontend` if you need containerized deployment).

## 10) Quick verification

- Backend health: open the URL printed by the backend logs (example `http://localhost:4000/health`) or check `http://localhost:4000/api` for API presence.
- Frontend: open the Vite URL (example `http://localhost:5173`) and verify the app loads and can talk to the backend (CORS must be configured — backend already includes CORS). If you get CORS errors, verify backend `PORT` and frontend API base URL configuration.

## Troubleshooting

- "'ts-node-dev' is not recognized": run `npm install` inside `dental-clinic-app/backend`. As a temporary fallback use `npx ts-node-dev ...`.
- Migration errors: ensure `DATABASE_URL` is correct and Postgres is reachable on the specified host/port.
- Port conflicts: change `PORT` in `backend/.env` or stop the process using that port.
- Missing entrypoint (script points to `src/server.ts` but file not found): inspect `backend/src/` to find the actual startup file (look for `startServer()` or `app.listen`). Use `npx ts-node-dev` pointing to that file.

## Suggested next improvements

- Add an `env.example` file for `backend` with safe placeholders.
- Add a simple `docker-compose.yml` that starts `postgres`, `backend`, and `frontend` for an easy `docker-compose up` dev flow.
- Add a top-level `Makefile` or `package.json` workspace scripts to run both backend and frontend with one command.

---

If you'd like, I can:
- create `backend/.env.example` from your current `.env`,
- scaffold a `docker-compose.yml` that runs Postgres + backend + frontend for a one-command dev environment, or
- add a single root script that installs all packages and starts both services.

Tell me which of the above you'd like me to add and I'll implement it here in the repo.

