import React from 'react';
import { PatternNode, PatternConnection } from './PatternGraphTypes.js';
import { GraphDefs } from './GraphDefs.js';
import { GraphConnections } from './GraphConnections.js';
import { GraphNodes } from './GraphNodes.js';
import { ConnectionLabels } from './ConnectionLabels.js';
import { NodeTooltips } from './NodeTooltips.js';

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
      <GraphDefs />

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

        <GraphConnections
          visibleConnections={visibleConnections}
          filteredNodes={filteredNodes}
          selectedConnection={selectedConnection}
          hoveredConnection={hoveredConnection}
          onConnectionClick={onConnectionClick}
          onConnectionMouseEnter={onConnectionMouseEnter}
          onConnectionMouseLeave={onConnectionMouseLeave}
          getNode={getNode}
          getConnectionPath={getConnectionPath}
        />

        <GraphNodes
          filteredNodes={filteredNodes}
          selectedNode={selectedNode}
          hoveredNode={hoveredNode}
          draggedNode={draggedNode}
          onNodeClick={onNodeClick}
          onNodeMouseDown={onNodeMouseDown}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
        />

        {/* Connection labels - rendered after nodes for proper z-order */}
        <ConnectionLabels
          visibleConnections={visibleConnections}
          filteredNodes={filteredNodes}
          selectedConnection={selectedConnection}
          hoveredConnection={hoveredConnection}
          getNode={getNode}
          getConnectionPath={getConnectionPath}
        />

        {/* Tooltips - rendered in separate layer after all nodes for proper z-order */}
        <NodeTooltips
          filteredNodes={filteredNodes}
          hoveredNode={hoveredNode}
        />
      </g>
    </svg>
  );
};
