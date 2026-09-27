# EventX — Setup Guide (fixed build)

Scope: plain MERN stack only (React/Vite frontend, Express/MongoDB backend, JWT auth, Cloudinary uploads). The blockchain/smart-contract layer (`ethers.js`, `src/contracts/`, MetaMask auth route) was intentionally left out of the backend and out of scope for backend fixes; a few frontend wallet-UI components (`WalletBox`, `MetaMaskAuth`) still exist in the tree since they're linked into `Header.jsx`, but they no longer call any backend route (`/api/v1/user/metamask` was removed) — they're inert UI, not functional.

## What's in this zip

```
EventX-fixed/
├── backend/     — Express + MongoDB API
├── frontend/    — React + Vite app
├── SETUP.md     — this file
├── FIXES.md     — full list of every bug found and fixed
└── FLOWS.md     — the app's actual user/data flows
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either:
  - Local: [Install MongoDB Community](https://www.mongodb.com/docs/manual/installation/), then it runs at `mongodb://127.0.0.1:27017`
  - Or free-tier [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (no local install needed)
- A free [Cloudinary](https://cloudinary.com/users/register/free) account (for banner image uploads)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | Your local Mongo URL, or Atlas connection string |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | Any long random string — e.g. run `openssl rand -hex 32` twice |
| `ACCESS_TOKEN_EXPIRY` | e.g. `1d` |
| `REFRESH_TOKEN_EXPIRY` | e.g. `10d` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard → Account Details |

Then run it:

```bash
npm run dev     # nodemon, auto-restarts on change
# or
npm start       # plain node
```

You should see:
```
MongoDB connected
Server listening on port 3000
```

If you see `Failed to connect to MongoDB. Server not started.` — check `MONGO_URI` is correct and MongoDB is actually running/reachable.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3000
```

(Change this to your deployed backend URL later, if you deploy it — no code edits needed anymore, unlike before.)

Then run it:

```bash
npm run dev
```

Opens at `http://localhost:5173` by default.

## 3. Verify it's wired up correctly

1. Open `http://localhost:5173`, go to Signup, create an account.
2. Check your backend terminal — you should see the request logged, no errors.
3. Log in. Open browser devtools → Application → Cookies — you should see `accessToken` and `refreshToken` cookies set for `localhost`.
4. Try "Organize an Event" — fill the form, upload a banner image, submit. Check your Cloudinary dashboard's Media Library — the banner should appear there.
5. Browse events — the created hackathon should show up.

If any step fails, check the backend terminal output first — every controller now returns a real error message instead of hanging silently (this was one of the fixed bugs — see FIXES.md).

## Notes on what was intentionally left out of scope

- **Smart contract / blockchain layer**: not touched, not fixed, not included in the backend's functional scope. If you want it back, the original `authenticateWithMetaMask` controller and `/api/v1/user/metamask` route are documented in FIXES.md as "removed," and the frontend's `src/contracts/` folder and `WalletBox`/`MetaMaskAuth` components are still present but inert (no backend route to call).
- **Production deployment specifics** (HTTPS, real domain, process manager like PM2) — not covered here; this guide is for local development.
