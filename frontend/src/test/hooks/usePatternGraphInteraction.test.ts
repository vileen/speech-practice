import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePatternGraphInteraction } from '../../hooks/usePatternGraphInteraction';
import type { PatternNode, PatternConnection } from '../../components/GrammarMode/PatternGraphTypes';
import type { GrammarPattern } from '../../components/GrammarMode/types';

const makePattern = (id: number, pattern = `pattern-${id}`): GrammarPattern => ({
  id,
  pattern,
  category: 'verbs',
  jlpt_level: 'N5',
  formation_rules: [],
  examples: [],
  common_mistakes: [],
});

const makeNode = (id: number, x = 0, y = 0): PatternNode => ({
  id,
  pattern: `pattern-${id}`,
  category: 'verbs',
  x,
  y,
  masteryStatus: 'unknown',
  accuracy: 0,
  vx: 0,
  vy: 0,
});

const makeConnection = (from: number, to: number): PatternConnection => ({
  from,
  to,
  type: 'similar',
  strength: 0.8,
});

const makeSvgRef = () => {
  const svgEl = {
    getBoundingClientRect: () => ({ left: 100, top: 50, width: 800, height: 600 }),
  } as unknown as SVGSVGElement;
  return { current: svgEl } as React.RefObject<SVGSVGElement | null>;
};

const makeMouseEvent = (overrides: Partial<React.MouseEvent> = {}) =>
  ({
    clientX: 0,
    clientY: 0,
    target: null,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
    ...overrides,
  }) as unknown as React.MouseEvent;

const setup = (overrides: Partial<Parameters<typeof usePatternGraphInteraction>[0]> = {}) => {
  const svgRef = makeSvgRef();
  const grammarPatterns = [makePattern(1), makePattern(2)];
  const filteredNodes = [makeNode(1, 100, 100), makeNode(2, 300, 100)];
  const onSelectPattern = vi.fn();
  const onComparePatterns = vi.fn();
  const hook = renderHook(() =>
    usePatternGraphInteraction({
      svgRef,
      grammarPatterns,
      filteredNodes,
      onSelectPattern,
      onComparePatterns,
      ...overrides,
    }),
  );
  return { svgRef, grammarPatterns, filteredNodes, onSelectPattern, onComparePatterns, ...hook };
};

