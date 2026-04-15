# Uni-Plan

Uni-Plan is a web-based university course planning and registration support tool.  
Students can search courses, detect timetable conflicts, save/load multiple plans, and generate schedule combinations with Quick Planner.  
Admins can review a student's registered schedule and apply override actions (forced registration updates).

## Key Features

- Student/Admin login split
  - Uses a shared login API and routes users based on account `role`
- Course search and filtering
  - Search/sort by subject, course number, CRN, instructor, credits, days, and term
- Conflict detection
  - Automatically detects time conflicts and highlights them in list and weekly views
- Credit-limit policy
  - Student flow blocks schedules above 18 credits
  - Admin flow can bypass credit cap via `bypassCreditLimit`
- Plan save/load
  - Saves plans by (`term`, `name`) and allows reloading saved plans
- Registered plan workflow
  - Persists current registration in a reserved plan name: `__registered__`
- Quick Planner generation
  - Builds conflict-free schedule combinations from selected course groups
  - Supports preferences like Friday off and no morning classes
  - Supports side-by-side comparison for two generated plans
- PDF export
  - Exports schedule grid + selected courses into a downloadable PDF

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router
- Tailwind CSS
- html2canvas, jsPDF

### Backend

- FastAPI
- Uvicorn
- PostgreSQL (psycopg2-binary)
- Pydantic
- bcrypt
- python-dotenv

## Architecture Overview

Uni-Plan uses a React SPA frontend with a FastAPI backend.

- Frontend: `Frontend`
  - Routes: `LoginPage`, `HomePage`, `AdminPage`
  - `/api/*` calls are proxied by Vite to backend
- Backend: `Backend`
  - Provides auth, course lookup, plan save/register, admin override, and schedule generation APIs
- Serverless entrypoint: `api/index.py`
  - Loads the FastAPI app from `Backend/main.py` for deployment

This architecture gives a no-full-reload user experience for search, filtering, and planning.

## Directory Structure

```text
Uni-Plan/
├─ Frontend/                 # React + Vite
│  ├─ src/
│  │  ├─ pages/              # Login/Home/Admin
│  │  ├─ components/         # CourseSearch, WeeklySchedule, QuickPlanner, etc.
│  │  └─ utils/              # Conflict/time parsing utilities
│  └─ vite.config.js
├─ Backend/                  # FastAPI
│  ├─ routers/               # auth, courses, plans, admin, generator
│  ├─ services/              # plan/auth service logic
│  ├─ schemas/               # request/response models
│  ├─ db.py                  # DB connection
│  └─ main.py                # FastAPI app
├─ api/
│  └─ index.py               # serverless entrypoint
├─ vercel.json               # deployment rewrites/function config
└─ README.md
```

## Quick Start

## Prerequisites

- Node.js `>= 20.19.0`
- pnpm `>= 8`
- Python 3.10+ (recommended)
- PostgreSQL connection info

## 1) Install dependencies

From project root:

```bash
pnpm install
```

Install backend Python dependencies in a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r Backend/requirements.txt
```

## 2) Configure environment variables

Set database env vars in `Backend/.env` (or runtime environment).


Using discrete DB settings:

```env
DB_HOST=localhost
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password
DB_PORT=5432
```

## 3) Run backend

From project root:

```bash
source .venv/bin/activate
uvicorn Backend.main:app --reload --host 0.0.0.0 --port 8000
```

## 4) Run frontend

In a new terminal, from project root:

```bash
pnpm dev
```

Open `http://localhost:5173`.

## Scripts

Root `package.json` scripts:

- `pnpm dev`: run frontend dev server
- `pnpm build`: build frontend
- `pnpm preview`: preview built frontend
- `pnpm install:all`: install workspace dependencies

Frontend-local scripts in `Frontend/package.json`:

- `vite`, `vite build`, `vite preview`, `eslint`

## API Overview

Base prefix: `/api`

### Auth

- `POST /auth/login` - login
- `POST /auth/logout` - logout

### Courses

- `GET /courses/search` - search courses
  - main query params: `q`, `term_id`, `limit`

### Plans

- `POST /plans/save` - save a named plan
- `GET /plans/load` - load a named plan
- `GET /plans/list` - list saved plans for a user
- `POST /plans/register` - persist registered courses (`__registered__`)
- `GET /plans/registered` - load registered courses
- `POST /plans/load-plans` - load plan names for a user

### Admin

- `GET /admin/plans/list` - list a student's plans
- `GET /admin/plans/load` - load a student's plan
- `GET /admin/plans/registered` - load a student's registered courses
- `POST /admin/plans/register` - force-save a student's registered courses
- `POST /admin/plans/save` - save a student's named plan

### Generator

- `POST /generator/generate-schedules` - generate conflict-free schedule combinations

## Behavior Notes and Constraints

- Credit cap: student flow blocks adding courses above 18 credits.
- Conflicts: conflicting courses can still be added, but warnings/highlights are shown.
- Term mapping: frontend currently uses fixed term IDs (`202601`, `202609`).
- Auth storage: session state is stored in browser `localStorage`.
- CORS: backend currently allows all origins (`allow_origins=["*"]`) for development convenience.

## Deployment Notes

Based on `vercel.json`:

- `/api/(.*)` rewrites to `/api/index.py`
- all other routes rewrite to SPA entry (`index.html`)
- serverless function includes `Backend/**` files

## Verification Checklist

- Login success/failure and student/admin redirects
- Course search + filter + sorting + pagination
- Conflict rendering in list/grid/banner
- Save/Load/Register flows and data consistency
- Quick Planner generate/compare/apply workflow
- Admin override save behavior
- PDF export layout and content quality
