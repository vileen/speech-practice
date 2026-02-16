# GitHub Setup Instructions

## 1. Create GitHub Repository

Go to https://github.com/new and create a new repository:
- Name: `speech-practice` (or any name you prefer)
- Make it: **Public** or **Private** (your choice)
- Don't initialize with README (we already have one)

## 2. Push Your Code

```bash
cd ~/Projects/speech-practice

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/speech-practice.git

# Push to GitHub
git push -u origin main
```

## 3. Setup GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. That's it! The workflow is already configured

## 4. Configure Backend Access (Choose one option)

### Option A: Cloudflare Tunnel (Recommended - FREE)

This exposes your local backend through a public URL:

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Login
cloudflared tunnel login

# Run the deploy script
./scripts/deploy-with-tunnel.sh
```

You'll get a public URL like `https://api.yourdomain.com`

Then set GitHub Secret:
1. Go to repo → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `VITE_API_URL`
4. Value: `https://your-tunnel-domain.com`

### Option B: Deploy to Render.com (FREE)

1. Go to https://render.com and sign up
2. Create new **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `yarn install`
   - **Start Command**: `yarn start`
5. Add environment variables from `.env.example`
6. Get your Render URL (e.g., `https://speech-practice.onrender.com`)
7. Set `VITE_API_URL` secret in GitHub to that URL

### Option C: Keep on Tailscale Only (PRIVATE)

Don't use GitHub Pages. Keep accessing via:
```
https://dominiks-mini.tailfd99a9.ts.net/
```

(Only works when you're on Tailscale)

## 5. Update Frontend API URL

After setting up the backend publicly, update the GitHub secret:

1. Repo → Settings → Secrets → Actions
2. New repository secret
3. Name: `VITE_API_URL`
4. Value: Your backend URL (e.g., `https://api.yoursite.com`)

## 6. Redeploy

Push any change to trigger redeploy:
```bash
git commit --allow-empty -m "Trigger deploy"
git push
```

## 7. Access Your App

After GitHub Actions completes:
- Go to repo → Actions → Deploy to GitHub Pages
- Wait for green checkmark ✅
- Go to Settings → Pages to see your URL
- Or check: `https://YOUR_USERNAME.github.io/speech-practice`

## Security Checklist

- [ ] `.env.local` is NOT committed (check with `git ls-files | grep env`)
- [ ] API keys are only in GitHub Secrets (not in code)
- [ ] `ACCESS_PASSWORD` is changed from default
- [ ] Repository is private (optional but recommended)

## Troubleshooting

### Build fails on GitHub Actions
- Check Actions tab for error logs
- Make sure `VITE_API_URL` is set correctly

### Backend not accessible
- Check if cloudflared tunnel is running
- Verify CORS settings in backend include your GitHub Pages domain

### CORS errors
Add your GitHub Pages domain to backend `.env.local`:
```
ALLOWED_ORIGINS=https://YOUR_USERNAME.github.io,http://localhost:5173
```
