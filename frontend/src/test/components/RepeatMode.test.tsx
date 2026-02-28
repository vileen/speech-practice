import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
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
class MockAudio {
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  currentTime = 0;
  volume = 0.8;
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}
global.Audio = MockAudio as any;

global.URL = {
  createObjectURL: vi.fn(() => 'blob:test'),
  revokeObjectURL: vi.fn(),
} as any;

describe('RepeatMode API calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call repeat-after-me API on mount for auto-play audio', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['audio']),
    });

    render(
      <MemoryRouter>
        <RepeatMode />
      </MemoryRouter>
    );

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

  it('should render the component with essential controls', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['audio']),
    });

    const { container } = render(
      <MemoryRouter>
        <RepeatMode />
      </MemoryRouter>
    );

    // Wait for loading to complete - check for Listen button
    await waitFor(() => {
      const button = container.querySelector('.play-btn');
      return button && button.textContent?.includes('Listen');
    }, { timeout: 3000 });

    // Check essential controls are rendered
    expect(container.querySelector('.play-btn')).toBeInTheDocument();
    expect(container.querySelector('.next-btn')).toBeInTheDocument();
    expect(container.querySelector('.toggle-furigana')).toBeInTheDocument();
    expect(container.querySelector('.translate-btn')).toBeInTheDocument();
  });

  it('should call API when next phrase is requested', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['audio']),
    });

    const { container } = render(
      <MemoryRouter>
        <RepeatMode />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      return container.querySelector('.next-btn') !== null;
    }, { timeout: 3000 });

    // Clear mock to count fresh calls
    vi.clearAllMocks();

    // Click next button
    const nextBtn = container.querySelector('.next-btn') as HTMLElement;
    await act(async () => {
      nextBtn.click();
    });

    // Should have fetched new phrase audio
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/repeat-after-me'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});
