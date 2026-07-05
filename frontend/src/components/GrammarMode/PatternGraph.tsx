import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { API_URL } from '../../config/api.js';
import { runForceLayout } from '../../lib/forceLayout.js';
import { LegendPanel } from './PatternGraphLegend.js';
import { GraphSVG } from './PatternGraphSVG.js';
import {
  PatternNode,
  PatternConnection,
  ApiRelationship,
  PatternGraphProps,
} from './PatternGraphTypes.js';
import './PatternGraph.css';

export const PatternGraph: React.FC<PatternGraphProps> = ({
  patterns,
  confusionStats,
  onSelectPattern,
  onComparePatterns,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<PatternConnection | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<PatternConnection | null>(null);
  const [filter, setFilter] = useState<'all' | 'confused' | 'mastered'>('all');

  // Connections from database
  const [connections, setConnections] = useState<PatternConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node drag state
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<number, { x: number; y: number }>>(new Map());
  const isDraggingRef = useRef(false);

  // Stable dimensions - never changes between renders
  const dimensionsRef = useRef({ width: 1200, height: 800 });
  const dimensions = dimensionsRef.current;

  // Filter out counters - they have their own module (CountersMode)
  const grammarPatterns = useMemo(() => {
    return patterns.filter(p => p.category !== 'Counters');
  }, [patterns]);

  // Fetch relationships from API
  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        setLoadingConnections(true);
        const response = await fetch(`${API_URL}/api/grammar/relationships`);

        if (!response.ok) {
          throw new Error('Failed to fetch relationships');
        }

        const data = await response.json();
        const apiConnections: PatternConnection[] = data.relationships.map((rel: ApiRelationship) => ({
          from: rel.from_pattern_id,
          to: rel.to_pattern_id,
          type: rel.relationship_type,
          strength: rel.strength,
        }));

        setConnections(apiConnections);
      } catch (error) {
        console.error('Error fetching pattern relationships:', error);
        setConnections([]);
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchRelationships();
  }, []);

  // Calculate node positions using force-directed layout
  const nodes = useMemo((): PatternNode[] => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Group patterns by category for initial placement
    const categories = [...new Set(grammarPatterns.map(p => p.category))];
    const categoryRadius = Math.min(dimensions.width, dimensions.height) * 0.25;

    const initialNodes: PatternNode[] = grammarPatterns.map((pattern) => {
      const confusionCount = confusionStats.find(c => c.patternId === pattern.id)?.count || 0;
      const totalAttempts = pattern.total_attempts || 0;
      const correctAttempts = pattern.correct_attempts || 0;
      const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

      let masteryStatus: PatternNode['masteryStatus'] = 'unknown';
      if (totalAttempts > 0) {
        if (confusionCount > 2 || accuracy < 0.5) {
          masteryStatus = 'confused';
        } else if (accuracy >= 0.8) {
          masteryStatus = 'mastered';
        } else {
          masteryStatus = 'learning';
        }
      }

      // Initial position in a circle grouped by category
      const catIndex = categories.indexOf(pattern.category);
      const patternsInCategory = grammarPatterns.filter(p => p.category === pattern.category);
      const indexInCategory = patternsInCategory.findIndex(p => p.id === pattern.id);
      const totalInCategory = patternsInCategory.length;

      const baseAngle = (catIndex / categories.length) * 2 * Math.PI - Math.PI / 2;
      const angleOffset = totalInCategory > 1
        ? ((indexInCategory - (totalInCategory - 1) / 2) / Math.max(1, totalInCategory - 1)) * 0.4
        : 0;
      const angle = baseAngle + angleOffset;

      const x = centerX + categoryRadius * Math.cos(angle);
      const y = centerY + categoryRadius * Math.sin(angle);

      return {
        id: pattern.id,
        pattern: pattern.pattern,
        category: pattern.category,
        x,
        y,
        masteryStatus,
        accuracy,
        vx: 0,
        vy: 0,
      };
    });

    const visibleConnections = connections.filter(
      conn => grammarPatterns.some(p => p.id === conn.from) && grammarPatterns.some(p => p.id === conn.to)
    );

    return runForceLayout({
      initialNodes,
      connections: visibleConnections,
      width: dimensions.width,
      height: dimensions.height,
      iterations: 150,
    });
  }, [grammarPatterns, confusionStats, connections]);

  // Get connections for visible patterns
  const visibleConnections = useMemo((): PatternConnection[] => {
    const patternIds = new Set(grammarPatterns.map(p => p.id));
    return connections.filter(
      conn => patternIds.has(conn.from) && patternIds.has(conn.to)
    );
  }, [grammarPatterns, connections]);

  // Filter nodes and apply manual positions
  const filteredNodes = useMemo(() => {
    const baseNodes = filter === 'all' ? nodes : nodes.filter(n => n.masteryStatus === filter);
    return baseNodes.map(node => {
      const manualPos = nodePositions.get(node.id);
      if (manualPos) {
        return { ...node, x: manualPos.x, y: manualPos.y };
      }
      return node;
    });
  }, [nodes, filter, nodePositions]);

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
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
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
  }, [pan, zoom]);

  const handleNodeMouseMove = useCallback((e: React.MouseEvent) => {
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
        const newX = svgX - dragStart.x;
        const newY = svgY - dragStart.y;

        setNodePositions(prev => {
          const next = new Map(prev);
          next.set(draggedNode, { x: newX, y: newY });
          return next;
        });
      }
    }
  }, [draggedNode, dragStart, pan, zoom]);

  // Merge node drag with pan in handleMouseMove
  const handleMouseMoveMerged = useCallback((e: React.MouseEvent) => {
    if (draggedNode !== null) {
      handleNodeMouseMove(e);
    } else if (isDragging) {
      handleMouseMove(e);
    }
  }, [draggedNode, isDragging, handleNodeMouseMove, handleMouseMove]);

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

  // Get categories for background labels
  const categories = useMemo(() => {
    const cats = [...new Set(grammarPatterns.map(p => p.category))];
    return cats.map(cat => {
      const catNodes = nodes.filter(n => n.category === cat);
      if (catNodes.length === 0) return null;
      const avgX = catNodes.reduce((sum, n) => sum + n.x, 0) / catNodes.length;
      const avgY = catNodes.reduce((sum, n) => sum + n.y, 0) / catNodes.length;
      return { name: cat, x: avgX, y: avgY };
    }).filter(Boolean) as { name: string; x: number; y: number }[];
  }, [grammarPatterns, nodes]);

  return (
    <div className="pattern-graph-modal">
      <div className="pattern-graph-content">
        <div className="pattern-graph-header">
          <h3>🕸️ Pattern Relationship Graph</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="pattern-graph-controls">
          <div className="filter-section">
            <span className="control-label">Filter:</span>
            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'confused' ? 'active' : ''}
                onClick={() => setFilter('confused')}
              >
                Confused
              </button>
              <button
                className={filter === 'mastered' ? 'active' : ''}
                onClick={() => setFilter('mastered')}
              >
                Mastered
              </button>
            </div>
          </div>

          <div className="zoom-controls">
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button className="zoom-btn" onClick={handleZoomOut} title="Pomniejsz">−</button>
            <button className="zoom-btn" onClick={handleResetZoom} title="Resetuj">⟲</button>
            <button className="zoom-btn" onClick={handleZoomIn} title="Powiększ">+</button>
          </div>
        </div>

        <div className="pattern-graph-main">
          <LegendPanel loadingConnections={loadingConnections} />

          <div
            className="pattern-graph-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMoveMerged}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <GraphSVG
              svgRef={svgRef}
              containerRef={containerRef}
              dimensions={dimensions}
              zoom={zoom}
              pan={pan}
              isDragging={isDragging}
              filteredNodes={filteredNodes}
              visibleConnections={visibleConnections}
              selectedNode={selectedNode}
              selectedConnection={selectedConnection}
              hoveredNode={hoveredNode}
              hoveredConnection={hoveredConnection}
              draggedNode={draggedNode}
              categories={categories}
              onWheel={handleWheel}
              onNodeClick={handleNodeClick}
              onNodeMouseDown={handleNodeMouseDown}
              onConnectionClick={handleConnectionClick}
              onNodeMouseEnter={setHoveredNode}
              onNodeMouseLeave={() => setHoveredNode(null)}
              onConnectionMouseEnter={setHoveredConnection}
              onConnectionMouseLeave={() => setHoveredConnection(null)}
              getNode={getNode}
              getConnectionPath={getConnectionPath}
            />
          </div>
        </div>

        <div className="pattern-graph-footer">
          <p>
            <strong>Visible:</strong> {filteredNodes.length} patterns |
            <strong> Connections:</strong> {connections.filter(c =>
              filteredNodes.find(n => n.id === c.from) && filteredNodes.find(n => n.id === c.to)
            ).length} connections
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatternGraph;
