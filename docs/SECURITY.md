# Cloudflare Tunnel Security Guide

## 🔒 Jak to działa (i dlaczego jest bezpieczne)

```
┌─────────────────────────────────────────────────────────────┐
│  INTERNET                                                  │
│  User → https://api.yourdomain.com/api/health              │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ 1. Request do Cloudflare Edge (150+ lokalizacji)
               │    - DDoS protection
               │    - WAF (Web Application Firewall)
               │    - SSL/TLS termination
               ▼
┌─────────────────────────────────────────────────────────────┐
│  CLOUDFLARE NETWORK                                        │
│  - Anycast routing (najszybsza ścieżka)                    │
│  - Encrypted tunnel do Twojego serwera                     │
│  - Nie ma bezpośredniego połączenia z Twoim IP             │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ 2. Cloudflared tunnel (outbound z Twojego Mac Mini)
               │    - Tylko Ty inicjujesz połączenie
               │    - Firewall nie musi mieć otwartych portów
               ▼
┌─────────────────────────────────────────────────────────────┐
│  YOUR MAC MINI (w domu/za NAT)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cloudflared daemon                                  │   │
│  │ - Słucha tylko na localhost                         │   │
│  │ - Nie otwiera portów na zewnątrz                    │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                 │                                           │
│                 │ 3. Tylko port 3001, tylko /api/*          │
│                 ▼                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Backend API (Node.js/Express)                       │   │
│  │ - Hasło chronione endpointy                         │   │
│  │ - API keys tylko tutaj, nigdy w frontend            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ❌ NIE DOSTĘPNE:                                          │
│  - SSH (port 22)                                           │
│  - VNC/screen sharing                                      │
│  - File sharing                                            │
│  - Inne porty                                              │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Co jest chronione

### 1. Firewall stays CLOSED
```bash
# Twój Mac Mini NIE musi mieć otwartych portów
# Sprawdź: System Preferences → Security → Firewall
# Powinno być: "Block all incoming connections" ✅
```

### 2. Only ONE service exposed
- Tylko `http://localhost:3001` (backend API)
- Tylko ścieżki `/api/*` są routowane
- Wszystko inne zwraca 404

### 3. Multiple layers of security
| Warstwa | Ochrona |
|---------|---------|
| Cloudflare Edge | DDoS protection, rate limiting |
| Tunnel | Encrypted, authenticated connection |
| Path filtering | Only `/api/*` allowed |
| Backend | Password-protected endpoints |
| API Keys | Server-side only |

## ⚠️ Co MOŻE być ryzykiem (i jak temu zapobiec)

### Ryzyko: Ktoś zna URL Twojego API
**Zabezpieczenie:**
- Backend wymaga `X-Password` header dla KAŻDEGO requestu
- Hasło jest w `backend/.env.local` (nie w kodzie)
- Używaj mocnego hasła (nie "dominik123")

### Ryzyko: DDoS na Twój API
**Zabezpieczenie:**
- Cloudflare automatycznie blokuje DDoS
- Rate limiting jest domyślnie włączone
- Możesz dodać IP whitelist w configu

### Ryzyko: Ktoś wykryje Twój prawdziwy IP
**Zabezpieczenie:**
- Tunnel wychodzi z Twojego IP, ale użytkownik widzi tylko Cloudflare IP
- Twój IP nie jest w DNS records (CNAME do Cloudflare)
- W logach backendu: tylko 127.0.0.1 (localhost)

## 🔍 Weryfikacja bezpieczeństwa

### Sprawdź co jest wystawione:
```bash
# Zobacz aktywne tunele
cloudflared tunnel list

# Sprawdź status tunelu
cloudflared tunnel info speech-practice-api

# Zobacz logi
tail -f /tmp/cloudflared-speech-practice.out
```

### Testuj z zewnątrz:
```bash
# To powinno działać (API endpoint)
curl https://api.yourdomain.com/api/health

# To powinno zwrócić 404 (nie API)
curl https://api.yourdomain.com/
curl https://api.yourdomain.com/not-api
```

### Sprawdź firewall:
```bash
# Mac: czy firewall blokuje incoming?
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
# Powinno zwrócić: "Firewall is enabled. (State = 1)"
```

## 🆚 Cloudflare Tunnel vs Alternatywy

| Metoda | Bezpieczeństwo | Koszt | Użycie |
|--------|---------------|-------|--------|
| **Cloudflare Tunnel** | ⭐⭐⭐⭐⭐ | FREE | ✅ Rekomendowane |
| Port forwarding | ⭐☆☆☆☆ | FREE | ❌ Otwiera firewall |
| VPN (Tailscale) | ⭐⭐⭐⭐☆ | FREE | ⚠️ Wymaga klienta |
| VPS (Render/Railway) | ⭐⭐⭐⭐⭐ | FREE tier | ✅ Bez infrastruktury |

## 🚨 Emergency: Jak wyłączyć

### Tymczasowo (stop tunnel):
```bash
Ctrl+C w terminalu z cloudflared
# lub
pkill cloudflared
```

### Permanenty (delete tunnel):
```bash
cloudflared tunnel delete speech-practice-api
```

### Wyłącz auto-start:
```bash
launchctl unload ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist
rm ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist
```

## 📋 Checklist przed uruchomieniem

- [ ] Firewall Maca włączony (System Preferences → Security)
- [ ] Backend wymaga hasła (sprawdź `ACCESS_PASSWORD` w `.env.local`)
- [ ] API keys NIE są w kodzie frontendu
- [ ] Repository na GitHub jest PRYWATNE (lub publiczne bez sekretów)
- [ ] Wybrałeś silne hasło (nie "123456" czy "dominik123")
- [ ] Włączyłeś 2FA na Cloudflare (opcjonalne ale rekomendowane)

## ❓ FAQ

**Q: Czy ktoś może się włamać na mój Mac Mini przez ten tunnel?**
A: Nie. Tunnel wystawia tylko port 3001 (backend), i tylko ścieżki `/api/*`. Nie ma dostępu do SSH, plików, ani innych usług.

**Q: Co jak ktoś zgadnie mój backend URL?**
A: Każdy request wymaga `X-Password` header. Bez hasła dostaje 401 Unauthorized.

**Q: Czy mój prawdziwy IP jest widoczny?**
A: Nie dla użytkowników. Cloudflare ukrywa Twój IP. W logach backendu widzisz tylko 127.0.0.1.

**Q: Czy mogę ograniczyć do konkretnych krajów?**
A: Tak, w Cloudflare Dashboard → Security → WAF → Custom rules.

**Q: Co jak zapomnę hasła?**
A: Zmień `ACCESS_PASSWORD` w `backend/.env.local` i zrestartuj backend.
