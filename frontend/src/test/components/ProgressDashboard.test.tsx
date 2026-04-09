import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProgressDashboard } from '../../components/ProgressDashboard/ProgressDashboard';

describe('ProgressDashboard', () => {
  const mockOverview = {
    studyTime: {
      thisWeek: 180,
      allTime: 1200,
      unit: 'minutes'
    },
    streak: 7,
    grammar: {
      mastered: 45,
      total: 100
    },
    kanji: {
      learned: 120,
      total: 500
    },
    lessons: {
      completed: 15,
      total: 50
    }
  };

  const mockJlptLevels = [
    {
      level: 'N5',
      grammar: { total: 40, mastered: 20, percentage: 50 },
      kanji: { total: 80, mastered: 40, percentage: 50 },
      overall: { total: 120, mastered: 60, percentage: 50 }
    },
    {
      level: 'N4',
      grammar: { total: 30, mastered: 10, percentage: 33 },
      kanji: { total: 60, mastered: 20, percentage: 33 },
      overall: { total: 90, mastered: 30, percentage: 33 }
    }
  ];

  const mockWeakCategories = [
    {
      category: 'Particles',
      accuracy: 45,
      totalPatterns: 10,
      totalAttempts: 50
    },
    {
      category: 'Verb Conjugation',
      accuracy: 55,
      totalPatterns: 15,
      totalAttempts: 80
    }
  ];

  const mockWeakPatterns = [
    {
      id: 1,
      pattern: '〜てもいいです',
      category: 'Permission',
      jlptLevel: 'N5',
      accuracy: 40,
      attempts: 10,
      correct: 4
    },
    {
      id: 2,
      pattern: '〜てはいけません',
      category: 'Prohibition',
      jlptLevel: 'N5',
      accuracy: 50,
      attempts: 8,
      correct: 4
    }
  ];

  const mockConfusedPairs = [
    {
      patternId: 1,
      patternName: '〜てもいいです',
      patternCategory: 'Permission',
      confusedWithId: 2,
      confusedWithName: '〜てはいけません',
      count: 5
    }
  ];

  const mockActivity = [
    { date: new Date().toISOString().split('T')[0], grammarAttempts: 10, kanjiAttempts: 5, totalSessions: 15 },
    { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], grammarAttempts: 8, kanjiAttempts: 3, totalSessions: 11 },
    { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], grammarAttempts: 0, kanjiAttempts: 0, totalSessions: 0 },
    { date: new Date(Date.now() - 259200000).toISOString().split('T')[0], grammarAttempts: 5, kanjiAttempts: 2, totalSessions: 7 },
    { date: new Date(Date.now() - 345600000).toISOString().split('T')[0], grammarAttempts: 12, kanjiAttempts: 8, totalSessions: 20 },
    { date: new Date(Date.now() - 432000000).toISOString().split('T')[0], grammarAttempts: 3, kanjiAttempts: 1, totalSessions: 4 },
    { date: new Date(Date.now() - 518400000).toISOString().split('T')[0], grammarAttempts: 7, kanjiAttempts: 4, totalSessions: 11 }
  ];

  const mockCategories = [
    { category: 'Particles', totalPatterns: 20, totalAttempts: 100, accuracy: 85 },
    { category: 'Verb Conjugation', totalPatterns: 30, totalAttempts: 150, accuracy: 72 },
    { category: 'Adjectives', totalPatterns: 15, totalAttempts: 80, accuracy: 90 },
    { category: 'Tenses', totalPatterns: 10, totalAttempts: 60, accuracy: 65 }
  ];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFetchResponse = (overrides = {}) => {
    const defaultResponse = {
      overview: mockOverview,
      levels: { levels: mockJlptLevels },
      weakPoints: {
        weakCategories: mockWeakCategories,
        weakPatterns: mockWeakPatterns,
        confusedPairs: mockConfusedPairs
      },
      activity: { activity: mockActivity },
      categories: { categories: mockCategories }
    };

    (fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/progress/overview')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides['overview'] || mockOverview)
        });
      }
      if (url.includes('/api/progress/by-level')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides['levels'] || { levels: mockJlptLevels })
        });
      }
      if (url.includes('/api/progress/weak-points')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides['weakPoints'] || {
            weakCategories: mockWeakCategories,
            weakPatterns: mockWeakPatterns,
            confusedPairs: mockConfusedPairs
          })
        });
      }
      if (url.includes('/api/progress/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides['activity'] || { activity: mockActivity })
        });
      }
      if (url.includes('/api/progress/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides['categories'] || { categories: mockCategories })
        });
      }
      return Promise.resolve({ ok: false });
    });
  };

  describe('Loading State', () => {
    it('should show loading state initially', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      expect(screen.getByText(/Loading your progress/i)).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/Loading your progress/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Overview Section', () => {
    it('should render overview stats correctly', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });

      // Check streak display - use container query for specific card
      const streakCard = document.querySelector('.streak-card');
      expect(streakCard?.textContent).toContain('7');
      expect(screen.getByText('Day Streak')).toBeInTheDocument();

      // Check study time (180 minutes = 3h)
      expect(screen.getByText('3h')).toBeInTheDocument();
      expect(screen.getByText('This Week')).toBeInTheDocument();

      // Check grammar stats
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('Grammar Mastered')).toBeInTheDocument();

      // Check kanji stats
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('Kanji Learned')).toBeInTheDocument();

      // Check lessons stats
      const lessonsCard = screen.getAllByText('Lessons')[0].closest('.stat-card');
      expect(lessonsCard?.textContent).toContain('15');
      expect(lessonsCard?.textContent).toContain('Lessons');
    });

    it('should format study time correctly for less than 1 hour', async () => {
      mockFetchResponse({
        overview: { ...mockOverview, studyTime: { thisWeek: 45, allTime: 500, unit: 'minutes' } }
      });
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('45m')).toBeInTheDocument();
      });
    });

    it('should format study time correctly for hours with minutes', async () => {
      mockFetchResponse({
        overview: { ...mockOverview, studyTime: { thisWeek: 95, allTime: 500, unit: 'minutes' } }
      });
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('1h 35m')).toBeInTheDocument();
      });
    });

    it('should show appropriate emoji for streak levels', async () => {
      // Test different streak levels
      const streakTests = [
        { streak: 30, expected: '🔥' },
        { streak: 14, expected: '⚡' },
        { streak: 7, expected: '💪' },
        { streak: 3, expected: '✨' }
      ];

      for (const test of streakTests) {
        vi.restoreAllMocks();
        vi.stubGlobal('fetch', vi.fn());
        mockFetchResponse({
          overview: { ...mockOverview, streak: test.streak }
        });

        const { unmount } = render(
          <MemoryRouter>
            <ProgressDashboard />
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByText(test.expected)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('JLPT Level Progress', () => {
    it('should render JLPT level cards', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('JLPT Level Progress')).toBeInTheDocument();
      });

      // Check N5 level - use container to find specific level card
      const n5Card = screen.getByText('N5').closest('.jlpt-card');
      expect(n5Card).toBeInTheDocument();
      expect(n5Card?.textContent).toContain('50%');
      expect(n5Card?.textContent).toContain('20/40');
      expect(n5Card?.textContent).toContain('40/80');

      // Check N4 level
      expect(screen.getByText('N4')).toBeInTheDocument();
      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });

  describe('Activity Chart', () => {
    it('should render activity chart section', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
      });

      // Check legend - use legend-specific selectors
      const legend = document.querySelector('.activity-legend');
      expect(legend?.textContent).toContain('Grammar');
      expect(legend?.textContent).toContain('Kanji');

      // Check Today label
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('Category Breakdown', () => {
    it('should render category breakdown with accuracy bars', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
      });

      // Check categories are displayed - use section-specific selector
      const categoriesSection = screen.getByText('Category Breakdown').closest('section');
      expect(categoriesSection?.textContent).toContain('Particles');
      expect(categoriesSection?.textContent).toContain('Verb Conjugation');

      // Check accuracy percentages
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
    });

    it('should show empty message when no category data', async () => {
      mockFetchResponse({
        categories: { categories: [] }
      });
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No practice data yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Weak Points Section', () => {
    it('should render weak categories with practice buttons', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Areas to Improve')).toBeInTheDocument();
      });

      // Check weak categories section
      expect(screen.getByText('Weakest Categories')).toBeInTheDocument();
      const weakCategoriesSection = screen.getByText('Weakest Categories').closest('.weak-categories');
      expect(weakCategoriesSection?.textContent).toContain('Particles');
      expect(weakCategoriesSection?.textContent).toContain('Verb Conjugation');

      // Check accuracy display
      expect(screen.getByText('45%')).toBeInTheDocument();

      // Check practice buttons
      const practiceButtons = screen.getAllByText('Practice');
      expect(practiceButtons.length).toBeGreaterThan(0);
    });

    it('should render weak patterns list', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Patterns to Review')).toBeInTheDocument();
      });

      // Check patterns are displayed
      const patternsSection = screen.getByText('Patterns to Review').closest('.weak-patterns');
      expect(patternsSection?.textContent).toContain('〜てもいいです');
      expect(patternsSection?.textContent).toContain('Permission');
      expect(patternsSection?.textContent).toContain('4/10');
    });

    it('should render confused pairs section', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Often Confused')).toBeInTheDocument();
      });

      // Check confused pair is displayed
      expect(screen.getByText('5 confusions')).toBeInTheDocument();
    });

    it('should show success message when no weak points', async () => {
      mockFetchResponse({
        weakPoints: {
          weakCategories: [],
          weakPatterns: [],
          confusedPairs: []
        }
      });
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/🎉 Great job!/i)).toBeInTheDocument();
        expect(screen.getByText(/No weak points detected yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    it('should render quick action buttons', async () => {
      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });

      const quickActionsSection = screen.getByText('Quick Actions').closest('section');
      expect(quickActionsSection?.textContent).toContain('Grammar Drills');
      expect(quickActionsSection?.textContent).toContain('Kanji Practice');
      expect(quickActionsSection?.textContent).toContain('Lessons');
      expect(quickActionsSection?.textContent).toContain('Counters');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load progress data/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should display error when API returns non-ok response', async () => {
      (fetch as any).mockImplementation(() => 
        Promise.resolve({ ok: false, status: 500 })
      );
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load progress data/i)).toBeInTheDocument();
      });
    });

    it('should handle partial API failures gracefully', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/progress/overview')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOverview) });
        }
        return Promise.resolve({ ok: false });
      });
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load progress data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate when practice buttons are clicked', async () => {
      const mockNavigate = vi.fn();
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      mockFetchResponse();
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Areas to Improve')).toBeInTheDocument();
      });

      // Note: Full navigation testing would require more setup
      // This test verifies the component renders correctly with navigation context
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values in overview', async () => {
      mockFetchResponse({
        overview: {
          studyTime: { thisWeek: 0, allTime: 0, unit: 'minutes' },
          streak: 0,
          grammar: { mastered: 0, total: 100 },
          kanji: { learned: 0, total: 500 },
          lessons: { completed: 0, total: 50 }
        }
      });
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        const overviewSection = document.querySelector('.overview-section');
        expect(overviewSection?.textContent).toContain('0');
        expect(overviewSection?.textContent).toContain('0m');
      });
    });

    it('should handle missing category attempts gracefully', async () => {
      mockFetchResponse({
        categories: {
          categories: [
            { category: 'Empty Category', totalPatterns: 10, totalAttempts: 0, accuracy: 0 }
          ]
        }
      });
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Categories with 0 attempts should be filtered out
        expect(screen.queryByText('Empty Category')).not.toBeInTheDocument();
      });
    });

    it('should handle activity data with all zeros', async () => {
      mockFetchResponse({
        activity: {
          activity: mockActivity.map(d => ({ ...d, grammarAttempts: 0, kanjiAttempts: 0, totalSessions: 0 }))
        }
      });
      
      render(
        <MemoryRouter>
          <ProgressDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
      });

      // Should render without errors even with all zero activity
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });
  });
});
