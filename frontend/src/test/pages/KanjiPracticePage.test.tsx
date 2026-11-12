import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanjiPracticePage } from '../../pages/KanjiPracticePage';

// Mock child components to keep test focused on page-level state switching
vi.mock('../../components/KanjiPracticeMode', () => ({
  KanjiPracticeMode: ({ onEndSession }: { onEndSession: () => void }) => (
    <div data-testid="kanji-practice-mode">
      <button data-testid="end-session-button" onClick={onEndSession}>
        End Session
      </button>
    </div>
  ),
}));

vi.mock('../../components/KanjiList', () => ({
  KanjiList: ({ onStartPractice }: { onStartPractice: () => void }) => (
    <div data-testid="kanji-list">
      <button data-testid="start-practice-button" onClick={onStartPractice}>
        Start Practice
      </button>
    </div>
  ),
}));

describe('KanjiPracticePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('should render the kanji list, not the practice mode', () => {
      render(<KanjiPracticePage />);
      expect(screen.getByTestId('kanji-list')).toBeInTheDocument();
      expect(screen.queryByTestId('kanji-practice-mode')).not.toBeInTheDocument();
    });
  });

  describe('starting a practice session', () => {
    it('should switch to practice mode when start is triggered', () => {
      render(<KanjiPracticePage />);
      fireEvent.click(screen.getByTestId('start-practice-button'));
      expect(screen.getByTestId('kanji-practice-mode')).toBeInTheDocument();
      expect(screen.queryByTestId('kanji-list')).not.toBeInTheDocument();
    });
  });

  describe('ending a practice session', () => {
    it('should return to the kanji list when the session ends', () => {
      render(<KanjiPracticePage />);
      fireEvent.click(screen.getByTestId('start-practice-button'));
      fireEvent.click(screen.getByTestId('end-session-button'));
      expect(screen.getByTestId('kanji-list')).toBeInTheDocument();
      expect(screen.queryByTestId('kanji-practice-mode')).not.toBeInTheDocument();
    });

    it('should allow starting a new session after ending one', () => {
      render(<KanjiPracticePage />);
      fireEvent.click(screen.getByTestId('start-practice-button'));
      fireEvent.click(screen.getByTestId('end-session-button'));
      fireEvent.click(screen.getByTestId('start-practice-button'));
      expect(screen.getByTestId('kanji-practice-mode')).toBeInTheDocument();
      expect(screen.queryByTestId('kanji-list')).not.toBeInTheDocument();
    });
  });
});
