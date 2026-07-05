import React from 'react';
import { PatternNode, PatternConnection, CONNECTION_COLORS, NODE_COLORS, LEGEND_LABELS } from './PatternGraphTypes.js';

interface GraphSVGProps {
  svgRef: React.Ref<SVGSVGElement>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: { width: number; height: number };
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
  filteredNodes: PatternNode[];
  visibleConnections: PatternConnection[];
  selectedNode: number | null;
  selectedConnection: PatternConnection | null;
  hoveredNode: number | null;
  hoveredConnection: PatternConnection | null;
  draggedNode: number | null;
  categories: { name: string; x: number; y: number }[];
  onWheel: (e: React.WheelEvent) => void;
  onNodeClick: (nodeId: number) => void;
  onNodeMouseDown: (e: React.MouseEvent, nodeId: number, nodeX: number, nodeY: number) => void;
  onConnectionClick: (conn: PatternConnection) => void;
  onNodeMouseEnter: (nodeId: number) => void;
  onNodeMouseLeave: () => void;
  onConnectionMouseEnter: (conn: PatternConnection) => void;
  onConnectionMouseLeave: () => void;
  getNode: (id: number) => PatternNode | undefined;
  getConnectionPath: (conn: PatternConnection) => string;
}

export const GraphSVG: React.FC<GraphSVGProps> = ({
  svgRef,
  dimensions,
  zoom,
  pan,
  isDragging,
  filteredNodes,
  visibleConnections,
  selectedNode,
  selectedConnection,
  hoveredNode,
  hoveredConnection,
  draggedNode,
  categories,
  onWheel,
  onNodeClick,
  onNodeMouseDown,
  onConnectionClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onConnectionMouseEnter,
  onConnectionMouseLeave,
  getNode,
  getConnectionPath,
}) => {
  return (
    <svg
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      onWheel={onWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <defs>
        {/* Grid pattern */}
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
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
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" />
        </filter>

        {/* Glow filter for selected */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
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
        {visibleConnections.map((conn, i) => {
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
                onClick={() => onConnectionClick(conn)}
                onMouseEnter={() => onConnectionMouseEnter(conn)}
                onMouseLeave={() => onConnectionMouseLeave()}
                style={{ cursor: 'pointer' }}
              />
              {/* Invisible hit area */}
              <path
                d={getConnectionPath(conn)}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                onClick={() => onConnectionClick(conn)}
                onMouseEnter={() => onConnectionMouseEnter(conn)}
                onMouseLeave={() => onConnectionMouseLeave()}
                style={{ cursor: 'pointer' }}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {filteredNodes.map(node => {
          const isSelected = selectedNode === node.id;
          const isHovered = hoveredNode === node.id;
          const baseRadius = 30;
          const gradientId = `gradient-${node.masteryStatus}`;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className={`node-group ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => onNodeClick(node.id)}
              onMouseDown={(e) => onNodeMouseDown(e, node.id, node.x, node.y)}
              onMouseEnter={() => onNodeMouseEnter(node.id)}
              onMouseLeave={() => onNodeMouseLeave()}
              style={{ cursor: draggedNode === node.id ? 'grabbing' : 'pointer' }}
            >
              {/* Outer glow for selected */}
              {isSelected && (
                <circle
                  r={baseRadius + 8}
                  fill="none"
                  stroke={NODE_COLORS[node.masteryStatus]}
                  strokeWidth="2"
                  strokeOpacity="0.5"
                  filter="url(#glow)"
                />
              )}

              {/* Hover glow effect */}
              {isHovered && (
                <circle
                  r={baseRadius + 12}
                  fill="none"
                  stroke={NODE_COLORS[node.masteryStatus]}
                  strokeWidth="3"
                  strokeOpacity="0.3"
                />
              )}

              {/* Node circle */}
              <circle
                r={isHovered ? baseRadius + 5 : baseRadius}
                fill={`url(#${gradientId})`}
                stroke={isSelected ? '#fff' : (isHovered ? NODE_COLORS[node.masteryStatus] : 'transparent')}
                strokeWidth={isSelected ? 3 : (isHovered ? 2 : 0)}
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
            </g>
          );
        })}

        {/* Connection labels - rendered after nodes for proper z-order */}
        {visibleConnections.map((conn, i) => {
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

          if (!isHovered && !isSelected) return null;

          const path = getConnectionPath(conn);
          const match = path.match(/Q ([\d.]+) ([\d.]+)/);
          const cx = match ? parseFloat(match[1]) : (fromNode.x + toNode.x) / 2;
          const cy = match ? parseFloat(match[2]) : (fromNode.y + toNode.y) / 2;
          const labelY = cy - 25;

          return (
            <g key={`label-${conn.from}-${conn.to}-${i}`} style={{ pointerEvents: 'none' }}>
              <rect
                x={cx - 35}
                y={labelY - 12}
                width="70"
                height="24"
                rx="12"
                fill="#1a1a2e"
                stroke={CONNECTION_COLORS[conn.type]}
                strokeWidth="1"
              />
              <text
                x={cx}
                y={labelY + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="10"
                fontWeight="600"
              >
                {LEGEND_LABELS[conn.type]}
              </text>
            </g>
          );
        })}

        {/* Tooltips - rendered in separate layer after all nodes for proper z-order */}
        {filteredNodes.map(node => {
          const isHovered = hoveredNode === node.id;
          if (!isHovered) return null;

          return (
            <g key={`tooltip-${node.id}`} transform={`translate(${node.x + 45}, ${node.y - 40})`} style={{ pointerEvents: 'none' }}>
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
                Accuracy: {Math.round(node.accuracy * 100)}%
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
