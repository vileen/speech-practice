import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { LessonDetailView } from '../../../components/LessonMode/LessonDetail';
import type { LessonDetail } from '../../../hooks/useLessonMode';

// Mock child components and dependencies
vi.mock('../../../components/Header/index.js', () => ({
  Header: ({ title, actions, onBack }: any) => (
    <header data-testid="header">
      <button data-testid="back-btn" onClick={onBack}>Back</button>
      <h1>{title}</h1>
      <div data-testid="header-actions">{actions}</div>
    </header>
  ),
}));

vi.mock('../../../translations.js', () => ({
  translateLessonTitle: vi.fn((title: string) => `Translated: ${title}`),
}));

vi.mock('../../../config/api.js', () => ({
  API_URL: 'http://localhost:3001',
  getPassword: vi.fn(() => 'test-password'),
  authFetch: vi.fn((url: string, options: RequestInit = {}) => fetch(url, options)),
}));

const mockLesson: LessonDetail = {
  id: '2026-03-01',
  date: '2026-03-01',
  title: 'Lekcja Testowa',
  topics: ['Basics', 'Greetings'],
  vocabulary: [
    { jp: '猫', reading: 'ねこ', romaji: 'neko', en: 'cat', type: 'noun' },
    { jp: '犬', reading: 'いぬ', romaji: 'inu', en: 'dog' },
  ],
  grammar: [
    {
      pattern: 'は',
      explanation: 'Topic marker',
      romaji: 'wa',
      examples: [{ jp: '私は学生です', en: 'I am a student' }],
    },
  ],
  practice_phrases: [
    { jp: 'こんにちは', en: 'Hello', romaji: 'konnichiwa' },
    { jp: 'さようなら', en: 'Goodbye', romaji: 'sayounara' },
  ],
};

const mockOnBack = vi.fn();
const mockOnStartLessonChat = vi.fn();
const mockOnSelectLesson = vi.fn();
const mockSetShowFurigana = vi.fn();
const mockRenderFurigana = vi.fn((text: string, reading?: string | null) =>
  reading ? `${text} (${reading})` : text
);
const mockRenderExplanationWithTables = vi.fn((explanation: string) => (
  <div data-testid="explanation">{explanation}</div>
));
const mockPrefetchFurigana = vi.fn();

const defaultProps = {
  lesson: mockLesson,
  onBack: mockOnBack,
  onStartLessonChat: mockOnStartLessonChat,
  onSelectLesson: mockOnSelectLesson,
  showFurigana: false,
  setShowFurigana: mockSetShowFurigana,
  renderFurigana: mockRenderFurigana,
  renderExplanationWithTables: mockRenderExplanationWithTables,
  prefetchFurigana: mockPrefetchFurigana,
};

