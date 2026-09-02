import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MemoryMode } from '../../components/MemoryMode/MemoryMode';
import type { MemoryCard } from '../../hooks/useMemoryProgress';

const renderWithRouter = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

// setup.ts mocks localStorage with dumb vi.fn()s — replace with a working in-memory store
const store: Record<string, string> = {};
const memoryStorage = {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => { store[k] = String(v); },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  key: (i: number) => Object.keys(store)[i] ?? null,
  get length() { return Object.keys(store).length; },
};

// --- Mock hook state (mutable per test) ---
const mockReview = vi.fn();
const mockGetNextCard = vi.fn();
const mockGetPreview = vi.fn().mockReturnValue(1);
const mockImportUniqueVocabulary = vi.fn();
const mockGetStats = vi.fn();

vi.mock('../../hooks/useMemoryProgress', () => ({
  useMemoryProgress: () => ({
    cards: [],
    isLoading: false,
    getStats: mockGetStats,
    review: mockReview,
    getNextCard: mockGetNextCard,
    getPreview: mockGetPreview,
    importUniqueVocabulary: mockImportUniqueVocabulary,
  }),
}));

// Mock JapanesePhrase to keep assertions simple
vi.mock('../../components/JapanesePhrase', () => ({
  JapanesePhrase: ({ text }: { text: string }) => (
    <div data-testid="japanese-phrase">{text}</div>
  ),
}));

const mockLessons = [
  {
    id: 'lesson-1',
    date: '2026-03-04',
    title: 'Test Lesson 1',
    order: 1,
    topics: ['vocabulary'],
    vocabCount: 5,
    grammarCount: 0,
    vocabulary: [],
    grammar: [],
  },
  {
    id: 'lesson-2',
    date: '2026-03-05',
    title: 'Test Lesson 2',
    order: 2,
    topics: ['vocabulary'],
    vocabCount: 3,
    grammarCount: 0,
    vocabulary: [],
    grammar: [],
  },
];

const makeCard = (overrides: Partial<MemoryCard> = {}): MemoryCard => ({
  phraseId: 'p1',
  phraseType: 'vocabulary',
  lessonId: 'lesson-1',
  jp: '学校',
  en: 'school',
  reading: 'がっこう',
  romaji: 'gakkou',
  state: 'new',
  reps: 0,
  due: new Date(),
  stability: 0,
  difficulty: 0,
  elapsed_days: 0,
  scheduled_days: 0,
  lapses: 0,
  ...overrides,
} as MemoryCard);

