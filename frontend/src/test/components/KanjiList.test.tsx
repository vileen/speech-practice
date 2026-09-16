import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KanjiList } from '../../components/KanjiList/KanjiList';

const mockKanji = [
  {
    id: '1',
    character: '水',
    meanings: ['water'],
    readings: [
      { type: 'kun', reading: 'みず' },
      { type: 'on', reading: 'スイ' },
    ],
    lesson_id: 'lesson-1',
    mnemonic: 'water flowing',
    stroke_count: 4,
    jlpt_level: 'N5',
    examples: [
      { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
    ],
  },
  {
    id: '2',
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

const mockLessons = {
  lessons: [
    { id: 'lesson-1', date: '2026-09-10', title: 'Lesson One' },
    { id: 'lesson-2', date: '2026-09-15', title: 'Lesson Two' },
  ],
};

function mockFetchResponses({
  kanji = mockKanji,
  lessons = mockLessons,
  kanjiError = false,
}: {
  kanji?: typeof mockKanji;
  lessons?: typeof mockLessons;
  kanjiError?: boolean;
} = {}) {
  (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    if (url.includes('/api/lessons')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(lessons),
      } as Response);
    }
    if (url.includes('/api/kanji')) {
      if (kanjiError) {
        return Promise.resolve({
          ok: false,
          status: 500,
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(kanji),
      } as Response);
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
}

describe('KanjiList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );
    render(<KanjiList />);
    expect(screen.getByText('Loading kanji...')).toBeInTheDocument();
  });

  it('fetches and renders kanji cards after loading', async () => {
    mockFetchResponses();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading kanji...')).not.toBeInTheDocument();
    });

    // Characters rendered
    expect(screen.getByText('水')).toBeInTheDocument();
    expect(screen.getByText('火')).toBeInTheDocument();

    // Meanings
    expect(screen.getByText('water')).toBeInTheDocument();
    expect(screen.getByText('fire')).toBeInTheDocument();

    // Readings grouped by type
    expect(screen.getByText('みず')).toBeInTheDocument();
    expect(screen.getByText('スイ')).toBeInTheDocument();
    expect(screen.getByText('ひ')).toBeInTheDocument();
    expect(screen.getByText('カ')).toBeInTheDocument();
    expect(screen.getAllByText('Kunyomi')).toHaveLength(2);
    expect(screen.getAllByText('Onyomi')).toHaveLength(2);

    // Badges
    expect(screen.getAllByText('JLPT N5')).toHaveLength(2);
    expect(screen.getAllByText('4 strokes')).toHaveLength(2);
    expect(screen.getByText('Lesson lesson-1')).toBeInTheDocument();

    // Examples
    expect(screen.getByText('水曜日')).toBeInTheDocument();
    expect(screen.getByText('(すいようび)')).toBeInTheDocument();
    expect(screen.getByText('— Wednesday')).toBeInTheDocument();

    // Count display
    expect(screen.getByText('2 kanji')).toBeInTheDocument();

    // Kanji fetch called with default sort (desc)
    const kanjiCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      (call) => String(call[0]).includes('/api/kanji')
    );
    expect(String(kanjiCall![0])).toContain('sort=desc');
  });

  it('shows error state when kanji fetch fails', async () => {
    mockFetchResponses({ kanjiError: true });
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('❌ Error loading kanji')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Failed to fetch kanji: 500')
    ).toBeInTheDocument();
  });

  it('shows empty state when no kanji match', async () => {
    mockFetchResponses({ kanji: [] });
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('No kanji found.')).toBeInTheDocument();
    });
  });

  it('filters kanji by search query (character, meaning, reading)', async () => {
    mockFetchResponses();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('2 kanji')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('Search kanji');

    // Match by meaning
    fireEvent.change(searchInput, { target: { value: 'water' } });
    expect(screen.getByText('水')).toBeInTheDocument();
    expect(screen.queryByText('火')).not.toBeInTheDocument();
    expect(screen.getByText('1 kanji')).toBeInTheDocument();

    // Match by reading (case-insensitive romaji won't work for kana — use onyomi)
    fireEvent.change(searchInput, { target: { value: 'カ' } });
    expect(screen.getByText('火')).toBeInTheDocument();
    expect(screen.queryByText('水')).not.toBeInTheDocument();

    // No match
    fireEvent.change(searchInput, { target: { value: 'zzz' } });
    expect(screen.getByText('No kanji found.')).toBeInTheDocument();
  });

  it('refetches kanji when lesson filter changes', async () => {
    mockFetchResponses();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('2 kanji')).toBeInTheDocument();
    });

    const lessonSelect = screen.getByLabelText('Filter by lesson');
    fireEvent.change(lessonSelect, { target: { value: 'lesson-2' } });

    await waitFor(() => {
      const kanjiCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call) => String(call[0]).includes('/api/kanji')
      );
      const lastCall = kanjiCalls[kanjiCalls.length - 1];
      expect(String(lastCall[0])).toContain('lessonId=lesson-2');
    });
  });

  it('refetches kanji with ascending sort when "oldest" selected', async () => {
    mockFetchResponses();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('2 kanji')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText('Sort order');
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });

    await waitFor(() => {
      const kanjiCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call) => String(call[0]).includes('/api/kanji')
      );
      const lastCall = kanjiCalls[kanjiCalls.length - 1];
      expect(String(lastCall[0])).toContain('sort=asc');
    });
  });

  it('renders Start Practice button when onStartPractice is provided', async () => {
    mockFetchResponses();
    const onStartPractice = vi.fn();
    render(<KanjiList onStartPractice={onStartPractice} />);

    await waitFor(() => {
      expect(screen.getByText('2 kanji')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /start practice/i });
    fireEvent.click(button);
    expect(onStartPractice).toHaveBeenCalledTimes(1);
  });

  it('does not render Start Practice button without onStartPractice prop', async () => {
    mockFetchResponses();
    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('2 kanji')).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: /start practice/i })
    ).not.toBeInTheDocument();
  });

  it('populates lesson filter from fetched lessons sorted newest first', async () => {
    mockFetchResponses();
    render(<KanjiList />);

    await waitFor(() => {
      const lessonSelect = screen.getByLabelText(
        'Filter by lesson'
      ) as HTMLSelectElement;
      const options = Array.from(lessonSelect.options).map((o) => o.textContent);
      expect(options[0]).toBe('All lessons');
      // 2026-09-15 (Lesson Two) should come before 2026-09-10 (Lesson One)
      expect(options[1]).toContain('Lesson Two');
      expect(options[2]).toContain('Lesson One');
    });
  });

  it('tolerates lessons fetch failure without breaking kanji list', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/lessons')) {
        return Promise.resolve({ ok: false, status: 500 } as Response);
      }
      if (url.includes('/api/kanji')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockKanji),
        } as Response);
      }
      return Promise.reject(new Error('Unexpected fetch'));
    });

    render(<KanjiList />);

    await waitFor(() => {
      expect(screen.getByText('2 kanji')).toBeInTheDocument();
    });
    // Lesson select still present with only "All lessons"
    const lessonSelect = screen.getByLabelText('Filter by lesson');
    expect(lessonSelect).toBeInTheDocument();
  });
});
