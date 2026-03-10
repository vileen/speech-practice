#!/bin/bash
# Daily Code Analysis, Test Addition, and Refactoring Task
# Runs at 5:00 AM daily

cd ~/Projects/speech-practice

LOG_FILE="~/Projects/speech-practice/scripts/daily-maintenance.log"
echo "=== Daily Code Maintenance Task ===" >> "$LOG_FILE"
echo "Started at: $(date)" >> "$LOG_FILE"

# Run the ACP agent for code maintenance
cat > /tmp/maintenance-task.md << 'TASK'
Daily Code Maintenance Task

1. Analyze the codebase in ~/Projects/speech-practice
2. Find what needs testing or refactoring
3. Add ONE test that would be most valuable
4. If there's a component that needs modularization/refactoring, do it

Priority for tests:
- Hooks without tests: useAudioPlayer, useFurigana, useChatSession
- Components without tests: AudioPlayer, JapanesePhrase, HighlightedText

Priority for refactoring:
- Large components (check line counts)
- Components with mixed responsibilities
- Look for opportunities to extract smaller components

Always run tests before committing.
Make small, focused changes.
Commit with descriptive message.
TASK

echo "Spawning ACP agent for maintenance..." >> "$LOG_FILE"

# The actual work will be done by spawning a sub-agent
echo "Task prepared. Ready to spawn agent." >> "$LOG_FILE"
echo "Completed at: $(date)" >> "$LOG_FILE"