describe('MemoryMode — Study Session Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = memoryStorage as unknown as Storage;
    memoryStorage.clear();
    window.scrollTo = vi.fn();
    mockGetStats.mockReturnValue({ total: 2, new: 1, learning: 1, review: 0, relearning: 0, due: 2 });
    mockGetPreview.mockReturnValue(1);
    mockImportUniqueVocabulary.mockResolvedValue({ imported: 5, unique: 5, total: 5 });
    mockGetNextCard.mockReturnValue(makeCard());
  });

  const startSession = async () => {
    fireEvent.click(screen.getByText('Test Lesson 1'));
    fireEvent.click(screen.getByRole('button', { name: /Study \d+ Due Cards|Start New Session/ }));
    await screen.findByText('school');
  };

  it('should import vocabulary from selected lessons when starting', async () => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();

    expect(mockImportUniqueVocabulary).toHaveBeenCalledWith('lesson-1');
    expect(mockImportUniqueVocabulary).toHaveBeenCalledTimes(1);
  });

  it('should import from multiple selected lessons', async () => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    fireEvent.click(screen.getByText('Test Lesson 1'));
    fireEvent.click(screen.getByText('Test Lesson 2'));
    fireEvent.click(screen.getByRole('button', { name: /Study \d+ Due Cards|Start New Session/ }));
    await screen.findByText('school');

    expect(mockImportUniqueVocabulary).toHaveBeenCalledWith('lesson-1');
    expect(mockImportUniqueVocabulary).toHaveBeenCalledWith('lesson-2');
  });

  it('should show the question and hide the answer before reveal', async () => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();

    expect(screen.getByText('Translate to Japanese')).toBeInTheDocument();
    expect(screen.getByText('school')).toBeInTheDocument();
    expect(screen.queryByTestId('japanese-phrase')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reveal Answer/i })).toBeInTheDocument();
  });

  it('should reveal the answer when Reveal Answer is clicked', async () => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();

    fireEvent.click(screen.getByRole('button', { name: /Reveal Answer/i }));

    expect(screen.getByTestId('japanese-phrase')).toHaveTextContent('学校');
    expect(screen.getByText(/How well did you know it\?/i)).toBeInTheDocument();
  });

  it('should reveal the answer when Space is pressed', async () => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();

    fireEvent.keyDown(window, { key: ' ' });

    expect(screen.getByTestId('japanese-phrase')).toBeInTheDocument();
  });

  it('should call review with rating when assessment button is clicked', async () => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();
    fireEvent.click(screen.getByRole('button', { name: /Reveal Answer/i }));

    fireEvent.click(screen.getByRole('button', { name: /Again/ }));

    expect(mockReview).toHaveBeenCalledWith('p1', 'again');
  });

  it.each([
    ['1', 'again'],
    ['2', 'hard'],
    ['3', 'good'],
    ['4', 'easy'],
  ] as const)('should call review with "%s" → "%s" via keyboard shortcut', async (key, rating) => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();
    fireEvent.keyDown(window, { key: ' ' }); // reveal

    fireEvent.keyDown(window, { key });

    expect(mockReview).toHaveBeenCalledWith('p1', rating);
  });

  it('should show the next card after rating', async () => {
    // After a review is submitted, the hook serves the next card
    let reviewed = false;
    mockReview.mockImplementation(() => { reviewed = true; });
    mockGetNextCard.mockImplementation(() => reviewed
      ? makeCard({ phraseId: 'p2', en: 'teacher', jp: '先生' })
      : makeCard({ phraseId: 'p1', en: 'school', jp: '学校' }));
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();
    fireEvent.click(screen.getByRole('button', { name: /Reveal Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Good/ }));

    await waitFor(() => {
      expect(screen.getByText('teacher')).toBeInTheDocument();
    });
  });

  it('should show completion screen when no cards remain', async () => {
    // Once a review is submitted, no further cards are due
    let reviewed = false;
    mockReview.mockImplementation(() => { reviewed = true; });
    mockGetNextCard.mockImplementation(() => reviewed ? null : makeCard());
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();
    fireEvent.click(screen.getByRole('button', { name: /Reveal Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Easy/ }));

    await screen.findByText('Session Complete!');
    expect(screen.getByRole('button', { name: /New Session/i })).toBeInTheDocument();
  });

  it('should return to setup screen when New Session is clicked after completion', async () => {
    let reviewed = false;
    mockReview.mockImplementation(() => { reviewed = true; });
    mockGetNextCard.mockImplementation(() => reviewed ? null : makeCard());
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    await startSession();
    fireEvent.click(screen.getByRole('button', { name: /Reveal Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Easy/ }));
    await screen.findByText('Session Complete!');

    fireEvent.click(screen.getByRole('button', { name: /New Session/i }));

    expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    expect(screen.getByText('Select Lessons to Study')).toBeInTheDocument();
  });

  it('should start at completion screen when no cards are due at all', async () => {
    mockGetNextCard.mockReturnValue(null);
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    fireEvent.click(screen.getByText('Test Lesson 1'));
    fireEvent.click(screen.getByRole('button', { name: /Study \d+ Due Cards|Start New Session/ }));

    await screen.findByText('Session Complete!');
  });

  it('should continue session even if import of one lesson fails', async () => {
    mockImportUniqueVocabulary
      .mockRejectedValueOnce(new Error('import failed'))
      .mockResolvedValueOnce({ imported: 3, unique: 3, total: 3 });
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    fireEvent.click(screen.getByText('Test Lesson 1'));
    fireEvent.click(screen.getByText('Test Lesson 2'));
    fireEvent.click(screen.getByRole('button', { name: /Study \d+ Due Cards|Start New Session/ }));

    await screen.findByText('school');
    expect(mockImportUniqueVocabulary).toHaveBeenCalledTimes(2);
  });

  it('should not trigger keyboard shortcuts while in setup screen', () => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);

    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: '3' });

    expect(mockReview).not.toHaveBeenCalled();
    expect(mockGetNextCard).not.toHaveBeenCalled();
  });

  it('should persist selected lessons to localStorage', async () => {
    renderWithRouter(<MemoryMode lessons={mockLessons} />);
    fireEvent.click(screen.getByText('Test Lesson 1'));

    await waitFor(() => {
      expect(localStorage.getItem('memoryModeSelectedLessons')).toBe(JSON.stringify(['lesson-1']));
    });
  });

  it('should restore selected lessons from localStorage on mount', () => {
    localStorage.setItem('memoryModeSelectedLessons', JSON.stringify(['lesson-2']));
    renderWithRouter(<MemoryMode lessons={mockLessons} />);

    expect(screen.getByText('Test Lesson 2').closest('.lesson-chip')).toHaveClass('selected');
    expect(screen.getByText('Test Lesson 1').closest('.lesson-chip')).not.toHaveClass('selected');
  });
});
