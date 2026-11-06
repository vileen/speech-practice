import React from 'react';
import { PatternNode, PatternConnection, CONNECTION_COLORS, LEGEND_LABELS } from './PatternGraphTypes.js';

interface ConnectionLabelsProps {
  visibleConnections: PatternConnection[];
  filteredNodes: PatternNode[];
  selectedConnection: PatternConnection | null;
  hoveredConnection: PatternConnection | null;
  getNode: (id: number) => PatternNode | undefined;
  getConnectionPath: (conn: PatternConnection) => string;
}

export const ConnectionLabels: React.FC<ConnectionLabelsProps> = ({
  visibleConnections,
  filteredNodes,
  selectedConnection,
  hoveredConnection,
  getNode,
  getConnectionPath,
}) => (
  <>
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
  </>
);
