import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KanjiList } from '../../../src/components/KanjiList/KanjiList';

// Mock the API config
vi.mock('../../../src/config/api.js', () => ({
  API_URL: 'http://localhost:3001'
}));

const mockLessons = [
  { id: 'lesson-1', date: '2026-09-01', title: 'Basic Greetings' },
  { id: 'lesson-2', date: '2026-09-15', title: 'Numbers' },
];

const mockKanji = [
  {
    id: 'kanji-1',
    character: '水',
    meanings: ['water'],
    readings: [
      { type: 'kun', reading: 'みず' },
      { type: 'on', reading: 'スイ' },
    ],
    lesson_id: 'lesson-1',
    stroke_count: 4,
    jlpt_level: 'N5',
    examples: [
      { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
    ],
  },
  {
    id: 'kanji-2',
    character: '火',
    meanings: ['fire'],
    readings: [
      { type: 'kun', reading: 'ひ' },
      { type: 'on', reading: 'カ' },
    ],
    lesson_id: 'lesson-2',
    stroke_count: 4,
    jlpt_level: 'N5',
    examples: [],
  },
];

function mockFetchResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}

function setupFetchMocks() {
  (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    if (url.includes('/api/lessons')) {
      return Promise.resolve(mockFetchResponse({ lessons: mockLessons }));
    }
    if (url.includes('/api/kanji')) {
      return Promise.resolve(mockFetchResponse(mockKanji));
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
}

describe('KanjiList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    setupFetchMocks();
    render(<KanjiList />);
    expect(screen.getByText(/loading kanji/i)).toBeInTheDocument();
  });

  it('should render kanji cards after fetching', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
      expect(screen.getByText('火')).toBeInTheDocument();
    });

    expect(screen.getByText('water')).toBeInTheDocument();
    expect(screen.getByText('fire')).toBeInTheDocument();
  });

  it('should display kunyomi and onyomi readings', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('みず')).toBeInTheDocument();
      expect(screen.getByText('スイ')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Kunyomi').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Onyomi').length).toBeGreaterThan(0);
  });

  it('should show error message when kanji fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/lessons')) {
        return Promise.resolve(mockFetchResponse({ lessons: mockLessons }));
      }
      if (url.includes('/api/kanji')) {
        return Promise.resolve(mockFetchResponse({}, false, 500));
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading kanji/i)).toBeInTheDocument();
    });
  });

  it('should filter kanji by search query', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search kanji/i);
    fireEvent.change(searchInput, { target: { value: 'water' } });

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
      expect(screen.queryByText('火')).not.toBeInTheDocument();
    });
  });

  it('should filter kanji by character search', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search kanji/i);
    fireEvent.change(searchInput, { target: { value: '火' } });

    await waitFor(() => {
      expect(screen.queryByText('水')).not.toBeInTheDocument();
      expect(screen.getByText('火')).toBeInTheDocument();
    });
  });

  it('should show empty state when no kanji match search', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search kanji/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/no kanji found/i)).toBeInTheDocument();
    });
  });

  it('should refetch kanji when lesson filter changes', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    const lessonSelect = screen.getByLabelText(/filter by lesson/i);
    fireEvent.change(lessonSelect, { target: { value: 'lesson-1' } });

    await waitFor(() => {
      const kanjiCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call: string[]) => call[0].includes('/api/kanji')
      );
      const lastCall = kanjiCalls[kanjiCalls.length - 1][0];
      expect(lastCall).toContain('lessonId=lesson-1');
    });
  });

  it('should refetch kanji when sort order changes', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/sort order/i);
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });

    await waitFor(() => {
      const kanjiCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call: string[]) => call[0].includes('/api/kanji')
      );
      const lastCall = kanjiCalls[kanjiCalls.length - 1][0];
      expect(lastCall).toContain('sort=asc');
    });
  });

  it('should render start practice button when onStartPractice is provided', async () => {
    setupFetchMocks();
    const onStartPractice = vi.fn();
    render(<KanjiList onStartPractice={onStartPractice} />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    const practiceBtn = screen.getByRole('button', { name: /start practice/i });
    fireEvent.click(practiceBtn);
    expect(onStartPractice).toHaveBeenCalledTimes(1);
  });

  it('should not render start practice button when onStartPractice is not provided', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /start practice/i })).not.toBeInTheDocument();
  });

  it('should display kanji count', async () => {
    setupFetchMocks();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    expect(screen.getByText(/2 kanji/i)).toBeInTheDocument();
  });
});
