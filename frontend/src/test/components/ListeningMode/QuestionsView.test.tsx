import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionsView } from '../../../components/ListeningMode/QuestionsView';
import type { ListeningQuestion } from '../../../hooks/useListeningMode';

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

const defaultProps = {
  questions: mockQuestions,
  answers: {} as Record<number, number>,
  showFurigana: false,
  onSelectAnswer: vi.fn(),
  onSubmit: vi.fn(),
  onBack: vi.fn(),
};

describe('ListeningMode QuestionsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Questions heading', () => {
    render(<QuestionsView {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Questions' })).toBeInTheDocument();
  });

  it('renders answered progress out of total questions', () => {
    render(<QuestionsView {...defaultProps} answers={{ 1: 0, 2: 1 }} />);

    expect(screen.getByText('2 / 3 answered')).toBeInTheDocument();
  });

  it('renders zero progress when no answers are selected', () => {
    render(<QuestionsView {...defaultProps} />);

    expect(screen.getByText('0 / 3 answered')).toBeInTheDocument();
  });

  it('renders a card for each question', () => {
    const { container } = render(<QuestionsView {...defaultProps} />);

    const cards = container.querySelectorAll('.question-card');
    expect(cards.length).toBe(3);
  });

  it('renders question numbers starting at 1', () => {
    const { container } = render(<QuestionsView {...defaultProps} />);

    const numbers = container.querySelectorAll('.question-number');
    expect(numbers.length).toBe(3);
    expect(numbers[0]).toHaveTextContent('1');
    expect(numbers[1]).toHaveTextContent('2');
    expect(numbers[2]).toHaveTextContent('3');
  });

  it('renders question type labels for all types', () => {
    render(<QuestionsView {...defaultProps} />);

    expect(screen.getByText('Main Idea')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
    expect(screen.getByText('Inference')).toBeInTheDocument();
  });

  it('renders question text for each question', () => {
    render(<QuestionsView {...defaultProps} />);

    expect(screen.getByText('What is the main topic?')).toBeInTheDocument();
    expect(screen.getByText('Where did they go?')).toBeInTheDocument();
    expect(screen.getByText('Why was he late?')).toBeInTheDocument();
  });

  it('renders all options with letter labels for each question', () => {
    render(<QuestionsView {...defaultProps} />);

    // Question 1 options
    expect(screen.getByText('Daily life')).toBeInTheDocument();
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  it('marks a question card as answered when an answer exists', () => {
    const { container } = render(<QuestionsView {...defaultProps} answers={{ 1: 0 }} />);

    const cards = container.querySelectorAll('.question-card');
    expect(cards[0].className).toContain('answered');
    expect(cards[1].className).not.toContain('answered');
  });

  it('checks the radio for the selected option', () => {
    render(<QuestionsView {...defaultProps} answers={{ 2: 1 }} />);

    const selectedRadio = screen.getByRole('radio', { name: /Park/ });
    expect(selectedRadio).toBeChecked();

    const otherRadio = screen.getByRole('radio', { name: /School/ });
    expect(otherRadio).not.toBeChecked();
  });

  it('calls onSelectAnswer with question id and option index when an option is clicked', () => {
    render(<QuestionsView {...defaultProps} />);

    fireEvent.click(screen.getByRole('radio', { name: /Food/ }));
    expect(defaultProps.onSelectAnswer).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectAnswer).toHaveBeenCalledWith(1, 2);
  });

  it('allows selecting a different option in the same question', () => {
    render(<QuestionsView {...defaultProps} answers={{ 1: 0 }} />);

    fireEvent.click(screen.getByRole('radio', { name: /Travel/ }));
    expect(defaultProps.onSelectAnswer).toHaveBeenCalledWith(1, 3);
  });

  it('disables submit button when no answers are selected', () => {
    render(<QuestionsView {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Submit Answers/i })).toBeDisabled();
  });

  it('enables submit button when at least one answer is selected', () => {
    render(<QuestionsView {...defaultProps} answers={{ 3: 2 }} />);

    expect(screen.getByRole('button', { name: /Submit Answers/i })).toBeEnabled();
  });

  it('calls onSubmit when submit button is clicked', () => {
    render(<QuestionsView {...defaultProps} answers={{ 1: 0 }} />);

    fireEvent.click(screen.getByRole('button', { name: /Submit Answers/i }));
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back button is clicked', () => {
    render(<QuestionsView {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Back to Audio/i }));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('groups radios by question so only one option is selectable per question', () => {
    render(<QuestionsView {...defaultProps} />);

    const radiosQ1 = screen.getAllByRole('radio').filter(
      r => (r as HTMLInputElement).name === 'question-1'
    );
    expect(radiosQ1.length).toBe(4);
  });

  it('renders an empty list when there are no questions', () => {
    render(<QuestionsView {...defaultProps} questions={[]} />);

    expect(screen.getByText('0 / 0 answered')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Answers/i })).toBeDisabled();
  });

  it('marks only the matching option as selected via class name', () => {
    const { container } = render(<QuestionsView {...defaultProps} answers={{ 1: 2 }} />);

    const selectedLabels = container.querySelectorAll('.option-label.selected');
    expect(selectedLabels.length).toBe(1);
    expect(selectedLabels[0]).toHaveTextContent('Food');
  });
});
