import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseDisplay } from '../../components/GrammarMode/ExerciseDisplay';

// Mock the useFurigana hook
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: vi.fn((text: string, enabled: boolean) => ({
    furigana: enabled ? `<ruby>${text}<rt>reading</rt></ruby>` : null,
    loading: false,
    error: null,
  })),
}));

describe('ExerciseDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render plain text when furigana is disabled', () => {
    render(<ExerciseDisplay text="食べる" showFurigana={false} />);
    
    expect(screen.getByText('食べる')).toBeInTheDocument();
  });

  it('should render furigana HTML when enabled', () => {
    render(<ExerciseDisplay text="食べる" showFurigana={true} />);
    
    const element = screen.getByText('食べる');
    expect(element).toBeInTheDocument();
    expect(element.closest('span')?.innerHTML).toContain('ruby');
  });

  it('should apply custom className', () => {
    render(<ExerciseDisplay text="test" showFurigana={false} className="custom-class" />);
    
    const spans = screen.getAllByText('test');
    expect(spans[0].closest('span')).toHaveClass('custom-class');
  });

  it('should handle empty text', () => {
    render(<ExerciseDisplay text="" showFurigana={false} />);
    
    const span = document.querySelector('span');
    expect(span).toBeInTheDocument();
  });

  it('should handle long text', () => {
    const longText = 'これは非常に長い日本語のテキストです';
    render(<ExerciseDisplay text={longText} showFurigana={false} />);
    
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('should toggle between furigana and plain text', () => {
    const { rerender } = render(<ExerciseDisplay text="漢字" showFurigana={false} />);
    
    expect(screen.getByText('漢字')).toBeInTheDocument();
    
    rerender(<ExerciseDisplay text="漢字" showFurigana={true} />);
    
    const element = screen.getByText('漢字');
    expect(element.closest('span')?.innerHTML).toContain('ruby');
  });
});
