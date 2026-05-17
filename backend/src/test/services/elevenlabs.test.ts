import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Hoisted mocks
const mockStripFurigana = vi.hoisted(() => vi.fn());
const mockToHiraganaForTTS = vi.hoisted(() => vi.fn());
const mockAddFurigana = vi.hoisted(() => vi.fn());
const mockAddFuriganaSync = vi.hoisted(() => vi.fn());

vi.mock('../../config/index.js', () => ({
  appConfig: {
    apiKeys: {
      elevenlabs: 'test-el-key',
    },
  },
}));

vi.mock('../../utils/text.js', () => ({
  stripFurigana: mockStripFurigana,
  toHiraganaForTTS: mockToHiraganaForTTS,
}));

vi.mock('../elevenlabs.js', () => ({
  addFurigana: mockAddFurigana,
  addFuriganaSync: mockAddFuriganaSync,
}));

// Import after mocks
import { generateSpeech, addFurigana, addFuriganaSync } from '../../services/elevenlabs/index.js';

describe('elevenlabs service', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStripFurigana.mockImplementation((text: string) => text);
    mockToHiraganaForTTS.mockImplementation((text: string) => text);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllGlobals();
  });

  describe('generateSpeech()', () => {
    it('should call ElevenLabs API with correct voice ID for Japanese female normal', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      const result = await generateSpeech({
        text: 'こんにちは',
        language: 'japanese',
        gender: 'female',
        voiceStyle: 'normal',
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/XB0fDUnXU5powFXDhCwa',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'xi-api-key': 'test-el-key',
          }),
        })
      );
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should call ElevenLabs API with correct voice ID for Japanese male anime', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await generateSpeech({
        text: 'テスト',
        language: 'japanese',
        gender: 'male',
        voiceStyle: 'anime',
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/IKne3meq5aSn9XLyUdCD',
        expect.anything()
      );
    });

    it('should strip furigana before sending to API', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));
      mockStripFurigana.mockReturnValue('日本');

      await generateSpeech({
        text: '<ruby>日本<rt>にほん</rt></ruby>',
        language: 'japanese',
        gender: 'female',
        voiceStyle: 'normal',
      });

      expect(mockStripFurigana).toHaveBeenCalledWith('<ruby>日本<rt>にほん</rt></ruby>');
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse((fetchCall[1] as any).body);
      expect(body.text).toBe('日本');
    });

    it('should convert Japanese text to hiragana for TTS', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));
      mockToHiraganaForTTS.mockReturnValue('にほん');

      await generateSpeech({
        text: '日本',
        language: 'japanese',
        gender: 'female',
        voiceStyle: 'normal',
      });

      expect(mockToHiraganaForTTS).toHaveBeenCalledWith('日本');
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse((fetchCall[1] as any).body);
      expect(body.text).toBe('にほん');
    });

    it('should convert text to hiragana when language is japanese', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await generateSpeech({
        text: 'Hello world',
        language: 'japanese',
        gender: 'male',
        voiceStyle: 'normal',
      });

      expect(mockToHiraganaForTTS).toHaveBeenCalledWith('Hello world');
    });

    it('should use default voiceStyle as normal when not provided', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await generateSpeech({
        text: 'テスト',
        language: 'japanese',
        gender: 'female',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('XB0fDUnXU5powFXDhCwa'),
        expect.anything()
      );
    });

    it('should return Buffer from API response', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(testData.buffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      const result = await generateSpeech({
        text: 'テスト',
        language: 'japanese',
        gender: 'male',
        voiceStyle: 'normal',
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(5);
    });

    it('should throw error when API returns non-ok status', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        arrayBuffer: vi.fn(),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await expect(
        generateSpeech({
          text: 'テスト',
          language: 'japanese',
          gender: 'male',
          voiceStyle: 'normal',
        })
      ).rejects.toThrow('ElevenLabs API error: 429');
    });

    it('should use eleven_multilingual_v2 model', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await generateSpeech({
        text: 'テスト',
        language: 'japanese',
        gender: 'male',
        voiceStyle: 'normal',
      });

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse((fetchCall[1] as any).body);
      expect(body.model_id).toBe('eleven_multilingual_v2');
    });

    it('should use correct voice settings in request body', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

      await generateSpeech({
        text: 'テスト',
        language: 'japanese',
        gender: 'male',
        voiceStyle: 'normal',
      });

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse((fetchCall[1] as any).body);
      expect(body.voice_settings).toEqual({
        stability: 0.5,
        similarity_boost: 0.75,
      });
    });
  });

  describe('re-exports', () => {
    it('should export addFurigana function', () => {
      expect(typeof addFurigana).toBe('function');
    });

    it('should export addFuriganaSync function', () => {
      expect(typeof addFuriganaSync).toBe('function');
    });
  });
});
