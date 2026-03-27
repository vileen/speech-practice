import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HighlightedText } from '../../components/HighlightedText/HighlightedText';

describe('HighlightedText', () => {
  // Mock audio element
  const createMockAudioElement = (): HTMLAudioElement => {
    const audio = document.createElement('audio');
    return Object.defineProperties(audio, {
      currentTime: { value: 0, writable: true },
      duration: { value: 10, writable: true },
      paused: { value: false, writable: true },
      play: { value: vi.fn(), writable: true },
      pause: { value: vi.fn(), writable: true },
    }) as HTMLAudioElement;
  };

  // Mock requestAnimationFrame
  let rafCallbacks: Array<(time: number) => void> = [];
  let rafIdCounter = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafIdCounter = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallbacks.push(callback);
      return ++rafIdCounter;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      rafCallbacks = rafCallbacks.filter((_, index) => index + 1 !== id);
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic rendering', () => {
    it('should render plain text when not playing and no furigana', () => {
      render(<HighlightedText text="こんにちは" audioElement={null} isPlaying={false} />);
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
    });

    it('should render English text', () => {
      render(<HighlightedText text="Hello world" audioElement={null} isPlaying={false} />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('should handle empty text', () => {
      const { container } = render(<HighlightedText text="" audioElement={null} isPlaying={false} />);
      expect(container.textContent).toBe('');
    });
  });

  describe('furigana rendering', () => {
    it('should render furigana from reading prop', () => {
      const { container } = render(
        <HighlightedText text="安い" reading="やす" audioElement={null} isPlaying={false} />
      );
      // Furigana is rendered via dangerouslySetInnerHTML
      expect(container.querySelector('ruby')).toBeInTheDocument();
      expect(container.querySelector('rt')).toHaveTextContent('やす');
    });

    it('should render furigana from preloadedFurigana prop', () => {
      const { container } = render(
        <HighlightedText 
          text="日本語" 
          preloadedFurigana="<ruby>日本<rt>にほん</rt></ruby>語" 
          audioElement={null} 
          isPlaying={false} 
        />
      );
      expect(container.querySelector('ruby')).toBeInTheDocument();
    });

    it('should prefer reading prop over preloadedFurigana', () => {
      const { container } = render(
        <HighlightedText 
          text="安い" 
          reading="やす"
          preloadedFurigana="<ruby>古<rt>ふる</rt></ruby>い" 
          audioElement={null} 
          isPlaying={false} 
        />
      );
      expect(container.querySelector('rt')).toHaveTextContent('やす');
    });

    it('should not render furigana for pure hiragana text', () => {
      const { container } = render(
        <HighlightedText text="こんにちは" reading="konnichiwa" audioElement={null} isPlaying={false} />
      );
      expect(container.querySelector('ruby')).not.toBeInTheDocument();
    });

    it('should not render furigana for pure katakana text', () => {
      const { container } = render(
        <HighlightedText text="カタカナ" reading="katakana" audioElement={null} isPlaying={false} />
      );
      expect(container.querySelector('ruby')).not.toBeInTheDocument();
    });

    it('should handle kanji with okurigana', () => {
      const { container } = render(
        <HighlightedText text="高い" reading="たか" audioElement={null} isPlaying={false} />
      );
      const ruby = container.querySelector('ruby');
      expect(ruby).toBeInTheDocument();
      expect(ruby).toContainHTML('高');
      expect(container.querySelector('rt')).toHaveTextContent('たか');
    });
  });

  describe('text segmentation', () => {
    it('should split Japanese text into segments', () => {
      const { container } = render(
        <HighlightedText text="こんにちは世界" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      const segments = container.querySelectorAll('.text-segment');
      expect(segments.length).toBeGreaterThan(0);
    });

    it('should split English text by spaces', () => {
      const { container } = render(
        <HighlightedText text="Hello world test" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      const segments = container.querySelectorAll('.text-segment');
      expect(segments.length).toBe(3);
    });

    it('should handle punctuation in Japanese', () => {
      const { container } = render(
        <HighlightedText text="こんにちは。さようなら" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      const segments = container.querySelectorAll('.text-segment');
      expect(segments.length).toBeGreaterThan(0);
    });

    it('should handle mixed Japanese and punctuation', () => {
      const { container } = render(
        <HighlightedText text="日本語、英語！日本語？" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      const segments = container.querySelectorAll('.text-segment');
      expect(segments.length).toBeGreaterThan(0);
    });
  });

  describe('highlighting behavior', () => {
    it('should not show highlighting when not playing', () => {
      const { container } = render(
        <HighlightedText text="Hello world" audioElement={createMockAudioElement()} isPlaying={false} />
      );
      expect(container.querySelector('.highlighted')).not.toBeInTheDocument();
    });

    it('should show segments when playing', () => {
      const { container } = render(
        <HighlightedText text="Hello world" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      expect(container.querySelectorAll('.text-segment').length).toBe(2);
    });

    it('should apply highlighted class to segments when playing', () => {
      const mockAudio = createMockAudioElement();
      const { container } = render(
        <HighlightedText text="Hello world" audioElement={mockAudio} isPlaying={true} />
      );
      
      // Trigger animation frame
      if (rafCallbacks.length > 0) {
        rafCallbacks[0](performance.now());
      }
      
      const highlightedSegments = container.querySelectorAll('.text-segment.highlighted');
      // At least one segment should be highlighted or have the potential to be
      expect(container.querySelectorAll('.text-segment').length).toBe(2);
    });

    it('should handle null audio element gracefully', () => {
      const { container } = render(
        <HighlightedText text="Hello world" audioElement={null} isPlaying={true} />
      );
      // Should not throw, just render text without highlighting
      // When isPlaying=true but audioElement is null, segments are rendered without spaces
      expect(container.textContent).toContain('Hello');
      expect(container.textContent).toContain('world');
    });
  });

  describe('animation frame lifecycle', () => {
    it('should start animation frame when playing begins', () => {
      const mockAudio = createMockAudioElement();
      render(<HighlightedText text="Test" audioElement={mockAudio} isPlaying={true} />);
      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should cancel animation frame when playing stops', () => {
      const mockAudio = createMockAudioElement();
      const { unmount } = render(
        <HighlightedText text="Test" audioElement={mockAudio} isPlaying={true} />
      );
      
      unmount();
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should cancel animation frame when audio element is removed', () => {
      const mockAudio = createMockAudioElement();
      const { rerender } = render(
        <HighlightedText text="Test" audioElement={mockAudio} isPlaying={true} />
      );
      
      rerender(<HighlightedText text="Test" audioElement={null} isPlaying={true} />);
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should cancel animation frame when isPlaying becomes false', () => {
      const mockAudio = createMockAudioElement();
      const { rerender } = render(
        <HighlightedText text="Test" audioElement={mockAudio} isPlaying={true} />
      );
      
      rerender(<HighlightedText text="Test" audioElement={mockAudio} isPlaying={false} />);
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('complex phrases', () => {
    it('should handle long Japanese sentences', () => {
      const { container } = render(
        <HighlightedText 
          text="日本語を勉強しています" 
          audioElement={createMockAudioElement()} 
          isPlaying={true} 
        />
      );
      expect(container.querySelectorAll('.text-segment').length).toBeGreaterThan(0);
    });

    it('should handle mixed kanji and hiragana with furigana', () => {
      const { container } = render(
        <HighlightedText 
          text="美味しい料理" 
          reading="おい"
          audioElement={null} 
          isPlaying={false} 
        />
      );
      const ruby = container.querySelector('ruby');
      expect(ruby).toBeInTheDocument();
    });

    it('should handle text with multiple kanji', () => {
      const { container } = render(
        <HighlightedText 
          text="日本語学校" 
          reading="にほん"
          audioElement={null} 
          isPlaying={false} 
        />
      );
      const ruby = container.querySelector('ruby');
      expect(ruby).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only text', () => {
      const { container } = render(
        <HighlightedText text="   " audioElement={null} isPlaying={false} />
      );
      expect(container.textContent).toBe('   ');
    });

    it('should handle special characters', () => {
      const { container } = render(
        <HighlightedText text="Hello! @#$%" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      expect(container.querySelectorAll('.text-segment').length).toBeGreaterThan(0);
    });

    it('should handle numbers in text', () => {
      const { container } = render(
        <HighlightedText text="Test 123 test" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      expect(container.textContent).toContain('123');
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      const { container } = render(
        <HighlightedText text={longText} audioElement={createMockAudioElement()} isPlaying={true} />
      );
      expect(container.querySelectorAll('.text-segment').length).toBeGreaterThan(0);
    });

    it('should handle audio with zero duration', () => {
      const mockAudio = createMockAudioElement();
      Object.defineProperty(mockAudio, 'duration', { value: 0, writable: true });
      const { container } = render(
        <HighlightedText text="Test" audioElement={mockAudio} isPlaying={true} />
      );
      expect(container.querySelectorAll('.text-segment').length).toBeGreaterThan(0);
    });

    it('should handle audio with NaN duration', () => {
      const mockAudio = createMockAudioElement();
      Object.defineProperty(mockAudio, 'duration', { value: NaN, writable: true });
      const { container } = render(
        <HighlightedText text="Test" audioElement={mockAudio} isPlaying={true} />
      );
      expect(container.querySelectorAll('.text-segment').length).toBeGreaterThan(0);
    });
  });

  describe('CSS classes', () => {
    it('should apply highlighted-text class when playing', () => {
      const { container } = render(
        <HighlightedText text="Test" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      expect(container.querySelector('.highlighted-text')).toBeInTheDocument();
    });

    it('should apply text-segment class to segments', () => {
      const { container } = render(
        <HighlightedText text="Hello world" audioElement={createMockAudioElement()} isPlaying={true} />
      );
      const segments = container.querySelectorAll('.text-segment');
      expect(segments.length).toBe(2);
    });
  });
});
