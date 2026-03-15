import { describe, it, expect } from 'vitest';
import { generateRomaji } from '../../services/romaji.js';

describe('romaji edge cases', () => {
  it('should not split words with spaces between every character', async () => {
    // This is the user-reported failing case
    // Input has kanji that gets converted to hiragana via furigana
    const input = '今あなたは花粉をしなければなりませんか例えば掃除や洗濯など';
    const result = await generateRomaji(input);
    
    // Should NOT have spaces between every character
    // Expected: "ima anata wa kafun wo shinakereba narimasen ka tatoeba souji ya sentaku nado"
    // Not: "ima anata hana ni wo shi na ke re ba na ri ma sen..."
    
    // Check that we don't have single-char words separated by spaces (except particles)
    const words = result.split(' ').filter(w => w.length > 0);
    const singleCharWords = words.filter(w => w.length === 1);
    
    // Should have very few single-char words (only particles like "wa", "wo")
    console.log('Result:', result);
    console.log('Single char words:', singleCharWords);
    
    // The result should contain multi-character words
    expect(result).toContain('anata'); // あなた -> anata (not "a na ta")
    expect(result).not.toMatch(/a na ta/); // Should NOT be split
  });

  it('should handle simple sentence correctly', async () => {
    const input = 'あなたは学生です';
    const result = await generateRomaji(input);
    
    console.log('Simple result:', result);
    
    // Should be: "anata wa gakusei desu"
    // Not: "a na ta wa ga ku se i de su"
    expect(result).toContain('anata');
    expect(result).toContain('gakusei');
  });
});