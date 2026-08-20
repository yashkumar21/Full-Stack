# A3 — Driver & Package Delivery Tracker

A full-stack delivery-tracking app built for FIT2095 Assignment 3. It has:

- An **Angular 18** frontend (this directory) with login/signup, CRUD screens for drivers and
  packages, a live stats dashboard, and AI-assisted extras (text translation, text-to-speech, and
  an AI-generated distance estimate) delivered over Socket.IO.
- An **Express** backend (`backend/`) that exposes a REST API for drivers/packages (MongoDB),
  handles auth and CRUD-stat counters via Firebase Firestore, and drives the Socket.IO/AI features.

## Tech stack

**Frontend**
- Angular 18.2 (standalone components, no NgModules)
- Bootstrap 5
- `socket.io-client`
- `@angular/service-worker` (PWA support, production builds only)

**Backend**
- Express 4 + `express-session`
- Mongoose / MongoDB (drivers & packages)
- Firebase Admin / Firestore (users, login sessions, CRUD counters)
- Socket.IO
- Google Cloud Translate, Google Cloud Text-to-Speech (called via REST + plain API key), Google
  Generative AI (Gemini)

## Prerequisites

- **Node.js** and npm
- **MongoDB** running locally on the default port (the backend connects to
  `mongodb://127.0.0.1:27017/` — this is currently hardcoded, see [Configuration notes](#configuration-notes--known-limitations))
- **Angular CLI** `^18.2` (`npm install -g @angular/cli` if you don't already have it — or just use
  the local `npx ng`)
- A **Firebase project** with a service account key (see step 3 below)
- A **Gemini API key** (from [Google AI Studio](https://aistudio.google.com/apikey)) for the
  distance-estimate feature (see step 3.5 below)
- A **Google Cloud API key** restricted to the Cloud Translation API and Cloud Text-to-Speech API,
  for the translate/text-to-speech socket features (see step 4 below)

## Project structure

```
A3/                     Angular frontend (this app)
├── src/app/             components, services, models, pipes
├── backend/             Express API + Socket.IO server
│   ├── server.js         entry point (npm start runs this)
│   ├── firebase.js        Firebase Admin/Firestore setup
│   ├── models/            Mongoose models (Driver, Package)
│   ├── routes/            Express routers (drivers, packages)
│   └── audio/             static + generated TTS mp3 output
└── dist/                build output (created by `npm run build`)
```

## Setup & run instructions

### 1. Install dependencies

```bash
# from the A3 root (frontend)
npm install

# backend has its own package.json
cd backend
npm install
cd ..
```

### 2. Start MongoDB

Make sure a local MongoDB instance is running and reachable at `mongodb://127.0.0.1:27017/`
(e.g. `mongod` or `brew services start mongodb-community`, depending on how you installed it).

### 3. Add Firebase credentials

`backend/firebase.js` requires a `backend/service-account.json` file (a Firebase Admin service
account key) to initialize Firestore — **the server will crash on startup without it**. Generate
one from your Firebase project: *Project settings → Service accounts → Generate new private key*,
then save the downloaded file as `backend/service-account.json`.

> ⚠️ **This file is a secret.** It grants admin access to your Firebase project and must never be
> committed to version control or shared. A root-level `.gitignore` is already included in this
> project covering `backend/service-account.json`, `backend/FIT2095.json`, `backend/.env`,
> `node_modules/`, and `dist/`.
> (`backend/FIT2095.json` is a leftover duplicate credentials file with the same shape — it isn't
> read by any code, but treat it as a secret too and avoid committing it.)

### 3.5. Add your Gemini API key

The distance-estimate feature uses the Gemini API, configured via an environment variable read
through [`dotenv`](https://www.npmjs.com/package/dotenv). Copy the example env file and fill in
your key:

```bash
cd backend
cp .env.example .env
# then edit backend/.env and set GEMINI_API_KEY=<your key>
```

Get a key from [Google AI Studio](https://aistudio.google.com/apikey). `backend/.env` is
gitignored — never commit it. The server will refuse to start if `GEMINI_API_KEY` isn't set.

Note: Google periodically retires Gemini model names. `server.js` currently requests
`"gemini-3.6-flash"` — if you get a `404 model not found` error, check
[available models](https://ai.google.dev/gemini-api/docs/models) for your key and update the
`model:` value passed to `googleAI.getGenerativeModel(...)`.

### 4. Add your Google Cloud API key (Translate + Text-to-Speech)

The `translate` and `text-speech` Socket.IO features call the Cloud Translation and Cloud
Text-to-Speech REST APIs directly using a **plain API key** — not a service account — read from
`GOOGLE_CLOUD_API_KEY` in `backend/.env`.

> A plain API key was used deliberately instead of a service account, because many Google accounts
> (this one included) have an org policy (`iam.disableServiceAccountKeyCreation`) that blocks
> downloading service-account key files. `@google-cloud/translate` accepts an API key natively
> (`new Translate({ key })`); `@google-cloud/text-to-speech`'s Node client library does not, so the
> `text-speech` handler calls `texttospeech.googleapis.com/v1/text:synthesize` via `fetch` directly
> instead of using that library. (The `@google-cloud/text-to-speech` package is still listed as a
> dependency but is no longer imported in `server.js`.)

To create the key:
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), with your project
   selected, go to **APIs & Services → Credentials → + Create Credentials → API key**.
2. Under API restrictions, choose **"Restrict key"** and select only **Cloud Translation API** and
   **Cloud Text-to-Speech API**.
3. Make sure both of those APIs are enabled on the project (*APIs & Services → Library*).
4. Add the key to `backend/.env`:
   ```
   GOOGLE_CLOUD_API_KEY=your_key_here
   ```

Without this, the rest of the app still runs fine — only the translate/TTS features will fail (with
a clear startup warning in the server logs if the variable is missing).

### 5. Build the frontend and run the backend

The backend serves the *built* Angular app as static files, and the frontend's API calls and
socket connection are hardcoded to talk to the backend's own origin — so the normal way to run this
app is: build the frontend first, then start the backend.

```bash
# from the A3 root
npm run build          # outputs to dist/a3/browser

cd backend
npm start               # runs `node server.js`
```

The app is now available at **http://localhost:8080** (frontend, API, and Socket.IO all served
from the same origin/port).

### Alternative: frontend-only dev server

`npm start` in the root (`ng serve`, port 4200) works for iterating on Angular UI in isolation, but
the API calls in `database.service.ts` use relative paths and the socket connection is hardcoded to
`http://localhost:8080` — there's no dev-server proxy configured, so full functionality (auth,
CRUD, sockets) requires the Express backend to also be running on port 8080 at the same time.

## Configuration notes / known limitations

Most config is still hardcoded in `backend/server.js` — only the two Google API keys have been
moved to environment variables so far:

| What | Where | Value |
|---|---|---|
| Port | `server.js:41` | `8080` (hardcoded) |
| Session secret | `server.js:56` | `'your-secret-key'` (hardcoded) |
| MongoDB URL | `server.js:182` | `mongodb://127.0.0.1:27017/` (hardcoded) |
| Gemini API key | `server.js:18` | `process.env.GEMINI_API_KEY` via `.env` (see setup step 3.5) |
| Google Cloud API key | `server.js:11` | `process.env.GOOGLE_CLOUD_API_KEY` via `.env` (see setup step 4) |

**The session secret remains a real risk** in any deployment beyond local dev — it should also be a
random value read from the environment rather than a hardcoded string, the same way the two API
keys now are.

## API overview

All API routes are prefixed with `/32796021` (student ID). Routes marked "session" require a prior
successful login (`express-session`-based).

| Route | Auth | Description |
|---|---|---|
| `POST /32796021/api/v1/users/signup` | — | Create a user (Firestore) |
| `POST /32796021/api/v1/users/login` | — | Log in, starts a session |
| `/32796021/api/v1/drivers` | session | CRUD for drivers (MongoDB) |
| `/32796021/api/v1/packages` | session | CRUD for packages (MongoDB) |
| `GET /32796021/Yash/stats` | session | CRUD operation counters (Firestore) |
| `/audio` | — | Static + generated text-to-speech `.mp3` files |

Real-time features are handled over Socket.IO: `translate`, `text-speech`, and `getdistance`
events.

## Available scripts

**Frontend** (`A3/package.json`)

| Command | Description |
|---|---|
| `npm start` | `ng serve` — dev server on port 4200 (see caveat above) |
| `npm run build` | `ng build` — production build to `dist/a3/browser` |
| `npm run watch` | `ng build --watch` in development mode |
| `npm test` | `ng test` — Karma/Jasmine unit tests |

**Backend** (`A3/backend/package.json`)

| Command | Description |
|---|---|
| `npm start` | `node server.js` — starts the API + Socket.IO server on port 8080 |
| `npm test` | placeholder only — no real test suite exists yet |

## Testing

The frontend has real unit tests runnable via `ng test` (Karma + Jasmine). The backend does not
have a test suite yet — its `npm test` script is a placeholder that always exits with an error.

## Deployment (Google Cloud Run)

The app is deployed as an installable PWA on Cloud Run, which serves the whole thing (built
Angular app + REST API + Socket.IO) from one container on one HTTPS URL — service workers require
HTTPS to register, which is why this needs a real deployment rather than just `localhost`.

**Build**: the root `Dockerfile` is a two-stage build — Stage 1 runs `npm run build` to produce
`dist/a3/browser`, Stage 2 installs backend dependencies and copies that build output alongside
`backend/`, matching the relative path (`../dist/a3/browser`) `server.js` already expects. Nothing
in `server.js`'s static-serving logic needed to change for this.

**Environment variables** (Cloud Run service config): `MONGO_URL` (a hosted MongoDB — e.g. a free
MongoDB Atlas cluster, since Cloud Run has no persistent local disk for a self-hosted Mongo),
`SESSION_SECRET` (a random string, not the dev placeholder), plus the existing `GEMINI_API_KEY` and
`GOOGLE_CLOUD_API_KEY`. `PORT` doesn't need to be set — Cloud Run injects it automatically and
`server.js` reads `process.env.PORT`.

**Firebase credentials**: `backend/service-account.json` is never baked into the image or
committed — it's stored in GCP Secret Manager and mounted as a file into the Cloud Run service at
**`/secrets/service-account.json`** (a dedicated empty path, not `/app/backend` — mounting a secret
directly on top of a directory that already has application files in it replaces that directory's
entire contents at runtime, which would delete `server.js` and `node_modules` from the running
container). `FIREBASE_SERVICE_ACCOUNT_PATH=/secrets/service-account.json` is set as an env var so
`backend/firebase.js` picks it up from there instead of the local-dev default.

**Known limitation — single instance only** (`--max-instances=1`): `express-session` uses the
default in-memory store and Socket.IO keeps connection state in-process, so neither survives being
split across multiple Cloud Run instances (a session created on one instance would fail auth
checks on another). Capping at one instance avoids this without adding a Redis-backed session
store / Socket.IO adapter — the right tradeoff for this app's traffic level. A second known
limitation: TTS-generated `.mp3` files (`backend/audio/`) live on the container's ephemeral
filesystem and are lost on redeploy or instance restart — acceptable since they're meant to be
transient, generated on demand.
