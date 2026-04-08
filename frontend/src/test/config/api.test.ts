import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPassword, authFetch, API_URL } from '../../config/api';

describe('API Config', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('API_URL', () => {
    it('should be defined', () => {
      expect(API_URL).toBeDefined();
      expect(typeof API_URL).toBe('string');
    });

    it('should not have trailing slash', () => {
      expect(API_URL).not.toMatch(/\/$/);
    });

    it('should be a valid URL format', () => {
      expect(API_URL).toMatch(/^https?:\/\//);
    });

    it('should match expected production URL', () => {
      expect(API_URL).toBe('https://speech.vileen.pl');
    });
  });

  describe('getPassword', () => {
    it('should return empty string when no password in localStorage', () => {
      expect(getPassword()).toBe('');
    });
  });

  describe('authFetch', () => {
    it('should be a function', () => {
      expect(typeof authFetch).toBe('function');
    });

    it('should make fetch call with provided URL', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
      
      await authFetch('https://api.example.com/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        {}
      );
    });

    it('should merge custom options with defaults', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
      
      await authFetch('https://api.example.com/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true }),
        }
      );
    });

    it('should pass through headers correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
      
      await authFetch('https://api.example.com/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
          'Authorization': 'Bearer token123',
        },
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        {
          headers: {
            'X-Custom-Header': 'custom-value',
            'Authorization': 'Bearer token123',
          },
        }
      );
    });

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(authFetch('https://api.example.com/test')).rejects.toThrow('Network error');
    });

    it('should handle empty response', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
      
      const response = await authFetch('https://api.example.com/test');
      expect(response.ok).toBe(true);
    });

    it('should handle POST requests with empty body', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
      
      await authFetch('https://api.example.com/test', {
        method: 'POST',
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        { method: 'POST' }
      );
    });

    it('should handle PUT requests', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
      
      await authFetch('https://api.example.com/test/123', {
        method: 'PUT',
        body: JSON.stringify({ updated: true }),
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test/123',
        { 
          method: 'PUT',
          body: JSON.stringify({ updated: true }),
        }
      );
    });

    it('should handle DELETE requests', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
      
      await authFetch('https://api.example.com/test/123', {
        method: 'DELETE',
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test/123',
        { method: 'DELETE' }
      );
    });
  });
});
