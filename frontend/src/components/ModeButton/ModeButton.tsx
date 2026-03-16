import React from 'react';
import './ModeButton.css';

interface ModeButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'default';
  borderColor?: string;
}

export const ModeButton: React.FC<ModeButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  variant = 'default',
  borderColor 
}) => {
  const style = borderColor ? { '--border-color': borderColor } as React.CSSProperties : undefined;
  
  return (
    <button 
      className={`mode-button ${variant}`}
      onClick={onClick}
      style={style}
    >
      <span className="mode-button-icon">{icon}</span>
      <span className="mode-button-label">{label}</span>
    </button>
  );
};
