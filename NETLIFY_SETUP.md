# Netlify Setup for Speech Practice

This document describes how to deploy Speech Practice frontend to Netlify.

## Quick Deploy

### Option 1: Git Integration (Recommended)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select `vileen/speech-practice`
4. Build settings will be auto-detected from `netlify.toml`:
   - Base directory: `frontend`
   - Build command: `yarn build`
   - Publish directory: `dist`
5. Set environment variable:
   - `VITE_API_URL` = `https://speech.vileen.pl`
6. Click **Deploy site**

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
./deploy-netlify.sh
```

## Configuration

### Environment Variables

Set these in Netlify dashboard (Site settings → Environment variables):

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://speech.vileen.pl` | Backend API URL |
| `NODE_VERSION` | `20` | Node.js version |

### Custom Domain

1. In Netlify dashboard: **Domain settings** → **Add custom domain**
2. Add `speech-practice.vileen.pl` or your preferred subdomain
3. Update DNS at your provider to point to Netlify

## Files

- `netlify.toml` - Main Netlify configuration
- `frontend/public/_redirects` - SPA redirect rules
- `deploy-netlify.sh` - Deploy script

## Troubleshooting

### Build fails
- Check that `VITE_API_URL` is set in environment variables
- Verify Node.js version is 18+ in build settings

### API calls fail (CORS)
- Backend must allow the Netlify domain in CORS settings
- Add Netlify domain to `ALLOWED_ORIGINS` in backend config

### Routes return 404
- SPA redirects are configured in `netlify.toml` and `_redirects`
- Both files must be present

## Migration from GitHub Pages

1. Deploy to Netlify as described above
2. Test the Netlify URL thoroughly
3. Update DNS or GitHub Pages settings to redirect
4. Update any hardcoded URLs in documentation
