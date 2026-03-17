#!/bin/bash

# Build and deploy to GitHub Pages
set -e

echo "Building frontend for GitHub Pages..."

# Build the frontend
cd ~/Projects/speech-practice/frontend
yarn build

# Remove old build files from docs (preserve featureIdeas/, _redirects, etc.)
echo "Cleaning old build files..."
rm -f ../docs/index.html
rm -f ../docs/assets/*.js ../docs/assets/*.css 2>/dev/null || true

# Copy new dist files to docs folder
cp -r dist/* ../docs/

# Ensure no .env files are in docs
echo "Cleaning up sensitive files..."
rm -f ../docs/.env*

echo "Build complete!"
echo ""
echo "To deploy:"
echo "1. Commit changes: git add . && git commit -m 'Deploy to GitHub Pages'"
echo "2. Push to GitHub: git push origin main"
echo "3. Enable GitHub Pages in repository settings (source: docs folder)"
echo ""
echo "App will be available at: https://vileen.github.io/speech-practice/"
