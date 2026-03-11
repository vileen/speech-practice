import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

describe('useAudioPlayer', () => {
  let mockAudioElement: any;
  let eventListeners: Map<string, Function[]>;
  let MockAudioConstructor: any;

  beforeEach(() => {
    eventListeners = new Map();

    // Create a mock Audio element with event listener support
    mockAudioElement = {
      src: '',
      volume: 1,
      currentTime: 0,
      duration: 0,
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

    // Create a proper constructor function that returns the mock element
    MockAudioConstructor = vi.fn(function() {
      return mockAudioElement;
    }) as any;

    // Mock the global Audio constructor
    global.Audio = MockAudioConstructor;

    // Mock console.error to avoid noise in tests
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

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
      expect(result.current.duration).toBe(0);
    });

    it('should use provided volume', () => {
      renderHook(() => useAudioPlayer(0.5));

      // Play audio to trigger Audio creation
      const { result } = renderHook(() => useAudioPlayer(0.5));
      
      act(() => {
        result.current.play('test.mp3');
      });

      expect(mockAudioElement.volume).toBe(0.5);
    });
  });

  describe('Play', () => {
    it('should create Audio element and play when play() is called', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play('test.mp3');
      });

      expect(MockAudioConstructor).toHaveBeenCalled();
      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it('should set isPlaying to true when audio starts playing', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play('test.mp3');
      });

      // Simulate successful play
      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true);
      });
    });

    it('should stop previous audio before playing new audio', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Play first audio
      act(() => {
        result.current.play('first.mp3');
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true);
      });

      // Play second audio - should stop first
      act(() => {
        result.current.play('second.mp3');
      });

      expect(mockAudioElement.pause).toHaveBeenCalled();
    });

    it('should handle play() failure gracefully', async () => {
      const playError = new Error('Playback failed');
      mockAudioElement.play = vi.fn().mockRejectedValue(playError);

      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play('test.mp3');
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(false);
      });

      expect(console.error).toHaveBeenCalledWith('Failed to play audio:', playError);
    });
  });

  describe('Pause', () => {
    it('should pause audio and set isPlaying to false', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Start playing
      act(() => {
        result.current.play('test.mp3');
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true);
      });

      // Pause
      act(() => {
        result.current.pause();
      });

      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle pause when no audio is playing', () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Should not throw
      expect(() => {
        act(() => {
          result.current.pause();
        });
      }).not.toThrow();
    });
  });

  describe('Stop', () => {
    it('should stop audio, reset currentTime, and set isPlaying to false', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Start playing
      act(() => {
        result.current.play('test.mp3');
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true);
      });

      // Stop
      act(() => {
        result.current.stop();
      });

      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(mockAudioElement.currentTime).toBe(0);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
    });
  });

  describe('Audio Events', () => {
    it('should update duration when loadedmetadata fires', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play('test.mp3');
      });

      // Simulate loadedmetadata event
      mockAudioElement.duration = 120.5;
      act(() => {
        triggerEvent('loadedmetadata');
      });

      expect(result.current.duration).toBe(120.5);
    });

    it('should update currentTime when timeupdate fires', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play('test.mp3');
      });

      // Simulate timeupdate event
      mockAudioElement.currentTime = 45.3;
      act(() => {
        triggerEvent('timeupdate');
      });

      expect(result.current.currentTime).toBe(45.3);
    });

    it('should reset state when audio ends', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play('test.mp3');
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true);
      });

      // Simulate ended event
      act(() => {
        triggerEvent('ended');
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
    });

    it('should handle audio errors', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play('test.mp3');
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true);
      });

      // Simulate error event
      act(() => {
        triggerEvent('error');
      });

      expect(result.current.isPlaying).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Audio playback error');
    });
  });

  describe('Event Listeners', () => {
    it('should register all required event listeners', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play('test.mp3');
      });

      // Get the mock instance that was created
      const mockInstance = MockAudioConstructor.mock.results[0]?.value || mockAudioElement;
      
      expect(mockInstance.addEventListener).toHaveBeenCalledWith('loadedmetadata', expect.any(Function));
      expect(mockInstance.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
      expect(mockInstance.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
      expect(mockInstance.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });
});
