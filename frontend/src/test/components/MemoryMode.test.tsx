import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryMode } from '../../components/MemoryMode';

// Mock the hooks
vi.mock('../../hooks/useMemoryProgress', () => ({
  useMemoryProgress: () => ({
    cards: [],
    isLoading: false,
    stats: {
      total: 0,
      new: 0,
      learning: 0,
      review: 0,
      relearning: 0,
      due: 0,
    },
    review: vi.fn(),
    getNextCard: vi.fn().mockReturnValue(null),
    getPreview: vi.fn().mockReturnValue(1),
    importFromLesson: vi.fn().mockReturnValue(2),
    resetProgress: vi.fn(),
    addCard: vi.fn(),
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
    ],
    grammar: [
      {
        pattern: '〜てください',
        explanation: 'Please do',
        examples: [{ jp: '見てください', en: 'Please look' }],
      },
    ],
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
      // Component should not crash, title should still render
      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    });

    it('should handle null lessons gracefully', () => {
      render(<MemoryMode lessons={null as any} />);
      // Component should not crash, title should still render
      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    });
  });
});
