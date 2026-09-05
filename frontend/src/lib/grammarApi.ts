import { API_URL } from '../config/api.js';
import type {
  GrammarPattern,
  GrammarExercise,
  DiscriminationAlert,
} from '../components/GrammarMode/types.js';

function authHeaders(password: string): HeadersInit {
  return { 'X-Password': password };
}

function postHeaders(password: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Password': password,
  };
}

export async function fetchPatterns(password: string): Promise<GrammarPattern[]> {
  const response = await fetch(`${API_URL}/api/grammar/patterns`, {
    headers: authHeaders(password),
  });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.patterns || []).filter((p: GrammarPattern) => p.category !== 'Counters');
}

export async function fetchDuePatterns(password: string): Promise<{ patterns: GrammarPattern[]; count: number }> {
  const response = await fetch(`${API_URL}/api/grammar/review`, {
    headers: authHeaders(password),
  });
  if (!response.ok) return { patterns: [], count: 0 };
  const data = await response.json();
  return { patterns: data.patterns || [], count: data.count };
}

export async function fetchCounterVariants(password: string, baseForm: string): Promise<GrammarPattern[]> {
  try {
    const response = await fetch(`${API_URL}/api/counters/${encodeURIComponent(baseForm)}/variants`, {
      headers: authHeaders(password),
    });
    if (response.ok) {
      const data = await response.json();
      return data.variants || [];
    }
  } catch (err) {
    console.error('Failed to load counter variants:', err);
  }
  return [];
}

export async function fetchMixedReviewPatterns(password: string, categories: string[]): Promise<GrammarPattern[]> {
  const response = await fetch(
    `${API_URL}/api/grammar/mixed-review?categories=${categories.join(',')}&limit=10`,
    { headers: authHeaders(password) }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return data.patterns || [];
}

export async function fetchPatternExercise(password: string, patternId: number): Promise<GrammarExercise | null> {
  const response = await fetch(`${API_URL}/api/grammar/patterns/${patternId}/exercise`, {
    headers: authHeaders(password),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.exercise ?? null;
}

export interface GrammarExerciseWithPattern extends GrammarExercise {
  pattern_id?: number;
}

export async function fetchExerciseById(password: string, exerciseId: number): Promise<GrammarExerciseWithPattern | null> {
  const response = await fetch(`${API_URL}/api/grammar/exercises/${exerciseId}`, {
    headers: authHeaders(password),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.exercise ?? null;
}

export async function fetchDiscriminationExercise(
  password: string,
  patternId: number
): Promise<GrammarExercise | null> {
  const response = await fetch(`${API_URL}/api/grammar/patterns/${patternId}/discrimination`, {
    headers: authHeaders(password),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.exercise ?? null;
}

export async function fetchRelatedPatterns(password: string, patternId: number): Promise<GrammarPattern[]> {
  const response = await fetch(`${API_URL}/api/grammar/patterns/${patternId}/related`, {
    headers: authHeaders(password),
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.patterns || [];
}

export async function fetchConfusionCounts(
  password: string,
  patterns: GrammarPattern[]
): Promise<{ patternId: number; count: number }[]> {
  const response = await fetch(`${API_URL}/api/grammar/confusion-stats`, {
    headers: authHeaders(password),
  });
  if (!response.ok) return [];
  const data = await response.json();
  const counts: Record<number, number> = {};
  data.topConfusions?.forEach((conf: any) => {
    const pattern = patterns.find(p => p.pattern === conf.pattern_name);
    if (pattern) {
      counts[pattern.id] = (counts[pattern.id] || 0) + parseInt(conf.count);
    }
  });
  return Object.entries(counts).map(([id, count]) => ({ patternId: parseInt(id), count }));
}

export async function postConfusion(
  password: string,
  payload: {
    patternId: number;
    confusedWithPatternId: number;
    userSentence: string;
  }
): Promise<void> {
  await fetch(`${API_URL}/api/grammar/confusion`, {
    method: 'POST',
    headers: postHeaders(password),
    body: JSON.stringify(payload),
  });
}

export async function postProgress(
  password: string,
  payload: {
    patternId: number | undefined;
    exerciseId: number | undefined;
    userSentence: string;
    result: string;
    confusedWithPatternId: number | undefined;
  }
): Promise<{ progress?: any } | null> {
  const response = await fetch(`${API_URL}/api/grammar/progress`, {
    method: 'POST',
    headers: postHeaders(password),
    body: JSON.stringify(payload),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function checkConfusion(
  password: string,
  patternId: number,
  userSentence: string
): Promise<DiscriminationAlert | null> {
  try {
    const response = await fetch(`${API_URL}/api/grammar/check-confusion`, {
      method: 'POST',
      headers: postHeaders(password),
      body: JSON.stringify({ patternId, userSentence }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.confusedWith) {
        return {
          confusedWith: data.confusedWith,
          message: `⚠️ This looks like "${data.confusedWith.pattern}" (${data.confusedWith.category})!`,
        };
      }
    }
  } catch (err) {
    console.error('Failed to check confusion:', err);
  }
  return null;
}
