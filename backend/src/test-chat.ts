import { generateChatResponse } from './services/chat.js';

async function test() {
  const result = await generateChatResponse(
    [{ role: 'user', content: '[START_CONVERSATION]' }],
    'Lesson: Test\nKey vocabulary: 京都, 東京\nGrammar: comparisons'
  );
  console.log('Result:', JSON.stringify(result, null, 2));
  process.exit(0);
}

test();
