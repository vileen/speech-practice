import OpenAI from 'openai';
import { addFurigana } from './elevenlabs.js';
import { generateRomaji } from './romaji.js';

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
): Promise<{ text: string; textWithFurigana: string; romaji?: string; translation?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const basePrompt = `You are a helpful Japanese language practice partner. When the user makes grammar or vocabulary mistakes, gently correct them first by explaining what was wrong, then answer their question. Always respond in Japanese with furigana for kanji: <ruby>漢字<rt>かんじ</rt></ruby>. Do NOT include English translations in your response.

IMPORTANT - BE PERSISTENT:
1. If you ask multiple questions and the user only answers one, ASK AGAIN about the unanswered part
2. If their response is too short, push them to elaborate: "もっと詳しく教えてください"
3. Check for completeness - if they missed something, follow up: "〜についても教えてください"
4. Don't let them skip questions - keep asking until they answer fully
5. If they go off-topic, bring them back and repeat your question

Your job is to PUSH the user to practice more, not just accept minimal answers.`;
  
  const systemPrompt = lessonContext 
    ? `${lessonContext}\n\n${basePrompt}`
    : basePrompt;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  let rawText = response.choices[0]?.message?.content || 'すみません、もう一度言ってください。';
  
  // Extract translation if present
  let translation: string | undefined;
  const translationMatch = rawText.match(/TRANSLATION:\s*(.+)$/);
  if (translationMatch) {
    translation = translationMatch[1].trim();
    // Remove translation from main text
    rawText = rawText.replace(/\s*TRANSLATION:.+$/, '').trim();
  }
  
  // Extract plain text (remove any <ruby> tags that AI might have added)
  // Plain text should have kanji, not furigana markup
  const text = rawText.replace(/<ruby>[^<]*<rt>[^<]*<\/rt><\/ruby>/g, (match) => {
    // Extract just the kanji part (before <rt>)
    const kanjiMatch = match.match(/<ruby>([^<]*)<rt>/);
    return kanjiMatch ? kanjiMatch[1] : match;
  });
  
  // Always ensure furigana is properly added using our system
  let textWithFurigana = text;
  const kanjiRegex = /[\u4e00-\u9faf]/;
  if (kanjiRegex.test(text)) {
    textWithFurigana = await addFurigana(text);
  }

  // Generate romaji using furigana HTML for correct kanji readings
  const romaji = await generateRomaji(text, textWithFurigana);

  return {
    text,
    textWithFurigana,
    romaji,
    translation,
  };
}
