import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../services/elevenlabs/index.js', () => ({
  generateSpeech: vi.fn(),
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
  writeFile: vi.fn(),
}));

// Now import after mocks are set up
import ttsRoutes from '../../routes/tts.js';
import { generateSpeech } from '../../services/elevenlabs/index.js';
import { writeFile } from 'fs/promises';

const mockGenerateSpeech = generateSpeech as ReturnType<typeof vi.fn>;
const mockWriteFile = writeFile as ReturnType<typeof vi.fn>;

describe('TTS Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', ttsRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should generate TTS audio when authorized', async () => {
      const mockAudioBuffer = Buffer.from('fake-mp3-data');
      mockGenerateSpeech.mockResolvedValue(mockAudioBuffer);
      mockWriteFile.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({
          text: 'Hello world',
          language: 'english',
          gender: 'female',
          voiceStyle: 'normal',
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('audio/mpeg');
      expect(response.body).toEqual(mockAudioBuffer);
      expect(mockGenerateSpeech).toHaveBeenCalledWith({
        text: 'Hello world',
        language: 'english',
        gender: 'female',
        voiceStyle: 'normal',
      });
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/')
        .send({
          text: 'Hello world',
          language: 'english',
        })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockGenerateSpeech).not.toHaveBeenCalled();
    });

    it('should handle missing optional parameters', async () => {
      const mockAudioBuffer = Buffer.from('fake-mp3-data');
      mockGenerateSpeech.mockResolvedValue(mockAudioBuffer);
      mockWriteFile.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({
          text: 'Test text',
          language: 'japanese',
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('audio/mpeg');
      expect(mockGenerateSpeech).toHaveBeenCalledWith({
        text: 'Test text',
        language: 'japanese',
        gender: undefined,
        voiceStyle: undefined,
      });
    });

    it('should handle ElevenLabs API errors gracefully', async () => {
      mockGenerateSpeech.mockRejectedValue(new Error('ElevenLabs API error'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({
          text: 'Hello world',
          language: 'english',
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to generate speech' });
    });

    it('should handle file write errors gracefully', async () => {
      const mockAudioBuffer = Buffer.from('fake-mp3-data');
      mockGenerateSpeech.mockResolvedValue(mockAudioBuffer);
      mockWriteFile.mockRejectedValue(new Error('Disk full'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({
          text: 'Hello world',
          language: 'english',
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to generate speech' });
    });

    it('should use password from body for auth', async () => {
      const mockAudioBuffer = Buffer.from('fake-mp3-data');
      mockGenerateSpeech.mockResolvedValue(mockAudioBuffer);
      mockWriteFile.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/')
        .send({
          text: 'Hello world',
          language: 'english',
          password: 'test-password',
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('audio/mpeg');
    });
  });
});
