import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RepeatMode } from '../../components/RepeatMode';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => 'test-password'),
    setItem: vi.fn(),
  },
  writable: true,
});

// Mock Audio
global.Audio = vi.fn(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  volume: 0.8,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

global.URL = {
  createObjectURL: vi.fn(() => 'blob:test'),
  revokeObjectURL: vi.fn(),
} as any;

describe('RepeatMode API calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call furigana API on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ with_furigana: '<ruby>今日<rt>きょう</rt></ruby>は' }),
      });

    render(
      <MemoryRouter>
        <RepeatMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/furigana'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('おはようございます'),
        })
      );
    });
  });

  it('should call repeat-after-me API when Listen is clicked', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ with_furigana: '<ruby>今日<rt>きょう</rt></ruby>は' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['audio']),
      });

    render(
      <MemoryRouter>
        <RepeatMode />
      </MemoryRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/Listen/i)).toBeInTheDocument();
    });

    // Click Listen button
    const listenBtn = screen.getByText(/Listen/i);
    listenBtn.click();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/repeat-after-me'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('target_text'),
        })
      );
    });
  });

  it('should call pronunciation API after recording', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ with_furigana: '<ruby>今日<rt>きょう</rt></ruby>は' }),
      });

    render(
      <MemoryRouter>
        <RepeatMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Listen/i)).toBeInTheDocument();
    });

    // TODO: Simulate recording completion
    // This would require mocking VoiceRecorder
  });
});
