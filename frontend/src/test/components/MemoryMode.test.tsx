import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryMode } from '../../components/MemoryMode';

// Mock the hooks
const mockReview = vi.fn();
const mockGetNextCard = vi.fn();
const mockGetPreview = vi.fn().mockReturnValue(1);
const mockImportFromLesson = vi.fn().mockReturnValue(2);
const mockResetProgress = vi.fn();
const mockAddCard = vi.fn();

vi.mock('../../hooks/useMemoryProgress', () => ({
  useMemoryProgress: () => ({
    cards: [
      { id: '1', front: '学校', back: 'school', state: 0, due: new Date().toISOString() },
      { id: '2', front: '先生', back: 'teacher', state: 1, due: new Date().toISOString() },
    ],
    isLoading: false,
    stats: {
      total: 2,
      new: 1,
      learning: 1,
      review: 0,
      relearning: 0,
      due: 2,
    },
    review: mockReview,
    getNextCard: mockGetNextCard,
    getPreview: mockGetPreview,
    importFromLesson: mockImportFromLesson,
    resetProgress: mockResetProgress,
    addCard: mockAddCard,
  }),
}));

const mockLessons = [
  {
    id: 1,
    date: '2026-03-04',
    title: 'Test Lesson 1',
    order: 1,
    topics: ['grammar'],
    vocabCount: 5,
    grammarCount: 2,
    vocabulary: [
      { jp: '学校', en: 'school', reading: 'がっこう', romaji: 'gakkou' },
      { jp: '先生', en: 'teacher', reading: 'せんせい', romaji: 'sensei' },
    ],
    grammar: [
      {
        pattern: '〜てください',
        explanation: 'Please do',
        examples: [{ jp: '見てください', en: 'Please look' }],
      },
    ],
  },
  {
    id: 2,
    date: '2026-03-05',
    title: 'Test Lesson 2',
    order: 2,
    topics: ['vocabulary'],
    vocabCount: 3,
    grammarCount: 0,
    vocabulary: [
      { jp: '本', en: 'book', reading: 'ほん', romaji: 'hon' },
    ],
    grammar: [],
  },
];

describe('MemoryMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Setup Screen', () => {
    it('should render setup screen with title', () => {
      render(<MemoryMode lessons={mockLessons} />);
      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    });

    it('should display stats grid', () => {
      render(<MemoryMode lessons={mockLessons} />);
      expect(screen.getByText('Total Cards')).toBeInTheDocument();
      expect(screen.getByText('Due Now')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('In Review')).toBeInTheDocument();
    });

    it('should render lesson selection chips', () => {
      render(<MemoryMode lessons={mockLessons} />);
      expect(screen.getByText('Test Lesson 1')).toBeInTheDocument();
      expect(screen.getByText('Test Lesson 2')).toBeInTheDocument();
    });

    it('should handle empty lessons array', () => {
      render(<MemoryMode lessons={[]} />);
      expect(screen.getByText(/No lessons available/)).toBeInTheDocument();
    });

    it('should show hint when no lessons selected', () => {
      render(<MemoryMode lessons={mockLessons} />);
      expect(screen.getByText(/Select at least one lesson/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined lessons gracefully', () => {
      render(<MemoryMode lessons={undefined as any} />);
      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    });

    it('should handle null lessons gracefully', () => {
      render(<MemoryMode lessons={null as any} />);
      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    });

    it('should handle lessons without vocabulary', () => {
      const lessonsWithoutVocab = [{
        ...mockLessons[0],
        vocabulary: [],
      }];
      render(<MemoryMode lessons={lessonsWithoutVocab} />);
      expect(screen.getByText('Test Lesson 1')).toBeInTheDocument();
    });
  });
});
