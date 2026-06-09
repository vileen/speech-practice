import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonPractice } from '../../pages/LessonPractice';

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ id: 'lesson-1' }),
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
  };
});

vi.mock('../../App', () => ({
  AuthenticatedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../config/api', () => ({
  API_URL: 'https://test-api.example.com',
  getPassword: () => 'test-password',
}));

vi.mock('../../components/Header', () => ({
  Header: ({ title }: any) => <header data-testid="header"><h1>{title}</h1></header>,
}));

vi.mock('../../components/AudioPlayer', () => ({
  AudioPlayer: ({ audioUrl, onPlay }: any) => (
    <div data-testid="audio-player" data-audio-url={audioUrl}>
      <button onClick={() => onPlay?.(new Audio())}>Play</button>
    </div>
  ),
}));

vi.mock('../../components/VoiceRecorder', () => ({
  VoiceRecorder: ({ onRecordingComplete, mode }: any) => (
    <div data-testid="voice-recorder" data-mode={mode}>
      <button onClick={() => onRecordingComplete?.(new Blob())}>Record</button>
    </div>
  ),
}));

vi.mock('../../components/HighlightedText', () => ({
  HighlightedText: ({ text }: any) => <span data-testid="highlighted-text">{text}</span>,
}));

vi.mock('../../translations', () => ({
  translateLessonTitle: (title: string) => title,
}));

describe('LessonPractice', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => {
          if (key === 'speech_practice_password') return 'test-password';
          if (key === 'speechPracticeShowFurigana') return 'true';
          if (key === 'speechPracticeVolume') return '0.8';
          return null;
        }),
        setItem: vi.fn(),
      },
      writable: true,
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob://mock-audio-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  const renderLessonPractice = () => {
    return render(
      <MemoryRouter>
        <LessonPractice />
      </MemoryRouter>
    );
  };

  const setupStandardFetchMocks = () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock lesson fetch
    mockFetch.mockImplementation((url: string, _options: any) => {
      if (url.includes('/api/lessons/lesson-1') && !url.includes('/start')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'lesson-1', title: 'Test Lesson' }),
        } as Response);
      }
      if (url.includes('/api/sessions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 123, language: 'japanese', voice_gender: 'female' }),
        } as Response);
      }
      if (url.includes('/api/lessons/lesson-1/start')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      }
      if (url.includes('/api/chat')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            text: 'Hello! Let\'s practice Japanese.',
            text_with_furigana: '<ruby>Hello<rt>hello</rt></ruby>!',
            romaji: 'Hello! Let\'s practice Japanese.',
            translation: 'Cześć! Ćwiczmy japoński.',
          }),
        } as Response);
      }
      if (url.includes('/api/tts')) {
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/mp3' })),
        } as Response);
      }
      return Promise.resolve({ ok: false } as Response);
    });
  };

  describe('loading state', () => {
    it('should show loading state on initial render', () => {
      vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));
      renderLessonPractice();
      expect(screen.getByText('Loading lesson...')).toBeInTheDocument();
    });
  });

  describe('session initialization', () => {
    it('should load lesson and initialize session on mount', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText('Speech Practice')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Check that session info renders
      await waitFor(() => {
        expect(screen.getByText('🌍 Japanese')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should render active lesson title when loaded', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText('📚 Test Lesson')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should render furigana toggle button', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText('あ')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('message display', () => {
    it('should render assistant message after chat response', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText("Hello! Let's practice Japanese.")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should render teacher role badge', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText('Teacher')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('user interactions', () => {
    it('should allow typing in the input field', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type in Japanese or English...')).toBeInTheDocument();
      }, { timeout: 2000 });

      const input = screen.getByPlaceholderText('Type in Japanese or English...');
      fireEvent.change(input, { target: { value: 'Konnichiwa' } });
      expect(input).toHaveValue('Konnichiwa');
    });

    it('should render send button', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText('Send')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('recording mode', () => {
    it('should render voice recorder with default push-to-talk mode', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
      }, { timeout: 2000 });

      const recorder = screen.getByTestId('voice-recorder');
      expect(recorder).toHaveAttribute('data-mode', 'push-to-talk');
    });

    it('should have voice mode toggle buttons', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText('🎤 Voice Activated')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('🎙️ Push to Talk')).toBeInTheDocument();
    });
  });

  describe('volume control', () => {
    it('should render volume slider', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        const volumeSlider = screen.getByRole('slider');
        expect(volumeSlider).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('error handling', () => {
    it('should navigate to /lessons when lesson fetch fails', async () => {
      const navigateMock = vi.fn();
      const { useNavigate } = await import('react-router-dom');
      vi.mocked(useNavigate).mockReturnValue(navigateMock);

      const mockFetch = vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          status: 404,
        } as Response);
      });
      global.fetch = mockFetch;

      renderLessonPractice();

      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith('/lessons');
      }, { timeout: 2000 });
    });
  });

  describe('navigation buttons', () => {
    it('should render back button', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText('← Back')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should render end session button', async () => {
      setupStandardFetchMocks();
      renderLessonPractice();

      await waitFor(() => {
        expect(screen.getByText('End')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});
