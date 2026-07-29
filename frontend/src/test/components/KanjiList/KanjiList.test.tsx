import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { KanjiList } from '../../../components/KanjiList/KanjiList';

const mockKanji = [
  {
    id: 'kanji-1',
    character: '日',
    meanings: ['sun', 'day'],
    readings: [
      { type: 'on', reading: 'nichi' },
      { type: 'kun', reading: 'hi' },
    ],
    lesson_id: '1',
    mnemonic: 'Looks like a sun',
    stroke_count: 4,
    jlpt_level: 'N5',
    examples: [
      { word: '日本', reading: 'にほん', meaning: 'Japan' },
    ],
  },
  {
    id: 'kanji-2',
    character: '月',
    meanings: ['moon', 'month'],
    readings: [
      { type: 'on', reading: 'getsu' },
      { type: 'kun', reading: 'tsuki' },
    ],
    lesson_id: '1',
    mnemonic: 'Crescent moon',
    stroke_count: 4,
    jlpt_level: 'N5',
    examples: [],
  },
  {
    id: 'kanji-3',
    character: '火',
    meanings: ['fire'],
    readings: [
      { type: 'on', reading: 'ka' },
      { type: 'kun', reading: 'hi' },
    ],
    lesson_id: '2',
    mnemonic: '',
    stroke_count: 4,
    jlpt_level: 'N5',
    examples: [],
  },
];

describe('KanjiList', () => {
  const mockStartPractice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockFetch = (response: unknown, ok = true, status = 200) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok,
        status,
        json: async () => response,
      } as Response)
    );
  };

  const mockFetchError = (message: string) => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(message)));
  };

  describe('Rendering', () => {
    it('should show loading spinner initially', () => {
      mockFetch(mockKanji);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      expect(screen.getByText('Loading kanji...')).toBeInTheDocument();
      expect(document.querySelector('.kanji-list-loading .spinner')).toBeInTheDocument();
    });

    it('should render kanji after loading', async () => {
      mockFetch(mockKanji);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      expect(screen.getByText('月')).toBeInTheDocument();
      expect(screen.getByText('火')).toBeInTheDocument();
    });

    it('should render meanings, readings, and examples', async () => {
      mockFetch([mockKanji[0]]);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      expect(screen.getByText('sun')).toBeInTheDocument();
      expect(screen.getByText('day')).toBeInTheDocument();
      expect(screen.getByText('nichi')).toBeInTheDocument();
      expect(screen.getByText('hi')).toBeInTheDocument();
      expect(screen.getByText('日本')).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Japan'))).toBeInTheDocument();
    });

    it('should render metadata badges', async () => {
      mockFetch([mockKanji[0]]);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      expect(screen.getByText('JLPT N5')).toBeInTheDocument();
      expect(screen.getByText('4 strokes')).toBeInTheDocument();
      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    });

    it('should not show Start Practice button when callback is not provided', async () => {
      mockFetch(mockKanji);
      render(<KanjiList />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /start practice/i })).not.toBeInTheDocument();
    });
  });

  describe('Search and filtering', () => {
    it('should filter kanji by character', async () => {
      mockFetch(mockKanji);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search kanji');
      fireEvent.change(searchInput, { target: { value: '月' } });

      await waitFor(() => {
        expect(screen.queryByText('日')).not.toBeInTheDocument();
      });

      expect(screen.getByText('月')).toBeInTheDocument();
      expect(screen.queryByText('火')).not.toBeInTheDocument();
    });

    it('should filter kanji by meaning', async () => {
      mockFetch(mockKanji);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search kanji');
      fireEvent.change(searchInput, { target: { value: 'fire' } });

      await waitFor(() => {
        expect(screen.queryByText('日')).not.toBeInTheDocument();
      });

      expect(screen.getByText('火')).toBeInTheDocument();
    });

    it('should filter kanji by reading', async () => {
      mockFetch(mockKanji);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search kanji');
      fireEvent.change(searchInput, { target: { value: 'getsu' } });

      await waitFor(() => {
        expect(screen.getByText('月')).toBeInTheDocument();
      });

      expect(screen.queryByText('日')).not.toBeInTheDocument();
      expect(screen.queryByText('火')).not.toBeInTheDocument();
    });

    it('should show empty state when no kanji match search', async () => {
      mockFetch(mockKanji);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search kanji');
      fireEvent.change(searchInput, { target: { value: 'xyz' } });

      await waitFor(() => {
        expect(screen.getByText('No kanji found.')).toBeInTheDocument();
      });
    });

    it('should update result count when filtering', async () => {
      mockFetch(mockKanji);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('3 kanji')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search kanji');
      fireEvent.change(searchInput, { target: { value: 'moon' } });

      await waitFor(() => {
        expect(screen.getByText('1 kanji')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should display error when fetch fails', async () => {
      mockFetchError('Network error');
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Error loading kanji'))).toBeInTheDocument();
      });

      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should display error for non-ok response', async () => {
      mockFetch({}, false, 500);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Error loading kanji'))).toBeInTheDocument();
      });
    });
  });

  describe('User interactions', () => {
    it('should call onStartPractice when Start Practice button is clicked', async () => {
      mockFetch(mockKanji);
      render(<KanjiList onStartPractice={mockStartPractice} />);

      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
      });

      const startButton = screen.getByRole('button', { name: /start practice/i });
      fireEvent.click(startButton);

      expect(mockStartPractice).toHaveBeenCalledTimes(1);
    });
  });
});
