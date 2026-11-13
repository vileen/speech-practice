import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ConnectionLabels } from '../../../components/GrammarMode/ConnectionLabels';
import type { PatternNode, PatternConnection } from '../../../components/GrammarMode/PatternGraphTypes';
import { CONNECTION_COLORS, LEGEND_LABELS } from '../../../components/GrammarMode/PatternGraphTypes';

describe('ConnectionLabels', () => {
  const node1: PatternNode = {
    id: 1,
    pattern: 'てもいい',
    category: 'Permission',
    x: 100,
    y: 100,
    masteryStatus: 'mastered',
    accuracy: 0.85,
    vx: 0,
    vy: 0,
  };

  const node2: PatternNode = {
    id: 2,
    pattern: 'なければなりません',
    category: 'Obligation',
    x: 300,
    y: 200,
    masteryStatus: 'learning',
    accuracy: 0.55,
    vx: 0,
    vy: 0,
  };

  const connection: PatternConnection = {
    from: 1,
    to: 2,
    type: 'similar',
    strength: 0.7,
  };

  const allNodes = [node1, node2];

  const getNode = (id: number) => allNodes.find(n => n.id === id);

  const getConnectionPath = (conn: PatternConnection) => {
    const from = allNodes.find(n => n.id === conn.from)!;
    const to = allNodes.find(n => n.id === conn.to)!;
    const cx = (from.x + to.x) / 2;
    const cy = (from.y + to.y) / 2 - 50;
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
  };

  const makeProps = (overrides: Partial<Parameters<typeof ConnectionLabels>[0]> = {}) => ({
    visibleConnections: [connection],
    filteredNodes: allNodes,
    selectedConnection: null,
    hoveredConnection: null,
    getNode,
    getConnectionPath,
    ...overrides,
  });

  it('renders nothing when no connection is hovered or selected', () => {
    const { container } = render(<ConnectionLabels {...makeProps()} />);
    expect(container.querySelectorAll('g')).toHaveLength(0);
  });

  it('renders a label when the connection is hovered', () => {
    const { container } = render(
      <ConnectionLabels {...makeProps({ hoveredConnection: connection })} />
    );
    const groups = container.querySelectorAll('g');
    expect(groups).toHaveLength(1);
    expect(groups[0].querySelector('text')?.textContent).toBe(LEGEND_LABELS.similar);
  });

  it('renders a label when the connection is selected', () => {
    const { container } = render(
      <ConnectionLabels {...makeProps({ selectedConnection: connection })} />
    );
    expect(container.querySelectorAll('g')).toHaveLength(1);
    expect(container.querySelector('text')?.textContent).toBe(LEGEND_LABELS.similar);
  });

  it('uses the connection type color for the label stroke', () => {
    const { container } = render(
      <ConnectionLabels {...makeProps({ hoveredConnection: connection })} />
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke')).toBe(CONNECTION_COLORS.similar);
  });

  it('positions the label at the control point parsed from the path', () => {
    const { container } = render(
      <ConnectionLabels {...makeProps({ hoveredConnection: connection })} />
    );
    const rect = container.querySelector('rect');
    const cx = 200; // (100 + 300) / 2
    const cy = 100; // (100 + 200) / 2 - 50
    const labelY = cy - 25;
    expect(rect?.getAttribute('x')).toBe(String(cx - 35));
    expect(rect?.getAttribute('y')).toBe(String(labelY - 12));
  });

  it('falls back to the node midpoint when the path has no control point', () => {
    const { container } = render(
      <ConnectionLabels
        {...makeProps({
          hoveredConnection: connection,
          getConnectionPath: () => 'M 100 100 L 300 200',
        })}
      />
    );
    const rect = container.querySelector('rect');
    const cx = 200;
    const cy = 150;
    const labelY = cy - 25;
    expect(rect?.getAttribute('x')).toBe(String(cx - 35));
    expect(rect?.getAttribute('y')).toBe(String(labelY - 12));
  });

  it('renders nothing when an endpoint node is missing', () => {
    const { container } = render(
      <ConnectionLabels {...makeProps({ getNode: () => undefined })} />
    );
    expect(container.querySelectorAll('g')).toHaveLength(0);
  });

  it('renders nothing when an endpoint node is filtered out', () => {
    const { container } = render(
      <ConnectionLabels {...makeProps({ filteredNodes: [node1] })} />
    );
    expect(container.querySelectorAll('g')).toHaveLength(0);
  });

  it('renders labels only for hovered connections among many', () => {
    const conn2: PatternConnection = { from: 2, to: 1, type: 'opposite', strength: 0.9 };
    const { container } = render(
      <ConnectionLabels
        {...makeProps({
          visibleConnections: [connection, conn2],
          hoveredConnection: conn2,
        })}
      />
    );
    const groups = container.querySelectorAll('g');
    expect(groups).toHaveLength(1);
    expect(groups[0].querySelector('text')?.textContent).toBe(LEGEND_LABELS.opposite);
    expect(groups[0].querySelector('rect')?.getAttribute('stroke')).toBe(
      CONNECTION_COLORS.opposite
    );
  });
});
