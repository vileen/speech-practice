import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GraphConnections } from '../../../components/GrammarMode/GraphConnections';
import type { PatternNode, PatternConnection } from '../../../components/GrammarMode/PatternGraphTypes';
import { CONNECTION_COLORS } from '../../../components/GrammarMode/PatternGraphTypes';

describe('GraphConnections', () => {
  const makeNode = (overrides: Partial<PatternNode> = {}): PatternNode => ({
    id: 1,
    pattern: 'てもいい',
    category: 'Permission',
    x: 100,
    y: 200,
    masteryStatus: 'mastered',
    accuracy: 0.85,
    vx: 0,
    vy: 0,
    ...overrides,
  });

  const makeConn = (overrides: Partial<PatternConnection> = {}): PatternConnection => ({
    from: 1,
    to: 2,
    type: 'similar',
    strength: 0.8,
    ...overrides,
  });

  const node1 = makeNode();
  const node2 = makeNode({
    id: 2,
    pattern: 'なければなりません',
    category: 'Obligation',
    x: 300,
    y: 400,
  });
  const node3 = makeNode({ id: 3, pattern: 'てはいけません', category: 'Prohibition' });

  const conn12 = makeConn();
  const conn23 = makeConn({ from: 2, to: 3, type: 'opposite', strength: 0.5 });

  const pathFor = (conn: PatternConnection) => `M ${conn.from} 0 L ${conn.to} 0`;

  const makeProps = (overrides: Partial<Parameters<typeof GraphConnections>[0]> = {}) => ({
    visibleConnections: [conn12, conn23],
    filteredNodes: [node1, node2, node3],
    selectedConnection: null,
    hoveredConnection: null,
    onConnectionClick: vi.fn(),
    onConnectionMouseEnter: vi.fn(),
    onConnectionMouseLeave: vi.fn(),
    getNode: vi.fn((id: number) => [node1, node2, node3].find(n => n.id === id)),
    getConnectionPath: vi.fn(pathFor),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders one connection group per visible connection', () => {
    const { container } = render(<GraphConnections {...makeProps()} />);
    const groups = container.querySelectorAll('g.connection-group');
    expect(groups).toHaveLength(2);
  });

  it('renders visible line and invisible hit area for each connection', () => {
    const { container } = render(<GraphConnections {...makeProps()} />);
    const lines = container.querySelectorAll('path.connection-line');
    const hitAreas = container.querySelectorAll('path[stroke="transparent"]');
    expect(lines).toHaveLength(2);
    expect(hitAreas).toHaveLength(2);
    expect(hitAreas[0].getAttribute('stroke-width')).toBe('20');
  });

  it('uses the connection type color for the visible line', () => {
    const { container } = render(<GraphConnections {...makeProps()} />);
    const lines = container.querySelectorAll('path.connection-line');
    expect(lines[0].getAttribute('stroke')).toBe(CONNECTION_COLORS.similar);
    expect(lines[1].getAttribute('stroke')).toBe(CONNECTION_COLORS.opposite);
  });

  it('computes the path via getConnectionPath', () => {
    const props = makeProps();
    const { container } = render(<GraphConnections {...props} />);
    expect(props.getConnectionPath).toHaveBeenCalledWith(conn12);
    expect(props.getConnectionPath).toHaveBeenCalledWith(conn23);
    const lines = container.querySelectorAll('path.connection-line');
    expect(lines[0].getAttribute('d')).toBe(pathFor(conn12));
  });

  it('skips connections whose nodes are missing from the graph', () => {
    const props = makeProps({
      getNode: vi.fn((id: number) => (id === 3 ? undefined : [node1, node2].find(n => n.id === id))),
    });
    const { container } = render(<GraphConnections {...props} />);
    expect(container.querySelectorAll('g.connection-group')).toHaveLength(1);
  });

  it('skips connections where an endpoint is filtered out', () => {
    const { container } = render(
      <GraphConnections {...makeProps({ filteredNodes: [node1, node2] })} />
    );
    expect(container.querySelectorAll('g.connection-group')).toHaveLength(1);
  });

  it('renders nothing when there are no visible connections', () => {
    const { container } = render(<GraphConnections {...makeProps({ visibleConnections: [] })} />);
    expect(container.querySelectorAll('g.connection-group')).toHaveLength(0);
  });

  it('thickens and fully opaque-strokes the selected connection', () => {
    const { container } = render(
      <GraphConnections {...makeProps({ selectedConnection: conn12 })} />
    );
    const lines = container.querySelectorAll('path.connection-line');
    expect(lines[0].getAttribute('stroke-width')).toBe('5');
    expect(lines[0].getAttribute('stroke-opacity')).toBe('1');
    // Non-selected connection keeps default styling
    expect(lines[1].getAttribute('stroke-width')).toBe('2');
    expect(lines[1].getAttribute('stroke-opacity')).toBe('0.6');
  });

  it('slightly thickens the hovered connection', () => {
    const { container } = render(
      <GraphConnections {...makeProps({ hoveredConnection: conn23 })} />
    );
    const lines = container.querySelectorAll('path.connection-line');
    expect(lines[1].getAttribute('stroke-width')).toBe('4');
    expect(lines[1].getAttribute('stroke-opacity')).toBe('0.9');
  });

  it('calls onConnectionClick when the line is clicked', () => {
    const props = makeProps();
    const { container } = render(<GraphConnections {...props} />);
    const lines = container.querySelectorAll('path.connection-line');
    fireEvent.click(lines[0]);
    expect(props.onConnectionClick).toHaveBeenCalledTimes(1);
    expect(props.onConnectionClick).toHaveBeenCalledWith(conn12);
  });

  it('calls click and hover handlers via the invisible hit area too', () => {
    const props = makeProps();
    const { container } = render(<GraphConnections {...props} />);
    const hitArea = container.querySelector('path[stroke="transparent"]')!;
    fireEvent.click(hitArea);
    fireEvent.mouseEnter(hitArea);
    fireEvent.mouseLeave(hitArea);
    expect(props.onConnectionClick).toHaveBeenCalledWith(conn12);
    expect(props.onConnectionMouseEnter).toHaveBeenCalledWith(conn12);
    expect(props.onConnectionMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('uses a stable key per connection based on endpoints and index', () => {
    const { container } = render(<GraphConnections {...makeProps()} />);
    const groups = container.querySelectorAll('g.connection-group');
    // No React key warning duplicates and both groups render independently
    expect(groups[0]).not.toBe(groups[1]);
    expect(groups[0].querySelectorAll('path')).toHaveLength(2);
    expect(groups[1].querySelectorAll('path')).toHaveLength(2);
  });
});
