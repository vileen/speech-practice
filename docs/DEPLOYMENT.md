# Deployment Guide

Generic deployment instructions for speech-practice application.

---

## Frontend Deployment (GitHub Pages)

**Important:** Do NOT manually run `npx gh-pages -d dist`!

Frontend is automatically built and deployed by GitHub Actions on every push to main.

```
push to main → GitHub Actions → Build → Deploy to GitHub Pages
```

- **Workflow:** `.github/workflows/deploy-frontend.yml`
- **Trigger:** `on: push: branches: [main]`

### Deploy Frontend

```bash
git add .
git commit -m "feat: ..."
git push origin main
# GitHub Actions handles the rest
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

## Backend Deployment

### Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   GitHub Pages  │     │   Backend Server │     │   Cloudflare    │
│   (Frontend)    │◄────│   (Node.js)      │◄────│  (Tunnel)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       ▲                        ▲                         ▲
       │                        │                         │
       ▼                        ▼                         ▼
https://vileen.github.io   http://localhost:3001   https://speech.vileen.pl
```

- **Frontend:** Built by GitHub Actions, hosted on GitHub Pages
- **Backend:** Node.js + Express running locally, exposed via Cloudflare Tunnel
- **Database:** PostgreSQL (local instance)

### Environment Setup

#### Frontend (`frontend/.env`)
```
VITE_API_URL=https://speech.vileen.pl
```

#### Backend (`backend/.env.local`)
```
DATABASE_URL=postgresql://localhost:5432/speech_practice
PASSWORD=your-password-here
```

### Build and Deploy Backend

```bash
cd backend
npm run build
# Restart your process manager (PM2, systemd, etc.)
pm2 restart speech-practice
```

### Cloudflare Tunnel

Run your tunnel (usually managed by process manager):

```bash
cloudflared tunnel run speech-practice
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend not updating | Check GitHub Actions status, wait 1-2 minutes |
| 404 on new API endpoints | Backend not restarted after build |
| Database connection error | Check PostgreSQL is running |
| Build fails | Run `npm install` in both frontend and backend directories |

---

## Initial Setup (First Time Only)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- PM2 (`npm install -g pm2`)
- cloudflared

### Database Setup
```bash
# Create database
createdb speech_practice

# Run migrations
psql speech_practice < schema.sql
```

---

*Last updated: 2026-03-22*
