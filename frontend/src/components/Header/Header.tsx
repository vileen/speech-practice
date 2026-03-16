import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  icon?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton = true,
  icon 
}) => {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-left">
        {showBackButton && (
          <button 
            className="back-btn" 
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            ← Back
          </button>
        )}
      </div>
      
      <div className="header-center">
        <h1>
          {icon && <span className="header-icon">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      
      <div className="header-right">
        {/* Space for future actions like settings */}
      </div>
    </header>
  );
};
