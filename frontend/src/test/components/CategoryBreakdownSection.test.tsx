import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CategoryBreakdownSection,
} from '../../components/ProgressDashboard/CategoryBreakdownSection';
import type { CategoryBreakdown } from '../../hooks/useProgressData';

const makeCategory = (overrides: Partial<CategoryBreakdown> = {}): CategoryBreakdown => ({
  category: 'Particles',
  totalPatterns: 10,
  totalAttempts: 20,
  accuracy: 75,
  ...overrides,
});

describe('CategoryBreakdownSection', () => {
  it('renders nothing for categories with zero attempts', () => {
    const categories = [makeCategory({ totalAttempts: 0, category: 'Unused' })];
    render(<CategoryBreakdownSection categories={categories} />);
    expect(screen.queryByText('Unused')).not.toBeInTheDocument();
  });

  it('shows empty state when all categories have zero attempts', () => {
    render(<CategoryBreakdownSection categories={[]} />);
    expect(
      screen.getByText(/no practice data yet/i)
    ).toBeInTheDocument();
  });

  it('renders category names and attempt counts', () => {
    const categories = [
      makeCategory({ category: 'Particles', totalAttempts: 25 }),
      makeCategory({ category: 'Verb Conjugation', totalAttempts: 40 }),
    ];
    render(<CategoryBreakdownSection categories={categories} />);
    expect(screen.getByText('Particles')).toBeInTheDocument();
    expect(screen.getByText('25 attempts')).toBeInTheDocument();
    expect(screen.getByText('Verb Conjugation')).toBeInTheDocument();
    expect(screen.getByText('40 attempts')).toBeInTheDocument();
  });

  it('renders accuracy percentages and applies bar width styling', () => {
    const categories = [makeCategory({ accuracy: 85 })];
    render(<CategoryBreakdownSection categories={categories} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
    const bar = document.querySelector('.category-bar') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.style.width).toBe('85%');
  });

  it('uses green color for accuracy >= 80', () => {
    render(<CategoryBreakdownSection categories={[makeCategory({ accuracy: 90 })]} />);
    const bar = document.querySelector('.category-bar') as HTMLElement;
    expect(bar.style.backgroundColor).toBe('rgb(39, 174, 96)');
  });

  it('uses orange color for accuracy between 60 and 79', () => {
    render(<CategoryBreakdownSection categories={[makeCategory({ accuracy: 70 })]} />);
    const bar = document.querySelector('.category-bar') as HTMLElement;
    expect(bar.style.backgroundColor).toBe('rgb(243, 156, 18)');
  });

  it('uses red color for accuracy below 60', () => {
    render(<CategoryBreakdownSection categories={[makeCategory({ accuracy: 45 })]} />);
    const bar = document.querySelector('.category-bar') as HTMLElement;
    expect(bar.style.backgroundColor).toBe('rgb(231, 76, 60)');
  });

  it('renders at most 8 categories', () => {
    const categories = Array.from({ length: 12 }, (_, i) =>
      makeCategory({ category: `Cat ${i + 1}`, totalAttempts: i + 1 })
    );
    render(<CategoryBreakdownSection categories={categories} />);
    expect(screen.getByText('Cat 1')).toBeInTheDocument();
    expect(screen.getByText('Cat 8')).toBeInTheDocument();
    expect(screen.queryByText('Cat 9')).not.toBeInTheDocument();
    expect(screen.queryByText('Cat 12')).not.toBeInTheDocument();
  });

  it('orders categories in the order provided after filtering', () => {
    const categories = [
      makeCategory({ category: 'First', totalAttempts: 5 }),
      makeCategory({ category: 'Skipped', totalAttempts: 0 }),
      makeCategory({ category: 'Second', totalAttempts: 3 }),
    ];
    const { container } = render(<CategoryBreakdownSection categories={categories} />);
    const names = Array.from(
      container.querySelectorAll('.category-name')
    ).map(el => el.textContent);
    expect(names).toEqual(['First', 'Second']);
  });
});
