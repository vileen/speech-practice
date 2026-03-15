import { describe, it, expect } from 'vitest';
import { generateRomaji, generateFuriganaFromReading } from '../../services/romaji.js';

describe('romaji service', () => {
  it('should convert simple hiragana to romaji', async () => {
    const result = await generateRomaji('こんにちは');
    expect(result).toContain('konnichi');
  });

  it('should convert hiragana with proper word spacing', async () => {
    const result = await generateRomaji('こんにちは');
    // Kuromoji tokenizes as: こんにち + は
    expect(result).toMatch(/konnichi.*wa/);
  });

  it('should generate furigana from reading', () => {
    const result = generateFuriganaFromReading('漢字', 'かんじ');
    expect(result).toBe('<ruby>漢字<rt>かんじ</rt></ruby>');
  });

  it('should handle simple kanji with okurigana', () => {
    const result = generateFuriganaFromReading('食べる', 'た');
    expect(result).toBe('<ruby>食<rt>た</rt></ruby>べる');
  });
});

describe('romaji edge cases', () => {
  it('should not split words with spaces between every character', async () => {
    // This is the user-reported failing case
    const input = '今あなたは花粉をしなければなりませんか例えば掃除や洗濯など';
    const result = await generateRomaji(input);
    
    console.log('Result:', result);
    
    // Should NOT have: "hana ni wo shi na ke re ba na ri ma sen"
    // Should have: "konban anata wa kafun wo shinakereba narimasen ka"
    
    // Check that we don't have single-char words separated by spaces (except particles)
    const words = result.split(' ').filter(w => w.length > 0);
    const singleCharWords = words.filter(w => w.length === 1);
    
    console.log('Single char words:', singleCharWords);
    
    // The result should contain multi-character words
    expect(result).toContain('anata'); // あなた -> anata (not "a na ta")
  });

  it('should handle simple sentence correctly', async () => {
    const input = 'あなたは学生です';
    const result = await generateRomaji(input);
    
    console.log('Simple result:', result);
    
    // Should be: "anata wa gakusei desu"
    expect(result).toContain('anata');
    expect(result).toContain('gakusei');
  });

  it('should handle nani (何) correctly', async () => {
    const input = '何をしますか';
    const result = await generateRomaji(input);
    
    console.log('Nani result:', result);
    
    // Should be "nani wo shimasu ka" not "na ni wo shi ma su ka"
    expect(result).toContain('nani');
    expect(result).not.toMatch(/na ni/);
  });
});

describe('romaji production cases', () => {
  it('should not split words - konban anata example', async () => {
    // Real production example that was failing
    const input = '今晩、あなたは何をしなければなりませんか？例えば、掃除や洗濯など、特別なことがありますか？';
    
    const result = await generateRomaji(input);
    
    console.log('Result:', result);
    
    // Should NOT have: "hana ni wo shi na ke re ba na ri ma sen"
    // Should have: "konban anata wa nani wo shinakereba narimasen ka"
    
    expect(result).not.toMatch(/na ni wo/);  // "何を" should be "nani wo" not "na ni wo"
    expect(result).toContain('nani');  // "何" -> "nani" (full word)
    expect(result).toContain('konban'); // "今晩" -> "konban" (full word)
  });

  it('should not split words - mainichi jiyo soji example', async () => {
    // Another production example with wrong spacing
    const input = '毎日、自宅の掃除や洗濯をしなければなりませんか？それとも、しなくてもいいですか？';
    
    const result = await generateRomaji(input);
    
    console.log('Result:', result);
    
    // Should NOT have: "mainichi ji yo sou ji sou ji wo shi na ke re ba"
    // Should have: "mainichi jitaku no souji ya sentaku wo shinakereba narimasen ka"
    
    expect(result).not.toMatch(/ji yo/);  // "自宅" should not be split as "ji yo"
    expect(result).toContain('mainichi'); // "毎日" together
    expect(result).toContain('jitaku');   // "自宅" together
  });

  it('should handle ima anata example correctly', async () => {
    // The user's specific example
    const input = '今日は何をしなければなりませんか？それとも、何をしなくてもいいですか？例えば、洗濯や掃除について教えてください。';
    
    const result = await generateRomaji(input);
    
    console.log('Result:', result);
    
    // Should have proper spacing: "ima anata wa" not "imaanata wa"
    expect(result).toMatch(/kyou.*wa/);
    expect(result).toContain('nani');
    // Check that words are not concatenated
    expect(result).not.toMatch(/anatawa/); // should be "anata wa"
    expect(result).not.toMatch(/kyouwa/);  // should be "kyou wa"
  });
});