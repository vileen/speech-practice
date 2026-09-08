import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useProgressData,
  formatTime,
  getDayLabel,
  getStreakEmoji,
  getAccuracyColor,
  computeMaxActivity,
} from '../../hooks/useProgressData';
import type { ActivityDay } from '../../hooks/useProgressData';

vi.mock('../../config/api', () => ({
  API_URL: 'http://localhost:3001',
}));

const mockOverview = {
  studyTime: { thisWeek: 120, allTime: 1500, unit: 'minutes' },
  streak: 10,
  grammar: { mastered: 45, total: 100 },
  kanji: { learned: 80, total: 200 },
  lessons: { completed: 12, total: 30 },
};

const mockLevels = {
  levels: [
    {
      level: 'N5',
      grammar: { total: 50, mastered: 40, percentage: 80 },
      kanji: { total: 100, mastered: 60, percentage: 60 },
      overall: { total: 150, mastered: 100, percentage: 66.7 },
    },
  ],
};

const mockWeakPoints = {
  weakCategories: [
    { category: 'verbs', accuracy: 55, totalPatterns: 20, totalAttempts: 100 },
  ],
  weakPatterns: [
    {
      id: 1,
      pattern: 'てもいい',
      category: 'permission',
      jlptLevel: 'N5',
      accuracy: 40,
      attempts: 20,
      correct: 8,
    },
  ],
  confusedPairs: [
    {
      patternId: 1,
      patternName: 'てもいい',
      patternCategory: 'permission',
      confusedWithId: 2,
      confusedWithName: 'なくてもいい',
      count: 5,
    },
  ],
};

const mockActivity = {
  activity: [
    { date: '2026-09-07', grammarAttempts: 10, kanjiAttempts: 5, totalSessions: 3 },
    { date: '2026-09-08', grammarAttempts: 20, kanjiAttempts: 10, totalSessions: 5 },
  ],
};

const mockCategories = {
  categories: [
    { category: 'verbs', totalPatterns: 30, totalAttempts: 200, accuracy: 70 },
  ],
};

const endpoints: Record<string, unknown> = {
  '/api/progress/overview': mockOverview,
  '/api/progress/by-level': mockLevels,
  '/api/progress/weak-points': mockWeakPoints,
  '/api/progress/activity': mockActivity,
  '/api/progress/categories': mockCategories,
};

const fetchMock = vi.fn();

function setupFetch(opts: { failUrl?: string; throwError?: boolean } = {}) {
  fetchMock.mockImplementation(async (url: string) => {
    if (opts.throwError) throw new Error('Network error');
    if (opts.failUrl && url.includes(opts.failUrl)) {
      return { ok: false, status: 500, json: async () => ({}) };
    }
    const key = Object.keys(endpoints).find((k) => url.includes(k));
    if (!key) return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => endpoints[key] };
  });
  vi.stubGlobal('fetch', fetchMock);
}

describe('useProgressData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts in loading state with null data', () => {
    setupFetch();
    const { result } = renderHook(() => useProgressData());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.overview).toBeNull();
  });

  it('fetches all progress endpoints and populates state', async () => {
    setupFetch();
    const { result } = renderHook(() => useProgressData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/progress/overview'
    );

    expect(result.current.error).toBeNull();
    expect(result.current.overview).toEqual(mockOverview);
    expect(result.current.jlptLevels).toEqual(mockLevels.levels);
    expect(result.current.weakCategories).toEqual(mockWeakPoints.weakCategories);
    expect(result.current.weakPatterns).toEqual(mockWeakPoints.weakPatterns);
    expect(result.current.confusedPairs).toEqual(mockWeakPoints.confusedPairs);
    expect(result.current.activity).toEqual(mockActivity.activity);
    expect(result.current.categories).toEqual(mockCategories.categories);
  });

  it('sets error message when an endpoint returns non-ok', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setupFetch({ failUrl: '/api/progress/overview' });
    const { result } = renderHook(() => useProgressData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(
      'Failed to load progress data. Please try again.'
    );
    expect(result.current.overview).toBeNull();
    consoleSpy.mockRestore();
  });

  it('sets error message on network failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setupFetch({ throwError: true });
    const { result } = renderHook(() => useProgressData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(
      'Failed to load progress data. Please try again.'
    );
    consoleSpy.mockRestore();
  });
});

