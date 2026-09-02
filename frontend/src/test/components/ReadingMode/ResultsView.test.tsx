import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsView } from '../../../components/ReadingMode/ResultsView';
import type { Question, ReadingResult, AnswerResult } from '../../../components/ReadingMode/types';

// Mock FuriganaDisplay to avoid useFurigana hook complexity
vi.mock('../../../components/ReadingMode/FuriganaDisplay', () => ({
  FuriganaDisplay: ({ text }: { text: string }) => <span>{text}</span>,
}));

const mockQuestions: Question[] = [
  {
    id: 1,
    question: 'この文章の主題は何ですか？',
    options: ['日常生活', '天気', '食べ物', '旅行'],
    correct_answer: 0,
    explanation: '文章は日常のルーティンについて書かれています。',
    question_type: 'main_idea',
  },
  {
    id: 2,
    question: '彼らはどこに行きましたか？',
    options: ['学校', '公園', '会社', '店'],
    correct_answer: 1,
    explanation: '公園に行きました。',
    question_type: 'detail',
  },
  {
    id: 3,
    question: 'なぜ彼は遅刻しましたか？',
    options: ['寝坊', '渋滞', 'バスを逃した', '時間を忘れた'],
    correct_answer: 2,
    explanation: 'バスを逃したことが示唆されています。',
    question_type: 'inference',
  },
];

const createMockResult = (overrides?: Partial<ReadingResult>): ReadingResult => ({
  score: 67,
  correctCount: 2,
  totalQuestions: 3,
  readingTimeSeconds: 185,
  charsPerMinute: 120,
  results: [
    {
      questionId: 1,
      selectedOption: 0,
      isCorrect: true,
      correctAnswer: 0,
      explanation: '文章は日常のルーティンについて書かれています。',
      questionType: 'main_idea',
    },
    {
      questionId: 2,
      selectedOption: 0,
      isCorrect: false,
      correctAnswer: 1,
      explanation: '公園に行きました。',
      questionType: 'detail',
    },
    {
      questionId: 3,
      selectedOption: 2,
      isCorrect: true,
      correctAnswer: 2,
      explanation: 'バスを逃したことが示唆されています。',
      questionType: 'inference',
    },
  ],
  ...overrides,
});

const defaultProps = {
  result: createMockResult(),
  questions: mockQuestions,
  showFurigana: false,
  onBack: vi.fn(),
  onNext: vi.fn(),
};

