import { appConfig } from '../config/index.js';

export interface AssessmentResult {
  transcript: string;
  accuracyScore: number;
  feedback: {
    overall: string;
    errors: Array<{
      type: 'substitution' | 'omission' | 'insertion' | 'pronunciation';
      expected: string;
      actual: string;
      position: number;
    }>;
    suggestions: string[];
  };
  expected: string;
  expectedRomaji?: string;
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const apiKey = appConfig.apiKeys.openai;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Create a FormData object (native FormData works in Node 18+)
  const formData = new FormData();
  
  // Convert Buffer to Uint8Array for Blob
  const uint8Array = new Uint8Array(audioBuffer);
  const blob = new Blob([uint8Array], { type: 'audio/webm' });
  formData.append('file', blob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'ja');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${response.status} - ${error}`);
  }

  const result = await response.json() as { text: string };
  return result.text.trim();
}

/**
 * Compare pronunciation between actual and expected Japanese text
 */
export function comparePronunciation(
  actual: string,
  expected: string,
  expectedRomaji?: string
): AssessmentResult {
  // Normalize both strings for comparison
  const normalizedActual = normalizeJapanese(actual);
  const normalizedExpected = normalizeJapanese(expected);

  // Calculate similarity score
  const similarity = calculateSimilarity(normalizedActual, normalizedExpected);
  const accuracyScore = Math.round(similarity * 100);

  // Find differences
  const errors = findDifferences(normalizedActual, normalizedExpected);

  // Generate feedback
  const feedback = generateFeedback(accuracyScore, errors, normalizedActual, normalizedExpected);

  return {
    transcript: actual,
    accuracyScore,
    feedback,
    expected,
    expectedRomaji,
  };
}

/**
 * Normalize Japanese text for comparison
 * - Converts to lowercase
 * - Removes extra whitespace
 * - Handles common variations
 */
function normalizeJapanese(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    // Normalize punctuation
    .replace(/[。．]/g, '')
    .replace(/[、，]/g, ' ')
    // Handle common kana variations
    .replace(/ぢ/g, 'じ')
    .replace(/づ/g, 'ず');
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Find differences between actual and expected text
 */
function findDifferences(
  actual: string,
  expected: string
): Array<{
  type: 'substitution' | 'omission' | 'insertion' | 'pronunciation';
  expected: string;
  actual: string;
  position: number;
}> {
  const errors: Array<{
    type: 'substitution' | 'omission' | 'insertion' | 'pronunciation';
    expected: string;
    actual: string;
    position: number;
  }> = [];

  // Simple word-level comparison
  const actualWords = actual.split(/\s+/);
  const expectedWords = expected.split(/\s+/);

  let i = 0, j = 0;
  let position = 0;

  while (i < actualWords.length || j < expectedWords.length) {
    const actualWord = actualWords[i];
    const expectedWord = expectedWords[j];

    if (actualWord === expectedWord) {
      i++;
      j++;
      position++;
      continue;
    }

    if (!actualWord) {
      // Missing word (omission)
      errors.push({
        type: 'omission',
        expected: expectedWord,
        actual: '',
        position,
      });
      j++;
      position++;
    } else if (!expectedWord) {
      // Extra word (insertion)
      errors.push({
        type: 'insertion',
        expected: '',
        actual: actualWord,
        position,
      });
      i++;
    } else {
      // Different words - check if it's a substitution or misalignment
      const nextExpectedMatch = actualWords.slice(i + 1).indexOf(expectedWord);
      const nextActualMatch = expectedWords.slice(j + 1).indexOf(actualWord);

      if (nextExpectedMatch !== -1 && (nextActualMatch === -1 || nextExpectedMatch < nextActualMatch)) {
        // Extra words in actual
        errors.push({
          type: 'insertion',
          expected: '',
          actual: actualWord,
          position,
        });
        i++;
      } else if (nextActualMatch !== -1) {
        // Missing words in actual
        errors.push({
          type: 'omission',
          expected: expectedWord,
          actual: '',
          position,
        });
        j++;
        position++;
      } else {
        // Substitution
        errors.push({
          type: 'substitution',
          expected: expectedWord,
          actual: actualWord,
          position,
        });
        i++;
        j++;
        position++;
      }
    }
  }

  return errors;
}

/**
 * Generate human-readable feedback based on score and errors
 */
function generateFeedback(
  score: number,
  errors: AssessmentResult['feedback']['errors'],
  actual: string,
  expected: string
): AssessmentResult['feedback'] {
  let overall: string;
  const suggestions: string[] = [];

  if (score >= 90) {
    overall = 'Excellent pronunciation! Very close to native.';
  } else if (score >= 80) {
    overall = 'Great job! Your pronunciation is very good.';
  } else if (score >= 60) {
    overall = 'Good attempt! There are some areas to improve.';
  } else if (score >= 40) {
    overall = 'Keep practicing! Focus on the highlighted differences.';
  } else {
    overall = 'Try again! Listen to the native audio and practice slowly.';
  }

  // Add specific suggestions based on error types
  const hasOmissions = errors.some(e => e.type === 'omission');
  const hasInsertions = errors.some(e => e.type === 'insertion');
  const hasSubstitutions = errors.some(e => e.type === 'substitution');

  if (hasOmissions) {
    suggestions.push('Pay attention to words you may have skipped.');
  }
  if (hasInsertions) {
    suggestions.push('Try to match the exact phrase without adding extra words.');
  }
  if (hasSubstitutions) {
    suggestions.push('Listen carefully to the pronunciation of each word.');
  }
  if (score < 60) {
    suggestions.push('Try breaking the phrase into smaller parts and practice each one.');
  }

  return {
    overall,
    errors,
    suggestions,
  };
}
