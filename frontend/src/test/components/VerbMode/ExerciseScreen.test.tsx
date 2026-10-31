import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ExerciseScreen } from '../../../components/VerbMode/ExerciseScreen';
import type { Exercise, Verb, FeedbackState, ExerciseState } from '../../../components/VerbMode/types';

// Mock the useFurigana hook (ExerciseDisplay depends on it)
vi.mock('../../../hooks/useFurigana', () => ({
  useFurigana: vi.fn((text: string, enabled: boolean) => ({
    furigana: enabled ? `<ruby>${text}<rt>reading</rt></ruby>` : null,
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  })),
}));

const makeVerb = (overrides: Partial<Verb> = {}): Verb => ({
  id: 1,
  dictionary_form: '食べる',
  reading: 'たべる',
  meaning: 'to eat',
  group: 'II',
  jlpt_level: 'N5',
  conjugations: {
    te_form: '食べて',
    polite: '食べます',
  },
  ...overrides,
});

const makeExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  verb: makeVerb(),
  questionType: 'construction',
  targetForm: 'te_form',
  prompt: 'Conjugate 食べる into TE-form',
  correctAnswer: '食べて',
  options: ['食べて', '食べる', '食べた', '食べない'],
  ...overrides,
});

const makeFeedback = (overrides: Partial<FeedbackState> = {}): FeedbackState => ({
  correct: true,
  userAnswer: '食べて',
  correctAnswer: '食べて',
  explanation: 'Group II verbs: drop る and add て',
  streak: 3,
  ...overrides,
});

const defaultProps = {
  navigate: vi.fn(),
  currentExercise: makeExercise(),
  state: 'input' as ExerciseState,
  userAnswer: '',
  setUserAnswer: vi.fn(),
  feedback: null as FeedbackState | null,
  selectedPracticeType: 'construction' as const,
  answerMode: 'multiple-choice' as const,
  showFurigana: false,
  setShowFurigana: vi.fn(),
  streak: 0,
  loadNextExercise: vi.fn(),
  handleSubmit: vi.fn(),
};

const renderScreen = (overrides: Partial<typeof defaultProps> = {}) => {
  const props = { ...defaultProps, ...overrides };
  render(
    <MemoryRouter>
      <ExerciseScreen {...props} />
    </MemoryRouter>
  );
  return props;
};

