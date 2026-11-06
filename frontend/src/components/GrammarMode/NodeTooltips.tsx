import React from 'react';
import { PatternNode, NODE_COLORS } from './PatternGraphTypes.js';

interface NodeTooltipsProps {
  filteredNodes: PatternNode[];
  hoveredNode: number | null;
}

export const NodeTooltips: React.FC<NodeTooltipsProps> = ({
  filteredNodes,
  hoveredNode,
}) => (
  <>
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
  </>
);
