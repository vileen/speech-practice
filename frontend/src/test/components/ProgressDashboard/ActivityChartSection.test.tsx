import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityChartSection } from '../../../components/ProgressDashboard/ActivityChartSection';
import { ActivityDay } from '../../../hooks/useProgressData.js';

// Helper: build a date string N days before today
const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const makeDay = (overrides: Partial<ActivityDay> = {}): ActivityDay => ({
  date: daysAgo(1),
  grammarAttempts: 0,
  kanjiAttempts: 0,
  totalSessions: 0,
  ...overrides,
});

const renderSection = (activity: ActivityDay[], maxValue = 10) =>
  render(<ActivityChartSection activity={activity} maxValue={maxValue} />);

describe('ActivityChartSection', () => {
  it('renders the section heading', () => {
    renderSection([]);
    expect(screen.getByRole('heading', { name: /last 7 days/i })).toBeInTheDocument();
  });

  it('renders one bar container per activity day', () => {
    const activity = [
      makeDay({ date: daysAgo(2), totalSessions: 3 }),
      makeDay({ date: daysAgo(1), totalSessions: 5 }),
      makeDay({ date: daysAgo(0), totalSessions: 1 }),
    ];
    const { container } = renderSection(activity);
    expect(container.querySelectorAll('.activity-bar-container')).toHaveLength(3);
  });

  it('shows grammar and kanji bars with correct titles for active days', () => {
    const activity = [makeDay({ grammarAttempts: 4, kanjiAttempts: 2, totalSessions: 6 })];
    renderSection(activity);
    expect(screen.getByTitle('Grammar: 4 attempts')).toBeInTheDocument();
    expect(screen.getByTitle('Kanji: 2 attempts')).toBeInTheDocument();
  });

  it('renders an empty bar for days with no sessions', () => {
    const activity = [makeDay({ totalSessions: 0 })];
    const { container } = renderSection(activity);
    expect(container.querySelector('.empty-bar')).toBeInTheDocument();
    expect(container.querySelector('.grammar-bar')).not.toBeInTheDocument();
    expect(container.querySelector('.kanji-bar')).not.toBeInTheDocument();
  });

  it('hides grammar bar visually when a day has sessions but no grammar attempts', () => {
    const activity = [makeDay({ grammarAttempts: 0, kanjiAttempts: 3, totalSessions: 3 })];
    const { container } = renderSection(activity);
    const grammarBar = container.querySelector<HTMLElement>('.grammar-bar');
    expect(grammarBar).toBeInTheDocument();
    expect(grammarBar?.style.opacity).toBe('0');
  });

  it('displays the total session count under each bar', () => {
    const activity = [makeDay({ totalSessions: 7 })];
    renderSection(activity);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('labels today and yesterday correctly', () => {
    const activity = [
      makeDay({ date: daysAgo(1), totalSessions: 1 }),
      makeDay({ date: daysAgo(0), totalSessions: 2 }),
    ];
    renderSection(activity);
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders the legend with Grammar and Kanji entries', () => {
    renderSection([]);
    const legend = screen.getByText('Grammar');
    const kanji = screen.getByText('Kanji');
    expect(legend).toBeInTheDocument();
    expect(kanji).toBeInTheDocument();
  });
});
