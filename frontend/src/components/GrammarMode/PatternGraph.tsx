import React, { useState, useRef, useMemo } from 'react';
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
  { from: 1, to: 2, type: 'opposite', strength: 1.0 }, // てもいい vs てはいけません
  { from: 2, to: 1, type: 'opposite', strength: 1.0 },
  
  // Obligation/Lack of Obligation opposites
  { from: 5, to: 6, type: 'opposite', strength: 1.0 }, // なければなりません vs なくてもいい
  { from: 6, to: 5, type: 'opposite', strength: 1.0 },
  
  // Related obligation patterns
  { from: 1, to: 6, type: 'related', strength: 0.7 }, // Permission and Lack of Obligation
  { from: 6, to: 1, type: 'related', strength: 0.7 },
  { from: 2, to: 5, type: 'related', strength: 0.7 }, // Prohibition and Obligation
  { from: 5, to: 2, type: 'related', strength: 0.7 },
  
  // Similar forms (both use te-form)
  { from: 1, to: 2, type: 'similar', strength: 0.9 },
  { from: 5, to: 6, type: 'similar', strength: 0.8 },
  
  // Particle contrasts
  { from: 9, to: 10, type: 'opposite', strength: 0.9 }, // は vs が
  { from: 10, to: 9, type: 'opposite', strength: 0.9 },
  { from: 11, to: 12, type: 'opposite', strength: 0.8 }, // に vs で (location)
  { from: 12, to: 11, type: 'opposite', strength: 0.8 },
  
  // I-adjective forms
  { from: 19, to: 20, type: 'opposite', strength: 0.9 }, // Present aff vs neg
  { from: 20, to: 19, type: 'opposite', strength: 0.9 },
  { from: 21, to: 22, type: 'opposite', strength: 0.9 }, // Past aff vs neg
  { from: 22, to: 21, type: 'opposite', strength: 0.9 },
  { from: 19, to: 21, type: 'similar', strength: 0.8 }, // Present vs Past
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
  opposite: '#ff4757', // Red for opposites
  similar: '#ffa502',  // Yellow for similar
  related: '#3742fa',  // Blue for related
};

// Node colors based on mastery
const NODE_COLORS = {
  mastered: '#2ed573',    // Green
  learning: '#ffa502',    // Orange
  confused: '#ff4757',    // Red
  unknown: '#747d8c',     // Gray
};

