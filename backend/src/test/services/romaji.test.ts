import { describe, it, expect } from 'vitest';
import { generateRomaji, generateFuriganaFromReading } from '../../services/romaji.js';

describe('romaji service', () => {
  it('should convert hiragana to romaji', async () => {
    const result = await generateRomaji('こんにちは');
    expect(result).toBe('konnichiha');
  });
  
  it('should generate furigana from reading', () => {
    const result = generateFuriganaFromReading('日本', 'にほん');
    expect(result).toContain('<ruby>');
    expect(result).toContain('日<rt>に</rt>');
  });
});
