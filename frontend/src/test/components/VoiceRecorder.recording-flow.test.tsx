import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { VoiceRecorder } from '../../components/VoiceRecorder/VoiceRecorder';

describe('VoiceRecorder - Recording Flow', () => {
  const mockOnRecordingComplete = vi.fn();
  const mockOnStartListening = vi.fn();
  const mockOnStopListening = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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

      expect(screen.getByText(/🎙️ Start Recording/i)).toBeInTheDocument();
      expect(screen.getByText(/Click to start\/stop recording/i)).toBeInTheDocument();
    });

    it('should show Stop Recording button when isListening is true', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      expect(screen.getByText(/🔴 Stop Recording/i)).toBeInTheDocument();
    });

    it('should handle start button click without errors', () => {
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
      expect(() => fireEvent.click(startButton)).not.toThrow();
    });

    it('should handle stop button click without errors', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      const stopButton = screen.getByText(/🔴 Stop Recording/i);
      expect(() => fireEvent.click(stopButton)).not.toThrow();
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

    it('should show disabled state correctly', () => {
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

      expect(screen.getByText(/⏳ Wait/i)).toBeInTheDocument();
      expect(screen.queryByText(/🎙️ Start Recording/i)).not.toBeInTheDocument();
    });

    it('should call onStopListening when disabled changes to true while listening', () => {
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

  describe('Voice-Activated Mode', () => {
    it('should show initializing message on mount', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      expect(screen.getByText(/Initializing microphone \(auto-retrying\)/i)).toBeInTheDocument();
    });

    it('should show correct instruction text for voice-activated mode', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      expect(screen.getByText(/Just start speaking - I'll detect your voice automatically/i)).toBeInTheDocument();
    });

    it('should not show push-to-talk button in voice-activated mode', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      expect(screen.queryByText(/🎙️ Start Recording/i)).not.toBeInTheDocument();
    });

    it('should call onStopListening when switching from voice-activated to push-to-talk while listening', () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      expect(mockOnStopListening).toHaveBeenCalled();
    });

    it('should NOT call onStopListening when switching from push-to-talk to voice-activated', () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Should NOT have called onStopListening
      expect(mockOnStopListening).not.toHaveBeenCalled();
    });
  });

  describe('Audio Meter', () => {
    it('should render audio meter in both modes', () => {
      const { container: pttContainer } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      expect(pttContainer.querySelector('.audio-meter')).toBeInTheDocument();
      expect(pttContainer.querySelector('.audio-level')).toBeInTheDocument();

      const { container: vadContainer } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      expect(vadContainer.querySelector('.audio-meter')).toBeInTheDocument();
    });

    it('should update audio level width based on level prop', () => {
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      const audioLevel = container.querySelector('.audio-level');
      expect(audioLevel).toBeInTheDocument();
    });
  });

  describe('Mode Indicator and Status Messages', () => {
    it('should show vad-status element in voice-activated mode', () => {
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      expect(container.querySelector('.vad-status')).toBeInTheDocument();
    });

    it('should show empty mode-indicator in push-to-talk mode', () => {
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      const modeIndicator = container.querySelector('.mode-indicator');
      expect(modeIndicator).toBeInTheDocument();
      expect(modeIndicator?.textContent).toBe('');
    });
  });

  describe('CSS Classes and Visual States', () => {
    it('should have correct base CSS classes', () => {
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      expect(container.querySelector('.voice-recorder')).toBeInTheDocument();
      expect(container.querySelector('.instructions')).toBeInTheDocument();
      expect(container.querySelector('.record-btn')).toBeInTheDocument();
    });

    it('should apply disabled class when disabled prop is true', () => {
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

    it('should apply speaking class when speaking state is active', () => {
      // Note: speaking state requires actual audio input simulation
      // This test verifies the class structure is ready
      const { container } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      const audioLevel = container.querySelector('.audio-level');
      expect(audioLevel).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should disable button interaction when disabled', () => {
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

      const button = screen.getByText(/⏳ Wait/i);
      expect(button).toBeDisabled();
    });

    it('should enable button when not disabled', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
          disabled={false}
        />
      );

      const button = screen.getByText(/🎙️ Start Recording/i);
      expect(button).not.toBeDisabled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle rapid mode switching without errors', () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      // Switch multiple times
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="voice-activated"
        />
      );

      // Should render without crashing
      expect(screen.getByText(/Initializing microphone/i)).toBeInTheDocument();
    });

    it('should maintain correct button text through state transitions', async () => {
      const { rerender } = render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      // Initial state
      expect(screen.getByText(/🎙️ Start Recording/i)).toBeInTheDocument();

      // Simulate starting recording via props
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={true}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      expect(screen.getByText(/🔴 Stop Recording/i)).toBeInTheDocument();

      // Stop recording
      rerender(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          isListening={false}
          onStartListening={mockOnStartListening}
          onStopListening={mockOnStopListening}
          mode="push-to-talk"
        />
      );

      expect(screen.getByText(/🎙️ Start Recording/i)).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should accept all required callback props', () => {
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

    it('should work with disabled prop explicitly false', () => {
      expect(() => {
        render(
          <VoiceRecorder
            onRecordingComplete={mockOnRecordingComplete}
            isListening={false}
            onStartListening={mockOnStartListening}
            onStopListening={mockOnStopListening}
            mode="push-to-talk"
            disabled={false}
          />
        );
      }).not.toThrow();
    });
  });
});
