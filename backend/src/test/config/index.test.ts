import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Config Module', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear module cache to reimport with fresh env
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  describe('appConfig', () => {
    it('should use default PORT when env var is not set', async () => {
      process.env.PORT = '';
      
      const { appConfig } = await import('../../config/index.js');
      
      expect(appConfig.port).toBe(3001);
    });

    it('should use environment variables when set', async () => {
      process.env.PORT = '5000';
      process.env.ACCESS_PASSWORD = 'secure123';
      process.env.DATABASE_URL = 'postgresql://test:5432/testdb';
      process.env.OPENAI_API_KEY = 'sk-test-key';
      process.env.ELEVENLABS_API_KEY = 'el-test-key';
      
      const { appConfig } = await import('../../config/index.js');
      
      expect(appConfig.port).toBe(5000);
      expect(appConfig.password).toBe('secure123');
      expect(appConfig.database.url).toBe('postgresql://test:5432/testdb');
      expect(appConfig.apiKeys.openai).toBe('sk-test-key');
      expect(appConfig.apiKeys.elevenlabs).toBe('el-test-key');
    });

    it('should parse PORT as integer', async () => {
      process.env.PORT = '8080';
      
      const { appConfig } = await import('../../config/index.js');
      
      expect(typeof appConfig.port).toBe('number');
      expect(appConfig.port).toBe(8080);
    });

    it('should have CORS origins configured', async () => {
      const { appConfig } = await import('../../config/index.js');
      
      expect(appConfig.cors.origins).toBeInstanceOf(Array);
      expect(appConfig.cors.origins.length).toBeGreaterThan(0);
      expect(appConfig.cors.origins).toContain('http://localhost:5173');
      expect(appConfig.cors.origins).toContain('http://localhost:3000');
    });

    it('should have audio storage path configured', async () => {
      const { appConfig } = await import('../../config/index.js');
      
      expect(appConfig.audio.storagePath).toBeDefined();
      expect(typeof appConfig.audio.storagePath).toBe('string');
    });
  });

  describe('validateConfig', () => {
    it('should not throw when config is valid', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.ELEVENLABS_API_KEY = 'test-key';
      process.env.DATABASE_URL = 'test-url';
      
      const { validateConfig } = await import('../../config/index.js');
      
      expect(() => validateConfig()).not.toThrow();
    });
  });
});
