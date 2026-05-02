import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiscriminationDrill } from '../../components/GrammarMode/DiscriminationDrill';
import type { GrammarExercise, GrammarPattern, DiscriminationOption } from '../../components/GrammarMode/GrammarMode';

// Mock the ExerciseDisplay component
vi.mock('../../components/GrammarMode/ExerciseDisplay', () => ({
  ExerciseDisplay: ({ text }: { text: string }) => <span>{text}</span>,
}));

describe('DiscriminationDrill', () => {
  const mockPatterns: GrammarPattern[] = [
    {
      id: 1,
      pattern: 'てもいい',
      category: 'Permission',
      jlpt_level: 'N5',
      formation_rules: [],
      examples: [],
      common_mistakes: [],
    },
    {
      id: 2,
      pattern: 'なくてもいい',
      category: 'Lack of Obligation',
      jlpt_level: 'N5',
      formation_rules: [],
      examples: [],
      common_mistakes: [],
    },
  ];

  const mockExercise: GrammarExercise = {
    id: 1,
    type: 'discrimination',
    prompt: 'Choose the correct pattern for asking permission',
    context: 'You want to ask if you may take a photo',
    correct_answer: 'てもいい',
    hints: [],
    difficulty: 1,
    options: [
      {
        pattern_id: 1,
        pattern: 'てもいい',
        category: 'Permission',
        is_correct: true,
        explanation: 'Used to ask for permission',
      },
      {
        pattern_id: 2,
        pattern: 'なくてもいい',
        category: 'Lack of Obligation',
        is_correct: false,
        explanation: 'Used to say something is not necessary',
      },
    ],
  };

  const mockOnSelectOption = vi.fn();

  const defaultProps = {
    exercise: mockExercise,
    patterns: mockPatterns,
    showFurigana: false,
    onSelectOption: mockOnSelectOption,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the drill prompt', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      expect(screen.getByText('Choose the correct pattern for asking permission')).toBeInTheDocument();
    });

    it('should render the context hint', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      expect(screen.getByText('You want to ask if you may take a photo')).toBeInTheDocument();
    });

    it('should render the question text', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      expect(screen.getByText('Choose the correct pattern:')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      expect(screen.getByText('てもいい')).toBeInTheDocument();
      expect(screen.getByText('なくてもいい')).toBeInTheDocument();
    });

    it('should render option letters', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should render option categories', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      expect(screen.getByText('Permission')).toBeInTheDocument();
      expect(screen.getByText('Lack of Obligation')).toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('should call onSelectOption when option clicked', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      const options = screen.getAllByRole('button');
      fireEvent.click(options[0]);
      
      expect(mockOnSelectOption).toHaveBeenCalledWith(
        mockExercise.options![0],
        mockPatterns[0]
      );
    });

    it('should apply selected class to clicked option', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      const options = screen.getAllByRole('button');
      fireEvent.click(options[0]);
      
      expect(options[0]).toHaveClass('selected');
    });

    it('should handle selecting different options', () => {
      render(<DiscriminationDrill {...defaultProps} />);
      
      const options = screen.getAllByRole('button');
      fireEvent.click(options[1]);
      
      expect(mockOnSelectOption).toHaveBeenCalledWith(
        mockExercise.options![1],
        mockPatterns[1]
      );
    });
  });

  describe('Exercise without Context', () => {
    it('should not render context when not provided', () => {
      const exerciseNoContext = {
        ...mockExercise,
        context: '',
      };
      
      render(<DiscriminationDrill {...defaultProps} exercise={exerciseNoContext} />);
      
      expect(screen.queryByText('You want to ask if you may take a photo')).not.toBeInTheDocument();
    });
  });

  describe('Empty Options', () => {
    it('should render error message when no options', () => {
      const exerciseNoOptions = {
        ...mockExercise,
        options: [],
      };
      
      render(<DiscriminationDrill {...defaultProps} exercise={exerciseNoOptions} />);
      
      expect(screen.getByText('No options available for this drill.')).toBeInTheDocument();
    });

    it('should render error message when options undefined', () => {
      const exerciseNoOptions = {
        ...mockExercise,
        options: undefined,
      };
      
      render(<DiscriminationDrill {...defaultProps} exercise={exerciseNoOptions} />);
      
      expect(screen.getByText('No options available for this drill.')).toBeInTheDocument();
    });
  });

  describe('Missing Pattern', () => {
    it('should skip option when pattern not found', () => {
      const exerciseWithMissingPattern = {
        ...mockExercise,
        options: [
          ...mockExercise.options!,
          {
            pattern_id: 999,
            pattern: 'Unknown',
            category: 'Unknown',
            is_correct: false,
            explanation: '',
          },
        ],
      };
      
      render(<DiscriminationDrill {...defaultProps} exercise={exerciseWithMissingPattern} />);
      
      // Should only render 2 options (the ones with matching patterns)
      const options = screen.getAllByRole('button');
      expect(options).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single option', () => {
      const exerciseSingleOption = {
        ...mockExercise,
        options: [mockExercise.options![0]],
      };
      
      render(<DiscriminationDrill {...defaultProps} exercise={exerciseSingleOption} />);
      
      expect(screen.getByText('てもいい')).toBeInTheDocument();
      expect(screen.queryByText('なくてもいい')).not.toBeInTheDocument();
    });

    it('should handle many options', () => {
      const manyOptions: DiscriminationOption[] = [
        { pattern_id: 1, pattern: 'Option A', category: 'Cat A', is_correct: false, explanation: '' },
        { pattern_id: 2, pattern: 'Option B', category: 'Cat B', is_correct: false, explanation: '' },
        { pattern_id: 3, pattern: 'Option C', category: 'Cat C', is_correct: false, explanation: '' },
        { pattern_id: 4, pattern: 'Option D', category: 'Cat D', is_correct: true, explanation: '' },
      ];
      
      const exerciseManyOptions = {
        ...mockExercise,
        options: manyOptions,
      };
      
      const manyPatterns: GrammarPattern[] = [
        ...mockPatterns,
        { id: 3, pattern: 'Option C', category: 'Cat C', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
        { id: 4, pattern: 'Option D', category: 'Cat D', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
      ];
      
      render(<DiscriminationDrill {...defaultProps} exercise={exerciseManyOptions} patterns={manyPatterns} />);
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });
  });
});
