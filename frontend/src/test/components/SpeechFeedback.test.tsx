import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SpeechFeedback } from '../../components/SpeechFeedback/SpeechFeedback';
import type { AssessmentResult } from '../../hooks/useSpeechAssessment';

describe('SpeechFeedback', () => {
  const mockOnRetry = vi.fn();
  const mockOnContinue = vi.fn();
  
  // Mock URL.createObjectURL
  const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-audio-url');
  const mockRevokeObjectURL = vi.fn();
  
  // Mock Audio - using a proper class mock
  let mockAudioPlay: ReturnType<typeof vi.fn>;
  let mockAudioPause: ReturnType<typeof vi.fn>;
  let mockAudioInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup URL mock
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    // Setup Audio mock with a proper constructor function
    mockAudioPlay = vi.fn().mockResolvedValue(undefined);
    mockAudioPause = vi.fn();
    
    // Create a proper Audio constructor mock
    const MockAudio = vi.fn().mockImplementation(function() {
      mockAudioInstance = {
        play: mockAudioPlay,
        pause: mockAudioPause,
        onplay: null,
        onended: null,
        onpause: null,
      };
      return mockAudioInstance;
    });
    
    global.Audio = MockAudio as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockAssessment = (overrides: Partial<AssessmentResult> = {}): AssessmentResult => {
    const defaultFeedback = {
      overall: 'Good pronunciation!',
      errors: [] as Array<{type: 'substitution' | 'omission' | 'insertion' | 'pronunciation', expected: string, actual: string, position: number}>,
      suggestions: [] as string[],
    };
    
    return {
      transcript: 'こんにちは',
      accuracyScore: 85,
      expected: 'こんにちは',
      expectedRomaji: 'konnichiwa',
      feedback: defaultFeedback,
      ...overrides,
      feedback: {
        ...defaultFeedback,
        ...(overrides.feedback || {}),
      },
    };
  };

  describe('Rendering', () => {
    it('should render score section with correct score', () => {
      const assessment = createMockAssessment({ accuracyScore: 85 });
      
      render(
        <SpeechFeedback
          assessment={assessment}
          onRetry={mockOnRetry}
          onContinue={mockOnContinue}
        />
      );
      
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('should render score message based on score', () => {
      const excellentAssessment = createMockAssessment({ accuracyScore: 95 });
      const { rerender } = render(
        <SpeechFeedback assessment={excellentAssessment} />
      );
      expect(screen.getByText('🌟 Excellent!')).toBeInTheDocument();

      const greatAssessment = createMockAssessment({ accuracyScore: 85 });
      rerender(<SpeechFeedback assessment={greatAssessment} />);
      expect(screen.getByText('✨ Great job!')).toBeInTheDocument();

      const goodAssessment = createMockAssessment({ accuracyScore: 70 });
      rerender(<SpeechFeedback assessment={goodAssessment} />);
      expect(screen.getByText('👍 Good attempt!')).toBeInTheDocument();

      const needsWorkAssessment = createMockAssessment({ accuracyScore: 50 });
      rerender(<SpeechFeedback assessment={needsWorkAssessment} />);
      expect(screen.getByText('💪 Keep practicing!')).toBeInTheDocument();
    });

    it('should render overall feedback description', () => {
      const assessment = createMockAssessment({ 
        feedback: { overall: 'Your pronunciation is clear!', errors: [], suggestions: [] }
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('Your pronunciation is clear!')).toBeInTheDocument();
    });

    it('should render transcript comparison section', () => {
      const assessment = createMockAssessment({
        transcript: 'こんにちは',
        expected: 'こんにちは',
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('What you said:')).toBeInTheDocument();
      expect(screen.getByText('Your speech:')).toBeInTheDocument();
      // Use getAllByText since both transcript and expected have the same text
      expect(screen.getAllByText('こんにちは')).toHaveLength(2);
      expect(screen.getByText('Expected:')).toBeInTheDocument();
    });

    it('should show "no speech detected" when transcript is empty', () => {
      const assessment = createMockAssessment({ transcript: '' });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('(no speech detected)')).toBeInTheDocument();
    });

    it('should render expected romaji when provided', () => {
      const assessment = createMockAssessment({
        expectedRomaji: 'konnichiwa',
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('konnichiwa')).toBeInTheDocument();
    });

    it('should not render romaji when not provided', () => {
      const assessment = createMockAssessment({
        expectedRomaji: undefined,
      });
      
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.romaji-text')).not.toBeInTheDocument();
    });
  });

  describe('Score Colors', () => {
    it('should apply excellent class for score >= 90', () => {
      const assessment = createMockAssessment({ accuracyScore: 95 });
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.score-section')).toHaveClass('excellent');
    });

    it('should apply good class for score >= 80', () => {
      const assessment = createMockAssessment({ accuracyScore: 85 });
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.score-section')).toHaveClass('good');
    });

    it('should apply fair class for score >= 60', () => {
      const assessment = createMockAssessment({ accuracyScore: 70 });
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.score-section')).toHaveClass('fair');
    });

    it('should apply needs-work class for score < 60', () => {
      const assessment = createMockAssessment({ accuracyScore: 50 });
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.score-section')).toHaveClass('needs-work');
    });
  });

  describe('Audio Playback', () => {
    it('should render play button when audioBlob is provided', () => {
      const assessment = createMockAssessment();
      const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
      
      render(
        <SpeechFeedback
          assessment={assessment}
          audioBlob={audioBlob}
        />
      );
      
      expect(screen.getByText('▶ Play Your Recording')).toBeInTheDocument();
    });

    it('should not render play button when audioBlob is not provided', () => {
      const assessment = createMockAssessment();
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.queryByText('▶ Play Your Recording')).not.toBeInTheDocument();
    });

    it('should play audio when play button is clicked', () => {
      const assessment = createMockAssessment();
      const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
      
      render(
        <SpeechFeedback
          assessment={assessment}
          audioBlob={audioBlob}
        />
      );
      
      const playButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(playButton);
      
      expect(mockCreateObjectURL).toHaveBeenCalledWith(audioBlob);
      expect(mockAudioPlay).toHaveBeenCalled();
    });

    it('should show pause button when audio is playing', async () => {
      const assessment = createMockAssessment();
      const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
      
      render(
        <SpeechFeedback
          assessment={assessment}
          audioBlob={audioBlob}
        />
      );
      
      const playButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(playButton);
      
      // Simulate audio playing - wrap in act for state update
      if (mockAudioInstance.onplay) {
        await act(async () => {
          mockAudioInstance.onplay();
        });
      }
      
      expect(screen.getByText('⏸ Pause')).toBeInTheDocument();
    });

    it('should pause audio when pause button is clicked', async () => {
      const assessment = createMockAssessment();
      const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
      
      render(
        <SpeechFeedback
          assessment={assessment}
          audioBlob={audioBlob}
        />
      );
      
      // Start playing
      const playButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(playButton);
      
      // Simulate audio playing - wrap in act for state update
      if (mockAudioInstance.onplay) {
        await act(async () => {
          mockAudioInstance.onplay();
        });
      }
      
      // Pause
      const pauseButton = screen.getByText('⏸ Pause');
      fireEvent.click(pauseButton);
      
      expect(mockAudioPause).toHaveBeenCalled();
    });

    it('should reset playing state when audio ends', async () => {
      const assessment = createMockAssessment();
      const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
      
      render(
        <SpeechFeedback
          assessment={assessment}
          audioBlob={audioBlob}
        />
      );
      
      // Start playing
      const playButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(playButton);
      
      // Simulate audio playing then ending - wrap in act for state updates
      await act(async () => {
        if (mockAudioInstance.onplay) {
          mockAudioInstance.onplay();
        }
      });
      
      await act(async () => {
        if (mockAudioInstance.onended) {
          mockAudioInstance.onended();
        }
      });
      
      expect(screen.getByText('▶ Play Your Recording')).toBeInTheDocument();
    });

    it('should pause existing audio before playing new audio', () => {
      const assessment = createMockAssessment();
      const audioBlob = new Blob(['test audio'], { type: 'audio/webm' });
      
      const { rerender } = render(
        <SpeechFeedback
          assessment={assessment}
          audioBlob={audioBlob}
        />
      );
      
      // Play first time
      const playButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(playButton);
      
      // Rerender with new blob (simulating new recording)
      const newAudioBlob = new Blob(['new audio'], { type: 'audio/webm' });
      rerender(
        <SpeechFeedback
          assessment={assessment}
          audioBlob={newAudioBlob}
        />
      );
      
      // Play again - should pause previous
      const newPlayButton = screen.getByText('▶ Play Your Recording');
      fireEvent.click(newPlayButton);
      
      expect(mockAudioPause).toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    it('should render errors section when errors exist', () => {
      const assessment = createMockAssessment({
        feedback: {
          overall: 'Some issues found',
          errors: [
            { type: 'omission' as const, expected: 'は', actual: '', position: 5 },
          ],
          suggestions: [],
        },
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('Areas to improve:')).toBeInTheDocument();
      expect(screen.getByText(/Missing:/)).toBeInTheDocument();
    });

    it('should render omission error correctly', () => {
      const assessment = createMockAssessment({
        feedback: {
          overall: 'Some issues',
          errors: [
            { type: 'omission' as const, expected: 'は', actual: '', position: 5 },
          ],
          suggestions: [],
        },
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('⚠️ Missing:')).toBeInTheDocument();
    });

    it('should render insertion error correctly', () => {
      const assessment = createMockAssessment({
        feedback: {
          overall: 'Some issues',
          errors: [
            { type: 'insertion' as const, expected: '', actual: 'わ', position: 5 },
          ],
          suggestions: [],
        },
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('⚠️ Extra:')).toBeInTheDocument();
    });

    it('should render substitution error correctly', () => {
      const assessment = createMockAssessment({
        feedback: {
          overall: 'Some issues',
          errors: [
            { type: 'substitution' as const, expected: 'は', actual: 'わ', position: 5 },
          ],
          suggestions: [],
        },
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('⚠️ Different:')).toBeInTheDocument();
    });

    it('should not render errors section when no errors', () => {
      const assessment = createMockAssessment({
        feedback: {
          overall: 'Perfect!',
          errors: [],
          suggestions: [],
        },
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.queryByText('Areas to improve:')).not.toBeInTheDocument();
    });
  });

  describe('Suggestions Display', () => {
    it('should render suggestions section when suggestions exist', () => {
      const assessment = createMockAssessment({
        feedback: {
          overall: 'Good',
          errors: [],
          suggestions: ['Speak slower', 'Focus on pitch accent'],
        },
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('💡 Tips:')).toBeInTheDocument();
      expect(screen.getByText('Speak slower')).toBeInTheDocument();
      expect(screen.getByText('Focus on pitch accent')).toBeInTheDocument();
    });

    it('should not render suggestions section when no suggestions', () => {
      const assessment = createMockAssessment({
        feedback: {
          overall: 'Perfect!',
          errors: [],
          suggestions: [],
        },
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.queryByText('💡 Tips:')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render retry button when onRetry is provided', () => {
      const assessment = createMockAssessment();
      
      render(
        <SpeechFeedback
          assessment={assessment}
          onRetry={mockOnRetry}
        />
      );
      
      expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();
    });

    it('should render continue button when onContinue is provided', () => {
      const assessment = createMockAssessment();
      
      render(
        <SpeechFeedback
          assessment={assessment}
          onContinue={mockOnContinue}
        />
      );
      
      expect(screen.getByText('Continue →')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const assessment = createMockAssessment();
      
      render(
        <SpeechFeedback
          assessment={assessment}
          onRetry={mockOnRetry}
        />
      );
      
      const retryButton = screen.getByText('🔄 Try Again');
      fireEvent.click(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onContinue when continue button is clicked', () => {
      const assessment = createMockAssessment();
      
      render(
        <SpeechFeedback
          assessment={assessment}
          onContinue={mockOnContinue}
        />
      );
      
      const continueButton = screen.getByText('Continue →');
      fireEvent.click(continueButton);
      
      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });

    it('should not render action buttons when callbacks are not provided', () => {
      const assessment = createMockAssessment();
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.queryByText('🔄 Try Again')).not.toBeInTheDocument();
      expect(screen.queryByText('Continue →')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle score of exactly 90', () => {
      const assessment = createMockAssessment({ accuracyScore: 90 });
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.score-section')).toHaveClass('excellent');
      expect(screen.getByText('🌟 Excellent!')).toBeInTheDocument();
    });

    it('should handle score of exactly 80', () => {
      const assessment = createMockAssessment({ accuracyScore: 80 });
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.score-section')).toHaveClass('good');
      expect(screen.getByText('✨ Great job!')).toBeInTheDocument();
    });

    it('should handle score of exactly 60', () => {
      const assessment = createMockAssessment({ accuracyScore: 60 });
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.score-section')).toHaveClass('fair');
      expect(screen.getByText('👍 Good attempt!')).toBeInTheDocument();
    });

    it('should handle score of 0', () => {
      const assessment = createMockAssessment({ accuracyScore: 0 });
      const { container } = render(<SpeechFeedback assessment={assessment} />);
      
      expect(container.querySelector('.score-section')).toHaveClass('needs-work');
      expect(screen.getByText('💪 Keep practicing!')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle score of 100', () => {
      const assessment = createMockAssessment({ accuracyScore: 100 });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('🌟 Excellent!')).toBeInTheDocument();
    });

    it('should handle multiple errors', () => {
      const assessment = createMockAssessment({
        feedback: {
          overall: 'Multiple issues',
          errors: [
            { type: 'omission' as const, expected: 'は', actual: '', position: 5 },
            { type: 'substitution' as const, expected: 'に', actual: 'な', position: 3 },
            { type: 'insertion' as const, expected: '', actual: 'あ', position: 10 },
          ],
          suggestions: [],
        },
      });
      
      render(<SpeechFeedback assessment={assessment} />);
      
      const errorItems = screen.getAllByRole('listitem');
      expect(errorItems).toHaveLength(3);
    });
  });
});
