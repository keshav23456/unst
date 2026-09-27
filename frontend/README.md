# EventX — Frontend

React + Vite + Redux Toolkit client for the EventX hackathon platform.

See the [project root README](../README.md) for the full setup and deployment guide, and [`../FIXES.md`](../FIXES.md) for what was fixed in this codebase.

## Quick reference

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm run dev              # local dev, http://localhost:5173
npm run build             # production build to dist/
```

Deployment config: [`vercel.json`](./vercel.json) (SPA routing rewrite).
