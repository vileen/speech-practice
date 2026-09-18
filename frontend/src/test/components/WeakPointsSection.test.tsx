import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeakPointsSection } from '../../components/ProgressDashboard/WeakPointsSection';
import type { WeakCategory, WeakPattern, ConfusedPair } from '../../hooks/useProgressData';

const makeCategory = (overrides: Partial<WeakCategory> = {}): WeakCategory => ({
  category: 'Particles',
  accuracy: 45,
  totalPatterns: 10,
  totalAttempts: 40,
  ...overrides,
});

const makePattern = (overrides: Partial<WeakPattern> = {}): WeakPattern => ({
  id: 1,
  pattern: 'は vs が',
  category: 'Particles',
  jlptLevel: 'N5',
  accuracy: 50,
  attempts: 20,
  correct: 10,
  ...overrides,
});

const makePair = (overrides: Partial<ConfusedPair> = {}): ConfusedPair => ({
  patternId: 1,
  patternName: 'は',
  patternCategory: 'Particles',
  confusedWithId: 2,
  confusedWithName: 'が',
  count: 5,
  ...overrides,
});

describe('WeakPointsSection', () => {
  it('renders empty state when all data is empty', () => {
    render(
      <WeakPointsSection
        weakCategories={[]}
        weakPatterns={[]}
        confusedPairs={[]}
        onPractice={vi.fn()}
      />
    );
    expect(screen.getByText(/No weak points detected/i)).toBeInTheDocument();
    expect(screen.queryByText('Weakest Categories')).not.toBeInTheDocument();
    expect(screen.queryByText('Patterns to Review')).not.toBeInTheDocument();
    expect(screen.queryByText('Often Confused')).not.toBeInTheDocument();
  });

  it('renders weak categories with accuracy and meta info', () => {
    render(
      <WeakPointsSection
        weakCategories={[makeCategory()]}
        weakPatterns={[]}
        confusedPairs={[]}
        onPractice={vi.fn()}
      />
    );
    expect(screen.getByText('Particles')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('40 attempts across 10 patterns')).toBeInTheDocument();
  });

  it('applies accuracy colors via getAccuracyColor', () => {
    render(
      <WeakPointsSection
        weakCategories={[
          makeCategory({ category: 'High', accuracy: 85 }),
          makeCategory({ category: 'Mid', accuracy: 65 }),
          makeCategory({ category: 'Low', accuracy: 40 }),
        ]}
        weakPatterns={[]}
        confusedPairs={[]}
        onPractice={vi.fn()}
      />
    );
    expect(screen.getByText('85%')).toHaveStyle({ color: '#27ae60' });
    expect(screen.getByText('65%')).toHaveStyle({ color: '#f39c12' });
    expect(screen.getByText('40%')).toHaveStyle({ color: '#e74c3c' });
  });

  it('calls onPractice with category URL when category practice button clicked', () => {
    const onPractice = vi.fn();
    render(
      <WeakPointsSection
        weakCategories={[makeCategory({ category: 'Verb Conjugation' })]}
        weakPatterns={[]}
        confusedPairs={[]}
        onPractice={onPractice}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /practice/i }));
    expect(onPractice).toHaveBeenCalledWith(
      `/grammar?category=${encodeURIComponent('Verb Conjugation')}`
    );
  });

  it('limits patterns to review to 5 items', () => {
    const patterns = Array.from({ length: 8 }, (_, i) =>
      makePattern({ id: i + 1, pattern: `Pattern ${i + 1}` })
    );
    render(
      <WeakPointsSection
        weakCategories={[]}
        weakPatterns={patterns}
        confusedPairs={[]}
        onPractice={vi.fn()}
      />
    );
    expect(screen.getByText('Pattern 5')).toBeInTheDocument();
    expect(screen.queryByText('Pattern 6')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /practice/i })).toHaveLength(5);
  });

  it('calls onPractice with pattern URL when pattern practice button clicked', () => {
    const onPractice = vi.fn();
    render(
      <WeakPointsSection
        weakCategories={[]}
        weakPatterns={[makePattern({ id: 7 })]}
        confusedPairs={[]}
        onPractice={onPractice}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /practice/i }));
    expect(onPractice).toHaveBeenCalledWith('/grammar?pattern=7');
  });

  it('renders confused pairs and limits them to 3 items', () => {
    const pairs = Array.from({ length: 5 }, (_, i) =>
      makePair({ patternId: i + 1, patternName: `A${i + 1}`, confusedWithName: `B${i + 1}` })
    );
    render(
      <WeakPointsSection
        weakCategories={[]}
        weakPatterns={[]}
        confusedPairs={pairs}
        onPractice={vi.fn()}
      />
    );
    expect(screen.getByText('A3')).toBeInTheDocument();
    expect(screen.queryByText('A4')).not.toBeInTheDocument();
    expect(screen.getAllByText('5 confusions').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Particles').length).toBeGreaterThan(0);
  });

  it('calls onPractice with pattern URL when confused pair practice button clicked', () => {
    const onPractice = vi.fn();
    render(
      <WeakPointsSection
        weakCategories={[]}
        weakPatterns={[]}
        confusedPairs={[makePair({ patternId: 3 })]}
        onPractice={onPractice}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /practice/i }));
    expect(onPractice).toHaveBeenCalledWith('/grammar?pattern=3');
  });

  it('renders all sections together when data is present', () => {
    render(
      <WeakPointsSection
        weakCategories={[makeCategory()]}
        weakPatterns={[makePattern()]}
        confusedPairs={[makePair()]}
        onPractice={vi.fn()}
      />
    );
    expect(screen.getByText('Weakest Categories')).toBeInTheDocument();
    expect(screen.getByText('Patterns to Review')).toBeInTheDocument();
    expect(screen.getByText('Often Confused')).toBeInTheDocument();
    expect(screen.queryByText(/No weak points detected/i)).not.toBeInTheDocument();
  });
});
