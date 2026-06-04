import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { EventEmitter } from 'events';

// Mock dependencies - must be before imports
vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
  },
}));

vi.mock('child_process', () => ({
  execSync: vi.fn(),
  spawn: vi.fn(),
}));

vi.mock('crypto', async () => {
  const actual = await vi.importActual('crypto');
  return {
    ...(actual as any),
    default: {
      ...(actual as any),
      randomUUID: vi.fn(() => 'test-uuid-123'),
    },
    randomUUID: vi.fn(() => 'test-uuid-123'),
  };
});

vi.mock('multer', () => {
  const mockMulter = vi.fn(() => ({
    single: vi.fn((fieldname: string) => {
      return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
        if (req.headers['x-test-file'] === 'yes') {
          (req as any).file = {
            fieldname,
            originalname: 'test.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            buffer: Buffer.from('fake-pdf-data'),
            size: 1024,
            path: 'uploads/pdfs/test-file-123',
          };
        }
        // Support injected body fields via header for testing
        if (req.headers['x-test-body']) {
          try {
            (req as any).body = JSON.parse(req.headers['x-test-body'] as string);
          } catch {}
        }
        next();
      };
    }),
    array: vi.fn((fieldname: string, _maxCount?: number) => {
      return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
        if (req.headers['x-test-file'] === 'yes') {
          (req as any).files = [
            {
              fieldname,
              originalname: 'test1.pdf',
              encoding: '7bit',
              mimetype: 'application/pdf',
              buffer: Buffer.from('fake-pdf-data-1'),
              size: 1024,
              path: 'uploads/pdfs/test-file-1',
            },
            {
              fieldname,
              originalname: 'test2.pdf',
              encoding: '7bit',
              mimetype: 'application/pdf',
              buffer: Buffer.from('fake-pdf-data-2'),
              size: 2048,
              path: 'uploads/pdfs/test-file-2',
            },
          ];
        }
        if (req.headers['x-test-body']) {
          try {
            (req as any).body = JSON.parse(req.headers['x-test-body'] as string);
          } catch {}
        }
        next();
      };
    }),
  })) as any;
  mockMulter.memoryStorage = vi.fn();
  return {
    __esModule: true,
    default: mockMulter,
  };
});

// Now import after mocks are set up
import pdfRoutes from '../../routes/pdf.js';
import { execSync, spawn } from 'child_process';
import fs from 'fs';

const mockExecSync = execSync as ReturnType<typeof vi.fn>;
const mockSpawn = spawn as ReturnType<typeof vi.fn>;

// Spy on fs methods
let mockMkdirSync: ReturnType<typeof vi.fn>;
let mockReaddirSync: ReturnType<typeof vi.fn>;
let mockReadFileSync: ReturnType<typeof vi.fn>;
let mockUnlinkSync: ReturnType<typeof vi.fn>;

function createMockChildProcess(exitCode: number, stdoutData: string, stderrData: string) {
  const child = new EventEmitter();
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();

  (child as any).stdout = stdout;
  (child as any).stderr = stderr;

  // Override 'on' for the child so that when the close listener is attached,
  // we immediately emit the events and invoke the listener synchronously.
  // This avoids any event loop/timing issues in the test environment.
  const originalChildOn = child.on.bind(child);
  let closeListenerAttached = false;
  child.on = function(event: string, listener: (...args: any[]) => void) {
    const result = originalChildOn(event, listener);
    if (event === 'close' && !closeListenerAttached) {
      closeListenerAttached = true;
      if (stdoutData) stdout.emit('data', stdoutData);
      if (stderrData) stderr.emit('data', stderrData);
      listener(exitCode);
    }
    return result;
  };

  return child;
}

