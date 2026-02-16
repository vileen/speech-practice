#!/bin/bash
# Cloudflare Tunnel Setup for Speech Practice
# This creates a secure tunnel exposing ONLY the backend API

set -e

echo "🔒 Cloudflare Tunnel Security Setup"
echo "==================================="
echo ""
echo "⚠️  SECURITY INFO:"
echo "    - Only port 3001 (backend API) will be exposed"
echo "    - Your Mac Mini stays behind firewall"
echo "    - Tunnel uses encrypted connection to Cloudflare"
echo "    - No direct access to your computer"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    brew install cloudflare/cloudflare/cloudflared
fi

# Check version
echo "✅ cloudflared version: $(cloudflared --version)"
echo ""

# Login to Cloudflare (opens browser)
if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
    echo "🔐 Login to Cloudflare (this will open browser)..."
    cloudflared tunnel login
fi

# Create tunnel
TUNNEL_NAME="speech-practice-api"
echo ""
echo "🚇 Creating tunnel: $TUNNEL_NAME"

# Check if tunnel already exists
EXISTING_TUNNEL=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')

if [ -n "$EXISTING_TUNNEL" ]; then
    echo "   ℹ️  Tunnel already exists (ID: $EXISTING_TUNNEL)"
    TUNNEL_ID=$EXISTING_TUNNEL
else
    TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1)
    TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oE '[a-f0-9-]{36}' | head -1)
    echo "   ✅ Created tunnel (ID: $TUNNEL_ID)"
fi

# Get credentials file path
CREDENTIALS_FILE="$HOME/.cloudflared/${TUNNEL_ID}.json"

if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo "❌ Credentials file not found: $CREDENTIALS_FILE"
    exit 1
fi

echo ""
echo "🌐 Setting up DNS route..."

# Ask for domain
echo ""
echo "Enter your domain (e.g., speech-api.yourdomain.com):"
read -r DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Domain is required"
    exit 1
fi

# Route DNS
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN" 2>/dev/null || {
    echo "   ℹ️  DNS route may already exist, continuing..."
}

echo "   ✅ DNS: $DOMAIN → tunnel"

# Create config file
CONFIG_FILE="$HOME/.cloudflared/config.yml"

echo ""
echo "📝 Creating config file..."

cat > "$CONFIG_FILE" << EOF
# Cloudflare Tunnel Configuration
# This exposes ONLY the speech practice API (port 3001)

tunnel: ${TUNNEL_ID}
credentials-file: ${CREDENTIALS_FILE}

ingress:
  # ONLY route /api/* paths to the backend
  # Everything else gets 404 (not exposed)
  - hostname: ${DOMAIN}
    path: /api/*
    service: http://localhost:3001
    
  # Block everything else at this hostname
  - hostname: ${DOMAIN}
    service: http_status:404
    
  # Default catch-all
  - service: http_status:404

# Additional security headers
originRequest:
  connectTimeout: 30s
  tlsTimeout: 10s
  tcpKeepAlive: 30s
  noHappyEyeballs: false
  noTLSVerify: false
  # IP restrictions (optional - add your home IP for extra security)
  # ipRules:
  #   - prefix: 1.2.3.4/32
  #     allow: true
  #   - prefix: 0.0.0.0/0
  #     allow: false
EOF

echo "   ✅ Config: $CONFIG_FILE"

# Create systemd service file for auto-start
SERVICE_FILE="$HOME/Library/LaunchAgents/com.cloudflare.speech-practice.plist"

echo ""
echo "⚙️  Creating auto-start service..."

cat > "$SERVICE_FILE" << EOF
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
    <key>StandardErrorPath</key>
    <string>/tmp/cloudflared-speech-practice.err</string>
    <key>StandardOutPath</key>
    <string>/tmp/cloudflared-speech-practice.out</string>
</dict>
</plist>
EOF

echo "   ✅ Service file: $SERVICE_FILE"

# Summary
echo ""
echo "==========================================="
echo "✅ SETUP COMPLETE!"
echo "==========================================="
echo ""
echo "🌐 Your API will be available at:"
echo "    https://${DOMAIN}"
echo ""
echo "📋 GitHub Secret to set:"
echo "    Name:  VITE_API_URL"
echo "    Value: https://${DOMAIN}"
echo ""
echo "🚀 Start the tunnel now:"
echo "    cloudflared tunnel run ${TUNNEL_NAME}"
echo ""
echo "🔄 Or load auto-start service:"
echo "    launchctl load ~/Library/LaunchAgents/com.cloudflare.speech-practice.plist"
echo ""
echo "🔒 Security:"
echo "    - Only /api/* paths are exposed"
echo "    - Port 3001 only, nothing else"
echo "    - Encrypted tunnel to Cloudflare"
echo "    - Your IP stays hidden"
echo ""
echo "📊 Monitor tunnel:"
echo "    cloudflared tunnel info ${TUNNEL_NAME}"
echo ""

# Offer to start now
echo "Start tunnel now? (y/n)"
read -r START_NOW

if [ "$START_NOW" = "y" ] || [ "$START_NOW" = "Y" ]; then
    echo ""
    echo "🚀 Starting tunnel..."
    echo "   Press Ctrl+C to stop"
    echo ""
    cloudflared tunnel run "$TUNNEL_NAME"
fi
