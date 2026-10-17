import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePatternGraph } from '../../hooks/usePatternGraph';
import type { GrammarPattern } from '../../components/GrammarMode/types';

// runForceLayout is covered by its own test suite (src/test/lib/forceLayout.test.ts).
// Here we mock it as a passthrough so we can assert on the hook's data logic.
vi.mock('../../lib/forceLayout', () => ({
  runForceLayout: vi.fn(({ initialNodes }: { initialNodes: unknown[] }) => initialNodes),
}));

vi.mock('../../config/api', () => ({
  API_URL: 'http://test-api',
}));

import { runForceLayout } from '../../lib/forceLayout';

const makePattern = (
  id: number,
  category: string,
  overrides: Partial<GrammarPattern> = {}
): GrammarPattern => ({
  id,
  pattern: `pattern-${id}`,
  category,
  jlpt_level: 'N5',
  formation_rules: [],
  examples: [],
  common_mistakes: [],
  total_attempts: 0,
  correct_attempts: 0,
  ...overrides,
});

const patterns: GrammarPattern[] = [
  makePattern(1, 'Verbs', { total_attempts: 10, correct_attempts: 9 }), // accuracy 0.9 -> mastered
  makePattern(2, 'Verbs', { total_attempts: 10, correct_attempts: 3 }), // accuracy 0.3 -> confused
  makePattern(3, 'Particles', { total_attempts: 10, correct_attempts: 6 }), // learning
  makePattern(4, 'Counters'), // filtered out (own module)
  makePattern(5, 'Particles'), // no attempts -> unknown
];

const confusionStats = [
  { patternId: 2, count: 4 }, // high confusion count also marks it confused
];

const relationshipsResponse = {
  relationships: [
    {
      id: 1,
      from_pattern_id: 1,
      to_pattern_id: 2,
      relationship_type: 'similar',
      strength: 0.8,
    },
    {
      id: 2,
      from_pattern_id: 2,
      to_pattern_id: 99, // unknown pattern -> filtered out of visible connections
      relationship_type: 'opposite',
      strength: 0.5,
    },
  ],
};

const mockFetchSuccess = () => {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => relationshipsResponse,
  });
};

const renderGraph = () =>
  renderHook(() => usePatternGraph({ patterns, confusionStats }));

// Renders the hook and waits for the relationships fetch to settle,
// so no stray state update escapes act().
const renderGraphSettled = async () => {
  const rendered = renderGraph();
  await waitFor(() => expect(rendered.result.current.loadingConnections).toBe(false));
  return rendered;
};

const waitForConnections = async () => {
  const { result } = renderGraph();
  await waitFor(() => expect(result.current.loadingConnections).toBe(false));
  return { result };
};

