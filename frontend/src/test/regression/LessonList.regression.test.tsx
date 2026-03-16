import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonList } from '../../pages/LessonList';

describe('LessonList Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mockLessons = [
    { id: 'lesson-1', title: 'First Lesson', date: '2026-01-01', topics: ['basics'] },
    { id: 'lesson-2', title: 'Second Lesson', date: '2026-02-01', topics: ['grammar'] },
    { id: 'lesson-3', title: 'Third Lesson', date: '2026-03-01', topics: ['vocab'] },
  ];

  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  it('should have lessons-grid with single column flex layout', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: mockLessons }),
    } as Response);

    renderWithRouter(<LessonList />);

    await waitFor(() => {
      const grid = document.querySelector('.lessons-grid');
      expect(grid).toBeTruthy();
    });
  });

  it('should default sort to newest first (Third Lesson at top)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: mockLessons }),
    } as Response);

    renderWithRouter(<LessonList />);

    await waitFor(() => {
      // Check that "↓ Newest" button is active
      const newestBtn = screen.getByText('↓ Newest');
      expect(newestBtn).toHaveClass('active');
      
      // Third Lesson (newest) should have #3 and be first in DOM
      const lessonCards = document.querySelectorAll('.lesson-card');
      expect(lessonCards[0].textContent).toContain('Third Lesson');
      expect(lessonCards[0].textContent).toContain('#3');
    });
  });

  it('should keep lesson numbers consistent regardless of sort order', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: mockLessons }),
    } as Response);

    renderWithRouter(<LessonList />);

    await waitFor(() => {
      // Newest first: #3 should be at top
      const lessonCards = document.querySelectorAll('.lesson-card');
      expect(lessonCards[0].textContent).toContain('#3');
    });

    // Click "Oldest" sort
    const oldestBtn = screen.getByText('↑ Oldest');
    fireEvent.click(oldestBtn);

    await waitFor(() => {
      // Now oldest first: #1 should be at top
      const lessonCards = document.querySelectorAll('.lesson-card');
      expect(lessonCards[0].textContent).toContain('#1');
      expect(lessonCards[0].textContent).toContain('First Lesson');
    });
  });

  it('should use English locale for dates (not Polish)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: mockLessons }),
    } as Response);

    renderWithRouter(<LessonList />);

    await waitFor(() => {
      // Should show "January" not "stycznia"
      expect(screen.getByText(/January/i)).toBeInTheDocument();
      expect(screen.getByText(/February/i)).toBeInTheDocument();
      expect(screen.getByText(/March/i)).toBeInTheDocument();
      // Should NOT show Polish month names
      expect(screen.queryByText(/stycznia/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/lutego/i)).not.toBeInTheDocument();
    });
  });

  it('should display sort buttons in header actions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: mockLessons }),
    } as Response);

    renderWithRouter(<LessonList />);

    await waitFor(() => {
      expect(screen.getByText('↓ Newest')).toBeInTheDocument();
      expect(screen.getByText('↑ Oldest')).toBeInTheDocument();
    });

    // Verify buttons are in header-right
    const sortButtons = document.querySelector('.lesson-sort-buttons');
    const headerRight = document.querySelector('.header-right');
    expect(headerRight).toContainElement(sortButtons);
  });

  it('should lesson cards have lesson-number and lesson-info elements', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ lessons: mockLessons }),
    } as Response);

    renderWithRouter(<LessonList />);

    await waitFor(() => {
      const lessonCard = document.querySelector('.lesson-card');
      const lessonNumber = document.querySelector('.lesson-number');
      const lessonInfo = document.querySelector('.lesson-info');
      
      expect(lessonCard).toBeTruthy();
      expect(lessonNumber).toBeTruthy();
      expect(lessonInfo).toBeTruthy();
      expect(lessonCard).toContainElement(lessonNumber);
      expect(lessonCard).toContainElement(lessonInfo);
    });
  });
});
