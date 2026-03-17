import { describe, it, expect, vi } from 'vitest';

// Mock the quotes module
const mockQuotes = [
  { text: 'Funny quote A', weight: 1.5 },
  { text: 'Funny quote B', weight: 1.5 },
  { text: 'Standard quote A', weight: 1 },
  { text: 'Standard quote B', weight: 1 },
];

// Weighted random selection function (same logic as in Home.tsx)
function getRandomQuote(quotes: typeof mockQuotes): string {
  const totalWeight = quotes.reduce((sum, q) => sum + q.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const quote of quotes) {
    random -= quote.weight;
    if (random <= 0) {
      return quote.text;
    }
  }
  
  return quotes[quotes.length - 1].text;
}

describe('getRandomQuote weighted selection', () => {
  it('should select funny quotes ~50% more often than standard', () => {
    const iterations = 10000;
    const results: Record<string, number> = {};
    
    // Run many times to test distribution
    for (let i = 0; i < iterations; i++) {
      const quote = getRandomQuote(mockQuotes);
      results[quote] = (results[quote] || 0) + 1;
    }
    
    // Calculate percentages
    const funnyCount = (results['Funny quote A'] || 0) + (results['Funny quote B'] || 0);
    const standardCount = (results['Standard quote A'] || 0) + (results['Standard quote B'] || 0);
    
    const funnyPercentage = (funnyCount / iterations) * 100;
    const standardPercentage = (standardCount / iterations) * 100;
    
    // Funny quotes should appear ~60% of the time (3 weight / 5 total = 60%)
    // Standard quotes should appear ~40% of the time (2 weight / 5 total = 40%)
    // Ratio: 60/40 = 1.5 (50% more)
    
    expect(funnyPercentage).toBeGreaterThan(55);  // Allow 5% margin
    expect(funnyPercentage).toBeLessThan(65);
    expect(standardPercentage).toBeGreaterThan(35);
    expect(standardPercentage).toBeLessThan(45);
  });

  it('should always return a valid quote', () => {
    for (let i = 0; i < 100; i++) {
      const quote = getRandomQuote(mockQuotes);
      expect(mockQuotes.map(q => q.text)).toContain(quote);
    }
  });
});
