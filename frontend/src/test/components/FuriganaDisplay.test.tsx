import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FuriganaDisplay } from '../../components/ReadingMode/FuriganaDisplay';

// Mock the useFurigana hook
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: vi.fn(),
}));

import { useFurigana } from '../../hooks/useFurigana';

const mockedUseFurigana = vi.mocked(useFurigana);

describe('FuriganaDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plain text when showFurigana is false', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<FuriganaDisplay text="日本語" showFurigana={false} />);
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('renders plain text when furigana is null', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<FuriganaDisplay text="日本語" showFurigana={true} />);
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('renders plain text when furigana is empty string', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: '',
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<FuriganaDisplay text="日本語" showFurigana={true} />);
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('renders furigana HTML when available', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: '<ruby>日本<rt>にほん</rt></ruby>語',
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { container } = render(<FuriganaDisplay text="日本語" showFurigana={true} />);
    const ruby = container.querySelector('ruby');
    expect(ruby).toBeInTheDocument();
    expect(container.querySelector('rt')).toHaveTextContent('にほん');
  });

  it('applies custom className to plain text', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { container } = render(
      <FuriganaDisplay text="hello" showFurigana={false} className="my-class" />
    );
    expect(container.querySelector('span.my-class')).toBeInTheDocument();
  });

  it('applies custom className to furigana text', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: '<ruby>日本<rt>にほん</rt></ruby>語',
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { container } = render(
      <FuriganaDisplay text="日本語" showFurigana={true} className="custom-class" />
    );
    expect(container.querySelector('span.furigana-text.custom-class')).toBeInTheDocument();
  });

  it('renders English text without furigana', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<FuriganaDisplay text="Hello world" showFurigana={false} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('handles empty text', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { container } = render(<FuriganaDisplay text="" showFurigana={true} />);
    expect(container.querySelector('span')?.textContent).toBe('');
  });

  it('calls useFurigana with correct arguments', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<FuriganaDisplay text="テスト" showFurigana={true} />);
    expect(mockedUseFurigana).toHaveBeenCalledWith('テスト', true);
  });

  it('calls useFurigana with enabled=false when showFurigana is false', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<FuriganaDisplay text="テスト" showFurigana={false} />);
    expect(mockedUseFurigana).toHaveBeenCalledWith('テスト', false);
  });

  it('handles complex furigana HTML', () => {
    mockedUseFurigana.mockReturnValue({
      furigana: '<ruby>日本<rt>にほん</rt></ruby><ruby>語<rt>ご</rt></ruby>',
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { container } = render(<FuriganaDisplay text="日本語" showFurigana={true} />);
    const rubies = container.querySelectorAll('ruby');
    expect(rubies.length).toBe(2);
  });
});
