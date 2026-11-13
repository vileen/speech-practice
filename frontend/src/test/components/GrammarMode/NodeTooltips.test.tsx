import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NodeTooltips } from '../../../components/GrammarMode/NodeTooltips';
import type { PatternNode } from '../../../components/GrammarMode/PatternGraphTypes';
import { NODE_COLORS } from '../../../components/GrammarMode/PatternGraphTypes';

describe('NodeTooltips', () => {
  const makeNode = (overrides: Partial<PatternNode> = {}): PatternNode => ({
    id: 1,
    pattern: 'てもいい',
    category: 'Permission',
    x: 100,
    y: 100,
    masteryStatus: 'mastered',
    accuracy: 0.856,
    vx: 0,
    vy: 0,
    ...overrides,
  });

  it('renders nothing when no node is hovered', () => {
    const { container } = render(
      <NodeTooltips filteredNodes={[makeNode()]} hoveredNode={null} />
    );
    expect(container.querySelectorAll('g')).toHaveLength(0);
  });

  it('renders nothing when a different node is hovered', () => {
    const { container } = render(
      <NodeTooltips filteredNodes={[makeNode()]} hoveredNode={99} />
    );
    expect(container.querySelectorAll('g')).toHaveLength(0);
  });

  it('renders a tooltip for the hovered node', () => {
    const node = makeNode();
    const { container } = render(
      <NodeTooltips filteredNodes={[node]} hoveredNode={node.id} />
    );
    const groups = container.querySelectorAll('g');
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveAttribute(
      'transform',
      `translate(${node.x + 45}, ${node.y - 40})`
    );
  });

  it('shows the pattern name, category, and rounded accuracy', () => {
    const node = makeNode({ accuracy: 0.856 });
    const { container } = render(
      <NodeTooltips filteredNodes={[node]} hoveredNode={node.id} />
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      t => t.textContent
    );
    expect(texts).toContain(node.pattern);
    expect(texts).toContain(node.category);
    expect(texts).toContain('Accuracy: 86%');
  });

  it('rounds accuracy to the nearest percent', () => {
    const node = makeNode({ accuracy: 0.554 });
    const { container } = render(
      <NodeTooltips filteredNodes={[node]} hoveredNode={node.id} />
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      t => t.textContent
    );
    expect(texts).toContain('Accuracy: 55%');
  });

  it('uses the mastery status color for stroke and accuracy text', () => {
    const node = makeNode({ masteryStatus: 'learning' });
    const { container } = render(
      <NodeTooltips filteredNodes={[node]} hoveredNode={node.id} />
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke')).toBe(NODE_COLORS.learning);
    const accuracyText = Array.from(container.querySelectorAll('text')).find(t =>
      t.textContent?.startsWith('Accuracy:')
    );
    expect(accuracyText?.getAttribute('fill')).toBe(NODE_COLORS.learning);
  });

  it('renders only the hovered tooltip when multiple nodes are present', () => {
    const node1 = makeNode({ id: 1 });
    const node2 = makeNode({ id: 2, pattern: 'なくてもいい', category: 'Permission', x: 300, y: 300 });
    const { container } = render(
      <NodeTooltips filteredNodes={[node1, node2]} hoveredNode={node2.id} />
    );
    const groups = container.querySelectorAll('g');
    expect(groups).toHaveLength(1);
    expect(groups[0].querySelector('text')?.textContent).toBe(node2.pattern);
  });
});
