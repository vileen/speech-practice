import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProgressDashboard } from '../../../components/ProgressDashboard/ProgressDashboard';

// Mock the API_URL
vi.mock('../../../config/api.js', () => ({
  API_URL: 'http://localhost:3001',
}));

// Mock Header component
vi.mock('../../../components/Header/index.js', () => ({
  Header: ({ title, icon }: { title: string; icon?: string }) => (
    <header data-testid="header">
      {icon && <span>{icon}</span>}
      {title}
    </header>
  ),
}));

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

const mockOverview = {
  studyTime: {
    thisWeek: 125,
    allTime: 1520,
    unit: 'minutes',
  },
  streak: 14,
  grammar: {
    mastered: 45,
    total: 120,
  },
  kanji: {
    learned: 320,
    total: 2136,
  },
  lessons: {
    completed: 12,
    total: 50,
  },
};

const mockJLPTLevels = [
  {
    level: 'N5',
    grammar: { total: 30, mastered: 20, percentage: 67 },
    kanji: { total: 100, mastered: 80, percentage: 80 },
    overall: { total: 130, mastered: 100, percentage: 77 },
  },
  {
    level: 'N4',
    grammar: { total: 40, mastered: 15, percentage: 38 },
    kanji: { total: 200, mastered: 50, percentage: 25 },
    overall: { total: 240, mastered: 65, percentage: 27 },
  },
];

const mockWeakCategories = [
  {
    category: 'Causative',
    accuracy: 45,
    totalPatterns: 5,
    totalAttempts: 20,
  },
  {
    category: 'Passive',
    accuracy: 52,
    totalPatterns: 4,
    totalAttempts: 15,
  },
];

const mockWeakPatterns = [
  {
    id: 1,
    pattern: 'させる',
    category: 'Causative',
    jlptLevel: 'N4',
    accuracy: 40,
    attempts: 10,
    correct: 4,
  },
  {
    id: 2,
    pattern: 'られる',
    category: 'Passive',
    jlptLevel: 'N4',
    accuracy: 50,
    attempts: 8,
    correct: 4,
  },
];

const mockConfusedPairs = [
  {
    patternId: 1,
    patternName: 'させる',
    patternCategory: 'Causative',
    confusedWithId: 3,
    confusedWithName: 'せる',
    count: 5,
  },
];

const mockActivity = [
  { date: '2024-01-15', grammarAttempts: 5, kanjiAttempts: 3, totalSessions: 8 },
  { date: '2024-01-14', grammarAttempts: 3, kanjiAttempts: 2, totalSessions: 5 },
  { date: '2024-01-13', grammarAttempts: 0, kanjiAttempts: 0, totalSessions: 0 },
  { date: '2024-01-12', grammarAttempts: 7, kanjiAttempts: 4, totalSessions: 11 },
  { date: '2024-01-11', grammarAttempts: 2, kanjiAttempts: 1, totalSessions: 3 },
  { date: '2024-01-10', grammarAttempts: 4, kanjiAttempts: 2, totalSessions: 6 },
  { date: '2024-01-09', grammarAttempts: 6, kanjiAttempts: 3, totalSessions: 9 },
];

const mockCategories = [
  { category: 'Permission', totalPatterns: 5, totalAttempts: 25, accuracy: 85 },
  { category: 'Prohibition', totalPatterns: 4, totalAttempts: 20, accuracy: 72 },
  { category: 'Causative', totalPatterns: 5, totalAttempts: 20, accuracy: 45 },
  { category: 'Passive', totalPatterns: 4, totalAttempts: 15, accuracy: 52 },
];

