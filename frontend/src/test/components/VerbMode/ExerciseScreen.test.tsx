import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseScreen } from '../../../components/VerbMode/ExerciseScreen';
import type { Exercise, ExerciseState, FeedbackState } from '../../../components/VerbMode/types';

// Mock useFurigana hook
vi.mock('../../../hooks/useFurigana', () => ({
  useFurigana: vi.fn((text: string) => ({
    furigana: text.includes('漢') ? `<ruby>漢<rt>かん</rt></ruby>` : null,
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  })),
}));

// Mock react-router-dom's useNavigate for Header
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockNavigate = vi.fn();
const mockSetUserAnswer = vi.fn();
const mockSetShowFurigana = vi.fn();
const mockLoadNextExercise = vi.fn();
const mockHandleSubmit = vi.fn();

const mockVerb = {
  id: 1,
  dictionary_form: '食べる',
  reading: 'たべる',
  meaning: 'to eat',
  group: 'II' as const,
  jlpt_level: 'N5',
  conjugations: {
    te_form: '食べて',
    polite: '食べます',
  },
};

const mockExercise: Exercise = {
  verb: mockVerb,
  questionType: 'construction',
  targetForm: 'te_form',
  prompt: 'Conjugate 食べる to te-form',
  correctAnswer: '食べて',
};

const defaultProps = {
  navigate: mockNavigate,
  currentExercise: mockExercise,
  state: 'input' as ExerciseState,
  userAnswer: '',
  setUserAnswer: mockSetUserAnswer,
  feedback: null as FeedbackState | null,
  selectedPracticeType: 'construction' as const,
  answerMode: 'input' as const,
  showFurigana: false,
  setShowFurigana: mockSetShowFurigana,
  streak: 0,
  loadNextExercise: mockLoadNextExercise,
  handleSubmit: mockHandleSubmit,
};

