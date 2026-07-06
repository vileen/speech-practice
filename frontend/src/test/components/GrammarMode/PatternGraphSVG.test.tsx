import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GraphSVG } from '../../../components/GrammarMode/PatternGraphSVG';
import type { PatternNode, PatternConnection } from '../../../components/GrammarMode/PatternGraphTypes';

describe('GraphSVG', () => {
  const mockNodes: PatternNode[] = [
    {
      id: 1,
      pattern: 'てもいい',
      category: 'Permission',
      x: 100,
      y: 100,
      masteryStatus: 'mastered',
      accuracy: 0.85,
      vx: 0,
      vy: 0,
    },
    {
      id: 2,
      pattern: 'なくてもいい',
      category: 'Lack of Obligation',
      x: 300,
      y: 200,
      masteryStatus: 'learning',
      accuracy: 0.65,
      vx: 0,
      vy: 0,
    },
    {
      id: 3,
      pattern: 'なければならない',
      category: 'Obligation',
      x: 500,
      y: 100,
      masteryStatus: 'confused',
      accuracy: 0.35,
      vx: 0,
      vy: 0,
    },
    {
      id: 4,
      pattern: 'UnknownPattern',
      category: 'Test',
      x: 200,
      y: 300,
      masteryStatus: 'unknown',
      accuracy: 0,
      vx: 0,
      vy: 0,
    },
  ];

  const mockConnections: PatternConnection[] = [
    { from: 1, to: 2, type: 'similar', strength: 0.8 },
    { from: 1, to: 3, type: 'opposite', strength: 0.9 },
    { from: 2, to: 3, type: 'related', strength: 0.6 },
  ];

  const mockCategories = [
    { name: 'Permission', x: 100, y: 50 },
    { name: 'Obligation', x: 500, y: 50 },
  ];

  const mockGetNode = vi.fn((id: number) => mockNodes.find(n => n.id === id));
  const mockGetConnectionPath = vi.fn((conn: PatternConnection) => {
    const fromNode = mockNodes.find(n => n.id === conn.from);
    const toNode = mockNodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return '';
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2 - 50;
    return `M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`;
  });

  const mockCallbacks = {
    onWheel: vi.fn(),
    onNodeClick: vi.fn(),
    onNodeMouseDown: vi.fn(),
    onConnectionClick: vi.fn(),
    onNodeMouseEnter: vi.fn(),
    onNodeMouseLeave: vi.fn(),
    onConnectionMouseEnter: vi.fn(),
    onConnectionMouseLeave: vi.fn(),
  };

  const createMockSvgRef = () => ({ current: null as SVGSVGElement | null });
  const createMockContainerRef = () => ({ current: null as HTMLDivElement | null });

  const defaultProps = {
    svgRef: createMockSvgRef(),
    containerRef: createMockContainerRef(),
    dimensions: { width: 800, height: 600 },
    zoom: 1,
    pan: { x: 0, y: 0 },
    isDragging: false,
    filteredNodes: mockNodes,
    visibleConnections: mockConnections,
    selectedNode: null as number | null,
    selectedConnection: null as PatternConnection | null,
    hoveredNode: null as number | null,
    hoveredConnection: null as PatternConnection | null,
    draggedNode: null as number | null,
    categories: mockCategories,
    getNode: mockGetNode,
    getConnectionPath: mockGetConnectionPath,
    ...mockCallbacks,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render an SVG element with correct dimensions', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '800');
      expect(svg).toHaveAttribute('height', '600');
      expect(svg).toHaveAttribute('viewBox', '0 0 800 600');
    });

    it('should render background rect', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const rects = container.querySelectorAll('rect');
      const bgRect = Array.from(rects).find(r => r.getAttribute('fill') === '#0a0e1a');
      expect(bgRect).toBeInTheDocument();
    });

    it('should render grid pattern definition', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const pattern = container.querySelector('pattern#grid');
      expect(pattern).toBeInTheDocument();
    });

    it('should render node gradient definitions', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      expect(container.querySelector('#gradient-mastered')).toBeInTheDocument();
      expect(container.querySelector('#gradient-learning')).toBeInTheDocument();
      expect(container.querySelector('#gradient-confused')).toBeInTheDocument();
      expect(container.querySelector('#gradient-unknown')).toBeInTheDocument();
    });

    it('should render filter definitions', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      expect(container.querySelector('#node-shadow')).toBeInTheDocument();
      expect(container.querySelector('#glow')).toBeInTheDocument();
    });

    it('should render category background labels', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const categoryTexts = container.querySelectorAll('text');
      const categoryLabels = Array.from(categoryTexts).filter(
        t => t.getAttribute('fill') === 'rgba(255,255,255,0.04)'
      );
      expect(categoryLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Node Rendering', () => {
    it('should render all filtered nodes', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const nodeGroups = container.querySelectorAll('.node-group');
      expect(nodeGroups.length).toBe(mockNodes.length);
    });

    it('should render nodes with correct pattern text', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const texts = Array.from(container.querySelectorAll('text')).map(t => t.textContent);
      expect(texts).toContain('てもいい');
      expect(texts).toContain('なくてもいい');
      expect(texts).toContain('なければならない');
    });

    it('should truncate long patterns', () => {
      const longPatternNode: PatternNode = {
        ...mockNodes[0],
        id: 5,
        pattern: 'VeryLongPatternName',
      };
      const { container } = render(
        <GraphSVG {...defaultProps} filteredNodes={[...mockNodes, longPatternNode]} />
      );
      const texts = Array.from(container.querySelectorAll('text')).map(t => t.textContent);
      expect(texts).toContain('VeryLon…');
    });

    it('should render unknown mastery status node', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const nodeGroups = container.querySelectorAll('.node-group');
      expect(nodeGroups.length).toBe(4);
    });
  });

  describe('Connection Rendering', () => {
    it('should render all visible connections', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const connectionGroups = container.querySelectorAll('.connection-group');
      expect(connectionGroups.length).toBe(mockConnections.length);
    });

    it('should not render connections with missing nodes', () => {
      const badConnection: PatternConnection = { from: 999, to: 1, type: 'similar', strength: 0.5 };
      const { container } = render(
        <GraphSVG {...defaultProps} visibleConnections={[...mockConnections, badConnection]} />
      );
      const connectionGroups = container.querySelectorAll('.connection-group');
      expect(connectionGroups.length).toBe(mockConnections.length);
    });

    it('should not render connections for filtered-out nodes', () => {
      const filtered = mockNodes.filter(n => n.id !== 2);
      const { container } = render(
        <GraphSVG {...defaultProps} filteredNodes={filtered} />
      );
      const connectionGroups = container.querySelectorAll('.connection-group');
      // Connection 1->2 and 2->3 should be hidden since node 2 is filtered out
      expect(connectionGroups.length).toBeLessThan(mockConnections.length);
    });
  });

  describe('Node Interactions', () => {
    it('should call onNodeClick when a node is clicked', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const firstNode = container.querySelector('.node-group');
      expect(firstNode).toBeInTheDocument();
      
      fireEvent.click(firstNode!);
      expect(mockCallbacks.onNodeClick).toHaveBeenCalledWith(1);
    });

    it('should call onNodeMouseDown when mouse down on a node', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const firstNode = container.querySelector('.node-group');
      
      fireEvent.mouseDown(firstNode!);
      expect(mockCallbacks.onNodeMouseDown).toHaveBeenCalled();
    });

    it('should call onNodeMouseEnter when hovering over a node', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const firstNode = container.querySelector('.node-group');
      
      fireEvent.mouseEnter(firstNode!);
      expect(mockCallbacks.onNodeMouseEnter).toHaveBeenCalledWith(1);
    });

    it('should call onNodeMouseLeave when leaving a node', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const firstNode = container.querySelector('.node-group');
      
      fireEvent.mouseLeave(firstNode!);
      expect(mockCallbacks.onNodeMouseLeave).toHaveBeenCalled();
    });
  });

  describe('Connection Interactions', () => {
    it('should call onConnectionClick when a connection is clicked', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const connectionLine = container.querySelector('.connection-line');
      expect(connectionLine).toBeInTheDocument();
      
      fireEvent.click(connectionLine!);
      expect(mockCallbacks.onConnectionClick).toHaveBeenCalledWith(mockConnections[0]);
    });

    it('should call onConnectionMouseEnter when hovering over a connection', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const connectionLine = container.querySelector('.connection-line');
      
      fireEvent.mouseEnter(connectionLine!);
      expect(mockCallbacks.onConnectionMouseEnter).toHaveBeenCalledWith(mockConnections[0]);
    });

    it('should call onConnectionMouseLeave when leaving a connection', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const connectionLine = container.querySelector('.connection-line');
      
      fireEvent.mouseLeave(connectionLine!);
      expect(mockCallbacks.onConnectionMouseLeave).toHaveBeenCalled();
    });

    it('should render invisible hit area for connections', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const paths = container.querySelectorAll('path');
      const invisibleHitAreas = Array.from(paths).filter(
        p => p.getAttribute('stroke') === 'transparent' && p.getAttribute('stroke-width') === '20'
      );
      expect(invisibleHitAreas.length).toBe(mockConnections.length);
    });
  });

  describe('Selected State', () => {
    it('should render selected node with glow effect', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} selectedNode={1} />
      );
      const selectedNode = container.querySelector('.node-group.selected');
      expect(selectedNode).toBeInTheDocument();
    });

    it('should render selected connection with thicker stroke', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} selectedConnection={mockConnections[0]} />
      );
      const selectedConnection = container.querySelector('.connection-line');
      expect(selectedConnection).toBeInTheDocument();
      // Selected connections have strokeWidth of 5
      expect(selectedConnection).toHaveAttribute('stroke-width', '5');
    });
  });

  describe('Hover State', () => {
    it('should render hovered node with hover class', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} hoveredNode={1} />
      );
      const hoveredNode = container.querySelector('.node-group.hovered');
      expect(hoveredNode).toBeInTheDocument();
    });

    it('should render connection label on hover', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} hoveredConnection={mockConnections[0]} />
      );
      // Connection labels should appear when hovered
      const labels = container.querySelectorAll('text');
      const labelTexts = Array.from(labels).map(t => t.textContent);
      expect(labelTexts).toContain('Similar');
    });

    it('should render node tooltip on hover', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} hoveredNode={1} />
      );
      const tooltipRect = container.querySelector('rect[fill="#1a1a2e"][stroke="#2ed573"]');
      expect(tooltipRect).toBeInTheDocument();
    });

    it('should show accuracy in tooltip', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} hoveredNode={1} />
      );
      const texts = Array.from(container.querySelectorAll('text')).map(t => t.textContent);
      expect(texts.some(t => t?.includes('Accuracy:'))).toBe(true);
      expect(texts.some(t => t?.includes('85%'))).toBe(true);
    });
  });

  describe('Drag State', () => {
    it('should show grabbing cursor when dragging', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} isDragging={true} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({ cursor: 'grabbing' });
    });

    it('should show grab cursor when not dragging', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({ cursor: 'grab' });
    });

    it('should show grabbing cursor on dragged node', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} draggedNode={1} />
      );
      const draggedNode = container.querySelector('.node-group');
      expect(draggedNode).toHaveStyle({ cursor: 'grabbing' });
    });
  });

  describe('Wheel Event', () => {
    it('should call onWheel when wheel event fires on SVG', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const svg = container.querySelector('svg');
      
      fireEvent.wheel(svg!, { deltaY: 100 });
      expect(mockCallbacks.onWheel).toHaveBeenCalled();
    });
  });

  describe('Zoom and Pan Transform', () => {
    it('should apply zoom transform correctly', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} zoom={1.5} pan={{ x: 100, y: 50 }} />
      );
      const g = container.querySelector('g[transform]');
      expect(g).toHaveAttribute('transform', 'translate(100, 50) scale(1.5)');
    });

    it('should apply default zoom/pan transform', () => {
      const { container } = render(<GraphSVG {...defaultProps} />);
      const g = container.querySelector('g[transform]');
      expect(g).toHaveAttribute('transform', 'translate(0, 0) scale(1)');
    });
  });

  describe('Empty State', () => {
    it('should render empty SVG when no nodes provided', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} filteredNodes={[]} visibleConnections={[]} />
      );
      const nodeGroups = container.querySelectorAll('.node-group');
      expect(nodeGroups.length).toBe(0);
    });

    it('should render empty SVG when no connections provided', () => {
      const { container } = render(
        <GraphSVG {...defaultProps} visibleConnections={[]} />
      );
      const connectionGroups = container.querySelectorAll('.connection-group');
      expect(connectionGroups.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle node with exact 8 character pattern', () => {
      const exactLengthNode: PatternNode = {
        ...mockNodes[0],
        id: 5,
        pattern: 'exactly8',
      };
      const { container } = render(
        <GraphSVG {...defaultProps} filteredNodes={[...mockNodes, exactLengthNode]} />
      );
      const texts = Array.from(container.querySelectorAll('text')).map(t => t.textContent);
      expect(texts).toContain('exactly8');
    });

    it('should handle node with 9+ character pattern (truncated)', () => {
      const longNode: PatternNode = {
        ...mockNodes[0],
        id: 5,
        pattern: 'ninechars',
      };
      const { container } = render(
        <GraphSVG {...defaultProps} filteredNodes={[...mockNodes, longNode]} />
      );
      const texts = Array.from(container.querySelectorAll('text')).map(t => t.textContent);
      expect(texts).toContain('ninecha…');
    });

    it('should handle connection with curved path', () => {
      mockGetConnectionPath.mockReturnValueOnce('M 100 100 Q 200 50 300 200');
      const { container } = render(<GraphSVG {...defaultProps} />);
      const connectionLine = container.querySelector('.connection-line');
      expect(connectionLine).toHaveAttribute('d', 'M 100 100 Q 200 50 300 200');
    });

    it('should handle connection label with quadratic bezier midpoint', () => {
      mockGetConnectionPath.mockReturnValueOnce('M 100 100 Q 200 50 300 200');
      const { container } = render(
        <GraphSVG {...defaultProps} hoveredConnection={mockConnections[0]} />
      );
      const labels = container.querySelectorAll('text');
      const labelTexts = Array.from(labels).map(t => t.textContent);
      expect(labelTexts).toContain('Similar');
    });
  });
});
