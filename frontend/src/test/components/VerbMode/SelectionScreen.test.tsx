import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectionScreen } from '../../../components/VerbMode/SelectionScreen';
import type { PracticeType, AnswerMode } from '../../../components/VerbMode/types';

// Mock react-router-dom's useNavigate for Header
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockNavigate = vi.fn();
const mockSetSelectedPracticeType = vi.fn();
const mockSetAnswerMode = vi.fn();
const mockToggleGroup = vi.fn();
const mockSelectAllGroups = vi.fn();
const mockDeselectAllGroups = vi.fn();
const mockSetShowFurigana = vi.fn();
const mockLoadNextExercise = vi.fn();

const defaultProps = {
  navigate: mockNavigate,
  selectedPracticeType: 'recognition' as PracticeType,
  setSelectedPracticeType: mockSetSelectedPracticeType,
  answerMode: 'multiple-choice' as AnswerMode,
  setAnswerMode: mockSetAnswerMode,
  selectedGroups: ['I', 'II', 'III'] as string[],
  toggleGroup: mockToggleGroup,
  selectAllGroups: mockSelectAllGroups,
  deselectAllGroups: mockDeselectAllGroups,
  showFurigana: false,
  setShowFurigana: mockSetShowFurigana,
  streak: 0,
  score: { correct: 0, total: 0 },
  loadNextExercise: mockLoadNextExercise,
};

describe('SelectionScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and all practice type options', () => {
    render(<SelectionScreen {...defaultProps} />);
    expect(screen.getByText('Verb Conjugation Practice')).toBeInTheDocument();
    expect(screen.getByText(/Recognition/)).toBeInTheDocument();
    expect(screen.getByText(/Construction/)).toBeInTheDocument();
    expect(screen.getByText(/Transformation/)).toBeInTheDocument();
  });

  it('marks the selected practice type as active', () => {
    render(<SelectionScreen {...defaultProps} selectedPracticeType="construction" />);
    const constructionBtn = screen.getByText(/Construction/).closest('button');
    const recognitionBtn = screen.getByText(/Recognition/).closest('button');
    expect(constructionBtn?.className).toContain('active');
    expect(recognitionBtn?.className).not.toContain('active');
  });

  it('calls setSelectedPracticeType when a practice type is clicked', () => {
    render(<SelectionScreen {...defaultProps} />);
    fireEvent.click(screen.getByText(/Transformation/));
    expect(mockSetSelectedPracticeType).toHaveBeenCalledWith('transformation');
  });

  it('calls setAnswerMode when an answer mode button is clicked', () => {
    render(<SelectionScreen {...defaultProps} />);
    fireEvent.click(screen.getByText('Type Answer'));
    expect(mockSetAnswerMode).toHaveBeenCalledWith('input');
  });

  it('renders group checkboxes reflecting selectedGroups', () => {
    render(<SelectionScreen {...defaultProps} selectedGroups={['I']} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('calls toggleGroup when a group checkbox is changed', () => {
    render(<SelectionScreen {...defaultProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(mockToggleGroup).toHaveBeenCalledWith('II');
  });

  it('calls selectAllGroups and deselectAllGroups from filter actions', () => {
    render(<SelectionScreen {...defaultProps} />);
    fireEvent.click(screen.getByText('All'));
    expect(mockSelectAllGroups).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('None'));
    expect(mockDeselectAllGroups).toHaveBeenCalledTimes(1);
  });

  it('disables start button when no groups are selected', () => {
    render(<SelectionScreen {...defaultProps} selectedGroups={[]} />);
    expect(screen.getByText('Start Practice →')).toBeDisabled();
  });

  it('enables start button and calls loadNextExercise when clicked', () => {
    render(<SelectionScreen {...defaultProps} />);
    const startBtn = screen.getByText('Start Practice →');
    expect(startBtn).not.toBeDisabled();
    fireEvent.click(startBtn);
    expect(mockLoadNextExercise).toHaveBeenCalledTimes(1);
  });

  it('shows score and accuracy when total > 0', () => {
    render(<SelectionScreen {...defaultProps} score={{ correct: 7, total: 10 }} />);
    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('hides stats section when total is 0', () => {
    render(<SelectionScreen {...defaultProps} />);
    expect(screen.queryByText(/Accuracy/)).not.toBeInTheDocument();
  });

  it('shows streak only when streak > 0', () => {
    const { rerender } = render(<SelectionScreen {...defaultProps} score={{ correct: 1, total: 2 }} />);
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    rerender(<SelectionScreen {...defaultProps} score={{ correct: 1, total: 2 }} streak={5} />);
    expect(screen.getByText('🔥 5')).toBeInTheDocument();
  });

  it('calls navigate back when back button is clicked', () => {
    render(<SelectionScreen {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('toggles furigana display when furigana button is clicked', () => {
    render(<SelectionScreen {...defaultProps} showFurigana={false} />);
    fireEvent.click(screen.getByTitle('Show furigana'));
    expect(mockSetShowFurigana).toHaveBeenCalledWith(true);
  });
});
