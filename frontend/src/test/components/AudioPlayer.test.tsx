import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AudioPlayer, formatTime } from '../../components/AudioPlayer/AudioPlayer';

describe('AudioPlayer', () => {
  let mockAudioElement: any;
  let eventListeners: Map<string, Function[]>;
  let MockAudioConstructor: any;
  let rafId: number;

  // Mock props
  const defaultProps = {
    audioUrl: 'test-audio.mp3',
    volume: 1,
    isActive: false,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onStop: vi.fn(),
    onStopOthers: vi.fn(),
  };

  beforeEach(() => {
    eventListeners = new Map();
    rafId = 0;

    // Simple mock for requestAnimationFrame - just return incrementing IDs
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
      return ++rafId;
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      // No-op for cleanup
    });

    // Create mock Audio element
    mockAudioElement = {
      src: '',
      volume: 1,
      currentTime: 0,
      duration: 120,
      paused: true,
      preload: '',
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

    // Create proper constructor
    MockAudioConstructor = vi.fn(function() {
      return mockAudioElement;
    }) as any;

    global.Audio = MockAudioConstructor;

    // Mock getBoundingClientRect for progress bar clicks
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 300,
      bottom: 20,
      width: 300,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to trigger events
  const triggerEvent = (event: string, data?: any) => {
    const handlers = eventListeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  };

  describe('Initial Render', () => {
    it('should render with correct initial state', () => {
      render(<AudioPlayer {...defaultProps} />);

      // Check play button shows play icon
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
      expect(screen.getByLabelText('Play')).toHaveTextContent('▶️');

      // Check stop button is disabled (not active and no time)
      expect(screen.getByLabelText('Stop')).toBeDisabled();

      // Check time display shows 0:00 for both times
      const timeDisplays = screen.getAllByText('0:00');
      expect(timeDisplays.length).toBe(2); // current time and duration

      // Verify Audio was created with correct URL
      expect(MockAudioConstructor).toHaveBeenCalledWith('test-audio.mp3');
    });

    it('should set initial volume on audio element', () => {
      render(<AudioPlayer {...defaultProps} volume={0.5} />);
      expect(mockAudioElement.volume).toBe(0.5);
    });
  });

  describe('Play Button', () => {
    it('should trigger onPlay callback when play button is clicked', () => {
      render(<AudioPlayer {...defaultProps} />);

      const playButton = screen.getByLabelText('Play');
      fireEvent.click(playButton);

      // onPlay is called directly from click handler
      expect(defaultProps.onPlay).toHaveBeenCalledWith(mockAudioElement);
    });

    it('should show pause icon when isActive is true', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
      expect(screen.getByLabelText('Pause')).toHaveTextContent('⏸️');
    });
  });

  describe('Pause Button', () => {
    it('should trigger onPause callback when pause button is clicked', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      const pauseButton = screen.getByLabelText('Pause');
      fireEvent.click(pauseButton);

      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(defaultProps.onPause).toHaveBeenCalled();
    });
  });

  describe('Stop Button', () => {
    it('should trigger onStop callback when stop button is clicked', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      const stopButton = screen.getByLabelText('Stop');
      fireEvent.click(stopButton);

      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(mockAudioElement.currentTime).toBe(0);
      expect(defaultProps.onStop).toHaveBeenCalled();
    });

    it('should be disabled when not active and no current time', () => {
      render(<AudioPlayer {...defaultProps} isActive={false} />);

      expect(screen.getByLabelText('Stop')).toBeDisabled();
    });

    it('should be enabled when isActive is true', () => {
      render(<AudioPlayer {...defaultProps} isActive={true} />);

      expect(screen.getByLabelText('Stop')).not.toBeDisabled();
    });
  });

  describe('Progress Bar', () => {
    it('should seek to position when progress bar is clicked', () => {
      mockAudioElement.duration = 120;

      render(<AudioPlayer {...defaultProps} />);

      // Set duration via loadedmetadata
      act(() => {
        triggerEvent('loadedmetadata');
      });

      const progressBar = document.querySelector('.progress-bar-container');
      expect(progressBar).toBeInTheDocument();

      // Click at 50% position
      fireEvent.click(progressBar!, { clientX: 150 });

      // Should seek to 60 seconds (50% of 120)
      expect(mockAudioElement.currentTime).toBe(60);
    });

    it('should not seek if audio duration is not finite', () => {
      mockAudioElement.duration = NaN;

      render(<AudioPlayer {...defaultProps} />);

      const progressBar = document.querySelector('.progress-bar-container');
      fireEvent.click(progressBar!, { clientX: 150 });

      // Should not update currentTime
      expect(mockAudioElement.currentTime).toBe(0);
    });

    it('should render progress bar container', () => {
      render(<AudioPlayer {...defaultProps} />);

      const progressBar = document.querySelector('.progress-bar-container');
      expect(progressBar).toBeInTheDocument();

      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe('Volume Updates', () => {
    it('should update audio volume when prop changes', () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} volume={0.5} />);

      expect(mockAudioElement.volume).toBe(0.5);

      rerender(<AudioPlayer {...defaultProps} volume={0.8} />);

      expect(mockAudioElement.volume).toBe(0.8);
    });
  });

  describe('Audio Ended Event', () => {
    it('should trigger onStop when audio ends', () => {
      render(<AudioPlayer {...defaultProps} />);

      act(() => {
        triggerEvent('ended');
      });

      expect(defaultProps.onStop).toHaveBeenCalled();
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should pause audio and clear src on unmount', () => {
      const { unmount } = render(<AudioPlayer {...defaultProps} />);

      unmount();

      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(mockAudioElement.src).toBe('');
    });


  });

  describe('Audio Lifecycle', () => {
    it('should call onStopOthers and play when isActive becomes true', async () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} isActive={false} />);

      rerender(<AudioPlayer {...defaultProps} isActive={true} />);

      await waitFor(() => {
        expect(defaultProps.onStopOthers).toHaveBeenCalled();
        expect(mockAudioElement.play).toHaveBeenCalled();
      });
    });

    it('should pause audio when isActive becomes false', () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} isActive={true} />);

      rerender(<AudioPlayer {...defaultProps} isActive={false} />);

      expect(mockAudioElement.pause).toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      mockAudioElement.play = vi.fn().mockRejectedValue(new Error('Play failed'));

      const { rerender } = render(<AudioPlayer {...defaultProps} isActive={false} />);

      rerender(<AudioPlayer {...defaultProps} isActive={true} />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error playing audio:', expect.any(Error));
        expect(defaultProps.onStop).toHaveBeenCalled();
      });
    });
  });

  describe('Event Listeners Registration', () => {
    it('should register all required event listeners on mount', () => {
      render(<AudioPlayer {...defaultProps} />);

      expect(mockAudioElement.addEventListener).toHaveBeenCalledWith('loadedmetadata', expect.any(Function));
      expect(mockAudioElement.addEventListener).toHaveBeenCalledWith('canplay', expect.any(Function));
      expect(mockAudioElement.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
      expect(mockAudioElement.addEventListener).toHaveBeenCalledWith('pause', expect.any(Function));
    });
  });

  describe('Duration Updates', () => {
    it('should update duration when loadedmetadata fires', () => {
      mockAudioElement.duration = 185; // 3:05

      render(<AudioPlayer {...defaultProps} />);

      act(() => {
        triggerEvent('loadedmetadata');
      });

      // Should show duration in time display
      expect(screen.getByText('3:05')).toBeInTheDocument();
    });

    it('should update duration when canplay fires', () => {
      mockAudioElement.duration = 90; // 1:30

      render(<AudioPlayer {...defaultProps} />);

      act(() => {
        triggerEvent('canplay');
      });

      expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it('should not update duration if value is not finite', () => {
      mockAudioElement.duration = NaN;

      render(<AudioPlayer {...defaultProps} />);

      act(() => {
        triggerEvent('loadedmetadata');
      });

      // Should still show 0:00
      const timeDisplays = screen.getAllByText('0:00');
      expect(timeDisplays.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('formatTime', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(185)).toBe('3:05');
    expect(formatTime(3600)).toBe('60:00');
  });

  it('should handle non-finite values', () => {
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(Infinity)).toBe('0:00');
    expect(formatTime(-Infinity)).toBe('0:00');
  });

  it('should pad seconds with leading zero', () => {
    expect(formatTime(1)).toBe('0:01');
    expect(formatTime(10)).toBe('0:10');
    expect(formatTime(61)).toBe('1:01');
  });
});
