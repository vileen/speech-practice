// FSRS-4.5 Algorithm Implementation
// Based on open-spaced-repetition/ts-fsrs

export interface Card {
  id: string;
  due: Date;
  stability: number;    // S
  difficulty: number;   // D
  elapsedDays: number;  // last review interval
  scheduledDays: number; // next scheduled interval
  reps: number;         // review count
  lapses: number;       // fail count
  state: 'new' | 'learning' | 'review' | 'relearning';
  lastReview?: Date;
}

export interface ReviewLog {
  rating: Rating;
  reviewDate: Date;
  scheduledDays: number;
  elapsedDays: number;
  takenTime?: number;
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

// FSRS parameters (default values)
const FSRS_PARAMS = {
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
  requestRetention: 0.9,
  maximumInterval: 36500, // ~100 years
  easyBonus: 1.3,
  hardInterval: 1.2,
};

// Get initial difficulty
function initDifficulty(rating: Rating): number {
  const w = FSRS_PARAMS.w;
  const ratingMap = { again: 1, hard: 2, good: 3, easy: 4 };
  const r = ratingMap[rating];
  return w[4] - Math.exp((r - 1) * w[5]) + 1;
}

// Get initial stability
function initStability(rating: Rating): number {
  const w = FSRS_PARAMS.w;
  const ratingMap = { again: 1, hard: 2, good: 3, easy: 4 };
  const r = ratingMap[rating];
  return Math.max(0.1, w[r - 1]);
}

// Calculate next difficulty
function nextDifficulty(d: number, rating: Rating): number {
  const w = FSRS_PARAMS.w;
  const ratingMap = { again: 1, hard: 2, good: 3, easy: 4 };
  const r = ratingMap[rating];
  const retrievability = Math.exp((r - 1) * w[5]);
  return w[4] - retrievability + Math.exp((10 - d) * w[6]);
}

// Calculate next stability
function nextStability(s: number, d: number, rating: Rating): number {
  const w = FSRS_PARAMS.w;
  const hardPenalty = rating === 'hard' ? w[15] : 1;
  const easyBonus = rating === 'easy' ? w[16] : 1;
  
  if (rating === 'again') {
    return w[8] * Math.pow(d, -w[9]) * (Math.pow(s + 1, w[10]) - 1) * Math.exp((1 - 1) * w[11]);
  }
  
  return s * (1 + Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) * (Math.exp((1 - 1) * w[10]) - 1)) * hardPenalty * easyBonus;
}

// Calculate interval
function nextInterval(s: number): number {
  const interval = s * Math.log(FSRS_PARAMS.requestRetention) / Math.log(0.9);
  return Math.min(Math.max(1, Math.round(interval)), FSRS_PARAMS.maximumInterval);
}

// Get initial interval for new cards (in minutes)
function initInterval(rating: Rating): number {
  // For new cards, use minutes instead of days
  const intervals = {
    again: 1,     // 1 minute
    hard: 5,      // 5 minutes
    good: 10,     // 10 minutes
    easy: 30,     // 30 minutes (not 4 days!)
  };
  return intervals[rating];
}

// Main review function
export function reviewCard(card: Card, rating: Rating, now: Date = new Date()): Card {
  const elapsedDays = card.lastReview 
    ? Math.max(0, (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  let newCard: Card = { ...card };
  
  if (card.state === 'new') {
    // First review - use minutes for intervals
    newCard.state = 'learning';
    newCard.stability = initStability(rating);
    newCard.difficulty = initDifficulty(rating);
    
    // For new cards, scheduledDays is actually in minutes for the first review
    const intervalMinutes = initInterval(rating);
    newCard.scheduledDays = intervalMinutes / (24 * 60); // Convert to days for consistency
    
    if (rating === 'again') {
      newCard.lapses += 1;
      newCard.state = 'relearning';
    } else {
      newCard.state = 'review';
    }
    
    newCard.elapsedDays = 0;
    newCard.reps += 1;
    newCard.lastReview = now;
    // For new cards, due date is in minutes
    newCard.due = new Date(now.getTime() + intervalMinutes * 60 * 1000);
    
    return newCard;
  }
  
  // Subsequent reviews
  newCard.difficulty = nextDifficulty(card.difficulty, rating);
  newCard.stability = nextStability(card.stability, card.difficulty, rating);
  
  if (rating === 'again') {
    newCard.lapses += 1;
    newCard.state = 'relearning';
  } else {
    newCard.state = 'review';
  }
  
  newCard.scheduledDays = nextInterval(newCard.stability);
  newCard.elapsedDays = elapsedDays;
  newCard.reps += 1;
  newCard.lastReview = now;
  newCard.due = new Date(now.getTime() + newCard.scheduledDays * 24 * 60 * 60 * 1000);
  
  return newCard;
}

// Create new card
export function createCard(id: string, now: Date = new Date()): Card {
  return {
    id,
    due: now,
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 'new',
  };
}

// Get cards due for review
export function getDueCards(cards: Card[], now: Date = new Date()): Card[] {
  return cards.filter(card => card.due <= now);
}

// Get next interval preview (for UI)
export function getIntervalPreview(card: Card, rating: Rating): number {
  const tempCard = { ...card };
  const reviewed = reviewCard(tempCard, rating);
  return reviewed.scheduledDays;
}

export default {
  reviewCard,
  createCard,
  getDueCards,
  getIntervalPreview,
};
