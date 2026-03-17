import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Store original fetch
const originalFetch = window.fetch;

describe('API Interceptor', () => {
  let localStorageMock: { getItem: ReturnType<typeof vi.fn> };
  let mockFetch: ReturnType<typeof vi.fn>;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Reset fetch
    window.fetch = originalFetch;
    
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { 
      value: localStorageMock,
      writable: true 
    });
    
    // Mock fetch
    mockFetch = vi.fn().mockResolvedValue({ ok: true } as Response);
    window.fetch = mockFetch;
    
    // Import and run interceptor
    const interceptor = await import('../../lib/api-interceptor.js');
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it('should add x-password header for API calls', async () => {
    localStorageMock.getItem.mockReturnValue('test-password');
    
    // Call API endpoint
    await window.fetch('https://speech.vileen.pl/api/lessons/2026-03-16');
    
    // Verify header was added
    expect(mockFetch).toHaveBeenCalledWith(
      'https://speech.vileen.pl/api/lessons/2026-03-16',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-password': 'test-password',
        }),
      })
    );
  });

  it('should NOT add x-password for non-API calls', async () => {
    localStorageMock.getItem.mockReturnValue('test-password');
    
    // Call non-API endpoint
    await window.fetch('https://example.com/data');
    
    // Verify no auth header added
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toBe('https://example.com/data');
    // Should not have headers for non-API
    expect(callArgs[1]).toBeUndefined();
  });

  it('should add x-password for relative API paths', async () => {
    localStorageMock.getItem.mockReturnValue('my-secret');
    
    // Call relative API endpoint
    await window.fetch('/api/health');
    
    // Verify header was added
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-password': 'my-secret',
        }),
      })
    );
  });

  it('should merge x-password with existing headers', async () => {
    localStorageMock.getItem.mockReturnValue('pass123');
    
    // Call with existing headers
    await window.fetch('https://speech.vileen.pl/api/lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });
    
    // Verify both headers present
    expect(mockFetch).toHaveBeenCalledWith(
      'https://speech.vileen.pl/api/lessons',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-password': 'pass123',
        },
        body: JSON.stringify({ test: true }),
      })
    );
  });

  it('should use empty string when no password in localStorage', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    // Call API endpoint
    await window.fetch('https://speech.vileen.pl/api/lessons');
    
    // Verify empty password header
    expect(mockFetch).toHaveBeenCalledWith(
      'https://speech.vileen.pl/api/lessons',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-password': '',
        }),
      })
    );
  });
});
