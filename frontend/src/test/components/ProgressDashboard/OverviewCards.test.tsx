import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverviewCards } from '../../../components/ProgressDashboard/OverviewCards';
import { OverviewStats } from '../../../hooks/useProgressData.js';

const makeOverview = (overrides: Partial<OverviewStats> = {}): OverviewStats => ({
  studyTime: { thisWeek: 120, allTime: 1500, unit: 'minutes' },
  streak: 7,
  grammar: { mastered: 25, total: 100 },
  kanji: { learned: 80, total: 300 },
  lessons: { completed: 12, total: 40 },
  ...overrides,
});

const renderCards = (overview: OverviewStats) =>
  render(<OverviewCards overview={overview} />);

describe('OverviewCards', () => {
  it('renders the Overview section heading', () => {
    renderCards(makeOverview());
    expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
  });

  it('renders one card per stat', () => {
    const { container } = renderCards(makeOverview());
    expect(container.querySelectorAll('.stat-card')).toHaveLength(5);
  });

  it('shows the streak count and Day Streak label', () => {
    renderCards(makeOverview({ streak: 7 }));
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Day Streak')).toBeInTheDocument();
  });

  it('uses the sparkles emoji for streaks under 7 days', () => {
    const { container } = renderCards(makeOverview({ streak: 3 }));
    expect(container.querySelector('.streak-card .stat-icon')?.textContent).toBe('✨');
  });

  it('uses the flexed biceps emoji for streaks of 7+ days', () => {
    const { container } = renderCards(makeOverview({ streak: 10 }));
    expect(container.querySelector('.streak-card .stat-icon')?.textContent).toBe('💪');
  });

  it('uses the lightning emoji for streaks of 14+ days', () => {
    const { container } = renderCards(makeOverview({ streak: 20 }));
    expect(container.querySelector('.streak-card .stat-icon')?.textContent).toBe('⚡');
  });

  it('uses the fire emoji for streaks of 30+ days', () => {
    const { container } = renderCards(makeOverview({ streak: 45 }));
    expect(container.querySelector('.streak-card .stat-icon')?.textContent).toBe('🔥');
  });

  it('formats study time under an hour as minutes', () => {
    renderCards(makeOverview({ studyTime: { thisWeek: 45, allTime: 45, unit: 'minutes' } }));
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('formats whole hours without leftover minutes', () => {
    renderCards(makeOverview({ studyTime: { thisWeek: 120, allTime: 240, unit: 'minutes' } }));
    expect(screen.getByText('2h')).toBeInTheDocument();
    expect(screen.getByText('4h total')).toBeInTheDocument();
  });

  it('formats hours with leftover minutes', () => {
    renderCards(makeOverview({ studyTime: { thisWeek: 150, allTime: 150, unit: 'minutes' } }));
    expect(screen.getByText('2h 30m')).toBeInTheDocument();
  });

  it('labels the weekly study time card', () => {
    renderCards(makeOverview());
    expect(screen.getByText('This Week')).toBeInTheDocument();
  });

  it('shows grammar progress with the total pattern count', () => {
    renderCards(makeOverview({ grammar: { mastered: 25, total: 100 } }));
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Grammar Mastered')).toBeInTheDocument();
    expect(screen.getByText('of 100 patterns')).toBeInTheDocument();
  });

  it('shows kanji progress with the total character count', () => {
    renderCards(makeOverview({ kanji: { learned: 80, total: 300 } }));
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('Kanji Learned')).toBeInTheDocument();
    expect(screen.getByText('of 300 characters')).toBeInTheDocument();
  });

  it('shows lesson completion with the total lesson count', () => {
    renderCards(makeOverview({ lessons: { completed: 12, total: 40 } }));
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByText('of 40 completed')).toBeInTheDocument();
  });

  it('handles zero values without crashing', () => {
    renderCards(
      makeOverview({
        streak: 0,
        studyTime: { thisWeek: 0, allTime: 0, unit: 'minutes' },
        grammar: { mastered: 0, total: 0 },
        kanji: { learned: 0, total: 0 },
        lessons: { completed: 0, total: 0 },
      }),
    );
    expect(screen.getByText('Day Streak')).toBeInTheDocument();
    expect(screen.getByText('0m')).toBeInTheDocument();
  });
});
