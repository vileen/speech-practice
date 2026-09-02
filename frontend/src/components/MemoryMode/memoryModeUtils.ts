import type { MemoryCard } from '../../hooks/useMemoryProgress.js';

// Format interval for display (handles minutes for new cards)
export const formatInterval = (days: number): string => {
  // Convert days to minutes if less than 1 day
  if (days < 1 / 24) {
    const minutes = Math.round(days * 24 * 60);
    if (minutes < 1) return '< 1m';
    return `${minutes}m`;
  }
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours}h`;
  }
  if (days === 1) return '1d';
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
};

// Get card type label
export const getTypeLabel = (card: MemoryCard): string => {
  return card.phraseType === 'vocabulary' ? 'Vocabulary' : 'Grammar';
};

// Get card status
export const getCardStatus = (card: MemoryCard): string => {
  if (card.state === 'new') return 'New';
  if (card.state === 'learning') return 'Learning';
  if (card.state === 'relearning') return 'Relearning';
  return `Review (${card.reps}x)`;
};
