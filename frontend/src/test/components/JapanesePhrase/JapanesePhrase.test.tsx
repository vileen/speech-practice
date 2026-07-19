import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JapanesePhrase } from '../../../components/JapanesePhrase/JapanesePhrase.js';

describe('JapanesePhrase', () => {
  const baseProps = {
    text: '日本語',
    furiganaHtml: '<ruby>日本<rt>にほん</rt></ruby>語',
    romaji: 'nihongo',
    translation: 'Japanese language',
  };

  it('renders Japanese text with furigana by default', () => {
    const { container } = render(<JapanesePhrase {...baseProps} />);
    expect(container.querySelector('.japanese-phrase')).toBeInTheDocument();
    expect(container.querySelector('.phrase-jp')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('日本'))).toBeInTheDocument();
  });

  it('renders plain text when furigana is disabled', () => {
    render(<JapanesePhrase {...baseProps} showFurigana={false} />);
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('renders plain text when furiganaHtml is not provided', () => {
    render(<JapanesePhrase text="こんにちは" />);
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
  });

  it('displays romaji when enabled and provided', () => {
    render(<JapanesePhrase {...baseProps} showRomaji={true} />);
    expect(screen.getByText('nihongo')).toBeInTheDocument();
  });

  it('hides romaji when showRomaji is false', () => {
    const { container } = render(<JapanesePhrase {...baseProps} showRomaji={false} />);
    expect(screen.queryByText('nihongo')).not.toBeInTheDocument();
    expect(container.querySelector('.phrase-romaji')).not.toBeInTheDocument();
  });

  it('hides romaji when not provided', () => {
    render(<JapanesePhrase text="日本語" showRomaji={true} />);
    expect(screen.queryByText('nihongo')).not.toBeInTheDocument();
  });

  it('displays translation when enabled and provided', () => {
    render(<JapanesePhrase {...baseProps} showTranslation={true} />);
    expect(screen.getByText('🇬🇧 Japanese language')).toBeInTheDocument();
  });

  it('hides translation when showTranslation is false', () => {
    render(<JapanesePhrase {...baseProps} showTranslation={false} />);
    expect(screen.queryByText(/Japanese language/)).not.toBeInTheDocument();
  });

  it('hides translation when not provided', () => {
    render(<JapanesePhrase text="日本語" showTranslation={true} />);
    expect(screen.queryByText(/🇬🇧/)).not.toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container: small } = render(<JapanesePhrase {...baseProps} size="small" />);
    expect(small.querySelector('.text-sm')).toBeInTheDocument();

    const { container: medium } = render(<JapanesePhrase {...baseProps} size="medium" />);
    expect(medium.querySelector('.text-base')).toBeInTheDocument();

    const { container: large } = render(<JapanesePhrase {...baseProps} size="large" />);
    expect(large.querySelector('.text-xl')).toBeInTheDocument();
  });

  it('uses medium size by default', () => {
    const { container } = render(<JapanesePhrase text="日本語" />);
    expect(container.querySelector('.text-base')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<JapanesePhrase {...baseProps} className="custom-class" />);
    const element = container.querySelector('.japanese-phrase');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('text-base');
  });
});