describe('usePatternGraphInteraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('starts with no selection, default zoom/pan, and not dragging', () => {
      const { result } = setup();

      expect(result.current.selectedNode).toBeNull();
      expect(result.current.selectedConnection).toBeNull();
      expect(result.current.hoveredNode).toBeNull();
      expect(result.current.hoveredConnection).toBeNull();
      expect(result.current.zoom).toBe(1);
      expect(result.current.pan).toEqual({ x: 0, y: 0 });
      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedNode).toBeNull();
    });
  });

  describe('Node Selection', () => {
    it('selects node, clears connection selection, and calls onSelectPattern', () => {
      const { result, onSelectPattern } = setup();

      act(() => result.current.handleConnectionClick(makeConnection(1, 2)));
      expect(result.current.selectedConnection).not.toBeNull();

      act(() => result.current.handleNodeClick(1));

      expect(result.current.selectedNode).toBe(1);
      expect(result.current.selectedConnection).toBeNull();
      expect(onSelectPattern).toHaveBeenCalledTimes(1);
      expect(onSelectPattern).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it('does not call onSelectPattern when node id has no matching pattern', () => {
      const { result, onSelectPattern } = setup();

      act(() => result.current.handleNodeClick(999));

      expect(result.current.selectedNode).toBe(999);
      expect(onSelectPattern).not.toHaveBeenCalled();
    });

    it('ignores click immediately after a node drag', () => {
      const { result, onSelectPattern } = setup();

      // Simulate a node drag that crosses the drag threshold
      act(() => result.current.handleNodeMouseDown(makeMouseEvent({ clientX: 200, clientY: 150 }), 1, 100, 100));
      act(() =>
        result.current.handleNodeMouseMove(
          makeMouseEvent({ clientX: 220, clientY: 170 }), // 20px move > 5px threshold
          vi.fn(),
        ),
      );

      // Click right after dragging should be swallowed
      act(() => result.current.handleNodeClick(1));

      expect(onSelectPattern).not.toHaveBeenCalled();

      // Next click (no preceding drag) works again
      act(() => result.current.handleNodeClick(1));
      expect(onSelectPattern).toHaveBeenCalledTimes(1);
    });
  });

  describe('Connection Selection', () => {
    it('selects connection, clears node selection, and calls onComparePatterns with both patterns', () => {
      const { result, onSelectPattern, onComparePatterns } = setup();

      act(() => result.current.handleNodeClick(1));
      expect(result.current.selectedNode).toBe(1);

      const conn = makeConnection(1, 2);
      act(() => result.current.handleConnectionClick(conn));

      expect(result.current.selectedConnection).toEqual(conn);
      expect(result.current.selectedNode).toBeNull();
      expect(onSelectPattern).toHaveBeenCalledTimes(1);
      expect(onComparePatterns).toHaveBeenCalledTimes(1);
      expect(onComparePatterns).toHaveBeenCalledWith([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ]);
    });

    it('does not call onComparePatterns when a pattern is missing', () => {
      const { result, onComparePatterns } = setup();

      act(() => result.current.handleConnectionClick(makeConnection(1, 999)));

      expect(result.current.selectedConnection?.to).toBe(999);
      expect(onComparePatterns).not.toHaveBeenCalled();
    });
  });

  describe('Zoom', () => {
    const wheel = (deltaY: number) =>
      makeMouseEvent({ deltaY } as unknown as Partial<React.MouseEvent>) as unknown as React.WheelEvent;

    it('handleZoomIn increases zoom by 20%', () => {
      const { result } = setup();

      act(() => result.current.handleZoomIn());
      expect(result.current.zoom).toBeCloseTo(1.2);
    });

    it('handleZoomOut decreases zoom by 20%', () => {
      const { result } = setup();

      act(() => result.current.handleZoomOut());
      expect(result.current.zoom).toBeCloseTo(1 / 1.2);
    });

    it('clamps zoom to a maximum of 3', () => {
      const { result } = setup();

      for (let i = 0; i < 10; i++) {
        act(() => result.current.handleZoomIn());
      }
      expect(result.current.zoom).toBe(3);
    });

    it('clamps zoom to a minimum of 0.5', () => {
      const { result } = setup();

      for (let i = 0; i < 10; i++) {
        act(() => result.current.handleZoomOut());
      }
      expect(result.current.zoom).toBe(0.5);
    });

    it('handleWheel zooms out on scroll down and calls preventDefault', () => {
      const { result } = setup();
      const e = wheel(120);

      act(() => result.current.handleWheel(e));

      expect(e.preventDefault).toHaveBeenCalled();
      expect(result.current.zoom).toBeCloseTo(0.9);
    });

    it('handleWheel zooms in on scroll up', () => {
      const { result } = setup();

      act(() => result.current.handleWheel(wheel(-120)));

      expect(result.current.zoom).toBeCloseTo(1.1);
    });

    it('handleWheel respects zoom bounds', () => {
      const { result } = setup();

      for (let i = 0; i < 30; i++) act(() => result.current.handleWheel(wheel(-120)));
      expect(result.current.zoom).toBe(3);

      for (let i = 0; i < 30; i++) act(() => result.current.handleWheel(wheel(120)));
      expect(result.current.zoom).toBe(0.5);
    });

    it('handleResetZoom restores zoom and pan to defaults', () => {
      const { result } = setup();

      act(() => result.current.handleZoomIn());
      act(() => result.current.handleMouseDown(makeMouseEvent({ clientX: 10, clientY: 10, target: result.current ? document.createElement('rect') : null })));
      act(() => result.current.handlePanMove(makeMouseEvent({ clientX: 30, clientY: 40 })));
      act(() => result.current.handleResetZoom());

      expect(result.current.zoom).toBe(1);
      expect(result.current.pan).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Pan', () => {
    const rectTarget = () => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      return el as unknown as Element;
    };

    it('starts panning when mousedown happens on the svg background rect', () => {
      const { result } = setup();

      act(() => result.current.handleMouseDown(makeMouseEvent({ clientX: 50, clientY: 60, target: rectTarget() })));

      expect(result.current.isDragging).toBe(true);
    });

    it('ignores mousedown on other elements (e.g. nodes)', () => {
      const { result } = setup();

      act(() =>
        result.current.handleMouseDown(
          makeMouseEvent({ clientX: 50, clientY: 60, target: document.createElement('circle') }),
        ),
      );

      expect(result.current.isDragging).toBe(false);
    });

    it('updates pan by mouse delta divided by zoom while dragging', () => {
      const { result } = setup();

      act(() => result.current.handleZoomIn()); // zoom = 1.2
      act(() => result.current.handleMouseDown(makeMouseEvent({ clientX: 50, clientY: 50, target: rectTarget() })));
      act(() => result.current.handlePanMove(makeMouseEvent({ clientX: 62, clientY: 44 }))); // delta = (12, -6)

      expect(result.current.pan.x).toBeCloseTo(12 / 1.2);
      expect(result.current.pan.y).toBeCloseTo(-6 / 1.2);
    });

    it('does not pan when not dragging', () => {
      const { result } = setup();

      act(() => result.current.handlePanMove(makeMouseEvent({ clientX: 200, clientY: 200 })));

      expect(result.current.pan).toEqual({ x: 0, y: 0 });
    });

    it('handleMouseUp stops dragging and clears draggedNode after a tick', () => {
      vi.useFakeTimers();
      const { result } = setup();

      act(() => result.current.handleNodeMouseDown(makeMouseEvent({ clientX: 200, clientY: 150 }), 1, 100, 100));
      expect(result.current.draggedNode).toBe(1);

      act(() => result.current.handleMouseUp());

      expect(result.current.isDragging).toBe(false);
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(result.current.draggedNode).toBeNull();
    });
  });

  describe('Node Dragging', () => {
    it('handleNodeMouseDown sets draggedNode and stops propagation', () => {
      const { result } = setup();
      const e = makeMouseEvent({ clientX: 200, clientY: 150 });

      act(() => result.current.handleNodeMouseDown(e, 1, 100, 100));

      expect(result.current.draggedNode).toBe(1);
      expect(e.stopPropagation).toHaveBeenCalled();
    });

    it('handleNodeMouseMove reports new node position via callback, accounting for pan/zoom', () => {
      const { result } = setup();
      const updateNodePosition = vi.fn();

      // zoom=1, pan=(0,0), svg rect left=100 top=50
      // mousedown at client (200,150) -> svg coords (100,100); node at (100,100) -> dragStart offset (0,0)
      act(() => result.current.handleNodeMouseDown(makeMouseEvent({ clientX: 200, clientY: 150 }), 1, 100, 100));
      // move to client (250, 200) -> svg coords (150,150) -> node position (150,150)
      act(() => result.current.handleNodeMouseMove(makeMouseEvent({ clientX: 250, clientY: 200 }), updateNodePosition));

      expect(updateNodePosition).toHaveBeenCalledWith(1, 150, 150);
    });

    it('handleNodeMouseMove accounts for zoom and pan when computing position', () => {
      const { result } = setup();
      const updateNodePosition = vi.fn();

      act(() => result.current.handleZoomIn()); // zoom 1.2
      act(() => result.current.handleMouseDown(makeMouseEvent({ clientX: 0, clientY: 0, target: document.createElementNS('http://www.w3.org/2000/svg', 'rect') })));
      act(() => result.current.handlePanMove(makeMouseEvent({ clientX: 24, clientY: 0 }))); // pan.x = 20
      act(() => result.current.handleMouseUp());

      // mousedown: client (200,150) -> svg ((200-100-20)/1.2, (150-50)/1.2) = (66.67, 83.33)
      // dragStart offset = svg - node = (66.67-100, 83.33-100) = (-33.33, -16.67)
      act(() => result.current.handleNodeMouseDown(makeMouseEvent({ clientX: 200, clientY: 150 }), 1, 100, 100));
      // move: client (212, 158.4) -> svg ((212-100-20)/1.2, (158.4-50)/1.2) = (76.67, 90.33)
      act(() => result.current.handleNodeMouseMove(makeMouseEvent({ clientX: 212, clientY: 158.4 }), updateNodePosition));

      const [nodeId, x, y] = updateNodePosition.mock.calls[0];
      expect(nodeId).toBe(1);
      expect(x).toBeCloseTo(76.67 - (-33.33));
      expect(y).toBeCloseTo(90.33 - (-16.67));
    });

    it('does not update position when no node is being dragged', () => {
      const { result } = setup();
      const updateNodePosition = vi.fn();

      act(() => result.current.handleNodeMouseMove(makeMouseEvent({ clientX: 250, clientY: 200 }), updateNodePosition));

      expect(updateNodePosition).not.toHaveBeenCalled();
    });

    it('small movements within the drag threshold do not mark wasDragging', () => {
      const { result, onSelectPattern } = setup();
      const updateNodePosition = vi.fn();

      // move only 2px (< 5px threshold)
      act(() => result.current.handleNodeMouseDown(makeMouseEvent({ clientX: 200, clientY: 150 }), 1, 100, 100));
      act(() => result.current.handleNodeMouseMove(makeMouseEvent({ clientX: 202, clientY: 150 }), updateNodePosition));
      act(() => result.current.handleMouseUp());

      // click should NOT be swallowed
      act(() => result.current.handleNodeClick(1));
      expect(onSelectPattern).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hover State', () => {
    it('exposes setters for hovered node and connection', () => {
      const { result } = setup();
      const conn = makeConnection(1, 2);

      act(() => {
        result.current.setHoveredNode(2);
        result.current.setHoveredConnection(conn);
      });

      expect(result.current.hoveredNode).toBe(2);
      expect(result.current.hoveredConnection).toEqual(conn);

      act(() => {
        result.current.setHoveredNode(null);
        result.current.setHoveredConnection(null);
      });

      expect(result.current.hoveredNode).toBeNull();
      expect(result.current.hoveredConnection).toBeNull();
    });
  });

  describe('getNode', () => {
    it('returns the node with the given id', () => {
      const { result, filteredNodes } = setup();

      expect(result.current.getNode(2)).toEqual(filteredNodes[1]);
    });

    it('returns undefined for unknown id', () => {
      const { result } = setup();

      expect(result.current.getNode(999)).toBeUndefined();
    });
  });

  describe('getConnectionPath', () => {
    it('returns a quadratic bezier path between connected nodes', () => {
      const { result } = setup(); // nodes at (100,100) and (300,100)

      const path = result.current.getConnectionPath(makeConnection(1, 2));

      expect(path).toMatch(/^M 100 100 Q [\d.]+ [\d.]+ 300 100$/);
    });

    it('returns empty string when either node is missing', () => {
      const { result } = setup();

      expect(result.current.getConnectionPath(makeConnection(1, 999))).toBe('');
      expect(result.current.getConnectionPath(makeConnection(999, 1))).toBe('');
    });
  });
});
