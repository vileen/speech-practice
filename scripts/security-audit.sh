#!/bin/bash
# Security Audit Script
# Checks configuration before exposing to internet

echo "🔍 Security Audit for Speech Practice"
echo "====================================="
echo ""

ERRORS=0
WARNINGS=0

# Check 1: .env files not in git
echo "1️⃣  Checking for exposed secrets in git..."
if git ls-files | grep -qE "\.env($|\.local)"; then
    echo "   ❌ FAIL: .env files found in git!"
    git ls-files | grep -E "\.env($|\.local)"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ PASS: No .env files in git"
fi

# Check 2: backend/.env.local exists
echo ""
echo "2️⃣  Checking backend configuration..."
if [ -f "backend/.env.local" ]; then
    echo "   ✅ backend/.env.local exists"
    
    # Check for default password
    if grep -q "ACCESS_PASSWORD=dominik123" backend/.env.local; then
        echo "   ⚠️  WARNING: Using default password 'dominik123'"
        echo "      Change it in backend/.env.local"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✅ Custom password set"
    fi
    
    # Check API keys are present but not empty
    if grep -q "ELEVENLABS_API_KEY=your_" backend/.env.example; then
        : # .example is template, OK
    fi
    
    if grep -q "^ELEVENLABS_API_KEY=$" backend/.env.local 2>/dev/null || \
       grep -q "^ELEVENLABS_API_KEY=sk_" backend/.env.local 2>/dev/null; then
        if grep -q "^ELEVENLABS_API_KEY=$" backend/.env.local 2>/dev/null; then
            echo "   ❌ FAIL: ELEVENLABS_API_KEY is empty"
            ERRORS=$((ERRORS + 1))
        else
            echo "   ✅ API keys configured"
        fi
    fi
else
    echo "   ❌ FAIL: backend/.env.local not found"
    echo "      Copy backend/.env.example and fill in your keys"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: GitHub remote configured
echo ""
echo "3️⃣  Checking GitHub repository..."
if git remote -v | grep -q "github.com"; then
    echo "   ✅ GitHub remote configured:"
    git remote -v | head -2
    
    # Check if private
    REMOTE_URL=$(git remote get-url origin)
    if [[ "$REMOTE_URL" == *"github.com:"* ]] || [[ "$REMOTE_URL" == *"github.com/"* ]]; then
        echo "   ℹ️  Repository URL: $REMOTE_URL"
        echo "   ⚠️  Make sure repo is PRIVATE if it contains any sensitive data"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ⚠️  No GitHub remote configured (run: git remote add origin ...)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 4: Backend is running
echo ""
echo "4️⃣  Checking backend status..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 3001"
else
    echo "   ⚠️  Backend not running (start with: cd backend && yarn dev)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 5: Cloudflare tunnel status
echo ""
echo "5️⃣  Checking Cloudflare tunnel..."
if command -v cloudflared &> /dev/null; then
    TUNNEL_LIST=$(cloudflared tunnel list 2>/dev/null | grep "speech-practice" || true)
    if [ -n "$TUNNEL_LIST" ]; then
        echo "   ✅ Tunnel exists:"
        echo "$TUNNEL_LIST" | head -1
        
        # Check if running
        if pgrep -f "cloudflared.*speech-practice" > /dev/null; then
            echo "   ✅ Tunnel is running"
        else
            echo "   ⚠️  Tunnel not running (start with: cloudflared tunnel run speech-practice-api)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "   ℹ️  No tunnel found (run: ./scripts/setup-cloudflare-tunnel.sh)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ℹ️  cloudflared not installed"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 6: Frontend build
echo ""
echo "6️⃣  Checking frontend build..."
if [ -f "frontend/dist/index.html" ]; then
    echo "   ✅ Frontend built"
    
    # Check if API_URL is set correctly
    if grep -q "VITE_API_URL" frontend/dist/assets/*.js 2>/dev/null; then
        echo "   ℹ️  Frontend has VITE_API_URL configured"
    else
        echo "   ⚠️  VITE_API_URL not found in build (may be empty = same origin)"
    fi
else
    echo "   ⚠️  Frontend not built (run: cd frontend && yarn build)"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "==========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo ""
    echo "🚀 Ready to deploy:"
    echo "   1. Push to GitHub: git push origin main"
    echo "   2. Set VITE_API_URL in GitHub Secrets"
    echo "   3. Start tunnel: cloudflared tunnel run speech-practice-api"
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found"
    echo "   Fix warnings before deploying for best security"
else
    echo "❌ $ERRORS error(s) and $WARNINGS warning(s) found"
    echo "   Fix errors before deploying!"
fi
echo "==========================================="

exit $ERRORS
