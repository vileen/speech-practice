import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JapanesePhrase } from '../../components/JapanesePhrase/JapanesePhrase';

describe('JapanesePhrase', () => {
  const defaultProps = {
    text: '日本語',
    furiganaHtml: '<ruby>日本<rt>にほん</rt></ruby>語',
    romaji: 'nihongo',
    translation: 'Japanese language',
  };

  describe('rendering Japanese text', () => {
    it('should render the Japanese text', () => {
      render(<JapanesePhrase {...defaultProps} />);
      // Text may be split by furigana ruby tags, use matcher function
      expect(screen.getByText((content) => content.includes('日本'))).toBeInTheDocument();
    });

    it('should render with furigana when showFurigana is true', () => {
      render(<JapanesePhrase {...defaultProps} showFurigana={true} />);
      // Furigana renders with ruby tags, check for partial text match
      expect(screen.getByText((content) => content.includes('日本'))).toBeInTheDocument();
    });

    it('should render without furigana when showFurigana is false', () => {
      render(<JapanesePhrase {...defaultProps} showFurigana={false} />);
      // Without furigana, text is rendered as plain text
      expect(screen.getByText('日本語')).toBeInTheDocument();
    });

    it('should render plain text when furiganaHtml is not provided', () => {
      render(<JapanesePhrase text="こんにちは" />);
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
    });
  });

  describe('romaji display', () => {
    it('should display romaji when showRomaji is true and romaji is provided', () => {
      render(<JapanesePhrase {...defaultProps} showRomaji={true} />);
      expect(screen.getByText('nihongo')).toBeInTheDocument();
    });

    it('should not display romaji when showRomaji is false', () => {
      render(<JapanesePhrase {...defaultProps} showRomaji={false} />);
      expect(screen.queryByText('nihongo')).not.toBeInTheDocument();
    });

    it('should not display romaji section when romaji is not provided', () => {
      render(<JapanesePhrase text="日本語" showRomaji={true} />);
      expect(screen.queryByText('nihongo')).not.toBeInTheDocument();
    });

    it('should not display romaji section when romaji is empty string', () => {
      render(<JapanesePhrase {...defaultProps} romaji="" showRomaji={true} />);
      expect(screen.queryByText('nihongo')).not.toBeInTheDocument();
    });
  });

  describe('translation display', () => {
    it('should display translation when showTranslation is true and translation is provided', () => {
      render(<JapanesePhrase {...defaultProps} showTranslation={true} />);
      expect(screen.getByText('🇬🇧 Japanese language')).toBeInTheDocument();
    });

    it('should not display translation when showTranslation is false', () => {
      render(<JapanesePhrase {...defaultProps} showTranslation={false} />);
      expect(screen.queryByText(/Japanese language/)).not.toBeInTheDocument();
    });

    it('should not display translation section when translation is not provided', () => {
      render(<JapanesePhrase text="日本語" showTranslation={true} />);
      expect(screen.queryByText(/🇬🇧/)).not.toBeInTheDocument();
    });

    it('should not display translation section when translation is empty string', () => {
      render(<JapanesePhrase {...defaultProps} translation="" showTranslation={true} />);
      expect(screen.queryByText(/🇬🇧/)).not.toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should apply small size class', () => {
      const { container } = render(
        <JapanesePhrase {...defaultProps} size="small" />
      );
      expect(container.querySelector('.text-sm')).toBeInTheDocument();
    });

    it('should apply medium size class by default', () => {
      const { container } = render(<JapanesePhrase {...defaultProps} />);
      expect(container.querySelector('.text-base')).toBeInTheDocument();
    });

    it('should apply large size class', () => {
      const { container } = render(
        <JapanesePhrase {...defaultProps} size="large" />
      );
      expect(container.querySelector('.text-xl')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <JapanesePhrase {...defaultProps} className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(
        <JapanesePhrase {...defaultProps} className="custom-class" size="large" />
      );
      const element = container.querySelector('.japanese-phrase');
      expect(element).toHaveClass('custom-class');
      expect(element).toHaveClass('text-xl');
    });
  });

  describe('default prop values', () => {
    it('should show furigana by default', () => {
      render(<JapanesePhrase text="日本語" furiganaHtml="<ruby>日本<rt>にほん</rt></ruby>語" />);
      // Component should render without errors with default showFurigana=true
      // Text is split by ruby tags, check for partial match
      expect(screen.getByText((content) => content.includes('日本'))).toBeInTheDocument();
    });

    it('should show romaji by default', () => {
      render(<JapanesePhrase text="日本語" romaji="nihongo" />);
      expect(screen.getByText('nihongo')).toBeInTheDocument();
    });

    it('should not show translation by default', () => {
      render(<JapanesePhrase {...defaultProps} />);
      expect(screen.queryByText(/🇬🇧/)).not.toBeInTheDocument();
    });

    it('should use medium size by default', () => {
      const { container } = render(<JapanesePhrase text="日本語" />);
      expect(container.querySelector('.text-base')).toBeInTheDocument();
    });
  });

  describe('complex phrases', () => {
    it('should handle phrases with mixed kanji and kana', () => {
      render(
        <JapanesePhrase
          text="美味しい"
          furiganaHtml="<ruby>美味<rt>おい</rt></ruby>しい"
          romaji="oishii"
          translation="delicious"
        />
      );
      // Text is split by ruby tags, check for partial match
      expect(screen.getByText((content) => content.includes('美味'))).toBeInTheDocument();
      expect(screen.getByText('oishii')).toBeInTheDocument();
    });

    it('should handle long phrases', () => {
      render(
        <JapanesePhrase
          text="日本語を勉強しています"
          furiganaHtml="日本語を勉強しています"
          romaji="nihongo wo benkyou shiteimasu"
          translation="I am studying Japanese"
          showTranslation={true}
        />
      );
      expect(screen.getByText('日本語を勉強しています')).toBeInTheDocument();
      expect(screen.getByText('nihongo wo benkyou shiteimasu')).toBeInTheDocument();
      expect(screen.getByText(/I am studying Japanese/)).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should have the correct DOM structure', () => {
      const { container } = render(<JapanesePhrase {...defaultProps} />);
      
      // Main container
      const mainDiv = container.querySelector('.japanese-phrase');
      expect(mainDiv).toBeInTheDocument();
      
      // Japanese text container
      const jpDiv = container.querySelector('.phrase-jp');
      expect(jpDiv).toBeInTheDocument();
      
      // Romaji container
      const romajiDiv = container.querySelector('.phrase-romaji');
      expect(romajiDiv).toBeInTheDocument();
    });

    it('should not render romaji container when romaji is hidden', () => {
      const { container } = render(
        <JapanesePhrase {...defaultProps} showRomaji={false} />
      );
      expect(container.querySelector('.phrase-romaji')).not.toBeInTheDocument();
    });

    it('should render translation with correct class', () => {
      const { container } = render(
        <JapanesePhrase {...defaultProps} showTranslation={true} />
      );
      expect(container.querySelector('.translation-display')).toBeInTheDocument();
    });
  });
});
