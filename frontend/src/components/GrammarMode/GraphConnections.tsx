import React from 'react';
import { PatternNode, PatternConnection, CONNECTION_COLORS } from './PatternGraphTypes.js';

interface GraphConnectionsProps {
  visibleConnections: PatternConnection[];
  filteredNodes: PatternNode[];
  selectedConnection: PatternConnection | null;
  hoveredConnection: PatternConnection | null;
  onConnectionClick: (conn: PatternConnection) => void;
  onConnectionMouseEnter: (conn: PatternConnection) => void;
  onConnectionMouseLeave: () => void;
  getNode: (id: number) => PatternNode | undefined;
  getConnectionPath: (conn: PatternConnection) => string;
}

export const GraphConnections: React.FC<GraphConnectionsProps> = ({
  visibleConnections,
  filteredNodes,
  selectedConnection,
  hoveredConnection,
  onConnectionClick,
  onConnectionMouseEnter,
  onConnectionMouseLeave,
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
  </>
);