const setupFetch = (response: any = { vocabulary: [] }) => {
  (global.fetch as any).mockImplementation((url: string) => {
    if (url.includes('/api/lessons/') && url.includes('/vocabulary-with-sources')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
};

describe('LessonDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFetch();
  });

  it('renders header with translated title and back button', async () => {
    render(<LessonDetailView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Translated: Lekcja Testowa')).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    render(<LessonDetailView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('back-btn')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('back-btn'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('renders overview tab by default with lesson info', async () => {
    render(<LessonDetailView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Lesson Info')).toBeInTheDocument();
      expect(screen.getByText(/2026-03-01/)).toBeInTheDocument();
      expect(screen.getByText(/Basics, Greetings/)).toBeInTheDocument();
    });
  });

  it('renders statistics cards with correct counts', async () => {
    render(<LessonDetailView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Vocabulary Words')).toBeInTheDocument();
      expect(screen.getByText('Grammar Points')).toBeInTheDocument();
      expect(screen.getByText('Practice Phrases')).toBeInTheDocument();
    });

    const vocabCard = screen.getByText('Vocabulary Words').parentElement;
    const grammarCard = screen.getByText('Grammar Points').parentElement;
    const practiceCard = screen.getByText('Practice Phrases').parentElement;

    expect(vocabCard).toHaveTextContent('2');
    expect(grammarCard).toHaveTextContent('1');
    expect(practiceCard).toHaveTextContent('2');
  });

  it('calls onStartLessonChat when practice conversation button is clicked', async () => {
    render(<LessonDetailView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('💬 Start Conversation Practice')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('💬 Start Conversation Practice'));
    expect(mockOnStartLessonChat).toHaveBeenCalledWith('2026-03-01', 'Lekcja Testowa');
  });

  it('calls onStartLessonChat from header action with translated title', async () => {
    render(<LessonDetailView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('💬 Practice Conversation')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('💬 Practice Conversation'));
    expect(mockOnStartLessonChat).toHaveBeenCalledWith('2026-03-01', 'Translated: Lekcja Testowa');
  });

  it('switches to vocabulary tab and renders vocab cards', async () => {
    render(<LessonDetailView {...defaultProps} />);
    const vocabTab = await screen.findByRole('button', { name: /Vocabulary \(2\)/ });
    fireEvent.click(vocabTab);

    await waitFor(() => {
      expect(screen.getByText(/猫 \(ねこ\)/)).toBeInTheDocument();
      expect(screen.getByText('neko')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.getByText('noun')).toBeInTheDocument();
    });
  });

  it('uses renderFurigana for vocabulary words', async () => {
    render(<LessonDetailView {...defaultProps} />);
    const vocabTab = await screen.findByRole('button', { name: /Vocabulary \(2\)/ });
    fireEvent.click(vocabTab);

    await waitFor(() => {
      expect(mockRenderFurigana).toHaveBeenCalledWith('猫', 'ねこ');
    });
  });

  it('switches to grammar tab and renders grammar cards', async () => {
    render(<LessonDetailView {...defaultProps} />);
    const grammarTab = await screen.findByRole('button', { name: /Grammar \(1\)/ });
    fireEvent.click(grammarTab);

    await waitFor(() => {
      expect(screen.getByText('Topic marker')).toBeInTheDocument();
      expect(screen.getByText('wa')).toBeInTheDocument();
      expect(mockRenderExplanationWithTables).toHaveBeenCalledWith('Topic marker');
    });
  });

  it('switches to practice tab and renders practice phrases', async () => {
    render(<LessonDetailView {...defaultProps} />);
    const practiceTab = await screen.findByRole('button', { name: /Practice \(2\)/ });
    fireEvent.click(practiceTab);

    await waitFor(() => {
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
    });
  });

  it('toggles furigana when furigana button is clicked', async () => {
    render(<LessonDetailView {...defaultProps} />);
    const toggleBtn = await screen.findByTitle('Show furigana');
    fireEvent.click(toggleBtn);
    expect(mockSetShowFurigana).toHaveBeenCalledWith(true);
  });

  it('shows hide furigana title when furigana is enabled', async () => {
    render(<LessonDetailView {...defaultProps} showFurigana={true} />);
    const toggleBtn = await screen.findByTitle('Hide furigana');
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);
    expect(mockSetShowFurigana).toHaveBeenCalledWith(false);
  });

  it('prefetches furigana when showFurigana is true on mount', async () => {
    render(<LessonDetailView {...defaultProps} showFurigana={true} />);
    await waitFor(() => {
      expect(mockPrefetchFurigana).toHaveBeenCalledWith(mockLesson);
    });
  });

  it('does not prefetch furigana when showFurigana is false', async () => {
    render(<LessonDetailView {...defaultProps} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    expect(mockPrefetchFurigana).not.toHaveBeenCalled();
  });

  it('fetches vocabulary with sources on mount', async () => {
    render(<LessonDetailView {...defaultProps} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/lessons/2026-03-01/vocabulary-with-sources'
      );
    });
  });

  it('renders vocabulary appearances badge and tooltip on hover', async () => {
    const vocabResponse = {
      vocabulary: [
        {
          jp: '猫',
          reading: 'ねこ',
          otherLessons: [
            { id: '2026-02-01', title: 'Previous Lesson', date: '2026-02-01' },
          ],
        },
      ],
    };
    setupFetch(vocabResponse);

    render(<LessonDetailView {...defaultProps} />);
    const vocabTab = await screen.findByRole('button', { name: /Vocabulary \(2\)/ });
    fireEvent.click(vocabTab);

    const badge = await screen.findByText('1', { selector: '.appearances-badge' });
    expect(badge).toBeInTheDocument();

    const badgeContainer = badge.parentElement;
    fireEvent.mouseEnter(badgeContainer!);

    await waitFor(() => {
      expect(screen.getByText('Appears in 1 lesson')).toBeInTheDocument();
      expect(screen.getByText('Previous Lesson')).toBeInTheDocument();
    });
  });

  it('calls onSelectLesson when clicking a tooltip lesson item', async () => {
    const vocabResponse = {
      vocabulary: [
        {
          jp: '猫',
          otherLessons: [{ id: '2026-02-01', title: 'Previous Lesson', date: '2026-02-01' }],
        },
      ],
    };
    setupFetch(vocabResponse);

    render(<LessonDetailView {...defaultProps} />);
    const vocabTab = await screen.findByRole('button', { name: /Vocabulary \(2\)/ });
    fireEvent.click(vocabTab);

    const badge = await screen.findByText('1', { selector: '.appearances-badge' });
    const badgeContainer = badge.parentElement;
    fireEvent.mouseEnter(badgeContainer!);

    await waitFor(() => {
      expect(screen.getByText('Previous Lesson')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Previous Lesson'));
    expect(mockOnSelectLesson).toHaveBeenCalledWith('2026-02-01');
  });

  it('handles fetch errors gracefully without crashing', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<LessonDetailView {...defaultProps} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching vocab sources:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('renders practice phrase with furigana when enabled', async () => {
    render(<LessonDetailView {...defaultProps} showFurigana={true} />);
    const practiceTab = await screen.findByRole('button', { name: /Practice \(2\)/ });
    fireEvent.click(practiceTab);

    await waitFor(() => {
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
    });
  });

  it('does not render topics section when no topics exist', async () => {
    const lessonNoTopics = { ...mockLesson, topics: [] };
    render(<LessonDetailView {...defaultProps} lesson={lessonNoTopics} />);
    await waitFor(() => {
      expect(screen.queryByText(/Topics:/)).not.toBeInTheDocument();
    });
  });

  it('renders empty grammar tab when no grammar exists', async () => {
    const lessonNoGrammar = { ...mockLesson, grammar: [] };
    render(<LessonDetailView {...defaultProps} lesson={lessonNoGrammar} />);
    const grammarTab = await screen.findByRole('button', { name: /Grammar \(0\)/ });
    fireEvent.click(grammarTab);

    await waitFor(() => {
      expect(screen.queryByTestId('explanation')).not.toBeInTheDocument();
    });
  });
});
