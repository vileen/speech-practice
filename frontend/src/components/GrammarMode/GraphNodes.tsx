import React from 'react';
import { PatternNode, NODE_COLORS } from './PatternGraphTypes.js';

interface GraphNodesProps {
  filteredNodes: PatternNode[];
  selectedNode: number | null;
  hoveredNode: number | null;
  draggedNode: number | null;
  onNodeClick: (nodeId: number) => void;
  onNodeMouseDown: (e: React.MouseEvent, nodeId: number, nodeX: number, nodeY: number) => void;
  onNodeMouseEnter: (nodeId: number) => void;
  onNodeMouseLeave: () => void;
}

const BASE_RADIUS = 30;

export const GraphNodes: React.FC<GraphNodesProps> = ({
  filteredNodes,
  selectedNode,
  hoveredNode,
  draggedNode,
  onNodeClick,
  onNodeMouseDown,
  onNodeMouseEnter,
  onNodeMouseLeave,
}) => (
  <>
    {filteredNodes.map(node => {
      const isSelected = selectedNode === node.id;
      const isHovered = hoveredNode === node.id;
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
              r={BASE_RADIUS + 8}
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
              r={BASE_RADIUS + 12}
              fill="none"
              stroke={NODE_COLORS[node.masteryStatus]}
              strokeWidth="3"
              strokeOpacity="0.3"
            />
          )}

          {/* Node circle */}
          <circle
            r={isHovered ? BASE_RADIUS + 5 : BASE_RADIUS}
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
  </>
);
