import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { HighlightedText } from '../../../components/HighlightedText/HighlightedText';

function normalizeWhitespace(html: string): string {
  return html.replace(/>\s+</g, '><').trim();
}

describe('HighlightedText', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafId = 0;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    rafCallbacks = new Map();
    rafId = 0;

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        rafId++;
        rafCallbacks.set(rafId, cb);
        return rafId;
      })
    );

    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => {
        rafCallbacks.delete(id);
      })
    );

    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    consoleSpy.mockRestore();
  });

  function advanceRaf(times = 1) {
    act(() => {
      for (let i = 0; i < times; i++) {
        const entries = Array.from(rafCallbacks.entries());
        rafCallbacks.clear();
        for (const [, cb] of entries) {
          cb(performance.now());
        }
      }
    });
  }

  function makeAudio(
    overrides: Partial<{ currentTime: number; duration: number }> = {}
  ): HTMLAudioElement {
    return {
      currentTime: overrides.currentTime ?? 0,
      duration: overrides.duration ?? 10,
      paused: false,
    } as unknown as HTMLAudioElement;
  }

  it('renders plain text when no furigana or audio is provided', () => {
    render(<HighlightedText text="Hello world" audioElement={null} isPlaying={false} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders furigana from the reading prop when not playing', () => {
    const { container } = render(
      <HighlightedText text="安い" reading="やす" audioElement={null} isPlaying={false} />
    );

    expect(container.querySelector('ruby')).toBeInTheDocument();
    expect(normalizeWhitespace(container.innerHTML)).toContain('<ruby>安<rt>やす</rt></ruby>い');
  });

  it('falls back to preloaded furigana when reading is not provided', () => {
    const { container } = render(
      <HighlightedText
        text="食べる"
        preloadedFurigana="<ruby>食<rt>た</rt></ruby>べる"
        audioElement={null}
        isPlaying={false}
      />
    );

    expect(container.querySelector('ruby')).toBeInTheDocument();
    expect(normalizeWhitespace(container.innerHTML)).toContain('<ruby>食<rt>た</rt></ruby>べる');
  });

  it('does not render furigana for pure kana text', () => {
    const { container } = render(
      <HighlightedText text="やすい" reading="やす" audioElement={null} isPlaying={false} />
    );

    expect(container.querySelector('ruby')).not.toBeInTheDocument();
    expect(screen.getByText('やすい')).toBeInTheDocument();
  });

  it('splits Japanese text into words and punctuation', () => {
    const { container } = render(
      <HighlightedText text="こんにちは、元気です！" audioElement={null} isPlaying={true} />
    );

    const segments = container.querySelectorAll('.text-segment');
    expect(segments).toHaveLength(4);
    expect(segments[0]).toHaveTextContent('こんにちは');
    expect(segments[1]).toHaveTextContent('、');
    expect(segments[2]).toHaveTextContent('元気です');
    expect(segments[3]).toHaveTextContent('！');
  });

  it('splits English text on whitespace', () => {
    const { container } = render(
      <HighlightedText text="Hello, world!" audioElement={null} isPlaying={true} />
    );

    const segments = container.querySelectorAll('.text-segment');
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveTextContent('Hello,');
    expect(segments[1]).toHaveTextContent('world!');
  });

  it('starts a requestAnimationFrame loop when isPlaying is true', () => {
    const audio = makeAudio();
    render(<HighlightedText text="Hello" audioElement={audio} isPlaying={true} />);
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('updates the highlighted segment from audio currentTime', () => {
    const audio = makeAudio({ currentTime: 0, duration: 10 });
    render(<HighlightedText text="abc def ghi" audioElement={audio} isPlaying={true} />);

    // 5s into a 10s track -> second word should be highlighted
    audio.currentTime = 5;
    advanceRaf(1);

    const segments = screen.getAllByText(/^[a-z]+$/);
    expect(segments).toHaveLength(3);
    expect(segments[0]).not.toHaveClass('highlighted');
    expect(segments[1]).toHaveClass('highlighted');
    expect(segments[2]).not.toHaveClass('highlighted');
  });

  it('cancels the animation loop when isPlaying becomes false', () => {
    const audio = makeAudio();
    const { rerender } = render(
      <HighlightedText text="Hello" audioElement={audio} isPlaying={true} />
    );

    rerender(<HighlightedText text="Hello" audioElement={audio} isPlaying={false} />);

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('cancels the animation loop on unmount', () => {
    const audio = makeAudio();
    const { unmount } = render(
      <HighlightedText text="Hello" audioElement={audio} isPlaying={true} />
    );

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('does not highlight any segment when duration is zero', () => {
    const audio = makeAudio({ currentTime: 0, duration: 0 });
    render(<HighlightedText text="Hello world" audioElement={audio} isPlaying={true} />);

    advanceRaf(1);

    const segments = document.querySelectorAll('.text-segment');
    segments.forEach((segment) => {
      expect(segment).not.toHaveClass('highlighted');
    });
  });

  it('renders nothing for empty text', () => {
    const { container } = render(
      <HighlightedText text="" audioElement={null} isPlaying={false} />
    );
    expect(container.querySelector('.highlighted-text')).not.toBeInTheDocument();
  });
});
