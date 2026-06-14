import { useCallback } from 'react';

export function useAnswerChecker() {
  const normalize = useCallback((text: string) => {
    return text
      .trim()
      .replace(/[。．、，！？・…ー〜〃〄々〆〇〈〉《》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟]/g, '')
      .replace(/[.!,?…\-~""''()\[\]{}]/g, '')
      .replace(/\s+/g, '');
  }, []);

  const levenshtein = useCallback((a: string, b: string): number => {
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
  }, []);

  const checkAnswer = useCallback((userAnswer: string, correctAnswer: string) => {
    const normUser = normalize(userAnswer);
    const normCorrect = normalize(correctAnswer);
    const distance = levenshtein(normUser, normCorrect);
    const maxLen = Math.max(normUser.length, normCorrect.length);
    const similarity = maxLen > 0 ? Math.round((1 - distance / maxLen) * 100) : 100;
    const isCorrect = distance <= 2 || similarity >= 90 || normUser === normCorrect;
    return { isCorrect, distance, similarity };
  }, [normalize, levenshtein]);

  return { checkAnswer, normalize, levenshtein };
}
