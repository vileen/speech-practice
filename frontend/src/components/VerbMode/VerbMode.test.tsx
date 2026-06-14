import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VerbMode } from '../../components/VerbMode/VerbMode';
import * as useVerbModeModule from '../../hooks/useVerbMode';

vi.mock('../../hooks/useVerbMode');
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: (text: string) => ({ furigana: null })
}));
vi.mock('../../components/Header/index', () => ({
  Header: ({ title, onBack }: any) => (
    <header><button onClick={onBack}>Back</button><h1>{title}</h1></header>
  )
}));

describe('VerbMode', () => {
  const mockExercise = {
    verb: {
      id: 1,
      dictionary_form: '食べる',
      reading: 'たべる',
      meaning: 'to eat',
      group: 'II',
      jlpt_level: 'N5',
      conjugations: { te_form: '食べて' }
    },
    questionType: 'construction' as const,
    targetForm: 'te_form',
    prompt: 'Conjugate "食べる" to TE-form',
    correctAnswer: '食べて',
    options: ['食べて', '食べた', '食べない', '食べます']
  };

  const defaultHookReturn = {
    navigate: vi.fn(),
    currentExercise: null,
    state: 'selection' as const,
    userAnswer: '',
    setUserAnswer: vi.fn(),
    feedback: null,
    selectedPracticeType: 'construction' as const,
    setSelectedPracticeType: vi.fn(),
    answerMode: 'multiple-choice' as const,
    setAnswerMode: vi.fn(),
    selectedGroups: ['I', 'II', 'III'],
    showFurigana: true,
    setShowFurigana: vi.fn(),
    streak: 0,
    score: { correct: 0, total: 0 },
    loadNextExercise: vi.fn(),
    handleSubmit: vi.fn(),
    toggleGroup: vi.fn(),
    selectAllGroups: vi.fn(),
    deselectAllGroups: vi.fn(),
  };

  it('renders selection screen', () => {
    vi.spyOn(useVerbModeModule, 'useVerbMode').mockReturnValue(defaultHookReturn);
    render(<VerbMode />);
    expect(screen.getByText('Verb Conjugation Practice')).toBeInTheDocument();
    expect(screen.getByText('Practice Type')).toBeInTheDocument();
    expect(screen.getByText('Answer Mode')).toBeInTheDocument();
    expect(screen.getByText('Start Practice →')).toBeInTheDocument();
  });

  it('renders exercise screen after loading', () => {
    vi.spyOn(useVerbModeModule, 'useVerbMode').mockReturnValue({
      ...defaultHookReturn,
      currentExercise: mockExercise,
      state: 'input' as const,
    });
    render(<VerbMode />);
    expect(screen.getByText('Verb Conjugation')).toBeInTheDocument();
    expect(screen.getByText(/Conjugate/)).toBeInTheDocument();
  });

  it('shows feedback after answer', () => {
    vi.spyOn(useVerbModeModule, 'useVerbMode').mockReturnValue({
      ...defaultHookReturn,
      currentExercise: mockExercise,
      state: 'feedback' as const,
      feedback: {
        correct: true,
        userAnswer: '食べて',
        correctAnswer: '食べて',
        explanation: 'Used for connecting verbs',
        streak: 1
      }
    });
    render(<VerbMode />);
    expect(screen.getByText(/Correct!/)).toBeInTheDocument();
  });

  it('shows incorrect feedback', () => {
    vi.spyOn(useVerbModeModule, 'useVerbMode').mockReturnValue({
      ...defaultHookReturn,
      currentExercise: mockExercise,
      state: 'feedback' as const,
      feedback: {
        correct: false,
        userAnswer: '食べた',
        correctAnswer: '食べて',
        explanation: 'Used for connecting verbs',
      }
    });
    render(<VerbMode />);
    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
  });

  it('calls loadNextExercise when start button clicked', () => {
    const loadNextExercise = vi.fn();
    vi.spyOn(useVerbModeModule, 'useVerbMode').mockReturnValue({
      ...defaultHookReturn,
      loadNextExercise,
    });
    render(<VerbMode />);
    fireEvent.click(screen.getByText('Start Practice →'));
    expect(loadNextExercise).toHaveBeenCalled();
  });

  it('calls setSelectedPracticeType when practice type button clicked', () => {
    const setSelectedPracticeType = vi.fn();
    vi.spyOn(useVerbModeModule, 'useVerbMode').mockReturnValue({
      ...defaultHookReturn,
      setSelectedPracticeType,
    });
    render(<VerbMode />);
    fireEvent.click(screen.getByText('🧠 Recognition'));
    expect(setSelectedPracticeType).toHaveBeenCalledWith('recognition');
  });
});
