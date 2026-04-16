export interface VerificationResult {
  isCorrect: boolean;
  similarity: number;
  issues: string[];
}

// Helper: Check if char is kanji
const isKanji = (char: string) => /[\u4e00-\u9faf]/.test(char);

// Step 1: Normalize (remove punctuation, whitespace)
const normalize = (text: string) => text
  .trim()
  .replace(/[。．、，！？・…ー〜〃〄々〆〇〈〉《》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟]/g, '')
  .replace(/[.!,?…\-~""''()[\]{}]/g, '')
  .replace(/\s+/g, '');

const levenshtein = (a: string, b: string): number => {
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

/**
 * Smart answer verification with Levenshtein distance and kanji strict + kana lenient
 */
export function verifyAnswer(user: string, correct: string): VerificationResult {
  const issues: string[] = [];

  const normUser = normalize(user);
  const normCorrect = normalize(correct);

  // Step 2: Exact match after normalization = correct
  if (normUser === normCorrect) {
    return { isCorrect: true, similarity: 100, issues: [] };
  }

  // Step 3: Kanji strict check - kanji must match exactly
  const userKanji = [...normUser].filter(isKanji).join('');
  const correctKanji = [...normCorrect].filter(isKanji).join('');

  if (userKanji !== correctKanji) {
    issues.push('Kanji mismatch');
    // Kanji are crucial - if different, it's wrong
    return { isCorrect: false, similarity: 50, issues };
  }

  // Step 4: Levenshtein distance for kana parts
  const distance = levenshtein(normUser, normCorrect);
  const maxLen = Math.max(normUser.length, normCorrect.length);
  const similarity = maxLen === 0 ? 100 : Math.round((1 - distance / maxLen) * 100);

  // Step 5: Kana lenient - allow small differences (は↔が, です↔だ, etc.)
  // Accept if: distance ≤ 3 OR similarity ≥ 85%
  const isCloseEnough = distance <= 3 || similarity >= 85;

  if (!isCloseEnough) {
    issues.push(`Too many differences (${distance} chars)`);
  }

  return {
    isCorrect: isCloseEnough,
    similarity,
    issues: isCloseEnough ? [] : issues
  };
}
