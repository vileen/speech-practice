import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AudioPlayer, formatTime } from './AudioPlayer';

describe('AudioPlayer', () => {
  let mockAudioElement: any;
  let eventListeners: Map<string, Function[]>;
  let MockAudioConstructor: any;
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafId: number;

  const mockOnPlay = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnStop = vi.fn();
  const mockOnStopOthers = vi.fn();

  const defaultProps = {
    audioUrl: 'test-audio.mp3',
    volume: 0.8,
    isActive: false,
    onPlay: mockOnPlay,
    onPause: mockOnPause,
    onStop: mockOnStop,
    onStopOthers: mockOnStopOthers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    eventListeners = new Map();
    rafCallbacks = new Map();
    rafId = 0;

    mockAudioElement = {
      src: '',
      volume: 1,
      currentTime: 0,
      duration: 120,
      paused: true,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn((event: string, handler: Function) => {
        if (!eventListeners.has(event)) {
          eventListeners.set(event, []);
        }
        eventListeners.get(event)!.push(handler);
      }),
      removeEventListener: vi.fn(),
    };

    MockAudioConstructor = vi.fn(function () {
      return mockAudioElement;
    }) as any;

    global.Audio = MockAudioConstructor;

    // Mock requestAnimationFrame/cancelAnimationFrame
    global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      rafId += 1;
      rafCallbacks.set(rafId, callback);
      return rafId;
    }) as any;

    global.cancelAnimationFrame = vi.fn((id: number) => {
      rafCallbacks.delete(id);
    }) as any;

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const triggerEvent = (event: string, data?: any) => {
    const handlers = eventListeners.get(event) || [];
    handlers.forEach((handler) => handler(data));
  };

  const triggerAnimationFrame = () => {
    rafCallbacks.forEach((callback, id) => {
      callback(performance.now());
    });
  };

  describe('formatTime helper', () => {
    it('should format seconds as mm:ss', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(45)).toBe('0:45');
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(125.5)).toBe('2:05');
    });

    it('should handle invalid values', () => {
      expect(formatTime(NaN)).toBe('0:00');
      expect(formatTime(Infinity)).toBe('0:00');
      expect(formatTime(-Infinity)).toBe('0:00');
    });
  });

  describe('Rendering', () => {
    it('should render play button when inactive', () => {
      render(<AudioPlayer {...defaultProps} />);

      const playButton = screen.getByRole('button', { name: /play/i });
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveTextContent('▶️');
    });

    it('should render pause button when active', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      expect(pauseButton).toBeInTheDocument();
      expect(pauseButton).toHaveTextContent('⏸️');
    });

    it('should render stop button', () => {
      render(<AudioPlayer {...defaultProps} />);

      const stopButton = screen.getByRole('button', { name: /stop/i });
      expect(stopButton).toBeInTheDocument();
    });

    it('should disable stop button when inactive and at time 0', () => {
      render(<AudioPlayer {...defaultProps} />);

      const stopButton = screen.getByRole('button', { name: /stop/i });
      expect(stopButton).toBeDisabled();
    });

    it('should enable stop button when active', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      const stopButton = screen.getByRole('button', { name: /stop/i });
      expect(stopButton).not.toBeDisabled();
    });

    it('should display initial time of 0:00 / 0:00', () => {
      const { container } = render(<AudioPlayer {...defaultProps} />);

      const timeDisplay = container.querySelector('.time-display') as HTMLElement;
      expect(timeDisplay).toBeInTheDocument();
      const times = timeDisplay.querySelectorAll('span');
      expect(times[0]).toHaveTextContent('0:00');
      expect(times[1]).toHaveTextContent('0:00');
    });

    it('should create Audio element with provided URL and volume', () => {
      render(<AudioPlayer {...defaultProps} />);

      expect(MockAudioConstructor).toHaveBeenCalledWith('test-audio.mp3');
      expect(mockAudioElement.volume).toBe(0.8);
      expect(mockAudioElement.preload).toBe('auto');
    });
  });

  describe('Audio Lifecycle', () => {
    it('should update duration when loadedmetadata fires', () => {
      render(<AudioPlayer {...defaultProps} />);

      mockAudioElement.duration = 185.4;
      act(() => {
        triggerEvent('loadedmetadata');
      });

      expect(screen.getByText('3:05')).toBeInTheDocument();
    });

    it('should update duration when canplay fires', () => {
      render(<AudioPlayer {...defaultProps} />);

      mockAudioElement.duration = 245.2;
      act(() => {
        triggerEvent('canplay');
      });

      expect(screen.getByText('4:05')).toBeInTheDocument();
    });

    it('should start playing when isActive becomes true', async () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} isActive={false} />);

      rerender(<AudioPlayer {...defaultProps} isActive={true} />);

      await waitFor(() => {
        expect(mockAudioElement.play).toHaveBeenCalled();
      });
      expect(mockOnStopOthers).toHaveBeenCalled();
    });

    it('should pause audio when isActive becomes false', () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} isActive={true} />);

      rerender(<AudioPlayer {...defaultProps} isActive={false} />);

      expect(mockAudioElement.pause).toHaveBeenCalled();
    });

    it('should reset state and call onStop when audio ends', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      act(() => {
        triggerEvent('ended');
      });

      expect(mockOnStop).toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      const playError = new Error('Playback failed');
      mockAudioElement.play = vi.fn().mockRejectedValue(playError);

      const { rerender } = render(<AudioPlayer {...defaultProps} isActive={false} />);

      rerender(<AudioPlayer {...defaultProps} isActive={true} />);

      await waitFor(() => {
        expect(mockOnStop).toHaveBeenCalled();
      });

      expect(console.error).toHaveBeenCalledWith('Error playing audio:', playError);
    });
  });

  describe('User Interactions', () => {
    it('should call onPlay when play button is clicked', () => {
      render(<AudioPlayer {...defaultProps} isActive={false} />);

      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);

      expect(mockOnPlay).toHaveBeenCalledTimes(1);
      expect(mockOnPlay).toHaveBeenCalledWith(mockAudioElement);
    });

    it('should call onPause when pause button is clicked', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);

      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(mockOnPause).toHaveBeenCalledTimes(1);
    });

    it('should call onStop and reset audio when stop button is clicked', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);

      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(mockAudioElement.currentTime).toBe(0);
      expect(mockOnStop).toHaveBeenCalledTimes(1);
    });

    it('should update progress when progress bar is clicked', () => {
      const { container } = render(<AudioPlayer {...defaultProps} isActive={true} />);

      const progressBar = container.querySelector('.progress-bar-container') as HTMLElement;
      expect(progressBar).toBeInTheDocument();

      const rect = { left: 0, width: 200 } as DOMRect;
      progressBar.getBoundingClientRect = vi.fn().mockReturnValue(rect);

      fireEvent.click(progressBar, { clientX: 100 });

      expect(mockAudioElement.currentTime).toBe(60);
      expect(screen.getByText('1:00')).toBeInTheDocument();
    });

    it('should not update progress when click position results in invalid time', () => {
      const { container } = render(<AudioPlayer {...defaultProps} isActive={true} />);

      const progressBar = container.querySelector('.progress-bar-container') as HTMLElement;
      const rect = { left: 0, width: 0 } as DOMRect;
      progressBar.getBoundingClientRect = vi.fn().mockReturnValue(rect);

      // Should not throw
      expect(() => {
        fireEvent.click(progressBar, { clientX: 0 });
      }).not.toThrow();
    });
  });

  describe('Volume Updates', () => {
    it('should update audio volume when volume prop changes', () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} volume={0.5} />);

      expect(mockAudioElement.volume).toBe(0.5);

      rerender(<AudioPlayer {...defaultProps} volume={0.9} />);

      expect(mockAudioElement.volume).toBe(0.9);
    });
  });

  describe('Cleanup', () => {
    it('should pause audio and clear animation frame on unmount', () => {
      const { unmount } = render(<AudioPlayer {...defaultProps} isActive={true} />);

      unmount();

      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(mockAudioElement.src).toBe('');
    });
  });
});
