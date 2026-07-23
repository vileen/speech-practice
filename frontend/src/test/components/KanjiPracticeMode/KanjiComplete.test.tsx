import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanjiComplete } from '../../../components/KanjiPracticeMode/KanjiComplete';

describe('KanjiComplete', () => {
  const mockOnPracticeMore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render completion message', () => {
      render(
        <KanjiComplete
          stats={{ total: 10, due: 0 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      expect(screen.getByText('Practice Complete!')).toBeInTheDocument();
      expect(
        screen.getByText("You've reviewed all due kanji for now.")
      ).toBeInTheDocument();
    });

    it('should render total kanji stat', () => {
      render(
        <KanjiComplete
          stats={{ total: 42, due: 5 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Total Kanji')).toBeInTheDocument();
    });

    it('should render still due stat', () => {
      render(
        <KanjiComplete
          stats={{ total: 42, due: 5 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Still Due')).toBeInTheDocument();
    });

    it('should render practice more button', () => {
      render(
        <KanjiComplete
          stats={{ total: 10, due: 0 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      expect(
        screen.getByRole('button', { name: /practice more/i })
      ).toBeInTheDocument();
    });

    it('should have correct container class', () => {
      const { container } = render(
        <KanjiComplete
          stats={{ total: 10, due: 0 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      expect(
        container.querySelector('.kanji-practice-complete')
      ).toBeInTheDocument();
    });
  });

  describe('Stats variations', () => {
    it('should display zero stats', () => {
      render(
        <KanjiComplete
          stats={{ total: 0, due: 0 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(2);
    });

    it('should display large stats', () => {
      render(
        <KanjiComplete
          stats={{ total: 9999, due: 1234 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('should update stats when props change', () => {
      const { rerender } = render(
        <KanjiComplete
          stats={{ total: 10, due: 3 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      rerender(
        <KanjiComplete
          stats={{ total: 20, due: 1 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should call onPracticeMore when button is clicked', () => {
      render(
        <KanjiComplete
          stats={{ total: 10, due: 0 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      const button = screen.getByRole('button', { name: /practice more/i });
      fireEvent.click(button);

      expect(mockOnPracticeMore).toHaveBeenCalledTimes(1);
    });

    it('should call onPracticeMore each time button is clicked', () => {
      render(
        <KanjiComplete
          stats={{ total: 10, due: 0 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      const button = screen.getByRole('button', { name: /practice more/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnPracticeMore).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should render button as a single clickable element', () => {
      render(
        <KanjiComplete
          stats={{ total: 10, due: 0 }}
          onPracticeMore={mockOnPracticeMore}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });
  });
});
