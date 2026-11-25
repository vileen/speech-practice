import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonDetail } from '../../pages/LessonDetail';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ id: 'lesson-42' }),
    useNavigate: vi.fn(() => mockNavigate),
  };
});

// Mock AuthenticatedRoute to render children directly
vi.mock('../../App', () => ({
  AuthenticatedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock LessonMode — expose props and callback triggers
vi.mock('../../components/LessonMode/index.js', () => ({
  LessonMode: ({ password, onBack, onStartLessonChat, onSelectLesson, selectedLessonId }: any) => (
    <div
      data-testid="lesson-mode"
      data-password={password}
      data-selected-lesson-id={selectedLessonId ?? ''}
    >
      <button data-testid="back-btn" onClick={onBack}>Back</button>
      <button
        data-testid="start-chat-btn"
        onClick={() => onStartLessonChat('lesson-7', 'Some Title')}
      >
        Start Chat
      </button>
      <button data-testid="select-lesson-btn" onClick={() => onSelectLesson('lesson-99')}>
        Select Lesson
      </button>
      <button data-testid="select-null-btn" onClick={() => onSelectLesson(null)}>
        Select Null
      </button>
    </div>
  ),
}));

describe('LessonDetail (page)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => {
          if (key === 'speech_practice_password') return 'test-password';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <LessonDetail />
      </MemoryRouter>
    );

  it('renders LessonMode inside AuthenticatedRoute', () => {
    renderPage();
    expect(screen.getByTestId('lesson-mode')).toBeInTheDocument();
  });

  it('passes selectedLessonId from the route param to LessonMode', () => {
    renderPage();
    expect(screen.getByTestId('lesson-mode')).toHaveAttribute(
      'data-selected-lesson-id',
      'lesson-42'
    );
  });

  it('reads the password from localStorage and passes it to LessonMode', () => {
    renderPage();
    expect(window.localStorage.getItem).toHaveBeenCalledWith('speech_practice_password');
    expect(screen.getByTestId('lesson-mode')).toHaveAttribute('data-password', 'test-password');
  });

  it('passes empty string as password when localStorage has none', () => {
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    renderPage();
    expect(screen.getByTestId('lesson-mode')).toHaveAttribute('data-password', '');
  });

  it('navigates to /lessons when onBack is called', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('back-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/lessons');
  });

  it('navigates to /lessons/:id/setup when onStartLessonChat is called', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('start-chat-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/lessons/lesson-7/setup');
  });

  it('navigates to /lessons/:id when onSelectLesson is called with an id', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('select-lesson-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/lessons/lesson-99');
  });

  it('navigates to /lessons when onSelectLesson is called with null', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('select-null-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/lessons');
  });
});
