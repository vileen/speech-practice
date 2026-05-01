import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiscriminationDrill } from '../../components/GrammarMode/DiscriminationDrill';
import type { GrammarExercise, GrammarPattern, DiscriminationOption } from '../../components/GrammarMode/GrammarMode';

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
  { id: 1, pattern: 'てもいい', category: 'Permission', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
  { id: 2, pattern: 'てはいけない', category: 'Prohibition', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
];

const mockOptions: DiscriminationOption[] = [
  { pattern_id: 1, pattern: 'てもいい', category: 'Permission', is_correct: true, explanation: 'Used to ask/give permission' },
  { pattern_id: 2, pattern: 'てはいけない', category: 'Prohibition', is_correct: false, explanation: 'Used to prohibit something' },
];

const mockExercise: GrammarExercise = {
  id: 1,
  type: 'discrimination',
  prompt: 'You want to ask if you can use a pen. Which pattern?',
  context: 'Formal situation',
  correct_answer: 'てもいい',
  hints: [],
  difficulty: 1,
  options: mockOptions,
};

const defaultProps = {
  exercise: mockExercise,
  patterns: mockPatterns,
  showFurigana: false,
  onSelectOption: vi.fn(),
};

describe('DiscriminationDrill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render prompt text', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      expect(screen.getByText(mockExercise.prompt)).toBeInTheDocument();
    });

    it('should render context when provided', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      expect(screen.getByText('Formal situation')).toBeInTheDocument();
    });

    it('should render question text', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      expect(screen.getByText('Choose the correct pattern:')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('てもいい')).toBeInTheDocument();
      expect(screen.getByText('てはいけない')).toBeInTheDocument();
    });

    it('should render option categories', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      expect(screen.getByText('Permission')).toBeInTheDocument();
      expect(screen.getByText('Prohibition')).toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('should call onSelectOption when option clicked', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      const option = screen.getByText('てもいい').closest('.discrimination-option');
      fireEvent.click(option!);
      expect(defaultProps.onSelectOption).toHaveBeenCalledWith(mockOptions[0], mockPatterns[0]);
    });

    it('should apply selected class when option is clicked', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      const option = screen.getByText('てもいい').closest('.discrimination-option');
      fireEvent.click(option!);
      expect(option).toHaveClass('selected');
    });

    it('should pass correct pattern to onSelectOption', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      const option = screen.getByText('てはいけない').closest('.discrimination-option');
      fireEvent.click(option!);
      expect(defaultProps.onSelectOption).toHaveBeenCalledWith(mockOptions[1], mockPatterns[1]);
    });
  });

  describe('Edge Cases', () => {
    it('should show error when no options available', () => {
      render(<DiscriminationDrill {...defaultProps} exercise={{ ...mockExercise, options: [] }} />);
      expect(screen.getByText('No options available for this drill.')).toBeInTheDocument();
    });

    it('should handle undefined options', () => {
      render(<DiscriminationDrill {...defaultProps} exercise={{ ...mockExercise, options: undefined }} />);
      expect(screen.getByText('No options available for this drill.')).toBeInTheDocument();
    });

    it('should not render options for patterns not in the patterns list', () => {
      const optionsWithMissingPattern: DiscriminationOption[] = [
        ...mockOptions,
        { pattern_id: 999, pattern: 'unknown', category: 'Test', is_correct: false, explanation: '' },
      ];
      render(<DiscriminationDrill {...defaultProps} exercise={{ ...mockExercise, options: optionsWithMissingPattern }} />);
      // Should only render 2 options since pattern 999 is not in mockPatterns
      const options = screen.getAllByText(/てもいい|てはいけない/);
      expect(options.length).toBe(2);
    });
  });

  describe('Furigana', () => {
    it('should pass showFurigana to ExerciseDisplay', () => {
      const { container } = render(<DiscriminationDrill {...defaultProps} showFurigana={true} />);
      const rubyElements = container.querySelectorAll('ruby');
      expect(rubyElements.length).toBeGreaterThan(0);
    });
  });

  describe('Option Letters', () => {
    it('should assign letters A, B, C... to options', () => {
      const threeOptions: DiscriminationOption[] = [
        ...mockOptions,
        { pattern_id: 3, pattern: 'なくてもいい', category: 'Lack of Obligation', is_correct: false, explanation: '' },
      ];
      const threePatterns: GrammarPattern[] = [
        ...mockPatterns,
        { id: 3, pattern: 'なくてもいい', category: 'Lack of Obligation', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
      ];
      render(
        <DiscriminationDrill
          {...defaultProps}
          exercise={{ ...mockExercise, options: threeOptions }}
          patterns={threePatterns}
        />
      );
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });
});