describe('PDF Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/', pdfRoutes);
    vi.clearAllMocks();

    // Set up fs spies fresh for each test
    mockMkdirSync = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined as any);
    mockReaddirSync = vi.spyOn(fs, 'readdirSync').mockImplementation(() => [] as any);
    mockReadFileSync = vi.spyOn(fs, 'readFileSync').mockImplementation(() => '' as any);
    mockUnlinkSync = vi.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockMkdirSync.mockRestore();
    mockReaddirSync.mockRestore();
    mockReadFileSync.mockRestore();
    mockUnlinkSync.mockRestore();
  });

  describe('GET /status', () => {
    it('should return ready when java and opendataloader are available', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('java -version')) {
          return 'openjdk version "17.0.5"';
        }
        if (cmd.includes('opendataloader_pdf')) {
          return '';
        }
        return '';
      });

      const response = await request(app)
        .get('/status')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        available: true,
        java: true,
        opendataloader: true,
        message: 'Ready',
      });
    });

    it('should return not available when java is missing', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('java -version')) {
          throw new Error('java: command not found');
        }
        if (cmd.includes('opendataloader_pdf')) {
          throw new Error('Module not found');
        }
        return '';
      });

      const response = await request(app)
        .get('/status')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        available: false,
        java: false,
        opendataloader: false,
        message: 'Java 11+ is required. Install from https://adoptium.net/',
      });
    });

    it('should return not available when opendataloader is missing', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('java -version')) {
          return 'openjdk version "17.0.5"';
        }
        if (cmd.includes('opendataloader_pdf')) {
          throw new Error('Module not found');
        }
        return '';
      });

      const response = await request(app)
        .get('/status')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        available: false,
        java: true,
        opendataloader: false,
        message: 'OpenDataLoader not installed. Run: pip install opendataloader-pdf',
      });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/status')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockExecSync).not.toHaveBeenCalled();
    });
  });

  describe('POST /convert', () => {
    it('should convert a single PDF successfully', async () => {
      mockSpawn.mockReturnValue(
        createMockChildProcess(0, 'Conversion successful', '')
      );
      mockReaddirSync.mockReturnValue(['output.md']);
      mockReadFileSync.mockReturnValue('# Converted PDF Content');

      const response = await request(app)
        .post('/convert')
        .set('x-password', 'test-password')
        .set('x-test-file', 'yes')
        .field('format', 'markdown')
        .field('hybrid', 'false')
        .field('ocr', 'false')
        .field('lang', 'eng')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        filename: 'output.md',
        format: 'markdown',
        content: '# Converted PDF Content',
        download_url: '/api/pdf/download/test-uuid-123/output.md',
      });

      expect(mockMkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('uploads/converted/test-uuid-123'),
        { recursive: true }
      );
      expect(mockUnlinkSync).toHaveBeenCalledWith('uploads/pdfs/test-file-123');
      expect(mockSpawn).toHaveBeenCalledWith(
        'python',
        expect.arrayContaining([
          expect.stringContaining('convert_pdf.py'),
          'uploads/pdfs/test-file-123',
          expect.stringContaining('test-uuid-123'),
          '--format',
          'markdown',
          '--lang',
          'eng',
        ])
      );
    });

    it('should return 400 when no PDF file is provided', async () => {
      const response = await request(app)
        .post('/convert')
        .set('x-password', 'test-password')
        .expect(400);

      expect(response.body).toEqual({ error: 'No PDF file provided' });
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('should return 500 when conversion fails', async () => {
      mockSpawn.mockReturnValue(
        createMockChildProcess(1, '', 'Python error: missing dependency')
      );

      const response = await request(app)
        .post('/convert')
        .set('x-password', 'test-password')
        .set('x-test-file', 'yes')
        .field('format', 'markdown')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Python error: missing dependency',
      });
      expect(mockUnlinkSync).toHaveBeenCalledWith('uploads/pdfs/test-file-123');
    });

    it('should return 500 when output file is not found', async () => {
      mockSpawn.mockReturnValue(
        createMockChildProcess(0, '', '')
      );
      mockReaddirSync.mockReturnValue([]);

      const response = await request(app)
        .post('/convert')
        .set('x-password', 'test-password')
        .set('x-test-file', 'yes')
        .field('format', 'markdown')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Output file not found',
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      mockSpawn.mockImplementation(() => {
        throw new Error('Spawn failed');
      });

      const response = await request(app)
        .post('/convert')
        .set('x-password', 'test-password')
        .set('x-test-file', 'yes')
        .field('format', 'markdown')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Spawn failed',
      });
    });

    it('should support hybrid and OCR options', async () => {
      mockSpawn.mockReturnValue(
        createMockChildProcess(0, 'Conversion successful', '')
      );
      mockReaddirSync.mockReturnValue(['output.json']);
      mockReadFileSync.mockReturnValue('{"text": "test"}');

      const response = await request(app)
        .post('/convert')
        .set('x-password', 'test-password')
        .set('x-test-file', 'yes')
        .set('x-test-body', JSON.stringify({ format: 'json', hybrid: 'true', ocr: 'true', lang: 'jpn' }))
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        filename: 'output.json',
        format: 'json',
        content: '{"text": "test"}',
        download_url: '/api/pdf/download/test-uuid-123/output.json',
      });

      expect(mockSpawn).toHaveBeenCalledWith(
        'python',
        expect.arrayContaining([
          '--hybrid',
          '--ocr',
          '--lang',
          'jpn',
        ])
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/convert')
        .set('x-test-file', 'yes')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockSpawn).not.toHaveBeenCalled();
    });
  });

  describe('POST /batch', () => {
    it('should batch convert multiple PDFs successfully', async () => {
      mockSpawn.mockReturnValue(
        createMockChildProcess(0, 'Batch conversion successful', '')
      );
      mockReaddirSync.mockReturnValue(['output1.md', 'output2.md']);

      const response = await request(app)
        .post('/batch')
        .set('x-password', 'test-password')
        .set('x-test-file', 'yes')
        .field('format', 'markdown')
        .field('hybrid', 'false')
        .field('ocr', 'false')
        .field('lang', 'eng')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        total: 2,
        converted: 2,
        download_url: '/api/pdf/download/test-uuid-123',
      });

      expect(mockMkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('uploads/converted/test-uuid-123'),
        { recursive: true }
      );
      expect(mockUnlinkSync).toHaveBeenCalledTimes(2);
      expect(mockSpawn).toHaveBeenCalledWith(
        'python',
        expect.arrayContaining([
          expect.stringContaining('convert_pdf.py'),
          'uploads/pdfs/test-file-1',
          'uploads/pdfs/test-file-2',
          expect.stringContaining('test-uuid-123'),
          '--format',
          'markdown',
          '--lang',
          'eng',
        ])
      );
    });

    it('should return 400 when no PDF files are provided', async () => {
      const response = await request(app)
        .post('/batch')
        .set('x-password', 'test-password')
        .expect(400);

      expect(response.body).toEqual({ error: 'No PDF files provided' });
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('should return 500 when batch conversion fails', async () => {
      mockSpawn.mockReturnValue(
        createMockChildProcess(1, '', 'Batch processing error')
      );

      const response = await request(app)
        .post('/batch')
        .set('x-password', 'test-password')
        .set('x-test-file', 'yes')
        .field('format', 'markdown')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Batch processing error',
      });
      expect(mockUnlinkSync).toHaveBeenCalledTimes(2);
    });

    it('should handle unexpected batch errors gracefully', async () => {
      mockSpawn.mockImplementation(() => {
        throw new Error('Batch spawn failed');
      });

      const response = await request(app)
        .post('/batch')
        .set('x-password', 'test-password')
        .set('x-test-file', 'yes')
        .field('format', 'markdown')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Batch spawn failed',
      });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/batch')
        .set('x-test-file', 'yes')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockSpawn).not.toHaveBeenCalled();
    });
  });
});
