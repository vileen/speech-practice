import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VoiceRecorder } from '../../../components/VoiceRecorder/VoiceRecorder';

const mockRecordingControls = vi.fn();

vi.mock('../../../components/VoiceRecorder/RecordingControls', () => ({
  RecordingControls: (props: unknown) => {
    mockRecordingControls(props);
    return <div data-testid="recording-controls">RecordingControls</div>;
  },
}));

describe('VoiceRecorder wrapper', () => {
  const defaultProps = {
    onRecordingComplete: vi.fn(),
    isListening: false,
    onStartListening: vi.fn(),
    onStopListening: vi.fn(),
    mode: 'push-to-talk' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the underlying RecordingControls component', () => {
    render(<VoiceRecorder {...defaultProps} />);
    expect(screen.getByTestId('recording-controls')).toBeInTheDocument();
  });

  it('passes all required props through to RecordingControls', () => {
    render(<VoiceRecorder {...defaultProps} />);
    expect(mockRecordingControls).toHaveBeenCalledWith(
      expect.objectContaining({
        onRecordingComplete: defaultProps.onRecordingComplete,
        isListening: defaultProps.isListening,
        onStartListening: defaultProps.onStartListening,
        onStopListening: defaultProps.onStopListening,
        mode: defaultProps.mode,
      })
    );
  });

  it('passes the disabled prop through to RecordingControls', () => {
    render(<VoiceRecorder {...defaultProps} disabled={true} />);
    const call = mockRecordingControls.mock.calls[0][0] as Record<string, unknown>;
    expect(call.disabled).toBe(true);
  });

  it('defaults disabled to undefined when not provided', () => {
    render(<VoiceRecorder {...defaultProps} />);
    const call = mockRecordingControls.mock.calls[0][0] as Record<string, unknown>;
    expect(call.disabled).toBeUndefined();
  });

  it('re-renders with updated props when they change', () => {
    const { rerender } = render(<VoiceRecorder {...defaultProps} isListening={false} />);
    expect(mockRecordingControls).toHaveBeenLastCalledWith(
      expect.objectContaining({ isListening: false })
    );

    rerender(<VoiceRecorder {...defaultProps} isListening={true} />);
    expect(mockRecordingControls).toHaveBeenLastCalledWith(
      expect.objectContaining({ isListening: true })
    );
  });

  it('does not throw when unmounted', () => {
    const { unmount } = render(<VoiceRecorder {...defaultProps} />);
    expect(() => unmount()).not.toThrow();
  });
});
