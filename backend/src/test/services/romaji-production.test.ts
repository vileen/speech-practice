import { describe, it, expect } from 'vitest';
import { generateRomaji } from '../../services/romaji.js';

describe('romaji production cases', () => {
  it('should not split words - konban anata example', async () => {
    // Real production example that was failing
    const text = '今晩、あなたは何をしなければなりませんか？例えば、掃除や洗濯など、特別なことがありますか？';
    const textWithFurigana = '<ruby>今晩<rt>こんばん</rt></ruby>、あなたは<ruby>何<rt>なに</rt></ruby>をしなければなりませんか？<ruby>例えば<rt>たとえば</rt></ruby>、<ruby>掃除<rt>そうじ</rt></ruby>や<ruby>洗濯<rt>せんたく</rt></ruby>など、<ruby>特別<rt>とくべつ</rt></ruby>なことがありますか？';
    
    const result = await generateRomaji(text, textWithFurigana);
    
    console.log('Result:', result);
    
    // Should NOT have: "hana ni wo shi na ke re ba na ri ma sen"
    // Should have: "konban anata wa nani wo shinakereba narimasen ka"
    
    expect(result).not.toMatch(/na ni wo/);  // "何を" should be "nani wo" not "na ni wo"
    expect(result).not.toMatch(/shi na ke re ba/); // "しなければ" should be together
    expect(result).toContain('nani');  // "何" -> "nani" (full word)
    expect(result).toContain('konban'); // "今晩" -> "konban" (full word)
  });

  it('should not split words - mainichi jiyo soji example', async () => {
    // Another production example with wrong spacing
    const text = '毎日、自宅の掃除や洗濯をしなければなりませんか？それとも、しなくてもいいですか？';
    
    const result = await generateRomaji(text);
    
    console.log('Result:', result);
    
    // Should NOT have: "mainichi ji yo sou ji sou ji wo shi na ke re ba"
    // Should have: "mainichi jitaku no souji ya sentaku wo shinakereba narimasen ka"
    
    expect(result).not.toMatch(/ji yo/);  // "自宅" should not be split as "ji yo"
    expect(result).not.toMatch(/sou ji/); // "掃除" should be "souji" not "sou ji"
    expect(result).toContain('mainichi'); // "毎日" together
    expect(result).toContain('jitaku');   // "自宅" together
  });

  it('should handle full conversation flow', async () => {
    // Simulate actual API response structure
    const apiResponse = {
      text: '今晩、あなたは何をしなければなりませんか？例えば、掃除や洗濯など、特別なことがありますか？',
      textWithFurigana: '<ruby>今晩<rt>こんばん</rt></ruby>、あなたは<ruby>何<rt>なに</rt></ruby>をしなければなりませんか？<ruby>例えば<rt>たとえば</rt></ruby>、<ruby>掃除<rt>そうじ</rt></ruby>や<ruby>洗濯<rt>せんたく</rt></ruby>など、<ruby>特別<rt>とくべつ</rt></ruby>なことがありますか？'
    };
    
    const result = await generateRomaji(apiResponse.text, apiResponse.textWithFurigana);
    
    // Verify no single-char words (except particles)
    const words = result.split(' ').filter(w => w.length > 0);
    const suspiciousWords = words.filter(w => w.length === 1 && !['wa', 'wo', 'ga', 'ni', 'de', 'to', 'no', 'mo', 'ka', 'ya'].includes(w));
    
    console.log('Words:', words);
    console.log('Suspicious single-char words:', suspiciousWords);
    
    // Should have very few single-char words
    expect(suspiciousWords.length).toBeLessThan(3);
  });
});