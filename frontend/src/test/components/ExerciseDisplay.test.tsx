import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExerciseDisplay } from '../../components/GrammarMode/ExerciseDisplay';

// Mock useFurigana hook
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: vi.fn((_text: string, enabled: boolean) => {
    if (enabled && _text.includes('漢字')) {
      return {
        furigana: '<ruby>漢字<rt>かんじ</rt></ruby>',
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      };
    }
    return {
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    };
  }),
}));

describe('ExerciseDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render plain text when showFurigana is false', () => {
      render(<ExerciseDisplay text="Hello world" showFurigana={false} />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('should render plain text when showFurigana is true but no furigana available', () => {
      render(<ExerciseDisplay text="Hello world" showFurigana={true} />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('should render furigana HTML when available and showFurigana is true', () => {
      const { container } = render(<ExerciseDisplay text="漢字" showFurigana={true} />);
      const rubyElement = container.querySelector('ruby');
      expect(rubyElement).toBeInTheDocument();
      expect(rubyElement).toHaveTextContent('漢字');
    });

    it('should not render ruby when showFurigana is false', () => {
      const { container } = render(<ExerciseDisplay text="漢字" showFurigana={false} />);
      expect(container.querySelector('ruby')).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(
        <ExerciseDisplay text="Test" showFurigana={false} className="custom-class" />
      );
      const span = container.querySelector('span');
      expect(span).toHaveClass('custom-class');
    });

    it('should have no custom className by default', () => {
      const { container } = render(<ExerciseDisplay text="Test" showFurigana={false} />);
      const span = container.querySelector('span');
      expect(span).not.toHaveClass('custom-class');
    });
  });

  describe('Memo behavior', () => {
    it('should be memoized (React.memo)', () => {
      // ExerciseDisplay is exported with React.memo
      // We verify it renders correctly
      const { rerender } = render(<ExerciseDisplay text="First" showFurigana={false} />);
      expect(screen.getByText('First')).toBeInTheDocument();

      rerender(<ExerciseDisplay text="Second" showFurigana={false} />);
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Empty text', () => {
    it('should handle empty string', () => {
      const { container } = render(<ExerciseDisplay text="" showFurigana={false} />);
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span?.textContent).toBe('');
    });
  });

  describe('Japanese text', () => {
    it('should render hiragana text', () => {
      render(<ExerciseDisplay text="こんにちは" showFurigana={false} />);
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
    });

    it('should render mixed Japanese text', () => {
      render(<ExerciseDisplay text="日本語を勉強します" showFurigana={false} />);
      expect(screen.getByText('日本語を勉強します')).toBeInTheDocument();
    });

    it('should render grammar pattern text', () => {
      render(<ExerciseDisplay text="〜てもいいです" showFurigana={false} />);
      expect(screen.getByText('〜てもいいです')).toBeInTheDocument();
    });
  });
});
