# Crash Tool Backend

## Setup

1. Copy your `auth/` folder (with the Xbox cache JSON files) into this directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

The server runs on port `3001` by default. Set `PORT` env variable to change.

## Auth Folder Structure

Place your Xbox auth cache files in `backend/auth/`:
```
backend/
  auth/
    <account>-sisu-cache.json
    <account>-pfb-cache.json
    <account>-mcs-cache.json
    <account>-xbl-cache.json
  src/
    ...
  server.js
  package.json
```

## API Endpoints

- `GET /api/status` — Check if backend is online and Xbox account is linked
- `POST /api/realm/validate` — Validate a realm code or ID (`{ realmInput: "code_or_id" }`)
- `GET /api/crash/start?realmInput=CODE&loops=10` — Start crash sequence (SSE stream)

## Exposing with ngrok (optional)

```bash
ngrok http 3001
```

Then use the ngrok URL as your backend URL in the Crash Tool web UI.
