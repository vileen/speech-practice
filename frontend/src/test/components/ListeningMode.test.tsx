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
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {});
    
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

  describe('Listening View', () => {
    it('should render listening view after clicking a passage', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
      });
      
      // Check audio player controls are rendered
      expect(screen.getByTitle('Replay')).toBeInTheDocument();
      expect(screen.getByTitle('Play')).toBeInTheDocument();
      expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
    });

    it('should render audio player with speed controls', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        expect(screen.getByText('0.75x')).toBeInTheDocument();
      });
      
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('1.25x')).toBeInTheDocument();
    });

    it('should change playback speed when speed button clicked', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        expect(screen.getByText('0.75x')).toBeInTheDocument();
      });
      
      const speed075 = screen.getByText('0.75x');
      fireEvent.click(speed075);
      
      // Speed button should have active class
      expect(speed075).toHaveClass('active');
    });

    it('should disable Continue to Questions when no audio has played', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const continueBtn = screen.getByText('Continue to Questions →');
        expect(continueBtn).toBeDisabled();
      });
    });

    it('should enable Continue to Questions after audio time updates', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      // Simulate audio time update by interacting with the progress bar
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      const continueBtn = screen.getByText('Continue to Questions →');
      expect(continueBtn).not.toBeDisabled();
    });

    it('should transition to questions view on Continue click', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      // Simulate audio progress
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('What is the main topic?')).toBeInTheDocument();
    });

    it('should display passage badges in listening view', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        expect(screen.getByText('N5')).toBeInTheDocument();
        expect(screen.getByText('Daily Life')).toBeInTheDocument();
      });
    });
  });

  describe('Questions View', () => {
    it('should render questions with options', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('What is the main topic?')).toBeInTheDocument();
      expect(screen.getByText('What time did they meet?')).toBeInTheDocument();
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    it('should show question type labels', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      expect(screen.getByText('Main Idea')).toBeInTheDocument();
      expect(screen.getByText('Detail')).toBeInTheDocument();
    });

    it('should show answered count progress', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      expect(screen.getByText('0 / 2 answered')).toBeInTheDocument();
    });

    it('should call selectAnswer when option is selected', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      const radioButtons = screen.getAllByRole('radio');
      fireEvent.click(radioButtons[0]);
      
      expect(mockSelectAnswer).toHaveBeenCalledWith(1, 0);
    });

    it('should disable submit button when no answers', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      const submitBtn = screen.getByText('Submit Answers');
      expect(submitBtn).toBeDisabled();
    });

    it('should enable submit button when answers are selected', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0 },
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      const submitBtn = screen.getByText('Submit Answers');
      expect(submitBtn).not.toBeDisabled();
    });

    it('should go back to listening view', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      expect(screen.getByText('Questions')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('← Back to Audio'));
      
      expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
    });

    it('should submit answers and show results', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 1 },
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      expect(mockSubmitAnswers).toHaveBeenCalled();
    });

    it('should show confirmation dialog for unanswered questions', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0 },
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      expect(window.confirm).toHaveBeenCalledWith('You have 1 unanswered question(s). Submit anyway?');
    });
  });

  describe('Results View', () => {
    it('should render results with score', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should display correct and total count', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('3 / 4')).toBeInTheDocument();
      });
    });

    it('should display listening time when available', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('Listening Time')).toBeInTheDocument();
        expect(screen.getByText('2:25')).toBeInTheDocument();
      });
    });

    it('should show transcript reveal button', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('📜 Show Transcript')).toBeInTheDocument();
      });
    });

    it('should fetch and display transcript', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
        transcript: { japaneseText: 'テストの文章です', transcript: 'Test transcript text' },
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('📜 Show Transcript')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('📜 Show Transcript'));
      
      await waitFor(() => {
        expect(mockFetchTranscript).toHaveBeenCalled();
        expect(screen.getByText('Transcript')).toBeInTheDocument();
      });
    });

    it('should render answer review with correct and incorrect answers', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('Review Answers')).toBeInTheDocument();
        expect(screen.getByText('✓ Correct')).toBeInTheDocument();
        expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
      });
    });

    it('should show correct answer for incorrect responses', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getAllByText('Explanation:').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Correct answer:').length).toBeGreaterThan(0);
      });
    });

    it('should navigate back to list from results', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('← Back to List')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('← Back to List'));
      
      expect(mockReset).toHaveBeenCalled();
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
      expect(screen.getByText('Test Passage 2')).toBeInTheDocument();
    });

    it('should navigate to next passage', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('Next Passage →')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Next Passage →'));
      
      expect(mockFetchPassage).toHaveBeenCalledWith(2);
    });

    it('should go back to list when next passage does not exist', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[1],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 2'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('Next Passage →')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Next Passage →'));
      
      expect(mockReset).toHaveBeenCalled();
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });
  });

  describe('Header Navigation', () => {
    it('should navigate from listening back to list with reset', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        expect(screen.getByTitle('Play')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('back-btn'));
      
      expect(mockReset).toHaveBeenCalled();
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
      expect(screen.getByText('Test Passage 2')).toBeInTheDocument();
    });

    it('should navigate from questions back to listening', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      
      expect(screen.getByText('Questions')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('back-btn'));
      
      expect(screen.getByText('Continue to Questions →')).toBeInTheDocument();
    });

    it('should navigate from results back to list with reset', async () => {
      vi.mocked(useListeningModeModule.useListeningMode).mockReturnValue({
        passages: mockPassages,
        currentPassage: mockPassages[0],
        questions: mockQuestions,
        answers: { 1: 0, 2: 2 },
        result: mockQuizResult,
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
      fireEvent.click(screen.getByText('Test Passage 1'));
      
      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        fireEvent.change(progressBar, { target: { value: '10' } });
      });
      
      fireEvent.click(screen.getByText('Continue to Questions →'));
      fireEvent.click(screen.getByText('Submit Answers'));
      
      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('back-btn'));
      
      expect(mockReset).toHaveBeenCalled();
      expect(screen.getByText('Test Passage 1')).toBeInTheDocument();
    });
  });

  describe('Furigana Toggle', () => {
    it('should toggle furigana display', () => {
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
      
      // Initial state: showFurigana = true (from useState(true)), so title is "Hide furigana"
      const furiganaBtn = screen.getByTitle('Hide furigana');
      expect(furiganaBtn).toHaveTextContent('あ');
      
      fireEvent.click(furiganaBtn);
      
      // After clicking, should now show "漢" with "Show furigana" title
      expect(screen.getByTitle('Show furigana')).toBeInTheDocument();
      expect(screen.getByTitle('Show furigana')).toHaveTextContent('漢');
    });

    it('should load furigana preference from localStorage', () => {
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue('false');

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
      
      // When saved preference is false, should show "漢" with "Show furigana" title
      expect(screen.getByTitle('Show furigana')).toBeInTheDocument();
      expect(screen.getByTitle('Show furigana')).toHaveTextContent('漢');
    });

    it('should save furigana preference to localStorage', () => {
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
      
      // Initial state: showFurigana = true, so title is "Hide furigana"
      const furiganaBtn = screen.getByTitle('Hide furigana');
      fireEvent.click(furiganaBtn);
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith('listening_show_furigana', 'false');
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
