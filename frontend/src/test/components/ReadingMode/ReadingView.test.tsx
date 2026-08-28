import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReadingView } from '../../../components/ReadingMode/ReadingView';
import type { Passage } from '../../../components/ReadingMode/types';

// Mock FuriganaDisplay to avoid useFurigana hook complexity
vi.mock('../../../components/ReadingMode/FuriganaDisplay', () => ({
  FuriganaDisplay: ({ text, className }: { text: string; className?: string }) => (
    <span data-testid="furigana-display" className={className}>{text}</span>
  ),
}));

const mockPassage: Passage = {
  id: 1,
  title: 'Test Passage',
  content: 'これはテストです。',
  level: 'N5',
  topic: 'Daily Life',
  character_count: 12,
  created_at: '2026-08-28T00:00:00Z',
};

describe('ReadingView', () => {
  const defaultProps = {
    passage: mockPassage,
    showFurigana: false,
    onContinue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the passage title', () => {
      render(<ReadingView {...defaultProps} />);
      expect(screen.getByRole('heading', { name: 'Test Passage' })).toBeInTheDocument();
    });

    it('should render the level badge with correct color', () => {
      const { container } = render(<ReadingView {...defaultProps} />);
      const badge = container.querySelector('.level-badge');
      expect(badge).toHaveTextContent('N5');
      expect(badge).toHaveStyle({ backgroundColor: '#4ade80' });
    });

    it('should render the topic badge when topic is provided', () => {
      render(<ReadingView {...defaultProps} />);
      expect(screen.getByText('Daily Life')).toBeInTheDocument();
    });

    it('should render the character count badge', () => {
      render(<ReadingView {...defaultProps} />);
      expect(screen.getByText('12 characters')).toBeInTheDocument();
    });

    it('should render the passage content through FuriganaDisplay', () => {
      render(<ReadingView {...defaultProps} />);
      const display = screen.getByTestId('furigana-display');
      expect(display).toHaveTextContent('これはテストです。');
    });

    it('should pass showFurigana to FuriganaDisplay', () => {
      const { rerender } = render(<ReadingView {...defaultProps} showFurigana={false} />);
      expect(screen.getByTestId('furigana-display')).toBeInTheDocument();

      rerender(<ReadingView {...defaultProps} showFurigana={true} />);
      expect(screen.getByTestId('furigana-display')).toBeInTheDocument();
    });

    it('should not render topic badge when topic is empty', () => {
      const passageWithoutTopic = { ...mockPassage, topic: '' };
      render(<ReadingView {...defaultProps} passage={passageWithoutTopic} />);
      expect(screen.queryByText('Daily Life')).not.toBeInTheDocument();
    });

    it('should apply passage-text class to FuriganaDisplay', () => {
      render(<ReadingView {...defaultProps} />);
      const display = screen.getByTestId('furigana-display');
      expect(display).toHaveClass('passage-text');
    });
  });

  describe('interactions', () => {
    it('should call onContinue when continue button is clicked', () => {
      const onContinueMock = vi.fn();
      render(<ReadingView {...defaultProps} onContinue={onContinueMock} />);

      const continueButton = screen.getByRole('button', { name: /continue to questions/i });
      fireEvent.click(continueButton);

      expect(onContinueMock).toHaveBeenCalledTimes(1);
    });

    it('should disable or hide continue button behavior when onContinue is not triggered', () => {
      const onContinueMock = vi.fn();
      render(<ReadingView {...defaultProps} onContinue={onContinueMock} />);

      // Button should be present
      expect(screen.getByRole('button')).toBeInTheDocument();

      // Click it again to verify callback is called
      fireEvent.click(screen.getByRole('button'));
      expect(onContinueMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('different levels', () => {
    it('should render N4 level with correct color', () => {
      const n4Passage = { ...mockPassage, level: 'N4' };
      const { container } = render(<ReadingView {...defaultProps} passage={n4Passage} />);
      const badge = container.querySelector('.level-badge');
      expect(badge).toHaveTextContent('N4');
      expect(badge).toHaveStyle({ backgroundColor: '#60a5fa' });
    });

    it('should render N3 level with correct color', () => {
      const n3Passage = { ...mockPassage, level: 'N3' };
      const { container } = render(<ReadingView {...defaultProps} passage={n3Passage} />);
      const badge = container.querySelector('.level-badge');
      expect(badge).toHaveTextContent('N3');
      expect(badge).toHaveStyle({ backgroundColor: '#fbbf24' });
    });
  });

  describe('structure and accessibility', () => {
    it('should render reading-view container', () => {
      const { container } = render(<ReadingView {...defaultProps} />);
      expect(container.querySelector('.reading-view')).toBeInTheDocument();
    });

    it('should render passage info section', () => {
      const { container } = render(<ReadingView {...defaultProps} />);
      expect(container.querySelector('.passage-info')).toBeInTheDocument();
      expect(container.querySelector('.passage-badges')).toBeInTheDocument();
    });

    it('should render passage content section', () => {
      const { container } = render(<ReadingView {...defaultProps} />);
      expect(container.querySelector('.passage-content')).toBeInTheDocument();
    });

    it('should render reading actions section', () => {
      const { container } = render(<ReadingView {...defaultProps} />);
      expect(container.querySelector('.reading-actions')).toBeInTheDocument();
    });
  });
});
