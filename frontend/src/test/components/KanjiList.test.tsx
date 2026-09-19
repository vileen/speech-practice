import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KanjiList } from '../../components/KanjiList/KanjiList';

const mockKanji = [
  {
    id: 'k1',
    character: '水',
    meanings: ['water'],
    readings: [
      { type: 'kun', reading: 'みず' },
      { type: 'on', reading: 'スイ' },
    ],
    lesson_id: 'lesson-1',
    jlpt_level: 'N5',
    stroke_count: 4,
    examples: [{ word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' }],
  },
  {
    id: 'k2',
    character: '火',
    meanings: ['fire'],
    readings: [
      { type: 'kun', reading: 'ひ' },
      { type: 'on', reading: 'カ' },
    ],
    examples: [],
  },
];

const mockLessons = [
  { id: 'lesson-1', date: '2026-09-10', title: 'Lesson One' },
  { id: 'lesson-2', date: '2026-09-15', title: 'Lesson Two' },
];

function mockFetchResponses({ kanji = mockKanji, lessons = mockLessons, kanjiFails = false } = {}) {
  (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    if (url.includes('/api/lessons')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ lessons }),
      });
    }
    if (url.includes('/api/kanji')) {
      if (kanjiFails) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(kanji) });
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
}

async function renderLoadedList(props = {}) {
  render(<KanjiList {...props} />);
  await waitFor(() => expect(screen.queryByText('Loading kanji...')).not.toBeInTheDocument());
}

describe('KanjiList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetching', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );
    render(<KanjiList />);
    expect(screen.getByText('Loading kanji...')).toBeInTheDocument();
  });

  it('renders kanji cards after loading', async () => {
    mockFetchResponses();
    await renderLoadedList();

    expect(screen.getByText('水')).toBeInTheDocument();
    expect(screen.getByText('火')).toBeInTheDocument();
    expect(screen.getByText('water')).toBeInTheDocument();
    expect(screen.getByText('fire')).toBeInTheDocument();
  });

  it('fetches lessons and kanji on mount', async () => {
    mockFetchResponses();
    await renderLoadedList();

    const urls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(urls.some((u: string) => u.includes('/api/lessons'))).toBe(true);
    expect(urls.some((u: string) => u.includes('/api/kanji'))).toBe(true);
  });

  it('requests sorted kanji newest-first by default', async () => {
    mockFetchResponses();
    await renderLoadedList();

    const kanjiCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((c) =>
      c[0].includes('/api/kanji')
    );
    expect(kanjiCall[0]).toContain('sort=desc');
    expect(kanjiCall[0]).not.toContain('lessonId');
  });

  it('displays reading groups for kun and on readings', async () => {
    mockFetchResponses();
    await renderLoadedList();

    // Both mock kanji have kun+on readings, so labels appear twice
    expect(screen.getAllByText('Kunyomi').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Onyomi').length).toBeGreaterThan(0);
    expect(screen.getByText('みず')).toBeInTheDocument();
    expect(screen.getByText('スイ')).toBeInTheDocument();
  });

  it('displays JLPT and stroke count badges', async () => {
    mockFetchResponses();
    await renderLoadedList();

    expect(screen.getByText('JLPT N5')).toBeInTheDocument();
    expect(screen.getByText('4 strokes')).toBeInTheDocument();
  });

  it('displays examples when present', async () => {
    mockFetchResponses();
    await renderLoadedList();

    expect(screen.getByText('水曜日')).toBeInTheDocument();
    // Meaning rendered with em-dash prefix: "— Wednesday"
    expect(screen.getByText(/Wednesday/)).toBeInTheDocument();
  });

  it('shows error message when kanji fetch fails', async () => {
    mockFetchResponses({ kanjiFails: true });
    render(<KanjiList />);

    await waitFor(() =>
      expect(screen.getByText('❌ Error loading kanji')).toBeInTheDocument()
    );
    expect(screen.getByText(/Failed to fetch kanji: 500/)).toBeInTheDocument();
  });

  it('filters kanji by search query (meaning)', async () => {
    mockFetchResponses();
    await renderLoadedList();

    fireEvent.change(screen.getByLabelText('Search kanji'), {
      target: { value: 'water' },
    });

    expect(screen.getByText('水')).toBeInTheDocument();
    expect(screen.queryByText('火')).not.toBeInTheDocument();
    expect(screen.getByText('1 kanji')).toBeInTheDocument();
  });

  it('filters kanji by search query (reading)', async () => {
    mockFetchResponses();
    await renderLoadedList();

    fireEvent.change(screen.getByLabelText('Search kanji'), {
      target: { value: 'ひ' },
    });

    expect(screen.getByText('火')).toBeInTheDocument();
    expect(screen.queryByText('水')).not.toBeInTheDocument();
  });

  it('shows empty state when search matches nothing', async () => {
    mockFetchResponses();
    await renderLoadedList();

    fireEvent.change(screen.getByLabelText('Search kanji'), {
      target: { value: 'zzz' },
    });

    expect(screen.getByText('No kanji found.')).toBeInTheDocument();
  });

  it('refetches with lessonId when lesson filter changes', async () => {
    mockFetchResponses();
    await renderLoadedList();

    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    fireEvent.change(screen.getByLabelText('Filter by lesson'), {
      target: { value: 'lesson-1' },
    });

    await waitFor(() => {
      const kanjiCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((c) =>
        c[0].includes('/api/kanji')
      );
      expect(kanjiCall).toBeDefined();
      expect(kanjiCall[0]).toContain('lessonId=lesson-1');
    });
  });

  it('refetches with ascending sort when sort order changes', async () => {
    mockFetchResponses();
    await renderLoadedList();

    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    fireEvent.change(screen.getByLabelText('Sort order'), {
      target: { value: 'oldest' },
    });

    await waitFor(() => {
      const kanjiCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((c) =>
        c[0].includes('/api/kanji')
      );
      expect(kanjiCall).toBeDefined();
      expect(kanjiCall[0]).toContain('sort=asc');
    });
  });

  it('calls onStartPractice when start button is clicked', async () => {
    mockFetchResponses();
    const onStartPractice = vi.fn();
    await renderLoadedList({ onStartPractice });

    fireEvent.click(screen.getByRole('button', { name: /start practice/i }));
    expect(onStartPractice).toHaveBeenCalledTimes(1);
  });

  it('does not render start practice button when callback not provided', async () => {
    mockFetchResponses();
    await renderLoadedList();

    expect(screen.queryByRole('button', { name: /start practice/i })).not.toBeInTheDocument();
  });
});
