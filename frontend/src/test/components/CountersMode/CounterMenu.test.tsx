import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CounterMenu } from '../../../components/CountersMode/CounterMenu';
import type { CounterGroup } from '../../../components/CountersMode/types';

describe('CounterMenu', () => {
  const makeGroup = (baseForm: string, count: number, counts: string): CounterGroup => ({
    baseForm,
    count,
    counts,
    description: `${baseForm} description`,
    patterns: [],
  });

  const groups: CounterGroup[] = [
    makeGroup('hito', 2, '1-2 people'),
    makeGroup('hon', 4, 'long objects'),
    makeGroup('ko', 3, 'small objects'),
  ];

  const setup = (overrides: Partial<React.ComponentProps<typeof CounterMenu>> = {}) => {
    const props = {
      counterGroups: groups,
      selectedGroups: new Set<string>(),
      loading: false,
      onStartStudy: vi.fn(),
      onToggleGroupSelection: vi.fn(),
      onStartMixedQuiz: vi.fn(),
      onStartSelectedQuiz: vi.fn(),
      onNavigateBack: vi.fn(),
      ...overrides,
    };
    render(<CounterMenu {...props} />);
    return props;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('header', () => {
    it('renders title and counter group count', () => {
      setup();
      expect(screen.getByText('📊 Japanese Counters')).toBeInTheDocument();
      expect(screen.getByText('3 counter groups')).toBeInTheDocument();
    });

    it('calls onNavigateBack when back button is clicked', () => {
      const props = setup();
      fireEvent.click(screen.getByText('← Back'));
      expect(props.onNavigateBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('mixed quiz banner', () => {
    it('calls onStartMixedQuiz when banner is clicked', () => {
      const props = setup();
      fireEvent.click(screen.getByText('🎯 Mixed Quiz'));
      expect(props.onStartMixedQuiz).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading state', () => {
    it('shows loading text and hides groups while loading', () => {
      setup({ loading: true });
      expect(screen.getByText('Loading counters...')).toBeInTheDocument();
      expect(screen.queryByText('hito')).not.toBeInTheDocument();
    });
  });

  describe('group cards', () => {
    it('renders all counter groups with metadata', () => {
      setup();
      expect(screen.getByText('hito')).toBeInTheDocument();
      expect(screen.getByText('hon')).toBeInTheDocument();
      expect(screen.getByText('ko')).toBeInTheDocument();
      expect(screen.getByText('2 variants')).toBeInTheDocument();
      expect(screen.getByText('1-2 people')).toBeInTheDocument();
    });

    it('calls onStartStudy with the group when a card is clicked', () => {
      const props = setup();
      fireEvent.click(screen.getByText('hito').closest('.group-card')!);
      expect(props.onStartStudy).toHaveBeenCalledTimes(1);
      expect(props.onStartStudy).toHaveBeenCalledWith(groups[0]);
    });

    it('calls onStartStudy when the Study button is clicked without double-firing', () => {
      const props = setup();
      const studyButtons = screen.getAllByText('Study →');
      fireEvent.click(studyButtons[0]);
      expect(props.onStartStudy).toHaveBeenCalledTimes(1);
      expect(props.onStartStudy).toHaveBeenCalledWith(groups[0]);
    });

    it('calls onToggleGroupSelection when the checkbox label is clicked', () => {
      const props = setup();
      const hitoCard = screen.getByText('hito').closest('.group-card')!;
      const checkbox = hitoCard.querySelector('.group-checkbox')!;
      fireEvent.click(checkbox);
      expect(props.onToggleGroupSelection).toHaveBeenCalledTimes(1);
      expect(props.onToggleGroupSelection).toHaveBeenCalledWith('hito', expect.anything());
      expect(props.onStartStudy).not.toHaveBeenCalled();
    });

    it('does not call onStartStudy when the checkbox input itself is clicked', () => {
      const props = setup();
      const hitoCard = screen.getByText('hito').closest('.group-card')!;
      const input = hitoCard.querySelector('input[type="checkbox"]')!;
      fireEvent.click(input);
      expect(props.onStartStudy).not.toHaveBeenCalled();
    });

    it('applies selected class when group is in selectedGroups', () => {
      setup({ selectedGroups: new Set(['hon']) });
      const honCard = screen.getByText('hon').closest('.group-card')!;
      expect(honCard.className).toContain('selected');
      const hitoCard = screen.getByText('hito').closest('.group-card')!;
      expect(hitoCard.className).not.toContain('selected');
    });
  });

  describe('selected groups FAB', () => {
    it('is hidden when no groups are selected', () => {
      setup();
      expect(screen.queryByText(/Practice/)).not.toBeInTheDocument();
    });

    it('shows singular label and total card count for one selected group', () => {
      setup({ selectedGroups: new Set(['hito']) });
      expect(screen.getByText('🎯 Practice 1 group')).toBeInTheDocument();
      expect(screen.getByText('2 cards')).toBeInTheDocument();
    });

    it('shows plural label and summed card count for multiple selected groups', () => {
      setup({ selectedGroups: new Set(['hito', 'hon']) });
      expect(screen.getByText('🎯 Practice 2 groups')).toBeInTheDocument();
      expect(screen.getByText('6 cards')).toBeInTheDocument();
    });

    it('ignores selected base forms not present in counterGroups', () => {
      setup({ selectedGroups: new Set(['hito', 'unknown']) });
      expect(screen.getByText('🎯 Practice 2 groups')).toBeInTheDocument();
      expect(screen.getByText('2 cards')).toBeInTheDocument();
    });

    it('calls onStartSelectedQuiz when the FAB is clicked', () => {
      const props = setup({ selectedGroups: new Set(['ko']) });
      fireEvent.click(screen.getByText('🎯 Practice 1 group'));
      expect(props.onStartSelectedQuiz).toHaveBeenCalledTimes(1);
    });
  });
});
