import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListeningMode } from '../../components/ListeningMode/ListeningMode';

// Mock API config to use a stable test URL
vi.mock('../../config/api', () => ({
  API_URL: 'https://test-api.example.com',
}));

// Mock furigana hook to avoid extra network calls and simplify assertions
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: () => ({ furigana: null, isLoading: false, error: null }),
}));

// Mock Header to keep tests focused on ListeningMode behavior
vi.mock('../../components/Header', () => ({
  Header: ({ title, icon, onBack, actions }: any) => (
    <header data-testid="header">
      <span>{icon}</span>
      <h1>{title}</h1>
      {onBack && <button data-testid="back-btn" onClick={onBack}>Back</button>}
      {actions}
    </header>
  ),
}));

describe('Listening Flow Integration', () => {
  const mockPassages = [
    {
      id: 1,
      title: 'Daily Conversation',
      level: 'N5',
      audio_url: 'https://example.com/audio1.mp3',
      duration_seconds: 120,
      difficulty_speed: 'slow',
      topic_category: 'Daily Life',
      created_at: '2024-01-01',
    },
    {
      id: 2,
      title: 'Work Meeting',
      level: 'N4',
      audio_url: 'https://example.com/audio2.mp3',
      duration_seconds: 180,
      difficulty_speed: 'normal',
      topic_category: 'Work',
      created_at: '2024-01-02',
    },
  ];

  const mockQuestions = [
    {
      id: 1,
      passage_id: 1,
      question_text: 'What is the main topic?',
      question_type: 'main_idea' as const,
      options: ['Daily routine', 'Work meeting', 'Shopping', 'Travel'],
      correct_answer: 0,
      explanation: 'The passage is about daily routine.',
    },
    {
      id: 2,
      passage_id: 1,
      question_text: 'What time do they wake up?',
      question_type: 'detail' as const,
      options: ['6:00', '7:00', '8:00', '9:00'],
      correct_answer: 1,
      explanation: 'They wake up at 7:00.',
    },
  ];

  const mockQuizResult = {
    score: 100,
    correctCount: 2,
    totalQuestions: 2,
    results: [
      {
        questionId: 1,
        selectedOption: 0,
        isCorrect: true,
        correctAnswer: 0,
        explanation: 'Correct!',
        questionType: 'main_idea',
      },
      {
        questionId: 2,
        selectedOption: 1,
        isCorrect: true,
        correctAnswer: 1,
        explanation: 'Correct!',
        questionType: 'detail',
      },
    ],
    listeningTimeSeconds: 145,
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    // Ensure localStorage returns a password so the hook can auth
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
      if (key === 'speech_practice_password') return 'test-password';
      return null;
    });

    // Mock confirm for partial-submission flow
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: vi.fn(() => true),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Helper that wires global.fetch to canned responses based on the request URL.
   */
  const setupFetchMock = () => {
    global.fetch = vi.fn(async (url: string, _options?: RequestInit) => {
      if (url === 'https://test-api.example.com/api/listening/passages') {
        return { ok: true, json: async () => ({ passages: mockPassages }) };
      }
      if (url === 'https://test-api.example.com/api/listening/passages?level=N5') {
        return { ok: true, json: async () => ({ passages: mockPassages.filter((p) => p.level === 'N5') }) };
      }
      if (url === 'https://test-api.example.com/api/listening/passages/1') {
        return { ok: true, json: async () => ({ passage: mockPassages[0] }) };
      }
      if (url === 'https://test-api.example.com/api/listening/passages/1/questions') {
        return { ok: true, json: async () => ({ questions: mockQuestions }) };
      }
      if (url === 'https://test-api.example.com/api/listening/passages/1/transcript') {
        return { ok: true, json: async () => ({ transcript: 'Test transcript text', japaneseText: 'テストの文章' }) };
      }
      if (url === 'https://test-api.example.com/api/listening/submit') {
        return { ok: true, json: async () => mockQuizResult };
      }

      // eslint-disable-next-line no-console
      console.error('Unexpected fetch URL in test:', url);
      return { ok: false, status: 404, json: async () => ({}) };
    }) as unknown as typeof global.fetch;
  };

  // ---------------------------------------------------------------------------
  // 1. Initial load
  // ---------------------------------------------------------------------------
  it('should fetch and render the passage list on mount', async () => {
    setupFetchMock();

    render(<ListeningMode />);

    // Should eventually show both passages
    await waitFor(() => {
      expect(screen.getByText('Daily Conversation')).toBeInTheDocument();
      expect(screen.getByText('Work Meeting')).toBeInTheDocument();
    });

    expect(screen.getByText('N5')).toBeInTheDocument();
    expect(screen.getByText('N4')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 2. Filter by level
  // ---------------------------------------------------------------------------
  it('should filter passages when a level is selected', async () => {
    setupFetchMock();

    render(<ListeningMode />);

    await waitFor(() => {
      expect(screen.getByText('Daily Conversation')).toBeInTheDocument();
    });

    const levelSelect = screen.getByRole('combobox');
    fireEvent.change(levelSelect, { target: { value: 'N5' } });

    // After selecting N5, the hook re-fetches; wait for the UI to settle
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/listening/passages?level=N5',
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Password': 'test-password' }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Happy path: full listening -> questions -> results flow
  // ---------------------------------------------------------------------------
  it('should navigate through the full listening flow and show results', async () => {
    setupFetchMock();

    render(<ListeningMode />);

    // 1. List view
    await waitFor(() => {
      expect(screen.getByText('Daily Conversation')).toBeInTheDocument();
    });

    // 2. Select a passage -> triggers fetchPassage
    fireEvent.click(screen.getByText('Daily Conversation'));

    await waitFor(() => {
      expect(screen.getByTitle('Play')).toBeInTheDocument();
    });

    // 3. Simulate audio progress so the Continue button is enabled
    const progressBar = screen.getByRole('slider');
    fireEvent.change(progressBar, { target: { value: '10' } });

    // 4. Continue to questions
    const continueBtn = screen.getByText('Continue to Questions →');
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText('Questions')).toBeInTheDocument();
    });

    expect(screen.getByText('What is the main topic?')).toBeInTheDocument();
    expect(screen.getByText('What time do they wake up?')).toBeInTheDocument();

    // 5. Answer both questions
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]); // Q1 option A
    fireEvent.click(radioButtons[5]); // Q2 option B (4 options per question)

    // 6. Submit answers
    const submitBtn = screen.getByText('Submit Answers');
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // 7. Results view
    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.getByText('Review Answers')).toBeInTheDocument();
    expect(screen.getAllByText('✓ Correct').length).toBe(2);
  });

  // ---------------------------------------------------------------------------
  // 4. Error on initial load
  // ---------------------------------------------------------------------------
  it('should display an error when fetching passages fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      })
    ) as unknown as typeof global.fetch;

    render(<ListeningMode />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Partial answers trigger confirmation dialog
  // ---------------------------------------------------------------------------
  it('should prompt for confirmation when submitting with unanswered questions', async () => {
    setupFetchMock();

    render(<ListeningMode />);

    await waitFor(() => {
      expect(screen.getByText('Daily Conversation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Daily Conversation'));

    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    // Enable Continue button
    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } });
    fireEvent.click(screen.getByText('Continue to Questions →'));

    await waitFor(() => {
      expect(screen.getByText('Questions')).toBeInTheDocument();
    });

    // Answer only ONE question
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    fireEvent.click(screen.getByText('Submit Answers'));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('You have 1 unanswered question(s). Submit anyway?');
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Transcript reveal after quiz
  // ---------------------------------------------------------------------------
  it('should fetch and display the transcript after viewing results', async () => {
    setupFetchMock();

    render(<ListeningMode />);

    await waitFor(() => {
      expect(screen.getByText('Daily Conversation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Daily Conversation'));

    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } });
    fireEvent.click(screen.getByText('Continue to Questions →'));

    await waitFor(() => {
      expect(screen.getByText('Questions')).toBeInTheDocument();
    });

    // Answer all questions
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);
    fireEvent.click(radios[5]);

    fireEvent.click(screen.getByText('Submit Answers'));

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument();
    });

    // Click show transcript
    fireEvent.click(screen.getByText('📜 Show Transcript'));

    await waitFor(() => {
      expect(screen.getByText('Transcript')).toBeInTheDocument();
      expect(screen.getByText('テストの文章')).toBeInTheDocument();
    });

    // Verify the transcript endpoint was called
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test-api.example.com/api/listening/passages/1/transcript',
      expect.any(Object)
    );
  });

  // ---------------------------------------------------------------------------
  // 7. Back navigation resets state
  // ---------------------------------------------------------------------------
  it('should return to the passage list and reset state when Back is pressed from listening view', async () => {
    setupFetchMock();

    render(<ListeningMode />);

    await waitFor(() => {
      expect(screen.getByText('Daily Conversation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Daily Conversation'));

    await waitFor(() => {
      expect(screen.getByTitle('Play')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('back-btn'));

    await waitFor(() => {
      expect(screen.getByText('Daily Conversation')).toBeInTheDocument();
      expect(screen.getByText('Work Meeting')).toBeInTheDocument();
    });
  });
});
