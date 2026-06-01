import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateChatResponse, type ChatMessage } from '../../services/chat.js';

// Track mock calls manually since TypeScript doesn't know about vi.fn() on the mock
const mockCreate = vi.fn();

// Mock OpenAI as a proper constructor
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: (...args: any[]) => mockCreate(...args),
        },
      };
    },
  };
});

// Mock addFurigana and generateRomaji
vi.mock('../../services/elevenlabs.js', () => ({
  addFurigana: vi.fn((text: string) => Promise.resolve(`<ruby>${text}<rt>furigana</rt></ruby>`)),
}));

vi.mock('../../services/romaji.js', () => ({
  generateRomaji: vi.fn((text: string) => Promise.resolve(`romaji-${text}`)),
}));

import { addFurigana } from '../../services/elevenlabs.js';
import { generateRomaji } from '../../services/romaji.js';

const mockAddFurigana = vi.mocked(addFurigana);
const mockGenerateRomaji = vi.mocked(generateRomaji);

describe('chat service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateChatResponse', () => {
    it('should throw error when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
      
      await expect(generateChatResponse(messages)).rejects.toThrow('OPENAI_API_KEY not set');
    });

    it('should generate chat response with all fields', async () => {
      const aiResponse = '<ruby>今晩<rt>こんばん</rt></ruby>、<ruby>何<rt>なに</rt></ruby>をしますか？';
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: aiResponse,
            },
          },
        ],
      } as any);

      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
      const result = await generateChatResponse(messages);

      expect(result.text).toBe('今晩、何をしますか？');
      expect(result.textWithFurigana).toContain('ruby');
      expect(result.romaji).toContain('romaji-');
      expect(mockCreate).toHaveBeenCalledOnce();
    });

    it('should handle AI response with Japanese parentheses furigana', async () => {
      const aiResponse = '漢字（かんじ）を勉強（べんきょう）します';
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: aiResponse,
            },
          },
        ],
      } as any);

      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
      const result = await generateChatResponse(messages);

      // Should strip parentheses furigana from plain text
      expect(result.text).toBe('漢字を勉強します');
      expect(result.text).not.toContain('（');
    });

    it('should extract translation from AI response', async () => {
      const aiResponse = 'こんにちは\nTRANSLATION: Hello there';
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: aiResponse,
            },
          },
        ],
      } as any);

      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
      const result = await generateChatResponse(messages);

      expect(result.text).toBe('こんにちは');
      expect(result.translation).toBe('Hello there');
    });

    it('should use lesson context in system prompt when provided', async () => {
      const aiResponse = 'はい、分かりました';
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: aiResponse,
            },
          },
        ],
      } as any);

      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
      const lessonContext = 'Today we are learning about food vocabulary.';
      await generateChatResponse(messages, lessonContext);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('Today we are learning about food vocabulary.');
      expect(callArgs.messages[0].content).toContain('Japanese language practice partner');
    });

    it('should skip furigana generation for text without kanji', async () => {
      const aiResponse = 'こんにちは、げんきですか？'; // No kanji - using hiragana only
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: aiResponse,
            },
          },
        ],
      } as any);

      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
      const result = await generateChatResponse(messages);

      expect(result.text).toBe('こんにちは、げんきですか？');
      // Should not call addFurigana since no kanji present
      expect(mockAddFurigana).not.toHaveBeenCalled();
    });

    it('should use default message when AI returns empty content', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      } as any);

      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
      const result = await generateChatResponse(messages);

      expect(result.text).toBe('すみません、もう一度言ってください。');
    });

    it('should pass correct model and parameters to OpenAI', async () => {
      const aiResponse = 'テスト';
      
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: aiResponse,
            },
          },
        ],
      } as any);

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ];
      await generateChatResponse(messages);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('gpt-4o-mini');
      expect(callArgs.temperature).toBe(0.7);
      expect(callArgs.max_tokens).toBe(500);
      expect(callArgs.messages).toHaveLength(3); // system + 2 user messages
      expect(callArgs.messages[1]).toEqual({ role: 'user', content: 'Hello' });
      expect(callArgs.messages[2]).toEqual({ role: 'assistant', content: 'Hi there' });
    });
  });

  describe('text extraction logic', () => {
    it('should extract plain text from AI response with ruby tags', () => {
      const aiResponseWithRuby = '<ruby>今晩<rt>こんばん</rt></ruby>、<ruby>何<rt>なに</rt></ruby>をしますか？';
      
      const plainText = aiResponseWithRuby.replace(/<ruby>[^<]*<rt>[^<]*<\/rt><\/ruby>/g, (match) => {
        const kanjiMatch = match.match(/<ruby>([^<]*)<rt>/);
        return kanjiMatch ? kanjiMatch[1] : match;
      });
      
      expect(plainText).toBe('今晩、何をしますか？');
      expect(plainText).not.toContain('<ruby>');
      expect(plainText).not.toContain('<rt>');
    });

    it('should handle text without ruby tags', () => {
      const textWithoutRuby = 'こんにちは、元気ですか？';
      
      const plainText = textWithoutRuby.replace(/<ruby>[^<]*<rt>[^<]*<\/rt><\/ruby>/g, (match) => {
        const kanjiMatch = match.match(/<ruby>([^<]*)<rt>/);
        return kanjiMatch ? kanjiMatch[1] : match;
      });
      
      expect(plainText).toBe('こんにちは、元気ですか？');
    });
  });
});