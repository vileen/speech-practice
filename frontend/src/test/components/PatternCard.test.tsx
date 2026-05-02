import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternCard } from '../../components/GrammarMode/PatternCard';
import type { GrammarPattern } from '../../components/GrammarMode/GrammarMode';

// Mock the useFurigana hook
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: vi.fn((text: string, enabled: boolean) => ({
    furigana: enabled ? `<ruby>${text}<rt>reading</rt></ruby>` : null,
    loading: false,
    error: null,
  })),
}));

describe('PatternCard', () => {
  const mockPattern: GrammarPattern = {
    id: 1,
    pattern: 'てもいい',
    category: 'Permission',
    jlpt_level: 'N5',
    formation_rules: [],
    examples: [],
    common_mistakes: [],
    streak: 5,
    total_attempts: 10,
    correct_attempts: 8,
  };

  const mockOnClick = vi.fn();
  const mockOnCompare = vi.fn();

  const defaultProps = {
    pattern: mockPattern,
    showFurigana: false,
    onClick: mockOnClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render pattern text', () => {
      render(<PatternCard {...defaultProps} />);
      
      expect(screen.getByText('てもいい')).toBeInTheDocument();
    });

    it('should render JLPT level badge', () => {
      render(<PatternCard {...defaultProps} />);
      
      expect(screen.getByText('N5')).toBeInTheDocument();
    });

    it('should render category', () => {
      render(<PatternCard {...defaultProps} />);
      
      expect(screen.getByText('Permission')).toBeInTheDocument();
    });

    it('should render streak when present', () => {
      render(<PatternCard {...defaultProps} />);
      
      expect(screen.getByText('🔥 5')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when card clicked', () => {
      render(<PatternCard {...defaultProps} />);
      
      const card = screen.getByText('てもいい').closest('.pattern-card');
      fireEvent.click(card!);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Confusion Badge', () => {
    it('should render confusion badge when hasConfusion is true', () => {
      render(<PatternCard {...defaultProps} hasConfusion={true} />);
      
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should not render confusion badge when hasConfusion is false', () => {
      render(<PatternCard {...defaultProps} hasConfusion={false} />);
      
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });

    it('should apply has-confusion class when hasConfusion is true', () => {
      render(<PatternCard {...defaultProps} hasConfusion={true} />);
      
      const card = screen.getByText('てもいい').closest('.pattern-card');
      expect(card).toHaveClass('has-confusion');
    });
  });

  describe('Compare Button', () => {
    it('should render compare button when onCompare provided and related patterns exist', () => {
      const patternWithRelated = {
        ...mockPattern,
        related_patterns: [2, 3],
      };
      
      render(<PatternCard {...defaultProps} pattern={patternWithRelated} onCompare={mockOnCompare} />);
      
      expect(screen.getByText('Compare')).toBeInTheDocument();
    });

    it('should not render compare button when no related patterns', () => {
      render(<PatternCard {...defaultProps} onCompare={mockOnCompare} />);
      
      expect(screen.queryByText('Compare')).not.toBeInTheDocument();
    });

    it('should not render compare button when onCompare not provided', () => {
      const patternWithRelated = {
        ...mockPattern,
        related_patterns: [2, 3],
      };
      
      render(<PatternCard {...defaultProps} pattern={patternWithRelated} />);
      
      expect(screen.queryByText('Compare')).not.toBeInTheDocument();
    });

    it('should call onCompare when compare button clicked', () => {
      const patternWithRelated = {
        ...mockPattern,
        related_patterns: [2, 3],
      };
      
      render(<PatternCard {...defaultProps} pattern={patternWithRelated} onCompare={mockOnCompare} />);
      
      const compareButton = screen.getByText('Compare');
      fireEvent.click(compareButton);
      
      expect(mockOnCompare).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation when compare button clicked', () => {
      const patternWithRelated = {
        ...mockPattern,
        related_patterns: [2, 3],
      };
      
      render(<PatternCard {...defaultProps} pattern={patternWithRelated} onCompare={mockOnCompare} />);
      
      const compareButton = screen.getByText('Compare');
      fireEvent.click(compareButton);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Streak Display', () => {
    it('should not render streak when zero', () => {
      const patternNoStreak = {
        ...mockPattern,
        streak: 0,
      };
      
      render(<PatternCard {...defaultProps} pattern={patternNoStreak} />);
      
      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    });

    it('should not render streak when undefined', () => {
      const patternNoStreak = {
        ...mockPattern,
        streak: undefined,
      };
      
      render(<PatternCard {...defaultProps} pattern={patternNoStreak} />);
      
      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    });
  });

  describe('Furigana', () => {
    it('should render furigana when enabled', () => {
      render(<PatternCard {...defaultProps} showFurigana={true} />);
      
      const element = screen.getByText('てもいい');
      expect(element.closest('span')?.innerHTML).toContain('ruby');
    });

    it('should render plain text when furigana disabled', () => {
      render(<PatternCard {...defaultProps} showFurigana={false} />);
      
      expect(screen.getByText('てもいい')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('should be memoized component', () => {
      expect(PatternCard.$$typeof?.toString()).toContain('react.memo');
    });
  });
});
