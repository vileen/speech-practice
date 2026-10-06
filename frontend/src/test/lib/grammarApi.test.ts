import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPatterns,
  fetchDuePatterns,
  fetchCounterVariants,
  fetchMixedReviewPatterns,
  fetchPatternExercise,
  fetchExerciseById,
  fetchDiscriminationExercise,
  fetchRelatedPatterns,
  fetchConfusionCounts,
  postConfusion,
  postProgress,
  checkConfusion,
} from '../../lib/grammarApi.js';
import { API_URL } from '../../config/api.js';
import type { GrammarPattern } from '../../components/GrammarMode/types.js';

const PASSWORD = 'test-password';

function makePattern(overrides: Partial<GrammarPattern> = {}): GrammarPattern {
  return {
    id: 1,
    pattern: '〜たことがある',
    category: 'Experience',
    jlpt_level: 'N4',
    formation_rules: [],
    examples: [],
    common_mistakes: [],
    ...overrides,
  };
}

function mockOkResponse(body: unknown): Response {
  return { ok: true, json: async () => body } as Response;
}

function mockNotOkResponse(): Response {
  return { ok: false, json: async () => ({}) } as Response;
}

describe('grammarApi', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchPatterns', () => {
    it('fetches patterns and filters out Counters category', async () => {
      const keep = makePattern({ id: 1, category: 'Experience' });
      const drop = makePattern({ id: 2, category: 'Counters' });
      fetchMock.mockResolvedValue(mockOkResponse({ patterns: [keep, drop] }));

      const result = await fetchPatterns(PASSWORD);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/patterns`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual([keep]);
    });

    it('returns empty array on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchPatterns(PASSWORD)).toEqual([]);
    });

    it('handles missing patterns field', async () => {
      fetchMock.mockResolvedValue(mockOkResponse({}));
      expect(await fetchPatterns(PASSWORD)).toEqual([]);
    });
  });

  describe('fetchDuePatterns', () => {
    it('returns patterns and count', async () => {
      const patterns = [makePattern({ id: 5 })];
      fetchMock.mockResolvedValue(mockOkResponse({ patterns, count: 3 }));

      const result = await fetchDuePatterns(PASSWORD);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/review`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual({ patterns, count: 3 });
    });

    it('returns empty fallback on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchDuePatterns(PASSWORD)).toEqual({ patterns: [], count: 0 });
    });
  });

  describe('fetchCounterVariants', () => {
    it('returns variants on success', async () => {
      const variants = [makePattern({ id: 10 })];
      fetchMock.mockResolvedValue(mockOkResponse({ variants }));

      const result = await fetchCounterVariants(PASSWORD, '一人');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/counters/${encodeURIComponent('一人')}/variants`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual(variants);
    });

    it('returns empty array on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchCounterVariants(PASSWORD, '本')).toEqual([]);
    });

    it('returns empty array and logs on network error', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockRejectedValue(new Error('network down'));

      const result = await fetchCounterVariants(PASSWORD, '本');

      expect(result).toEqual([]);
      expect(errorSpy).toHaveBeenCalledWith('Failed to load counter variants:', expect.any(Error));
      errorSpy.mockRestore();
    });
  });

  describe('fetchMixedReviewPatterns', () => {
    it('joins categories into the query string', async () => {
      const patterns = [makePattern({ id: 7 })];
      fetchMock.mockResolvedValue(mockOkResponse({ patterns }));

      const result = await fetchMixedReviewPatterns(PASSWORD, ['Experience', 'Comparison']);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/mixed-review?categories=Experience,Comparison&limit=10`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual(patterns);
    });

    it('returns empty array on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchMixedReviewPatterns(PASSWORD, ['Experience'])).toEqual([]);
    });
  });

  describe('fetchPatternExercise', () => {
    it('returns the exercise from the response', async () => {
      const exercise = { id: 42, prompt: 'Construct a sentence' };
      fetchMock.mockResolvedValue(mockOkResponse({ exercise }));

      const result = await fetchPatternExercise(PASSWORD, 1);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/patterns/1/exercise`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual(exercise);
    });

    it('returns null on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchPatternExercise(PASSWORD, 1)).toBeNull();
    });
  });

  describe('fetchExerciseById', () => {
    it('returns the exercise with pattern_id', async () => {
      const exercise = { id: 9, prompt: 'p', pattern_id: 3 };
      fetchMock.mockResolvedValue(mockOkResponse({ exercise }));

      const result = await fetchExerciseById(PASSWORD, 9);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/exercises/9`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual(exercise);
    });

    it('returns null on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchExerciseById(PASSWORD, 9)).toBeNull();
    });
  });

  describe('fetchDiscriminationExercise', () => {
    it('returns the exercise from the response', async () => {
      const exercise = { id: 15, type: 'discrimination' };
      fetchMock.mockResolvedValue(mockOkResponse({ exercise }));

      const result = await fetchDiscriminationExercise(PASSWORD, 2);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/patterns/2/discrimination`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual(exercise);
    });

    it('returns null on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchDiscriminationExercise(PASSWORD, 2)).toBeNull();
    });
  });

  describe('fetchRelatedPatterns', () => {
    it('returns related patterns', async () => {
      const patterns = [makePattern({ id: 3 })];
      fetchMock.mockResolvedValue(mockOkResponse({ patterns }));

      const result = await fetchRelatedPatterns(PASSWORD, 1);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/patterns/1/related`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual(patterns);
    });

    it('returns empty array on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchRelatedPatterns(PASSWORD, 1)).toEqual([]);
    });
  });

  describe('fetchConfusionCounts', () => {
    it('maps confusion stats onto pattern ids, summing duplicates', async () => {
      const patterns = [
        makePattern({ id: 1, pattern: '〜たがる' }),
        makePattern({ id: 2, pattern: '〜てほしい' }),
      ];
      fetchMock.mockResolvedValue(
        mockOkResponse({
          topConfusions: [
            { pattern_name: '〜たがる', count: '2' },
            { pattern_name: '〜たがる', count: '3' },
            { pattern_name: '〜てほしい', count: '7' },
            { pattern_name: 'unknown-pattern', count: '9' },
          ],
        })
      );

      const result = await fetchConfusionCounts(PASSWORD, patterns);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/confusion-stats`,
        expect.objectContaining({ headers: { 'X-Password': PASSWORD } })
      );
      expect(result).toEqual([
        { patternId: 1, count: 5 },
        { patternId: 2, count: 7 },
      ]);
    });

    it('returns empty array on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await fetchConfusionCounts(PASSWORD, [])).toEqual([]);
    });
  });

  describe('postConfusion', () => {
    it('POSTs the payload with auth and content-type headers', async () => {
      const payload = {
        patternId: 1,
        confusedWithPatternId: 2,
        userSentence: 'test sentence',
      };
      fetchMock.mockResolvedValue(mockOkResponse({}));

      await postConfusion(PASSWORD, payload);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/confusion`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Password': PASSWORD,
          },
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe('postProgress', () => {
    const payload = {
      patternId: 1,
      exerciseId: 2,
      userSentence: 'sentence',
      result: 'correct',
      confusedWithPatternId: undefined,
    };

    it('returns the parsed response on success', async () => {
      fetchMock.mockResolvedValue(mockOkResponse({ progress: { streak: 4 } }));

      const result = await postProgress(PASSWORD, payload);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/progress`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Password': PASSWORD,
          },
          body: JSON.stringify(payload),
        })
      );
      expect(result).toEqual({ progress: { streak: 4 } });
    });

    it('returns null on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await postProgress(PASSWORD, payload)).toBeNull();
    });
  });

  describe('checkConfusion', () => {
    it('returns an alert when the response contains confusedWith', async () => {
      const confusedWith = makePattern({ id: 2, pattern: '〜たがる', category: 'Volition' });
      fetchMock.mockResolvedValue(mockOkResponse({ confusedWith }));

      const result = await checkConfusion(PASSWORD, 1, 'my sentence');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/api/grammar/check-confusion`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Password': PASSWORD,
          },
          body: JSON.stringify({ patternId: 1, userSentence: 'my sentence' }),
        })
      );
      expect(result).toEqual({
        confusedWith,
        message: '⚠️ This looks like "〜たがる" (Volition)!',
      });
    });

    it('returns null when no confusion is detected', async () => {
      fetchMock.mockResolvedValue(mockOkResponse({}));
      expect(await checkConfusion(PASSWORD, 1, 'sentence')).toBeNull();
    });

    it('returns null on non-ok response', async () => {
      fetchMock.mockResolvedValue(mockNotOkResponse());
      expect(await checkConfusion(PASSWORD, 1, 'sentence')).toBeNull();
    });

    it('returns null and logs on network error', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockRejectedValue(new Error('network down'));

      const result = await checkConfusion(PASSWORD, 1, 'sentence');

      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith('Failed to check confusion:', expect.any(Error));
      errorSpy.mockRestore();
    });
  });
});
