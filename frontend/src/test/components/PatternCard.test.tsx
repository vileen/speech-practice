import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternCard } from '../../components/GrammarMode/PatternCard';
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

describe('PatternCard', () => {
  const mockPattern: GrammarPattern = {
    id: 1,
    pattern: '漢字',
    category: 'Nouns',
    jlpt_level: 'N5',
    formation_rules: [],
    examples: [],
    common_mistakes: [],
  };

  const mockOnClick = vi.fn();
  const mockOnCompare = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pattern text', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('漢字')).toBeInTheDocument();
    });

    it('should render category', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Nouns')).toBeInTheDocument();
    });

    it('should render JLPT level', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('N5')).toBeInTheDocument();
    });

    it('should render furigana when showFurigana is true', () => {
      const { container } = render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={true}
          onClick={mockOnClick}
        />
      );

      const rubyElement = container.querySelector('ruby');
      expect(rubyElement).toBeInTheDocument();
      expect(rubyElement).toHaveTextContent('漢字');
    });

    it('should not render furigana when showFurigana is false', () => {
      const { container } = render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(container.querySelector('ruby')).not.toBeInTheDocument();
      expect(screen.getByText('漢字')).toBeInTheDocument();
    });
  });

  describe('Streak badge', () => {
    it('should not render streak badge when streak is 0', () => {
      render(
        <PatternCard
          pattern={{ ...mockPattern, streak: 0 }}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    });

    it('should not render streak badge when streak is undefined', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    });

    it('should render streak badge when streak is positive', () => {
      render(
        <PatternCard
          pattern={{ ...mockPattern, streak: 5 }}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('🔥 5')).toBeInTheDocument();
    });
  });

  describe('Confusion badge', () => {
    it('should not render confusion badge when hasConfusion is false', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
          hasConfusion={false}
        />
      );

      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });

    it('should not render confusion badge when hasConfusion is undefined', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });

    it('should render confusion badge when hasConfusion is true', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
          hasConfusion={true}
        />
      );

      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should add has-confusion class when hasConfusion is true', () => {
      const { container } = render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
          hasConfusion={true}
        />
      );

      const card = container.querySelector('.pattern-card');
      expect(card).toHaveClass('has-confusion');
    });
  });

  describe('Compare button', () => {
    it('should not render compare button when onCompare is not provided', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.queryByText('Compare')).not.toBeInTheDocument();
    });

    it('should not render compare button when pattern has no related patterns', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
          onCompare={mockOnCompare}
        />
      );

      expect(screen.queryByText('Compare')).not.toBeInTheDocument();
    });

    it('should render compare button when onCompare is provided and pattern has related patterns', () => {
      render(
        <PatternCard
          pattern={{ ...mockPattern, related_patterns: [2, 3] }}
          showFurigana={false}
          onClick={mockOnClick}
          onCompare={mockOnCompare}
        />
      );

      expect(screen.getByText('Compare')).toBeInTheDocument();
    });

    it('should call onCompare when compare button is clicked', () => {
      render(
        <PatternCard
          pattern={{ ...mockPattern, related_patterns: [2] }}
          showFurigana={false}
          onClick={mockOnClick}
          onCompare={mockOnCompare}
        />
      );

      const compareButton = screen.getByText('Compare');
      fireEvent.click(compareButton);

      expect(mockOnCompare).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onClick when compare button is clicked', () => {
      render(
        <PatternCard
          pattern={{ ...mockPattern, related_patterns: [2] }}
          showFurigana={false}
          onClick={mockOnClick}
          onCompare={mockOnCompare}
        />
      );

      const compareButton = screen.getByText('Compare');
      fireEvent.click(compareButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Click interactions', () => {
    it('should call onClick when card is clicked', () => {
      render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByText('漢字').closest('.pattern-card');
      fireEvent.click(card!);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS classes', () => {
    it('should have pattern-card class', () => {
      const { container } = render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(container.querySelector('.pattern-card')).toBeInTheDocument();
    });

    it('should have pattern-header class', () => {
      const { container } = render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(container.querySelector('.pattern-header')).toBeInTheDocument();
    });

    it('should have pattern-text class', () => {
      const { container } = render(
        <PatternCard
          pattern={mockPattern}
          showFurigana={false}
          onClick={mockOnClick}
        />
      );

      expect(container.querySelector('.pattern-text')).toBeInTheDocument();
    });
  });
});
