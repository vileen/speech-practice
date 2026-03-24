import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transcribeAudio, transcribeAudioDirect } from '../../services/whisper.js';

// Mock OpenAI with factory function (hoisted, so no external refs)
vi.mock('openai', () => {
  const mockFilesCreate = vi.fn();
  const mockTranscriptionsCreate = vi.fn();
  
  return {
    default: class MockOpenAI {
      files = { create: mockFilesCreate };
      audio = { 
        transcriptions: { 
          create: mockTranscriptionsCreate 
        } 
      };
      // Expose mocks for test access
      static mockFilesCreate = mockFilesCreate;
      static mockTranscriptionsCreate = mockTranscriptionsCreate;
    }
  };
});

// Get mock references after import
import OpenAI from 'openai';
const MockedOpenAI = OpenAI as unknown as typeof OpenAI & {
  mockFilesCreate: ReturnType<typeof vi.fn>;
  mockTranscriptionsCreate: ReturnType<typeof vi.fn>;
};

describe('whisper service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  describe('transcribeAudio', () => {
    it('should throw error when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;
      
      await expect(transcribeAudio({ audioFilePath: 'test.mp3' }))
        .rejects.toThrow('OPENAI_API_KEY not set');
    });

    it('should transcribe audio successfully', async () => {
      const mockFileResponse = { id: 'file-123' };
      const mockTranscriptionResponse = { text: 'こんにちは' };
      
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['audio data'])),
      } as any);
      
      MockedOpenAI.mockFilesCreate.mockResolvedValue(mockFileResponse);
      MockedOpenAI.mockTranscriptionsCreate.mockResolvedValue(mockTranscriptionResponse);
      
      const result = await transcribeAudio({ audioFilePath: 'https://example.com/audio.mp3' });
      
      expect(result).toBe('こんにちは');
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/audio.mp3');
      expect(MockedOpenAI.mockFilesCreate).toHaveBeenCalled();
      expect(MockedOpenAI.mockTranscriptionsCreate).toHaveBeenCalledWith({
        file: mockFileResponse,
        model: 'whisper-1',
        language: undefined,
      });
    });

    it('should pass language parameter when provided', async () => {
      const mockFileResponse = { id: 'file-123' };
      const mockTranscriptionResponse = { text: 'Hello world' };
      
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['audio data'])),
      } as any);
      
      MockedOpenAI.mockFilesCreate.mockResolvedValue(mockFileResponse);
      MockedOpenAI.mockTranscriptionsCreate.mockResolvedValue(mockTranscriptionResponse);
      
      await transcribeAudio({ audioFilePath: 'test.mp3', language: 'en' });
      
      expect(MockedOpenAI.mockTranscriptionsCreate).toHaveBeenCalledWith({
        file: mockFileResponse,
        model: 'whisper-1',
        language: 'en',
      });
    });
  });

  describe('transcribeAudioDirect', () => {
    it('should throw error when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;
      
      await expect(transcribeAudioDirect(Buffer.from('audio')))
        .rejects.toThrow('OPENAI_API_KEY not set');
    });

    it('should transcribe audio buffer successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ text: 'さようなら' }),
      };
      
      global.fetch = vi.fn().mockResolvedValue(mockResponse as any);
      
      const audioBuffer = Buffer.from('fake audio data');
      const result = await transcribeAudioDirect(audioBuffer);
      
      expect(result).toBe('さようなら');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/audio/transcriptions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should include language parameter when provided', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ text: 'Goodbye' }),
      };
      
      global.fetch = vi.fn().mockResolvedValue(mockResponse as any);
      
      const audioBuffer = Buffer.from('fake audio data');
      await transcribeAudioDirect(audioBuffer, 'en');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/audio/transcriptions',
        expect.any(Object)
      );
    });

    it('should throw error on API failure', async () => {
      const mockResponse = {
        ok: false,
        text: () => Promise.resolve('Invalid audio format'),
      };
      
      global.fetch = vi.fn().mockResolvedValue(mockResponse as any);
      
      const audioBuffer = Buffer.from('fake audio data');
      
      await expect(transcribeAudioDirect(audioBuffer))
        .rejects.toThrow('Whisper API error: Invalid audio format');
    });

    it('should send correct FormData structure', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ text: 'テスト' }),
      };
      
      global.fetch = vi.fn().mockResolvedValue(mockResponse as any);
      
      const audioBuffer = Buffer.from('fake audio data');
      await transcribeAudioDirect(audioBuffer, 'ja');
      
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe('https://api.openai.com/v1/audio/transcriptions');
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers.Authorization).toBe('Bearer test-api-key');
      expect(fetchCall[1].body).toBeInstanceOf(FormData);
    });
  });
});
