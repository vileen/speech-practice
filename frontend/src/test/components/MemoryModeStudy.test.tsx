import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryModeStudy } from '../../components/MemoryMode/MemoryModeStudy';
import type { MemoryCard } from '../../hooks/useMemoryProgress';

const makeCard = (overrides: Partial<MemoryCard> = {}): MemoryCard => ({
  id: 'card-1',
  due: new Date('2026-10-25'),
  stability: 2,
  difficulty: 5,
  elapsedDays: 0,
  scheduledDays: 1,
  reps: 0,
  lapses: 0,
  state: 'new',
  phraseId: 'phrase-1',
  phraseType: 'vocabulary',
  lessonId: 'lesson-1',
  jp: '日本語を勉強します',
  en: 'I study Japanese',
  romaji: 'nihongo wo benkyou shimasu',
  ...overrides,
});

const makeStats = () => ({ total: 10, due: 4, new: 3, review: 3 });

const defaultProps = () => ({
  currentCard: makeCard(),
  stats: makeStats(),
  isRevealed: false,
  previews: null,
  onReveal: vi.fn(),
  onReview: vi.fn(),
});

describe('MemoryModeStudy', () => {
  describe('unrevealed state', () => {
    it('should render the question text', () => {
      render(<MemoryModeStudy {...defaultProps()} />);
      expect(screen.getByText('I study Japanese')).toBeInTheDocument();
      expect(screen.getByText('Translate to Japanese')).toBeInTheDocument();
    });

    it('should render a reveal button that calls onReveal when clicked', () => {
      const props = defaultProps();
      render(<MemoryModeStudy {...props} />);

      fireEvent.click(screen.getByRole('button', { name: /reveal answer/i }));
      expect(props.onReveal).toHaveBeenCalledTimes(1);
    });

    it('should NOT show the answer or assessment buttons before reveal', () => {
      render(<MemoryModeStudy {...defaultProps()} />);
      expect(screen.queryByText('How well did you know it?')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^again/i })).not.toBeInTheDocument();
    });
  });

  describe('revealed state', () => {
    it('should render the Japanese answer with romaji', () => {
      render(<MemoryModeStudy {...defaultProps()} isRevealed={true} />);
      expect(screen.getByText('日本語を勉強します')).toBeInTheDocument();
      expect(screen.getByText('nihongo wo benkyou shimasu')).toBeInTheDocument();
    });

    it('should render a practice hint with the Japanese phrase', () => {
      render(<MemoryModeStudy {...defaultProps()} isRevealed={true} />);
      expect(screen.getByText(/Practice saying:/)).toHaveTextContent('日本語を勉強します');
    });

    it('should NOT render the reveal button after reveal', () => {
      render(<MemoryModeStudy {...defaultProps()} isRevealed={true} />);
      expect(screen.queryByRole('button', { name: /reveal answer/i })).not.toBeInTheDocument();
    });

    it('should call onReview with the correct rating for each button', () => {
      const props = defaultProps();
      render(<MemoryModeStudy {...props} isRevealed={true} />);

      fireEvent.click(screen.getByRole('button', { name: /again/i }));
      expect(props.onReview).toHaveBeenCalledWith('again');

      fireEvent.click(screen.getByRole('button', { name: /hard/i }));
      expect(props.onReview).toHaveBeenCalledWith('hard');

      fireEvent.click(screen.getByRole('button', { name: /good/i }));
      expect(props.onReview).toHaveBeenCalledWith('good');

      fireEvent.click(screen.getByRole('button', { name: /easy/i }));
      expect(props.onReview).toHaveBeenCalledWith('easy');

      expect(props.onReview).toHaveBeenCalledTimes(4);
    });

    it('should show interval previews when provided', () => {
      render(
        <MemoryModeStudy
          {...defaultProps()}
          isRevealed={true}
          previews={{ again: 0.004, hard: 2, good: 5, easy: 10 }}
        />
      );
      expect(screen.getByRole('button', { name: /again/i })).toHaveTextContent('6m');
      expect(screen.getByRole('button', { name: /hard/i })).toHaveTextContent('2d');
      expect(screen.getByRole('button', { name: /good/i })).toHaveTextContent('5d');
      expect(screen.getByRole('button', { name: /easy/i })).toHaveTextContent('10d');
    });

    it('should NOT show interval previews when previews is null', () => {
      render(<MemoryModeStudy {...defaultProps()} isRevealed={true} previews={null} />);
      expect(screen.getByRole('button', { name: /again/i })).not.toHaveTextContent('(');
    });
  });

  describe('progress bar', () => {
    it('should render a progress bar reflecting completion', () => {
      render(
        <MemoryModeStudy
          {...defaultProps()}
          stats={{ total: 10, due: 3, new: 3, review: 4 }}
        />
      );
      const fill = document.querySelector('.progress-fill') as HTMLElement;
      expect(fill).toBeTruthy();
      // (10 - 3 - 3 + 1) / 10 = 50%
      expect(fill.style.width).toBe('50%');
    });

    it('should clamp progress when no cards remain', () => {
      render(
        <MemoryModeStudy
          {...defaultProps()}
          stats={{ total: 0, due: 0, new: 0, review: 0 }}
        />
      );
      const fill = document.querySelector('.progress-fill') as HTMLElement;
      // (0 - 0 - 0 + 1) / max(1, 0) = 100%
      expect(fill.style.width).toBe('100%');
    });
  });
});
