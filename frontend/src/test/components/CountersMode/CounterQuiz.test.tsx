import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CounterQuiz } from '../../../components/CountersMode/CounterQuiz';
import type { CounterGroup, QuizQuestion } from '../../../components/CountersMode/types';

describe('CounterQuiz', () => {
  const makeGroup = (baseForm: string): CounterGroup => ({
    baseForm,
    count: 2,
    counts: 'long objects',
    description: `${baseForm} description`,
    patterns: [],
  });

  const makeQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
    pattern: {
      id: 1,
      pattern: '本 (hon) — 一本、二本、三本',
      base_form: 'hon',
      formation_rules: [],
      examples: [
        { jp: '本を二本買いました', en: 'I bought two long objects', romaji: 'hon o nihon kaimashita' },
      ],
      total_attempts: 0,
      correct_attempts: 0,
    },
    group: makeGroup('hon'),
    questionText: 'How do you count long objects?',
    ...overrides,
  });

  const setup = (overrides: Partial<React.ComponentProps<typeof CounterQuiz>> = {}) => {
    const props = {
      selectedGroup: makeGroup('hon'),
      quizQuestion: makeQuestion(),
      showAnswer: false,
      onSetMode: vi.fn(),
      onSetShowAnswer: vi.fn(),
      onHandleAnswer: vi.fn(),
      ...overrides,
    };
    render(<CounterQuiz {...props} />);
    return props;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('header', () => {
    it('renders quiz title with selected counter group', () => {
      setup();
      expect(screen.getByRole('heading', { name: '🎯 Quiz: hon' })).toBeInTheDocument();
    });

    it('calls onSetMode with study when back button is clicked', () => {
      const props = setup();
      fireEvent.click(screen.getByText('← Study'));
      expect(props.onSetMode).toHaveBeenCalledWith('study');
    });
  });

  describe('question display', () => {
    it('renders the quiz question text', () => {
      setup();
      expect(screen.getByText('How do you count long objects?')).toBeInTheDocument();
    });

    it('shows answer prompt for the current question text', () => {
      setup({ quizQuestion: makeQuestion({ questionText: 'How do you count people?' }) });
      expect(screen.getByText('How do you count people?')).toBeInTheDocument();
    });
  });

  describe('when answer is hidden', () => {
    it('renders show answer button', () => {
      setup({ showAnswer: false });
      expect(screen.getByRole('button', { name: 'Show Answer' })).toBeInTheDocument();
    });

    it('does not render answer content', () => {
      setup({ showAnswer: false });
      expect(screen.queryByText(/Didn't know/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Knew it/)).not.toBeInTheDocument();
    });

    it('calls onSetShowAnswer(true) when show answer button is clicked', () => {
      const props = setup({ showAnswer: false });
      fireEvent.click(screen.getByRole('button', { name: 'Show Answer' }));
      expect(props.onSetShowAnswer).toHaveBeenCalledWith(true);
    });
  });

  describe('when answer is shown', () => {
    it('renders the answer pattern', () => {
      setup({ showAnswer: true });
      expect(screen.getByText('本 (hon) — 一本、二本、三本')).toBeInTheDocument();
    });

    it('does not render show answer button', () => {
      setup({ showAnswer: true });
      expect(screen.queryByRole('button', { name: 'Show Answer' })).not.toBeInTheDocument();
    });

    it('renders first example with reading and romaji', () => {
      setup({ showAnswer: true });
      expect(screen.getByText('本を二本買いました')).toBeInTheDocument();
      expect(screen.getByText('I bought two long objects')).toBeInTheDocument();
      expect(screen.getByText('hon o nihon kaimashita')).toBeInTheDocument();
    });

    it('omits romaji line when example has no romaji', () => {
      const question = makeQuestion();
      question.pattern.examples = [{ jp: '本を二本買いました', en: 'I bought two long objects' }];
      setup({ showAnswer: true, quizQuestion: question });
      expect(screen.queryByText('hon o nihon kaimashita')).not.toBeInTheDocument();
    });

    it('omits example block when there are no examples', () => {
      const question = makeQuestion();
      question.pattern.examples = [];
      setup({ showAnswer: true, quizQuestion: question });
      expect(screen.queryByText('I bought two long objects')).not.toBeInTheDocument();
    });

    it('calls onHandleAnswer(false) when "Didn\'t know" is clicked', () => {
      const props = setup({ showAnswer: true });
      fireEvent.click(screen.getByRole('button', { name: /Didn't know/ }));
      expect(props.onHandleAnswer).toHaveBeenCalledWith(false);
    });

    it('calls onHandleAnswer(true) when "Knew it" is clicked', () => {
      const props = setup({ showAnswer: true });
      fireEvent.click(screen.getByRole('button', { name: /Knew it/ }));
      expect(props.onHandleAnswer).toHaveBeenCalledWith(true);
    });
  });

  describe('group switching', () => {
    it('renders header for a different counter group', () => {
      setup({ selectedGroup: makeGroup('hito') });
      expect(screen.getByRole('heading', { name: '🎯 Quiz: hito' })).toBeInTheDocument();
    });
  });
});
