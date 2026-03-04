#!/bin/bash
# Deploy script for Netlify

echo "🚀 Deploying Speech Practice to Netlify..."

# Build frontend
cd frontend
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

echo "🔨 Building..."
yarn build

echo "🌐 Deploying to Netlify..."
# Use netlify CLI if installed, otherwise provide instructions
if command -v netlify &> /dev/null; then
  netlify deploy --prod --dir=dist
else
  echo "⚠️  Netlify CLI not installed. Install with: npm install -g netlify-cli"
  echo "📝 Or deploy manually:"
  echo "   1. Go to https://app.netlify.com"
  echo "   2. Create new site from Git"
  echo "   3. Connect GitHub repo: vileen/speech-practice"
  echo "   4. Build settings will be read from netlify.toml"
  echo "   5. Set environment variable: VITE_API_URL=https://speech.vileen.pl"
fi
