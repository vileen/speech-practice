import React from 'react';

export const GraphDefs: React.FC = () => (
  <defs>
    {/* Grid pattern */}
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
    </pattern>

    {/* Node gradients */}
    <radialGradient id="gradient-mastered" cx="30%" cy="30%">
      <stop offset="0%" stopColor="#5af78e" />
      <stop offset="100%" stopColor="#2ed573" />
    </radialGradient>
    <radialGradient id="gradient-learning" cx="30%" cy="30%">
      <stop offset="0%" stopColor="#ffd166" />
      <stop offset="100%" stopColor="#ffa502" />
    </radialGradient>
    <radialGradient id="gradient-confused" cx="30%" cy="30%">
      <stop offset="0%" stopColor="#ff6b7a" />
      <stop offset="100%" stopColor="#ff4757" />
    </radialGradient>
    <radialGradient id="gradient-unknown" cx="30%" cy="30%">
      <stop offset="0%" stopColor="#9aa0a6" />
      <stop offset="100%" stopColor="#747d8c" />
    </radialGradient>

    {/* Node shadow filter */}
    <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" />
    </filter>

    {/* Glow filter for selected */}
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);
