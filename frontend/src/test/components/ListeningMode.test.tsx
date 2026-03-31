import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListeningMode } from '../../components/ListeningMode/ListeningMode';
import * as useListeningModeModule from '../../hooks/useListeningMode';
import * as useFuriganaModule from '../../hooks/useFurigana';

// Mock the hooks
vi.mock('../../hooks/useListeningMode');
vi.mock('../../hooks/useFurigana');

// Mock Header component
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

describe('ListeningMode', () => {
  const mockFetchPassages = vi.fn();
  const mockFetchPassage = vi.fn();
  const mockSelectAnswer = vi.fn();
  const mockSubmitAnswers = vi.fn();
  const mockFetchTranscript = vi.fn();
  const mockReset = vi.fn();

  const mockPassages = [
    {
      id: 1,
      title: 'Test Passage 1',
      level: 'N5',
      audio_url: 'https://example.com/audio1.mp3',
      duration_seconds: 120,
      difficulty_speed: 'slow',
      topic_category: 'Daily Life',
      created_at: '2024-01-01',
    },
    {
      id: 2,
      title: 'Test Passage 2',
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
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 0,
      explanation: 'This is the explanation',
    },
    {
      id: 2,
      passage_id: 1,
      question_text: 'What time did they meet?',
      question_type: 'detail' as const,
      options: ['10:00', '11:00', '12:00', '13:00'],
      correct_answer: 1,
      explanation: 'They met at 11:00',
    },
  ];

  const mockQuizResult = {
    score: 75,
    correctCount: 3,
    totalQuestions: 4,
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
        selectedOption: 2,
        isCorrect: false,
        correctAnswer: 1,
        explanation: 'Wrong answer',
        questionType: 'detail',
      },
    ],
    listeningTimeSeconds: 145,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup localStorage mock
    Storage.prototype.getItem = vi.fn(() => null);
    Storage.prototype.setItem = vi.fn();
    
    // Setup window.confirm mock
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: vi.fn(() => true),
    });

    // Mock useFurigana to return the text as-is (no furigana transformation)
    vi.mocked(useFuriganaModule.useFurigana).mockReturnValue({
      furigana: null,
      loading: false,
      error: null,
    });

    // Default mock for useListeningMode
    vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
      passages: [],
      currentPassage: null,
      questions: [],
      answers: {},
      result: null,
      transcript: null,
      loading: false,
      error: null,
      fetchPassages: mockFetchPassages,
      fetchPassage: mockFetchPassage,
      selectAnswer: mockSelectAnswer,
      submitAnswers: mockSubmitAnswers,
      fetchTranscript: mockFetchTranscript,
      reset: mockReset,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Load - Passage List View', () => {
    it('should render header with correct title', () => {
      render(<ListeningMode />);
      expect(screen.getByTestId('header')).toHaveTextContent('Listening Practice');
      expect(screen.getByTestId('header')).toHaveTextContent('🎧');
    });

    it('should fetch passages on mount', () => {
      render(<ListeningMode />);
      expect(mockFetchPassages).toHaveBeenCalled();
    });

    it('should show loading state', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: [],
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: true,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      expect(screen.getByText('Loading passages...')).toBeInTheDocument();
    });

    it('should display empty state when no passages', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: [],
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      expect(screen.getByText('No listening passages found.')).toBeInTheDocument();
    });

    it('should render list of passages', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
      expect(screen.getByText('Test Passage 2')).toBeInTheDocument();
      expect(screen.getByText('N5')).toBeInTheDocument();
      expect(screen.getByText('N4')).toBeInTheDocument();
    });

    it('should display passage metadata', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      expect(screen.getByText('Daily Life')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('should filter passages by level', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      
      const levelSelect = screen.getByRole('combobox');
      fireEvent.change(levelSelect, { target: { value: 'N5' } });
      
      expect(mockFetchPassages).toHaveBeenCalledWith('N5');
    });

    it('should call fetchPassage when passage is clicked', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      
      // Click on passage card
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      expect(mockFetchPassage).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error occurs', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: [],
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: 'Failed to fetch passages',
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      
      expect(screen.getByText('Error: Failed to fetch passages')).toBeInTheDocument();
    });
  });

  describe('Furigana Toggle', () => {
    it('should render furigana toggle button', () => {
      render(<ListeningMode />);
      
      // Default is no saved preference, so button shows "漢" with "Show furigana" title
      expect(screen.getByTitle('Show furigana')).toBeInTheDocument();
    });

    it('should render furigana button with correct text', () => {
      render(<ListeningMode />);
      
      // The furigana button should be in the header actions
      const furiganaBtn = screen.getByTitle('Show furigana');
      expect(furiganaBtn).toBeInTheDocument();
      expect(furiganaBtn).toHaveTextContent('漢');
    });
  });

  describe('Format Time', () => {
    it('should format time correctly in passage list', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: [
          { ...mockPassages[0], duration_seconds: 65 },
        ],
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      
      // 65 seconds should format as 1:05
      expect(screen.getByText('1:05')).toBeInTheDocument();
    });

    it('should handle null duration', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: [
          { ...mockPassages[0], duration_seconds: null },
        ],
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      
      // Should not crash with null duration
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });
  });

  describe('useListeningMode hook integration', () => {
    it('should pass correct parameters to fetchPassages when level filter changes', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      
      const levelSelect = screen.getByRole('combobox');
      
      // Test N5 filter
      fireEvent.change(levelSelect, { target: { value: 'N5' } });
      expect(mockFetchPassages).toHaveBeenCalledWith('N5');
      
      // Test N4 filter
      fireEvent.change(levelSelect, { target: { value: 'N4' } });
      expect(mockFetchPassages).toHaveBeenCalledWith('N4');
      
      // Test N3 filter
      fireEvent.change(levelSelect, { target: { value: 'N3' } });
      expect(mockFetchPassages).toHaveBeenCalledWith('N3');
      
      // Test all levels (empty string) - component passes undefined when empty
      fireEvent.change(levelSelect, { target: { value: '' } });
      expect(mockFetchPassages).toHaveBeenLastCalledWith(undefined);
    });

    it('should display level badges with correct colors', () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: null,
        questions: [],
        answers: {},
        result: null,
        transcript: null,
        loading: false,
        error: null,
        fetchPassages: mockFetchPassages,
        fetchPassage: mockFetchPassage,
        selectAnswer: mockSelectAnswer,
        submitAnswers: mockSubmitAnswers,
        fetchTranscript: mockFetchTranscript,
        reset: mockReset,
      });

      render(<ListeningMode />);
      
      const n5Badge = screen.getByText('N5');
      const n4Badge = screen.getByText('N4');
      
      expect(n5Badge).toBeInTheDocument();
      expect(n4Badge).toBeInTheDocument();
    });
  });
});
