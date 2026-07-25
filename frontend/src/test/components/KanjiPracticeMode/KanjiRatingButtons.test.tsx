import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanjiRatingButtons } from '../../../components/KanjiPracticeMode/KanjiRatingButtons';

describe('KanjiRatingButtons', () => {
  const mockOnReview = vi.fn();
  const intervals = {
    again: '< 1m',
    hard: '5m',
    good: '10m',
    easy: '30m',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render four rating buttons', () => {
      render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('should render each rating label', () => {
      render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      expect(screen.getByText('Again')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Easy')).toBeInTheDocument();
    });

    it('should render key hints for each rating', () => {
      render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should render the provided intervals', () => {
      render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      expect(screen.getByText('< 1m')).toBeInTheDocument();
      expect(screen.getByText('5m')).toBeInTheDocument();
      expect(screen.getByText('10m')).toBeInTheDocument();
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    it('should have the correct container class', () => {
      const { container } = render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      expect(container.querySelector('.kanji-rating-buttons')).toBeInTheDocument();
    });

    it('should apply rating-specific class names', () => {
      const { container } = render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      expect(container.querySelector('.rating-btn.again')).toBeInTheDocument();
      expect(container.querySelector('.rating-btn.hard')).toBeInTheDocument();
      expect(container.querySelector('.rating-btn.good')).toBeInTheDocument();
      expect(container.querySelector('.rating-btn.easy')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should call onReview with "again" when the Again button is clicked', () => {
      render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      fireEvent.click(screen.getByText('Again'));

      expect(mockOnReview).toHaveBeenCalledTimes(1);
      expect(mockOnReview).toHaveBeenCalledWith('again');
    });

    it('should call onReview with "hard" when the Hard button is clicked', () => {
      render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      fireEvent.click(screen.getByText('Hard'));

      expect(mockOnReview).toHaveBeenCalledWith('hard');
    });

    it('should call onReview with "good" when the Good button is clicked', () => {
      render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      fireEvent.click(screen.getByText('Good'));

      expect(mockOnReview).toHaveBeenCalledWith('good');
    });

    it('should call onReview with "easy" when the Easy button is clicked', () => {
      render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      fireEvent.click(screen.getByText('Easy'));

      expect(mockOnReview).toHaveBeenCalledWith('easy');
    });
  });

  describe('Dynamic intervals', () => {
    it('should display updated intervals when props change', () => {
      const { rerender } = render(
        <KanjiRatingButtons intervals={intervals} onReview={mockOnReview} />
      );

      expect(screen.getByText('30m')).toBeInTheDocument();

      const newIntervals = {
        again: '1d',
        hard: '3d',
        good: '5d',
        easy: '7d',
      };

      rerender(
        <KanjiRatingButtons intervals={newIntervals} onReview={mockOnReview} />
      );

      expect(screen.getByText('1d')).toBeInTheDocument();
      expect(screen.getByText('3d')).toBeInTheDocument();
      expect(screen.getByText('5d')).toBeInTheDocument();
      expect(screen.getByText('7d')).toBeInTheDocument();
    });
  });
});
