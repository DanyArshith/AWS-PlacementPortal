# Phase 1 — Recommended Folder Structure

This section defines the folder layout and responsibilities for both backend and frontend. Keep the project modular and follow MVC for backend.

Top-level

```
placement-portal/
├─ backend/
│  ├─ config/           # db.js, s3.js, env loaders
│  ├─ controllers/      # thin controllers calling services
│  ├─ middleware/       # auth, errorHandler, upload, rateLimit
│  ├─ models/           # Mongoose models
│  ├─ routes/           # express routes (grouped by resource)
│  ├─ services/         # business logic, db access, s3 helpers
│  ├─ utils/            # helpers, validators, constants
│  ├─ scripts/          # seedAdmin, migrations
│  ├─ app.js
│  └─ server.js
├─ frontend/
│  ├─ public/           # static HTML pages
│  ├─ src/
│  │  ├─ components/    # reusable UI pieces
│  │  ├─ pages/         # page-specific scripts
│  │  ├─ css/
│  │  └─ js/
│  ├─ fixtures/         # dummy JSON for Phase 2
+│  └─ build/            # production build output
├─ docs/
└─ README.md
```

Guidelines
- Controllers should only orchestrate request/response and call services.
- Services own business logic and db operations; make them reusable and testable.
- Keep middleware small and composable (auth, validation, error handling).
- Use environment variables via `.env` and `.env.example` for local development.
