#!/bin/bash
# Deploy script for backend with Cloudflare Tunnel
# This exposes your local backend publicly via Cloudflare

echo "🚀 Speech Practice Backend Deploy Script"
echo "========================================"

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared not found. Installing..."
    brew install cloudflare/cloudflare/cloudflared
fi

# Check if tunnel exists
TUNNEL_NAME="speech-practice"
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')

if [ -z "$TUNNEL_ID" ]; then
    echo "🔧 Creating new tunnel: $TUNNEL_NAME"
    cloudflared tunnel create "$TUNNEL_NAME"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
fi

echo "📡 Tunnel ID: $TUNNEL_ID"

# Get domain
DOMAIN=$(cloudflared tunnel route dns "$TUNNEL_NAME" 2>/dev/null | grep -oE '[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' | head -1)

if [ -z "$DOMAIN" ]; then
    echo "🌐 Enter your domain (e.g., api.yourdomain.com):"
    read DOMAIN
    cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"
fi

echo "🌐 Domain: $DOMAIN"

# Create config file
CONFIG_FILE="$HOME/.cloudflared/${TUNNEL_ID}.json"
cat > "$CONFIG_FILE" << EOF
{
    "url": "http://localhost:3001",
    "tunnel": "$TUNNEL_ID",
    "credentials-file": "$HOME/.cloudflared/${TUNNEL_ID}.json"
}
EOF

echo "✅ Config saved to: $CONFIG_FILE"
echo ""
echo "📝 Update your GitHub Secrets:"
echo "   VITE_API_URL=https://$DOMAIN"
echo ""
echo "🚀 Starting tunnel..."
echo "   Your backend will be available at: https://$DOMAIN"
echo ""
cloudflared tunnel run "$TUNNEL_NAME"
