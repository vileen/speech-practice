import React, { useState, useRef, useMemo, useCallback } from 'react';
import { GrammarPattern } from './GrammarMode';
import './PatternGraph.css';

interface PatternNode {
  id: number;
  pattern: string;
  category: string;
  x: number;
  y: number;
  masteryStatus: 'mastered' | 'learning' | 'confused' | 'unknown';
  accuracy: number;
  vx: number;
  vy: number;
}

interface PatternConnection {
  from: number;
  to: number;
  type: 'opposite' | 'similar' | 'related';
  strength: number;
}

interface PatternGraphProps {
  patterns: GrammarPattern[];
  confusionStats: { patternId: number; count: number }[];
  onSelectPattern: (pattern: GrammarPattern) => void;
  onComparePatterns: (patterns: GrammarPattern[]) => void;
  onClose: () => void;
}

// Predefined pattern relationships based on the documentation
const PREDEFINED_CONNECTIONS: PatternConnection[] = [
  // Permission/Prohibition opposites
  { from: 1, to: 2, type: 'opposite', strength: 1.0 },
  { from: 2, to: 1, type: 'opposite', strength: 1.0 },
  
  // Obligation/Lack of Obligation opposites
  { from: 5, to: 6, type: 'opposite', strength: 1.0 },
  { from: 6, to: 5, type: 'opposite', strength: 1.0 },
  
  // Related obligation patterns
  { from: 1, to: 6, type: 'related', strength: 0.7 },
  { from: 6, to: 1, type: 'related', strength: 0.7 },
  { from: 2, to: 5, type: 'related', strength: 0.7 },
  { from: 5, to: 2, type: 'related', strength: 0.7 },
  
  // Similar forms (both use te-form)
  { from: 1, to: 2, type: 'similar', strength: 0.9 },
  { from: 5, to: 6, type: 'similar', strength: 0.8 },
  
  // Particle contrasts
  { from: 9, to: 10, type: 'opposite', strength: 0.9 },
  { from: 10, to: 9, type: 'opposite', strength: 0.9 },
  { from: 11, to: 12, type: 'opposite', strength: 0.8 },
  { from: 12, to: 11, type: 'opposite', strength: 0.8 },
  
  // I-adjective forms
  { from: 19, to: 20, type: 'opposite', strength: 0.9 },
  { from: 20, to: 19, type: 'opposite', strength: 0.9 },
  { from: 21, to: 22, type: 'opposite', strength: 0.9 },
  { from: 22, to: 21, type: 'opposite', strength: 0.9 },
  { from: 19, to: 21, type: 'similar', strength: 0.8 },
  { from: 20, to: 22, type: 'similar', strength: 0.8 },
  
  // Na-adjective forms
  { from: 23, to: 24, type: 'opposite', strength: 0.9 },
  { from: 24, to: 23, type: 'opposite', strength: 0.9 },
  { from: 25, to: 26, type: 'opposite', strength: 0.9 },
  { from: 26, to: 25, type: 'opposite', strength: 0.9 },
  { from: 23, to: 25, type: 'similar', strength: 0.8 },
  { from: 24, to: 26, type: 'similar', strength: 0.8 },
];

// Color schemes for different connection types
const CONNECTION_COLORS = {
  opposite: '#ff4757',
  similar: '#ffa502',
  related: '#3742fa',
};

// Node colors based on mastery
const NODE_COLORS = {
  mastered: '#2ed573',
  learning: '#ffa502',
  confused: '#ff4757',
  unknown: '#747d8c',
};

// Legend labels in Polish
const LEGEND_LABELS = {
  opposite: 'Przeciwne',
  similar: 'Podobne',
  related: 'Powiązane',
  mastered: 'Opanowane',
  learning: 'W trakcie',
  confused: 'Myli się',
  unknown: 'Nie ćwiczone',
};

