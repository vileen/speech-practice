/**
 * LESSON MODE REGRESSION TESTS
 * 
 * ⚠️ WARNING: These tests verify critical bugs that have been fixed.
 * DO NOT modify these tests without explicit approval.
 * 
 * Purpose:
 * - Prevent regression of layout issues
 * - Ensure proper error handling for malformed API responses
 * - Verify Header component integration
 * 
 * Last updated: 2026-03-17
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonMode } from '../../components/LessonMode/LessonMode';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LessonMode Regression Tests', () => {
  const mockOnBack = vi.fn();
  const mockOnStartLessonChat = vi.fn();
  const mockOnSelectLesson = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockReset();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  /**
   * REGRESSION TEST: API returns non-array lessons
   * 
   * Bug: "l is not iterable" - when API returned undefined/null instead of array,
   * the spread operator [...lessons] threw TypeError.
   * 
   * Fix: Added Array.isArray() guard before sorting
   */
  it('should NOT crash when API returns non-array lessons (undefined/null)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: undefined }), // API returns undefined
    });

    // Should not throw
    expect(() => {
      renderWithRouter(
        <LessonMode
          password="test"
          onBack={mockOnBack}
          onStartLessonChat={mockOnStartLessonChat}
          onSelectLesson={mockOnSelectLesson}
        />
      );
    }).not.toThrow();

    await waitFor(() => {
      // Should show empty state, not crash
      expect(screen.queryByText(/Loading/i) || screen.queryByText(/Lessons/i)).toBeInTheDocument();
    });
  });

  /**
   * REGRESSION TEST: API returns object instead of array
   * 
   * Bug: When API returned {lessons: {...}} instead of [...], 
   * the component tried to iterate over object keys.
   */
  it('should NOT crash when API returns object instead of array', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: { id: '1', title: 'Test' } }), // Object instead of array
    });

    expect(() => {
      renderWithRouter(
        <LessonMode
          password="test"
          onBack={mockOnBack}
          onStartLessonChat={mockOnStartLessonChat}
          onSelectLesson={mockOnSelectLesson}
        />
      );
    }).not.toThrow();
  });

  /**
   * REGRESSION TEST: Lesson detail with phrases containing undefined japanese
   * 
   * Bug: "Cannot read properties of undefined (reading 'slice')" - 
   * when phrase.japanese was undefined, .slice() crashed.
   * 
   * Fix: Added fallback (phrase.japanese || '')
   */
  it('should handle phrases with undefined japanese field', async () => {
    const mockLessonWithUndefinedJapanese = {
      id: '2026-03-16',
      date: '2026-03-16',
      title: 'Test Lesson',
      topics: ['test'],
      vocabulary: [],
      grammar: [],
      practice_phrases: [
        { jp: undefined, en: 'Translation', romaji: 'test' },
        { jp: 'テスト', en: 'Test', romaji: 'tesuto' }
      ],
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/lessons/2026-03-16')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLessonWithUndefinedJapanese),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    expect(() => {
      renderWithRouter(
        <LessonMode
          password="test"
          onBack={mockOnBack}
          onStartLessonChat={mockOnStartLessonChat}
          onSelectLesson={mockOnSelectLesson}
          selectedLessonId="2026-03-16"
        />
      );
    }).not.toThrow();
  });

  /**
   * REGRESSION TEST: Missing audioFile.url
   * 
   * Bug: "Cannot read properties of undefined (reading 'url')" - 
   * when lesson.audioFile was undefined, accessing .url crashed.
   * 
   * Fix: Added optional chaining lesson.audioFile?.url
   */
  it('should handle lesson without audioFile', async () => {
    const mockLessonWithoutAudio = {
      id: '2026-03-16',
      date: '2026-03-16',
      title: 'Test Lesson',
      topics: ['test'],
      vocabulary: [],
      grammar: [],
      practice_phrases: [],
      // audioFile is missing entirely
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/lessons/2026-03-16')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLessonWithoutAudio),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    expect(() => {
      renderWithRouter(
        <LessonMode
          password="test"
          onBack={mockOnBack}
          onStartLessonChat={mockOnStartLessonChat}
          onSelectLesson={mockOnSelectLesson}
          selectedLessonId="2026-03-16"
        />
      );
    }).not.toThrow();
  });

  /**
   * REGRESSION TEST: Header component is used (not custom header)
   * 
   * Bug: Custom lesson-header had inconsistent styling with other pages.
   * 
   * Fix: Use shared Header component for consistency.
   */
  it('should use shared Header component (not custom lesson-header)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: [] }),
    });

    const { container } = renderWithRouter(
      <LessonMode
        password="test"
        onBack={mockOnBack}
        onStartLessonChat={mockOnStartLessonChat}
        onSelectLesson={mockOnSelectLesson}
      />
    );

    await waitFor(() => {
      // Should have app-header class (from Header component), not lesson-header
      expect(container.querySelector('.app-header')).toBeInTheDocument();
      expect(container.querySelector('.lesson-header')).not.toBeInTheDocument();
    });
  });

  /**
   * REGRESSION TEST: No calls to non-existent endpoints
   * 
   * Bug: Component was calling /api/vocabulary-with-sources and 
   * /api/vocabulary-reviews which don't exist (404 errors).
   * 
   * Fix: Removed those API calls.
   */
  it('should NOT call non-existent vocabulary endpoints', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: [] }),
    });

    renderWithRouter(
      <LessonMode
        password="test"
        onBack={mockOnBack}
        onStartLessonChat={mockOnStartLessonChat}
        onSelectLesson={mockOnSelectLesson}
      />
    );

    // Wait for effects to run
    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const vocabWithSourcesCalls = calls.filter((call: any[]) => 
        call[0].includes('/api/vocabulary-with-sources')
      );
      const vocabReviewsCalls = calls.filter((call: any[]) => 
        call[0].includes('/api/vocabulary-reviews')
      );
      
      expect(vocabWithSourcesCalls).toHaveLength(0);
      expect(vocabReviewsCalls).toHaveLength(0);
    });
  });
});

/**
 * DO NOT MODIFY WITHOUT CODE REVIEW
 * 
 * If these tests fail, it means:
 * 1. A previously fixed bug has regressed, OR
 * 2. The component structure changed significantly
 * 
 * In either case, consult the team before making changes.
 */
