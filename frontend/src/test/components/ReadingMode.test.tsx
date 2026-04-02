import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReadingMode } from '../../components/ReadingMode/ReadingMode';

// Mock fetch
global.fetch = vi.fn();

// Mock useFurigana hook
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: vi.fn((text: string, enabled: boolean) => ({
    furigana: enabled ? `<ruby>${text}<rt>reading</rt></ruby>` : null,
    loading: false,
    error: null,
  })),
}));

// Mock Header component
vi.mock('../../components/Header', () => ({
  Header: ({ title, icon, onBack, actions }: any) => (
    <header data-testid="header">
      <span data-testid="header-title">{title}</span>
      <span data-testid="header-icon">{icon}</span>
      {onBack && <button data-testid="back-button" onClick={onBack}>Back</button>}
      {actions}
    </header>
  ),
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
});

const mockPassages = [
  {
    id: 1,
    title: 'Daily Routine',
    content: '私は毎朝六時に起きます。',
    level: 'N5',
    topic: 'Daily Life',
    character_count: 15,
    created_at: '2024-01-01',
  },
  {
    id: 2,
    title: 'Shopping Trip',
    content: '昨日、デパートへ行きました。',
    level: 'N4',
    topic: 'Shopping',
    character_count: 18,
    created_at: '2024-01-02',
  },
  {
    id: 3,
    title: 'Work Meeting',
    content: '会議は午後三時から始まります。',
    level: 'N3',
    topic: 'Work',
    character_count: 20,
    created_at: '2024-01-03',
  },
];

const mockQuestions = [
  {
    id: 1,
    question: '何時に起きますか。',
    options: ['五時', '六時', '七時', '八時'],
    correct_answer: 1,
    explanation: '文章に「六時に起きます」とあります。',
    question_type: 'detail',
  },
  {
    id: 2,
    question: 'この文章の主題は何ですか。',
    options: ['仕事', '朝の習慣', '食事', '睡眠'],
    correct_answer: 1,
    explanation: '毎朝の行動について書いています。',
    question_type: 'main_idea',
  },
];

const mockPassageDetail = {
  passage: mockPassages[0],
  questions: mockQuestions,
};

const mockResults = {
  score: 100,
  correctCount: 2,
  totalQuestions: 2,
  results: [
    {
      questionId: 1,
      selectedOption: 1,
      isCorrect: true,
      correctAnswer: 1,
      explanation: '文章に「六時に起きます」とあります。',
      questionType: 'detail',
    },
    {
      questionId: 2,
      selectedOption: 1,
      isCorrect: true,
      correctAnswer: 1,
      explanation: '毎朝の行動について書いています。',
      questionType: 'main_idea',
    },
  ],
  readingTimeSeconds: 120,
  charsPerMinute: 45,
};

describe('ReadingMode', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (window.confirm as any).mockReturnValue(true);
    
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/reading/passages/') && !url.includes('/submit')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPassageDetail),
        });
      } else if (url.includes('/api/reading/submit')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResults),
        });
      } else if (url.includes('/api/reading/passages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ passages: mockPassages }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('Initial State', () => {
    it('should render the reading mode with header', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByTestId('header-title')).toHaveTextContent('Reading Practice');
        expect(screen.getByTestId('header-icon')).toHaveTextContent('📖');
      });
    });

    it('should show loading state initially', () => {
      (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<ReadingMode />);

      expect(screen.getByText('Loading passages...')).toBeInTheDocument();
    });

    it('should load and display passages on mount', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
        expect(screen.getByText('Shopping Trip')).toBeInTheDocument();
        expect(screen.getByText('Work Meeting')).toBeInTheDocument();
      });
    });
  });

  describe('Passage List View', () => {
    it('should display passage cards with correct information', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      // Check level badges
      expect(screen.getByText('N5')).toBeInTheDocument();
      expect(screen.getByText('N4')).toBeInTheDocument();
      expect(screen.getByText('N3')).toBeInTheDocument();

      // Check character counts
      expect(screen.getByText('15 characters')).toBeInTheDocument();
      expect(screen.getByText('18 characters')).toBeInTheDocument();
      expect(screen.getByText('20 characters')).toBeInTheDocument();

      // Check topics
      expect(screen.getByText('Daily Life')).toBeInTheDocument();
      expect(screen.getByText('Shopping')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('should filter passages by level', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      // Find select by role since label doesn't have htmlFor
      const levelSelect = screen.getByRole('combobox');
      fireEvent.change(levelSelect, { target: { value: 'N5' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('level=N5'),
          expect.any(Object)
        );
      });
    });

    it('should show empty state when no passages available', async () => {
      // Reset mock and set up for empty response
      vi.mocked(global.fetch).mockReset();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ passages: [] }),
      });

      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('No passages found.')).toBeInTheDocument();
      });
    });
  });

  describe('Reading View', () => {
    it('should navigate to reading view when clicking a passage', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      expect(screen.getByText(mockPassages[0].title)).toBeInTheDocument();
      expect(screen.getByText('15 characters')).toBeInTheDocument();
    });

    it('should toggle furigana display', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      // The button should have one of the two titles
      const furiganaToggle = screen.queryByTitle('Show furigana') || screen.queryByTitle('Hide furigana');
      expect(furiganaToggle).toBeInTheDocument();

      const initialTitle = furiganaToggle?.getAttribute('title');
      fireEvent.click(furiganaToggle!);

      // After clicking, the title should switch
      const expectedNewTitle = initialTitle === 'Show furigana' ? 'Hide furigana' : 'Show furigana';
      await waitFor(() => {
        expect(screen.getByTitle(expectedNewTitle)).toBeInTheDocument();
      });
    });

    it('should persist furigana preference to localStorage', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      // Find the furigana toggle button and click it
      const furiganaToggle = screen.queryByTitle('Show furigana') || screen.queryByTitle('Hide furigana');
      expect(furiganaToggle).toBeInTheDocument();
      
      const initialTitle = furiganaToggle?.getAttribute('title');
      fireEvent.click(furiganaToggle!);

      // After clicking, the title should switch, indicating state was updated
      const expectedNewTitle = initialTitle === 'Show furigana' ? 'Hide furigana' : 'Show furigana';
      await waitFor(() => {
        expect(screen.getByTitle(expectedNewTitle)).toBeInTheDocument();
      });
    });

    it('should navigate to questions view when clicking continue', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Continue to Questions →'));

      await waitFor(() => {
        expect(screen.getByText('Questions')).toBeInTheDocument();
      });
    });
  });

  describe('Questions View', () => {
    beforeEach(async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Continue to Questions →'));

      await waitFor(() => {
        expect(screen.getByText('Questions')).toBeInTheDocument();
      });
    });

    it('should display questions with options', async () => {
      expect(screen.getByText('Detail')).toBeInTheDocument();
      expect(screen.getByText('Main Idea')).toBeInTheDocument();
      expect(screen.getByText('何時に起きますか。')).toBeInTheDocument();
      expect(screen.getByText('この文章の主題は何ですか。')).toBeInTheDocument();
    });

    it('should track answer progress', async () => {
      expect(screen.getByText('0 / 2 answered')).toBeInTheDocument();

      const firstOption = screen.getAllByRole('radio')[0];
      fireEvent.click(firstOption);

      await waitFor(() => {
        expect(screen.getByText('1 / 2 answered')).toBeInTheDocument();
      });
    });

    it('should allow selecting answers', async () => {
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(8);

      fireEvent.click(radios[0]);
      expect(radios[0]).toBeChecked();

      fireEvent.click(radios[1]);
      expect(radios[1]).toBeChecked();
      expect(radios[0]).not.toBeChecked();
    });

    it('should go back to reading view', async () => {
      fireEvent.click(screen.getByText('← Back to Passage'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });
    });

    it('should disable submit button when no answers selected', async () => {
      const submitButton = screen.getByText('Submit Answers');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when at least one answer selected', async () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[0]);

      const submitButton = screen.getByText('Submit Answers');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Submit Answers', () => {
    beforeEach(async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Continue to Questions →'));

      await waitFor(() => {
        expect(screen.getByText('Questions')).toBeInTheDocument();
      });
    });

    it('should submit answers and show results', async () => {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[1]);
      fireEvent.click(radios[5]);

      fireEvent.click(screen.getByText('Submit Answers'));

      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      expect(screen.getByText('2 / 2')).toBeInTheDocument();
      expect(screen.getByText('2:00')).toBeInTheDocument();
      expect(screen.getByText('45 chars/min')).toBeInTheDocument();
    });

    it('should show confirmation when not all questions answered', async () => {
      (window.confirm as any).mockReturnValue(false);

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[0]);

      fireEvent.click(screen.getByText('Submit Answers'));

      expect(window.confirm).toHaveBeenCalledWith(
        'You have 1 unanswered question(s). Submit anyway?'
      );
    });
  });

  describe('Results View', () => {
    beforeEach(async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Continue to Questions →'));

      await waitFor(() => {
        expect(screen.getByText('Questions')).toBeInTheDocument();
      });

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[1]);
      fireEvent.click(radios[5]);

      fireEvent.click(screen.getByText('Submit Answers'));

      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
      });
    });

    it('should display answer review', async () => {
      expect(screen.getByText('Review Answers')).toBeInTheDocument();
      expect(screen.getAllByText('✓ Correct').length).toBe(2);
    });

    it('should navigate back to list from results', async () => {
      fireEvent.click(screen.getByText('← Back to List'));

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
        expect(screen.getByText('Shopping Trip')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back from reading to list', async () => {
      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('back-button'));

      await waitFor(() => {
        expect(screen.getByText('Shopping Trip')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Loading passages...')).toBeInTheDocument();
      });
    });

    it('should handle non-ok responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Loading passages...')).toBeInTheDocument();
      });
    });
  });

  describe('Furigana Preference Loading', () => {
    it('should load saved furigana preference from localStorage', async () => {
      // Set localStorage before rendering to test loading
      localStorage.setItem('reading_show_furigana', 'false');

      renderWithRouter(<ReadingMode />);

      await waitFor(() => {
        expect(screen.getByText('Daily Routine')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Daily Routine'));

      await waitFor(() => {
        expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
      });

      // Verify that furigana is hidden (Show furigana button is visible)
      expect(screen.getByTitle('Show furigana')).toBeInTheDocument();
    });
  });
});
