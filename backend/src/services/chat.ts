import OpenAI from 'openai';
import { addFurigana } from './elevenlabs.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  lessonContext?: string
): Promise<{ text: string; textWithFurigana: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const systemPrompt = lessonContext 
    ? `${lessonContext}\n\nIMPORTANT: Always respond in Japanese (unless asked for translation). Use furigana for kanji in this format: <ruby>漢字<rt>かんじ</rt></ruby>`
    : 'You are a helpful Japanese language practice partner. Respond in Japanese with furigana for kanji: <ruby>漢字<rt>かんじ</rt></ruby>';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  let text = response.choices[0]?.message?.content || 'すみません、もう一度言ってください。';
  
  // Add furigana if not already present
  let textWithFurigana = text;
  if (!text.includes('<ruby>')) {
    textWithFurigana = await addFurigana(text);
  }
  
  return {
    text,
    textWithFurigana,
  };
}
