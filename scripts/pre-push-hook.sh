#!/bin/sh
# .git/hooks/pre-push - Run tests before push

echo "Running tests before push..."

# Test backend logic
cd backend
echo "Running VoiceRecorder tests..."
npx tsx scripts/test-voice-recorder-logic.ts
if [ $? -ne 0 ]; then
    echo "❌ VoiceRecorder tests failed! Push aborted."
    exit 1
fi

echo "Running Repeat Mode loading tests..."
npx tsx scripts/test-repeat-mode-loading.ts
if [ $? -ne 0 ]; then
    echo "❌ Repeat Mode tests failed! Push aborted."
    exit 1
fi

# Test frontend
cd ../frontend
echo "Running frontend tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Frontend tests failed! Push aborted."
    exit 1
fi

# Build frontend to catch TypeScript errors
cd ../frontend
npm run build > /tmp/build.log 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check /tmp/build.log"
    exit 1
fi

echo "✅ All checks passed!"
exit 0
