import React from 'react';

interface MemoryModeCompleteProps {
  onReset: () => void;
}

export const MemoryModeComplete: React.FC<MemoryModeCompleteProps> = ({ onReset }) => {
  return (
    <div className="memory-mode-complete">
      <div className="complete-icon">✓</div>
      <h2>Session Complete!</h2>
      <p>Great job. Come back when more cards are due for review.</p>
      <button className="start-btn" onClick={onReset}>
        New Session
      </button>
    </div>
  );
};
