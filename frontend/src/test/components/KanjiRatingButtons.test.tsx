import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanjiRatingButtons } from '../../../src/components/KanjiPracticeMode/KanjiRatingButtons';
import { Rating } from '../../../src/lib/fsrs.js';

describe('KanjiRatingButtons', () => {
  const intervals = {
    again: '<1m',
    hard: '5m',
    good: '10m',
    easy: '30m',
  };

  it('renders all four rating buttons', () => {
    render(<KanjiRatingButtons intervals={intervals} onReview={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Good/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Easy/i })).toBeInTheDocument();
  });

  it('displays the interval hint for each rating', () => {
    render(<KanjiRatingButtons intervals={intervals} onReview={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].textContent).toContain('<1m');
    expect(buttons[1].textContent).toContain('5m');
    expect(buttons[2].textContent).toContain('10m');
    expect(buttons[3].textContent).toContain('30m');
  });

  it('calls onReview with "again" when the Again button is clicked', () => {
    const onReview = vi.fn();
    render(<KanjiRatingButtons intervals={intervals} onReview={onReview} />);

    fireEvent.click(screen.getByRole('button', { name: /Again/i }));
    expect(onReview).toHaveBeenCalledTimes(1);
    expect(onReview).toHaveBeenCalledWith('again' as Rating);
  });

  it('calls onReview with "good" when the Good button is clicked', () => {
    const onReview = vi.fn();
    render(<KanjiRatingButtons intervals={intervals} onReview={onReview} />);

    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(onReview).toHaveBeenCalledTimes(1);
    expect(onReview).toHaveBeenCalledWith('good' as Rating);
  });

  it('calls onReview for each rating button', () => {
    const onReview = vi.fn();
    render(<KanjiRatingButtons intervals={intervals} onReview={onReview} />);

    fireEvent.click(screen.getByRole('button', { name: /Hard/i }));
    fireEvent.click(screen.getByRole('button', { name: /Easy/i }));

    expect(onReview).toHaveBeenCalledTimes(2);
    expect(onReview).toHaveBeenNthCalledWith(1, 'hard' as Rating);
    expect(onReview).toHaveBeenNthCalledWith(2, 'easy' as Rating);
  });
});
