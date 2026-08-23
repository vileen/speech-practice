import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonList, type LessonListProps } from '../../../components/LessonMode/LessonList';
import type { Lesson } from '../../../hooks/useLessonMode';

vi.mock('../../../components/Header/index.js', () => ({
  Header: ({ title, icon, onBack, actions }: any) => (
    <header data-testid="header">
      <button data-testid="back-btn" onClick={onBack}>Back</button>
      <h1>{title}{icon && <span>{icon}</span>}</h1>
      <div data-testid="header-actions">{actions}</div>
    </header>
  ),
}));

vi.mock('../../../translations.js', () => ({
  translateLessonTitle: vi.fn((title: string) => `Translated: ${title}`),
}));

const mockLessons: Lesson[] = [
  {
    id: '2026-08-22',
    date: '2026-08-22',
    title: 'Lekcja Testowa',
    order: 3,
    topics: ['Basics', 'Greetings'],
    vocabCount: 10,
    grammarCount: 2,
  },
  {
    id: '2026-08-21',
    date: '2026-08-21',
    title: 'Druga Lekcja',
    order: 2,
    topics: ['Grammar'],
    vocabCount: 5,
    grammarCount: 4,
  },
  {
    id: '2026-08-20',
    date: '2026-08-20',
    title: 'Pierwsza Lekcja',
    order: 1,
    topics: ['Basics'],
    vocabCount: 8,
    grammarCount: 1,
  },
];

describe('LessonList', () => {
  const onBack = vi.fn();
  const onLessonClick = vi.fn();
  const setSortOrder = vi.fn();
  const setSelectedTags = vi.fn();
  const lessonsListRef = { current: null } as React.RefObject<HTMLDivElement>;

  const defaultProps: LessonListProps = {
    lessons: mockLessons,
    sortedLessons: mockLessons,
    allTags: ['Basics', 'Greetings', 'Grammar'],
    selectedTags: [],
    setSelectedTags,
    sortOrder: 'newest',
    setSortOrder,
    onBack,
    onLessonClick,
    lessonsListRef,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title and back button', () => {
    render(<LessonList {...defaultProps} />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByTestId('back-btn')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<LessonList {...defaultProps} />);

    fireEvent.click(screen.getByTestId('back-btn'));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders sort order controls in header', () => {
    render(<LessonList {...defaultProps} />);

    const actions = screen.getByTestId('header-actions');
    expect(actions).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /newest/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /oldest/i })).toBeInTheDocument();
  });

  it('switches sort order to newest when newest button is clicked', () => {
    render(<LessonList {...defaultProps} sortOrder="oldest" />);

    fireEvent.click(screen.getByRole('button', { name: /newest/i }));
    expect(setSortOrder).toHaveBeenCalledWith('newest');
  });

  it('switches sort order to oldest when oldest button is clicked', () => {
    render(<LessonList {...defaultProps} sortOrder="newest" />);

    fireEvent.click(screen.getByRole('button', { name: /oldest/i }));
    expect(setSortOrder).toHaveBeenCalledWith('oldest');
  });

  it('renders all tag filters when tags exist', () => {
    render(<LessonList {...defaultProps} />);

    defaultProps.allTags.forEach(tag => {
      expect(screen.getByRole('button', { name: tag })).toBeInTheDocument();
    });
  });

  it('does not render tag filters when no tags exist', () => {
    render(<LessonList {...defaultProps} allTags={[]} />);

    expect(screen.queryByText('Filter by tag:')).not.toBeInTheDocument();
  });

  it('selects a tag when clicked', () => {
    render(<LessonList {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Basics' }));
    expect(setSelectedTags).toHaveBeenCalledWith(expect.any(Function));
  });

  it('renders clear filters button only when tags are selected', () => {
    const { rerender } = render(<LessonList {...defaultProps} selectedTags={['Basics']} />);

    expect(screen.getByRole('button', { name: /clear \(1\)/i })).toBeInTheDocument();

    rerender(<LessonList {...defaultProps} selectedTags={[]} />);
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('clears selected tags when clear button is clicked', () => {
    render(<LessonList {...defaultProps} selectedTags={['Basics', 'Grammar']} />);

    fireEvent.click(screen.getByRole('button', { name: /clear \(2\)/i }));
    expect(setSelectedTags).toHaveBeenCalledWith([]);
  });

  it('shows results count when tags are selected', () => {
    render(<LessonList {...defaultProps} selectedTags={['Basics']} sortedLessons={[mockLessons[0], mockLessons[2]]} />);

    expect(screen.getByText(/showing 2 of 2 lessons/i)).toBeInTheDocument();
  });

  it('renders each lesson card with formatted date and translated title', () => {
    render(<LessonList {...defaultProps} />);

    expect(screen.getByText('2026-08-22')).toBeInTheDocument();
    expect(screen.getByText('Translated: Lekcja Testowa')).toBeInTheDocument();
  });

  it('numbers lessons correctly for newest sort order', () => {
    render(<LessonList {...defaultProps} sortOrder="newest" sortedLessons={mockLessons} />);

    const cards = screen.getAllByText(/lesson #/i);
    expect(cards[0]).toHaveTextContent('Lesson #3');
    expect(cards[1]).toHaveTextContent('Lesson #2');
    expect(cards[2]).toHaveTextContent('Lesson #1');
  });

  it('numbers lessons correctly for oldest sort order', () => {
    render(<LessonList {...defaultProps} sortOrder="oldest" sortedLessons={mockLessons} />);

    const cards = screen.getAllByText(/lesson #/i);
    expect(cards[0]).toHaveTextContent('Lesson #1');
    expect(cards[1]).toHaveTextContent('Lesson #2');
    expect(cards[2]).toHaveTextContent('Lesson #3');
  });

  it('displays vocabulary and grammar counts for each lesson', () => {
    render(<LessonList {...defaultProps} />);

    expect(screen.getByText(/📝 10 words/i)).toBeInTheDocument();
    expect(screen.getByText(/📖 2 grammar/i)).toBeInTheDocument();
  });

  it('renders topics truncated to first three', () => {
    render(<LessonList {...defaultProps} />);

    expect(screen.getByText(/Basics, Greetings/)).toBeInTheDocument();
  });

  it('calls onLessonClick when a lesson card is clicked', () => {
    render(<LessonList {...defaultProps} />);

    fireEvent.click(screen.getByText('Translated: Lekcja Testowa'));
    expect(onLessonClick).toHaveBeenCalledWith('2026-08-22');
  });

  it('renders empty list when no lessons are provided', () => {
    render(<LessonList {...defaultProps} lessons={[]} sortedLessons={[]} />);

    expect(screen.queryByText(/lesson #/i)).not.toBeInTheDocument();
  });
});
