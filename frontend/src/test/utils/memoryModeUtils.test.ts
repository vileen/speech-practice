import { describe, it, expect } from 'vitest';
import {
  formatInterval,
  getTypeLabel,
  getCardStatus,
} from '../../components/MemoryMode/memoryModeUtils.js';
import type { MemoryCard } from '../../hooks/useMemoryProgress.js';

const makeCard = (overrides: Partial<MemoryCard> = {}): MemoryCard => ({
  id: 'card-1',
  due: new Date('2026-09-14T00:00:00Z'),
  stability: 2,
  difficulty: 5,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  state: 'new',
  phraseId: 'phrase-1',
  phraseType: 'vocabulary',
  lessonId: 'lesson-1',
  jp: 'こんにちは',
  en: 'hello',
  ...overrides,
});

describe('formatInterval', () => {
  it('formats sub-minute intervals as "< 1m"', () => {
    expect(formatInterval(0)).toBe('< 1m');
    expect(formatInterval(1 / 1440 / 4)).toBe('< 1m'); // quarter minute in days
  });

  it('formats minute intervals', () => {
    expect(formatInterval(10 / 1440)).toBe('10m'); // 10 minutes
    expect(formatInterval(1 / 1440)).toBe('1m');
  });

  it('formats hour intervals', () => {
    expect(formatInterval(0.5)).toBe('12h');
    expect(formatInterval(23 / 24)).toBe('23h');
  });

  it('formats exactly one day as "1d"', () => {
    expect(formatInterval(1)).toBe('1d');
  });

  it('formats day intervals', () => {
    expect(formatInterval(3.4)).toBe('3d');
    expect(formatInterval(29.6)).toBe('30d');
  });

  it('formats month intervals', () => {
    expect(formatInterval(30)).toBe('1mo');
    expect(formatInterval(90)).toBe('3mo');
    expect(formatInterval(364)).toBe('12mo');
  });

  it('formats year intervals', () => {
    expect(formatInterval(365)).toBe('1y');
    expect(formatInterval(730)).toBe('2y');
  });
});

describe('getTypeLabel', () => {
  it('returns "Vocabulary" for vocabulary cards', () => {
    expect(getTypeLabel(makeCard({ phraseType: 'vocabulary' }))).toBe('Vocabulary');
  });

  it('returns "Grammar" for grammar cards', () => {
    expect(getTypeLabel(makeCard({ phraseType: 'grammar' }))).toBe('Grammar');
  });
});

describe('getCardStatus', () => {
  it('returns "New" for new cards', () => {
    expect(getCardStatus(makeCard({ state: 'new' }))).toBe('New');
  });

  it('returns "Learning" for learning cards', () => {
    expect(getCardStatus(makeCard({ state: 'learning' }))).toBe('Learning');
  });

  it('returns "Relearning" for relearning cards', () => {
    expect(getCardStatus(makeCard({ state: 'relearning' }))).toBe('Relearning');
  });

  it('returns review status with rep count for review cards', () => {
    expect(getCardStatus(makeCard({ state: 'review', reps: 5 }))).toBe('Review (5x)');
    expect(getCardStatus(makeCard({ state: 'review', reps: 1 }))).toBe('Review (1x)');
    expect(getCardStatus(makeCard({ state: 'review', reps: 0 }))).toBe('Review (0x)');
  });
});
