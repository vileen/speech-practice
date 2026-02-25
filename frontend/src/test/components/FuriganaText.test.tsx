import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FuriganaText } from '../../components/FuriganaText.js';

describe('FuriganaText', () => {
  it('should render plain text when furiganaHtml is not provided', () => {
    render(<FuriganaText text="こんにちは" />);
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
  });

  it('should render plain text when showFurigana is false', () => {
    const furiganaHtml = '<ruby>今日<rt>きょう</rt></ruby>は';
    render(<FuriganaText text="今日は" furiganaHtml={furiganaHtml} showFurigana={false} />);
    expect(screen.getByText('今日は')).toBeInTheDocument();
  });

  it('should render furigana HTML when provided and enabled', () => {
    const furiganaHtml = '<ruby>今日<rt>きょう</rt></ruby>は';
    const { container } = render(<FuriganaText text="今日は" furiganaHtml={furiganaHtml} />);
    
    expect(container.querySelector('ruby')).toBeInTheDocument();
    expect(container.querySelector('rt')).toHaveTextContent('きょう');
  });

  it('should apply custom className', () => {
    const { container } = render(<FuriganaText text="テスト" className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