// Force-directed layout simulation
const runForceLayout = (
  initialNodes: PatternNode[],
  connections: PatternConnection[],
  width: number,
  height: number,
  iterations: number = 100
): PatternNode[] => {
  const nodes = initialNodes.map(n => ({ ...n, vx: 0, vy: 0 }));
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Constants for forces
  const REPULSION_FORCE = 8000;
  const ATTRACTION_FORCE = 0.008;
  const CENTER_FORCE = 0.0005;
  const MIN_DISTANCE = 120;
  const DAMPING = 0.9;
  
  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all nodes (collision detection)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        if (dist < MIN_DISTANCE) {
          const force = REPULSION_FORCE / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }
    }
    
    // Attraction along connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return;
      
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 180;
      
      const force = (dist - targetDist) * ATTRACTION_FORCE * conn.strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      
      fromNode.vx += fx;
      fromNode.vy += fy;
      toNode.vx -= fx;
      toNode.vy -= fy;
    });
    
    // Centering force
    nodes.forEach(node => {
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      node.vx += dx * CENTER_FORCE;
      node.vy += dy * CENTER_FORCE;
    });
    
    // Apply velocities with damping
    nodes.forEach(node => {
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;
      
      // Keep within bounds with padding
      const padding = 80;
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    });
  }
  
  return nodes;
};

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
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const dimensions = { width: 1200, height: 800 };
  
  // Calculate node positions using force-directed layout
  const nodes = useMemo((): PatternNode[] => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Group patterns by category for initial placement
    const categories = [...new Set(patterns.map(p => p.category))];
    const categoryRadius = Math.min(dimensions.width, dimensions.height) * 0.25;
    
    const initialNodes: PatternNode[] = patterns.map((pattern) => {
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
      const patternsInCategory = patterns.filter(p => p.category === pattern.category);
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
    
    // Run force-directed layout
    const connections = PREDEFINED_CONNECTIONS.filter(
      conn => patterns.some(p => p.id === conn.from) && patterns.some(p => p.id === conn.to)
    );
    
    return runForceLayout(initialNodes, connections, dimensions.width, dimensions.height);
  }, [patterns, confusionStats, dimensions]);

  // Get connections for visible patterns
  const connections = useMemo((): PatternConnection[] => {
    const patternIds = new Set(patterns.map(p => p.id));
    return PREDEFINED_CONNECTIONS.filter(
      conn => patternIds.has(conn.from) && patternIds.has(conn.to)
    );
  }, [patterns]);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    if (filter === 'all') return nodes;
    return nodes.filter(n => n.masteryStatus === filter);
  }, [nodes, filter]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: number) => {
    setSelectedNode(nodeId);
    setSelectedConnection(null);
    const pattern = patterns.find(p => p.id === nodeId);
    if (pattern) {
      onSelectPattern(pattern);
    }
  }, [patterns, onSelectPattern]);

  // Handle connection click
  const handleConnectionClick = useCallback((conn: PatternConnection) => {
    setSelectedConnection(conn);
    setSelectedNode(null);
    const fromPattern = patterns.find(p => p.id === conn.from);
    const toPattern = patterns.find(p => p.id === conn.to);
    if (fromPattern && toPattern) {
      onComparePatterns([fromPattern, toPattern]);
    }
  }, [patterns, onComparePatterns]);

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
  }, []);

  // Get node by ID
  const getNode = (id: number) => nodes.find(n => n.id === id);

  // Get connection path
  const getConnectionPath = (conn: PatternConnection): string => {
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
  };

  // Get categories for background labels
  const categories = useMemo(() => {
    const cats = [...new Set(patterns.map(p => p.category))];
    return cats.map(cat => {
      const catNodes = nodes.filter(n => n.category === cat);
      if (catNodes.length === 0) return null;
      const avgX = catNodes.reduce((sum, n) => sum + n.x, 0) / catNodes.length;
      const avgY = catNodes.reduce((sum, n) => sum + n.y, 0) / catNodes.length;
      return { name: cat, x: avgX, y: avgY };
    }).filter(Boolean) as { name: string; x: number; y: number }[];
  }, [patterns, nodes]);

  return (
    <div className="pattern-graph-modal">
      <div className="pattern-graph-content">
        <div className="pattern-graph-header">
          <h3>🕸️ Graf Powiązań Wzorców</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="pattern-graph-controls">
          <div className="filter-section">
            <span className="control-label">Filtr:</span>
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                Wszystkie
              </button>
              <button 
                className={filter === 'confused' ? 'active' : ''}
                onClick={() => setFilter('confused')}
              >
                Myli się
              </button>
              <button 
                className={filter === 'mastered' ? 'active' : ''}
                onClick={() => setFilter('mastered')}
              >
                Opanowane
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
          <div className="pattern-graph-sidebar">
            <div className="legend-section-panel">
              <h4>🔴 Rodzaj połączenia</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-line" style={{ backgroundColor: CONNECTION_COLORS.opposite }} />
                  <span>{LEGEND_LABELS.opposite}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-line" style={{ backgroundColor: CONNECTION_COLORS.similar }} />
                  <span>{LEGEND_LABELS.similar}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-line" style={{ backgroundColor: CONNECTION_COLORS.related }} />
                  <span>{LEGEND_LABELS.related}</span>
                </div>
              </div>
            </div>
            
            <div className="legend-section-panel">
              <h4>🟢 Status wzorca</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: NODE_COLORS.mastered }} />
                  <span>{LEGEND_LABELS.mastered}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: NODE_COLORS.learning }} />
                  <span>{LEGEND_LABELS.learning}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: NODE_COLORS.confused }} />
                  <span>{LEGEND_LABELS.confused}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: NODE_COLORS.unknown }} />
                  <span>{LEGEND_LABELS.unknown}</span>
                </div>
              </div>
            </div>
            
            <div className="legend-tips">
              <h4>💡 Wskazówki</h4>
              <ul>
                <li>Kliknij węzeł aby przećwiczyć</li>
                <li>Kliknij linię aby porównać</li>
                <li>Przeciągnij tło aby przesunąć</li>
                <li>Scroll aby przybliżyć</li>
              </ul>
            </div>
          </div>

          <div 
            className="pattern-graph-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg 
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              onWheel={handleWheel}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <defs>
                {/* Grid pattern */}
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                </pattern>
                
                {/* Node gradients */}
                <radialGradient id="gradient-mastered" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#5af78e" />
                  <stop offset="100%" stopColor="#2ed573" />
                </radialGradient>
                <radialGradient id="gradient-learning" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#ffd166" />
                  <stop offset="100%" stopColor="#ffa502" />
                </radialGradient>
                <radialGradient id="gradient-confused" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#ff6b7a" />
                  <stop offset="100%" stopColor="#ff4757" />
                </radialGradient>
                <radialGradient id="gradient-unknown" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#9aa0a6" />
                  <stop offset="100%" stopColor="#747d8c" />
                </radialGradient>
                
                {/* Node shadow filter */}
                <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4"/>
                </filter>
                
                {/* Glow filter for selected */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background */}
              <rect width="100%" height="100%" fill="#0a0e1a" />
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Transform group for zoom/pan */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Category background labels */}
                {categories.map((cat) => (
                  <text
                    key={cat.name}
                    x={cat.x}
                    y={cat.y}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.04)"
                    fontSize="48"
                    fontWeight="700"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {cat.name}
                  </text>
                ))}
                
                {/* Connections */}
                {connections.map((conn, i) => {
                  const fromNode = getNode(conn.from);
                  const toNode = getNode(conn.to);
                  if (!fromNode || !toNode) return null;
                  
                  if (!filteredNodes.find(n => n.id === conn.from) || 
                      !filteredNodes.find(n => n.id === conn.to)) {
                    return null;
                  }
                  
                  const isSelected = selectedConnection?.from === conn.from && 
                                    selectedConnection?.to === conn.to;
                  const isHovered = hoveredConnection?.from === conn.from && 
                                   hoveredConnection?.to === conn.to;
                  
                  return (
                    <g key={`${conn.from}-${conn.to}-${i}`} className="connection-group">
                      <path
                        d={getConnectionPath(conn)}
                        fill="none"
                        stroke={CONNECTION_COLORS[conn.type]}
                        strokeWidth={isSelected ? 5 : isHovered ? 4 : 2}
                        strokeOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.6}
                        className="connection-line"
                        onClick={() => handleConnectionClick(conn)}
                        onMouseEnter={() => setHoveredConnection(conn)}
                        onMouseLeave={() => setHoveredConnection(null)}
                        style={{ cursor: 'pointer' }}
                      />
                      {/* Invisible hit area */}
                      <path
                        d={getConnectionPath(conn)}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={20}
                        onClick={() => handleConnectionClick(conn)}
                        onMouseEnter={() => setHoveredConnection(conn)}
                        onMouseLeave={() => setHoveredConnection(null)}
                        style={{ cursor: 'pointer' }}
                      />
                      {/* Connection label on hover */}
                      {(isHovered || isSelected) && (
                        <g>
                          {(() => {
                            const path = getConnectionPath(conn);
                            const match = path.match(/Q ([\d.]+) ([\d.]+)/);
                            const cx = match ? parseFloat(match[1]) : (fromNode.x + toNode.x) / 2;
                            const cy = match ? parseFloat(match[2]) : (fromNode.y + toNode.y) / 2;
                            return (
                              <>
                                <rect
                                  x={cx - 35}
                                  y={cy - 12}
                                  width="70"
                                  height="24"
                                  rx="12"
                                  fill="#1a1a2e"
                                  stroke={CONNECTION_COLORS[conn.type]}
                                  strokeWidth="1"
                                />
                                <text
                                  x={cx}
                                  y={cy + 4}
                                  textAnchor="middle"
                                  fill="#fff"
                                  fontSize="10"
                                  fontWeight="600"
                                >
                                  {LEGEND_LABELS[conn.type]}
                                </text>
                              </>
                            );
                          })()}
                        </g>
                      )}
                    </g>
                  );
                })}
                
                {/* Nodes */}
                {filteredNodes.map(node => {
                  const isSelected = selectedNode === node.id;
                  const isHovered = hoveredNode === node.id;
                  const radius = isSelected ? 38 : isHovered ? 35 : 30;
                  const gradientId = `gradient-${node.masteryStatus}`;
                  
                  return (
                    <g 
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className={`node-group ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleNodeClick(node.id)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Outer glow for selected */}
                      {isSelected && (
                        <circle
                          r={radius + 8}
                          fill="none"
                          stroke={NODE_COLORS[node.masteryStatus]}
                          strokeWidth="2"
                          strokeOpacity="0.5"
                          filter="url(#glow)"
                        />
                      )}
                      
                      {/* Node circle */}
                      <circle
                        r={radius}
                        fill={`url(#${gradientId})`}
                        stroke={isSelected ? '#fff' : 'transparent'}
                        strokeWidth={isSelected ? 3 : 0}
                        filter="url(#node-shadow)"
                        className="node-circle"
                      />
                      
                      {/* Pattern text */}
                      <text
                        y={-4}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="11"
                        fontWeight="600"
                        style={{ pointerEvents: 'none', fontFamily: 'Noto Sans JP, sans-serif' }}
                      >
                        {node.pattern.length > 8 ? node.pattern.slice(0, 7) + '…' : node.pattern}
                      </text>
                      
                      {/* Category text */}
                      <text
                        y={10}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.85)"
                        fontSize="8"
                        style={{ pointerEvents: 'none' }}
                      >
                        {node.category.slice(0, 10)}
                      </text>
                      
                      {/* Tooltip */}
                      {isHovered && (
                        <g transform="translate(45, -40)">
                          <rect
                            x="0"
                            y="0"
                            width="160"
                            height="75"
                            rx="10"
                            fill="#1a1a2e"
                            stroke={NODE_COLORS[node.masteryStatus]}
                            strokeWidth="2"
                            filter="url(#node-shadow)"
                          />
                          <text x="12" y="22" fill="#fff" fontSize="13" fontWeight="600">
                            {node.pattern}
                          </text>
                          <text x="12" y="42" fill="#aaa" fontSize="10">
                            {node.category}
                          </text>
                          <text x="12" y="60" fill={NODE_COLORS[node.masteryStatus]} fontSize="10" fontWeight="600">
                            Celność: {Math.round(node.accuracy * 100)}%
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        <div className="pattern-graph-footer">
          <p>
            <strong>Widoczne:</strong> {filteredNodes.length} wzorców | 
            <strong> Powiązania:</strong> {connections.filter(c => 
              filteredNodes.find(n => n.id === c.from) && filteredNodes.find(n => n.id === c.to)
            ).length} połączeń
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatternGraph;
