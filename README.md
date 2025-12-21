# LifeQuest

LifeQuest is a productivity-focused full-stack application designed to help break a single task into smaller, manageable “quests.” Instead of presenting productivity as a checklist, the app reframes progress as a structured sequence with feedback, completion messaging, and experience points (XP) to reinforce momentum.

The core idea is simple: enter a task, review or customize suggested sub-quests, complete them one by one, and reset cleanly when finished.

---

## Tech Stack

### Frontend

* React
* Vite
* CSS (custom layout and animation system)

### Backend

* Flask
* PostgreSQL
* SQLAlchemy
* Flask-Login (session-based authentication)

### Other

* RESTful API design
* Cookie-based sessions (no JWTs)

---

## Why `flask run` Instead of `run.py`

The application uses `flask run` instead of a custom `run.py` script to align with modern Flask best practices and reduce environment inconsistencies.

Using `flask run`:

* Ensures environment variables are respected consistently
* Prevents accidental execution differences between development and deployment
* Matches how Flask is documented and expected to be run in production-adjacent workflows

Earlier experimentation with `run.py` introduced unnecessary friction, especially during authentication debugging, so the project was standardized on `flask run` for stability and clarity.

---

## Core Functionality

* User signup, login, and logout (session-based authentication)
* Ownership-restricted data access (users can only access their own records)
* Task creation
* Automatic or fallback sub-quest generation
* Manual addition and removal of sub-quests
* Full CRUD for tasks and quests
* Quest completion flow with XP rewards
* Ability to abandon a task and return to task input
* Clean reset after all quests are completed

---

## How to Run the App Locally

### Backend

```bash
pipenv install
pipenv shell
export FLASK_APP=app
flask db upgrade
flask run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on Vite’s development server and communicates with the Flask backend through the API layer.

---

## Development Approach

The application was built with a strong emphasis on clear state ownership and UI consistency. A single top-level shell controls authentication state and application flow, while smaller components are responsible for individual stages such as task entry, planning, and active quest progression.

The UI deliberately reuses the same card dimensions and spatial layout across different stages to avoid visual “teleporting” and to maintain continuity as users move through the app.

---

## Reflection

This project did not end up matching the original pitch, and that is on me.

I procrastinated longer than I should have on finishing the project and did not give myself enough runway to fully execute the vision I initially proposed. When I ran into a prolonged authentication error loop, a significant amount of time was spent stabilizing the application rather than refining features or polish. At that point, the priority shifted to getting the app into a functional, presentable state instead of expanding scope.

In hindsight, the correct move would have been to rescope the pitch earlier and realign expectations with the constraints I was actually working under. Instead, I held onto parts of the original idea longer than was realistic given the time remaining.

That said, the application does meet the core technical requirements of the assignment, and the process surfaced practical lessons around state ownership, authentication flow, and knowing when to simplify rather than push forward blindly.

---

## Future Iterations

If continued, future versions of LifeQuest would include:

* AI-assisted task and sub-quest generation to remove reliance on preset defaults
* XP-based unlocks tied to themes, personas, or UI elements
* Optional personas that influence tone, quest phrasing, or feedback
* Expanded analytics or progress summaries over time
* Additional polish around onboarding and visual transitions

---

## Final Notes

LifeQuest represents a realistic snapshot of a project built under pressure rather than an idealized demo. While it does not fully realize the original pitch, it demonstrates full-stack architecture, authentication, relational data handling, and a coherent user flow from end to end.

