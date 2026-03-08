import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceRecorder } from '../../components/VoiceRecorder/VoiceRecorder';

describe('VoiceRecorder', () => {
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
    
    Object.assign(global, {
      MediaRecorder: vi.fn().mockImplementation(() => mockMediaRecorder),
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
    Object.assign(global, {
      AudioContext: vi.fn().mockImplementation(() => ({
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
          disconnect: vi.fn(),
        }),
        state: 'running',
        resume: vi.fn().mockResolvedValue(undefined),
        suspend: vi.fn(),
        close: vi.fn(),
        destination: {},
      })),
      webkitAudioContext: vi.fn(),
    });
    
    // Mock requestAnimationFrame
    let rafId = 0;
    Object.assign(global, {
      requestAnimationFrame: vi.fn().mockImplementation(() => {
        rafId++;
        return rafId;
      }),
      cancelAnimationFrame: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render in push-to-talk mode', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      expect(screen.getAllByText(/Start Recording/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Click to start\/stop recording/i)).toBeInTheDocument();
    });

    it('should render in voice-activated mode', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );
      expect(screen.getByText(/Just start speaking/i)).toBeInTheDocument();
    });

    it('should render audio meter', () => {
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      expect(container.querySelector('.audio-meter')).toBeInTheDocument();
    });

    it('should show disabled state', () => {
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
      expect(screen.getByText(/Wait/i)).toBeInTheDocument();
    });
  });

  describe('Push-to-Talk Mode', () => {
    it('should show Start Recording button when not listening', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      expect(screen.getAllByText(/Start Recording/i)[0]).toBeInTheDocument();
    });

    it('should show Stop Recording button when listening', () => {
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

    it('should not show start button when disabled', () => {
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
      expect(screen.queryByText(/Start Recording/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Wait/i)).toBeInTheDocument();
    });

    it('should have clickable start button', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      const button = screen.getAllByText(/Start Recording/i)[0];
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
    });

    it('should call onStopListening when stop recording clicked', async () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      const button = screen.getAllByText(/Stop Recording/i)[0];
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockOnStopListening).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Voice-Activated Mode', () => {
    it('should show initializing message', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );
      expect(screen.getByText(/Initializing/i)).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('should switch from push-to-talk to voice-activated', () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );
      
      expect(screen.getAllByText(/Start Recording/i)[0]).toBeInTheDocument();
      
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );
      
      expect(screen.getByText(/Initializing/i)).toBeInTheDocument();
    });

    it('should stop listening when disabled changes to true', () => {
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
      
      expect(mockOnStopListening).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing mediaDevices', () => {
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(() => {
        render(
          <VoiceRecorder
            onRecordingComplete={mockOnRecordingComplete}
            isListening={false}
            onStartListening={mockOnStartListening}
            onStopListening={mockOnStopListening}
            mode="push-to-talk"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should unmount without errors', () => {
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
  });
});
