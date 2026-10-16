import { useState, useRef, useCallback } from 'react';
import {
  PatternNode,
  PatternConnection,
} from '../components/GrammarMode/PatternGraphTypes.js';
import { GrammarPattern } from '../components/GrammarMode/GrammarMode.js';

export interface PatternGraphInteractionInput {
  svgRef: React.RefObject<SVGSVGElement | null>;
  grammarPatterns: GrammarPattern[];
  filteredNodes: PatternNode[];
  onSelectPattern: (pattern: GrammarPattern) => void;
  onComparePatterns: (patterns: GrammarPattern[]) => void;
}

export const usePatternGraphInteraction = ({
  svgRef,
  grammarPatterns,
  filteredNodes,
  onSelectPattern,
  onComparePatterns,
}: PatternGraphInteractionInput) => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<PatternConnection | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<PatternConnection | null>(null);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node drag state
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  // Track if user was dragging (to prevent click after drag)
  const dragThresholdRef = useRef(5);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const wasDraggingRef = useRef(false);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: number) => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    setSelectedNode(nodeId);
    setSelectedConnection(null);
    const pattern = grammarPatterns.find(p => p.id === nodeId);
    if (pattern) {
      onSelectPattern(pattern);
    }
  }, [grammarPatterns, onSelectPattern]);

  // Handle connection click
  const handleConnectionClick = useCallback((conn: PatternConnection) => {
    setSelectedConnection(conn);
    setSelectedNode(null);
    const fromPattern = grammarPatterns.find(p => p.id === conn.from);
    const toPattern = grammarPatterns.find(p => p.id === conn.to);
    if (fromPattern && toPattern) {
      onComparePatterns([fromPattern, toPattern]);
    }
  }, [grammarPatterns, onComparePatterns]);

  // Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(3, prev * 1.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.5, prev / 1.2));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart({ x: pan.x, y: pan.y });
    }
  }, [svgRef, pan]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      setPan({ x: panStart.x + dx, y: panStart.y + dy });
    }
  }, [isDragging, dragStart, panStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;
    setTimeout(() => setDraggedNode(null), 50);
  }, []);

  // Node drag handlers
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: number, nodeX: number, nodeY: number) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    isDraggingRef.current = true;
    wasDraggingRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const svgX = (e.clientX - rect.left - pan.x) / zoom;
      const svgY = (e.clientY - rect.top - pan.y) / zoom;
      setDragStart({ x: svgX - nodeX, y: svgY - nodeY });
    }
  }, [svgRef, pan, zoom]);

  // Node positions live in usePatternGraph; the interaction hook reports
  // drag deltas through a callback supplied by the caller.
  const handleNodeMouseMove = useCallback((
    e: React.MouseEvent,
    updateNodePosition: (nodeId: number, x: number, y: number) => void,
  ) => {
    if (draggedNode !== null) {
      const dx = Math.abs(e.clientX - dragStartPosRef.current.x);
      const dy = Math.abs(e.clientY - dragStartPosRef.current.y);
      if (dx > dragThresholdRef.current || dy > dragThresholdRef.current) {
        wasDraggingRef.current = true;
      }

      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const svgX = (e.clientX - rect.left - pan.x) / zoom;
        const svgY = (e.clientY - rect.top - pan.y) / zoom;
        updateNodePosition(draggedNode, svgX - dragStart.x, svgY - dragStart.y);
      }
    }
  }, [svgRef, draggedNode, dragStart, pan, zoom]);

  // Get node by ID
  const getNode = useCallback((id: number) => filteredNodes.find(n => n.id === id), [filteredNodes]);

  // Get connection path
  const getConnectionPath = useCallback((conn: PatternConnection): string => {
    const fromNode = getNode(conn.from);
    const toNode = getNode(conn.to);
    if (!fromNode || !toNode) return '';

    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    const offset = 40;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / dist * offset;
    const perpY = dx / dist * offset;

    const controlX = midX + perpX;
    const controlY = midY + perpY;

    return `M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${toNode.x} ${toNode.y}`;
  }, [getNode]);

  return {
    selectedNode,
    selectedConnection,
    hoveredNode,
    hoveredConnection,
    setHoveredNode,
    setHoveredConnection,
    zoom,
    pan,
    isDragging,
    draggedNode,
    handleNodeClick,
    handleConnectionClick,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleMouseDown,
    handlePanMove,
    handleMouseUp,
    handleNodeMouseDown,
    handleNodeMouseMove,
    getNode,
    getConnectionPath,
  };
};
