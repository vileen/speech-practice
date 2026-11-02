import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryModeSetup } from '../../components/MemoryMode/MemoryModeSetup';
import type { Lesson } from '../../types/index.js';

describe('MemoryModeSetup', () => {
  const mockOnToggleLesson = vi.fn();
  const mockOnStart = vi.fn();

  const makeLesson = (id: string, title: string, date: string): Lesson => ({
    id,
    date,
    title,
    order: 1,
    topics: [],
    vocabCount: 10,
    grammarCount: 5,
  });

  const lessons: Lesson[] = [
    makeLesson('lesson-2', 'Verbs', '2026-10-10'),
    makeLesson('lesson-1', 'Greetings', '2026-10-01'),
  ];

  const defaultProps = {
    lessons,
    stats: { total: 50, due: 12, new: 5, review: 33 },
    selectedLessons: [] as string[],
    selectedVocabCount: 0,
    onToggleLesson: mockOnToggleLesson,
    onStart: mockOnStart,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<MemoryModeSetup {...defaultProps} />);

      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
      expect(screen.getByText(/Test your recall by translating from English to Japanese/i)).toBeInTheDocument();
      expect(screen.getByText(/Uses FSRS \(Free Spaced Repetition Scheduler\)/i)).toBeInTheDocument();
    });

    it('should render all four stat boxes with correct values', () => {
      render(<MemoryModeSetup {...defaultProps} />);

      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Total Cards')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Due Now')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('33')).toBeInTheDocument();
      expect(screen.getByText('In Review')).toBeInTheDocument();
    });

    it('should render lesson chips sorted by date (oldest first)', () => {
      render(<MemoryModeSetup {...defaultProps} />);

      const chips = screen.getAllByRole('button', { name: /#\d/i });
      expect(chips).toHaveLength(2);
      expect(chips[0]).toHaveTextContent('Greetings');
      expect(chips[1]).toHaveTextContent('Verbs');
    });

    it('should mark selected lessons with the selected class', () => {
      render(<MemoryModeSetup {...defaultProps} selectedLessons={['lesson-1']} />);

      const selectedChip = screen.getByRole('button', { name: /Greetings/i });
      expect(selectedChip.className).toContain('selected');
    });

    it('should fall back to "Lesson <id>" when lesson title is empty', () => {
      const untitled = [makeLesson('lesson-9', '', '2026-10-05')];
      render(<MemoryModeSetup {...defaultProps} lessons={untitled} />);

      expect(screen.getByRole('button', { name: /Lesson lesson-9/i })).toBeInTheDocument();
    });

    it('should show the no-lessons message when lessons is undefined', () => {
      render(<MemoryModeSetup {...defaultProps} lessons={undefined} />);

      expect(screen.getByText(/No lessons available/i)).toBeInTheDocument();
    });

    it('should show the no-lessons message when lessons array is empty', () => {
      render(<MemoryModeSetup {...defaultProps} lessons={[]} />);

      expect(screen.getByText(/No lessons available/i)).toBeInTheDocument();
    });
  });

  describe('Start button', () => {
    it('should be disabled when no lesson is selected', () => {
      render(<MemoryModeSetup {...defaultProps} />);

      const startBtn = screen.getByRole('button', { name: /study|start/i });
      expect(startBtn).toBeDisabled();
      expect(startBtn).toHaveAttribute('title', 'Select at least one lesson to study');
    });

    it('should be enabled when a lesson is selected', () => {
      render(<MemoryModeSetup {...defaultProps} selectedLessons={['lesson-1']} />);

      expect(screen.getByRole('button', { name: /study|start/i })).toBeEnabled();
    });

    it('should call onStart when clicked', () => {
      render(<MemoryModeSetup {...defaultProps} selectedLessons={['lesson-1']} />);

      fireEvent.click(screen.getByRole('button', { name: /study|start/i }));
      expect(mockOnStart).toHaveBeenCalledTimes(1);
    });

    it('should show due-card label when cards are due', () => {
      render(<MemoryModeSetup {...defaultProps} selectedLessons={['lesson-1']} />);

      expect(screen.getByRole('button', { name: /Study 12 Due Cards/i })).toBeInTheDocument();
    });

    it('should include new-vocab count in the label when selectedVocabCount > 0', () => {
      render(
        <MemoryModeSetup
          {...defaultProps}
          selectedLessons={['lesson-1']}
          selectedVocabCount={7}
        />
      );

      expect(screen.getByRole('button', { name: /Study 12 Due Cards \(\+7 new\)/i })).toBeInTheDocument();
    });

    it('should show new-session label when nothing is due', () => {
      render(
        <MemoryModeSetup
          {...defaultProps}
          stats={{ total: 50, due: 0, new: 5, review: 45 }}
          selectedLessons={['lesson-1']}
        />
      );

      expect(screen.getByRole('button', { name: /Start New Session/i })).toBeInTheDocument();
    });

    it('should include vocab count in new-session label', () => {
      render(
        <MemoryModeSetup
          {...defaultProps}
          stats={{ total: 50, due: 0, new: 5, review: 45 }}
          selectedLessons={['lesson-1']}
          selectedVocabCount={7}
        />
      );

      expect(screen.getByRole('button', { name: /Start New Session \(7 words\)/i })).toBeInTheDocument();
    });
  });

  describe('Lesson interaction', () => {
    it('should call onToggleLesson with lesson id when a chip is clicked', () => {
      render(<MemoryModeSetup {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Verbs/i }));
      expect(mockOnToggleLesson).toHaveBeenCalledWith('lesson-2');
    });
  });

  describe('Hint', () => {
    it('should show the hint when no lesson is selected', () => {
      render(<MemoryModeSetup {...defaultProps} />);

      expect(screen.getByText(/Select at least one lesson above to start studying/i)).toBeInTheDocument();
    });

    it('should hide the hint when a lesson is selected', () => {
      const { container } = render(
        <MemoryModeSetup {...defaultProps} selectedLessons={['lesson-1']} />
      );

      const hint = container.querySelector('.hint');
      expect(hint?.className).toContain('hint-hidden');
    });
  });
});
