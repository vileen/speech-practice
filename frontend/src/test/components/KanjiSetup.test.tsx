import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanjiSetup } from '../../components/KanjiPracticeMode/KanjiSetup';

describe('KanjiSetup', () => {
  const mockOnLessonChange = vi.fn();
  const mockOnStart = vi.fn();

  const defaultProps = {
    stats: { total: 100, due: 25, new: 10 },
    availableLessons: ['lesson-1', 'lesson-2', 'lesson-3'],
    selectedLessons: [] as string[],
    filteredDueCount: 25,
    isStarting: false,
    onLessonChange: mockOnLessonChange,
    onStart: mockOnStart,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render description text', () => {
      render(<KanjiSetup {...defaultProps} />);

      expect(screen.getByText(/Learn kanji using the Kodansha Kanji Learner's Course method/i)).toBeInTheDocument();
      expect(screen.getByText(/See the kanji, recall the meaning, then check your answer/i)).toBeInTheDocument();
    });

    it('should render stats cards with correct values', () => {
      render(<KanjiSetup {...defaultProps} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Total Kanji')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Due for Review')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should render keyboard shortcuts section', () => {
      render(<KanjiSetup {...defaultProps} />);

      expect(screen.getByText(/Keyboard Shortcuts/i)).toBeInTheDocument();
      expect(screen.getByText(/Space/i)).toBeInTheDocument();
      expect(screen.getByText(/Reveal answer \/ Again/i)).toBeInTheDocument();
    });

    it('should render all shortcut keys', () => {
      render(<KanjiSetup {...defaultProps} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/Hard/)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/Good/)).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText(/Easy/)).toBeInTheDocument();
    });
  });

  describe('Lesson Filter', () => {
    it('should render lesson filter when lessons are available', () => {
      render(<KanjiSetup {...defaultProps} />);

      expect(screen.getByText(/Filter by Lesson/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should not render lesson filter when no lessons available', () => {
      render(<KanjiSetup {...defaultProps} availableLessons={[]} />);

      expect(screen.queryByText(/Filter by Lesson/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should render all lesson options including "All Lessons"', () => {
      render(<KanjiSetup {...defaultProps} />);

      expect(screen.getByText('All Lessons')).toBeInTheDocument();
      expect(screen.getByText('Lesson lesson-1')).toBeInTheDocument();
      expect(screen.getByText('Lesson lesson-2')).toBeInTheDocument();
      expect(screen.getByText('Lesson lesson-3')).toBeInTheDocument();
    });

    it('should show selected lesson in dropdown', () => {
      render(<KanjiSetup {...defaultProps} selectedLessons={['lesson-2']} />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('lesson-2');
    });

    it('should default to "All Lessons" when no lesson selected', () => {
      render(<KanjiSetup {...defaultProps} selectedLessons={[]} />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('');
    });
  });

  describe('Start Button', () => {
    it('should render start button with due count', () => {
      render(<KanjiSetup {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Start Practice \(25 due\)/i })).toBeInTheDocument();
    });

    it('should show "Loading..." when isStarting is true', () => {
      render(<KanjiSetup {...defaultProps} isStarting={true} />);

      expect(screen.getByRole('button', { name: /Loading/i })).toBeInTheDocument();
      expect(screen.queryByText(/Start Practice/i)).not.toBeInTheDocument();
    });

    it('should disable button when isStarting is true', () => {
      render(<KanjiSetup {...defaultProps} isStarting={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should enable button when isStarting is false', () => {
      render(<KanjiSetup {...defaultProps} isStarting={false} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should show correct filtered due count', () => {
      render(<KanjiSetup {...defaultProps} filteredDueCount={12} />);

      expect(screen.getByRole('button', { name: /Start Practice \(12 due\)/i })).toBeInTheDocument();
    });

    it('should show zero due count', () => {
      render(<KanjiSetup {...defaultProps} filteredDueCount={0} />);

      expect(screen.getByRole('button', { name: /Start Practice \(0 due\)/i })).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onStart when start button is clicked', () => {
      render(<KanjiSetup {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Start Practice/i });
      fireEvent.click(button);

      expect(mockOnStart).toHaveBeenCalledTimes(1);
    });

    it('should not call onStart when button is disabled', () => {
      render(<KanjiSetup {...defaultProps} isStarting={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it('should call onLessonChange when dropdown changes', () => {
      render(<KanjiSetup {...defaultProps} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'lesson-2' } });

      expect(mockOnLessonChange).toHaveBeenCalledTimes(1);
      expect(mockOnLessonChange).toHaveBeenCalledWith('lesson-2');
    });

    it('should call onLessonChange with empty string for "All Lessons"', () => {
      render(<KanjiSetup {...defaultProps} selectedLessons={['lesson-1']} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '' } });

      expect(mockOnLessonChange).toHaveBeenCalledTimes(1);
      expect(mockOnLessonChange).toHaveBeenCalledWith('');
    });

    it('should call onLessonChange for each dropdown change', () => {
      render(<KanjiSetup {...defaultProps} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'lesson-1' } });
      fireEvent.change(select, { target: { value: 'lesson-3' } });
      fireEvent.change(select, { target: { value: '' } });

      expect(mockOnLessonChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty stats', () => {
      render(
        <KanjiSetup
          {...defaultProps}
          stats={{ total: 0, due: 0, new: 0 }}
          filteredDueCount={0}
        />
      );

      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3);
      expect(screen.getByRole('button', { name: /Start Practice \(0 due\)/i })).toBeInTheDocument();
    });

    it('should handle single available lesson', () => {
      render(<KanjiSetup {...defaultProps} availableLessons={['lesson-1']} />);

      expect(screen.getByText('Lesson lesson-1')).toBeInTheDocument();
      expect(screen.queryByText('Lesson lesson-2')).not.toBeInTheDocument();
    });

    it('should handle large numbers in stats', () => {
      render(
        <KanjiSetup
          {...defaultProps}
          stats={{ total: 9999, due: 5000, new: 1234 }}
        />
      );

      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
    });
  });
});
