import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatternGraph } from '../../../components/GrammarMode/PatternGraph';
import type { GrammarPattern } from '../../../components/GrammarMode/types';
import { API_URL } from '../../../config/api';

// Helper to build a minimal GrammarPattern
const makePattern = (overrides: Partial<GrammarPattern>): GrammarPattern => ({
  id: 1,
  pattern: 'てもいい',
  category: 'Permission',
  jlpt_level: 'N4',
  formation_rules: [],
  examples: [],
  common_mistakes: [],
  ...overrides,
});

const mockPatterns: GrammarPattern[] = [
  makePattern({ id: 1, pattern: 'てもいい', category: 'Permission', total_attempts: 10, correct_attempts: 9 }),
  makePattern({ id: 2, pattern: 'なくてもいい', category: 'Permission', total_attempts: 10, correct_attempts: 6 }),
  makePattern({ id: 3, pattern: 'なければならない', category: 'Obligation', total_attempts: 10, correct_attempts: 3 }),
  makePattern({ id: 4, pattern: ' counters個', category: 'Counters' }),
];

const mockConfusionStats = [
  { patternId: 1, count: 0 },
  { patternId: 2, count: 1 },
  { patternId: 3, count: 4 }, // > 2 → confused even at accuracy 0.3
];

const mockRelationships = [
  { id: 1, from_pattern_id: 1, to_pattern_id: 2, relationship_type: 'similar', strength: 0.8 },
  { id: 2, from_pattern_id: 1, to_pattern_id: 3, relationship_type: 'opposite', strength: 0.9 },
  { id: 3, from_pattern_id: 2, to_pattern_id: 3, relationship_type: 'related', strength: 0.6 },
  // Should be filtered out: references the Counters pattern (id 4 is fine, 99 is not)
  { id: 4, from_pattern_id: 2, to_pattern_id: 99, relationship_type: 'related', strength: 0.5 },
];

const mockFetchResponse = {
  ok: true,
  json: async () => ({ relationships: mockRelationships }),
};

const defaultProps = {
  patterns: mockPatterns,
  confusionStats: mockConfusionStats,
  onSelectPattern: vi.fn(),
  onComparePatterns: vi.fn(),
  onClose: vi.fn(),
};

// Footer text is split across JSX nodes, so match on the container's textContent
const getFooterText = () =>
  document.querySelector('.pattern-graph-footer')?.textContent?.replace(/\s+/g, ' ') ?? '';

const expectFooter = async (expected: string) => {
  await waitFor(() => expect(getFooterText()).toContain(expected));
};

describe('PatternGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue(mockFetchResponse);
  });

  it('renders header, filter buttons, and zoom controls', () => {
    render(<PatternGraph {...defaultProps} />);

    expect(screen.getByText('🕸️ Pattern Relationship Graph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confused' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mastered' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '−' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '⟲' })).toBeInTheDocument();
  });

  it('fetches relationships from the API on mount', async () => {
    render(<PatternGraph {...defaultProps} />);

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/grammar/relationships`);
    await waitFor(() =>
      expect(screen.queryByText('Fetching pattern relationships...')).not.toBeInTheDocument()
    );
  });

  it('excludes Counters patterns and invalid connections from the graph', async () => {
    render(<PatternGraph {...defaultProps} />);

    // 5 patterns provided, 1 is Counters → 3 grammar patterns visible
    await expectFooter('Visible: 3 patterns');
    // Only 3 valid connections (one references non-existent pattern 99)
    expect(getFooterText()).toContain('Connections: 3 connections');
    expect(screen.queryByText(' counters個')).not.toBeInTheDocument();
  });

  it('filters nodes by mastery status', async () => {
    render(<PatternGraph {...defaultProps} />);

    await expectFooter('Visible: 3 patterns');

    fireEvent.click(screen.getByRole('button', { name: 'Confused' }));
    // Only pattern 3 (confusion count 4, accuracy 0.3) is confused
    await expectFooter('Visible: 1 patterns');

    fireEvent.click(screen.getByRole('button', { name: 'Mastered' }));
    // Only pattern 1 (accuracy 0.9) is mastered
    await expectFooter('Visible: 1 patterns');

    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    await expectFooter('Visible: 3 patterns');
  });

  it('marks the active filter button', async () => {
    render(<PatternGraph {...defaultProps} />);

    const confusedBtn = screen.getByRole('button', { name: 'Confused' });
    expect(confusedBtn).not.toHaveClass('active');

    fireEvent.click(confusedBtn);
    expect(confusedBtn).toHaveClass('active');
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('active');
  });

  it('calls onSelectPattern when a node is clicked', async () => {
    const onSelectPattern = vi.fn();
    render(<PatternGraph {...defaultProps} onSelectPattern={onSelectPattern} />);

    await expectFooter('Visible: 3 patterns');

    const node = document.querySelector('.node-group');
    expect(node).not.toBeNull();
    fireEvent.click(node!);

    expect(onSelectPattern).toHaveBeenCalledTimes(1);
    expect(onSelectPattern).toHaveBeenCalledWith(
      expect.objectContaining({ id: expect.any(Number), pattern: expect.any(String) })
    );
  });

  it('calls onComparePatterns when a connection is clicked', async () => {
    const onComparePatterns = vi.fn();
    render(<PatternGraph {...defaultProps} onComparePatterns={onComparePatterns} />);

    await expectFooter('Connections: 3 connections');

    const connection = document.querySelector('.connection-line');
    expect(connection).not.toBeNull();
    fireEvent.click(connection!);

    expect(onComparePatterns).toHaveBeenCalledTimes(1);
    expect(onComparePatterns).toHaveBeenCalledWith([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 2 }),
    ]);
  });

  it('adjusts zoom level via zoom controls', async () => {
    render(<PatternGraph {...defaultProps} />);

    expect(screen.getByText('100%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('120%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '−' }));
    expect(screen.getByText('100%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: '⟲' }));
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<PatternGraph {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('recovers gracefully when the relationships fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (fetch as any).mockResolvedValue({ ok: false, status: 500 });

    render(<PatternGraph {...defaultProps} />);

    await waitFor(() =>
      expect(screen.queryByText('Fetching pattern relationships...')).not.toBeInTheDocument()
    );

    // No connections loaded, but the graph still renders the nodes
    await expectFooter('Visible: 3 patterns');
    expect(getFooterText()).toContain('Connections: 0 connections');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('recovers gracefully when the fetch throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (fetch as any).mockRejectedValue(new Error('Network error'));

    render(<PatternGraph {...defaultProps} />);

    await waitFor(() =>
      expect(screen.queryByText('Fetching pattern relationships...')).not.toBeInTheDocument()
    );

    await expectFooter('Visible: 3 patterns');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