describe('formatTime', () => {
  it('returns minutes under 60', () => {
    expect(formatTime(0)).toBe('0m');
    expect(formatTime(45)).toBe('45m');
    expect(formatTime(59)).toBe('59m');
  });

  it('returns hours without minutes when exact', () => {
    expect(formatTime(60)).toBe('1h');
    expect(formatTime(120)).toBe('2h');
  });

  it('returns hours and minutes for mixed values', () => {
    expect(formatTime(90)).toBe('1h 30m');
    expect(formatTime(151)).toBe('2h 31m');
  });
});

describe('getDayLabel', () => {
  const dayMs = 24 * 60 * 60 * 1000;

  const isoDaysAgo = (n: number): string => {
    const d = new Date(Date.now() - n * dayMs);
    return d.toISOString().slice(0, 10);
  };

  it('returns Today for current date', () => {
    expect(getDayLabel(isoDaysAgo(0))).toBe('Today');
  });

  it('returns Yesterday for one day ago', () => {
    expect(getDayLabel(isoDaysAgo(1))).toBe('Yesterday');
  });

  it('returns weekday short name for older dates', () => {
    // Use fake timers to make this deterministic
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-08T12:00:00Z'));
    expect(getDayLabel('2026-09-05')).toBe('Sat');
    vi.useRealTimers();
  });
});

describe('getStreakEmoji', () => {
  it('returns 🔥 for 30+ day streaks', () => {
    expect(getStreakEmoji(30)).toBe('🔥');
    expect(getStreakEmoji(100)).toBe('🔥');
  });

  it('returns ⚡ for 14-29 day streaks', () => {
    expect(getStreakEmoji(14)).toBe('⚡');
    expect(getStreakEmoji(29)).toBe('⚡');
  });

  it('returns 💪 for 7-13 day streaks', () => {
    expect(getStreakEmoji(7)).toBe('💪');
    expect(getStreakEmoji(13)).toBe('💪');
  });

  it('returns ✨ for streaks under 7', () => {
    expect(getStreakEmoji(0)).toBe('✨');
    expect(getStreakEmoji(6)).toBe('✨');
  });
});

describe('getAccuracyColor', () => {
  it('returns green for accuracy >= 80', () => {
    expect(getAccuracyColor(80)).toBe('#27ae60');
    expect(getAccuracyColor(100)).toBe('#27ae60');
  });

  it('returns orange for accuracy 60-79', () => {
    expect(getAccuracyColor(60)).toBe('#f39c12');
    expect(getAccuracyColor(79)).toBe('#f39c12');
  });

  it('returns red for accuracy < 60', () => {
    expect(getAccuracyColor(0)).toBe('#e74c3c');
    expect(getAccuracyColor(59)).toBe('#e74c3c');
  });
});

describe('computeMaxActivity', () => {
  it('returns max totalSessions from activity', () => {
    const activity: ActivityDay[] = [
      { date: '2026-09-01', grammarAttempts: 0, kanjiAttempts: 0, totalSessions: 2 },
      { date: '2026-09-02', grammarAttempts: 0, kanjiAttempts: 0, totalSessions: 7 },
      { date: '2026-09-03', grammarAttempts: 0, kanjiAttempts: 0, totalSessions: 4 },
    ];
    expect(computeMaxActivity(activity)).toBe(7);
  });

  it('returns 1 as floor for empty activity', () => {
    expect(computeMaxActivity([])).toBe(1);
  });
});