describe('ExerciseScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(<ExerciseScreen {...defaultProps} state="loading" currentExercise={null} />);
    expect(screen.getByText('Loading exercise...')).toBeInTheDocument();
  });

  it('renders exercise with verb info', () => {
    render(<ExerciseScreen {...defaultProps} />);
    expect(screen.getByText('Verb Conjugation')).toBeInTheDocument();
    expect(screen.getByText('食べる')).toBeInTheDocument();
    expect(screen.getByText('to eat')).toBeInTheDocument();
    expect(screen.getByText('Group II')).toBeInTheDocument();
  });

  it('shows question prompt and target form', () => {
    render(<ExerciseScreen {...defaultProps} />);
    expect(screen.getByText('Conjugate 食べる to te-form')).toBeInTheDocument();
    expect(screen.getByText(/TE-form/)).toBeInTheDocument();
  });

  it('renders text input in input mode', () => {
    render(<ExerciseScreen {...defaultProps} />);
    expect(screen.getByPlaceholderText('Type your answer in Japanese...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('renders multiple choice options when answerMode is multiple-choice', () => {
    const exerciseWithOptions: Exercise = {
      ...mockExercise,
      options: ['食べて', '食べた', '食べる', '食べ'],
    };
    render(
      <ExerciseScreen
        {...defaultProps}
        answerMode="multiple-choice"
        currentExercise={exerciseWithOptions}
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('食べて')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('食べた')).toBeInTheDocument();
  });

  it('calls setUserAnswer and handleSubmit when multiple choice option is clicked', () => {
    const exerciseWithOptions: Exercise = {
      ...mockExercise,
      options: ['食べて', '食べた', '食べる', '食べ'],
    };
    render(
      <ExerciseScreen
        {...defaultProps}
        answerMode="multiple-choice"
        currentExercise={exerciseWithOptions}
      />
    );
    const optionBtn = screen.getByText('食べて').closest('button');
    fireEvent.click(optionBtn!);
    expect(mockSetUserAnswer).toHaveBeenCalledWith('食べて');
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('updates userAnswer on input change', () => {
    render(<ExerciseScreen {...defaultProps} />);
    const input = screen.getByPlaceholderText('Type your answer in Japanese...');
    fireEvent.change(input, { target: { value: '食べて' } });
    expect(mockSetUserAnswer).toHaveBeenCalledWith('食べて');
  });

  it('submits on Enter key', () => {
    render(<ExerciseScreen {...defaultProps} userAnswer="食べて" />);
    const input = screen.getByPlaceholderText('Type your answer in Japanese...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('disables submit when userAnswer is empty', () => {
    render(<ExerciseScreen {...defaultProps} />);
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeDisabled();
  });

  it('disables input during processing state', () => {
    render(<ExerciseScreen {...defaultProps} state="processing" userAnswer="食べて" />);
    const input = screen.getByPlaceholderText('Type your answer in Japanese...');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: /checking/i })).toBeInTheDocument();
  });

  it('shows correct feedback state', () => {
    const correctFeedback: FeedbackState = {
      correct: true,
      userAnswer: '食べて',
      correctAnswer: '食べて',
      explanation: 'Group II verbs drop る and add て',
      streak: 3,
    };
    render(
      <ExerciseScreen
        {...defaultProps}
        state="feedback"
        feedback={correctFeedback}
      />
    );
    expect(screen.getByText('✅ Correct!')).toBeInTheDocument();
    expect(screen.getByText('Your answer:')).toBeInTheDocument();
    expect(screen.getByText('💡 Explanation')).toBeInTheDocument();
    expect(screen.getByText('Group II verbs drop る and add て')).toBeInTheDocument();
    expect(screen.getByText('🔥 Streak: 3')).toBeInTheDocument();
  });

  it('shows incorrect feedback state with correct answer', () => {
    const incorrectFeedback: FeedbackState = {
      correct: false,
      userAnswer: '食べた',
      correctAnswer: '食べて',
      explanation: 'Group II verbs drop る and add て',
    };
    render(
      <ExerciseScreen
        {...defaultProps}
        state="feedback"
        feedback={incorrectFeedback}
      />
    );
    expect(screen.getByText('❌ Not quite')).toBeInTheDocument();
    expect(screen.getByText('Correct answer:')).toBeInTheDocument();
    expect(screen.getByText('食べて')).toBeInTheDocument();
  });

  it('calls loadNextExercise when next button is clicked', () => {
    const correctFeedback: FeedbackState = {
      correct: true,
      userAnswer: '食べて',
      correctAnswer: '食べて',
    };
    render(
      <ExerciseScreen
        {...defaultProps}
        state="feedback"
        feedback={correctFeedback}
      />
    );
    const nextBtn = screen.getByRole('button', { name: /next exercise/i });
    fireEvent.click(nextBtn);
    expect(mockLoadNextExercise).toHaveBeenCalled();
  });

  it('shows streak badge when streak > 0', () => {
    render(<ExerciseScreen {...defaultProps} streak={5} />);
    expect(screen.getByText('🔥 5')).toBeInTheDocument();
  });

  it('does not show streak badge when streak is 0', () => {
    render(<ExerciseScreen {...defaultProps} streak={0} />);
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
  });

  it('toggles furigana when furigana button is clicked', () => {
    render(<ExerciseScreen {...defaultProps} />);
    const furiganaBtn = screen.getByTitle('Show furigana');
    fireEvent.click(furiganaBtn);
    expect(mockSetShowFurigana).toHaveBeenCalledWith(true);
  });

  it('shows different furigana button title when furigana is enabled', () => {
    render(<ExerciseScreen {...defaultProps} showFurigana={true} />);
    const furiganaBtn = screen.getByTitle('Hide furigana');
    expect(furiganaBtn).toBeInTheDocument();
    fireEvent.click(furiganaBtn);
    expect(mockSetShowFurigana).toHaveBeenCalledWith(false);
  });

  it('calls navigate when back button is clicked', () => {
    render(<ExerciseScreen {...defaultProps} />);
    const backBtn = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows source form when currentExercise has sourceForm', () => {
    const exerciseWithSource: Exercise = {
      ...mockExercise,
      sourceForm: 'dictionary_form',
    };
    render(<ExerciseScreen {...defaultProps} currentExercise={exerciseWithSource} />);
    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('(Dictionary Form)')).toBeInTheDocument();
  });

  it('shows practice type badge', () => {
    render(<ExerciseScreen {...defaultProps} selectedPracticeType="recognition" />);
    expect(screen.getByText('🧠 Recognition')).toBeInTheDocument();
  });

  it('shows construction practice type badge', () => {
    render(<ExerciseScreen {...defaultProps} selectedPracticeType="construction" />);
    expect(screen.getByText('🔨 Construction')).toBeInTheDocument();
  });

  it('shows transformation practice type badge', () => {
    render(<ExerciseScreen {...defaultProps} selectedPracticeType="transformation" />);
    expect(screen.getByText('🔄 Transformation')).toBeInTheDocument();
  });
});
