import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SpeechFeedback } from '../../components/SpeechFeedback/SpeechFeedback';
import type { AssessmentResult } from '../../hooks/useSpeechAssessment';

function makeAssessment(overrides: Partial<AssessmentResult> = {}): AssessmentResult {
  return {
    transcript: 'こんにちは',
    accuracyScore: 95,
    feedback: {
      overall: 'Great pronunciation!',
      errors: [],
      suggestions: [],
    },
    expected: 'こんにちは',
    expectedRomaji: 'konnichiwa',
    ...overrides,
  };
}

describe('SpeechFeedback', () => {
  const playMock = vi.fn();
  const pauseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global Audio constructor
    vi.stubGlobal(
      'Audio',
      vi.fn(function (this: any) {
        this.pause = pauseMock;
        this.play = playMock.mockResolvedValue(undefined);
        this.onplay = null;
        this.onended = null;
        this.onpause = null;
      })
    );

    // Mock URL.createObjectURL (jsdom doesn't implement it)
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:mock-audio-url'),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('score display', () => {
    it('renders the accuracy score with percent sign', () => {
      render(<SpeechFeedback assessment={makeAssessment({ accuracyScore: 87 })} />);
      expect(screen.getByText('87')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('shows excellent message for scores >= 90', () => {
      render(<SpeechFeedback assessment={makeAssessment({ accuracyScore: 92 })} />);
      expect(screen.getByText(/Excellent/i)).toBeInTheDocument();
    });

    it('shows great job message for scores 80-89', () => {
      render(<SpeechFeedback assessment={makeAssessment({ accuracyScore: 85 })} />);
      expect(screen.getByText(/Great job/i)).toBeInTheDocument();
    });

    it('shows good attempt message for scores 60-79', () => {
      render(<SpeechFeedback assessment={makeAssessment({ accuracyScore: 70 })} />);
      expect(screen.getByText(/Good attempt/i)).toBeInTheDocument();
    });

    it('shows keep practicing message for scores < 60', () => {
      render(<SpeechFeedback assessment={makeAssessment({ accuracyScore: 45 })} />);
      expect(screen.getByText(/Keep practicing/i)).toBeInTheDocument();
    });

    it('displays the overall feedback text', () => {
      render(
        <SpeechFeedback assessment={makeAssessment({ feedback: { overall: 'Needs work on pitch.', errors: [], suggestions: [] } })} />
      );
      expect(screen.getByText('Needs work on pitch.')).toBeInTheDocument();
    });
  });

  describe('transcription comparison', () => {
    it('shows the user transcript', () => {
      render(<SpeechFeedback assessment={makeAssessment({ transcript: 'さようなら' })} />);
      expect(screen.getByText('さようなら')).toBeInTheDocument();
    });

    it('shows fallback text when no speech was detected', () => {
      render(<SpeechFeedback assessment={makeAssessment({ transcript: '' })} />);
      expect(screen.getByText('(no speech detected)')).toBeInTheDocument();
    });

    it('shows the expected text and romaji', () => {
      render(
        <SpeechFeedback assessment={makeAssessment({ expected: 'ありがとう', expectedRomaji: 'arigatou' })} />
      );
      expect(screen.getByText('ありがとう')).toBeInTheDocument();
      expect(screen.getByText('arigatou')).toBeInTheDocument();
    });

    it('hides romaji line when expectedRomaji is not provided', () => {
      const assessment = makeAssessment();
      delete assessment.expectedRomaji;
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.queryByText('konnichiwa')).not.toBeInTheDocument();
    });
  });

  describe('audio playback', () => {
    it('does not render playback button when audioBlob is missing', () => {
      render(<SpeechFeedback assessment={makeAssessment()} audioBlob={null} />);
      expect(screen.queryByRole('button', { name: /play your recording/i })).not.toBeInTheDocument();
    });

    it('plays recording when playback button is clicked', () => {
      render(<SpeechFeedback assessment={makeAssessment()} audioBlob={new Blob(['audio'])} />);
      fireEvent.click(screen.getByRole('button', { name: /play your recording/i }));
      expect(playMock).toHaveBeenCalledTimes(1);
    });

    it('shows Pause label while audio is playing', () => {
      render(<SpeechFeedback assessment={makeAssessment()} audioBlob={new Blob(['audio'])} />);
      const button = screen.getByRole('button', { name: /play your recording/i });
      fireEvent.click(button);
      // Simulate the audio onplay event firing
      const audioInstance = (window.Audio as any).mock.instances[0];
      act(() => audioInstance.onplay());
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('resumes Play label when audio ends', () => {
      render(<SpeechFeedback assessment={makeAssessment()} audioBlob={new Blob(['audio'])} />);
      fireEvent.click(screen.getByRole('button', { name: /play your recording/i }));
      const audioInstance = (window.Audio as any).mock.instances[0];
      act(() => audioInstance.onplay());
      act(() => audioInstance.onended());
      expect(screen.getByRole('button', { name: /play your recording/i })).toBeInTheDocument();
    });

    it('pauses previous audio instance before starting a new one', () => {
      render(<SpeechFeedback assessment={makeAssessment()} audioBlob={new Blob(['audio'])} />);
      const button = screen.getByRole('button', { name: /play your recording/i });
      fireEvent.click(button);
      fireEvent.click(button);
      // First instance paused on second click
      expect(pauseMock).toHaveBeenCalledTimes(1);
      expect(playMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('error details', () => {
    it('renders omission errors with expected text', () => {
      render(
        <SpeechFeedback
          assessment={makeAssessment({
            feedback: {
              overall: 'ok',
              errors: [{ type: 'omission', expected: 'を', actual: '', position: 3 }],
              suggestions: [],
            },
          })}
        />
      );
      expect(screen.getByText(/Missing:/i)).toBeInTheDocument();
      expect(screen.getByText('を')).toBeInTheDocument();
    });

    it('renders insertion errors with actual text', () => {
      render(
        <SpeechFeedback
          assessment={makeAssessment({
            feedback: {
              overall: 'ok',
              errors: [{ type: 'insertion', expected: '', actual: 'が', position: 1 }],
              suggestions: [],
            },
          })}
        />
      );
      expect(screen.getByText(/Extra:/i)).toBeInTheDocument();
      expect(screen.getByText('が')).toBeInTheDocument();
    });

    it('renders substitution errors with both texts', () => {
      render(
        <SpeechFeedback
          assessment={makeAssessment({
            feedback: {
              overall: 'ok',
              errors: [{ type: 'substitution', expected: 'は', actual: 'わ', position: 0 }],
              suggestions: [],
            },
          })}
        />
      );
      expect(screen.getByText(/Different:/i)).toBeInTheDocument();
      expect(screen.getByText('は')).toBeInTheDocument();
      expect(screen.getByText('わ')).toBeInTheDocument();
    });

    it('hides errors section when there are no errors', () => {
      render(<SpeechFeedback assessment={makeAssessment()} />);
      expect(screen.queryByText(/Areas to improve/i)).not.toBeInTheDocument();
    });
  });

  describe('suggestions', () => {
    it('renders suggestions list when present', () => {
      render(
        <SpeechFeedback
          assessment={makeAssessment({
            feedback: {
              overall: 'ok',
              errors: [],
              suggestions: ['Work on the long vowels', 'Slow down a bit'],
            },
          })}
        />
      );
      expect(screen.getByText(/Tips:/i)).toBeInTheDocument();
      expect(screen.getByText('Work on the long vowels')).toBeInTheDocument();
      expect(screen.getByText('Slow down a bit')).toBeInTheDocument();
    });

    it('hides suggestions section when empty', () => {
      render(<SpeechFeedback assessment={makeAssessment()} />);
      expect(screen.queryByText(/Tips:/i)).not.toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('calls onRetry when Try Again is clicked', () => {
      const onRetry = vi.fn();
      render(<SpeechFeedback assessment={makeAssessment()} onRetry={onRetry} />);
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onContinue when Continue is clicked', () => {
      const onContinue = vi.fn();
      render(<SpeechFeedback assessment={makeAssessment()} onContinue={onContinue} />);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('hides retry button when onRetry is not provided', () => {
      render(<SpeechFeedback assessment={makeAssessment()} onContinue={vi.fn()} />);
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('hides continue button when onContinue is not provided', () => {
      render(<SpeechFeedback assessment={makeAssessment()} onRetry={vi.fn()} />);
      expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument();
    });
  });
});