describe('usePatternGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSuccess();
  });

  describe('API fetching', () => {
    it('should fetch relationships from the grammar API on mount', async () => {
      const { result } = renderGraph();

      expect(global.fetch).toHaveBeenCalledWith('http://test-api/api/grammar/relationships');
      expect(result.current.loadingConnections).toBe(true);

      await waitFor(() => expect(result.current.loadingConnections).toBe(false));
    });

    it('should map API relationships to PatternConnection shape', async () => {
      const { result } = await waitForConnections();

      expect(result.current.connections).toEqual([
        { from: 1, to: 2, type: 'similar', strength: 0.8 },
        { from: 2, to: 99, type: 'opposite', strength: 0.5 },
      ]);
    });

    it('should set connections to empty array and stop loading when fetch fails', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderGraph();
      await waitFor(() => expect(result.current.loadingConnections).toBe(false));

      expect(result.current.connections).toEqual([]);
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network down'));

      const { result } = renderGraph();
      await waitFor(() => expect(result.current.loadingConnections).toBe(false));

      expect(result.current.connections).toEqual([]);
      consoleError.mockRestore();
    });
  });

  describe('pattern filtering', () => {
    it('should exclude Counters category patterns', async () => {
      const { result } = await renderGraphSettled();

      expect(result.current.grammarPatterns).toHaveLength(4);
      expect(result.current.grammarPatterns.some(p => p.category === 'Counters')).toBe(false);
    });

    it('should pass only non-counter nodes and visible connections to runForceLayout', async () => {
      await renderGraphSettled();

      const lastCall = (runForceLayout as ReturnType<typeof vi.fn>).mock.calls.at(-1)![0];
      expect(lastCall.initialNodes.map((n: { id: number }) => n.id)).toEqual([1, 2, 3, 5]);
      // Connection to unknown pattern 99 is excluded
      expect(lastCall.connections).toEqual([
        { from: 1, to: 2, type: 'similar', strength: 0.8 },
      ]);
      expect(lastCall.iterations).toBe(150);
    });
  });

  describe('mastery status calculation', () => {
    it('should compute masteryStatus and accuracy for each pattern', async () => {
      const { result } = await renderGraphSettled();

      const nodes = result.current.filteredNodes;
      const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

      expect(byId[1].masteryStatus).toBe('mastered'); // 9/10 = 0.9 >= 0.8
      expect(byId[1].accuracy).toBe(0.9);
      expect(byId[2].masteryStatus).toBe('confused'); // accuracy 0.3 < 0.5 and confusion count 4 > 2
      expect(byId[3].masteryStatus).toBe('learning'); // 0.6 in between
      expect(byId[5].masteryStatus).toBe('unknown'); // no attempts
      expect(byId[5].accuracy).toBe(0);
    });
  });

  describe('filter state', () => {
    it('should default to showing all nodes', async () => {
      const { result } = await renderGraphSettled();

      expect(result.current.filter).toBe('all');
      expect(result.current.filteredNodes).toHaveLength(4);
    });

    it('should filter nodes by mastery status', async () => {
      const { result } = await renderGraphSettled();

      act(() => result.current.setFilter('confused'));
      expect(result.current.filteredNodes.map(n => n.id)).toEqual([2]);

      act(() => result.current.setFilter('mastered'));
      expect(result.current.filteredNodes.map(n => n.id)).toEqual([1]);

      act(() => result.current.setFilter('learning'));
      expect(result.current.filteredNodes.map(n => n.id)).toEqual([3]);

      act(() => result.current.setFilter('all'));
      expect(result.current.filteredNodes).toHaveLength(4);
    });
  });

  describe('visibleConnections', () => {
    it('should only include connections between known patterns', async () => {
      const { result } = await waitForConnections();

      expect(result.current.visibleConnections).toEqual([
        { from: 1, to: 2, type: 'similar', strength: 0.8 },
      ]);
    });
  });

  describe('categories', () => {
    it('should compute average category label positions', async () => {
      const { result } = await renderGraphSettled();

      const cats = result.current.categories;
      expect(cats).toHaveLength(2);
      const names = cats.map(c => c.name).sort();
      expect(names).toEqual(['Particles', 'Verbs']);
      cats.forEach(c => {
        expect(Number.isFinite(c.x)).toBe(true);
        expect(Number.isFinite(c.y)).toBe(true);
      });
    });

    it('should exclude categories with no nodes', async () => {
      const { result } = await renderGraphSettled();

      // Only 'Counters' nodes exist for that category, and they are filtered out
      expect(result.current.categories.some(c => c.name === 'Counters')).toBe(false);
    });
  });

  describe('manual node positions', () => {
    it('should override node position after updateNodePosition', async () => {
      const { result } = await renderGraphSettled();

      act(() => result.current.updateNodePosition(1, 111, 222));

      const node = result.current.filteredNodes.find(n => n.id === 1)!;
      expect(node.x).toBe(111);
      expect(node.y).toBe(222);
    });

    it('should apply manual positions only within the current filter', async () => {
      const { result } = await renderGraphSettled();

      act(() => result.current.updateNodePosition(2, 50, 60));
      act(() => result.current.setFilter('mastered'));

      expect(result.current.filteredNodes.every(n => n.id !== 2)).toBe(true);

      act(() => result.current.setFilter('confused'));
      const node = result.current.filteredNodes.find(n => n.id === 2)!;
      expect(node.x).toBe(50);
      expect(node.y).toBe(60);
    });

    it('should update position for the same node without affecting others', async () => {
      const { result } = await renderGraphSettled();

      act(() => result.current.updateNodePosition(1, 10, 20));
      act(() => result.current.updateNodePosition(1, 30, 40));

      const node = result.current.filteredNodes.find(n => n.id === 1)!;
      expect(node.x).toBe(30);
      expect(node.y).toBe(40);
    });
  });

  describe('dimensions', () => {
    it('should expose stable graph dimensions', async () => {
      const { result } = await renderGraphSettled();

      expect(result.current.dimensions).toEqual({ width: 1200, height: 800 });
    });
  });
});
