import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComparisonView } from '../../components/GrammarMode/ComparisonView';
import type { GrammarPattern } from '../../components/GrammarMode/GrammarMode';

// Mock the ExerciseDisplay component
vi.mock('../../components/GrammarMode/ExerciseDisplay', () => ({
  ExerciseDisplay: ({ text }: { text: string }) => <span>{text}</span>,
}));

describe('ComparisonView', () => {
  const mockPattern1: GrammarPattern = {
    id: 1,
    pattern: 'てもいい',
    category: 'Permission',
    jlpt_level: 'N5',
    formation_rules: [
      { step: 1, rule: 'Verb te-form + もいい' },
    ],
    examples: [
      { jp: '写真を撮ってもいいですか', en: 'May I take a photo?' },
    ],
    common_mistakes: [
      { mistake: 'Using plain form', explanation: 'Must use te-form' },
    ],
  };

  const mockPattern2: GrammarPattern = {
    id: 2,
    pattern: 'なくてもいい',
    category: 'Lack of Obligation',
    jlpt_level: 'N5',
    formation_rules: [
      { step: 1, rule: 'Verb nai-form + くてもいい' },
    ],
    examples: [
      { jp: '来なくてもいいです', en: "You don't have to come" },
    ],
    common_mistakes: [],
  };

  const mockOnClose = vi.fn();
  const mockOnSelectPattern = vi.fn();

  const defaultProps = {
    patterns: [mockPattern1, mockPattern2],
    showFurigana: false,
    onClose: mockOnClose,
    onSelectPattern: mockOnSelectPattern,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the comparison modal', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.getByText('🔍 Pattern Comparison')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<ComparisonView {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: '×' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render both patterns', () => {
      render(<ComparisonView {...defaultProps} />);
      
      const pattern1 = screen.getAllByText('てもいい');
      const pattern2 = screen.getAllByText('なくてもいい');
      expect(pattern1.length).toBeGreaterThanOrEqual(1);
      expect(pattern2.length).toBeGreaterThanOrEqual(1);
    });

    it('should render pattern categories', () => {
      render(<ComparisonView {...defaultProps} />);
      
      const permissions = screen.getAllByText('Permission');
      const obligations = screen.getAllByText('Lack of Obligation');
      expect(permissions.length).toBeGreaterThanOrEqual(1);
      expect(obligations.length).toBeGreaterThanOrEqual(1);
    });

    it('should render pattern indices', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Formation Rules', () => {
    it('should render formation rules section', () => {
      render(<ComparisonView {...defaultProps} />);
      
      const formations = screen.getAllByText('Formation:');
      expect(formations.length).toBeGreaterThanOrEqual(1);
    });

    it('should render formation rule with step number', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.getByText('Verb te-form + もいい')).toBeInTheDocument();
    });
  });

  describe('Examples', () => {
    it('should render examples section', () => {
      render(<ComparisonView {...defaultProps} />);
      
      const examples = screen.getAllByText('Examples:');
      expect(examples.length).toBeGreaterThanOrEqual(1);
    });

    it('should render Japanese example', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.getByText('写真を撮ってもいいですか')).toBeInTheDocument();
    });

    it('should render English translation', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.getByText('May I take a photo?')).toBeInTheDocument();
    });
  });

  describe('Common Mistakes', () => {
    it('should render common mistakes when present', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.getByText('⚠️ Common Mistakes:')).toBeInTheDocument();
      expect(screen.getByText('Using plain form')).toBeInTheDocument();
      expect(screen.getByText('Must use te-form')).toBeInTheDocument();
    });

    it('should not render common mistakes section when empty', () => {
      render(<ComparisonView {...defaultProps} patterns={[mockPattern2]} />);
      
      expect(screen.queryByText('⚠️ Common Mistakes:')).not.toBeInTheDocument();
    });
  });

  describe('Practice Button', () => {
    it('should render practice button for each pattern', () => {
      render(<ComparisonView {...defaultProps} />);
      
      const practiceButtons = screen.getAllByText('Practice This →');
      expect(practiceButtons).toHaveLength(2);
    });

    it('should call onSelectPattern when practice button clicked', () => {
      render(<ComparisonView {...defaultProps} />);
      
      const practiceButtons = screen.getAllByText('Practice This →');
      fireEvent.click(practiceButtons[0]);
      
      expect(mockOnSelectPattern).toHaveBeenCalledWith(mockPattern1);
    });
  });

  describe('Key Differences', () => {
    it('should render key differences section for 2 patterns', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.getByText('🎯 Key Differences')).toBeInTheDocument();
    });

    it('should render vs divider', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.getByText('vs')).toBeInTheDocument();
    });

    it('should not render key differences for single pattern', () => {
      render(<ComparisonView {...defaultProps} patterns={[mockPattern1]} />);
      
      expect(screen.queryByText('🎯 Key Differences')).not.toBeInTheDocument();
    });

    it('should not render key differences for 3+ patterns', () => {
      const mockPattern3: GrammarPattern = {
        id: 3,
        pattern: 'なければならない',
        category: 'Obligation',
        jlpt_level: 'N4',
        formation_rules: [],
        examples: [],
        common_mistakes: [],
      };
      
      render(<ComparisonView {...defaultProps} patterns={[mockPattern1, mockPattern2, mockPattern3]} />);
      
      expect(screen.queryByText('🎯 Key Differences')).not.toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button clicked', () => {
      render(<ComparisonView {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: '×' });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Counter Info', () => {
    it('should render counter info when counts property exists', () => {
      const counterPattern: GrammarPattern = {
        id: 5,
        pattern: '個',
        category: 'Counters',
        jlpt_level: 'N5',
        formation_rules: [
          { rule: 'Number + 個', counts: 'Small objects', usage: 'General counter' },
        ],
        examples: [],
        common_mistakes: [],
      };

      render(<ComparisonView {...defaultProps} patterns={[counterPattern]} />);
      
      expect(screen.getByText('Liczy:')).toBeInTheDocument();
      expect(screen.getByText('Small objects')).toBeInTheDocument();
      expect(screen.getByText('(General counter)')).toBeInTheDocument();
    });

    it('should not render counter info when counts property missing', () => {
      render(<ComparisonView {...defaultProps} />);
      
      expect(screen.queryByText('Liczy:')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty patterns array', () => {
      render(<ComparisonView {...defaultProps} patterns={[]} />);
      
      expect(screen.getByText('🔍 Pattern Comparison')).toBeInTheDocument();
    });

    it('should handle patterns with missing optional fields', () => {
      const minimalPattern: GrammarPattern = {
        id: 1,
        pattern: 'てもいい',
        category: 'Permission',
        jlpt_level: 'N5',
        formation_rules: [],
        examples: [],
        common_mistakes: [],
      };

      render(<ComparisonView {...defaultProps} patterns={[minimalPattern]} />);
      
      expect(screen.getByText('てもいい')).toBeInTheDocument();
    });
  });
});
