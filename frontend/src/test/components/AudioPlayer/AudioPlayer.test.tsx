import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AudioPlayer, formatTime } from '../../../components/AudioPlayer/AudioPlayer';

// Track created mock audio instances
const mockAudios: MockAudio[] = [];

class MockAudio {
  currentTime = 0;
  duration = 120;
  paused = true;
  volume = 1;
  src = '';
  preload = '';
  private _listeners: Record<string, Array<(e?: Event) => void>> = {};

  constructor(url?: string) {
    this.src = url || '';
    mockAudios.push(this);
  }

  addEventListener(event: string, callback: (e?: Event) => void) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }

  removeEventListener() {}

  play = vi.fn().mockImplementation(() => {
    this.paused = false;
    return Promise.resolve();
  });

  pause = vi.fn().mockImplementation(() => {
    this.paused = true;
  });

  dispatchEvent(eventName: string) {
    (this._listeners[eventName] || []).forEach(cb => cb());
  }
}

describe('formatTime', () => {
  it('formats seconds to mm:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(123)).toBe('2:03');
  });

  it('handles invalid inputs', () => {
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(Infinity)).toBe('0:00');
  });
});

describe('AudioPlayer', () => {
  const mockOnPlay = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnStop = vi.fn();
  const mockOnStopOthers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudios.length = 0;

    // Mock global Audio as constructable
    vi.stubGlobal('Audio', MockAudio as unknown as typeof Audio);
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 123));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function getLatestMockAudio(): MockAudio {
    return mockAudios[mockAudios.length - 1];
  }

  it('renders play button and time display', () => {
    render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.getAllByText('0:00').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onPlay when play is clicked', () => {
    render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    const playBtn = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playBtn);

    expect(mockOnPlay).toHaveBeenCalledWith(getLatestMockAudio());
  });

  it('calls onStopOthers when isActive becomes true', () => {
    const { rerender } = render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    rerender(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={true}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    expect(mockOnStopOthers).toHaveBeenCalled();
    expect(getLatestMockAudio().play).toHaveBeenCalled();
  });

  it('calls onPause when pause is clicked (isActive=true)', () => {
    const { rerender } = render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    // Click to start playing
    fireEvent.click(screen.getByRole('button', { name: /play/i }));

    rerender(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={true}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    // Now pause button should show
    const pauseBtn = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseBtn);

    expect(mockOnPause).toHaveBeenCalled();
  });

  it('calls onStop and resets when stop is clicked', () => {
    render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={true}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    const stopBtn = screen.getByRole('button', { name: /stop/i });
    fireEvent.click(stopBtn);

    expect(mockOnStop).toHaveBeenCalled();
    expect(getLatestMockAudio().pause).toHaveBeenCalled();
  });

  it('calls onStop when audio ends', () => {
    render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    // Trigger the 'ended' event on the mock audio
    getLatestMockAudio().dispatchEvent('ended');
    expect(mockOnStop).toHaveBeenCalled();
  });

  it('disables stop button when inactive and at 0 time', () => {
    render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    const stopBtn = screen.getByRole('button', { name: /stop/i });
    expect(stopBtn).toBeDisabled();
  });

  it('creates new audio element when audioUrl changes', () => {
    const { rerender } = render(
      <AudioPlayer
        audioUrl="test1.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    expect(mockAudios.length).toBe(1);
    expect(mockAudios[0].src).toBe('test1.mp3');

    rerender(
      <AudioPlayer
        audioUrl="test2.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    expect(mockAudios.length).toBe(2);
    expect(mockAudios[1].src).toBe('test2.mp3');
  });

  it('updates audio volume when volume prop changes', () => {
    const { rerender } = render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    expect(getLatestMockAudio().volume).toBe(0.5);

    rerender(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.8}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    expect(getLatestMockAudio().volume).toBe(0.8);
  });

  it('handles play() error and calls onStop', async () => {
    // Create a proper constructor that returns a rejecting mock
    class RejectingMockAudio {
      currentTime = 0;
      duration = 100;
      paused = true;
      volume = 1;
      src = '';
      preload = '';
      _listeners: Record<string, Array<(e?: Event) => void>> = {};
      addEventListener(event: string, callback: (e?: Event) => void) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
      }
      removeEventListener() {}
      play = vi.fn().mockRejectedValue(new Error('Playback failed'));
      pause = vi.fn();
    }
    vi.stubGlobal('Audio', RejectingMockAudio as unknown as typeof Audio);

    const { rerender } = render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    rerender(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={true}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    // Wait for the async play rejection
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockOnStop).toHaveBeenCalled();

    // Restore Audio stub
    vi.stubGlobal('Audio', MockAudio as unknown as typeof Audio);
  });

  it('seeks to correct position when progress bar is clicked', async () => {
    render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    const audio = getLatestMockAudio();
    audio.duration = 200; // 3:20

    // Trigger loadedmetadata to set duration (wrap in act for state update)
    await act(async () => {
      audio.dispatchEvent('loadedmetadata');
    });

    const progressBar = screen.getByRole('button', { name: /play/i }).parentElement!.querySelector('.progress-bar-container') as HTMLElement;
    expect(progressBar).toBeTruthy();

    // Mock getBoundingClientRect for the progress bar
    progressBar.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 200,
      height: 20,
      right: 200,
      bottom: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    await act(async () => {
      fireEvent.click(progressBar, { clientX: 100 });
    });

    // Clicked at 50% of 200px width, so 50% of 200s = 100s
    expect(audio.currentTime).toBe(100);
  });

  it('updates duration when loadedmetadata fires', async () => {
    render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    const audio = getLatestMockAudio();
    audio.duration = 185; // 3:05

    // Dispatch event inside act to handle state update
    await act(async () => {
      audio.dispatchEvent('loadedmetadata');
    });

    // After loadedmetadata, the component should show the duration
    expect(screen.getAllByText('3:05').length).toBeGreaterThanOrEqual(1);
  });

  it('starts RAF loop when playback begins', async () => {
    // Use a fresh RAF mock for this test
    const rafMock = vi.fn(() => 999);
    vi.stubGlobal('requestAnimationFrame', rafMock);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const { rerender } = render(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={false}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    // Clear any calls from initial render
    rafMock.mockClear();

    rerender(
      <AudioPlayer
        audioUrl="test.mp3"
        volume={0.5}
        isActive={true}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
        onStop={mockOnStop}
        onStopOthers={mockOnStopOthers}
      />
    );

    // Wait for async play() to resolve and RAF to be scheduled
    await new Promise(resolve => setTimeout(resolve, 10));

    // RAF should have been called for progress updates
    expect(rafMock).toHaveBeenCalled();
  });
});
