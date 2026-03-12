import { describe, it, expect } from 'vitest';
import { generateRomaji, generateFuriganaFromReading } from '../../services/romaji.js';

describe('romaji service', () => {
  it('should convert hiragana to romaji with particle spacing', async () => {
    const result = await generateRomaji('こんにちは');
    // generateRomaji adds spaces around particles
    expect(result).toBe('kon ni chi wa');
  });
  
  it('should generate furigana from reading', () => {
    const result = generateFuriganaFromReading('日本', 'にほん');
    expect(result).toContain('<ruby>');
    expect(result).toContain('<rt>にほん</rt>');
    expect(result).toBe('<ruby>日本<rt>にほん</rt></ruby>');
  });
  
  it('should handle simple kanji with okurigana', () => {
    const result = generateFuriganaFromReading('食べる', 'た');
    expect(result).toBe('<ruby>食<rt>た</rt></ruby>べる');
  });
});
