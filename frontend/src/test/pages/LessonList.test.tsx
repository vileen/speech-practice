import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { LessonList } from '../../pages/LessonList';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock Header component
vi.mock('../../components/Header', () => ({
  Header: ({ title, icon, onBack, actions }: any) => (
    <header data-testid="header">
      {icon && <span>{icon}</span>}
      <h1>{title}</h1>
      {onBack && <button data-testid="back-button" onClick={onBack}>Back</button>}
      {actions && <div data-testid="header-actions">{actions}</div>}
    </header>
  ),
}));

// Mock config/api getPassword
vi.mock('../../config/api', () => ({
  API_URL: 'http://localhost:3001',
  getPassword: vi.fn().mockReturnValue('test-password'),
}));

describe('LessonList', () => {
  const navigateMock = vi.fn();

  const mockLessons = [
    {
      id: 'lesson-1',
      title: 'Introduction to Japanese',
      date: '2024-01-15',
      topics: ['basics', 'greetings'],
    },
    {
      id: 'lesson-2',
      title: 'Numbers and Counting',
      date: '2024-02-01',
      topics: ['numbers', 'counters'],
    },
    {
      id: 'lesson-3',
      title: 'Verb Conjugation',
      date: '2024-03-10',
      topics: ['verbs', 'grammar'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    vi.mocked(global.fetch).mockReset();
  });

  const renderLessonList = () => {
    return render(
      <MemoryRouter>
        <LessonList />
      </MemoryRouter>
    );
  };

  describe('Initial Loading State', () => {
    it('should show loading state while fetching lessons', () => {
      vi.mocked(global.fetch).mockImplementationOnce(() => new Promise(() => {}));
      renderLessonList();
      expect(screen.getByText('Loading lessons...')).toBeInTheDocument();
    });

    it('should render header with title and icon during loading', () => {
      vi.mocked(global.fetch).mockImplementationOnce(() => new Promise(() => {}));
      renderLessonList();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Lessons')).toBeInTheDocument();
      expect(screen.getByText('📚')).toBeInTheDocument();
    });
  });

  describe('Successful Data Fetch', () => {
    it('should fetch lessons on mount with correct headers', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/lessons'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Password': 'test-password',
            }),
          })
        );
      });
    });

    it('should render lesson cards after successful fetch', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('Introduction to Japanese')).toBeInTheDocument();
        expect(screen.getByText('Numbers and Counting')).toBeInTheDocument();
        expect(screen.getByText('Verb Conjugation')).toBeInTheDocument();
      });
    });

    it('should display lesson numbers in chronological order (assigned by date, displayed by sort)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        // Default sort is newest first, so order is: #3 (Mar), #2 (Feb), #1 (Jan)
        const lessonNumbers = screen.getAllByText(/#/);
        expect(lessonNumbers[0]).toHaveTextContent('#3');
        expect(lessonNumbers[1]).toHaveTextContent('#2');
        expect(lessonNumbers[2]).toHaveTextContent('#1');
      });
    });

    it('should display formatted dates', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
        expect(screen.getByText('February 1, 2024')).toBeInTheDocument();
        expect(screen.getByText('March 10, 2024')).toBeInTheDocument();
      });
    });

    it('should display topic tags on lesson cards', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('basics')).toBeInTheDocument();
        expect(screen.getByText('greetings')).toBeInTheDocument();
        expect(screen.getByText('numbers')).toBeInTheDocument();
      });
    });

    it('should handle lessons array in root response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLessons),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('Introduction to Japanese')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('Failed to load lessons')).toBeInTheDocument();
      });
    });

    it('should display retry button on error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show no lessons message when API returns empty array', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('No lessons available.')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should default to newest sort order', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        const newestButton = screen.getByTitle('Newest first');
        expect(newestButton).toHaveClass('active');
      });
    });

    it('should switch to oldest sort order when clicked', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('Introduction to Japanese')).toBeInTheDocument();
      });

      const oldestButton = screen.getByTitle('Oldest first');
      fireEvent.click(oldestButton);

      expect(oldestButton).toHaveClass('active');
    });
  });

  describe('Tag Filtering', () => {
    it('should display tag filter accordion with all unique tags', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        // Open accordion
        const accordionHeader = screen.getByText('Tags:');
        fireEvent.click(accordionHeader);
      });

      await waitFor(() => {
        // Query within tag-chips container to avoid conflict with topic-tags on cards
        const tagChipsContainer = screen.getByText('Tags:').closest('.tag-filters-accordion') || document.body;
        const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');
        const tagTexts = Array.from(tagChips).map(chip => chip.textContent);
        expect(tagTexts).toContain('basics');
        expect(tagTexts).toContain('greetings');
        expect(tagTexts).toContain('numbers');
        expect(tagTexts).toContain('counters');
        expect(tagTexts).toContain('verbs');
        expect(tagTexts).toContain('grammar');
      });
    });

    it('should filter lessons by selected tags', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('Introduction to Japanese')).toBeInTheDocument();
        expect(screen.getByText('Numbers and Counting')).toBeInTheDocument();
        expect(screen.getByText('Verb Conjugation')).toBeInTheDocument();
      });

      // Open accordion and select a tag
      const accordionHeader = screen.getByText('Tags:');
      fireEvent.click(accordionHeader);

      await waitFor(() => {
        // Find the basics tag chip specifically (not the topic tag on the card)
        const tagChipsContainer = document.querySelector('.tag-chips');
        expect(tagChipsContainer).toBeTruthy();
        const basicsTag = tagChipsContainer!.querySelector('.tag-chip');
        expect(basicsTag).toBeTruthy();
        fireEvent.click(basicsTag!);
      });

      await waitFor(() => {
        expect(screen.getByText('Introduction to Japanese')).toBeInTheDocument();
        expect(screen.queryByText('Numbers and Counting')).not.toBeInTheDocument();
        expect(screen.queryByText('Verb Conjugation')).not.toBeInTheDocument();
      });
    });

    it('should show filtered count in accordion', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        const accordionHeader = screen.getByText('Tags:');
        fireEvent.click(accordionHeader);
      });

      await waitFor(() => {
        expect(screen.getByText(/Showing \d+ of \d+ lessons/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to lesson detail when lesson card is clicked', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('Introduction to Japanese')).toBeInTheDocument();
      });

      const lessonCard = screen.getByText('Introduction to Japanese').closest('button');
      if (lessonCard) {
        fireEvent.click(lessonCard);
      }

      expect(navigateMock).toHaveBeenCalledWith('/lessons/lesson-1');
    });

    it('should navigate to home when back button is clicked', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('back-button'));
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  describe('Lessons without topics', () => {
    it('should handle lessons with missing topics gracefully', async () => {
      const lessonsWithoutTopics = [
        {
          id: 'lesson-1',
          title: 'No Topics Lesson',
          date: '2024-01-15',
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: lessonsWithoutTopics }),
      } as Response);

      renderLessonList();

      await waitFor(() => {
        expect(screen.getByText('No Topics Lesson')).toBeInTheDocument();
        expect(screen.queryByText('No lessons available.')).not.toBeInTheDocument();
      });
    });
  });
});