describe('ExerciseScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render loading indicator when state is loading', () => {
      renderScreen({ state: 'loading' });
      expect(screen.getByText('Loading exercise...')).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('should render title and back button', () => {
      const props = renderScreen();
      expect(screen.getByText('Verb Conjugation')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(props.navigate).toHaveBeenCalledWith('/');
    });

    it('should show streak badge when streak > 0', () => {
      renderScreen({ streak: 5 });
      expect(screen.getByText('🔥 5')).toBeInTheDocument();
    });

    it('should not show streak badge when streak is 0', () => {
      renderScreen({ streak: 0 });
      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    });

    it('should toggle furigana when furigana button is clicked', () => {
      const props = renderScreen({ showFurigana: false });
      fireEvent.click(screen.getByTitle('Show furigana'));
      expect(props.setShowFurigana).toHaveBeenCalledWith(true);
    });

    it('should offer to hide furigana when furigana is shown', () => {
      const props = renderScreen({ showFurigana: true });
      fireEvent.click(screen.getByTitle('Hide furigana'));
      expect(props.setShowFurigana).toHaveBeenCalledWith(false);
    });
  });

  describe('exercise prompt', () => {
    it('should render verb info: dictionary form, group, and meaning', () => {
      renderScreen();
      expect(screen.getAllByText('食べる').length).toBeGreaterThan(0);
      expect(screen.getByText('Group II')).toBeInTheDocument();
      expect(screen.getByText('to eat')).toBeInTheDocument();
    });

    it('should render practice type badge', () => {
      renderScreen({ selectedPracticeType: 'recognition' });
      expect(screen.getByText(/Recognition/)).toBeInTheDocument();
    });

    it('should render the exercise prompt text', () => {
      renderScreen();
      expect(screen.getByText('Conjugate 食べる into TE-form')).toBeInTheDocument();
    });

    it('should show source form display when sourceForm is present', () => {
      renderScreen({
        currentExercise: makeExercise({ sourceForm: 'dictionary_form' }),
      });
      expect(screen.getByText('From:')).toBeInTheDocument();
      expect(screen.getByText('(Dictionary Form)')).toBeInTheDocument();
    });

    it('should not show source form display when sourceForm is absent', () => {
      renderScreen();
      expect(screen.queryByText('From:')).not.toBeInTheDocument();
    });
  });

  describe('multiple-choice mode', () => {
    it('should render all answer options', () => {
      renderScreen();
      expect(screen.getByText('食べて')).toBeInTheDocument();
      expect(screen.getAllByText('食べる').length).toBeGreaterThan(0);
      expect(screen.getByText('食べた')).toBeInTheDocument();
      expect(screen.getByText('食べない')).toBeInTheDocument();
    });

    it('should set answer and submit when an option is clicked', () => {
      const props = renderScreen();
      fireEvent.click(screen.getByText('食べて').closest('button')!);
      expect(props.setUserAnswer).toHaveBeenCalledWith('食べて');
      expect(props.handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('input mode', () => {
    const inputModeProps = { answerMode: 'input' as const };

    it('should show target form hint', () => {
      renderScreen(inputModeProps);
      expect(screen.getByText('TE-form', { selector: 'strong' })).toBeInTheDocument();
    });

    it('should update answer as the user types', () => {
      const props = renderScreen(inputModeProps);
      fireEvent.change(screen.getByPlaceholderText(/Type your answer/), {
        target: { value: '食べて' },
      });
      expect(props.setUserAnswer).toHaveBeenCalledWith('食べて');
    });

    it('should disable submit button when answer is empty', () => {
      renderScreen({ ...inputModeProps, userAnswer: '   ' });
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    });

    it('should submit on Enter key', () => {
      const props = renderScreen({ ...inputModeProps, userAnswer: '食べて' });
      fireEvent.keyDown(screen.getByPlaceholderText(/Type your answer/), {
        key: 'Enter',
      });
      expect(props.handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should show "Checking..." and disable controls while processing', () => {
      renderScreen({ ...inputModeProps, userAnswer: '食べて', state: 'processing' });
      expect(screen.getByRole('button', { name: 'Checking...' })).toBeDisabled();
      expect(screen.getByPlaceholderText(/Type your answer/)).toBeDisabled();
    });
  });

  describe('feedback state', () => {
    it('should show correct feedback message', () => {
      renderScreen({
        state: 'feedback',
        feedback: makeFeedback({ correct: true }),
      });
      expect(screen.getByText(/✅ Correct!/)).toBeInTheDocument();
      expect(screen.queryByText(/Correct answer:/)).not.toBeInTheDocument();
    });

    it('should show correct answer when the answer was wrong', () => {
      renderScreen({
        state: 'feedback',
        feedback: makeFeedback({
          correct: false,
          userAnswer: '食べる',
          correctAnswer: '食べて',
        }),
      });
      expect(screen.getByText(/❌ Not quite/)).toBeInTheDocument();
      expect(screen.getByText('Your answer:')).toBeInTheDocument();
      expect(screen.getByText('Correct answer:')).toBeInTheDocument();
    });

    it('should render explanation when provided', () => {
      renderScreen({ state: 'feedback', feedback: makeFeedback() });
      expect(screen.getByText(/Explanation/)).toBeInTheDocument();
      expect(screen.getByText('Group II verbs: drop る and add て')).toBeInTheDocument();
    });

    it('should show streak update when feedback includes a streak', () => {
      renderScreen({ state: 'feedback', feedback: makeFeedback({ streak: 3 }) });
      expect(screen.getByText('🔥 Streak: 3')).toBeInTheDocument();
    });

    it('should load next exercise when Next is clicked', () => {
      const props = renderScreen({ state: 'feedback', feedback: makeFeedback() });
      fireEvent.click(screen.getByRole('button', { name: /Next Exercise/ }));
      expect(props.loadNextExercise).toHaveBeenCalledTimes(1);
    });
  });
});
