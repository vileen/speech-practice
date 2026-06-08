import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock fs/promises before route imports
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue(Buffer.from('fake-audio-data')),
}));

// Mock multer before route imports
vi.mock('multer', () => {
  const diskStorage = () => ({});
  const mockMulter = Object.assign(
    () => ({
      single: () => (req: any, res: any, next: any) => {
        if (req.headers['x-mock-file'] === 'yes') {
          req.file = {
            path: '/tmp/recording_1234567890.mp3',
            filename: 'recording_1234567890.mp3',
          };
        }
        next();
      },
    }),
    { diskStorage }
  );
  return {
    default: mockMulter,
    __esModule: true,
  };
});

vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../services/whisper.js', () => ({
  transcribeAudioDirect: vi.fn(),
}));

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
    audio: {
      storagePath: '/tmp/',
    },
  },
}));

import uploadRoutes from '../../routes/upload.js';
import { pool } from '../../db/pool.js';
import { transcribeAudioDirect } from '../../services/whisper.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;
const mockTranscribe = transcribeAudioDirect as ReturnType<typeof vi.fn>;

describe('Upload Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', uploadRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should upload audio and return recording data with transcription', async () => {
      const mockRecording = {
        id: 1,
        session_id: 'test-session',
        audio_path: '/tmp/recording_1234567890.mp3',
        target_language: 'japanese',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockRecording] });
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      mockTranscribe.mockResolvedValue('こんにちは');

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .set('x-mock-file', 'yes')
        .send({ session_id: 'test-session', target_language: 'japanese' })
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        filename: 'recording_1234567890.mp3',
        path: '/tmp/recording_1234567890.mp3',
        transcription: 'こんにちは',
      });
    });

    it('should upload audio without transcription when whisper fails', async () => {
      const mockRecording = {
        id: 2,
        session_id: 'test-session',
        audio_path: '/tmp/recording_1234567890.mp3',
        target_language: 'japanese',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockRecording] });
      mockTranscribe.mockRejectedValue(new Error('Whisper error'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .set('x-mock-file', 'yes')
        .send({ session_id: 'test-session', target_language: 'japanese' })
        .expect(200);

      expect(response.body).toEqual({
        id: 2,
        filename: 'recording_1234567890.mp3',
        path: '/tmp/recording_1234567890.mp3',
        transcription: null,
      });
    });

    it('should return 400 when no file is provided', async () => {
      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ session_id: 'test-session', target_language: 'japanese' })
        .expect(400);

      expect(response.body).toEqual({ error: 'No audio file provided' });
    });

    it('should use correct language code for italian', async () => {
      const mockRecording = {
        id: 3,
        session_id: 'test-session',
        audio_path: '/tmp/recording_1234567890.mp3',
        target_language: 'italian',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockRecording] });
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      mockTranscribe.mockResolvedValue('ciao');

      await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .set('x-mock-file', 'yes')
        .send({ session_id: 'test-session', target_language: 'italian' })
        .expect(200);

      expect(mockTranscribe).toHaveBeenCalledWith(
        expect.anything(),
        'it'
      );
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .set('x-mock-file', 'yes')
        .send({ session_id: 'test-session', target_language: 'japanese' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to upload recording' });
    });
  });
});
