import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GraphNodes } from '../../../components/GrammarMode/GraphNodes';
import type { PatternNode } from '../../../components/GrammarMode/PatternGraphTypes';
import { NODE_COLORS } from '../../../components/GrammarMode/PatternGraphTypes';

describe('GraphNodes', () => {
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

  const node1 = makeNode();
  const node2 = makeNode({
    id: 2,
    pattern: 'なければなりません',
    category: 'Lack of Obligation',
    x: 300,
    y: 400,
    masteryStatus: 'learning',
    accuracy: 0.55,
  });

  const makeProps = (overrides: Partial<Parameters<typeof GraphNodes>[0]> = {}) => ({
    filteredNodes: [node1, node2],
    selectedNode: null,
    hoveredNode: null,
    draggedNode: null,
    onNodeClick: vi.fn(),
    onNodeMouseDown: vi.fn(),
    onNodeMouseEnter: vi.fn(),
    onNodeMouseLeave: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders one node group per filtered node with correct transform', () => {
    const { container } = render(<GraphNodes {...makeProps()} />);
    const groups = container.querySelectorAll('g.node-group');
    expect(groups).toHaveLength(2);
    expect(groups[0].getAttribute('transform')).toBe('translate(100, 200)');
    expect(groups[1].getAttribute('transform')).toBe('translate(300, 400)');
  });

  it('renders pattern and category text for each node', () => {
    const { container } = render(<GraphNodes {...makeProps()} />);
    const texts = container.querySelectorAll('text');
    const content = Array.from(texts).map(t => t.textContent);
    expect(content).toContain('てもいい');
    expect(content).toContain('Permission');
    expect(content).toContain('なければなりません'.slice(0, 7) + '…');
    expect(content).toContain('Lack of Ob');
  });

  it('truncates patterns longer than 8 characters', () => {
    const { container } = render(<GraphNodes {...makeProps()} />);
    const texts = Array.from(container.querySelectorAll('text')).map(t => t.textContent);
    expect(texts).toContain('なければなりません'.slice(0, 7) + '…');
    expect(texts).not.toContain('なければなりません');
  });

  it('slices categories to 10 characters', () => {
    const longCategoryNode = makeNode({ id: 3, category: 'Very Long Category Name' });
    const { container } = render(
      <GraphNodes {...makeProps({ filteredNodes: [longCategoryNode] })} />
    );
    const texts = Array.from(container.querySelectorAll('text')).map(t => t.textContent);
    expect(texts).toContain('Very Long ');
    expect(texts).not.toContain('Very Long Category Name');
  });

  it('applies selected class and white stroke only to the selected node', () => {
    const { container } = render(<GraphNodes {...makeProps({ selectedNode: 1 })} />);
    const groups = container.querySelectorAll('g.node-group');
    expect(groups[0].classList.contains('selected')).toBe(true);
    expect(groups[1].classList.contains('selected')).toBe(false);

    const selectedCircle = groups[0].querySelector('circle.node-circle');
    expect(selectedCircle?.getAttribute('stroke')).toBe('#fff');
    expect(selectedCircle?.getAttribute('stroke-width')).toBe('3');

    const otherCircle = groups[1].querySelector('circle.node-circle');
    expect(otherCircle?.getAttribute('stroke')).toBe('transparent');
  });

  it('renders outer glow circle for selected node', () => {
    const { container } = render(<GraphNodes {...makeProps({ selectedNode: 1 })} />);
    const groups = container.querySelectorAll('g.node-group');
    // selected node: glow circle (r=38) + node circle (r=30)
    expect(groups[0].querySelectorAll('circle')).toHaveLength(2);
    expect(groups[1].querySelectorAll('circle')).toHaveLength(1);
  });

  it('applies hovered class and enlarges node circle on hover', () => {
    const { container } = render(<GraphNodes {...makeProps({ hoveredNode: 2 })} />);
    const groups = container.querySelectorAll('g.node-group');
    expect(groups[1].classList.contains('hovered')).toBe(true);
    expect(groups[0].classList.contains('hovered')).toBe(false);

    const hoveredCircle = groups[1].querySelector('circle.node-circle');
    expect(hoveredCircle?.getAttribute('r')).toBe('35'); // BASE_RADIUS + 5
    expect(hoveredCircle?.getAttribute('stroke')).toBe(NODE_COLORS.learning);
  });

  it('renders hover glow circle for hovered node', () => {
    const { container } = render(<GraphNodes {...makeProps({ hoveredNode: 2 })} />);
    const groups = container.querySelectorAll('g.node-group');
    // hovered node: hover glow (r=42) + node circle (r=35)
    expect(groups[1].querySelectorAll('circle')).toHaveLength(2);
    expect(groups[0].querySelectorAll('circle')).toHaveLength(1);
  });

  it('calls onNodeClick with node id when a node is clicked', () => {
    const props = makeProps();
    const { container } = render(<GraphNodes {...props} />);
    const groups = container.querySelectorAll('g.node-group');
    fireEvent.click(groups[1]);
    expect(props.onNodeClick).toHaveBeenCalledTimes(1);
    expect(props.onNodeClick).toHaveBeenCalledWith(2);
  });

  it('calls onNodeMouseDown with event, id, and coordinates', () => {
    const props = makeProps();
    const { container } = render(<GraphNodes {...props} />);
    const groups = container.querySelectorAll('g.node-group');
    fireEvent.mouseDown(groups[0]);
    expect(props.onNodeMouseDown).toHaveBeenCalledTimes(1);
    const [event, id, x, y] = props.onNodeMouseDown.mock.calls[0];
    expect(event.type).toBe('mousedown');
    expect(event.nativeEvent).toBeInstanceOf(MouseEvent);
    expect(id).toBe(1);
    expect(x).toBe(100);
    expect(y).toBe(200);
  });

  it('calls onNodeMouseEnter with node id on mouse enter', () => {
    const props = makeProps();
    const { container } = render(<GraphNodes {...props} />);
    const groups = container.querySelectorAll('g.node-group');
    fireEvent.mouseEnter(groups[1]);
    expect(props.onNodeMouseEnter).toHaveBeenCalledWith(2);
  });

  it('calls onNodeMouseLeave on mouse leave', () => {
    const props = makeProps();
    const { container } = render(<GraphNodes {...props} />);
    const groups = container.querySelectorAll('g.node-group');
    fireEvent.mouseLeave(groups[0]);
    expect(props.onNodeMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('uses grabbing cursor for the dragged node and pointer otherwise', () => {
    const { container } = render(<GraphNodes {...makeProps({ draggedNode: 1 })} />);
    const groups = container.querySelectorAll('g.node-group');
    expect(groups[0].style.cursor).toBe('grabbing');
    expect(groups[1].style.cursor).toBe('pointer');
  });

  it('renders nothing when filteredNodes is empty', () => {
    const { container } = render(<GraphNodes {...makeProps({ filteredNodes: [] })} />);
    expect(container.querySelectorAll('g.node-group')).toHaveLength(0);
  });

  it('fills node circle with the mastery-status gradient', () => {
    const { container } = render(<GraphNodes {...makeProps()} />);
    const groups = container.querySelectorAll('g.node-group');
    expect(groups[0].querySelector('circle.node-circle')?.getAttribute('fill')).toBe(
      'url(#gradient-mastered)'
    );
    expect(groups[1].querySelector('circle.node-circle')?.getAttribute('fill')).toBe(
      'url(#gradient-learning)'
    );
  });
});
