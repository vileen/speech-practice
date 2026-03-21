# Deployment Guide

Complete deployment instructions for speech-practice application.

---

## Frontend Deployment (GitHub Pages)

**Important:** Do NOT manually run `npx gh-pages -d dist`!

Frontend is automatically built and deployed by GitHub Actions on every push to main.

```
push to main → GitHub Actions → Build → Deploy to GitHub Pages
```

- **Workflow:** `.github/workflows/deploy-frontend.yml`
- **Trigger:** `on: push: branches: [main]`
- **Build:** `yarn build` (with env VITE_API_URL)
- **Deploy:** `actions/deploy-pages@v4`

### Deploy Frontend

```bash
cd ~/Projects/speech-practice
git add .
git commit -m "feat: ..."
git push origin main
# Done! GitHub Actions will handle the rest.
```

### Check Deployment Status

1. Go to: https://github.com/vileen/speech-practice/actions
2. Check if "Deploy to GitHub Pages" workflow passed (green)

### Force Redeploy

```bash
git commit --allow-empty -m "trigger: redeploy"
git push origin main
```

---

## Backend Deployment (Local + Cloudflare Tunnel)

Backend (Node.js + Express) runs locally on Mac Mini:

- **Port:** 3001
- **Local URL:** http://localhost:3001
- **Public URL:** https://speech.vileen.pl (via Cloudflare Tunnel)
- **Process Manager:** PM2

### Quick Deploy

```bash
# 1. Build backend
cd ~/Projects/speech-practice/backend
npm run build

# 2. Restart PM2 process
pm2 restart speech-practice
pm2 save
```

### Verify Deployment

```bash
# Check process status
pm2 status speech-practice

# Test new endpoints
curl https://speech.vileen.pl/api/grammar/confusion-stats
curl "https://speech.vileen.pl/api/grammar/mixed-review?categories=I-Adjectives,Na-Adjectives&limit=10"
```

### Manual Start (if PM2 fails)

```bash
cd ~/Projects/speech-practice/backend
npm run build
pkill -f "node dist/server.js"
node dist/server.js &
```

### Cloudflare Tunnel

```bash
# Run tunnel manually (usually auto-started by LaunchAgent)
cloudflared tunnel run speech-practice
```

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   GitHub Pages  │     │   Mac Mini       │     │  Cloudflare     │
│   (Frontend)    │◄────│   (Backend)      │◄────│  (Tunnel)       │
│                 │     │   Port 3001      │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       ▲                        ▲                         ▲
       │                        │                         │
       ▼                        ▼                         ▼
https://vileen.github.io   http://localhost:3001   https://speech.vileen.pl
```

- **Frontend:** Built by GitHub Actions, hosted on GitHub Pages
- **Backend:** Built locally, managed by PM2, exposed via Cloudflare Tunnel
- **Database:** PostgreSQL running locally on Mac Mini

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend not updating | Check GitHub Actions status, wait 1-2 minutes |
| 404 on new API endpoints | Backend not restarted after build - run `pm2 restart speech-practice` |
| PM2 not found | `npm install -g pm2` |
| Cloudflared tunnel down | `pm2 restart speech-practice-tunnel` |
| Database connection error | Check PostgreSQL is running: `brew services start postgresql` |
| Build fails | Run `npm install` in both frontend and backend directories |

---

## Last Deployed

- **Frontend:** Auto-deployed on every push to main
- **Backend:** 2026-03-21 02:41 GMT+1 - Grammar Anti-Confusion features complete (Discrimination Drills, Pattern Graph, Exercise Coverage)

---

## Environment Variables

### Frontend (`frontend/.env`)
```
VITE_API_URL=https://speech.vileen.pl
```

### Backend (`backend/.env.local`)
```
DATABASE_URL=postgresql://localhost:5432/speech_practice
PASSWORD=your-password-here
```

---

*Last updated: 2026-03-21*
