#!/bin/bash
# Complete setup after cloudflared login

echo "🚇 Creating tunnel..."

# Check if authenticated
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "❌ Not authenticated. Run first:"
    echo "   cloudflared tunnel login"
    exit 1
fi

echo "✅ Authenticated!"

# Delete old tunnel if exists
cloudflared tunnel delete speech-practice-api 2>/dev/null || true

# Create new tunnel
TUNNEL_OUTPUT=$(cloudflared tunnel create speech-practice-api 2>&1)
echo "$TUNNEL_OUTPUT"

TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oE '[a-f0-9-]{36}' | head -1)

if [ -z "$TUNNEL_ID" ]; then
    echo "❌ Failed to create tunnel"
    exit 1
fi

echo "✅ Tunnel ID: $TUNNEL_ID"

# Create DNS route
DOMAIN="speech-api.vileen.workers.dev"
cloudflared tunnel route dns speech-practice-api "$DOMAIN"
echo "✅ Domain: $DOMAIN"

# Create config
cat > ~/.cloudflared/config.yml << EOF
tunnel: ${TUNNEL_ID}
credentials-file: $HOME/.cloudflared/${TUNNEL_ID}.json
ingress:
  - hostname: ${DOMAIN}
    path: /api/*
    service: http://localhost:3001
  - hostname: ${DOMAIN}
    service: http_status:404
  - service: http_status:404
EOF

echo "✅ Config created"

# Create auto-start service
mkdir -p ~/Library/LaunchAgents
cat > ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.speech-practice</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>run</string>
        <string>speech-practice-api</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
PLIST

echo "✅ Auto-start service created"

# Summary
echo ""
echo "==========================================="
echo "✅ TUNNEL READY!"
echo "==========================================="
echo ""
echo "🌐 API URL: https://${DOMAIN}"
echo ""
echo "📝 GitHub Secret:"
echo "    Name:  VITE_API_URL"
echo "    Value: https://${DOMAIN}"
echo ""
echo "🚀 Start tunnel:"
echo "    cloudflared tunnel run speech-practice-api"
echo ""
echo "🔄 Auto-start:"
echo "    launchctl load ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist"
echo ""

# Test
sleep 2
echo "🧪 Testing..."
curl -s https://${DOMAIN}/api/health && echo " ✅ WORKING!" || echo "⏳ Start tunnel first"
