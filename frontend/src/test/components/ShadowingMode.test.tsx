import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShadowingMode } from '../../components/SpeakingMode/ShadowingMode';
import type { ShadowingExercise } from '../../components/SpeakingMode/hooks/useShadowingMode';

// Mock the hook — we test component behavior, not hook logic
const mockUseShadowingMode = vi.hoisted(() => vi.fn());

vi.mock('../../components/SpeakingMode/hooks/useShadowingMode', () => ({
  useShadowingMode: mockUseShadowingMode,
}));

// Mock child components
vi.mock('../../components/VoiceRecorder/VoiceRecorder', () => ({
  VoiceRecorder: () => <div data-testid="voice-recorder" />,
}));

vi.mock('../../components/SpeechFeedback/SpeechFeedback', () => ({
  SpeechFeedback: ({ onRetry, onContinue }: { onRetry: () => void; onContinue: () => void }) => (
    <div data-testid="speech-feedback">
      <button onClick={onRetry}>Retry</button>
      <button onClick={onContinue}>Continue</button>
    </div>
  ),
}));

const exercises: ShadowingExercise[] = [
  {
    id: 1,
    title: 'Basic Greeting',
    audio_url: '/audio/greeting.mp3',
    japanese_text: 'おはようございます',
    level: 'beginner',
    duration_seconds: 3,
  },
  {
    id: 2,
    title: 'Self Introduction',
    audio_url: '/audio/intro.mp3',
    japanese_text: '私は学生です',
    level: 'intermediate',
    duration_seconds: 5,
  },
];

const defaultHookValue = {
  exercises,
  selectedExercise: null as ShadowingExercise | null,
  loading: false,
  audioBlob: null as Blob | null,
  showAssessment: false,
  assessmentResult: null as unknown,
  isAssessing: false,
  setSelectedExercise: vi.fn(),
  handleRecordingComplete: vi.fn(),
  handleRetry: vi.fn(),
  handleContinue: vi.fn(),
  playNativeAudio: vi.fn(),
  goBack: vi.fn(),
};

const renderComponent = () => render(<ShadowingMode />);

describe('ShadowingMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseShadowingMode.mockReturnValue({ ...defaultHookValue });
  });

  it('should show loading state while exercises load', () => {
    mockUseShadowingMode.mockReturnValue({ ...defaultHookValue, loading: true });
    renderComponent();
    expect(screen.getByText('Loading exercises...')).toBeInTheDocument();
  });

  it('should render exercise list with title, level and duration', () => {
    renderComponent();
    expect(screen.getByText('Select an Exercise')).toBeInTheDocument();
    expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
    expect(screen.getByText('Self Introduction')).toBeInTheDocument();
    expect(screen.getByText('Level: beginner')).toBeInTheDocument();
    expect(screen.getByText('3s')).toBeInTheDocument();
    expect(screen.getByText('5s')).toBeInTheDocument();
  });

  it('should call setSelectedExercise when an exercise is clicked', () => {
    const setSelectedExercise = vi.fn();
    mockUseShadowingMode.mockReturnValue({ ...defaultHookValue, setSelectedExercise });
    renderComponent();
    fireEvent.click(screen.getByText('Self Introduction'));
    expect(setSelectedExercise).toHaveBeenCalledWith(exercises[1]);
  });

  it('should show empty list gracefully when no exercises exist', () => {
    mockUseShadowingMode.mockReturnValue({ ...defaultHookValue, exercises: [] });
    renderComponent();
    expect(screen.getByText('Select an Exercise')).toBeInTheDocument();
    expect(screen.queryByText('Basic Greeting')).not.toBeInTheDocument();
  });

  describe('when an exercise is selected', () => {
    const setupSelected = (overrides: Partial<typeof defaultHookValue> = {}) => {
      const handlers = {
        setSelectedExercise: vi.fn(),
        handleRecordingComplete: vi.fn(),
        handleRetry: vi.fn(),
        handleContinue: vi.fn(),
        playNativeAudio: vi.fn(),
        goBack: vi.fn(),
        ...overrides,
      };
      mockUseShadowingMode.mockReturnValue({
        ...defaultHookValue,
        selectedExercise: exercises[0],
        ...handlers,
      });
      renderComponent();
      return handlers;
    };

    it('should render exercise detail with japanese text and play button', () => {
      setupSelected();
      expect(screen.getByRole('heading', { name: 'Basic Greeting' })).toBeInTheDocument();
      expect(screen.getByText('おはようございます')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play native audio/i })).toBeInTheDocument();
      expect(screen.getByText('Your Turn - Record Yourself')).toBeInTheDocument();
    });

    it('should call playNativeAudio when play button is clicked', () => {
      const { playNativeAudio } = setupSelected();
      fireEvent.click(screen.getByRole('button', { name: /play native audio/i }));
      expect(playNativeAudio).toHaveBeenCalledTimes(1);
    });

    it('should call goBack when back button is clicked', () => {
      const { goBack } = setupSelected();
      fireEvent.click(screen.getByRole('button', { name: /back to list/i }));
      expect(goBack).toHaveBeenCalledTimes(1);
    });

    it('should show VoiceRecorder before assessment is available', () => {
      setupSelected();
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
      expect(screen.queryByTestId('speech-feedback')).not.toBeInTheDocument();
    });

    it('should show assessing message while transcription is in progress', () => {
      // Component keeps recorder mounted until showAssessment flips true
      setupSelected({ isAssessing: true });
      expect(screen.getByText(/transcribing and analyzing/i)).toBeInTheDocument();
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
      expect(screen.queryByTestId('speech-feedback')).not.toBeInTheDocument();
    });

    it('should render SpeechFeedback when assessment is shown', () => {
      setupSelected({ showAssessment: true, assessmentResult: { score: 85 } });
      expect(screen.getByTestId('speech-feedback')).toBeInTheDocument();
      expect(screen.queryByTestId('voice-recorder')).not.toBeInTheDocument();
    });

    it('should call handleRetry when retry is clicked in feedback', () => {
      const { handleRetry } = setupSelected({ showAssessment: true, assessmentResult: { score: 85 } });
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should call handleContinue when continue is clicked in feedback', () => {
      const { handleContinue } = setupSelected({ showAssessment: true, assessmentResult: { score: 85 } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(handleContinue).toHaveBeenCalledTimes(1);
    });

    it('should not render feedback when assessment result exists but is not shown', () => {
      setupSelected({ assessmentResult: { score: 85 }, showAssessment: false });
      expect(screen.queryByTestId('speech-feedback')).not.toBeInTheDocument();
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    });
  });
});
