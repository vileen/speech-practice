import { describe, it, expect } from 'vitest';
import { stripFurigana, toHiraganaForTTS } from '../../utils/text.js';

describe('Text Utilities', () => {
  describe('stripFurigana', () => {
    it('should remove ruby tags with furigana', () => {
      const input = '<ruby>日本<rt>にほん</rt></ruby>';
      const result = stripFurigana(input);
      expect(result).toBe('日本');
    });

    it('should handle multiple ruby tags', () => {
      const input = '<ruby>日本<rt>にほん</rt></ruby>の<ruby>語<rt>ご</rt></ruby>';
      const result = stripFurigana(input);
      expect(result).toBe('日本の語');
    });

    it('should handle text without ruby tags', () => {
      const input = 'Plain text without furigana';
      const result = stripFurigana(input);
      expect(result).toBe('Plain text without furigana');
    });

    it('should handle mixed content with and without ruby tags', () => {
      const input = 'Hello <ruby>世界<rt>せかい</rt></ruby> end';
      const result = stripFurigana(input);
      expect(result).toBe('Hello 世界 end');
    });

    it('should handle empty string', () => {
      const result = stripFurigana('');
      expect(result).toBe('');
    });

    it('should handle complex nested HTML', () => {
      const input = '<div><ruby>漢字<rt>かんじ</rt></ruby></div>';
      const result = stripFurigana(input);
      expect(result).toBe('漢字');
    });

    it('should remove other HTML tags', () => {
      const input = '<p>Hello</p><ruby>世界<rt>せかい</rt></ruby>';
      const result = stripFurigana(input);
      expect(result).toBe('Hello世界');
    });
  });

  describe('toHiraganaForTTS', () => {
    it('should convert katakana to hiragana', () => {
      const input = 'アイウエオ';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('あいうえお');
    });

    it('should convert mixed katakana and hiragana', () => {
      const input = 'カキクけこ';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('かきくけこ');
    });

    it('should leave hiragana unchanged', () => {
      const input = 'さしすせそ';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('さしすせそ');
    });

    it('should leave non-Japanese characters unchanged', () => {
      const input = 'Hello123!?';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('Hello123!?');
    });

    it('should convert voiced katakana to hiragana', () => {
      const input = 'ガギグゲゴ';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('がぎぐげご');
    });

    it('should convert semi-voiced katakana to hiragana', () => {
      const input = 'パピプペポ';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('ぱぴぷぺぽ');
    });

    it('should convert small katakana to hiragana', () => {
      const input = 'ャュョッ';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('ゃゅょっ');
    });

    it('should handle complete katakana chart', () => {
      const input = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん');
    });

    it('should handle empty string', () => {
      const result = toHiraganaForTTS('');
      expect(result).toBe('');
    });

    it('should handle complex mixed text', () => {
      const input = 'コンピューターとパソコン';
      const result = toHiraganaForTTS(input);
      expect(result).toBe('こんぴゅーたーとぱそこん');
    });
  });
});
