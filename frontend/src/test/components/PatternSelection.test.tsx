import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternSelection } from '../../components/GrammarMode/PatternSelection';
import type { GrammarPattern } from '../../components/GrammarMode/GrammarMode';

// Mock useFurigana hook
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: vi.fn((_text: string, enabled: boolean) => ({
    furigana: enabled ? '<ruby>漢字<rt>かんじ</rt></ruby>' : null,
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  })),
}));

const mockPatterns: GrammarPattern[] = [
  { id: 1, pattern: '〜てもいいです', category: 'Permission', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
  { id: 2, pattern: '〜てはいけません', category: 'Prohibition', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
  { id: 3, pattern: 'は (topic marker)', category: 'Particles', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
  { id: 4, pattern: 'い-adjectives: Present affirmative', category: 'I-Adjectives', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
];

const defaultProps = {
  patterns: mockPatterns,
  categories: ['Permission', 'Prohibition', 'Particles', 'I-Adjectives'],
  selectedCategories: ['Permission', 'Prohibition', 'Particles', 'I-Adjectives'],
  dueCount: 2,
  duePatterns: [mockPatterns[0], mockPatterns[1]],
  confusionStats: [{ patternId: 2, count: 3 }],
  showFurigana: false,
  expandedGroup: null,
  activeGroup: null,
  onToggleCategory: vi.fn(),
  onSelectAll: vi.fn(),
  onDeselectAll: vi.fn(),
  onClearSelection: vi.fn(),
  onSelectGroup: vi.fn(),
  onToggleGroupAccordion: vi.fn(),
  onStartReview: vi.fn(),
  onStartDiscrimination: vi.fn(),
  onShowPatternGraph: vi.fn(),
  onStartPattern: vi.fn(),
  onComparePattern: vi.fn(),
};

describe('PatternSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Review Banner', () => {
    it('should render review banner when dueCount > 0', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByText('🔥 2 patterns ready for review')).toBeInTheDocument();
    });

    it('should not render review banner when dueCount is 0', () => {
      render(<PatternSelection {...defaultProps} dueCount={0} duePatterns={[]} />);
      expect(screen.queryByText(/patterns ready for review/)).not.toBeInTheDocument();
    });

    it('should show due categories breakdown', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByText('Permission (1)')).toBeInTheDocument();
      expect(screen.getByText('Prohibition (1)')).toBeInTheDocument();
    });

    it('should call onStartReview(true) when Practice Selected clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('Practice Selected (4 patterns)'));
      expect(defaultProps.onStartReview).toHaveBeenCalledWith(true);
    });

    it('should call onStartReview(false) when Practice All clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('Practice All'));
      expect(defaultProps.onStartReview).toHaveBeenCalledWith(false);
    });

    it('should disable Practice Selected when no categories selected', () => {
      render(<PatternSelection {...defaultProps} selectedCategories={[]} />);
      expect(screen.getByText('Practice Selected (0 patterns)')).toBeDisabled();
    });
  });

  describe('Mixed Review Banner', () => {
    it('should render mixed review banner', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByText('🎯 Mixed Review Mode')).toBeInTheDocument();
    });

    it('should call onStartReview with mixed=true when Start Mixed Review clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('Start Mixed Review'));
      expect(defaultProps.onStartReview).toHaveBeenCalledWith(true, true);
    });

    it('should show alert when Start Mixed Review clicked with no categories', () => {
      render(<PatternSelection {...defaultProps} selectedCategories={[]} />);
      const btn = screen.getByText('Start Mixed Review');
      // When no categories selected, button is disabled, so alert won't fire
      expect(btn).toBeDisabled();
    });
  });

  describe('Discrimination Drill Banner', () => {
    it('should render discrimination banner', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByText('🎭 Discrimination Drills')).toBeInTheDocument();
    });

    it('should call onStartDiscrimination when button clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('Start Discrimination Drill'));
      expect(defaultProps.onStartDiscrimination).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pattern Graph Banner', () => {
    it('should render pattern graph banner', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByText('🕸️ Pattern Relationship Graph')).toBeInTheDocument();
    });

    it('should call onShowPatternGraph when View Graph clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('View Graph'));
      expect(defaultProps.onShowPatternGraph).toHaveBeenCalledTimes(1);
    });
  });

  describe('Category Filter', () => {
    it('should render all category checkboxes', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByLabelText('Permission')).toBeInTheDocument();
      expect(screen.getByLabelText('Prohibition')).toBeInTheDocument();
      expect(screen.getByLabelText('Particles')).toBeInTheDocument();
      expect(screen.getByLabelText('I-Adjectives')).toBeInTheDocument();
    });

    it('should call onToggleCategory when checkbox clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Permission'));
      expect(defaultProps.onToggleCategory).toHaveBeenCalledWith('Permission');
    });

    it('should call onSelectAll when Select All clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('Select All'));
      expect(defaultProps.onSelectAll).toHaveBeenCalledTimes(1);
    });

    it('should call onDeselectAll when Deselect All clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('Deselect All'));
      expect(defaultProps.onDeselectAll).toHaveBeenCalledTimes(1);
    });

    it('should show selected pills with count', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByText('Selected (4 patterns):')).toBeInTheDocument();
    });

    it('should call onClearSelection when All Categories clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('All Categories'));
      expect(defaultProps.onClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Quick Select Groups', () => {
    it('should render accordion header', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByText('Quick Select Groups')).toBeInTheDocument();
    });

    it('should call onToggleGroupAccordion when accordion header clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      fireEvent.click(screen.getByText('Quick Select Groups'));
      expect(defaultProps.onToggleGroupAccordion).toHaveBeenCalledTimes(1);
    });

    it('should show group items when expanded', () => {
      render(<PatternSelection {...defaultProps} expandedGroup="groups" />);
      // Use getAllByText since 'Particles' also appears in category checkboxes
      expect(screen.getAllByText('Particles').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Permission/Obligation')).toBeInTheDocument();
      expect(screen.getByText('Adjectives')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('should call onSelectGroup when group item clicked', () => {
      render(<PatternSelection {...defaultProps} expandedGroup="groups" />);
      // Click on the group item by finding the Permission/Obligation group (unique text)
      fireEvent.click(screen.getByText('Permission/Obligation'));
      expect(defaultProps.onSelectGroup).toHaveBeenCalledWith('permission');
    });

    it('should show active checkmark for active group', () => {
      const { container } = render(<PatternSelection {...defaultProps} expandedGroup="groups" activeGroup="permission" />);
      const activeGroup = container.querySelector('.group-item.active');
      expect(activeGroup).toBeInTheDocument();
      expect(activeGroup?.textContent).toContain('Permission/Obligation');
    });
  });

  describe('Pattern Grid', () => {
    it('should render pattern cards when categories selected', () => {
      render(<PatternSelection {...defaultProps} />);
      expect(screen.getByText('〜てもいいです')).toBeInTheDocument();
      expect(screen.getByText('〜てはいけません')).toBeInTheDocument();
    });

    it('should show no selection message when no categories selected', () => {
      render(<PatternSelection {...defaultProps} selectedCategories={[]} />);
      expect(screen.getByText('Select at least one category to see patterns')).toBeInTheDocument();
    });

    it('should call onStartPattern when pattern card clicked', () => {
      render(<PatternSelection {...defaultProps} />);
      const card = screen.getByText('〜てもいいです').closest('.pattern-card');
      fireEvent.click(card!);
      expect(defaultProps.onStartPattern).toHaveBeenCalledWith(mockPatterns[0]);
    });

    it('should render confusion badge on patterns with confusion stats', () => {
      render(<PatternSelection {...defaultProps} />);
      const cards = screen.getAllByText('⚠️');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Props passing', () => {
    it('should pass showFurigana to PatternCard', () => {
      const { container } = render(<PatternSelection {...defaultProps} showFurigana={true} />);
      // PatternCard with showFurigana=true would render ruby elements
      // The mock returns furigana HTML, so we check for ruby in the container
      const rubyElements = container.querySelectorAll('ruby');
      expect(rubyElements.length).toBeGreaterThan(0);
    });
  });
});
