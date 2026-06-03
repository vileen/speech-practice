import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../services/elevenlabs/index.js', () => ({
  generateSpeech: vi.fn(),
  addFurigana: vi.fn(),
}));

vi.mock('../../services/whisper.js', () => ({
  transcribeAudioDirect: vi.fn(),
}));

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
    audio: {
      storagePath: '/tmp/test-audio',
    },
  },
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

// Now import after mocks are set up
import repeatRoutes from '../../routes/repeat.js';
import { generateSpeech, addFurigana } from '../../services/elevenlabs/index.js';
import { transcribeAudioDirect } from '../../services/whisper.js';
import { readFile } from 'fs/promises';

const mockGenerateSpeech = generateSpeech as ReturnType<typeof vi.fn>;
const mockAddFurigana = addFurigana as ReturnType<typeof vi.fn>;
const mockTranscribeAudioDirect = transcribeAudioDirect as ReturnType<typeof vi.fn>;
const mockReadFile = readFile as ReturnType<typeof vi.fn>;

describe('Repeat Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', repeatRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/')
        .send({ target_text: 'Hello' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 when no target text provided', async () => {
      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'No target text provided' });
    });

    it('should return TTS audio when no audio file is provided', async () => {
      const mockAudioBuffer = Buffer.from('fake-mp3-data');
      const mockFuriganaText = 'こんにちは[こんにちは]';

      mockGenerateSpeech.mockResolvedValue(mockAudioBuffer);
      mockAddFurigana.mockResolvedValue(mockFuriganaText);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({
          target_text: 'こんにちは',
          language: 'japanese',
          gender: 'female',
          voiceStyle: 'normal',
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('audio/mpeg');
      expect(response.headers['x-target-text']).toBe(encodeURIComponent('こんにちは'));
      expect(response.headers['x-text-with-furigana']).toBe(encodeURIComponent(mockFuriganaText));
      expect(response.body).toEqual(mockAudioBuffer);
      expect(mockGenerateSpeech).toHaveBeenCalledWith({
        text: 'こんにちは',
        language: 'japanese',
        gender: 'female',
        voiceStyle: 'normal',
      });
      expect(mockAddFurigana).toHaveBeenCalledWith('こんにちは');
    });

    it('should score 100 when transcription matches target perfectly', async () => {
      const mockAudioBuffer = Buffer.from('fake-audio-data');
      const mockFuriganaText = 'こんにちは[こんにちは]';

      mockReadFile.mockResolvedValue(mockAudioBuffer);
      mockTranscribeAudioDirect.mockResolvedValue('こんにちは');
      mockAddFurigana.mockResolvedValue(mockFuriganaText);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .field('target_text', 'こんにちは')
        .field('language', 'japanese')
        .attach('audio', Buffer.from('fake-audio'), 'test.mp3')
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.feedback).toBe('Perfect! 🎉');
      expect(response.body.errors).toEqual([]);
      expect(response.body.transcription).toBe('こんにちは');
      expect(mockTranscribeAudioDirect).toHaveBeenCalledWith(mockAudioBuffer, 'ja');
      expect(mockAddFurigana).toHaveBeenCalledWith('こんにちは');
    });

    it('should score imperfect match and provide feedback', async () => {
      const mockAudioBuffer = Buffer.from('fake-audio-data');
      const mockFuriganaText = 'さようなら[さようなら]';

      mockReadFile.mockResolvedValue(mockAudioBuffer);
      mockTranscribeAudioDirect.mockResolvedValue('さよなら');
      mockAddFurigana.mockResolvedValue(mockFuriganaText);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .field('target_text', 'さようなら')
        .field('language', 'japanese')
        .attach('audio', Buffer.from('fake-audio'), 'test.mp3')
        .expect(200);

      expect(response.body.score).toBeLessThan(100);
      expect(response.body.score).toBeGreaterThan(0);
      expect(response.body.feedback).toBeDefined();
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.transcription).toBe('さよなら');
    });

    it('should handle no audio detected', async () => {
      const mockAudioBuffer = Buffer.from('fake-audio-data');
      const mockFuriganaText = 'こんにちは[こんにちは]';

      mockReadFile.mockResolvedValue(mockAudioBuffer);
      mockTranscribeAudioDirect.mockResolvedValue('');
      mockAddFurigana.mockResolvedValue(mockFuriganaText);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .field('target_text', 'こんにちは')
        .field('language', 'japanese')
        .attach('audio', Buffer.from('fake-audio'), 'test.mp3')
        .expect(200);

      expect(response.body.score).toBe(0);
      expect(response.body.feedback).toBe('Could not hear you. Try again! 🎤');
      expect(response.body.errors).toEqual(['No audio detected']);
    });

    it('should handle Italian language', async () => {
      const mockAudioBuffer = Buffer.from('fake-audio-data');
      const mockFuriganaText = 'Ciao';

      mockReadFile.mockResolvedValue(mockAudioBuffer);
      mockTranscribeAudioDirect.mockResolvedValue('Ciao');
      mockAddFurigana.mockResolvedValue(mockFuriganaText);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .field('target_text', 'Ciao')
        .field('language', 'italian')
        .attach('audio', Buffer.from('fake-audio'), 'test.mp3')
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(mockTranscribeAudioDirect).toHaveBeenCalledWith(mockAudioBuffer, 'it');
    });

    it('should handle server errors gracefully', async () => {
      mockGenerateSpeech.mockRejectedValue(new Error('TTS service failed'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({
          target_text: 'Hello',
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to process pronunciation check' });
    });
  });
});
