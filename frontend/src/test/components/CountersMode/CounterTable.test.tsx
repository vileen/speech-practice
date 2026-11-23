import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CounterTable } from '../../../components/CountersMode/CounterTable';
import type { CounterGroup, CounterPattern } from '../../../components/CountersMode/types';

const makePattern = (overrides: Partial<CounterPattern> = {}): CounterPattern => ({
  id: 1,
  pattern: '一人',
  base_form: 'hito',
  formation_rules: [{ rule: 'number + 人 (hito)' }],
  examples: [{ romaji: 'hitori', en: 'one person' }],
  ...overrides,
});

const makeGroup = (overrides: Partial<CounterGroup> = {}): CounterGroup => ({
  baseForm: 'hito',
  count: 2,
  counts: '1-2 people',
  description: 'People counter',
  patterns: [
    makePattern(),
    makePattern({ id: 2, pattern: '二人', examples: [{ romaji: 'futari', en: 'two people' }] }),
  ],
  ...overrides,
});

const setup = (groupOverrides: Partial<CounterGroup> = {}) => {
  const props = {
    selectedGroup: makeGroup(groupOverrides),
    onSetMode: vi.fn(),
    onStartQuiz: vi.fn(),
  };
  render(<CounterTable {...props} />);
  return props;
};

describe('CounterTable', () => {
  describe('header', () => {
    it('should render back button that navigates to menu', () => {
      const props = setup();
      fireEvent.click(screen.getByRole('button', { name: /menu/i }));
      expect(props.onSetMode).toHaveBeenCalledWith('menu');
    });

    it('should display the group base form and counts in the title', () => {
      setup();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('hito - 1-2 people');
    });

    it('should render Cards button that switches to study mode', () => {
      const props = setup();
      fireEvent.click(screen.getByRole('button', { name: /cards/i }));
      expect(props.onSetMode).toHaveBeenCalledWith('study');
    });

    it('should render Quiz button that starts the quiz', () => {
      const props = setup();
      fireEvent.click(screen.getByRole('button', { name: /quiz/i }));
      expect(props.onStartQuiz).toHaveBeenCalledTimes(1);
    });
  });

  describe('table rendering', () => {
    it('should render column headers', () => {
      setup();
      expect(screen.getByRole('columnheader', { name: 'Counter' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Meaning' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Rule' })).toBeInTheDocument();
    });

    it('should render one row per pattern', () => {
      setup();
      expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 patterns
    });

    it('should render pattern kanji and romaji for each row', () => {
      setup();
      expect(screen.getByText('一人')).toBeInTheDocument();
      expect(screen.getByText('hitori')).toBeInTheDocument();
      expect(screen.getByText('二人')).toBeInTheDocument();
      expect(screen.getByText('futari')).toBeInTheDocument();
    });

    it('should render the English meaning from the first example', () => {
      setup();
      expect(screen.getByText('one person')).toBeInTheDocument();
      expect(screen.getByText('two people')).toBeInTheDocument();
    });

    it('should render the formation rule from the first rule', () => {
      setup();
      expect(screen.getAllByText('number + 人 (hito)')).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should show dash when a pattern has no examples', () => {
      setup({
        patterns: [makePattern({ id: 3, examples: [] })],
      });
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should render empty rule cell when a pattern has no formation rules', () => {
      setup({
        patterns: [makePattern({ id: 4, formation_rules: [] })],
      });
      const ruleCells = document.querySelectorAll('.col-rule');
      expect(ruleCells).toHaveLength(1);
      expect(ruleCells[0]).toHaveTextContent('');
    });

    it('should render nothing in the table body when the group has no patterns', () => {
      setup({ patterns: [] });
      expect(screen.getAllByRole('row')).toHaveLength(1); // header only
    });
  });
});
