#!/bin/bash
# Complete Cloudflare Tunnel Setup for vileen
# Run this after: cloudflared tunnel login

set -e

echo "🚇 Creating tunnel..."

TUNNEL_NAME="speech-practice-api"
DOMAIN="speech-api.vileen.workers.dev"

# Create tunnel
TUNNEL_ID=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1 | grep -oE '[a-f0-9-]{36}' | head -1)
echo "✅ Tunnel ID: $TUNNEL_ID"

# Route DNS
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN" 2>/dev/null || true
echo "✅ Domain: $DOMAIN"

# Create config
cat > "$HOME/.cloudflared/config.yml" << EOF
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

# Create launchd service
mkdir -p ~/Library/LaunchAgents
cat > ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist << EOF
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
        <string>${TUNNEL_NAME}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

echo "✅ Auto-start service created"

# Summary
echo ""
echo "==========================================="
echo "✅ TUNNEL READY!"
echo "==========================================="
echo ""
echo "🌐 Your API URL:"
echo "    https://${DOMAIN}"
echo ""
echo "📝 Add to GitHub Secrets:"
echo "    Name:  VITE_API_URL"
echo "    Value: https://${DOMAIN}"
echo ""
echo "🚀 Start now:"
echo "    cloudflared tunnel run ${TUNNEL_NAME}"
echo ""
echo "🔄 Or enable auto-start:"
echo "    launchctl load ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist"
echo ""
