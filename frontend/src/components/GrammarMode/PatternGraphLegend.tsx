import React from 'react';
import { CONNECTION_COLORS, NODE_COLORS, LEGEND_LABELS } from './PatternGraphTypes.js';

interface LegendPanelProps {
  loadingConnections: boolean;
}

export const LegendPanel: React.FC<LegendPanelProps> = ({ loadingConnections }) => {
  return (
    <div className="pattern-graph-sidebar">
      <div className="legend-section-panel">
        <h4>🔴 Connection Type</h4>
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
          <div className="legend-item">
            <div className="legend-line" style={{ backgroundColor: CONNECTION_COLORS.confused }} />
            <span>{LEGEND_LABELS.confused}</span>
          </div>
        </div>
      </div>

      <div className="legend-section-panel">
        <h4>🟢 Mastery Status</h4>
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

      {loadingConnections && (
        <div className="legend-section-panel">
          <h4>⏳ Loading...</h4>
          <p style={{ fontSize: '12px', color: '#aaa' }}>Fetching pattern relationships...</p>
        </div>
      )}

      <div className="legend-tips">
        <h4>💡 Tips</h4>
        <ul>
          <li>Click node to practice pattern</li>
          <li>Click connection to compare</li>
          <li>Drag to pan the view</li>
          <li>Use scroll to zoom in/out</li>
        </ul>
      </div>
    </div>
  );
};
