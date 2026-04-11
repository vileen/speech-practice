import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceRecorder } from '../../components/VoiceRecorder/VoiceRecorder';

describe('VoiceRecorder - Recording Flow', () => {
  const mockOnRecordingComplete = vi.fn();
  const mockOnStartListening = vi.fn();
  const mockOnStopListening = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock MediaRecorder
    const mockMediaRecorder = {
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: null,
      onstop: null,
      state: 'inactive',
    };
    
    Object.defineProperty(global, 'MediaRecorder', {
      value: vi.fn().mockImplementation(() => mockMediaRecorder),
      writable: true,
      configurable: true,
    });
    
    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
          getAudioTracks: vi.fn().mockReturnValue([]),
        }),
      },
      writable: true,
      configurable: true,
    });
    
    // Mock AudioContext
    const MockAudioContext = vi.fn().mockImplementation(function() {
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
    
    Object.defineProperty(global, 'AudioContext', {
      value: MockAudioContext,
      writable: true,
      configurable: true,
    });
    
    Object.defineProperty(global, 'webkitAudioContext', {
      value: MockAudioContext,
      writable: true,
      configurable: true,
    });
    
    // Mock requestAnimationFrame
    let rafId = 0;
    Object.defineProperty(global, 'requestAnimationFrame', {
      value: vi.fn().mockImplementation(() => {
        rafId++;
        return rafId;
      }),
      writable: true,
      configurable: true,
    });
    
    Object.defineProperty(global, 'cancelAnimationFrame', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Handling', () => {
    it('should handle microphone permission denial gracefully', async () => {
      // Mock permission denial
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
        writable: true,
        configurable: true,
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      // Click start
      fireEvent.click(screen.getAllByText(/Start Recording/i)[0]);
      
      // Wait for error handling
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error starting push-to-talk:',
          expect.any(Error)
        );
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle missing mediaDevices API', async () => {
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      // Click start
      fireEvent.click(screen.getAllByText(/Start Recording/i)[0]);
      
      // Should handle gracefully without throwing
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle audio context resume failure', async () => {
      const MockAudioContext = vi.fn().mockImplementation(function() {
        return {
          createAnalyser: vi.fn().mockReturnValue({
            fftSize: 512,
            smoothingTimeConstant: 0.3,
            frequencyBinCount: 256,
            getByteFrequencyData: vi.fn(),
            getByteTimeDomainData: vi.fn(),
            connect: vi.fn(),
            disconnect: vi.fn(),
          }),
          createMediaStreamSource: vi.fn().mockReturnValue({
            connect: vi.fn(),
          }),
          state: 'suspended',
          resume: vi.fn().mockRejectedValue(new Error('Resume failed')),
          close: vi.fn().mockResolvedValue(undefined),
          destination: {},
        };
      });
      
      Object.defineProperty(global, 'AudioContext', {
        value: MockAudioContext,
        writable: true,
        configurable: true,
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      // Click start
      fireEvent.click(screen.getAllByText(/Start Recording/i)[0]);
      
      // Should handle resume failure gracefully
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Disabled State', () => {
    it('should show wait state and disable interaction when disabled prop is true', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
          disabled={true}
        />
      );
      
      // Should show "Wait..." instead of start button
      expect(screen.getByText(/Wait/i)).toBeInTheDocument();
      
      // onStartListening should not be called
      expect(mockOnStartListening).not.toHaveBeenCalled();
    });

    it('should stop recording when disabled changes to true while listening', async () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
          disabled={false}
        />
      );
      
      // Change disabled to true
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
          disabled={true}
        />
      );
      
      // Should trigger stop
      await waitFor(() => {
        expect(mockOnStopListening).toHaveBeenCalled();
      });
    });
  });

  describe('Mode Switching', () => {
    it('should stop recording when switching from voice-activated to push-to-talk', async () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );
      
      // Switch to push-to-talk while listening
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      // Should have stopped the recording
      await waitFor(() => {
        expect(mockOnStopListening).toHaveBeenCalled();
      });
    });

    it('should not stop when switching from push-to-talk to voice-activated', async () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      vi.clearAllMocks();
      
      // Switch to voice-activated
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );
      
      // Should NOT have stopped (only stops when going from VAD to push-to-talk)
      expect(mockOnStopListening).not.toHaveBeenCalled();
    });
  });

  describe('Audio Meter UI', () => {
    it('should render audio meter with correct structure', () => {
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      const audioMeter = container.querySelector('.audio-meter');
      const audioLevel = container.querySelector('.audio-level');
      
      expect(audioMeter).toBeInTheDocument();
      expect(audioLevel).toBeInTheDocument();
    });

    it('should render voice-activated mode UI elements', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );
      
      // Should show voice-activated instructions
      expect(screen.getByText(/Just start speaking/i)).toBeInTheDocument();
    });

    it('should render push-to-talk UI elements', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      // Should show push-to-talk instructions
      expect(screen.getByText(/Click to start\/stop recording/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Start Recording/i)[0]).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should show stop button when listening in push-to-talk mode', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      expect(screen.getAllByText(/Stop Recording/i)[0]).toBeInTheDocument();
    });

    it('should apply recording CSS class when listening', () => {
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      const recordBtn = container.querySelector('.record-btn');
      expect(recordBtn).toHaveClass('recording');
    });
  });

  describe('Cleanup', () => {
    it('should unmount without errors while listening', () => {
      const { unmount } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      expect(() => unmount()).not.toThrow();
    });

    it('should unmount without errors in voice-activated mode', () => {
      const { unmount } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );
      
      expect(() => unmount()).not.toThrow();
    });
  });
});
