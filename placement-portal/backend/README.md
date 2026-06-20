# Placement Portal Backend

This folder contains the Express backend for the College Placement Portal.

Key files:
- `server.js` - entrypoint
- `app.js` - express app setup
- `config/` - db and s3 clients
- `models/`, `controllers/`, `routes/`, `middleware/`

Environment variables: see `.env.example`.

Run locally:

```
npm install
cp .env.example .env
npm run dev
```
