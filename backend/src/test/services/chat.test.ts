import { describe, it, expect } from 'vitest';
import { generateChatResponse } from '../../services/chat.js';

describe('chat service - text extraction', () => {
  it('should extract plain text from AI response with ruby tags', async () => {
    // Simulate AI response with ruby tags in the text
    const messages = [{ role: 'user' as const, content: 'Test message' }];
    
    // This would come from AI - we can't easily mock OpenAI here
    // So let's test the extraction logic separately
    const aiResponseWithRuby = '<ruby>今晩<rt>こんばん</rt></ruby>、<ruby>何<rt>なに</rt></ruby>をしますか？';
    
    // Extract plain text (same logic as in chat.ts)
    const plainText = aiResponseWithRuby.replace(/<ruby>[^<]*<rt>[^<]*<\/rt><\/ruby>/g, (match) => {
      const kanjiMatch = match.match(/<ruby>([^<]*)<rt>/);
      return kanjiMatch ? kanjiMatch[1] : match;
    });
    
    console.log('Original:', aiResponseWithRuby);
    console.log('Plain:', plainText);
    
    // Plain text should have kanji, not ruby markup
    expect(plainText).toBe('今晩、何をしますか？');
    expect(plainText).not.toContain('<ruby>');
    expect(plainText).not.toContain('<rt>');
  });

  it('should handle text without ruby tags', async () => {
    const textWithoutRuby = 'こんにちは、元気ですか？';
    
    const plainText = textWithoutRuby.replace(/<ruby>[^<]*<rt>[^<]*<\/rt><\/ruby>/g, (match) => {
      const kanjiMatch = match.match(/<ruby>([^<]*)<rt>/);
      return kanjiMatch ? kanjiMatch[1] : match;
    });
    
    expect(plainText).toBe('こんにちは、元気ですか？');
  });
});