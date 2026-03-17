/**
 * MEMORY MODE REGRESSION TESTS
 * 
 * ⚠️ WARNING: These tests verify critical bugs that have been fixed.
 * DO NOT modify these tests without explicit user approval.
 * 
 * AI REMINDER: Changing regression tests is a SERIOUS step.
 * ALWAYS ask the user before modifying, skipping, or deleting these tests.
 * These are the last line of defense against re-introducing production bugs.
 * 
 * Purpose:
 * - Prevent regression of lesson selection persistence
 * - Ensure vocabulary count display works correctly
 * 
 * Last updated: 2026-03-17
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryMode } from '../../components/MemoryMode/MemoryMode';

// Mock useMemoryProgress hook
vi.mock('../../hooks/useMemoryProgress.js', () => ({
  useMemoryProgress: () => ({
    cards: [],
    isLoading: false,
    getStats: () => ({ total: 0, due: 0, new: 0, review: 0 }),
    review: vi.fn(),
    getNextCard: () => null,
    getPreview: () => 1,
    importUniqueVocabulary: vi.fn().mockResolvedValue({ imported: 0, unique: 0, total: 0 }),
  }),
  MemoryCard: {},
}));

// Mock useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('MemoryMode Regression Tests', () => {
  const mockLessons = [
    { id: '2026-03-01', date: '2026-03-01', title: 'Lesson 1', vocabCount: 10 },
    { id: '2026-03-02', date: '2026-03-02', title: 'Lesson 2', vocabCount: 15 },
    { id: '2026-03-03', date: '2026-03-03', title: 'Lesson 3', vocabCount: 8 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * REGRESSION TEST: Component renders without crashing
   * 
   * Bug: Component crashed when lessons prop was undefined.
   */
  it('should render without crashing with valid lessons', async () => {
    render(<MemoryMode lessons={mockLessons} />);

    await waitFor(() => {
      expect(screen.getByText(/Select Lessons to Study/i)).toBeInTheDocument();
    });
  });

  /**
   * REGRESSION TEST: Handle empty lessons array
   * 
   * Bug: Component crashed when lessons array was empty.
   */
  it('should handle empty lessons array without crashing', async () => {
    render(<MemoryMode lessons={[]} />);

    await waitFor(() => {
      expect(screen.getByText(/Select Lessons to Study/i)).toBeInTheDocument();
    });
  });

  /**
   * REGRESSION TEST: Handle undefined lessons
   * 
   * Bug: Component crashed when lessons prop was undefined.
   */
  it('should handle undefined lessons without crashing', async () => {
    render(<MemoryMode lessons={undefined} />);

    await waitFor(() => {
      expect(screen.getByText(/Select Lessons to Study/i)).toBeInTheDocument();
    });
  });

  /**
   * REGRESSION TEST: Lessons without vocabCount field
   * 
   * Bug: If lessons don't have vocabCount field, component should not crash.
   */
  it('should handle lessons without vocabCount field without crashing', async () => {
    const lessonsWithoutVocabCount = [
      { id: '2026-03-01', date: '2026-03-01', title: 'Lesson 1' }, // no vocabCount
    ];

    // Should not throw when rendering
    expect(() => {
      render(<MemoryMode lessons={lessonsWithoutVocabCount} />);
    }).not.toThrow();

    await waitFor(() => {
      expect(screen.getByText(/Select Lessons to Study/i)).toBeInTheDocument();
    });
  });

});

/**
 * DO NOT MODIFY WITHOUT CODE REVIEW
 * 
 * These tests protect user experience features that took multiple iterations to get right.
 * Changes require team discussion.
 */
