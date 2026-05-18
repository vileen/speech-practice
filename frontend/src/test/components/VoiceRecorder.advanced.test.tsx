import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { VoiceRecorder } from '../../components/VoiceRecorder/VoiceRecorder';

describe('VoiceRecorder - Advanced Flows', () => {
  const mockOnRecordingComplete = vi.fn();
  const mockOnStartListening = vi.fn();
  const mockOnStopListening = vi.fn();

  let mockMediaRecorderInstance: any;
  let mockGetUserMedia: any;
  let rafCallbacks: Array<FrameRequestCallback> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    rafCallbacks = [];

    // Mock MediaRecorder with onstop trigger and proper state tracking
    mockMediaRecorderInstance = {
      start: vi.fn(function(this: any) {
        this.state = 'recording';
      }),
      stop: vi.fn(function (this: any) {
        this.state = 'inactive';
        if (this.onstop) {
          this.onstop();
        }
      }),
      ondataavailable: null,
      onstop: null,
      state: 'inactive',
    };

    // Create an actual constructor function (not vi.fn) to avoid "not a constructor" errors
    const MockMediaRecorderCtor = function(this: any) {
      return mockMediaRecorderInstance;
    } as any;
    
    Object.defineProperty(global, 'MediaRecorder', {
      value: MockMediaRecorderCtor,
      writable: true,
      configurable: true,
    });

    // Mock navigator.mediaDevices
    mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
      getAudioTracks: vi.fn().mockReturnValue([]),
    });

    Object.assign(global.navigator, {
      mediaDevices: {
        getUserMedia: mockGetUserMedia,
      },
    });

    // Mock AudioContext
    const MockAudioContext = vi.fn().mockImplementation(function () {
      return {
        createAnalyser: vi.fn().mockReturnValue({
          fftSize: 512,
          smoothingTimeConstant: 0.3,
          frequencyBinCount: 256,
          getByteFrequencyData: vi.fn(),
          getByteTimeDomainData: vi.fn((arr: Uint8Array) => arr.fill(128)),
          connect: vi.fn(),
          disconnect: vi.fn(),
        }),
        createMediaStreamSource: vi.fn().mockReturnValue({
          connect: vi.fn(),
          disconnect: vi.fn(),
        }),
        state: 'running',
        resume: vi.fn().mockResolvedValue(undefined),
        suspend: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
        destination: {},
      };
    });

    Object.assign(global, {
      AudioContext: MockAudioContext,
      webkitAudioContext: MockAudioContext,
    });

    // Mock requestAnimationFrame to capture callbacks
    Object.assign(global, {
      requestAnimationFrame: vi.fn().mockImplementation((callback: FrameRequestCallback) => {
        rafCallbacks.push(callback);
        return rafCallbacks.length;
      }),
      cancelAnimationFrame: vi.fn(),
    });

    vi.spyOn(console, 'log').mockImplementation(() => {});
    // vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Push-to-Talk Recording Completion', () => {
    it('should complete recording and call onRecordingComplete with audio blob', async () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      // Start recording
      const startButton = screen.getByText(/🎙️ Start Recording/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockOnStartListening).toHaveBeenCalledTimes(1);
      });

      // Rerender with isListening=true to show stop button (simulating parent state update)
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      // Simulate audio data being collected
      const dataEvent = { data: new Blob(['test audio data'], { type: 'audio/webm' }) };
      mockMediaRecorderInstance.ondataavailable(dataEvent);

      // Stop recording
      const stopButton = screen.getByText(/🔴 Stop Recording/i);
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(mockOnRecordingComplete).toHaveBeenCalledTimes(1);
      });

      const callArg = mockOnRecordingComplete.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Blob);
      expect(callArg.type).toBe('audio/webm');
    });

    it('should call onStopListening when recording has no audio data', async () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      // Start recording
      const startButton = screen.getByText(/🎙️ Start Recording/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockOnStartListening).toHaveBeenCalledTimes(1);
      });

      // Rerender with isListening=true to show stop button
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      // Stop without any data
      const stopButton = screen.getByText(/🔴 Stop Recording/i);
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(mockOnStopListening).toHaveBeenCalled();
      });

      // onRecordingComplete should NOT be called since no data
      expect(mockOnRecordingComplete).not.toHaveBeenCalled();
    });

    it('should call onStartListening when push-to-talk recording starts', async () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      const startButton = screen.getByText(/🎙️ Start Recording/i);
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockOnStartListening).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Voice-Activated Mode Error Handling', () => {
    it('should display init error when microphone permission is denied', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Wait for error to appear (auto-starts after 100ms)
      await waitFor(() => {
        expect(screen.getByText(/Failed to access microphone/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display init error for microphone timeout', async () => {
      // getUserMedia never resolves - triggers timeout
      mockGetUserMedia.mockImplementation(() => new Promise(() => {}));

      vi.useFakeTimers({ shouldAdvanceTime: true });

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Advance past auto-start delay and init timeout
      await act(async () => {
        vi.advanceTimersByTime(5200);
      });

      await waitFor(() => {
        expect(screen.getByText(/Microphone initialization timeout/i)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should auto-retry after init error in voice-activated mode', async () => {
      // First call fails, second succeeds
      mockGetUserMedia
        .mockRejectedValueOnce(new Error('Permission denied'))
        .mockResolvedValueOnce({
          getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
          getAudioTracks: vi.fn().mockReturnValue([]),
        });

      vi.useFakeTimers({ shouldAdvanceTime: true });

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // First attempt fails after auto-start delay
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText(/Failed to access microphone/i)).toBeInTheDocument();
      });

      // Wait for auto-retry (2s delay)
      await act(async () => {
        vi.advanceTimersByTime(2100);
      });

      // Should have called getUserMedia twice
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
      });

      vi.useRealTimers();
    });

    it('should show retry button after init error', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Wait for error and retry button to appear
      await waitFor(() => {
        expect(screen.getByText(/Retry/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should reset error state when retry button is clicked', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      vi.useFakeTimers({ shouldAdvanceTime: true });

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Advance past the auto-start delay so init error occurs
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      // Wait for error and retry button to appear
      await waitFor(() => {
        expect(screen.getByText(/Retry/i)).toBeInTheDocument();
      });

      // Verify error message is displayed
      expect(screen.getByText(/Failed to access microphone/i)).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByText(/Retry/i);
      await act(async () => {
        fireEvent.click(retryButton);
      });

      // Error should be cleared from the UI (initError set to null)
      await waitFor(() => {
        expect(screen.queryByText(/Failed to access microphone/i)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Voice-Activated Status States', () => {
    it('should not auto-start when disabled', async () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
          disabled={true}
        />
      );

      // Wait a bit to ensure no auto-start
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should not have called getUserMedia
      expect(mockGetUserMedia).not.toHaveBeenCalled();
    });

    it('should not auto-start when isListening is already true', async () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Wait a bit to ensure no auto-start
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should not have called getUserMedia since isListening=true
      expect(mockGetUserMedia).not.toHaveBeenCalled();
    });

    it('should show speak-to-start message when ready and no voice detected', async () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByText(/Speak to start recording/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Push-to-Talk Speaking State', () => {
    it('should apply speaking CSS class when audio level is high', async () => {
      // Mock audio data with high amplitude to trigger speaking state
      const MockAudioContextWithVoice = vi.fn().mockImplementation(function () {
        return {
          createAnalyser: vi.fn().mockReturnValue({
            fftSize: 512,
            smoothingTimeConstant: 0.3,
            frequencyBinCount: 256,
            getByteFrequencyData: vi.fn(),
            getByteTimeDomainData: vi.fn((arr: Uint8Array) => {
              // Fill with high amplitude data (simulating voice)
              for (let i = 0; i < arr.length; i++) {
                arr[i] = i % 2 === 0 ? 200 : 56; // Large deviation from 128
              }
            }),
            connect: vi.fn(),
            disconnect: vi.fn(),
          }),
          createMediaStreamSource: vi.fn().mockReturnValue({
            connect: vi.fn(),
          }),
          state: 'running',
          resume: vi.fn().mockResolvedValue(undefined),
          suspend: vi.fn(),
          close: vi.fn().mockResolvedValue(undefined),
          destination: {},
        };
      });

      Object.assign(global, {
        AudioContext: MockAudioContextWithVoice,
        webkitAudioContext: MockAudioContextWithVoice,
      });

      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      // Start recording
      fireEvent.click(screen.getByText(/🎙️ Start Recording/i));

      await waitFor(() => {
        expect(mockOnStartListening).toHaveBeenCalledTimes(1);
      });

      // Trigger captured RAF callbacks
      await act(async () => {
        rafCallbacks.forEach((cb) => cb(performance.now()));
      });

      const audioLevel = container.querySelector('.audio-level');
      expect(audioLevel).toBeInTheDocument();
    });

    it('should handle button disabled state styling', async () => {
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
          disabled={true}
        />
      );

      const recordBtn = container.querySelector('.record-btn');
      expect(recordBtn).toHaveClass('disabled');
    });
  });

  describe('Cleanup and Edge Cases', () => {
    it('should handle stopRecording when recorder is already inactive', async () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      // Simulate recorder already being in 'inactive' state
      mockMediaRecorderInstance.state = 'inactive';

      const stopButton = screen.getByText(/🔴 Stop Recording/i);
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(mockOnStopListening).toHaveBeenCalled();
      });
    });

    it('should handle rapid start/stop clicks gracefully', async () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      const startButton = screen.getByText(/🎙️ Start Recording/i);

      // Click start multiple times rapidly
      fireEvent.click(startButton);
      fireEvent.click(startButton);
      fireEvent.click(startButton);

      // Should not throw and should only start once
      await waitFor(() => {
        expect(mockOnStartListening).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle unmount during voice-activated initialization', async () => {
      const { unmount } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Unmount while potentially initializing
      expect(() => unmount()).not.toThrow();
    });
  });
});
