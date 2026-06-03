import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SpeechFeedback } from '../../components/SpeechFeedback/SpeechFeedback';
import type { AssessmentResult } from '../../hooks/useSpeechAssessment';

describe('SpeechFeedback', () => {
  const mockOnRetry = vi.fn();
  const mockOnContinue = vi.fn();

  const baseAssessment: AssessmentResult = {
    transcript: 'こんにちは',
    accuracyScore: 85,
    feedback: {
      overall: 'Good pronunciation overall.',
      errors: [],
      suggestions: [],
    },
    expected: 'こんにちは',
    expectedRomaji: 'konnichiwa',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Score Display', () => {
    it('should render excellent score (>= 90)', () => {
      const assessment = {
        ...baseAssessment,
        accuracyScore: 95,
        feedback: { ...baseAssessment.feedback, overall: 'Excellent!' },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('🌟 Excellent!')).toBeInTheDocument();
      expect(screen.getByText('Excellent!')).toBeInTheDocument();
    });

    it('should render good score (80-89)', () => {
      const assessment = {
        ...baseAssessment,
        accuracyScore: 85,
        feedback: { ...baseAssessment.feedback, overall: 'Very good!' },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('✨ Great job!')).toBeInTheDocument();
      expect(screen.getByText('Very good!')).toBeInTheDocument();
    });

    it('should render fair score (60-79)', () => {
      const assessment = {
        ...baseAssessment,
        accuracyScore: 70,
        feedback: { ...baseAssessment.feedback, overall: 'Fair attempt.' },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('👍 Good attempt!')).toBeInTheDocument();
      expect(screen.getByText('Fair attempt.')).toBeInTheDocument();
    });

    it('should render needs-work score (< 60)', () => {
      const assessment = {
        ...baseAssessment,
        accuracyScore: 45,
        feedback: { ...baseAssessment.feedback, overall: 'Needs more practice.' },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('💪 Keep practicing!')).toBeInTheDocument();
      expect(screen.getByText('Needs more practice.')).toBeInTheDocument();
    });
  });

  describe('Audio Playback', () => {
    it('should render play button when audioBlob is provided', () => {
      const blob = new Blob(['audio'], { type: 'audio/webm' });
      render(<SpeechFeedback assessment={baseAssessment} audioBlob={blob} />);
      expect(screen.getByText('▶ Play Your Recording')).toBeInTheDocument();
    });

    it('should not render play button when audioBlob is null', () => {
      render(<SpeechFeedback assessment={baseAssessment} audioBlob={null} />);
      expect(screen.queryByText('▶ Play Your Recording')).not.toBeInTheDocument();
    });

    it('should not render play button when audioBlob is undefined', () => {
      render(<SpeechFeedback assessment={baseAssessment} />);
      expect(screen.queryByText('▶ Play Your Recording')).not.toBeInTheDocument();
    });

    it('should play audio when button is clicked', () => {
      const mockAudio = {
        play: vi.fn(),
        pause: vi.fn(),
        onplay: null as (() => void) | null,
        onended: null as (() => void) | null,
        onpause: null as (() => void) | null,
      };
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      const mockRevokeObjectURL = vi.fn();

      vi.stubGlobal('Audio', vi.fn(function() { return mockAudio; }));
      vi.stubGlobal('URL', {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      });

      const blob = new Blob(['audio'], { type: 'audio/webm' });
      render(<SpeechFeedback assessment={baseAssessment} audioBlob={blob} />);

      const playButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(playButton);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(Audio).toHaveBeenCalledWith('blob:mock-url');
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should show pause button while audio is playing', () => {
      const mockAudio = {
        play: vi.fn(),
        pause: vi.fn(),
        onplay: null as (() => void) | null,
        onended: null as (() => void) | null,
        onpause: null as (() => void) | null,
      };

      vi.stubGlobal('Audio', vi.fn(function() { return mockAudio; }));
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
      });

      const blob = new Blob(['audio'], { type: 'audio/webm' });
      render(<SpeechFeedback assessment={baseAssessment} audioBlob={blob} />);

      const playButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(playButton);

      // Simulate audio play event
      act(() => {
        if (mockAudio.onplay) mockAudio.onplay();
      });

      expect(screen.getByText('⏸ Pause')).toBeInTheDocument();
    });

    it('should pause existing audio before playing new one', () => {
      const mockAudio1 = {
        play: vi.fn(),
        pause: vi.fn(),
        onplay: null as (() => void) | null,
        onended: null as (() => void) | null,
        onpause: null as (() => void) | null,
      };
      const mockAudio2 = {
        play: vi.fn(),
        pause: vi.fn(),
        onplay: null as (() => void) | null,
        onended: null as (() => void) | null,
        onpause: null as (() => void) | null,
      };

      let callCount = 0;
      vi.stubGlobal('Audio', vi.fn(function() {
        callCount++;
        return callCount === 1 ? mockAudio1 : mockAudio2;
      }));
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
      });

      const blob = new Blob(['audio'], { type: 'audio/webm' });
      render(<SpeechFeedback assessment={baseAssessment} audioBlob={blob} />);

      const playButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(playButton);
      fireEvent.click(playButton);

      expect(mockAudio1.pause).toHaveBeenCalled();
      expect(mockAudio2.play).toHaveBeenCalled();
    });
  });

  describe('Error Details', () => {
    it('should render omission errors', () => {
      const assessment = {
        ...baseAssessment,
        feedback: {
          ...baseAssessment.feedback,
          errors: [
            { type: 'omission' as const, expected: 'は', actual: '', position: 5 },
          ],
        },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('⚠️ Missing:')).toBeInTheDocument();
      const errorDetail = document.querySelector('.error-item.omission .error-detail');
      expect(errorDetail).toHaveTextContent('Expected');
      expect(errorDetail).toHaveTextContent('は');
    });

    it('should render insertion errors', () => {
      const assessment = {
        ...baseAssessment,
        feedback: {
          ...baseAssessment.feedback,
          errors: [
            { type: 'insertion' as const, expected: '', actual: 'さ', position: 3 },
          ],
        },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('⚠️ Extra:')).toBeInTheDocument();
      expect(screen.getByText(/Said/)).toBeInTheDocument();
      expect(screen.getByText('さ')).toBeInTheDocument();
      expect(screen.getByText(/instead of nothing/)).toBeInTheDocument();
    });

    it('should render substitution errors', () => {
      const assessment = {
        ...baseAssessment,
        feedback: {
          ...baseAssessment.feedback,
          errors: [
            { type: 'substitution' as const, expected: 'は', actual: 'わ', position: 5 },
          ],
        },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('⚠️ Different:')).toBeInTheDocument();
      expect(screen.getByText(/Said/)).toBeInTheDocument();
      expect(screen.getByText('わ')).toBeInTheDocument();
      expect(screen.getByText(/instead of/)).toBeInTheDocument();
    });

    it('should render multiple errors', () => {
      const assessment = {
        ...baseAssessment,
        feedback: {
          ...baseAssessment.feedback,
          errors: [
            { type: 'omission' as const, expected: 'は', actual: '', position: 5 },
            { type: 'insertion' as const, expected: '', actual: 'さ', position: 3 },
            { type: 'substitution' as const, expected: 'は', actual: 'わ', position: 5 },
          ],
        },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('⚠️ Missing:')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Extra:')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Different:')).toBeInTheDocument();
    });

    it('should not render errors section when there are no errors', () => {
      render(<SpeechFeedback assessment={baseAssessment} />);
      expect(screen.queryByText('Areas to improve:')).not.toBeInTheDocument();
    });
  });

  describe('Suggestions', () => {
    it('should render suggestions', () => {
      const assessment = {
        ...baseAssessment,
        feedback: {
          ...baseAssessment.feedback,
          suggestions: ['Practice the "は" sound more.', 'Slow down your speech.'],
        },
      };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('💡 Tips:')).toBeInTheDocument();
      expect(screen.getByText('Practice the "は" sound more.')).toBeInTheDocument();
      expect(screen.getByText('Slow down your speech.')).toBeInTheDocument();
    });

    it('should not render suggestions section when there are no suggestions', () => {
      render(<SpeechFeedback assessment={baseAssessment} />);
      expect(screen.queryByText('💡 Tips:')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render retry button when onRetry is provided', () => {
      render(<SpeechFeedback assessment={baseAssessment} onRetry={mockOnRetry} />);
      expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();
    });

    it('should render continue button when onContinue is provided', () => {
      render(<SpeechFeedback assessment={baseAssessment} onContinue={mockOnContinue} />);
      expect(screen.getByText('Continue →')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      render(<SpeechFeedback assessment={baseAssessment} onRetry={mockOnRetry} />);
      const retryButton = screen.getByText('🔄 Try Again');
      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onContinue when continue button is clicked', () => {
      render(<SpeechFeedback assessment={baseAssessment} onContinue={mockOnContinue} />);
      const continueButton = screen.getByText('Continue →');
      fireEvent.click(continueButton);
      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });

    it('should not render action buttons when callbacks are not provided', () => {
      render(<SpeechFeedback assessment={baseAssessment} />);
      expect(screen.queryByText('🔄 Try Again')).not.toBeInTheDocument();
      expect(screen.queryByText('Continue →')).not.toBeInTheDocument();
    });
  });

  describe('Transcription Display', () => {
    it('should render transcript when provided', () => {
      const assessment = { ...baseAssessment, transcript: 'こんにちは', expected: 'こんにちわ' };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('Your speech:')).toBeInTheDocument();
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
    });

    it('should render fallback when transcript is empty', () => {
      const assessment = { ...baseAssessment, transcript: '' };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.getByText('(no speech detected)')).toBeInTheDocument();
    });

    it('should render expected text and romaji', () => {
      render(<SpeechFeedback assessment={baseAssessment} />);
      expect(screen.getByText('Expected:')).toBeInTheDocument();
      expect(screen.getByText('konnichiwa')).toBeInTheDocument();
    });

    it('should not render romaji when expectedRomaji is not provided', () => {
      const assessment = { ...baseAssessment, expectedRomaji: undefined };
      render(<SpeechFeedback assessment={assessment} />);
      expect(screen.queryByText('konnichiwa')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render with minimal assessment data', () => {
      const minimalAssessment: AssessmentResult = {
        transcript: '',
        accuracyScore: 0,
        feedback: {
          overall: '',
          errors: [],
          suggestions: [],
        },
        expected: 'test',
      };
      render(<SpeechFeedback assessment={minimalAssessment} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('💪 Keep practicing!')).toBeInTheDocument();
      expect(screen.getByText('(no speech detected)')).toBeInTheDocument();
    });

    it('should render with all optional props', () => {
      const blob = new Blob(['audio'], { type: 'audio/webm' });
      const assessment = {
        ...baseAssessment,
        feedback: {
          overall: 'Great!',
          errors: [
            { type: 'substitution' as const, expected: 'は', actual: 'わ', position: 5 },
          ],
          suggestions: ['Keep practicing!'],
        },
      };
      render(
        <SpeechFeedback
          assessment={assessment}
          audioBlob={blob}
          onRetry={mockOnRetry}
          onContinue={mockOnContinue}
        />
      );
      expect(screen.getByText('▶ Play Your Recording')).toBeInTheDocument();
      expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();
      expect(screen.getByText('Continue →')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Different:')).toBeInTheDocument();
      expect(screen.getByText('💡 Tips:')).toBeInTheDocument();
    });

    it('should handle pronunciation error type', () => {
      const assessment = {
        ...baseAssessment,
        feedback: {
          ...baseAssessment.feedback,
          errors: [
            { type: 'pronunciation' as const, expected: 'は', actual: 'わ', position: 5 },
          ],
        },
      };
      render(<SpeechFeedback assessment={assessment} />);
      // The component renders an empty error-type and error-detail for pronunciation
      // since there is no explicit handling — verify the error section exists
      expect(screen.getByText('Areas to improve:')).toBeInTheDocument();
      // The error item should be in the DOM (class "error-item pronunciation")
      const errorItem = document.querySelector('.error-item.pronunciation');
      expect(errorItem).toBeInTheDocument();
    });
  });
});
