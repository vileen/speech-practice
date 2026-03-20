import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

// Need to reset module state between tests
// We do this by re-importing the module fresh each time
const resetModule = async () => {
  // Clear the module cache to get fresh state
  vi.resetModules();
  
  // Clear mocks
  vi.clearAllMocks();
};

describe('furigana cache service', () => {
  beforeEach(async () => {
    await resetModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadFuriganaCache', () => {
    it('should load cache from existing file', async () => {
      const mockCache = { '漢字': 'かんじ', '日本': 'にほん' };
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockCache));

      const { loadFuriganaCache, getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      await loadFuriganaCache();
      
      const result = getCachedFurigana('漢字');
      expect(result).toBe('かんじ');
      expect(existsSync).toHaveBeenCalledWith('./data/furigana-cache.json');
      expect(readFile).toHaveBeenCalledWith('./data/furigana-cache.json', 'utf-8');
    });

    it('should handle missing file gracefully', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const { loadFuriganaCache, getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      await loadFuriganaCache();
      
      expect(readFile).not.toHaveBeenCalled();
      // Cache should be empty
      const result = getCachedFurigana('漢字');
      expect(result).toBeUndefined();
    });

    it('should handle parse errors gracefully', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue('invalid json{');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { loadFuriganaCache, getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      await loadFuriganaCache();
      
      expect(consoleSpy).toHaveBeenCalledWith('[Furigana] Error loading cache:', expect.any(Error));
      // Cache should be empty after error
      const result = getCachedFurigana('漢字');
      expect(result).toBeUndefined();
      
      consoleSpy.mockRestore();
    });

    it('should only load once even if called multiple times', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue('{}');

      const { loadFuriganaCache } = await import('../../../services/furigana/cache.js');
      
      await loadFuriganaCache();
      await loadFuriganaCache();
      await loadFuriganaCache();
      
      expect(readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveFuriganaCache', () => {
    it('should save cache to file', async () => {
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const { setCachedFurigana, saveFuriganaCache } = await import('../../../services/furigana/cache.js');
      
      setCachedFurigana('漢字', 'かんじ');
      setCachedFurigana('日本', 'にほん');
      
      await saveFuriganaCache();
      
      expect(writeFile).toHaveBeenCalledWith(
        './data/furigana-cache.json',
        JSON.stringify({ '漢字': 'かんじ', '日本': 'にほん' }, null, 2)
      );
    });

    it('should handle write errors gracefully', async () => {
      vi.mocked(writeFile).mockRejectedValue(new Error('Permission denied'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { setCachedFurigana, saveFuriganaCache } = await import('../../../services/furigana/cache.js');
      
      setCachedFurigana('漢字', 'かんじ');
      
      await saveFuriganaCache();
      
      expect(consoleSpy).toHaveBeenCalledWith('[Furigana] Error saving cache:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should save empty cache', async () => {
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const { saveFuriganaCache } = await import('../../../services/furigana/cache.js');
      
      await saveFuriganaCache();
      
      expect(writeFile).toHaveBeenCalledWith(
        './data/furigana-cache.json',
        '{}'
      );
    });
  });

  describe('getCachedFurigana', () => {
    it('should return cached value if exists', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ '日本': 'にほん' }));

      const { loadFuriganaCache, getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      await loadFuriganaCache();
      
      const result = getCachedFurigana('日本');
      expect(result).toBe('にほん');
    });

    it('should return undefined if not cached', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ '日本': 'にほん' }));

      const { loadFuriganaCache, getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      await loadFuriganaCache();
      
      const result = getCachedFurigana('漢字');
      expect(result).toBeUndefined();
    });

    it('should trigger load if cache not loaded', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ '東京': 'とうきょう' }));

      const { getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      // getCachedFurigana should trigger loadFuriganaCache internally
      const result = getCachedFurigana('東京');
      
      // Note: getCachedFurigana calls loadFuriganaCache which is async,
      // but getCachedFurigana doesn't await it, so we may get undefined initially
      // This tests the lazy loading behavior
      expect(readFile).toHaveBeenCalled();
    });
  });

  describe('setCachedFurigana', () => {
    it('should set value in cache', async () => {
      const { setCachedFurigana, getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      setCachedFurigana('新しい', 'あたらしい');
      
      const result = getCachedFurigana('新しい');
      expect(result).toBe('あたらしい');
    });

    it('should overwrite existing value', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({ '同じ': 'おなじ' }));

      const { loadFuriganaCache, setCachedFurigana, getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      await loadFuriganaCache();
      
      // Overwrite existing value
      setCachedFurigana('同じ', 'おなじ (updated)');
      
      const result = getCachedFurigana('同じ');
      expect(result).toBe('おなじ (updated)');
    });

    it('should add multiple entries', async () => {
      const { setCachedFurigana, getCachedFurigana } = await import('../../../services/furigana/cache.js');
      
      setCachedFurigana('一', 'いち');
      setCachedFurigana('二', 'に');
      setCachedFurigana('三', 'さん');
      
      expect(getCachedFurigana('一')).toBe('いち');
      expect(getCachedFurigana('二')).toBe('に');
      expect(getCachedFurigana('三')).toBe('さん');
    });
  });
});
