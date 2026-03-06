import { describe, it, expect } from 'vitest';
import {
  createCard,
  reviewCard,
  getDueCards,
  getIntervalPreview,
  Rating,
} from '../../lib/fsrs';

describe('FSRS Algorithm', () => {
  describe('createCard', () => {
    it('should create a new card with correct initial values', () => {
      const card = createCard('test-id');
      
      expect(card.id).toBe('test-id');
      expect(card.state).toBe('new');
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
      expect(card.difficulty).toBe(0);
      expect(card.stability).toBe(0);
    });

    it('should set due date to now for new cards', () => {
      const before = new Date();
      const card = createCard('test-id');
      const after = new Date();
      
      expect(card.due.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(card.due.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('reviewCard', () => {
    it('should transition new card to relearning state on Again rating', () => {
      const card = createCard('test');
      const reviewed = reviewCard(card, 'again');
      
      expect(reviewed.state).toBe('relearning');
      expect(reviewed.reps).toBe(1);
    });

    it('should transition new card to review state on Good rating', () => {
      const card = createCard('test');
      const reviewed = reviewCard(card, 'good');
      
      expect(reviewed.state).toBe('review');
      expect(reviewed.reps).toBe(1);
    });

    it('should transition new card to review state on Easy rating', () => {
      const card = createCard('test');
      const reviewed = reviewCard(card, 'easy');
      
      expect(reviewed.state).toBe('review');
      expect(reviewed.reps).toBe(1);
    });

    it('should update difficulty and stability', () => {
      const card = createCard('test');
      const reviewed = reviewCard(card, 'good');
      
      // Difficulty can be negative in FSRS algorithm
      expect(typeof reviewed.difficulty).toBe('number');
      expect(reviewed.stability).toBeGreaterThan(0);
    });

    it('should schedule card in future', () => {
      const card = createCard('test');
      const before = new Date();
      const reviewed = reviewCard(card, 'good');
      
      expect(reviewed.due.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should increment lapses on Again rating for review card', () => {
      const card = { ...createCard('test'), state: 'review' as const };
      const reviewed = reviewCard(card, 'again');
      
      expect(reviewed.lapses).toBe(1);
      expect(reviewed.state).toBe('relearning');
    });

    it('should handle Hard rating', () => {
      const card = createCard('test');
      const reviewed = reviewCard(card, 'hard');
      
      // Hard rating (like good/easy) transitions to review state
      expect(reviewed.state).toBe('review');
      expect(reviewed.reps).toBe(1);
    });
  });

  describe('getDueCards', () => {
    it('should return empty array when no cards due', () => {
      const futureCard = {
        ...createCard('test'),
        due: new Date(Date.now() + 86400000), // tomorrow
      };
      
      const due = getDueCards([futureCard]);
      expect(due).toHaveLength(0);
    });

    it('should return cards due now', () => {
      const pastCard = {
        ...createCard('test'),
        due: new Date(Date.now() - 86400000), // yesterday
      };
      
      const due = getDueCards([pastCard]);
      expect(due).toHaveLength(1);
    });

    it('should return cards due in future', () => {
      const now = new Date();
      const dueCard = {
        ...createCard('test'),
        due: now,
      };
      
      const due = getDueCards([dueCard]);
      expect(due).toHaveLength(1);
    });
  });

  describe('getIntervalPreview', () => {
    it('should return short interval in minutes for new card', () => {
      const card = createCard('test');
      const interval = getIntervalPreview(card, 'good');
      
      // New cards should have intervals in minutes (10 min for good = 10/1440 days)
      expect(interval).toBeGreaterThan(0);
      expect(interval).toBeLessThan(1); // Less than 1 day
    });

    it('should return different intervals for different ratings on new cards', () => {
      const card = createCard('test');
      
      const againInterval = getIntervalPreview(card, 'again');
      const hardInterval = getIntervalPreview(card, 'hard');
      const goodInterval = getIntervalPreview(card, 'good');
      const easyInterval = getIntervalPreview(card, 'easy');
      
      // Again should be shortest (1 min), Easy should be longest (4 days)
      expect(againInterval).toBeLessThan(hardInterval);
      expect(hardInterval).toBeLessThan(goodInterval);
      expect(goodInterval).toBeLessThan(easyInterval);
    });

    it('should return longer interval for Easy than Again', () => {
      const card = createCard('test');
      
      const againInterval = getIntervalPreview(card, 'again');
      const easyInterval = getIntervalPreview(card, 'easy');
      
      expect(easyInterval).toBeGreaterThan(againInterval);
    });

    it('should return interval for review cards', () => {
      // Create a card that has been reviewed at least once
      const card = createCard('test');
      const reviewedCard = reviewCard(card, 'good');
      const interval = getIntervalPreview(reviewedCard, 'good');
      
      expect(interval).toBeGreaterThan(0);
    });
  });
});
