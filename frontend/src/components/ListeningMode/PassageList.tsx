import React from 'react';
import { ListeningPassage } from '../../hooks/useListeningMode.js';

const LEVEL_COLORS: Record<string, string> = {
  N5: '#4ade80',
  N4: '#60a5fa',
  N3: '#fbbf24',
};

interface PassageListProps {
  passages: ListeningPassage[];
  loading: boolean;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  onPassageClick: (passage: ListeningPassage) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PassageList: React.FC<PassageListProps> = ({
  passages,
  loading,
  selectedLevel,
  onLevelChange,
  onPassageClick,
}) => {
  return (
    <div className="listening-list">
      <div className="listening-filters">
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
        <div className="no-passages">No listening passages found.</div>
      ) : (
        <div className="passages-grid">
          {passages.map(passage => (
            <div 
              key={passage.id} 
              className="passage-card"
              onClick={() => onPassageClick(passage)}
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
                {passage.topic_category && (
                  <span className="topic">{passage.topic_category}</span>
                )}
                {passage.duration_seconds && (
                  <span className="duration">{formatTime(passage.duration_seconds)}</span>
                )}
                {passage.difficulty_speed && (
                  <span className="speed">{passage.difficulty_speed}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
