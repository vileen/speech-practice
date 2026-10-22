import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCountersMode } from '../../components/CountersMode/useCountersMode';
import { API_URL } from '../../config/api';
import type { CounterGroup } from '../../components/CountersMode/types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const makePattern = (id: number, base: string, en?: string) => ({
  id,
  pattern: `${base}${id}`,
  base_form: base,
  formation_rules: [],
  examples: en ? [{ en, jp: 'x' }] : [],
});

const makeGroup = (baseForm: string, count: number, en?: string): CounterGroup => ({
  baseForm,
  count,
  counts: `${count} things`,
  description: `${baseForm} counter`,
  patterns: [makePattern(1, baseForm, en), makePattern(2, baseForm, en)],
});

const mockFetchGroups = (groups: CounterGroup[]) => {
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: async () => ({ groups }),
  });
};

describe('useCountersMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as any).mockReturnValue('test-password');
  });

  it('starts in menu mode with loading state', () => {
    mockFetchGroups([]);
    const { result } = renderHook(() => useCountersMode());
    expect(result.current.mode).toBe('menu');
    expect(result.current.loading).toBe(true);
    expect(result.current.counterGroups).toEqual([]);
    expect(result.current.quizQuestion).toBeNull();
    expect(result.current.showAnswer).toBe(false);
  });

  it('loads counter groups with password header on mount', async () => {
    const groups = [makeGroup('つ', 1), makeGroup('個', 2)];
    mockFetchGroups(groups);

    const { result } = renderHook(() => useCountersMode());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/counters/groups`, {
      headers: { 'X-Password': 'test-password' },
    });
    expect(result.current.counterGroups).toEqual(groups);
  });

  it('handles fetch failure gracefully and stops loading', async () => {
    (global.fetch as any).mockRejectedValue(new Error('network down'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useCountersMode());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.counterGroups).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('startStudy selects group, enters study mode and sets first pattern', () => {
    mockFetchGroups([]);
    const group = makeGroup('つ', 1);
    const { result } = renderHook(() => useCountersMode());

    act(() => result.current.startStudy(group));

    expect(result.current.mode).toBe('study');
    expect(result.current.selectedGroup).toEqual(group);
    expect(result.current.currentPattern).toEqual(group.patterns[0]);
  });

  it('startQuiz enters quiz mode and picks a question from the selected group', () => {
    mockFetchGroups([]);
    const group = makeGroup('つ', 1, 'one cat');
    const { result } = renderHook(() => useCountersMode());

    act(() => result.current.startStudy(group));
    act(() => result.current.startQuiz());

    expect(result.current.mode).toBe('quiz');
    expect(result.current.quizQuestion).not.toBeNull();
    expect(group.patterns).toContainEqual(result.current.quizQuestion!.pattern);
    expect(result.current.quizQuestion!.questionText).toBe('How do you say: "one cat"?');
  });

  it('falls back to reading question when no example English exists', () => {
    mockFetchGroups([]);
    const group = makeGroup('個', 3); // no examples
    const { result } = renderHook(() => useCountersMode());

    act(() => result.current.startStudy(group));
    act(() => result.current.startQuiz());

    expect(result.current.quizQuestion!.questionText).toBe('What is the reading for 3 things?');
  });

  it('toggleGroupSelection adds and removes base forms', () => {
    mockFetchGroups([]);
    const { result } = renderHook(() => useCountersMode());
    const event = { stopPropagation: vi.fn() } as any;

    act(() => result.current.toggleGroupSelection('つ', event));
    expect(result.current.selectedGroups.has('つ')).toBe(true);

    act(() => result.current.toggleGroupSelection('つ', event));
    expect(result.current.selectedGroups.has('つ')).toBe(false);
    expect(event.stopPropagation).toHaveBeenCalledTimes(2);
  });

  it('startSelectedQuiz builds questions only from selected groups', async () => {
    const groups = [makeGroup('つ', 1, 'a'), makeGroup('個', 2, 'b')];
    mockFetchGroups(groups);
    const { result } = renderHook(() => useCountersMode());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.toggleGroupSelection('個', { stopPropagation: vi.fn() } as any);
    });
    act(() => result.current.startSelectedQuiz());

    expect(result.current.mode).toBe('category-quiz');
    expect(result.current.mixedQuestions.length).toBe(2); // only 個 group patterns
    expect(
      result.current.mixedQuestions.every(q => q.group.baseForm === '個')
    ).toBe(true);
  });

  it('startMixedQuiz caps questions at 20 across all groups', async () => {
    const manyGroups = Array.from({ length: 15 }, (_, i) =>
      makeGroup(`c${i}`, i + 1, `ex${i}`) // 2 patterns each = 30 total
    );
    mockFetchGroups(manyGroups);
    const { result } = renderHook(() => useCountersMode());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.startMixedQuiz());

    expect(result.current.mode).toBe('mixed');
    expect(result.current.mixedQuestions.length).toBe(20);
    expect(result.current.currentQuestionIndex).toBe(0);
  });

  it('nextMixedQuestion advances index and returns to menu at the end', async () => {
    const groups = [makeGroup('つ', 1, 'a')]; // 2 patterns -> 2 questions
    mockFetchGroups(groups);
    const { result } = renderHook(() => useCountersMode());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.startMixedQuiz());
    expect(result.current.mixedQuestions.length).toBe(2);

    act(() => result.current.nextMixedQuestion());
    expect(result.current.currentQuestionIndex).toBe(1);

    act(() => result.current.nextMixedQuestion());
    expect(result.current.mode).toBe('menu');
  });

  it('handleAnswer advances mixed quiz when in mixed mode', async () => {
    const groups = [makeGroup('つ', 1, 'a')];
    mockFetchGroups(groups);
    const { result } = renderHook(() => useCountersMode());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.startMixedQuiz());
    act(() => result.current.handleAnswer(true));

    expect(result.current.currentQuestionIndex).toBe(1);
  });

  it('handleAnswer picks a new question when in single-group quiz mode', () => {
    mockFetchGroups([]);
    const group = makeGroup('つ', 1, 'a');
    const { result } = renderHook(() => useCountersMode());

    act(() => result.current.startStudy(group));
    act(() => result.current.startQuiz());
    const firstQuestion = result.current.quizQuestion;

    act(() => result.current.handleAnswer(true));

    expect(result.current.mode).toBe('quiz'); // still in quiz
    expect(result.current.quizQuestion).not.toBeNull();
    expect(result.current.quizQuestion!.questionText).toBe(firstQuestion!.questionText);
  });
});
