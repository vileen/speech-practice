# Deployment Notes

## Frontend Deployment (GitHub Pages)

**IMPORTANT: NIE używać ręcznie `npx gh-pages -d dist`!**

Frontend jest automatycznie budowany i deployowany przez **GitHub Actions** przy każdym pushu do `main`.

### Workflow
```
push do main → GitHub Actions → Build → Deploy do GitHub Pages
```

### Konfiguracja
- Workflow: `.github/workflows/deploy-frontend.yml`
- Trigger: `on: push: branches: [main]`
- Build: `yarn build` (z env VITE_API_URL)
- Deploy: `actions/deploy-pages@v4`

### Poprawny flow
```bash
cd ~/Projects/speech-practice
git add .
git commit -m "feat: ..."
git push origin main
# Gotowe! GitHub Actions zrobi resztę.
```

### Sprawdzenie statusu deploy
- Wejdź na: https://github.com/vileen/speech-practice/actions
- Sprawdź czy workflow "Deploy to GitHub Pages" przeszedł zielonym

### Jeśli potrzebny redeploy
```bash
git commit --allow-empty -m "trigger: redeploy"
git push origin main
```

---

## Backend Deployment

Backend (Node.js + Express) działa lokalnie na Mac Mini:
- Port: 3001
- URL lokalny: http://localhost:3001
- URL publiczny: https://speech.vileen.pl (via Cloudflare Tunnel)

### Restart backendu
```bash
cd ~/Projects/speech-practice/backend
npm run build
# Zabij stare procesy
pkill -f "node dist/server.js"
# Uruchom nowy
node dist/server.js &
```

### Cloudflare Tunnel
```bash
cloudflared tunnel run speech-practice
```
(uruchamiane automatycznie przez LaunchAgent)

---

## Pamiętaj
- ✅ Frontend: tylko `git push`, resztą zajmie się CI
- ❌ NIE: `npx gh-pages -d dist` - to nadpisuje Actions!

---

## Notka dla AI (Armin)

Kiedy użytkownik prosi o deploy frontendu:
1. ZAPYTAJ czy chce push do main (automatyczny deploy)
2. NIE używaj `npx gh-pages` bez wyraźnej zgody
3. Jeśli manualny deploy potrzebny - wyjaśnij dlaczego Actions jest lepsze

To samo dotyczy aktualizacji: wystarczy push do main, nie ma potrzeby ręcznego gh-pages.
