# Cloudflare Tunnel Security Guide

## 🔒 How It Works (and why it's secure)

```
┌─────────────────────────────────────────────────────────────┐
│  INTERNET                                                  │
│  User → https://api.yourdomain.com/api/health              │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ 1. Request to Cloudflare Edge (150+ locations)
               │    - DDoS protection
               │    - WAF (Web Application Firewall)
               │    - SSL/TLS termination
               ▼
┌─────────────────────────────────────────────────────────────┐
│  CLOUDFLARE NETWORK                                        │
│  - Anycast routing (fastest path)                          │
│  - Encrypted tunnel to your server                         │
│  - No direct connection to your IP                         │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ 2. Cloudflared tunnel (outbound from your server)
               │    - Only you initiate the connection
               │    - Firewall doesn't need open ports
               ▼
┌─────────────────────────────────────────────────────────────┐
│  YOUR SERVER (home/behind NAT)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cloudflared daemon                                  │   │
│  │ - Listens only on localhost                         │   │
│  │ - No ports exposed externally                       │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                 │                                           │
│                 │ 3. Only port 3001, only /api/*            │
│                 ▼                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Backend API (Node.js/Express)                       │   │
│  │ - Password-protected endpoints                      │   │
│  │ - API keys only here, never in frontend             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ❌ NOT EXPOSED:                                           │
│  - SSH (port 22)                                           │
│  - VNC/screen sharing                                      │
│  - File sharing                                            │
│  - Other ports                                             │
└─────────────────────────────────────────────────────────────┘
```

## ✅ What's Protected

### 1. Firewall stays CLOSED
```bash
# Your server does NOT need open ports
# Check your firewall settings
# Should be: "Block all incoming connections" ✅
```

### 2. Only ONE service exposed
- Only `http://localhost:3001` (backend API)
- Only paths `/api/*` are routed
- Everything else returns 404

### 3. Multiple layers of security
| Layer | Protection |
|-------|------------|
| Cloudflare Edge | DDoS protection, rate limiting |
| Tunnel | Encrypted, authenticated connection |
| Path filtering | Only `/api/*` allowed |
| Backend | Password-protected endpoints |
| API Keys | Server-side only |

## ⚠️ Potential Risks (and how to prevent them)

### Risk: Someone knows your API URL
**Mitigation:**
- Backend requires `X-Password` header for EVERY request
- Password is in `backend/.env.local` (not in code)
- Use a strong password (not "password123")

### Risk: DDoS on your API
**Mitigation:**
- Cloudflare automatically blocks DDoS
- Rate limiting is enabled by default
- You can add IP whitelist in config

### Risk: Someone discovers your real IP
**Mitigation:**
- Tunnel originates from your IP, but users only see Cloudflare IP
- Your IP is not in DNS records (CNAME to Cloudflare)
- Backend logs only show 127.0.0.1 (localhost)

## 🔍 Security Verification

### Check what's exposed:
```bash
# List active tunnels
cloudflared tunnel list

# Check tunnel status
cloudflared tunnel info speech-practice-api

# View logs
tail -f /tmp/cloudflared-speech-practice.out
```

### Test from outside:
```bash
# This should work (API endpoint)
curl https://api.yourdomain.com/api/health

# These should return 404 (not API)
curl https://api.yourdomain.com/
curl https://api.yourdomain.com/not-api
```

### Check firewall:
```bash
# Linux with ufw:
sudo ufw status

# macOS:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Should show firewall enabled
```

## 🆚 Cloudflare Tunnel vs Alternatives

| Method | Security | Cost | Best For |
|--------|----------|------|----------|
| **Cloudflare Tunnel** | ⭐⭐⭐⭐⭐ | FREE | ✅ Recommended |
| Port forwarding | ⭐☆☆☆☆ | FREE | ❌ Opens firewall |
| VPN (Tailscale/WireGuard) | ⭐⭐⭐⭐☆ | FREE | ⚠️ Requires client |
| VPS (Render/Railway/Fly) | ⭐⭐⭐⭐⭐ | Free tier | ✅ No infrastructure |

## 🚨 Emergency: How to Disable

### Temporarily (stop tunnel):
```bash
Ctrl+C in the terminal running cloudflared
# or
pkill cloudflared
```

### Permanently (delete tunnel):
```bash
cloudflared tunnel delete speech-practice-api
```

### Disable auto-start:
```bash
# macOS:
launchctl unload ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist
rm ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist

# Linux (systemd):
sudo systemctl stop cloudflared
sudo systemctl disable cloudflared
```

## 📋 Pre-launch Checklist

- [ ] Firewall enabled on your server
- [ ] Backend requires password (check `ACCESS_PASSWORD` in `.env.local`)
- [ ] API keys NOT in frontend code
- [ ] Repository is PRIVATE (or public without secrets)
- [ ] Strong password chosen (not "123456" or "password")
- [ ] 2FA enabled on Cloudflare (optional but recommended)

## ❓ FAQ

**Q: Can someone hack my server through this tunnel?**
A: No. The tunnel only exposes port 3001 (backend), and only paths `/api/*`. No access to SSH, files, or other services.

**Q: What if someone guesses my backend URL?**
A: Every request requires `X-Password` header. Without the password, they get 401 Unauthorized.

**Q: Is my real IP visible?**
A: Not to users. Cloudflare hides your IP. Backend logs only show 127.0.0.1.

**Q: Can I restrict to specific countries?**
A: Yes, in Cloudflare Dashboard → Security → WAF → Custom rules.

**Q: What if I forget the password?**
A: Change `ACCESS_PASSWORD` in `backend/.env.local` and restart the backend.