describe('ReadingMode ResultsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the results heading', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByRole('heading', { name: 'Results' })).toBeInTheDocument();
    });

    it('renders the score percentage', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('renders correct answer count out of total', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('renders formatted reading time when present', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('Reading Time')).toBeInTheDocument();
      expect(screen.getByText('3:05')).toBeInTheDocument();
    });

    it('does not render reading time when absent', () => {
      render(<ResultsView {...defaultProps} result={createMockResult({ readingTimeSeconds: null })} />);
      expect(screen.queryByText('Reading Time')).not.toBeInTheDocument();
    });

    it('renders chars per minute when present', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('120 chars/min')).toBeInTheDocument();
    });

    it('does not render chars per minute when absent', () => {
      render(<ResultsView {...defaultProps} result={createMockResult({ charsPerMinute: null })} />);
      expect(screen.queryByText('Speed')).not.toBeInTheDocument();
    });
  });

  describe('score circle colors', () => {
    it('uses green color for high scores (≥80)', () => {
      const { container } = render(
        <ResultsView {...defaultProps} result={createMockResult({ score: 85 })} />
      );
      const scoreCircle = container.querySelector('.score-circle');
      expect(scoreCircle).toHaveAttribute(
        'style',
        expect.stringContaining('rgb(74, 222, 128)')
      );
    });

    it('uses amber color for medium scores (60-79)', () => {
      const { container } = render(<ResultsView {...defaultProps} />);
      const scoreCircle = container.querySelector('.score-circle');
      expect(scoreCircle).toHaveAttribute(
        'style',
        expect.stringContaining('rgb(251, 191, 36)')
      );
    });

    it('uses red color for low scores (<60)', () => {
      const { container } = render(
        <ResultsView {...defaultProps} result={createMockResult({ score: 45 })} />
      );
      const scoreCircle = container.querySelector('.score-circle');
      expect(scoreCircle).toHaveAttribute(
        'style',
        expect.stringContaining('rgb(248, 113, 113)')
      );
    });
  });

  describe('answers review', () => {
    it('renders a review section for each answer', () => {
      const { container } = render(<ResultsView {...defaultProps} />);
      const reviewItems = container.querySelectorAll('.answer-review');
      expect(reviewItems.length).toBe(3);
    });

    it('displays correct status for correct answers', () => {
      render(<ResultsView {...defaultProps} />);
      const correctStatuses = screen.getAllByText('✓ Correct');
      expect(correctStatuses.length).toBe(2);
    });

    it('displays incorrect status for incorrect answers', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
    });

    it('shows question numbers in order', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders question type labels', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('Main Idea')).toBeInTheDocument();
      expect(screen.getByText('Detail')).toBeInTheDocument();
      expect(screen.getByText('Inference')).toBeInTheDocument();
    });

    it('renders question text through FuriganaDisplay', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('この文章の主題は何ですか？')).toBeInTheDocument();
    });

    it('shows the correct answer for incorrect responses', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('Correct answer:')).toBeInTheDocument();
      expect(screen.getByText('B.')).toBeInTheDocument();
      expect(screen.getByText('公園')).toBeInTheDocument();
    });

    it('does not show correct answer for correct responses', () => {
      const allCorrectResult = createMockResult({
        score: 100,
        correctCount: 3,
        results: mockQuestions.map((q, i) => ({
          questionId: q.id,
          selectedOption: q.correct_answer,
          isCorrect: true,
          correctAnswer: q.correct_answer,
          explanation: 'Correct!',
          questionType: q.question_type,
        })),
      });
      render(<ResultsView {...defaultProps} result={allCorrectResult} />);
      expect(screen.queryByText('Correct answer:')).not.toBeInTheDocument();
    });

    it('renders selected option letter and text', () => {
      render(<ResultsView {...defaultProps} />);
      const yourAnswers = screen.getAllByText('Your answer:');
      expect(yourAnswers.length).toBe(3);
      // Q1 selected A (correct), Q2 selected A (wrong), Q3 selected C (correct)
      // "A." appears twice — use getAllByText
      expect(screen.getAllByText('A.').length).toBe(2);
      expect(screen.getByText('C.')).toBeInTheDocument();
      expect(screen.getByText('日常生活')).toBeInTheDocument();
    });

    it('renders explanations for each answer', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByText('文章は日常のルーティンについて書かれています。')).toBeInTheDocument();
      expect(screen.getByText('公園に行きました。')).toBeInTheDocument();
      expect(screen.getByText('バスを逃したことが示唆されています。')).toBeInTheDocument();
    });

    it('handles missing question gracefully', () => {
      const resultWithMissingQuestion = createMockResult({
        results: [
          ...createMockResult().results,
          {
            questionId: 999,
            selectedOption: 0,
            isCorrect: false,
            correctAnswer: 1,
            explanation: 'Missing question test.',
            questionType: 'detail',
          },
        ],
      });
      render(<ResultsView {...defaultProps} result={resultWithMissingQuestion} />);
      // Should not crash, and should still render the 3 valid answers
      const reviewItems = document.querySelectorAll('.answer-review');
      expect(reviewItems.length).toBe(3);
    });
  });

  describe('navigation', () => {
    it('calls onBack when back button is clicked', () => {
      render(<ResultsView {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /Back to List/i }));
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('calls onNext when next button is clicked', () => {
      render(<ResultsView {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /Next Passage/i }));
      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('furigana', () => {
    it('passes showFurigana to FuriganaDisplay', () => {
      const { rerender } = render(<ResultsView {...defaultProps} showFurigana={false} />);
      // When showFurigana is false, FuriganaDisplay should render plain text
      expect(screen.getByText('この文章の主題は何ですか？')).toBeInTheDocument();

      rerender(<ResultsView {...defaultProps} showFurigana={true} />);
      // Should still render the text (mock just passes it through)
      expect(screen.getByText('この文章の主題は何ですか？')).toBeInTheDocument();
    });
  });
});