export const PatternGraph: React.FC<PatternGraphProps> = ({
  patterns,
  confusionStats,
  onSelectPattern,
  onComparePatterns,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<PatternConnection | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'confused' | 'mastered'>('all');
  const dimensions = { width: 800, height: 600 };

  // Calculate node positions using a simple force-directed layout
  const nodes = useMemo((): PatternNode[] => {
    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Group patterns by category
    const categories = [...new Set(patterns.map(p => p.category))];
    const categoryAngles: Record<string, number> = {};
    const categoryRadius = Math.min(width, height) * 0.35;
    
    categories.forEach((cat, index) => {
      categoryAngles[cat] = (index / categories.length) * 2 * Math.PI - Math.PI / 2;
    });
    
    return patterns.map((pattern) => {
      const confusionCount = confusionStats.find(c => c.patternId === pattern.id)?.count || 0;
      const totalAttempts = pattern.total_attempts || 0;
      const correctAttempts = pattern.correct_attempts || 0;
      const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
      
      // Determine mastery status
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
      
      // Calculate position based on category
      const baseAngle = categoryAngles[pattern.category] || 0;
      const patternsInCategory = patterns.filter(p => p.category === pattern.category);
      const indexInCategory = patternsInCategory.findIndex(p => p.id === pattern.id);
      const angleOffset = patternsInCategory.length > 1 
        ? ((indexInCategory - (patternsInCategory.length - 1) / 2) / patternsInCategory.length) * 0.5
        : 0;
      const angle = baseAngle + angleOffset;
      
      // Add some randomness for natural look
      const jitter = 20;
      const x = centerX + categoryRadius * Math.cos(angle) + (Math.random() - 0.5) * jitter;
      const y = centerY + categoryRadius * Math.sin(angle) + (Math.random() - 0.5) * jitter;
      
      return {
        id: pattern.id,
        pattern: pattern.pattern,
        category: pattern.category,
        x,
        y,
        masteryStatus,
        accuracy,
      };
    });
  }, [patterns, confusionStats, dimensions]);

  // Get connections for visible patterns
  const connections = useMemo((): PatternConnection[] => {
    const patternIds = new Set(patterns.map(p => p.id));
    return PREDEFINED_CONNECTIONS.filter(
      conn => patternIds.has(conn.from) && patternIds.has(conn.to)
    );
  }, [patterns]);

  // Filter nodes based on selection
  const filteredNodes = useMemo(() => {
    if (filter === 'all') return nodes;
    return nodes.filter(n => n.masteryStatus === filter);
  }, [nodes, filter]);

  // Handle node click
  const handleNodeClick = (nodeId: number) => {
    setSelectedNode(nodeId);
    setSelectedConnection(null);
    const pattern = patterns.find(p => p.id === nodeId);
    if (pattern) {
      onSelectPattern(pattern);
    }
  };

  // Handle connection click
  const handleConnectionClick = (conn: PatternConnection) => {
    setSelectedConnection(conn);
    setSelectedNode(null);
    const fromPattern = patterns.find(p => p.id === conn.from);
    const toPattern = patterns.find(p => p.id === conn.to);
    if (fromPattern && toPattern) {
      onComparePatterns([fromPattern, toPattern]);
    }
  };

  // Get node by ID
  const getNode = (id: number) => nodes.find(n => n.id === id);

  // Get connection path
  const getConnectionPath = (conn: PatternConnection): string => {
    const fromNode = getNode(conn.from);
    const toNode = getNode(conn.to);
    if (!fromNode || !toNode) return '';
    
    // Calculate control point for curved line
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    const offset = 30; // Curve offset
    
    // Perpendicular offset
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / dist * offset;
    const perpY = dx / dist * offset;
    
    const controlX = midX + perpX;
    const controlY = midY + perpY;
    
    return `M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${toNode.x} ${toNode.y}`;
  };

  // Legend items
  const legendItems = [
    { color: CONNECTION_COLORS.opposite, label: 'Opposite', dashed: false },
    { color: CONNECTION_COLORS.similar, label: 'Similar', dashed: false },
    { color: CONNECTION_COLORS.related, label: 'Related', dashed: false },
  ];

  const masteryLegendItems = [
    { color: NODE_COLORS.mastered, label: 'Mastered (>80%)' },
    { color: NODE_COLORS.learning, label: 'Learning' },
    { color: NODE_COLORS.confused, label: 'Confused' },
    { color: NODE_COLORS.unknown, label: 'Not practiced' },
  ];

  return (
    <div className="pattern-graph-modal">
      <div className="pattern-graph-content">
        <div className="pattern-graph-header">
          <h3>🕸️ Pattern Relationship Graph</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="pattern-graph-controls">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Patterns
            </button>
            <button 
              className={filter === 'confused' ? 'active' : ''}
              onClick={() => setFilter('confused')}
            >
              Confused Only
            </button>
            <button 
              className={filter === 'mastered' ? 'active' : ''}
              onClick={() => setFilter('mastered')}
            >
              Mastered Only
            </button>
          </div>
          
          <div className="graph-legend">
            <div className="legend-section">
              <span className="legend-title">Connections:</span>
              {legendItems.map(item => (
                <div key={item.label} className="legend-item">
                  <div 
                    className="legend-line" 
                    style={{ 
                      backgroundColor: item.color,
                      borderStyle: item.dashed ? 'dashed' : 'solid'
                    }} 
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="legend-section">
              <span className="legend-title">Mastery:</span>
              {masteryLegendItems.map(item => (
                <div key={item.label} className="legend-item">
                  <div 
                    className="legend-dot" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pattern-graph-container">
          <svg 
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          >
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Connections */}
            {connections.map((conn, i) => {
              const fromNode = getNode(conn.from);
              const toNode = getNode(conn.to);
              if (!fromNode || !toNode) return null;
              
              // Skip if filtered out
              if (!filteredNodes.find(n => n.id === conn.from) || 
                  !filteredNodes.find(n => n.id === conn.to)) {
                return null;
              }
              
              const isSelected = selectedConnection?.from === conn.from && 
                                selectedConnection?.to === conn.to;
              
              return (
                <g key={`${conn.from}-${conn.to}-${i}`} className="connection-group">
                  <path
                    d={getConnectionPath(conn)}
                    fill="none"
                    stroke={CONNECTION_COLORS[conn.type]}
                    strokeWidth={isSelected ? 4 : 2}
                    strokeOpacity={isSelected ? 1 : 0.6}
                    className="connection-line"
                    onClick={() => handleConnectionClick(conn)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Invisible hit area for easier clicking */}
                  <path
                    d={getConnectionPath(conn)}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={15}
                    onClick={() => handleConnectionClick(conn)}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}
            
            {/* Nodes */}
            {filteredNodes.map(node => (
              <g 
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`node-group ${selectedNode === node.id ? 'selected' : ''}`}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node circle */}
                <circle
                  r={selectedNode === node.id ? 35 : 30}
                  fill={NODE_COLORS[node.masteryStatus]}
                  stroke={selectedNode === node.id ? '#fff' : 'transparent'}
                  strokeWidth={3}
                  className="node-circle"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                
                {/* Pattern text */}
                <text
                  y={-5}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="10"
                  fontWeight="600"
                  style={{ pointerEvents: 'none', fontFamily: 'Noto Sans JP' }}
                >
                  {node.pattern.length > 10 ? node.pattern.slice(0, 8) + '...' : node.pattern}
                </text>
                
                {/* Category text */}
                <text
                  y={10}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.8)"
                  fontSize="8"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.category}
                </text>
                
                {/* Tooltip on hover */}
                {hoveredNode === node.id && (
                  <g transform="translate(40, -30)">
                    <rect
                      x="0"
                      y="0"
                      width="140"
                      height="60"
                      rx="8"
                      fill="#1a1a2e"
                      stroke="#0f3460"
                      strokeWidth="1"
                    />
                    <text x="10" y="20" fill="#fff" fontSize="11" fontWeight="600">
                      {node.pattern}
                    </text>
                    <text x="10" y="38" fill="#aaa" fontSize="9">
                      {node.category}
                    </text>
                    <text x="10" y="52" fill={NODE_COLORS[node.masteryStatus]} fontSize="9">
                      Accuracy: {Math.round(node.accuracy * 100)}%
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        <div className="pattern-graph-footer">
          <p>💡 <strong>Tip:</strong> Click a pattern node to practice it. Click a connection line to compare two patterns.</p>
        </div>
      </div>
    </div>
  );
};

export default PatternGraph;
