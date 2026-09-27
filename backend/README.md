# EventX — Backend

Express + MongoDB API for the EventX hackathon platform.

See the [project root README](../README.md) for the full setup and deployment guide, and [`../FIXES.md`](../FIXES.md) for what was fixed in this codebase.

## Quick reference

```bash
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets, Cloudinary keys
npm run dev             # local dev, auto-restart
npm start                # production
```

Health check: `GET /health`

Deployment config: [`render.yaml`](./render.yaml) (Render Blueprint).
