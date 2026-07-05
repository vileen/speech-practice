import { GrammarPattern } from './GrammarMode.js';

export interface PatternNode {
  id: number;
  pattern: string;
  category: string;
  x: number;
  y: number;
  masteryStatus: 'mastered' | 'learning' | 'confused' | 'unknown';
  accuracy: number;
  vx: number;
  vy: number;
}

export interface PatternConnection {
  from: number;
  to: number;
  type: 'opposite' | 'similar' | 'related' | 'confused';
  strength: number;
}

export interface ApiRelationship {
  id: number;
  from_pattern_id: number;
  to_pattern_id: number;
  relationship_type: 'opposite' | 'similar' | 'related' | 'confused';
  strength: number;
  description?: string;
}

export interface PatternGraphProps {
  patterns: GrammarPattern[];
  confusionStats: { patternId: number; count: number }[];
  onSelectPattern: (pattern: GrammarPattern) => void;
  onComparePatterns: (patterns: GrammarPattern[]) => void;
  onClose: () => void;
}

// Color schemes for different connection types
export const CONNECTION_COLORS: Record<string, string> = {
  opposite: '#ff4757',
  similar: '#ffa502',
  related: '#3742fa',
  confused: '#ff00ff',
};

// Node colors based on mastery
export const NODE_COLORS = {
  mastered: '#2ed573',
  learning: '#ffa502',
  confused: '#ff4757',
  unknown: '#747d8c',
};

// Legend labels in English
export const LEGEND_LABELS: Record<string, string> = {
  opposite: 'Opposite',
  similar: 'Similar',
  related: 'Related',
  confused: 'Confused',
  mastered: 'Mastered',
  learning: 'Learning',
  unknown: 'Not Practiced',
};
