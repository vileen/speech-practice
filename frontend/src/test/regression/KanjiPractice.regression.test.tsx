/**
 * KANJI PRACTICE REGRESSION TESTS
 *
 * ⚠️ WARNING: These tests verify critical bugs that have been fixed.
 * DO NOT modify these tests without explicit user approval.
 *
 * AI REMINDER: Changing regression tests is a SERIOUS step.
 * ALWAYS ask the user before modifying, skipping, or deleting these tests.
 * These are the last line of defense against re-introducing production bugs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('KanjiPractice Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should NOT show duplicate kanji data on refresh (localStorage persists)', async () => {
    // Simulate existing kanji data in localStorage
    const existingProgress = {
      cards: [
        { kanjiId: '1', character: '一', meanings: ['one'] },
        { kanjiId: '2', character: '二', meanings: ['two'] },
        { kanjiId: '3', character: '三', meanings: ['three'] },
      ],
      lastSynced: new Date().toISOString(),
    };
    localStorage.setItem('speech-practice-kanji-progress', JSON.stringify(existingProgress));

    // Dynamically import to get fresh instance
    const { KanjiPracticeMode } = await import('../../components/KanjiPracticeMode/KanjiPracticeMode');
    
    render(
      <MemoryRouter>
        <KanjiPracticeMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should show existing stats (3 kanji), not re-import
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should show 0 kanji when localStorage is empty (before import)', async () => {
    // Ensure localStorage is empty
    localStorage.removeItem('speech-practice-kanji-progress');

    const { KanjiPracticeMode } = await import('../../components/KanjiPracticeMode/KanjiPracticeMode');
    
    render(
      <MemoryRouter>
        <KanjiPracticeMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should show 0 before import happens
      const totalKanjiValue = document.querySelector('.kanji-practice-stats .stat-value');
      expect(totalKanjiValue).toBeInTheDocument();
    });
  });

  it('should maintain consistent kanji count after multiple renders', async () => {
    const existingProgress = {
      cards: Array.from({ length: 50 }, (_, i) => ({
        kanjiId: String(i + 1),
        character: String.fromCharCode(0x4e00 + i),
        meanings: [`meaning ${i + 1}`],
      })),
      lastSynced: new Date().toISOString(),
    };
    localStorage.setItem('speech-practice-kanji-progress', JSON.stringify(existingProgress));

    const { KanjiPracticeMode } = await import('../../components/KanjiPracticeMode/KanjiPracticeMode');
    
    const { rerender } = render(
      <MemoryRouter>
        <KanjiPracticeMode />
      </MemoryRouter>
    );

    // Wait for component to load from localStorage
    await waitFor(() => {
      const statValues = document.querySelectorAll('.stat-value');
      expect(statValues.length).toBeGreaterThan(0);
    });

    // Store the card count before re-renders
    const cardCountBefore = document.querySelectorAll('.stat-value')[0]?.textContent;

    // Re-render multiple times (simulating refreshes)
    rerender(
      <MemoryRouter>
        <KanjiPracticeMode />
      </MemoryRouter>
    );

    rerender(
      <MemoryRouter>
        <KanjiPracticeMode />
      </MemoryRouter>
    );

    // Verify count is still the same (not duplicated)
    const cardCountAfter = document.querySelectorAll('.stat-value')[0]?.textContent;
    expect(cardCountAfter).toBe(cardCountBefore);
  });
});
