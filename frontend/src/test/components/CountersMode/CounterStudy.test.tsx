import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CounterStudy } from '../../../components/CountersMode/CounterStudy';
import type { CounterGroup, CounterPattern } from '../../../components/CountersMode/types';

describe('CounterStudy', () => {
  const makePattern = (id: number, pattern: string, examples: any[] = []): CounterPattern => ({
    id,
    pattern,
    base_form: 'つ',
    formation_rules: [],
    examples,
  });

  const makeGroup = (patterns: CounterPattern[]): CounterGroup => ({
    baseForm: 'つ',
    count: 3,
    patterns,
    counts: '1-3, 6-10, [any]',
    description: 'General-purpose counter',
  });

  const makeProps = (overrides: Record<string, unknown> = {}) => ({
    selectedGroup: makeGroup([makePattern(1, '一つ'), makePattern(2, '二つ'), makePattern(3, '三つ')]),
    currentPattern: makePattern(1, '一つ'),
    onSetMode: vi.fn(),
    onStartQuiz: vi.fn(),
    onSetCurrentPattern: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header with group base form and counts', () => {
    render(<CounterStudy {...makeProps()} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('つ - 1-3, 6-10, [any]');
  });

  it('should render the current pattern and counts heading', () => {
    render(<CounterStudy {...makeProps()} />);
    expect(screen.getByText('一つ')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('1-3, 6-10, [any]');
  });

  it('should show position indicator as "current / total"', () => {
    const group = makeGroup([makePattern(1, '一つ'), makePattern(2, '二つ'), makePattern(3, '三つ')]);
    const { rerender } = render(
      <CounterStudy {...makeProps({ selectedGroup: group, currentPattern: group.patterns[0] })} />
    );
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    rerender(<CounterStudy {...makeProps({ selectedGroup: group, currentPattern: group.patterns[2] })} />);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('should render up to 2 examples with jp, en, and romaji text', () => {
    const examples = [
      { jp: '一つください', en: 'One please', romaji: 'hitotsu kudasai' },
      { jp: '一つある', en: 'There is one', romaji: 'hitotsu aru' },
      { jp: '三つ', en: 'Three (should not render)', romaji: 'mittsu' },
    ];
    const group = makeGroup([makePattern(1, '一つ', examples)]);
    render(<CounterStudy {...makeProps({ selectedGroup: group, currentPattern: group.patterns[0] })} />);

    expect(screen.getByText('Examples:')).toBeInTheDocument();
    expect(screen.getByText('一つください')).toBeInTheDocument();
    expect(screen.getByText('一つある')).toBeInTheDocument();
    expect(screen.queryByText('三つ')).not.toBeInTheDocument();
    expect(screen.getByText('hitotsu kudasai')).toBeInTheDocument();
    expect(screen.getByText('One please')).toBeInTheDocument();
  });

  it('should not render examples section when pattern has no examples', () => {
    render(<CounterStudy {...makeProps()} />);
    expect(screen.queryByText('Examples:')).not.toBeInTheDocument();
  });

  it('should call onSetMode("menu") when back button is clicked', () => {
    const props = makeProps();
    render(<CounterStudy {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /← menu/i }));
    expect(props.onSetMode).toHaveBeenCalledWith('menu');
  });

  it('should call onSetMode("table") when table button is clicked', () => {
    const props = makeProps();
    render(<CounterStudy {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /📋 table/i }));
    expect(props.onSetMode).toHaveBeenCalledWith('table');
  });

  it('should call onStartQuiz when quiz button is clicked', () => {
    const props = makeProps();
    render(<CounterStudy {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /🎯 quiz/i }));
    expect(props.onStartQuiz).toHaveBeenCalledTimes(1);
  });

  it('should navigate to the next pattern when Next is clicked', () => {
    const group = makeGroup([makePattern(1, '一つ'), makePattern(2, '二つ')]);
    const props = makeProps({ selectedGroup: group, currentPattern: group.patterns[0] });
    render(<CounterStudy {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(props.onSetCurrentPattern).toHaveBeenCalledWith(group.patterns[1]);
  });

  it('should navigate to the previous pattern when Previous is clicked', () => {
    const group = makeGroup([makePattern(1, '一つ'), makePattern(2, '二つ')]);
    const props = makeProps({ selectedGroup: group, currentPattern: group.patterns[1] });
    render(<CounterStudy {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(props.onSetCurrentPattern).toHaveBeenCalledWith(group.patterns[0]);
  });

  it('should disable Previous on the first pattern', () => {
    const group = makeGroup([makePattern(1, '一つ'), makePattern(2, '二つ')]);
    render(<CounterStudy {...makeProps({ selectedGroup: group, currentPattern: group.patterns[0] })} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('should disable Next on the last pattern', () => {
    const group = makeGroup([makePattern(1, '一つ'), makePattern(2, '二つ')]);
    render(<CounterStudy {...makeProps({ selectedGroup: group, currentPattern: group.patterns[1] })} />);

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
  });
});
