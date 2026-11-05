import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionsView } from '../../../components/ReadingMode/QuestionsView';
import type { Question } from '../../../components/ReadingMode/types';

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
    options: ['学校', '公園', '会社'],
    correct_answer: 1,
    explanation: '公園に行きました。',
    question_type: 'detail',
  },
  {
    id: 3,
    question: 'なぜ彼は遅刻しましたか？',
    options: ['寝坊', '渋滞'],
    correct_answer: 2,
    explanation: 'バスを逃したことが示唆されています。',
    question_type: 'inference',
  },
];

const defaultProps = {
  questions: mockQuestions,
  answers: {} as Record<number, number>,
  showFurigana: false,
  onAnswerSelect: vi.fn(),
  onBack: vi.fn(),
  onSubmit: vi.fn(),
};

const renderView = (overrides?: Partial<typeof defaultProps>) =>
  render(<QuestionsView {...defaultProps} {...overrides} />);

describe('QuestionsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all questions with their type labels', () => {
    renderView();

    expect(screen.getByText('この文章の主題は何ですか？')).toBeInTheDocument();
    expect(screen.getByText('彼らはどこに行きましたか？')).toBeInTheDocument();
    expect(screen.getByText('Main Idea')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
    expect(screen.getByText('Inference')).toBeInTheDocument();
  });

  it('shows question numbering starting at 1', () => {
    renderView();
    const numbers = screen.getAllByText(/^[123]$/);
    expect(numbers).toHaveLength(3);
  });

  it('displays progress as 0 answered when no answers given', () => {
    renderView();
    expect(screen.getByText('0 / 3 answered')).toBeInTheDocument();
  });

  it('displays updated progress when answers are provided', () => {
    renderView({ answers: { 1: 0, 2: 1 } });
    expect(screen.getByText('2 / 3 answered')).toBeInTheDocument();
  });

  it('calls onAnswerSelect with question id and option index when an option is chosen', () => {
    renderView();
    fireEvent.click(screen.getAllByRole('radio')[1]); // question 1, option B (天気)
    expect(defaultProps.onAnswerSelect).toHaveBeenCalledWith(1, 1);
  });

  it('marks a question as answered when it has an answer', () => {
    const { container } = renderView({ answers: { 1: 2 } });
    const cards = container.querySelectorAll('.question-card');
    expect(cards[0].className).toContain('answered');
    expect(cards[1].className).not.toContain('answered');
  });

  it('disables submit button when no answers are given', () => {
    renderView();
    expect(screen.getByRole('button', { name: /submit answers/i })).toBeDisabled();
  });

  it('enables submit button when at least one answer is given', () => {
    renderView({ answers: { 2: 0 } });
    expect(screen.getByRole('button', { name: /submit answers/i })).toBeEnabled();
  });

  it('calls onSubmit when submit button is clicked', () => {
    renderView({ answers: { 1: 0 } });
    fireEvent.click(screen.getByRole('button', { name: /submit answers/i }));
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back button is clicked', () => {
    renderView();
    fireEvent.click(screen.getByRole('button', { name: /back to passage/i }));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('renders option letters A, B, C, D for each question', () => {
    const { container } = renderView();
    const firstQuestion = container.querySelector('.question-card')!;
    const optionLetters = Array.from(
      firstQuestion.querySelectorAll('.option-letter')
    ).map(el => el.textContent);
    expect(optionLetters).toEqual(['A', 'B', 'C', 'D']);
  });
});
