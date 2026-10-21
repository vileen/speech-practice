import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonDetailView } from '../../components/LessonMode/LessonDetail';
import type { LessonDetail } from '../../hooks/useLessonMode';

const lesson: LessonDetail = {
  id: 'lesson-1',
  date: '2026-10-20',
  title: 'Test Lesson',
  topics: ['Greetings', 'Numbers'],
  vocabulary: [
    { jp: 'こんにちは', reading: 'こんにちは', romaji: 'konnichiwa', en: 'hello', type: 'phrase' },
    { jp: '猫', reading: 'ねこ', romaji: 'neko', en: 'cat', type: 'noun' },
  ],
  grammar: [
    {
      pattern: '〜ます',
      explanation: 'Polite verb ending',
      romaji: 'masu',
      examples: [{ jp: '食べます', en: 'I eat', furigana: null }],
    },
  ],
  practice_phrases: [
    { jp: '元気ですか', en: 'How are you?', romaji: 'genki desu ka', furigana: '<ruby>元気</ruby>' },
  ],
};

const defaultProps = {
  lesson,
  onBack: vi.fn(),
  onStartLessonChat: vi.fn(),
  onSelectLesson: vi.fn(),
  showFurigana: false,
  setShowFurigana: vi.fn(),
  renderFurigana: vi.fn((text: string) => text),
  renderExplanationWithTables: vi.fn((explanation: string) => <p>{explanation}</p>),
  prefetchFurigana: vi.fn(),
};

function renderView(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  render(
    <MemoryRouter>
      <LessonDetailView {...props} />
    </MemoryRouter>
  );
  return props;
}

describe('LessonDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ vocabulary: [] }),
    } as Response);
  });

  describe('header', () => {
    it('renders the translated lesson title', () => {
      renderView();
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });

    it('calls onBack when the back button is clicked', () => {
      const props = renderView();
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(props.onBack).toHaveBeenCalledTimes(1);
    });

    it('calls onStartLessonChat with lesson id and translated title from header action', () => {
      const props = renderView();
      fireEvent.click(screen.getByRole('button', { name: /practice conversation/i }));
      expect(props.onStartLessonChat).toHaveBeenCalledWith('lesson-1', 'Test Lesson');
    });
  });

  describe('tabs', () => {
    it('renders all four tabs with item counts', () => {
      renderView();
      expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Vocabulary (2)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Grammar (1)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Practice (1)' })).toBeInTheDocument();
    });

    it('marks the active tab', () => {
      renderView();
      const overviewTab = screen.getByRole('button', { name: 'Overview' });
      expect(overviewTab.className).toContain('active');
      expect(screen.getByRole('button', { name: 'Vocabulary (2)' }).className).not.toContain('active');
    });

    it('switches to the vocabulary tab when clicked', () => {
      renderView();
      fireEvent.click(screen.getByRole('button', { name: 'Vocabulary (2)' }));
      expect(screen.getByText('konnichiwa')).toBeInTheDocument();
      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
    });

    it('switches to the grammar tab and renders explanation via renderExplanationWithTables', () => {
      const props = renderView();
      fireEvent.click(screen.getByRole('button', { name: 'Grammar (1)' }));
      expect(screen.getByText('Polite verb ending')).toBeInTheDocument();
      expect(props.renderExplanationWithTables).toHaveBeenCalledWith('Polite verb ending');
      expect(screen.getByText('I eat')).toBeInTheDocument();
    });

    it('switches to the practice tab and renders phrases', () => {
      renderView({ showFurigana: false });
      fireEvent.click(screen.getByRole('button', { name: 'Practice (1)' }));
      expect(screen.getByText('genki desu ka')).toBeInTheDocument();
      expect(screen.getByText('How are you?')).toBeInTheDocument();
    });
  });

  describe('overview tab', () => {
    it('shows lesson date and topics', () => {
      renderView();
      expect(screen.getByText(/2026-10-20/)).toBeInTheDocument();
      expect(screen.getByText(/Greetings, Numbers/)).toBeInTheDocument();
    });

    it('shows stat cards with counts', () => {
      renderView();
      expect(screen.getByText('Vocabulary Words')).toBeInTheDocument();
      expect(screen.getByText('Grammar Points')).toBeInTheDocument();
      expect(screen.getByText('Practice Phrases')).toBeInTheDocument();
    });

    it('starts conversation practice with raw lesson title from quick start', () => {
      const props = renderView();
      fireEvent.click(screen.getByRole('button', { name: /start conversation practice/i }));
      expect(props.onStartLessonChat).toHaveBeenCalledWith('lesson-1', 'Test Lesson');
    });
  });

  describe('furigana', () => {
    it('shows 漢 when furigana is hidden and あ when shown', () => {
      const { rerender } = render(
        <MemoryRouter>
          <LessonDetailView {...defaultProps} showFurigana={false} />
        </MemoryRouter>
      );
      expect(screen.getByTitle('Show furigana')).toBeInTheDocument();

      rerender(
        <MemoryRouter>
          <LessonDetailView {...defaultProps} showFurigana={true} />
        </MemoryRouter>
      );
      expect(screen.getByTitle('Hide furigana')).toBeInTheDocument();
    });

    it('calls setShowFurigana when the toggle is clicked', () => {
      const props = renderView();
      fireEvent.click(screen.getByTitle('Show furigana'));
      expect(props.setShowFurigana).toHaveBeenCalledWith(true);
    });

    it('prefetches furigana when showFurigana is true', () => {
      const props = renderView({ showFurigana: true });
      expect(props.prefetchFurigana).toHaveBeenCalledWith(lesson);
    });

    it('does not prefetch furigana when showFurigana is false', () => {
      const props = renderView({ showFurigana: false });
      expect(props.prefetchFurigana).not.toHaveBeenCalled();
    });
  });

  describe('vocabulary sources', () => {
    it('fetches vocabulary sources for the lesson', async () => {
      renderView();
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/lessons/lesson-1/vocabulary-with-sources')
        );
      });
    });

    it('shows an appearances badge and navigates on tooltip click', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          vocabulary: [
            { jp: '猫', otherLessons: [{ id: 'lesson-9', title: 'Old Lesson', date: '2026-01-01' }] },
          ],
        }),
      } as Response);

      const props = renderView();
      fireEvent.click(screen.getByRole('button', { name: 'Vocabulary (2)' }));

      const badge = await screen.findByText('1');
      fireEvent.mouseEnter(badge.parentElement as HTMLElement);

      const tooltipItem = await screen.findByText('Old Lesson');
      expect(screen.getByText(/Appears in 1 lesson/)).toBeInTheDocument();

      fireEvent.click(tooltipItem);
      expect(props.onSelectLesson).toHaveBeenCalledWith('lesson-9');
    });

    it('survives a failed vocabulary sources fetch', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValue(new Error('network down'));

      renderView();
      fireEvent.click(screen.getByRole('button', { name: 'Vocabulary (2)' }));

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          'Error fetching vocab sources:',
          expect.any(Error)
        );
      });
      // Vocab tab still renders words without sources
      expect(screen.getByText('hello')).toBeInTheDocument();
      errorSpy.mockRestore();
    });
  });
});
