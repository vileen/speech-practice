import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation, useParams } from 'react-router-dom';
import { LessonPracticeSetup } from '../../pages/LessonPracticeSetup';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
    useParams: vi.fn(),
  };
});

vi.mock('../../components/Header', () => ({
  Header: ({ title, icon }: any) => (
    <header data-testid="header">
      {icon && <span>{icon}</span>}
      <h1>{title}</h1>
    </header>
  ),
}));

vi.mock('../../config/api', () => ({
  API_URL: 'http://localhost:3001',
  getPassword: vi.fn().mockReturnValue('test-password'),
}));

describe('LessonPracticeSetup', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    vi.mocked(useLocation).mockReturnValue({ state: {} } as any);
    vi.mocked(useParams).mockReturnValue({ id: 'lesson-1' });
    vi.mocked(global.fetch).mockReset();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => {
          if (key === 'voiceStyle') return 'normal';
          if (key === 'simpleMode') return 'false';
          if (key === 'speech_practice_password') return 'test-password';
          return null;
        }),
        setItem: vi.fn(),
      },
      writable: true,
    });

    // Default mock for fetch to prevent .then() on undefined
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Test Lesson' }),
    } as Response);
  });

  const renderLessonPracticeSetup = () => {
    return render(
      <MemoryRouter>
        <LessonPracticeSetup />
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('should render header with title and icon', () => {
      renderLessonPracticeSetup();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Speech Practice')).toBeInTheDocument();
      expect(screen.getByText('🎤')).toBeInTheDocument();
    });

    it('should render practice setup title', () => {
      renderLessonPracticeSetup();
      expect(screen.getByText('📚 Practice Setup')).toBeInTheDocument();
    });

    it('should render voice selection buttons', () => {
      renderLessonPracticeSetup();
      expect(screen.getByText('♂️ Male')).toBeInTheDocument();
      expect(screen.getByText('♀️ Female')).toBeInTheDocument();
    });

    it('should render voice style selection buttons', () => {
      renderLessonPracticeSetup();
      expect(screen.getByText('🎙️ Normal')).toBeInTheDocument();
      expect(screen.getByText('✨ Anime')).toBeInTheDocument();
    });

    it('should render simple mode toggle', () => {
      renderLessonPracticeSetup();
      expect(screen.getByText('Simple Mode')).toBeInTheDocument();
    });

    it('should render start and back buttons', () => {
      renderLessonPracticeSetup();
      expect(screen.getByText('🚀 Start Practice')).toBeInTheDocument();
      expect(screen.getByText('← Back to Lessons')).toBeInTheDocument();
    });
  });

  describe('Voice Selection', () => {
    it('should default to female voice', () => {
      renderLessonPracticeSetup();
      const femaleButton = screen.getByText('♀️ Female').closest('button');
      expect(femaleButton).toHaveClass('active');
    });

    it('should switch to male voice when clicked', () => {
      renderLessonPracticeSetup();
      const maleButton = screen.getByText('♂️ Male');
      fireEvent.click(maleButton);
      expect(maleButton.closest('button')).toHaveClass('active');
    });
  });

  describe('Voice Style Selection', () => {
    it('should default to normal voice style', () => {
      renderLessonPracticeSetup();
      const normalButton = screen.getByText('🎙️ Normal').closest('button');
      expect(normalButton).toHaveClass('active');
    });

    it('should switch to anime voice style when clicked', () => {
      renderLessonPracticeSetup();
      const animeButton = screen.getByText('✨ Anime');
      fireEvent.click(animeButton);
      expect(animeButton.closest('button')).toHaveClass('active');
    });
  });

  describe('Simple Mode Toggle', () => {
    it('should toggle simple mode checkbox', () => {
      renderLessonPracticeSetup();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to lessons on back button click', () => {
      renderLessonPracticeSetup();
      fireEvent.click(screen.getByText('← Back to Lessons'));
      expect(navigateMock).toHaveBeenCalledWith('/lessons');
    });

    it('should save settings and navigate to practice on start', () => {
      renderLessonPracticeSetup();
      fireEvent.click(screen.getByText('🚀 Start Practice'));

      expect(localStorage.setItem).toHaveBeenCalledWith('simpleMode', 'false');
      expect(localStorage.setItem).toHaveBeenCalledWith('voiceStyle', 'normal');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lessonPracticeSettings',
        expect.stringContaining('"lessonId":"lesson-1"')
      );
      expect(navigateMock).toHaveBeenCalledWith('/lessons/lesson-1/practice');
    });
  });

  describe('Lesson Title Fetch', () => {
    it('should fetch lesson title when not provided in state', async () => {
      vi.mocked(useLocation).mockReturnValue({ state: {} } as any);
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ title: 'Test Lesson Title' }),
      } as Response);

      renderLessonPracticeSetup();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/lessons/lesson-1'),
          expect.any(Object)
        );
      });
    });

    it('should navigate to lessons on fetch error', async () => {
      vi.mocked(useLocation).mockReturnValue({ state: {} } as any);
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      renderLessonPracticeSetup();

      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith('/lessons');
      });
    });
  });
});