function setupFetchMock(responseOverrides?: Record<string, Partial<Response>>) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/api/progress/overview')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOverview),
        ...responseOverrides?.overview,
      } as Response);
    }
    if (url.includes('/api/progress/by-level')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ levels: mockJLPTLevels }),
        ...responseOverrides?.levels,
      } as Response);
    }
    if (url.includes('/api/progress/weak-points')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          weakCategories: mockWeakCategories,
          weakPatterns: mockWeakPatterns,
          confusedPairs: mockConfusedPairs,
        }),
        ...responseOverrides?.weakPoints,
      } as Response);
    }
    if (url.includes('/api/progress/activity')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ activity: mockActivity }),
        ...responseOverrides?.activity,
      } as Response);
    }
    if (url.includes('/api/progress/categories')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categories: mockCategories }),
        ...responseOverrides?.categories,
      } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
  });
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('ProgressDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReload.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('renders loading state on initial mount', () => {
      // Delay fetch to keep loading state visible
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<ProgressDashboard />);

      expect(screen.getByText('Loading your progress...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state and shows retry button when a fetch fails', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/progress/overview')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load progress data. Please try again.')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });

  describe('Successful Data Render', () => {
    beforeEach(() => {
      setupFetchMock();
    });

    it('renders overview cards with correct stats', async () => {
      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('14')).toBeInTheDocument();
      });

      expect(screen.getByText('Day Streak')).toBeInTheDocument();
      expect(screen.getByText('2h 5m')).toBeInTheDocument();
      expect(screen.getByText('This Week')).toBeInTheDocument();
      expect(screen.getByText('25h 20m total')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('Grammar Mastered')).toBeInTheDocument();
      expect(screen.getByText('of 120 patterns')).toBeInTheDocument();
      expect(screen.getByText('320')).toBeInTheDocument();
      expect(screen.getByText('Kanji Learned')).toBeInTheDocument();
      expect(screen.getByText('of 2136 characters')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      // "Lessons" appears in both overview card label and Quick Actions button, use getAllByText
      const lessonsElements = screen.getAllByText('Lessons');
      expect(lessonsElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('of 50 completed')).toBeInTheDocument();
    });

    it('renders JLPT level progress cards with correct percentages', async () => {
      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('N5')).toBeInTheDocument();
      });

      expect(screen.getByText('77%')).toBeInTheDocument();
      expect(screen.getByText('27%')).toBeInTheDocument();
      expect(screen.getByText('20/30')).toBeInTheDocument();
      // "Grammar" appears in multiple places (JLPT stats + activity legend), use getAllByText
      const grammarElements = screen.getAllByText('Grammar');
      expect(grammarElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('80/100')).toBeInTheDocument();
      const kanjiElements = screen.getAllByText('Kanji');
      expect(kanjiElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders activity chart with day labels', async () => {
      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
      });

      // Check for legend — "Grammar" and "Kanji" appear in multiple places
      const grammarLegend = screen.getAllByText('Grammar');
      expect(grammarLegend.length).toBeGreaterThanOrEqual(1);
      const kanjiLegend = screen.getAllByText('Kanji');
      expect(kanjiLegend.length).toBeGreaterThanOrEqual(1);
    });

    it('renders category breakdown with accuracy bars', async () => {
      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
      });

      expect(screen.getByText('Permission')).toBeInTheDocument();
      expect(screen.getByText('Prohibition')).toBeInTheDocument();
      // "Causative" appears in both category breakdown and weak points, use getAllByText
      const causativeElements = screen.getAllByText('Causative');
      expect(causativeElements.length).toBeGreaterThanOrEqual(1);
      const passiveElements = screen.getAllByText('Passive');
      expect(passiveElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('85%')).toBeInTheDocument();
      // "45%" appears in both category breakdown and weak points, use getAllByText
      const accuracyElements = screen.getAllByText('45%');
      expect(accuracyElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders weak points (weakest categories, patterns to review, confused pairs)', async () => {
      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Areas to Improve')).toBeInTheDocument();
      });

      // Weakest Categories
      expect(screen.getByText('Weakest Categories')).toBeInTheDocument();
      const causativeElements = screen.getAllByText('Causative');
      expect(causativeElements.length).toBeGreaterThanOrEqual(1);
      const passiveElements = screen.getAllByText('Passive');
      expect(passiveElements.length).toBeGreaterThanOrEqual(1);
      // "45%" appears in both category breakdown and weak points, use getAllByText
      const accuracyElements = screen.getAllByText('45%');
      expect(accuracyElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('20 attempts across 5 patterns')).toBeInTheDocument();

      // Patterns to Review
      expect(screen.getByText('Patterns to Review')).toBeInTheDocument();
      // "させる" appears in both weak patterns and confused pairs, use getAllByText
      const saseruElements = screen.getAllByText('させる');
      expect(saseruElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('られる')).toBeInTheDocument();
      expect(screen.getByText('4/10')).toBeInTheDocument();

      // Confused Pairs
      expect(screen.getByText('Often Confused')).toBeInTheDocument();
      // "させる" also appears in weak patterns, use getAllByText
      const confusedSaseru = screen.getAllByText('させる');
      expect(confusedSaseru.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('せる')).toBeInTheDocument();
      expect(screen.getByText('5 confusions')).toBeInTheDocument();
    });
  });

  describe('Empty Weak Points State', () => {
    it('renders empty weak points message when no weak data', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/progress/overview')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOverview) } as Response);
        }
        if (url.includes('/api/progress/by-level')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ levels: mockJLPTLevels }) } as Response);
        }
        if (url.includes('/api/progress/weak-points')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              weakCategories: [],
              weakPatterns: [],
              confusedPairs: [],
            }),
          } as Response);
        }
        if (url.includes('/api/progress/activity')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ activity: mockActivity }) } as Response);
        }
        if (url.includes('/api/progress/categories')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: mockCategories }) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
      });

      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Areas to Improve')).toBeInTheDocument();
      });

      expect(screen.getByText('🎉 Great job! No weak points detected yet.')).toBeInTheDocument();
      expect(screen.getByText('Keep practicing to build up your data and identify areas for improvement.')).toBeInTheDocument();
    });
  });

  describe('Quick Action Buttons', () => {
    beforeEach(() => {
      setupFetchMock();
    });

    it('navigates to correct routes when quick action buttons are clicked', async () => {
      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });

      const grammarBtn = screen.getByRole('button', { name: /Grammar Drills/i });
      const kanjiBtn = screen.getByRole('button', { name: /Kanji Practice/i });
      const lessonsBtn = screen.getByRole('button', { name: /Lessons/i });
      const countersBtn = screen.getByRole('button', { name: /Counters/i });

      expect(grammarBtn).toBeInTheDocument();
      expect(kanjiBtn).toBeInTheDocument();
      expect(lessonsBtn).toBeInTheDocument();
      expect(countersBtn).toBeInTheDocument();
    });
  });

  describe('API Error Handling', () => {
    it('handles API error gracefully and sets error state', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load progress data. Please try again.')).toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching progress data:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('handles non-ok response from categories endpoint', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/progress/categories')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      renderWithRouter(<ProgressDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load progress data. Please try again.')).toBeInTheDocument();
      });
    });
  });
});
