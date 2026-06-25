import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecordingControls } from '../../../components/VoiceRecorder/RecordingControls';

const mockUseVoiceRecorder = vi.fn();

vi.mock('../../../hooks/useVoiceRecorder', () => ({
  useVoiceRecorder: (...args: any[]) => mockUseVoiceRecorder(...args),
}));

describe('RecordingControls', () => {
  const defaultProps = {
    onRecordingComplete: vi.fn(),
    isListening: false,
    onStartListening: vi.fn(),
    onStopListening: vi.fn(),
    mode: 'push-to-talk' as const,
    disabled: false,
  };

  const defaultHookReturn = {
    audioLevel: 0,
    isSpeaking: false,
    silenceTimer: 0,
    displaySilenceTimer: 0,
    isReady: true,
    hasDetectedVoiceState: false,
    isProcessing: false,
    initError: null,
    isPushToTalk: true,
    startPushToTalk: vi.fn(),
    stopRecording: vi.fn(),
    restartRecording: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVoiceRecorder.mockReturnValue(defaultHookReturn);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Push-to-Talk Mode', () => {
    it('should render start recording button when not listening', () => {
      render(<RecordingControls {...defaultProps} />);
      expect(screen.getByText('🎙️ Start Recording')).toBeInTheDocument();
    });

    it('should render stop recording button when listening', () => {
      render(<RecordingControls {...defaultProps} isListening={true} />);
      expect(screen.getByText('🔴 Stop Recording')).toBeInTheDocument();
    });

    it('should call startPushToTalk when start button clicked', () => {
      const startPushToTalk = vi.fn();
      mockUseVoiceRecorder.mockReturnValue({
        ...defaultHookReturn,
        startPushToTalk,
      });

      render(<RecordingControls {...defaultProps} />);
      fireEvent.click(screen.getByText('🎙️ Start Recording'));
      expect(startPushToTalk).toHaveBeenCalled();
    });

    it('should call stopRecording when stop button clicked', () => {
      const stopRecording = vi.fn();
      mockUseVoiceRecorder.mockReturnValue({
        ...defaultHookReturn,
        stopRecording,
      });

      render(<RecordingControls {...defaultProps} isListening={true} />);
      fireEvent.click(screen.getByText('🔴 Stop Recording'));
      expect(stopRecording).toHaveBeenCalled();
    });

    it('should show disabled state when disabled prop is true', () => {
      render(<RecordingControls {...defaultProps} disabled={true} />);
      expect(screen.getByText('⏳ Wait...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should render push-to-talk instructions', () => {
      render(<RecordingControls {...defaultProps} />);
      expect(screen.getByText('Click to start/stop recording')).toBeInTheDocument();
    });

    it('should apply disabled class when disabled', () => {
      render(<RecordingControls {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button.classList.contains('disabled')).toBe(true);
    });

    it('should apply recording class when listening', () => {
      render(<RecordingControls {...defaultProps} isListening={true} />);
      const button = screen.getByRole('button');
      expect(button.classList.contains('recording')).toBe(true);
    });

    it('should not call handler when disabled button clicked', () => {
      const startPushToTalk = vi.fn();
      mockUseVoiceRecorder.mockReturnValue({
        ...defaultHookReturn,
        startPushToTalk,
      });

      render(<RecordingControls {...defaultProps} disabled={true} />);
      fireEvent.click(screen.getByRole('button'));
      expect(startPushToTalk).not.toHaveBeenCalled();
    });
  });

  describe('Voice-Activated Mode', () => {
    const voiceActivatedProps = {
      ...defaultProps,
      mode: 'voice-activated' as const,
    };

    const voiceActivatedHookReturn = {
      ...defaultHookReturn,
      isPushToTalk: false,
    };

    it('should show initializing message when not ready', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...voiceActivatedHookReturn,
        isReady: false,
      });
      render(<RecordingControls {...voiceActivatedProps} />);
      expect(screen.getByText('Initializing microphone (auto-retrying)...')).toBeInTheDocument();
    });

    it('should show speak prompt when ready but no voice detected', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...voiceActivatedHookReturn,
        isReady: true,
        hasDetectedVoiceState: false,
      });
      render(<RecordingControls {...voiceActivatedProps} />);
      expect(screen.getByText('👂 Speak to start recording...')).toBeInTheDocument();
    });

    it('should show recording timer when voice detected', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...voiceActivatedHookReturn,
        isReady: true,
        hasDetectedVoiceState: true,
        silenceTimer: 0,
        displaySilenceTimer: 0,
      });
      render(<RecordingControls {...voiceActivatedProps} />);
      expect(screen.getByText(/Recording.../)).toBeInTheDocument();
    });

    it('should show auto-stop countdown during silence', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...voiceActivatedHookReturn,
        isReady: true,
        hasDetectedVoiceState: true,
        silenceTimer: 1500,
        displaySilenceTimer: 1500,
      });
      render(<RecordingControls {...voiceActivatedProps} />);
      expect(screen.getByText(/Auto-stop in/)).toBeInTheDocument();
    });

    it('should show error message when init fails', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...voiceActivatedHookReturn,
        initError: 'Microphone denied',
      });
      render(<RecordingControls {...voiceActivatedProps} />);
      expect(screen.getByText('❌ Microphone denied')).toBeInTheDocument();
    });

    it('should show retry button when init error occurs', () => {
      const restartRecording = vi.fn();
      mockUseVoiceRecorder.mockReturnValue({
        ...voiceActivatedHookReturn,
        initError: 'Microphone denied',
        restartRecording,
      });
      render(<RecordingControls {...voiceActivatedProps} />);
      const retryButton = screen.getByText('🎤 Retry');
      expect(retryButton).toBeInTheDocument();
      fireEvent.click(retryButton);
      expect(restartRecording).toHaveBeenCalled();
    });

    it('should show new recording button after processing', () => {
      const restartRecording = vi.fn();
      mockUseVoiceRecorder.mockReturnValue({
        ...voiceActivatedHookReturn,
        isProcessing: true,
        restartRecording,
      });
      render(<RecordingControls {...voiceActivatedProps} />);
      expect(screen.getByText('🎤 Start New Recording')).toBeInTheDocument();
    });

    it('should render voice-activated instructions', () => {
      mockUseVoiceRecorder.mockReturnValue(voiceActivatedHookReturn);
      render(<RecordingControls {...voiceActivatedProps} />);
      expect(screen.getByText("Just start speaking - I'll detect your voice automatically")).toBeInTheDocument();
    });
  });

  describe('Audio Meter', () => {
    it('should render audio meter', () => {
      const { container } = render(<RecordingControls {...defaultProps} />);
      expect(container.querySelector('.audio-meter')).toBeInTheDocument();
    });

    it('should render audio level bar with correct width', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...defaultHookReturn,
        audioLevel: 25,
      });
      const { container } = render(<RecordingControls {...defaultProps} />);
      const levelBar = container.querySelector('.audio-level');
      expect(levelBar).toHaveAttribute('style', 'width: 50%;');
    });

    it('should cap audio level at 100%', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...defaultHookReturn,
        audioLevel: 100,
      });
      const { container } = render(<RecordingControls {...defaultProps} />);
      const levelBar = container.querySelector('.audio-level');
      expect(levelBar).toHaveAttribute('style', 'width: 100%;');
    });

    it('should apply speaking class when isSpeaking is true', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...defaultHookReturn,
        isSpeaking: true,
      });
      const { container } = render(<RecordingControls {...defaultProps} />);
      const levelBar = container.querySelector('.audio-level');
      expect(levelBar?.classList.contains('speaking')).toBe(true);
    });

    it('should apply active class when hasDetectedVoiceState is true', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...defaultHookReturn,
        hasDetectedVoiceState: true,
      });
      const { container } = render(<RecordingControls {...defaultProps} />);
      const levelBar = container.querySelector('.audio-level');
      expect(levelBar?.classList.contains('active')).toBe(true);
    });
  });

  describe('Props passing to hook', () => {
    it('should pass all props to useVoiceRecorder', () => {
      const onRecordingComplete = vi.fn();
      render(
        <RecordingControls
          onRecordingComplete={onRecordingComplete}
          isListening={true}
          onStartListening={defaultProps.onStartListening}
          onStopListening={defaultProps.onStopListening}
          mode="voice-activated"
          disabled={true}
        />
      );
      expect(mockUseVoiceRecorder).toHaveBeenCalledWith({
        onRecordingComplete,
        isListening: true,
        onStartListening: defaultProps.onStartListening,
        onStopListening: defaultProps.onStopListening,
        mode: 'voice-activated',
        disabled: true,
      });
    });

    it('should pass default disabled=false to hook', () => {
      render(<RecordingControls {...defaultProps} />);
      const call = mockUseVoiceRecorder.mock.calls[0][0];
      expect(call.disabled).toBe(false);
    });
  });

  describe('Speaking Styling', () => {
    it('should apply speaking class to button when speaking in push-to-talk', () => {
      mockUseVoiceRecorder.mockReturnValue({
        ...defaultHookReturn,
        isSpeaking: true,
      });
      render(<RecordingControls {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button.classList.contains('speaking')).toBe(true);
    });
  });
});
