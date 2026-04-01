import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SpeakingMode } from '../../components/SpeakingMode/SpeakingMode';

// Mock fetch
global.fetch = vi.fn();

// Mock SpeechSynthesis
const mockSpeak = vi.fn();

class MockSpeechSynthesisUtterance {
  text: string;
  lang: string = '';
  constructor(text: string) {
    this.text = text;
  }
}

Object.assign(global, {
  speechSynthesis: {
    speak: mockSpeak,
  },
  SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
});

// Mock VoiceRecorder
vi.mock('../../components/VoiceRecorder/VoiceRecorder', () => ({
  VoiceRecorder: ({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) => (
    <div data-testid="voice-recorder">
      <button onClick={() => onRecordingComplete(new Blob(['test'], { type: 'audio/wav' }))}>
        Simulate Recording
      </button>
    </div>
  ),
}));

// Mock SpeechFeedback
vi.mock('../../components/SpeechFeedback/SpeechFeedback', () => ({
  SpeechFeedback: ({ onRetry, onContinue }: { onRetry: () => void; onContinue: () => void }) => (
    <div data-testid="speech-feedback">
      <button onClick={onRetry}>Retry</button>
      <button onClick={onContinue}>Continue</button>
    </div>
  ),
}));

// Mock useSpeechAssessment
const mockAssessPronunciation = vi.fn();
const mockResetAssessment = vi.fn();

vi.mock('../../hooks/useSpeechAssessment', () => ({
  useSpeechAssessment: () => ({
    result: null,
    isAssessing: false,
    assessPronunciation: mockAssessPronunciation,
    reset: mockResetAssessment,
  }),
}));

describe('SpeakingMode', () => {
  const mockShadowingExercises = [
    {
      id: 1,
      title: 'Basic Greeting',
      audio_url: '/audio/greeting.mp3',
      japanese_text: 'おはようございます',
      level: 'beginner',
      duration_seconds: 3,
    },
    {
      id: 2,
      title: 'Self Introduction',
      audio_url: '/audio/intro.mp3',
      japanese_text: '私は学生です',
      level: 'beginner',
      duration_seconds: 4,
    },
  ];

  const mockResponseDrills = [
    {
      id: 1,
      cue_text: 'Someone asks: "How are you?"',
      suggested_response: 'I am fine, thank you.',
      time_limit_seconds: 10,
      difficulty: 'easy',
      category: 'Greetings',
    },
  ];

  const mockConversationTemplates = [
    {
      id: 1,
      title: 'At the Restaurant',
      scenario: 'Ordering food',
      difficulty: 'intermediate',
      turns: [
        { speaker: 'A', japanese: 'いらっしゃいませ', romaji: 'Irasshaimase', meaning: 'Welcome' },
        { speaker: 'B', japanese: 'テーブルを予約しました', romaji: 'Teeburu wo yoyaku shimashita', meaning: 'I reserved a table' },
      ],
    },
  ];

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/speaking/shadowing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockShadowingExercises),
        });
      } else if (url.includes('/api/speaking/response-drills')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponseDrills),
        });
      } else if (url.includes('/api/speaking/templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockConversationTemplates),
        });
      } else if (url.includes('/api/speaking/evaluate-response')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ score: 85, feedback: 'Good response!' }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the header with title', () => {
      renderWithRouter(<SpeakingMode />);
      expect(screen.getByText('Speaking Practice')).toBeInTheDocument();
      expect(screen.getByText('🎤')).toBeInTheDocument();
    });

    it('should render all three tabs', () => {
      renderWithRouter(<SpeakingMode />);
      expect(screen.getByText('🎧 Shadowing')).toBeInTheDocument();
      expect(screen.getByText('⚡ Response Drills')).toBeInTheDocument();
      expect(screen.getByText('💬 Conversation')).toBeInTheDocument();
    });

    it('should have Shadowing tab active by default', () => {
      renderWithRouter(<SpeakingMode />);
      const shadowingTab = screen.getByText('🎧 Shadowing').closest('button');
      expect(shadowingTab).toHaveClass('active');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Response Drills tab when clicked', async () => {
      renderWithRouter(<SpeakingMode />);
      
      const responseTab = screen.getByText('⚡ Response Drills');
      fireEvent.click(responseTab);
      
      await waitFor(() => {
        expect(responseTab.closest('button')).toHaveClass('active');
      });
    });

    it('should switch to Conversation tab when clicked', async () => {
      renderWithRouter(<SpeakingMode />);
      
      const conversationTab = screen.getByText('💬 Conversation');
      fireEvent.click(conversationTab);
      
      await waitFor(() => {
        expect(conversationTab.closest('button')).toHaveClass('active');
      });
    });

    it('should switch back to Shadowing tab', async () => {
      renderWithRouter(<SpeakingMode />);
      
      // First switch to Response Drills
      fireEvent.click(screen.getByText('⚡ Response Drills'));
      
      // Then switch back to Shadowing
      const shadowingTab = screen.getByText('🎧 Shadowing');
      fireEvent.click(shadowingTab);
      
      await waitFor(() => {
        expect(shadowingTab.closest('button')).toHaveClass('active');
      });
    });
  });

  describe('Shadowing Mode', () => {
    it('should show loading state initially', () => {
      renderWithRouter(<SpeakingMode />);
      expect(screen.getByText('Loading exercises...')).toBeInTheDocument();
    });

    it('should load and display shadowing exercises', async () => {
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(screen.getByText('Select an Exercise')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      expect(screen.getByText('Self Introduction')).toBeInTheDocument();
    });

    it('should display exercise metadata', async () => {
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      // Check that metadata is displayed (using getAllByText since multiple exercises have same level)
      expect(screen.getAllByText(/Level: beginner/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('3s')).toBeInTheDocument();
    });

    it('should select an exercise when clicked', async () => {
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Basic Greeting'));
      
      await waitFor(() => {
        expect(screen.getByText('← Back to List')).toBeInTheDocument();
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
    });

    it('should display Japanese text when exercise is selected', async () => {
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Basic Greeting'));
      
      await waitFor(() => {
        expect(screen.getByText('おはようございます')).toBeInTheDocument();
      });
    });

    it('should have Play Native Audio button', async () => {
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Basic Greeting'));
      
      await waitFor(() => {
        expect(screen.getByText('▶ Play Native Audio')).toBeInTheDocument();
      });
    });

    it('should play native audio when button is clicked', async () => {
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Basic Greeting'));
      
      await waitFor(() => {
        expect(screen.getByText('▶ Play Native Audio')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('▶ Play Native Audio'));
      
      expect(mockSpeak).toHaveBeenCalled();
    });

    it('should show VoiceRecorder when exercise is selected', async () => {
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Basic Greeting'));
      
      await waitFor(() => {
        expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
      });
    });

    it('should go back to exercise list when back button is clicked', async () => {
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Basic Greeting'));
      
      await waitFor(() => {
        expect(screen.getByText('← Back to List')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('← Back to List'));
      
      await waitFor(() => {
        expect(screen.getByText('Select an Exercise')).toBeInTheDocument();
      });
    });
  });

  describe('Response Drills Mode', () => {
    it('should load and display response drills', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('⚡ Response Drills'));
      
      await waitFor(() => {
        expect(screen.getByText('Response Drills')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Greetings')).toBeInTheDocument();
    });

    it('should show drill description', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('⚡ Response Drills'));
      
      await waitFor(() => {
        expect(screen.getByText(/Someone asks/)).toBeInTheDocument();
      });
    });

    it('should start a drill when clicked', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('⚡ Response Drills'));
      
      await waitFor(() => {
        expect(screen.getByText('Greetings')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Greetings'));
      
      await waitFor(() => {
        expect(screen.getByText('Scenario')).toBeInTheDocument();
        expect(screen.getByText(/Someone asks/)).toBeInTheDocument();
      });
    });

    it('should display timer when drill is active', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('⚡ Response Drills'));
      
      await waitFor(() => {
        expect(screen.getByText('Greetings')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Greetings'));
      
      await waitFor(() => {
        expect(screen.getByText(/seconds remaining/)).toBeInTheDocument();
      });
    });

    it('should show VoiceRecorder in active drill', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('⚡ Response Drills'));
      
      await waitFor(() => {
        expect(screen.getByText('Greetings')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Greetings'));
      
      await waitFor(() => {
        expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
      });
    });

    it('should show suggested response section', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('⚡ Response Drills'));
      
      await waitFor(() => {
        expect(screen.getByText('Greetings')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Greetings'));
      
      await waitFor(() => {
        expect(screen.getByText('Suggested Response')).toBeInTheDocument();
        expect(screen.getByText('I am fine, thank you.')).toBeInTheDocument();
      });
    });
  });

  describe('Conversation Mode', () => {
    it('should load and display conversation templates', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('💬 Conversation'));
      
      await waitFor(() => {
        expect(screen.getByText('Conversation Practice')).toBeInTheDocument();
      });
      
      expect(screen.getByText('At the Restaurant')).toBeInTheDocument();
    });

    it('should show template scenario', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('💬 Conversation'));
      
      await waitFor(() => {
        expect(screen.getByText('At the Restaurant')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Ordering food/)).toBeInTheDocument();
    });

    it('should show role selection buttons', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('💬 Conversation'));
      
      await waitFor(() => {
        expect(screen.getByText('At the Restaurant')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Play Role A')).toBeInTheDocument();
      expect(screen.getByText('Play Role B')).toBeInTheDocument();
    });

    it('should start conversation when role is selected', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('💬 Conversation'));
      
      await waitFor(() => {
        expect(screen.getByText('Play Role A')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Play Role A'));
      
      await waitFor(() => {
        expect(screen.getByText('← Back to Templates')).toBeInTheDocument();
        expect(screen.getByText('At the Restaurant')).toBeInTheDocument();
      });
    });

    it('should display user role when conversation starts', async () => {
      renderWithRouter(<SpeakingMode />);
      
      fireEvent.click(screen.getByText('💬 Conversation'));
      
      await waitFor(() => {
        expect(screen.getByText('Play Role A')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Play Role A'));
      
      await waitFor(() => {
        expect(screen.getByText(/You are playing:/)).toBeInTheDocument();
        // Use getAllByText since 'A' appears in multiple places (role indicator and dialogue)
        expect(screen.getAllByText('A').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<SpeakingMode />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch shadowing exercises:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });
});
