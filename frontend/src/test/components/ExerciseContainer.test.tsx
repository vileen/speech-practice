import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExerciseContainer } from '../../components/GrammarMode/ExerciseContainer';
import type { GrammarPattern, GrammarExercise, ExerciseState, ReviewMode } from '../../components/GrammarMode/types';

vi.mock('../../components/GrammarMode/ExerciseDisplay', () => ({
  ExerciseDisplay: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock('../../components/GrammarMode/DiscriminationDrill', () => ({
  DiscriminationDrill: ({ onSelectOption }: any) => (
    <div data-testid="discrimination-drill">
      <button onClick={() => onSelectOption({ pattern_id: 2, pattern: 'Test', category: 'Test', is_correct: true, explanation: 'test' }, { id: 2, pattern: 'Test', category: 'Test', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] })}>
        Select Option
      </button>
    </div>
  ),
}));

vi.mock('../../components/GrammarMode/GrammarErrorExplanation', () => ({
  GrammarErrorExplanation: () => <div data-testid="error-explanation">Error Explanation</div>,
}));

const mockPattern: GrammarPattern = {
  id: 1,
  pattern: '〜てもいいです',
  category: 'Permission',
  jlpt_level: 'N5',
  formation_rules: [{ rule: 'Verb-te + mo ii desu' }],
  examples: [],
  common_mistakes: [{ mistake: '〜てはいけません', explanation: 'Wrong pattern' }],
  confusion_pairs: [2],
};

const mockPattern2: GrammarPattern = {
  id: 2,
  pattern: '〜てはいけません',
  category: 'Prohibition',
  jlpt_level: 'N5',
  formation_rules: [],
  examples: [],
  common_mistakes: [],
};

const mockExercise: GrammarExercise = {
  id: 1,
  type: 'construction',
  prompt: 'Build a sentence asking for permission',
  context: 'You want to eat here',
  correct_answer: 'ここで食べてもいいです',
  hints: [],
  difficulty: 1,
};

const createProps = (overrides: any = {}) => ({
  currentPattern: mockPattern,
  exercise: mockExercise,
  state: 'input' as ExerciseState,
  userAnswer: '',
  feedback: null,
  showFurigana: false,
  reviewMode: 'normal' as ReviewMode,
  discriminationAlert: null,
  selectedDiscriminationOption: null,
  discriminationFeedback: null,
  patterns: [mockPattern, mockPattern2],
  onUserAnswerChange: vi.fn(),
  onSubmit: vi.fn(),
  onNext: vi.fn(),
  onCompare: vi.fn(),
  onDiscriminationSelect: vi.fn(),
  onSetComparisonPatterns: vi.fn(),
  ...overrides,
});

describe('ExerciseContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    const props = createProps({ state: 'loading' as ExerciseState });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('Loading exercise...')).toBeInTheDocument();
  });

  it('should render pattern info with category', () => {
    const props = createProps();
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('Permission')).toBeInTheDocument();
  });

  it('should show confusion warning when pattern has confusion_pairs', () => {
    const props = createProps();
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText(/Often confused with:/)).toBeInTheDocument();
  });

  it('should call onCompare when compare link is clicked', () => {
    const onCompare = vi.fn();
    const props = createProps({ onCompare });
    render(<ExerciseContainer {...props} />);
    fireEvent.click(screen.getByText('Compare →'));
    expect(onCompare).toHaveBeenCalledWith(mockPattern);
  });

  it('should render input section with answer field', () => {
    const props = createProps();
    render(<ExerciseContainer {...props} />);
    expect(screen.getByPlaceholderText('Your answer in Japanese...')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should call onUserAnswerChange when typing in input', () => {
    const onUserAnswerChange = vi.fn();
    const props = createProps({ onUserAnswerChange });
    render(<ExerciseContainer {...props} />);
    const input = screen.getByPlaceholderText('Your answer in Japanese...');
    fireEvent.change(input, { target: { value: 'test answer' } });
    expect(onUserAnswerChange).toHaveBeenCalledWith('test answer');
  });

  it('should call onSubmit when submit button is clicked', () => {
    const onSubmit = vi.fn();
    const props = createProps({ userAnswer: 'test', onSubmit });
    render(<ExerciseContainer {...props} />);
    fireEvent.click(screen.getByText('Submit'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should call onSubmit when Enter key is pressed in input', () => {
    const onSubmit = vi.fn();
    const props = createProps({ userAnswer: 'test', onSubmit });
    render(<ExerciseContainer {...props} />);
    const input = screen.getByPlaceholderText('Your answer in Japanese...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should disable submit button when userAnswer is empty', () => {
    const props = createProps({ userAnswer: '   ' });
    render(<ExerciseContainer {...props} />);
    const button = screen.getByText('Submit');
    expect(button).toBeDisabled();
  });

  it('should show confusion alert when discriminationAlert is provided', () => {
    const alert = {
      confusedWith: mockPattern2,
      message: 'You might be confusing this with the prohibition pattern!',
    };
    const props = createProps({ discriminationAlert: alert });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('Possible Confusion Detected!')).toBeInTheDocument();
    expect(screen.getByText('You might be confusing this with the prohibition pattern!')).toBeInTheDocument();
  });

  it('should call onCompare when compare alert button is clicked', () => {
    const onCompare = vi.fn();
    const alert = {
      confusedWith: mockPattern2,
      message: 'Confusion alert!',
    };
    const props = createProps({ onCompare, discriminationAlert: alert });
    render(<ExerciseContainer {...props} />);
    fireEvent.click(screen.getByText('Compare Patterns'));
    expect(onCompare).toHaveBeenCalledWith(mockPattern);
  });

  it('should render processing state', () => {
    const props = createProps({ state: 'processing' as ExerciseState });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });

  it('should render correct feedback with next button', () => {
    const feedback = {
      correct: true,
      userAnswer: 'ここで食べてもいいです',
      progress: { streak: 5, interval_days: 3 },
    };
    const props = createProps({ state: 'feedback' as ExerciseState, feedback });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('✅ Correct!')).toBeInTheDocument();
    expect(screen.getByText('Next Exercise →')).toBeInTheDocument();
  });

  it('should render incorrect feedback with correct answer and error explanation', () => {
    const feedback = {
      correct: false,
      userAnswer: 'ここで食べてはいけません',
      correctAnswer: 'ここで食べてもいいです',
    };
    const props = createProps({ state: 'feedback' as ExerciseState, feedback });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('❌ Not quite')).toBeInTheDocument();
    expect(screen.getByText('Correct answer:')).toBeInTheDocument();
    expect(screen.getByTestId('error-explanation')).toBeInTheDocument();
  });

  it('should call onNext when next button is clicked', () => {
    const onNext = vi.fn();
    const feedback = { correct: true, userAnswer: 'test' };
    const props = createProps({ state: 'feedback' as ExerciseState, feedback, onNext });
    render(<ExerciseContainer {...props} />);
    fireEvent.click(screen.getByText('Next Exercise →'));
    expect(onNext).toHaveBeenCalled();
  });

  it('should show confusion feedback when feedback.confusion exists', () => {
    const feedback = {
      correct: false,
      userAnswer: 'wrong',
      confusion: {
        confusedWith: { pattern: '〜てはいけません' },
      },
    };
    const props = createProps({ state: 'feedback' as ExerciseState, feedback });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText(/You used the pattern for/)).toBeInTheDocument();
    expect(screen.getByText('See Comparison')).toBeInTheDocument();
  });

  it('should show progress update when feedback has progress', () => {
    const feedback = {
      correct: true,
      userAnswer: 'test',
      progress: { streak: 3, interval_days: 2 },
    };
    const props = createProps({ state: 'feedback' as ExerciseState, feedback });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('Streak: 3')).toBeInTheDocument();
    expect(screen.getByText('Next review: 2 days')).toBeInTheDocument();
  });

  it('should show mixed review mode badge', () => {
    const props = createProps({ reviewMode: 'mixed' as ReviewMode });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('🎯 Mixed Review Mode')).toBeInTheDocument();
  });

  it('should show discrimination mode badge', () => {
    const props = createProps({ reviewMode: 'discrimination' as ReviewMode });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('🎭 Discrimination Drill')).toBeInTheDocument();
  });

  it('should render discrimination drill when state is discrimination_select', () => {
    const props = createProps({ state: 'discrimination_select' as ExerciseState });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByTestId('discrimination-drill')).toBeInTheDocument();
  });

  it('should show discrimination feedback when provided', () => {
    const discriminationFeedback = {
      isCorrect: true,
      explanation: 'Good job!',
    };
    const props = createProps({
      state: 'discrimination_select' as ExerciseState,
      discriminationFeedback,
    });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('Correct pattern!')).toBeInTheDocument();
    expect(screen.getByText('Good job!')).toBeInTheDocument();
  });

  it('should show incorrect discrimination feedback with compare button', () => {
    const option = { pattern_id: 2, pattern: 'Wrong', category: 'Test', is_correct: false, explanation: 'Wrong choice' };
    const discriminationFeedback = {
      isCorrect: false,
      explanation: 'Wrong pattern!',
    };
    const props = createProps({
      state: 'discrimination_select' as ExerciseState,
      discriminationFeedback,
      selectedDiscriminationOption: option,
    });
    render(<ExerciseContainer {...props} />);
    const titleElements = screen.getAllByText('Wrong pattern!');
    expect(titleElements.length).toBe(2);
    expect(titleElements[0]).toHaveClass('discrimination-feedback-title');
    expect(screen.getByText('Compare Patterns →')).toBeInTheDocument();
  });

  it('should call onSetComparisonPatterns when compare patterns button is clicked in discrimination', () => {
    const onSetComparisonPatterns = vi.fn();
    const option = { pattern_id: 2, pattern: 'Wrong', category: 'Test', is_correct: false, explanation: 'Wrong choice' };
    const discriminationFeedback = {
      isCorrect: false,
      explanation: 'Wrong!',
    };
    const props = createProps({
      state: 'discrimination_select' as ExerciseState,
      discriminationFeedback,
      selectedDiscriminationOption: option,
      onSetComparisonPatterns,
    });
    render(<ExerciseContainer {...props} />);
    fireEvent.click(screen.getByText('Compare Patterns →'));
    expect(onSetComparisonPatterns).toHaveBeenCalledWith([mockPattern, mockPattern2]);
  });

  it('should show prompt type in input state', () => {
    const props = createProps();
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('construction')).toBeInTheDocument();
  });

  it('should show exercise context when provided', () => {
    const props = createProps();
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('You want to eat here')).toBeInTheDocument();
  });

  it('should not show confusion warning when no confusion_pairs', () => {
    const pattern = { ...mockPattern, confusion_pairs: undefined };
    const props = createProps({ currentPattern: pattern });
    render(<ExerciseContainer {...props} />);
    expect(screen.queryByText(/Often confused with:/)).not.toBeInTheDocument();
  });

  it('should render with empty exercise', () => {
    const props = createProps({ exercise: null });
    render(<ExerciseContainer {...props} />);
    expect(screen.getByText('Permission')).toBeInTheDocument();
  });
});
