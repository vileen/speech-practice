import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsView } from '../../../components/ListeningMode/ResultsView';
import type { QuizResult, ListeningQuestion } from '../../../hooks/useListeningMode';

vi.mock('../../../components/ReadingMode/FuriganaDisplay', () => ({
  FuriganaDisplay: ({ text }: { text: string }) => <span>{text}</span>,
}));

const mockQuestions: ListeningQuestion[] = [
  {
    id: 1,
    passage_id: 1,
    question_text: 'What is the main topic?',
    question_type: 'main_idea',
    options: ['Daily life', 'Weather', 'Food', 'Travel'],
    correct_answer: 0,
    explanation: 'The passage is about daily routines.',
  },
  {
    id: 2,
    passage_id: 1,
    question_text: 'Where did they go?',
    question_type: 'detail',
    options: ['School', 'Park', 'Office', 'Store'],
    correct_answer: 1,
    explanation: 'They went to the park.',
  },
  {
    id: 3,
    passage_id: 1,
    question_text: 'Why was he late?',
    question_type: 'inference',
    options: ['Overslept', 'Traffic', 'Missed bus', 'Forgot time'],
    correct_answer: 2,
    explanation: 'The text implies he missed the bus.',
  },
];

const mockResult: QuizResult = {
  score: 67,
  correctCount: 2,
  totalQuestions: 3,
  listeningTimeSeconds: 125,
  results: [
    {
      questionId: 1,
      selectedOption: 0,
      isCorrect: true,
      correctAnswer: 0,
      explanation: 'The passage is about daily routines.',
      questionType: 'main_idea',
    },
    {
      questionId: 2,
      selectedOption: 0,
      isCorrect: false,
      correctAnswer: 1,
      explanation: 'They went to the park.',
      questionType: 'detail',
    },
    {
      questionId: 3,
      selectedOption: 2,
      isCorrect: true,
      correctAnswer: 2,
      explanation: 'The text implies he missed the bus.',
      questionType: 'inference',
    },
  ],
};

const defaultProps = {
  result: mockResult,
  questions: mockQuestions,
  transcript: null as { transcript: string; japaneseText: string } | null,
  showTranscript: false,
  showFurigana: false,
  onShowTranscript: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
};

describe('ListeningMode ResultsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the score and results heading', () => {
    render(<ResultsView {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Results' })).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('renders correct answer count out of total', () => {
    render(<ResultsView {...defaultProps} />);

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('renders formatted listening time when present', () => {
    render(<ResultsView {...defaultProps} />);

    expect(screen.getByText('Listening Time')).toBeInTheDocument();
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('does not render listening time when absent', () => {
    render(<ResultsView {...defaultProps} result={{ ...mockResult, listeningTimeSeconds: null }} />);

    expect(screen.queryByText('Listening Time')).not.toBeInTheDocument();
  });

  it('renders transcript reveal button when showTranscript is false', () => {
    render(<ResultsView {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Show Transcript/i })).toBeInTheDocument();
  });

  it('calls onShowTranscript when reveal button is clicked', () => {
    render(<ResultsView {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Show Transcript/i }));
    expect(defaultProps.onShowTranscript).toHaveBeenCalledTimes(1);
  });

  it('renders transcript when showTranscript is true and transcript is provided', () => {
    const transcript = { transcript: 'Hello', japaneseText: 'こんにちは' };
    render(<ResultsView {...defaultProps} showTranscript={true} transcript={transcript} />);

    expect(screen.getByRole('heading', { name: 'Transcript' })).toBeInTheDocument();
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
  });

  it('does not render transcript section when transcript is null even if showTranscript is true', () => {
    render(<ResultsView {...defaultProps} showTranscript={true} />);

    expect(screen.queryByRole('heading', { name: 'Transcript' })).not.toBeInTheDocument();
  });

  it('renders a review section for each answer', () => {
    const { container } = render(<ResultsView {...defaultProps} />);

    const reviewItems = container.querySelectorAll('.answer-review');
    expect(reviewItems.length).toBe(3);
  });

  it('displays correct status for correct answers', () => {
    render(<ResultsView {...defaultProps} />);

    const correctStatuses = screen.getAllByText('✓ Correct');
    expect(correctStatuses.length).toBeGreaterThanOrEqual(1);
  });

  it('displays incorrect status for incorrect answers', () => {
    render(<ResultsView {...defaultProps} />);

    expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
  });

  it('shows the correct answer for incorrect responses', () => {
    render(<ResultsView {...defaultProps} />);

    const correctAnswerLabels = screen.getAllByText('Correct answer:');
    expect(correctAnswerLabels.length).toBe(1);
  });

  it('does not show correct answer for correct responses', () => {
    const allCorrectResult: QuizResult = {
      ...mockResult,
      score: 100,
      correctCount: 3,
      results: mockResult.results.map(r => ({ ...r, isCorrect: true })),
    };
    render(<ResultsView {...defaultProps} result={allCorrectResult} />);

    expect(screen.queryByText('Correct answer:')).not.toBeInTheDocument();
  });

  it('renders question type labels', () => {
    render(<ResultsView {...defaultProps} />);

    expect(screen.getByText('Main Idea')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
    expect(screen.getByText('Inference')).toBeInTheDocument();
  });

  it('renders explanations for each answer', () => {
    render(<ResultsView {...defaultProps} />);

    expect(screen.getByText('The passage is about daily routines.')).toBeInTheDocument();
    expect(screen.getByText('They went to the park.')).toBeInTheDocument();
    expect(screen.getByText('The text implies he missed the bus.')).toBeInTheDocument();
  });

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

  it('renders selected option letter and text', () => {
    const { container } = render(<ResultsView {...defaultProps} />);

    const selectedAnswers = container.querySelectorAll('.your-answer .value');
    expect(selectedAnswers.length).toBe(3);
    expect(selectedAnswers[0]).toHaveTextContent('A.');
    expect(selectedAnswers[0]).toHaveTextContent('Daily life');
  });

  it('uses amber score color for medium scores', () => {
    const { container } = render(<ResultsView {...defaultProps} />);

    const scoreCircle = container.querySelector('.score-circle');
    expect(scoreCircle).toHaveAttribute(
      'style',
      expect.stringContaining('rgb(251, 191, 36)')
    );
  });

  it('uses green score color for high scores', () => {
    const { container } = render(
      <ResultsView {...defaultProps} result={{ ...mockResult, score: 85 }} />
    );

    const scoreCircle = container.querySelector('.score-circle');
    expect(scoreCircle).toHaveAttribute(
      'style',
      expect.stringContaining('rgb(74, 222, 128)')
    );
  });

  it('uses red score color for low scores', () => {
    const { container } = render(
      <ResultsView {...defaultProps} result={{ ...mockResult, score: 45 }} />
    );

    const scoreCircle = container.querySelector('.score-circle');
    expect(scoreCircle).toHaveAttribute(
      'style',
      expect.stringContaining('rgb(248, 113, 113)')
    );
  });

  it('handles missing question gracefully', () => {
    const resultWithMissingQuestion: QuizResult = {
      ...mockResult,
      results: [
        ...mockResult.results,
        {
          questionId: 999,
          selectedOption: 0,
          isCorrect: false,
          correctAnswer: 1,
          explanation: 'Missing question test.',
          questionType: 'detail',
        },
      ],
    };

    render(<ResultsView {...defaultProps} result={resultWithMissingQuestion} />);

    expect(screen.getByText('Missing question test.')).toBeInTheDocument();
  });
});
