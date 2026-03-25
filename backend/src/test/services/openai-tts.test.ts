import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock function using vi.hoisted to ensure it's available during module loading
const mockCreate = vi.hoisted(() => vi.fn());

// Mock the OpenAI module before importing the service
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      audio = {
        speech: {
          create: mockCreate,
        },
      };

      constructor({ apiKey }: { apiKey: string }) {
        // Constructor logic if needed
      }
    },
  };
});

// Import after mocking
import { generateSpeech, getAvailableVoices } from '../../services/openai-tts.js';

describe('openai-tts service', () => {
  const mockApiKey = 'test-api-key-12345';

  beforeEach(() => {
    vi.clearAllMocks();
    // Set the environment variable for tests
    process.env.OPENAI_API_KEY = mockApiKey;
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('generateSpeech()', () => {
    it('should throw error when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;

      await expect(
        generateSpeech({ text: 'Hello world' })
      ).rejects.toThrow('OPENAI_API_KEY not set');
    });

    it('should call OpenAI API with correct parameters', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      mockCreate.mockResolvedValue(mockResponse);

      await generateSpeech({
        text: 'こんにちは',
        voice: 'nova',
        speed: 1.0,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'tts-1-hd',
        voice: 'nova',
        input: 'こんにちは',
        speed: 0.8,
      });
    });

    it('should use default voice (nova) when not specified', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      mockCreate.mockResolvedValue(mockResponse);

      await generateSpeech({ text: 'Hello' });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          voice: 'nova',
        })
      );
    });

    it('should accept different voices', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      mockCreate.mockResolvedValue(mockResponse);

      const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;

      for (const voice of voices) {
        await generateSpeech({ text: 'Test', voice });

        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            voice,
          })
        );
      }
    });

    it('should return Buffer from API response', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const mockArrayBuffer = testData.buffer;
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateSpeech({ text: 'Test' });

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(5);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API rate limit exceeded');
      mockCreate.mockRejectedValue(error);

      await expect(
        generateSpeech({ text: 'Hello' })
      ).rejects.toThrow('API rate limit exceeded');
    });

    it('should use speed 0.8 regardless of input speed parameter', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      mockCreate.mockResolvedValue(mockResponse);

      await generateSpeech({ text: 'Hello', speed: 1.5 });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          speed: 0.8,
        })
      );
    });

    it('should call OpenAI API with tts-1-hd model', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      };
      mockCreate.mockResolvedValue(mockResponse);

      await generateSpeech({ text: 'Hello' });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'tts-1-hd',
        })
      );
    });
  });

  describe('getAvailableVoices()', () => {
    it('should return array of 6 voices', () => {
      const voices = getAvailableVoices();
      expect(voices).toHaveLength(6);
    });

    it('should return voices with correct structure', () => {
      const voices = getAvailableVoices();

      voices.forEach((voice) => {
        expect(voice).toHaveProperty('id');
        expect(voice).toHaveProperty('name');
        expect(voice).toHaveProperty('description');
        expect(typeof voice.id).toBe('string');
        expect(typeof voice.name).toBe('string');
        expect(typeof voice.description).toBe('string');
      });
    });

    it('should include alloy voice', () => {
      const voices = getAvailableVoices();
      const alloy = voices.find((v) => v.id === 'alloy');
      expect(alloy).toBeDefined();
      expect(alloy?.name).toBe('Alloy');
      expect(alloy?.description).toBe('Neutral');
    });

    it('should include echo voice', () => {
      const voices = getAvailableVoices();
      const echo = voices.find((v) => v.id === 'echo');
      expect(echo).toBeDefined();
      expect(echo?.name).toBe('Echo');
      expect(echo?.description).toBe('Male');
    });

    it('should include fable voice', () => {
      const voices = getAvailableVoices();
      const fable = voices.find((v) => v.id === 'fable');
      expect(fable).toBeDefined();
      expect(fable?.name).toBe('Fable');
      expect(fable?.description).toBe('Male (British)');
    });

    it('should include onyx voice', () => {
      const voices = getAvailableVoices();
      const onyx = voices.find((v) => v.id === 'onyx');
      expect(onyx).toBeDefined();
      expect(onyx?.name).toBe('Onyx');
      expect(onyx?.description).toBe('Male (Deep)');
    });

    it('should include nova voice', () => {
      const voices = getAvailableVoices();
      const nova = voices.find((v) => v.id === 'nova');
      expect(nova).toBeDefined();
      expect(nova?.name).toBe('Nova');
      expect(nova?.description).toBe('Female');
    });

    it('should include shimmer voice', () => {
      const voices = getAvailableVoices();
      const shimmer = voices.find((v) => v.id === 'shimmer');
      expect(shimmer).toBeDefined();
      expect(shimmer?.name).toBe('Shimmer');
      expect(shimmer?.description).toBe('Female (Young)');
    });

    it('should return all expected voices in correct order', () => {
      const voices = getAvailableVoices();
      const expectedIds = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      const actualIds = voices.map((v) => v.id);

      expect(actualIds).toEqual(expectedIds);
    });
  });
});
