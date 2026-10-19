import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpeakingMode } from '../../components/SpeakingMode/SpeakingMode';

// Mock API config to use a stable test URL
vi.mock('../../config/api', () => ({
  API_URL: 'https://test-api.example.com',
}));

// Mock Header to keep tests focused on SpeakingMode behavior
vi.mock('../../components/Header', () => ({
  Header: ({ title, icon }: any) => (
    <header data-testid="header">
      <span>{icon}</span>
      <h1>{title}</h1>
    </header>
  ),
}));

// Mock VoiceRecorder so tests can drive recordings without MediaRecorder.
// Clicking the stub button simulates a completed recording.
vi.mock('../../components/VoiceRecorder/VoiceRecorder', () => ({
  VoiceRecorder: ({ onRecordingComplete }: any) => (
    <button
      data-testid="simulate-recording"
      onClick={() => onRecordingComplete(new Blob(['test-audio'], { type: 'audio/webm' }))}
    >
      Simulate Recording
    </button>
  ),
}));

describe('Speaking Flow Integration', () => {
  const mockExercises = [
    {
      id: 1,
      title: 'Greeting Practice',
      audio_url: 'https://example.com/audio1.mp3',
      japanese_text: 'こんにちは、元気ですか',
      level: 'N5',
      duration_seconds: 30,
    },
    {
      id: 2,
      title: 'Self Introduction',
      audio_url: 'https://example.com/audio2.mp3',
      japanese_text: '私は学生です',
      level: 'N4',
      duration_seconds: 45,
    },
  ];

  const mockDrills = [
    {
      id: 1,
      cue_text: 'Someone says good morning to you at work. How do you respond?',
      suggested_response: 'おはようございます',
      time_limit_seconds: 30,
      difficulty: 'beginner',
      category: 'Greetings',
    },
  ];

  const mockTemplates = [
    {
      id: 1,
      title: 'At the Restaurant',
      scenario: 'Ordering food',
      difficulty: 'N5',
      turns: [
        {
          speaker: 'A',
          japanese: 'すみません、メニューをください',
          romaji: 'sumimasen, menyuu wo kudasai',
          meaning: 'Excuse me, please give me the menu',
        },
        {
          speaker: 'B',
          japanese: 'はい、どうぞ',
          romaji: 'hai, douzo',
          meaning: 'Yes, here you go',
        },
      ],
    },
  ];

  const mockAssessment = {
    transcript: 'こんにちは、元気ですか',
    accuracyScore: 92,
    feedback: {
      overall: 'Great pronunciation!',
      errors: [],
      suggestions: ['Keep practicing pitch accent'],
    },
    expected: 'こんにちは、元気ですか',
    expectedRomaji: 'konnichiwa, genki desu ka',
  };

  const mockEvaluation = { score: 85, feedback: 'Good natural response!' };

  let speakMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();

    // jsdom does not implement the SpeechSynthesis API
    speakMock = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: { speak: speakMock },
    });
    (global as Record<string, unknown>).SpeechSynthesisUtterance = class {
      lang = '';
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Helper that wires global.fetch to canned responses based on the request URL.
   */
  const setupFetchMock = () => {
    global.fetch = vi.fn(async (url: string, _options?: RequestInit) => {
      if (url === 'https://test-api.example.com/api/speaking/shadowing') {
        return { ok: true, json: async () => mockExercises };
      }
      if (url === 'https://test-api.example.com/api/speaking/response-drills') {
        return { ok: true, json: async () => mockDrills };
      }
      if (url === 'https://test-api.example.com/api/speaking/templates') {
        return { ok: true, json: async () => mockTemplates };
      }
      if (url === 'https://test-api.example.com/api/speech/assess') {
        return { ok: true, json: async () => mockAssessment };
      }
      if (url === 'https://test-api.example.com/api/speaking/evaluate-response') {
        return { ok: true, json: async () => mockEvaluation };
      }

      // eslint-disable-next-line no-console
      console.error('Unexpected fetch URL in test:', url);
      return { ok: false, status: 404, json: async () => ({}) };
    }) as unknown as typeof global.fetch;
  };

  // ---------------------------------------------------------------------------
  // 1. Initial load
  // ---------------------------------------------------------------------------
  it('should render the header and the shadowing tab by default', async () => {
    setupFetchMock();

    render(<SpeakingMode />);

    expect(screen.getByTestId('header')).toHaveTextContent('Speaking Practice');
    expect(screen.getByRole('button', { name: /shadowing/i })).toHaveClass('active');
    expect(screen.getByRole('button', { name: /response drills/i })).not.toHaveClass('active');

    // Default tab fetches and renders shadowing exercises
    await waitFor(() => {
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
      expect(screen.getByText('Self Introduction')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('https://test-api.example.com/api/speaking/shadowing');
  });

  // ---------------------------------------------------------------------------
  // 2. Tab switching between all three modes
  // ---------------------------------------------------------------------------
  it('should switch between shadowing, response drills, and conversation tabs', async () => {
    setupFetchMock();

    render(<SpeakingMode />);

    await waitFor(() => {
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
    });

    // Switch to Response Drills
    fireEvent.click(screen.getByRole('button', { name: /response drills/i }));

    await waitFor(() => {
      expect(screen.getByText('Greetings')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('https://test-api.example.com/api/speaking/response-drills');
    expect(screen.getByRole('button', { name: /response drills/i })).toHaveClass('active');

    // Switch to Conversation
    fireEvent.click(screen.getByRole('button', { name: /conversation/i }));

    await waitFor(() => {
      expect(screen.getByText('At the Restaurant')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('https://test-api.example.com/api/speaking/templates');
    expect(screen.getByRole('button', { name: /conversation/i })).toHaveClass('active');

    // Switch back to Shadowing
    fireEvent.click(screen.getByRole('button', { name: /shadowing/i }));

    await waitFor(() => {
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /shadowing/i })).toHaveClass('active');
  });

  // ---------------------------------------------------------------------------
  // 3. Shadowing happy path: select exercise -> record -> feedback -> continue
  // ---------------------------------------------------------------------------
  it('should complete the shadowing flow: exercise selection, recording, and feedback', async () => {
    setupFetchMock();

    render(<SpeakingMode />);

    await waitFor(() => {
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
    });

    // Select an exercise
    fireEvent.click(screen.getByText('Greeting Practice'));

    await waitFor(() => {
      expect(screen.getByText('▶ Play Native Audio')).toBeInTheDocument();
    });
    expect(screen.getByText('こんにちは、元気ですか')).toBeInTheDocument();
    expect(screen.getByTestId('simulate-recording')).toBeInTheDocument();

    // Play native audio uses Japanese TTS
    fireEvent.click(screen.getByText('▶ Play Native Audio'));
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].lang).toBe('ja-JP');

    // Simulate recording -> assessment is fetched and feedback is shown
    fireEvent.click(screen.getByTestId('simulate-recording'));

    await waitFor(() => {
      expect(screen.getByText('🌟 Excellent!')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://test-api.example.com/api/speech/assess',
      expect.objectContaining({ method: 'POST' })
    );
    // Text appears in the exercise display, the transcript, and the expected box
    expect(screen.getAllByText('こんにちは、元気ですか').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('What you said:')).toBeInTheDocument();

    // Continue returns to the exercise list
    fireEvent.click(screen.getByText('Continue →'));

    await waitFor(() => {
      expect(screen.getByText('Select an Exercise')).toBeInTheDocument();
      expect(screen.getByText('Self Introduction')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Shadowing retry flow
  // ---------------------------------------------------------------------------
  it('should allow retrying a recording from the feedback view', async () => {
    setupFetchMock();

    render(<SpeakingMode />);

    await waitFor(() => {
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Greeting Practice'));

    await waitFor(() => {
      expect(screen.getByTestId('simulate-recording')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('simulate-recording'));

    await waitFor(() => {
      expect(screen.getByText('🌟 Excellent!')).toBeInTheDocument();
    });

    // Retry hides feedback and shows the recorder again
    fireEvent.click(screen.getByText('🔄 Try Again'));

    await waitFor(() => {
      expect(screen.getByTestId('simulate-recording')).toBeInTheDocument();
    });
    expect(screen.queryByText('🌟 Excellent!')).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 5. Shadowing back navigation
  // ---------------------------------------------------------------------------
  it('should return to the exercise list when Back is pressed in shadowing view', async () => {
    setupFetchMock();

    render(<SpeakingMode />);

    await waitFor(() => {
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Greeting Practice'));

    await waitFor(() => {
      expect(screen.getByText('▶ Play Native Audio')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('← Back to List'));

    await waitFor(() => {
      expect(screen.getByText('Select an Exercise')).toBeInTheDocument();
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Response drill happy path: start drill -> record -> evaluation
  // ---------------------------------------------------------------------------
  it('should complete a response drill: start, record, and evaluate', async () => {
    setupFetchMock();

    render(<SpeakingMode />);

    await waitFor(() => {
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /response drills/i }));

    await waitFor(() => {
      expect(screen.getByText('Greetings')).toBeInTheDocument();
    });

    // Start the drill
    fireEvent.click(screen.getByText('Greetings'));

    await waitFor(() => {
      expect(screen.getByText('Scenario')).toBeInTheDocument();
    });
    expect(screen.getByText('0:30')).toBeInTheDocument(); // 30s time limit
    expect(screen.getByText('Suggested Response')).toBeInTheDocument();
    expect(screen.getByTestId('simulate-recording')).toBeInTheDocument();

    // Simulate recording -> evaluation request is sent
    fireEvent.click(screen.getByTestId('simulate-recording'));

    await waitFor(() => {
      expect(screen.getByText('🎉 Excellent!')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://test-api.example.com/api/speaking/evaluate-response',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          userResponse: '[recorded audio]',
          suggestedResponse: 'おはようございます',
          drillId: 1,
        }),
      })
    );
    expect(screen.getByText('Good natural response!')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 7. Conversation flow: pick a role and complete all turns
  // ---------------------------------------------------------------------------
  it('should complete a conversation: role selection, turn-taking, and completion', async () => {
    setupFetchMock();

    render(<SpeakingMode />);

    await waitFor(() => {
      expect(screen.getByText('Greeting Practice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /conversation/i }));

    await waitFor(() => {
      expect(screen.getByText('At the Restaurant')).toBeInTheDocument();
    });

    // Play Role A -> first turn belongs to the user
    fireEvent.click(screen.getByRole('button', { name: /play role a/i }));

    await waitFor(() => {
      expect(screen.getByText("You are playing:")).toBeInTheDocument();
    });
    expect(screen.getByText("🎤 It's your turn! Practice saying the line above.")).toBeInTheDocument();
    // Turn text appears both in the dialogue history and in the "Your line" section
    expect(screen.getAllByText('すみません、メニューをください').length).toBe(2);

    // Complete turn 1 -> partner turn
    fireEvent.click(screen.getByRole('button', { name: /i said it/i }));

    await waitFor(() => {
      expect(screen.getByText('Partner says:')).toBeInTheDocument();
    });
    expect(screen.getAllByText('はい、どうぞ').length).toBe(2);

    // Partner audio uses Japanese TTS
    fireEvent.click(screen.getByRole('button', { name: /play audio/i }));
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].lang).toBe('ja-JP');

    // Complete turn 2 -> conversation complete
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText('🎉 Conversation Complete!')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Error handling: failed fetch renders empty state without crashing
  // ---------------------------------------------------------------------------
  it('should recover gracefully when fetching exercises fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network failure'))
    ) as unknown as typeof global.fetch;

    render(<SpeakingMode />);

    await waitFor(() => {
      expect(screen.getByText('Select an Exercise')).toBeInTheDocument();
    });

    // No exercises rendered, but the app does not crash and tabs still work
    expect(screen.queryByText('Greeting Practice')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /response drills/i })).toBeInTheDocument();
  });
});
