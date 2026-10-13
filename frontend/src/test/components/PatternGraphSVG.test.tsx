import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GraphSVG } from '../../components/GrammarMode/PatternGraphSVG';
import type { PatternNode, PatternConnection } from '../../components/GrammarMode/PatternGraphTypes';
import { CONNECTION_COLORS, NODE_COLORS } from '../../components/GrammarMode/PatternGraphTypes';

describe('GraphSVG', () => {
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
    category: 'Lack of Obligation',
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

  const makeGetNode = (nodes: PatternNode[]) => (id: number) =>
    nodes.find(n => n.id === id);

  const makeGetConnectionPath = () => (conn: PatternConnection) => {
    const from = allNodes.find(n => n.id === conn.from)!;
    const to = allNodes.find(n => n.id === conn.to)!;
    const cx = (from.x + to.x) / 2;
    const cy = (from.y + to.y) / 2 - 50;
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
  };

  const makeProps = (overrides: Partial<Parameters<typeof GraphSVG>[0]> = {}) => ({
    svgRef: { current: null } as React.Ref<SVGSVGElement>,
    containerRef: { current: null },
    dimensions: { width: 800, height: 600 },
    zoom: 1,
    pan: { x: 0, y: 0 },
    isDragging: false,
    filteredNodes: allNodes,
    visibleConnections: [connection],
    selectedNode: null,
    selectedConnection: null,
    hoveredNode: null,
    hoveredConnection: null,
    draggedNode: null,
    categories: [{ name: 'Basics', x: 400, y: 300 }],
    onWheel: vi.fn(),
    onNodeClick: vi.fn(),
    onNodeMouseDown: vi.fn(),
    onConnectionClick: vi.fn(),
    onNodeMouseEnter: vi.fn(),
    onNodeMouseLeave: vi.fn(),
    onConnectionMouseEnter: vi.fn(),
    onConnectionMouseLeave: vi.fn(),
    getNode: makeGetNode(allNodes),
    getConnectionPath: makeGetConnectionPath(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an svg with the given dimensions and viewBox', () => {
    const { container } = render(<GraphSVG {...makeProps()} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '600');
    expect(svg).toHaveAttribute('viewBox', '0 0 800 600');
  });

  it('uses grabbing cursor while dragging and grab otherwise', () => {
    const { container, rerender } = render(<GraphSVG {...makeProps()} />);
    expect(container.querySelector('svg')).toHaveStyle({ cursor: 'grab' });

    rerender(<GraphSVG {...makeProps({ isDragging: true })} />);
    expect(container.querySelector('svg')).toHaveStyle({ cursor: 'grabbing' });
  });

  it('renders category background labels', () => {
    const { container } = render(<GraphSVG {...makeProps()} />);
    const labels = container.querySelectorAll('text');
    const categoryLabel = Array.from(labels).find(t => t.textContent === 'Basics');
    expect(categoryLabel).toBeDefined();
    expect(categoryLabel).toHaveAttribute('fill', 'rgba(255,255,255,0.04)');
  });

  it('renders every filtered node with its pattern and category text', () => {
    const { container } = render(<GraphSVG {...makeProps()} />);
    const nodeGroups = container.querySelectorAll('.node-group');
    expect(nodeGroups).toHaveLength(2);
    expect(container.querySelectorAll('.node-circle')).toHaveLength(2);
    expect(nodeGroups[0].textContent).toContain('てもいい');
    expect(nodeGroups[0].textContent).toContain('Permission');
  });

  it('truncates long pattern and category text on nodes but not in tooltips', () => {
    const { container } = render(
      <GraphSVG {...makeProps({ hoveredNode: 2 })} />
    );
    // Node label: pattern > 8 chars -> first 7 chars + ellipsis
    expect(container.querySelectorAll('.node-group')[1].textContent).toContain(
      'なければなりま…'
    );
    // Node label: category sliced to 10 chars
    expect(container.querySelectorAll('.node-group')[1].textContent).toContain(
      'Lack of Ob'
    );
    // Tooltip shows full pattern and category
    expect(container.textContent).toContain('なければなりません');
    expect(container.textContent).toContain('Lack of Obligation');
  });

  it('uses mastery-based gradient fill for node circles', () => {
    const { container } = render(<GraphSVG {...makeProps()} />);
    const circles = container.querySelectorAll('.node-circle');
    expect(circles[0]).toHaveAttribute('fill', 'url(#gradient-mastered)');
    expect(circles[1]).toHaveAttribute('fill', 'url(#gradient-learning)');
  });

  it('calls onNodeClick with node id when a node is clicked', () => {
    const props = makeProps();
    const { container } = render(<GraphSVG {...props} />);
    fireEvent.click(container.querySelectorAll('.node-group')[0]);
    expect(props.onNodeClick).toHaveBeenCalledWith(1);
  });

  it('calls onNodeMouseDown with event, id, and node coordinates', () => {
    const props = makeProps();
    const { container } = render(<GraphSVG {...props} />);
    fireEvent(container.querySelectorAll('.node-group')[1], new MouseEvent('mousedown', { bubbles: true }));
    expect(props.onNodeMouseDown).toHaveBeenCalledTimes(1);
    const [event, nodeId, x, y] = props.onNodeMouseDown.mock.calls[0];
    expect(event.type).toBe('mousedown');
    expect(nodeId).toBe(2);
    expect(x).toBe(300);
    expect(y).toBe(200);
  });

  it('calls hover handlers when entering and leaving a node', () => {
    const props = makeProps();
    const { container } = render(<GraphSVG {...props} />);
    const nodeGroup = container.querySelectorAll('.node-group')[0];

    fireEvent.mouseEnter(nodeGroup);
    expect(props.onNodeMouseEnter).toHaveBeenCalledWith(1);

    fireEvent.mouseLeave(nodeGroup);
    expect(props.onNodeMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('shows a selected node with a white stroke and glow ring', () => {
    const { container } = render(<GraphSVG {...makeProps({ selectedNode: 1 })} />);
    const nodeGroup = container.querySelectorAll('.node-group')[0];
    expect(nodeGroup.classList.contains('selected')).toBe(true);

    const circle = nodeGroup.querySelector('.node-circle');
    expect(circle).toHaveAttribute('stroke', '#fff');
    expect(circle).toHaveAttribute('stroke-width', '3');

    // Glow ring uses the mastery color with glow filter
    const glowRing = Array.from(nodeGroup.querySelectorAll('circle')).find(c =>
      c.getAttribute('filter') === 'url(#glow)'
    );
    expect(glowRing).toHaveAttribute('stroke', NODE_COLORS.mastered);
  });

  it('enlarges a hovered node and adds a hover ring', () => {
    const { container } = render(<GraphSVG {...makeProps({ hoveredNode: 1 })} />);
    const nodeGroup = container.querySelectorAll('.node-group')[0];
    expect(nodeGroup.classList.contains('hovered')).toBe(true);

    // Base radius 30, hovered = 35
    const circle = nodeGroup.querySelector('.node-circle');
    expect(circle).toHaveAttribute('r', '35');
    expect(circle).toHaveAttribute('stroke', NODE_COLORS.mastered);
  });

  it('shows a tooltip with full pattern, category and accuracy when a node is hovered', () => {
    const { container } = render(<GraphSVG {...makeProps({ hoveredNode: 1 })} />);
    const tooltip = Array.from(container.querySelectorAll('g')).find(g =>
      g.textContent?.includes('Accuracy: 85%')
    );
    expect(tooltip).toBeDefined();
    expect(tooltip!.textContent).toContain('てもいい');
    expect(tooltip!.textContent).toContain('Permission');
    expect(tooltip!.textContent).toContain('Accuracy: 85%');
  });

  it('does not render a tooltip for non-hovered nodes', () => {
    const { container } = render(<GraphSVG {...makeProps()} />);
    expect(container.textContent).not.toContain('Accuracy:');
  });

  it('renders connections with the type color and default stroke width', () => {
    const { container } = render(<GraphSVG {...makeProps()} />);
    const line = container.querySelector('.connection-line');
    expect(line).not.toBeNull();
    expect(line).toHaveAttribute('stroke', CONNECTION_COLORS.similar);
    expect(line).toHaveAttribute('stroke-width', '2');
    expect(line).toHaveAttribute('stroke-opacity', '0.6');
  });

  it('renders an invisible wide hit area for each connection', () => {
    const { container } = render(<GraphSVG {...makeProps()} />);
    const group = container.querySelector('.connection-group');
    const hitArea = Array.from(group!.querySelectorAll('path')).find(
      p => p.getAttribute('stroke') === 'transparent'
    );
    expect(hitArea).toBeDefined();
    expect(hitArea).toHaveAttribute('stroke-width', '20');
  });

  it('thickens and highlights the connection when selected or hovered', () => {
    const { container, rerender } = render(
      <GraphSVG {...makeProps({ selectedConnection: connection })} />
    );
    let line = container.querySelector('.connection-line');
    expect(line).toHaveAttribute('stroke-width', '5');
    expect(line).toHaveAttribute('stroke-opacity', '1');

    rerender(<GraphSVG {...makeProps({ hoveredConnection: connection })} />);
    line = container.querySelector('.connection-line');
    expect(line).toHaveAttribute('stroke-width', '4');
    expect(line).toHaveAttribute('stroke-opacity', '0.9');
  });

  it('calls connection click and hover handlers', () => {
    const props = makeProps();
    const { container } = render(<GraphSVG {...props} />);
    const line = container.querySelector('.connection-line')!;

    fireEvent.click(line);
    expect(props.onConnectionClick).toHaveBeenCalledWith(connection);

    fireEvent.mouseEnter(line);
    expect(props.onConnectionMouseEnter).toHaveBeenCalledWith(connection);

    fireEvent.mouseLeave(line);
    expect(props.onConnectionMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('shows the connection label only when hovered or selected', () => {
    const { container, rerender } = render(<GraphSVG {...makeProps()} />);
    expect(container.textContent).not.toContain('Similar');

    rerender(<GraphSVG {...makeProps({ hoveredConnection: connection })} />);
    expect(container.textContent).toContain('Similar');

    rerender(<GraphSVG {...makeProps({ selectedConnection: connection })} />);
    expect(container.textContent).toContain('Similar');
  });

  it('skips connections whose endpoints are missing from filteredNodes', () => {
    const { container } = render(
      <GraphSVG {...makeProps({ filteredNodes: [node1] })} />
    );
    expect(container.querySelectorAll('.connection-group')).toHaveLength(0);
  });

  it('skips connections when getNode cannot resolve an endpoint', () => {
    const { container } = render(
      <GraphSVG {...makeProps({ getNode: () => undefined })} />
    );
    expect(container.querySelectorAll('.connection-group')).toHaveLength(0);
  });

  it('applies the zoom/pan transform to the content group', () => {
    const { container } = render(
      <GraphSVG {...makeProps({ zoom: 2, pan: { x: 50, y: -20 } })} />
    );
    const group = container.querySelector('g[transform]');
    expect(group).toHaveAttribute('transform', 'translate(50, -20) scale(2)');
  });

  it('forwards wheel events to onWheel', () => {
    const props = makeProps();
    const { container } = render(<GraphSVG {...props} />);
    fireEvent.wheel(container.querySelector('svg')!);
    expect(props.onWheel).toHaveBeenCalledTimes(1);
  });

  it('uses grabbing cursor on the node currently being dragged', () => {
    const { container } = render(<GraphSVG {...makeProps({ draggedNode: 1 })} />);
    const nodeGroups = container.querySelectorAll('.node-group');
    expect(nodeGroups[0]).toHaveStyle({ cursor: 'grabbing' });
    expect(nodeGroups[1]).toHaveStyle({ cursor: 'pointer' });
  });

  it('renders gradient defs for all mastery statuses', () => {
    const { container } = render(<GraphSVG {...makeProps()} />);
    for (const status of ['mastered', 'learning', 'confused', 'unknown']) {
      expect(container.querySelector(`#gradient-${status}`)).not.toBeNull();
    }
  });
});
