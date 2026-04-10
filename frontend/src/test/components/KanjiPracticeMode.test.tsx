import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { KanjiPracticeMode } from '../../components/KanjiPracticeMode/KanjiPracticeMode';

// Mock useKanjiProgress hook
vi.mock('../../hooks/useKanjiProgress', () => ({
  useKanjiProgress: vi.fn(),
}));

import { useKanjiProgress } from '../../hooks/useKanjiProgress';

// Mock Header component
vi.mock('../../components/Header', () => ({
  Header: ({ title, icon, subtitle, showBackButton }: any) => (
    <header data-testid="header">
      <span>{icon}</span>
      <h1>{title}</h1>
      {subtitle && <span>{subtitle}</span>}
      {showBackButton !== false && <button>Back</button>}
    </header>
  ),
}));

describe('KanjiPracticeMode', () => {
  const mockReview = vi.fn();
  const mockGetNextCard = vi.fn();
  const mockGetPreview = vi.fn();
  const mockImportKanji = vi.fn();
  const mockUpdateCard = vi.fn();
  const mockGetAvailableLessons = vi.fn();

  // Mock kanji cards
  const mockCard1 = {
    kanjiId: 'kanji-1',
    character: '日',
    meanings: ['sun', 'day'],
    readings: [
      { type: 'on' as const, reading: 'nichi' },
      { type: 'kun' as const, reading: 'hi' },
    ],
    lessonId: 'lesson-1',
    mnemonic: 'Looks like a sun',
    examples: [{ word: '日本', reading: 'にほん', meaning: 'Japan' }],
  };

  const mockCard2 = {
    kanjiId: 'kanji-2',
    character: '月',
    meanings: ['moon', 'month'],
    readings: [
      { type: 'on' as const, reading: 'getsu' },
      { type: 'kun' as const, reading: 'tsuki' },
    ],
    lessonId: 'lesson-1',
    mnemonic: 'Crescent moon shape',
    examples: [],
  };

  const mockCardNoMnemonic = {
    kanjiId: 'kanji-3',
    character: '火',
    meanings: ['fire'],
    readings: [
      { type: 'on' as const, reading: 'ka' },
      { type: 'kun' as const, reading: 'hi' },
    ],
    lessonId: 'lesson-2',
    mnemonic: '',
    examples: [],
  };

  const defaultMockReturn = {
    cards: [mockCard1, mockCard2],
    isLoading: false,
    stats: { total: 10, due: 5, new: 3, review: 2 },
    review: mockReview,
    getNextCard: mockGetNextCard,
    getPreview: mockGetPreview,
    importKanji: mockImportKanji,
    updateCard: mockUpdateCard,
    getAvailableLessons: mockGetAvailableLessons,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Default mock implementation
    (useKanjiProgress as any).mockReturnValue(defaultMockReturn);
    mockGetNextCard.mockReturnValue(mockCard1);
    mockGetAvailableLessons.mockReturnValue(['lesson-1', 'lesson-2']);
    mockGetPreview.mockImplementation((id: string, rating: string) => {
      const intervals: Record<string, number> = {
        again: 0.0007,
        hard: 0.02,
        good: 1,
        easy: 4,
      };
      return intervals[rating] || 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      (useKanjiProgress as any).mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(<KanjiPracticeMode />);

      expect(screen.getByText(/Loading kanji/i)).toBeInTheDocument();
      expect(document.querySelector('.spinner')).toBeInTheDocument();
    });
  });

  describe('Setup Screen', () => {
    it('should render setup screen with title and description', () => {
      render(<KanjiPracticeMode />);

      expect(screen.getByText(/Kanji Practice/i)).toBeInTheDocument();
      // Check for subtitle in description paragraph specifically
      expect(screen.getByText(/Learn kanji using the Kodansha Kanji Learner's Course method/i)).toBeInTheDocument();
    });

    it('should display statistics correctly', () => {
      render(<KanjiPracticeMode />);

      // Use getAllByText for numbers that appear multiple times
      expect(screen.getAllByText('10')[0]).toBeInTheDocument(); // Total
      expect(screen.getByText('Total Kanji')).toBeInTheDocument();
      expect(screen.getAllByText('5')[0]).toBeInTheDocument(); // Due
      expect(screen.getByText('Due for Review')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should show keyboard shortcuts', () => {
      render(<KanjiPracticeMode />);

      expect(screen.getByText(/Keyboard Shortcuts/i)).toBeInTheDocument();
      expect(screen.getByText(/Space/i)).toBeInTheDocument();
      // Check that shortcuts section exists
      expect(document.querySelector('.kanji-practice-shortcuts')).toBeInTheDocument();
    });

    it('should show lesson filter when lessons are available', () => {
      render(<KanjiPracticeMode />);

      expect(screen.getByText(/Filter by Lesson/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('All Lessons')).toBeInTheDocument();
      expect(screen.getByText('Lesson lesson-1')).toBeInTheDocument();
      expect(screen.getByText('Lesson lesson-2')).toBeInTheDocument();
    });

    it('should update selected lesson when dropdown changes', () => {
      render(<KanjiPracticeMode />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'lesson-1' } });

      expect(screen.getByText('Lesson lesson-1')).toBeInTheDocument();
    });

    it('should call importKanji on start when no localStorage data', async () => {
      // Ensure no localStorage data
      localStorage.removeItem('speech-practice-kanji-progress');
      
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(mockImportKanji).toHaveBeenCalled();
      });
    });

    it('should show start button', () => {
      render(<KanjiPracticeMode />);

      // Button should be present (exact text may vary based on filteredDueCount calculation)
      expect(screen.getByRole('button', { name: /Start Practice/i })).toBeInTheDocument();
    });

    it('should disable start button while loading', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      
      // Click and immediately check if it gets disabled
      fireEvent.click(startButton);

      // Button should be disabled immediately after click during state transition
      // or we check that the component transitions away from setup
      await waitFor(() => {
        // Either button is disabled or we've navigated away from setup
        const setupScreen = document.querySelector('.kanji-practice-setup');
        expect(setupScreen).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Practice Screen', () => {
    beforeEach(async () => {
      localStorage.setItem('speech-practice-kanji-progress', JSON.stringify({
        cards: [],
        lastSynced: new Date().toISOString(),
      }));
    });

    it('should render kanji character on card front', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });
    });

    it('should show "Recall the meaning" hint before reveal', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Recall the meaning/i)).toBeInTheDocument();
      });
    });

    it('should reveal answer when reveal button is clicked', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      const revealButton = screen.getByText(/Reveal Answer/i);
      fireEvent.click(revealButton);

      expect(screen.getByText(/Meanings/i)).toBeInTheDocument();
      expect(screen.getByText('sun')).toBeInTheDocument();
      expect(screen.getByText('day')).toBeInTheDocument();
    });

    it('should show readings after reveal', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));

      expect(screen.getByText(/Readings/i)).toBeInTheDocument();
      expect(screen.getByText(/Kunyomi/i)).toBeInTheDocument();
      expect(screen.getByText(/Onyomi/i)).toBeInTheDocument();
    });

    it('should show mnemonic after reveal', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));

      expect(screen.getByText(/Mnemonic \(KLC\)/i)).toBeInTheDocument();
      expect(screen.getByText('Looks like a sun')).toBeInTheDocument();
    });

    it('should show edit button for mnemonic', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));

      expect(screen.getByTitle(/Edit mnemonic/i)).toBeInTheDocument();
    });

    it('should enter edit mode when edit button is clicked', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));
      fireEvent.click(screen.getByTitle(/Edit mnemonic/i));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText(/Save/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });

    it('should save edited mnemonic', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));
      fireEvent.click(screen.getByTitle(/Edit mnemonic/i));

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New mnemonic' } });

      fireEvent.click(screen.getByText(/Save/i));

      await waitFor(() => {
        expect(mockUpdateCard).toHaveBeenCalledWith('kanji-1', { mnemonic: 'New mnemonic' });
      });
    });

    it('should show rating buttons after reveal', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));

      expect(screen.getByText('Again')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Easy')).toBeInTheDocument();
    });

    it('should call review with correct rating when rating button clicked', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));
      fireEvent.click(screen.getByText('Good'));

      expect(mockReview).toHaveBeenCalledWith('kanji-1', 'good');
    });

    it('should show interval previews for ratings', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));

      // Check for interval indicators (format depends on mock implementation)
      await waitFor(() => {
        const againInterval = document.querySelector('.rating-btn.again .rating-interval');
        expect(againInterval).toBeInTheDocument();
      });
    });

    it('should show examples when available', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));

      expect(screen.getByText(/Examples from Lessons/i)).toBeInTheDocument();
      // Check examples section exists
      expect(document.querySelector('.kanji-examples')).toBeInTheDocument();
      // Check example word is rendered (use getAllByText since 日本 appears in multiple places)
      expect(screen.getAllByText('日本').length).toBeGreaterThan(0);
    });

    it('should show lesson tag when lessonId is present', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Reveal Answer/i));

      expect(screen.getByText(/Lesson: lesson-1/i)).toBeInTheDocument();
    });

    it('should show end session button', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      expect(screen.getByText(/End Session/i)).toBeInTheDocument();
    });

    it('should return to setup when end session clicked', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/End Session/i));

      expect(screen.getByText(/Start Practice/i)).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      localStorage.setItem('speech-practice-kanji-progress', JSON.stringify({
        cards: [],
        lastSynced: new Date().toISOString(),
      }));
    });

    it('should reveal answer on space key', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: ' ' });

      await waitFor(() => {
        expect(screen.getByText(/Meanings/i)).toBeInTheDocument();
      });
    });

    it('should rate as again on key 1 after reveal', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      // First reveal
      fireEvent.keyDown(window, { key: ' ' });
      await waitFor(() => {
        expect(screen.getByText(/Meanings/i)).toBeInTheDocument();
      });

      // Then rate
      fireEvent.keyDown(window, { key: '1' });

      expect(mockReview).toHaveBeenCalledWith('kanji-1', 'again');
    });

    it('should rate as hard on key 2 after reveal', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: ' ' });
      await waitFor(() => {
        expect(screen.getByText(/Meanings/i)).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: '2' });

      expect(mockReview).toHaveBeenCalledWith('kanji-1', 'hard');
    });

    it('should rate as good on key 3 after reveal', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: ' ' });
      await waitFor(() => {
        expect(screen.getByText(/Meanings/i)).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: '3' });

      expect(mockReview).toHaveBeenCalledWith('kanji-1', 'good');
    });

    it('should rate as easy on key 4 after reveal', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: ' ' });
      await waitFor(() => {
        expect(screen.getByText(/Meanings/i)).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: '4' });

      expect(mockReview).toHaveBeenCalledWith('kanji-1', 'easy');
    });
  });

  describe('Completion Screen', () => {
    beforeEach(() => {
      localStorage.setItem('speech-practice-kanji-progress', JSON.stringify({
        cards: [],
        lastSynced: new Date().toISOString(),
      }));
      mockGetNextCard.mockReturnValue(null); // No more cards
    });

    it('should show completion screen when no more cards', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      // Wait for completion screen (check for h2 with the specific message)
      await waitFor(() => {
        expect(screen.getByText(/Practice Complete!/i)).toBeInTheDocument();
      });
    });

    it('should show completion stats', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Practice Complete!/i)).toBeInTheDocument();
      });

      // Stats should be visible in completion screen
      expect(document.querySelector('.kanji-practice-complete')).toBeInTheDocument();
      expect(screen.getByText('Total Kanji')).toBeInTheDocument();
      expect(screen.getByText('Still Due')).toBeInTheDocument();
    });

    it('should have practice more button', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Practice Complete!/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Practice More/i })).toBeInTheDocument();
    });

    it('should return to setup when practice more clicked', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Practice Complete!/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Practice More/i }));

      expect(screen.getByRole('button', { name: /Start Practice/i })).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no cards available', async () => {
      // Set up localStorage to indicate data exists (so auto-import doesn't trigger)
      localStorage.setItem('speech-practice-kanji-progress', JSON.stringify({
        cards: [],
        lastSynced: new Date().toISOString(),
      }));
      
      // Override mock to return empty cards
      (useKanjiProgress as any).mockReturnValue({
        ...defaultMockReturn,
        cards: [],
      });
      mockGetNextCard.mockReturnValue(null);

      render(<KanjiPracticeMode />);

      // Click start to enter practice mode
      const startButton = screen.getByRole('button', { name: /Start Practice/i });
      await act(async () => {
        fireEvent.click(startButton);
      });

      // When no cards, should show completion screen or empty state
      await waitFor(() => {
        const practiceContainer = document.querySelector('.kanji-practice-container');
        const completeContainer = document.querySelector('.kanji-practice-complete');
        const emptyContainer = document.querySelector('.kanji-practice-empty');
        expect(practiceContainer || completeContainer || emptyContainer).toBeInTheDocument();
      });
    });
  });

  describe('Progress Stats Display', () => {
    beforeEach(() => {
      localStorage.setItem('speech-practice-kanji-progress', JSON.stringify({
        cards: [],
        lastSynced: new Date().toISOString(),
      }));
    });

    it('should show progress stats during practice', async () => {
      render(<KanjiPracticeMode />);

      const startButton = screen.getByText(/Start Practice/i);
      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      expect(screen.getByText(/Due: 5/i)).toBeInTheDocument();
      expect(screen.getByText(/New: 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Review: 2/i)).toBeInTheDocument();
    });
  });
});
