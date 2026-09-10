import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CounterMixedQuiz } from '../../../components/CountersMode/CounterMixedQuiz';
import type { QuizQuestion } from '../../../components/CountersMode/types';

const makeQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  pattern: {
    id: 1,
    pattern: '一つ (ひとつ)',
    base_form: 'つ',
    formation_rules: [],
    examples: [
      { jp: 'りんごを一つ食べた', en: 'I ate one apple', romaji: 'ringo wo hitotsu tabeta' },
    ],
    total_attempts: 0,
    correct_attempts: 0,
  },
  group: {
    baseForm: 'つ',
    count: 1,
    patterns: [],
    counts: '1-10',
    description: 'Generic counter',
  },
  questionText: 'How do you count 1 generic item?',
  ...overrides,
});

describe('CounterMixedQuiz', () => {
  const defaultProps = {
    mode: 'mixed' as const,
    mixedQuestions: [makeQuestion()],
    currentQuestionIndex: 0,
    showAnswer: false,
    onSetMode: vi.fn(),
    onSetShowAnswer: vi.fn(),
    onHandleAnswer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('header', () => {
    it('renders mixed quiz title', () => {
      render(<CounterMixedQuiz {...defaultProps} />);
      expect(screen.getByRole('heading', { name: '🎯 Mixed Quiz' })).toBeInTheDocument();
    });

    it('renders category quiz title for category-quiz mode', () => {
      render(<CounterMixedQuiz {...defaultProps} mode="category-quiz" />);
      expect(screen.getByRole('heading', { name: '🎯 Category Quiz' })).toBeInTheDocument();
    });

    it('shows current progress', () => {
      const questions = [makeQuestion(), makeQuestion()];
      render(
        <CounterMixedQuiz
          {...defaultProps}
          mixedQuestions={questions}
          currentQuestionIndex={1}
        />
      );
      expect(document.querySelector('.quiz-progress')?.textContent).toBe('2 / 2');
    });

    it('calls onSetMode when menu button is clicked', () => {
      render(<CounterMixedQuiz {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /← menu/i }));
      expect(defaultProps.onSetMode).toHaveBeenCalledWith('menu');
    });
  });

  describe('question display', () => {
    it('shows counter group info', () => {
      render(<CounterMixedQuiz {...defaultProps} />);
      expect(screen.getByText('つ — 1-10')).toBeInTheDocument();
    });

    it('shows question text', () => {
      render(<CounterMixedQuiz {...defaultProps} />);
      expect(
        screen.getByText('How do you count 1 generic item?')
      ).toBeInTheDocument();
    });

    it('shows Show Answer button when answer is hidden', () => {
      render(<CounterMixedQuiz {...defaultProps} showAnswer={false} />);
      expect(
        screen.getByRole('button', { name: /show answer/i })
      ).toBeInTheDocument();
      expect(screen.queryByText('一つ (ひとつ)')).not.toBeInTheDocument();
    });

    it('calls onSetShowAnswer when Show Answer is clicked', () => {
      render(<CounterMixedQuiz {...defaultProps} showAnswer={false} />);
      fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
      expect(defaultProps.onSetShowAnswer).toHaveBeenCalledWith(true);
    });
  });

  describe('answer display', () => {
    it('shows pattern and example when answer is visible', () => {
      render(<CounterMixedQuiz {...defaultProps} showAnswer={true} />);
      expect(screen.getByText('一つ (ひとつ)')).toBeInTheDocument();
      expect(screen.getByText('りんごを一つ食べた')).toBeInTheDocument();
      expect(screen.getByText('I ate one apple')).toBeInTheDocument();
      expect(
        screen.getByText('ringo wo hitotsu tabeta')
      ).toBeInTheDocument();
    });

    it('omits romaji line when example has no romaji', () => {
      const question = makeQuestion();
      question.pattern.examples = [{ jp: '一つ', en: 'one' }];
      render(
        <CounterMixedQuiz {...defaultProps} mixedQuestions={[question]} showAnswer={true} />
      );
      expect(screen.getByText('一つ')).toBeInTheDocument();
      expect(screen.queryByText('ringo wo hitotsu tabeta')).not.toBeInTheDocument();
    });

    it('omits example section when pattern has no examples', () => {
      const question = makeQuestion();
      question.pattern.examples = [];
      render(
        <CounterMixedQuiz {...defaultProps} mixedQuestions={[question]} showAnswer={true} />
      );
      expect(document.querySelector('.answer-example')).toBeNull();
    });

    it('calls onHandleAnswer(true) when Knew it is clicked', () => {
      render(<CounterMixedQuiz {...defaultProps} showAnswer={true} />);
      fireEvent.click(screen.getByRole('button', { name: /✅ knew it/i }));
      expect(defaultProps.onHandleAnswer).toHaveBeenCalledWith(true);
    });

    it("calls onHandleAnswer(false) when Didn't know is clicked", () => {
      render(<CounterMixedQuiz {...defaultProps} showAnswer={true} />);
      fireEvent.click(screen.getByRole('button', { name: /❌ didn't know/i }));
      expect(defaultProps.onHandleAnswer).toHaveBeenCalledWith(false);
    });

    it('does not show Show Answer button when answer is visible', () => {
      render(<CounterMixedQuiz {...defaultProps} showAnswer={true} />);
      expect(
        screen.queryByRole('button', { name: /show answer/i })
      ).not.toBeInTheDocument();
    });
  });
});
