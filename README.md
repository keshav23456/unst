# EventX

A full-stack hackathon organizing platform. Organizers create hackathons with a prize pool and a sequence of rounds; participants form teams and submit projects each round.

**Stack:** React + Vite + Redux Toolkit (frontend) · Node.js + Express + MongoDB (backend) · JWT auth · Cloudinary for image uploads.

> This is the fixed build. See [`FIXES.md`](./FIXES.md) for every bug found and fixed, and [`FLOWS_AND_BUGS.md`](./FLOWS_AND_BUGS.md) for the original audit. The project's earlier blockchain/smart-contract layer is out of scope here — see the note at the bottom.

---

## What it does

**Organizers**
- Create a hackathon: name, description, banner image, prize pool, max team size, number of rounds
- Add rounds one at a time as the event progresses
- View all submissions for their hackathon
- Announce round winners — automatically opens the next round, or finalizes the hackathon on the last round

**Participants**
- Browse all hackathons
- Create a team (become team leader) or join an existing team by ID, up to the hackathon's max team size
- Submit a project per round — a live project URL and a GitHub repo link

---

## Project structure

```
EventX/
├── backend/      Express API, MongoDB models, JWT auth
├── frontend/     React app (Vite)
├── SETUP.md          Local development setup
├── FIXES.md           Every bug fixed, by file
├── FLOWS_AND_BUGS.md   Original audit (flows + bugs as found)
└── README.md           This file
```

---

## Quick start (local development)

Full details in [`SETUP.md`](./SETUP.md). Short version:

```bash
# Backend
cd backend
npm install
cp .env.example .env    # fill in MONGO_URI, JWT secrets, Cloudinary keys
npm run dev              # http://localhost:3000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm run dev              # http://localhost:5173
```

You'll need:
- A MongoDB connection (local install, or a free [Atlas](https://www.mongodb.com/cloud/atlas/register) cluster)
- A free [Cloudinary](https://cloudinary.com/users/register/free) account, for banner uploads

---

## Deployment

This guide deploys the backend to **Render** and the frontend to **Vercel** — both have generous free tiers and need no server management. The same backend works on Railway, Fly.io, or any Node host; the same frontend works on Netlify or any static host — the steps are analogous.

### 0. Push to GitHub

Deployment platforms deploy from a Git repo. If you haven't already:
```bash
git init
git add .
git commit -m "EventX fixed build"
git remote add origin <your-repo-url>
git push -u origin main
```

### 1. Database — MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (allow access from anywhere — Render's IPs aren't static on the free tier).
4. **Connect** → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/eventx?retryWrites=true&w=majority
   ```
   Replace `<username>`/`<password>` with your actual values, and make sure a database name (e.g. `eventx`) is in the path before the `?`.

Keep this string — it's your `MONGO_URI`.

### 2. Media storage — Cloudinary

1. Sign up free at [cloudinary.com](https://cloudinary.com/users/register/free).
2. Dashboard → **Account Details** — copy your **Cloud Name**, **API Key**, and **API Secret**.

### 3. Backend — Render

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service** → connect your GitHub repo.
2. Render should detect `backend/render.yaml` and pre-fill the settings (Blueprint). If it doesn't auto-detect, set these manually:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
3. Under **Environment**, add:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | your Atlas connection string from step 1 |
   | `ACCESS_TOKEN_SECRET` | a long random string — Render's Blueprint auto-generates this, or run `openssl rand -hex 32` |
   | `ACCESS_TOKEN_EXPIRY` | `1d` |
   | `REFRESH_TOKEN_SECRET` | another long random string, different from the access one |
   | `REFRESH_TOKEN_EXPIRY` | `10d` |
   | `CLOUDINARY_CLOUD_NAME` | from step 2 |
   | `CLOUDINARY_API_KEY` | from step 2 |
   | `CLOUDINARY_API_SECRET` | from step 2 |
   | `CORS_ORIGINS` | your frontend's URL once you know it — see step 4. You can leave this blank for now and come back to set it after deploying the frontend. |

4. Deploy. Render gives you a URL like `https://eventx-backend-xxxx.onrender.com`. Visit `<that-url>/health` — you should see `{"status":"ok"}`.

   > **Free-tier note:** Render's free web services spin down after 15 minutes of inactivity and take ~30–60 seconds to wake up on the next request. That's normal, not a bug — the first request after idle time will just be slow.

### 4. Frontend — Vercel

1. [vercel.com/new](https://vercel.com/new) → import the same GitHub repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Vite (`npm run build`, output `dist`).
3. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | your Render backend URL from step 3, e.g. `https://eventx-backend-xxxx.onrender.com` |

4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

### 5. Connect the two

Go back to Render → your backend service → **Environment** → set `CORS_ORIGINS` to your Vercel URL from step 4 (e.g. `https://your-app.vercel.app`). Save — Render redeploys automatically.

If you also want to test against the deployed backend from your local frontend dev server, use a comma-separated list:
```
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

### 6. Verify

1. Open your Vercel URL, sign up for an account.
2. Log in, create a hackathon with a banner image.
3. Check Cloudinary's Media Library — the banner should appear there.
4. Open browser devtools → Application → Cookies — confirm `accessToken`/`refreshToken` are set for your Vercel domain.

If login/signup fails with a CORS error in the browser console, double check `CORS_ORIGINS` on Render exactly matches your Vercel URL (no trailing slash).

---

## Environment variables reference

**Backend** (`backend/.env` — see `backend/.env.example`)

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Defaults to `3000` locally; hosting platforms set this automatically |
| `NODE_ENV` | Recommended | `production` in deployment — affects cookie security settings |
| `MONGO_URI` | Yes | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Yes | Random string, keep secret |
| `ACCESS_TOKEN_EXPIRY` | Yes | e.g. `1d` |
| `REFRESH_TOKEN_SECRET` | Yes | Random string, different from access token secret |
| `REFRESH_TOKEN_EXPIRY` | Yes | e.g. `10d` |
| `CORS_ORIGINS` | Recommended | Comma-separated frontend URL(s) allowed to call the API |
| `COOKIE_DOMAIN` | No | Only needed if sharing cookies across subdomains |
| `CLOUDINARY_CLOUD_NAME` | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Yes | From Cloudinary dashboard |

**Frontend** (`frontend/.env` — see `frontend/.env.example`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the backend API, no trailing slash |

---

## Out of scope

The original project included a Solidity smart-contract layer (`ethers.js`, on-chain prize escrow/voting) running in parallel with the MongoDB backend. That layer is not part of this fixed build — the backend's MetaMask auth route was removed, and while a couple of frontend wallet-UI components still exist in the tree, they're inert (nothing on the backend for them to call). See `FIXES.md` for details if you want to remove them fully or reintroduce the contract layer later.
# unst
