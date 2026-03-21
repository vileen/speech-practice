# Backend Deployment Process

> Quick reference for deploying speech-practice backend updates.

## Deploy Steps

```bash
# 1. Build backend
cd ~/Projects/speech-practice/backend
npm run build

# 2. Restart PM2 process
pm2 restart speech-practice
pm2 save
```

## Verify Deployment

```bash
# Check process status
pm2 status speech-practice

# Test new endpoints
curl https://speech.vileen.pl/api/grammar/confusion-stats
curl https://speech.vileen.pl/api/grammar/mixed-review?categories=I-Adjectives,Na-Adjectives&limit=10
```

## Architecture

- **Local backend:** Runs on port 3001
- **PM2 process:** `speech-practice` (cluster mode)
- **Tunnel:** Cloudflared (`~/.cloudflared/speech-practice.yml`)
- **Public URL:** https://speech.vileen.pl

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on new endpoints | Backend not restarted after build |
| PM2 not found | `npm install -g pm2` |
| Cloudflared down | `pm2 restart speech-practice-tunnel` |

## Last Deployed
- 2026-03-21 01:23 GMT+1 - Grammar Anti-Confusion features
