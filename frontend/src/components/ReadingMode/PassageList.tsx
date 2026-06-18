import React from 'react';
import { Passage } from './types.js';
import { LEVEL_COLORS } from './constants.js';

interface PassageListProps {
  passages: Passage[];
  selectedLevel: string;
  loading: boolean;
  onLevelChange: (level: string) => void;
  onPassageSelect: (passage: Passage) => void;
}

export const PassageList: React.FC<PassageListProps> = ({
  passages,
  selectedLevel,
  loading,
  onLevelChange,
  onPassageSelect,
}) => {
  return (
    <div className="reading-list">
      <div className="reading-filters">
        <label>Filter by Level:</label>
        <select 
          value={selectedLevel} 
          onChange={(e) => onLevelChange(e.target.value)}
          className="level-select"
        >
          <option value="">All Levels</option>
          <option value="N5">N5 (Beginner)</option>
          <option value="N4">N4 (Elementary)</option>
          <option value="N3">N3 (Intermediate)</option>
        </select>
      </div>
      
      {loading ? (
        <div className="loading">Loading passages...</div>
      ) : passages.length === 0 ? (
        <div className="no-passages">No passages found.</div>
      ) : (
        <div className="passages-grid">
          {passages.map(passage => (
            <div 
              key={passage.id} 
              className="passage-card"
              onClick={() => onPassageSelect(passage)}
            >
              <div className="passage-header">
                <h3>{passage.title}</h3>
                <span 
                  className="level-badge"
                  style={{ backgroundColor: LEVEL_COLORS[passage.level] }}
                >
                  {passage.level}
                </span>
              </div>
              <div className="passage-meta">
                {passage.topic && <span className="topic">{passage.topic}</span>}
                <span className="char-count">{passage.character_count} characters</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
