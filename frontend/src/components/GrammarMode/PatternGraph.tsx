import React, { useRef, useCallback } from 'react';
import { usePatternGraph } from '../../hooks/usePatternGraph.js';
import { usePatternGraphInteraction } from '../../hooks/usePatternGraphInteraction.js';
import { LegendPanel } from './PatternGraphLegend.js';
import { GraphSVG } from './PatternGraphSVG.js';
import { PatternGraphProps } from './PatternGraphTypes.js';
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

  const {
    dimensions,
    filter,
    setFilter,
    grammarPatterns,
    connections,
    loadingConnections,
    filteredNodes,
    visibleConnections,
    categories,
    updateNodePosition,
  } = usePatternGraph({ patterns, confusionStats });

  const {
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
  } = usePatternGraphInteraction({
    svgRef,
    grammarPatterns,
    filteredNodes,
    onSelectPattern,
    onComparePatterns,
  });

  // Merge node drag with pan
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode !== null) {
      handleNodeMouseMove(e, updateNodePosition);
    } else if (isDragging) {
      handlePanMove(e);
    }
  }, [draggedNode, isDragging, handleNodeMouseMove, handlePanMove, updateNodePosition]);

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
            onMouseMove={handleMouseMove}
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
