import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AudioPlayer, formatTime } from '../../../components/AudioPlayer/AudioPlayer';

describe('AudioPlayer', () => {
  const mockAudioUrl = 'https://example.com/audio.mp3';
  const mockOnPlay = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnStop = vi.fn();
  const mockOnStopOthers = vi.fn();

  let mockAudioInstance: any;
  let eventListeners: Map<string, EventListener[]>;

  const createMockAudioElement = () => {
    eventListeners = new Map();
    const instance: any = {
      src: '',
      volume: 1,
      _currentTime: 0,
      get currentTime() { return this._currentTime; },
      set currentTime(value: number) { this._currentTime = value; },
      duration: 120,
      paused: true,
      preload: '',
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn((event: string, handler: EventListener) => {
        if (!eventListeners.has(event)) {
          eventListeners.set(event, []);
        }
        eventListeners.get(event)!.push(handler);
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    return instance;
  };

  const triggerEvent = (event: string) => {
    const handlers = eventListeners.get(event) || [];
    handlers.forEach((handler) => {
      handler(new Event(event));
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioInstance = createMockAudioElement();
    
    // Mock global Audio constructor - must be a proper constructor
    global.Audio = vi.fn(function(this: any, url?: string) {
      mockAudioInstance.src = url || '';
      return mockAudioInstance;
    }) as unknown as typeof Audio;
    
    global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      return setTimeout(() => callback(performance.now()), 16) as unknown as number;
    });
    global.cancelAnimationFrame = vi.fn((id: number) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderAudioPlayer = (isActive = false, volume = 1) => {
    return render(
      <AudioPlayer
        audioUrl={mockAudioUrl}
        volume={volume}
        isActive={isActive}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );
  };

  describe('formatTime', () => {
    it('should format seconds to mm:ss', () => {
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(120)).toBe('2:00');
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(59)).toBe('0:59');
    });

    it('should handle invalid values', () => {
      expect(formatTime(NaN)).toBe('0:00');
      expect(formatTime(Infinity)).toBe('0:00');
      expect(formatTime(-1)).toBe('-1:-1'); // Negative passes through isFinite check
    });
  });

  describe('rendering', () => {
    it('should render play button when inactive', () => {
      renderAudioPlayer(false);
      const playButton = screen.getByRole('button', { name: /play/i });
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveTextContent('▶️');
    });

    it('should render pause button when active', () => {
      renderAudioPlayer(true);
      const playButton = screen.getByRole('button', { name: /pause/i });
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveTextContent('⏸️');
    });

    it('should render stop button', () => {
      renderAudioPlayer();
      const stopButton = screen.getByRole('button', { name: /stop/i });
      expect(stopButton).toBeInTheDocument();
      expect(stopButton).toHaveTextContent('⏹️');
    });

    it('should render time display', () => {
      renderAudioPlayer();
      const times = screen.getAllByText('0:00');
      expect(times.length).toBe(2); // current time and duration
    });

    it('should render progress bar container', () => {
      const { container } = renderAudioPlayer();
      expect(container.querySelector('.progress-bar-container')).toBeInTheDocument();
    });
  });

  describe('audio initialization', () => {
    it('should create Audio element with correct URL', () => {
      renderAudioPlayer();
      expect(global.Audio).toHaveBeenCalledWith(mockAudioUrl);
      expect(mockAudioInstance.src).toBe(mockAudioUrl);
    });

    it('should set audio preload to auto', () => {
      renderAudioPlayer();
      expect(mockAudioInstance.preload).toBe('auto');
    });

    it('should set initial volume from props', () => {
      renderAudioPlayer(false, 0.5);
      expect(mockAudioInstance.volume).toBe(0.5);
    });

    it('should update volume when prop changes', () => {
      const { rerender } = renderAudioPlayer(false, 0.5);
      
      rerender(
        <AudioPlayer
          audioUrl={mockAudioUrl}
          volume={0.8}
          isActive={false}
          onPlay={mockOnPlay}
          onPause={mockOnPause}
          onStop={mockOnStop}
          onStopOthers={mockOnStopOthers}
        />
      );
      
      expect(mockAudioInstance.volume).toBe(0.8);
    });
  });

  describe('play/pause functionality', () => {
    it('should call onPlay when play button is clicked while inactive', () => {
      renderAudioPlayer(false);
      const playButton = screen.getByRole('button', { name: /play/i });
      
      fireEvent.click(playButton);
      
      expect(mockOnPlay).toHaveBeenCalledWith(mockAudioInstance);
    });

    it('should call onPause when pause button is clicked while active', () => {
      renderAudioPlayer(true);
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      
      fireEvent.click(pauseButton);
      
      expect(mockOnPause).toHaveBeenCalled();
      expect(mockAudioInstance.pause).toHaveBeenCalled();
    });

    it('should start playing when isActive becomes true', async () => {
      const { rerender } = renderAudioPlayer(false);
      
      await act(async () => {
        rerender(
          <AudioPlayer
            audioUrl={mockAudioUrl}
            volume={1}
            isActive={true}
            onPlay={mockOnPlay}
            onPause={mockOnPause}
            onStop={mockOnStop}
            onStopOthers={mockOnStopOthers}
          />
        );
      });
      
      expect(mockOnStopOthers).toHaveBeenCalled();
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it('should pause when isActive becomes false', () => {
      const { rerender } = renderAudioPlayer(true);
      
      rerender(
        <AudioPlayer
          audioUrl={mockAudioUrl}
          volume={1}
          isActive={false}
          onPlay={mockOnPlay}
          onPause={mockOnPause}
          onStop={mockOnStop}
          onStopOthers={mockOnStopOthers}
        />
      );
      
      expect(mockAudioInstance.pause).toHaveBeenCalled();
    });
  });

  describe('stop functionality', () => {
    it('should stop and reset audio when stop button is clicked', () => {
      renderAudioPlayer(true);
      const stopButton = screen.getByRole('button', { name: /stop/i });
      
      fireEvent.click(stopButton);
      
      expect(mockAudioInstance.pause).toHaveBeenCalled();
      expect(mockAudioInstance.currentTime).toBe(0);
      expect(mockOnStop).toHaveBeenCalled();
    });

    it('should disable stop button when inactive and at start', () => {
      renderAudioPlayer(false);
      const stopButton = screen.getByRole('button', { name: /stop/i });
      expect(stopButton).toBeDisabled();
    });

    it('should enable stop button when active', () => {
      renderAudioPlayer(true);
      const stopButton = screen.getByRole('button', { name: /stop/i });
      expect(stopButton).not.toBeDisabled();
    });

    it('should handle ended event by calling onStop', () => {
      renderAudioPlayer(true);
      
      triggerEvent('ended');
      
      expect(mockOnStop).toHaveBeenCalled();
    });
  });

  describe('progress bar', () => {
    it('should seek to clicked position', () => {
      const { container } = renderAudioPlayer(true);
      const progressBar = container.querySelector('.progress-bar-container') as HTMLElement;
      
      // Mock getBoundingClientRect
      Object.defineProperty(progressBar, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200 }),
      });
      
      fireEvent.click(progressBar, { clientX: 100 });
      
      expect(mockAudioInstance.currentTime).toBe(60); // 50% of 120 seconds
    });

    it('should not seek when audio has no duration', () => {
      mockAudioInstance.duration = NaN;
      const { container } = renderAudioPlayer(true);
      const progressBar = container.querySelector('.progress-bar-container') as HTMLElement;
      
      Object.defineProperty(progressBar, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200 }),
      });
      
      fireEvent.click(progressBar, { clientX: 100 });
      
      expect(mockAudioInstance.currentTime).toBe(0);
    });
  });

  describe('duration metadata', () => {
    it('should set duration from loadedmetadata event', async () => {
      renderAudioPlayer();
      
      await act(async () => {
        triggerEvent('loadedmetadata');
      });
      
      expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    it('should set duration from canplay event', async () => {
      renderAudioPlayer();
      
      await act(async () => {
        triggerEvent('canplay');
      });
      
      expect(screen.getByText('2:00')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle play error and call onStop', async () => {
      const playError = new Error('Playback failed');
      mockAudioInstance.play = vi.fn().mockRejectedValue(playError);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await act(async () => {
        renderAudioPlayer(true);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Error playing audio:', playError);
      expect(mockOnStop).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('should clean up audio on unmount', () => {
      const { unmount } = renderAudioPlayer(true);
      
      unmount();
      
      expect(mockAudioInstance.pause).toHaveBeenCalled();
      expect(mockAudioInstance.src).toBe('');
    });
  });
});
