# LifeQuest

LifeQuest is a productivity-focused full-stack application designed to help break a single task into smaller, manageable "quests." Instead of presenting productivity as a checklist, the app reframes progress as a structured sequence with feedback, completion messaging, and experience points (XP) to reinforce momentum.

The core idea is simple: enter a task, review or customize suggested sub-quests, complete them one by one, and reset cleanly when finished.

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS v4

### Backend

* Flask
* PostgreSQL (production) / SQLite (local development)
* SQLAlchemy + Flask-Migrate
* Flask-Login (session-based authentication)

### Deployment

* Frontend — Netlify
* Backend — Render

### Other

* RESTful API design
* Cookie-based sessions (no JWTs)
* Vite proxy in development to handle same-origin session cookies

---

## Core Functionality

* User signup, login, and logout (session-based authentication)
* Persistent XP tied to each user account
* Ownership-restricted data access (users can only access their own records)
* Task creation
* Automatic or fallback sub-quest generation
* Manual addition and removal of sub-quests
* Quest completion flow with XP rewards
* Completion feed with MMO-style message display
* Ability to abandon a task and return to task input
* Clean reset after all quests are completed

---

## How to Run the App Locally

### Backend

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export FLASK_APP=app
flask run
```

Tables are created automatically on first run. No migration commands are needed for local development.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on Vite's dev server at `localhost:5173`. All API calls are proxied through Vite to the Flask backend at `127.0.0.1:5000`, which keeps session cookies same-origin and avoids cross-origin authentication issues during development.

---

## Development Approach

The application was built with a strong emphasis on clear state ownership and UI consistency. A single top-level shell controls authentication state and application flow, while smaller components are responsible for individual stages such as task entry, planning, and active quest progression.

The UI deliberately reuses the same card dimensions and spatial layout across different stages to avoid visual "teleporting" and to maintain continuity as users move through the app.

---

## Deployment

The backend is hosted on Render as a web service using Gunicorn. The frontend is hosted on Netlify as a static build. In production, the frontend communicates with the backend directly via the `VITE_API_URL` environment variable rather than through a proxy.

The following environment variables are required:

**Backend (Render)**

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Flask session secret key |
| `DATABASE_URL` | PostgreSQL connection string (provided by Render) |
| `FLASK_ENV` | Set to `production` |
| `FRONTEND_URL` | Netlify URL for CORS allowlist |

**Frontend (Netlify)**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Render backend URL |

---

## Future Iterations

If continued, future versions of LifeQuest would include:

* XP-based unlocks tied to themes, personas, or UI elements
* Optional personas that influence tone, quest phrasing, or feedback
* Expanded analytics or progress summaries over time
* Additional polish around onboarding and visual transitions
