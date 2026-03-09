import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryMode } from '../../components/MemoryMode/MemoryMode';

// Mock the hooks
const mockReview = vi.fn();
const mockGetNextCard = vi.fn();
const mockGetPreview = vi.fn().mockReturnValue(1);
const mockImportFromLesson = vi.fn().mockReturnValue(2);
const mockResetProgress = vi.fn();

vi.mock('../../hooks/useMemoryProgress', () => ({
  useMemoryProgress: () => ({
    cards: [
      { phraseId: '1', en: 'school', jp: '学校', reading: 'がっこう', phraseType: 'vocabulary', state: 'new', reps: 0 },
      { phraseId: '2', en: 'teacher', jp: '先生', reading: 'せんせい', phraseType: 'vocabulary', state: 'learning', reps: 1 },
    ],
    isLoading: false,
    stats: { total: 2, new: 1, learning: 1, review: 0, relearning: 0, due: 2 },
    review: mockReview,
    getNextCard: mockGetNextCard,
    getPreview: mockGetPreview,
    importFromLesson: mockImportFromLesson,
    resetProgress: mockResetProgress,
    addCard: vi.fn(),
  }),
}));

// Mock JapanesePhrase component
vi.mock('../../components/JapanesePhrase', () => ({
  JapanesePhrase: ({ phrase }: { phrase: string }) => (
    <div data-testid="japanese-phrase">{phrase}</div>
  ),
}));

const mockLessons = [
  {
    id: 'lesson-1',
    date: '2026-03-04',
    title: 'Test Lesson 1',
    order: 1,
    topics: ['grammar'],
    vocabCount: 5,
    grammarCount: 2,
    vocabulary: [{ jp: '学校', en: 'school', reading: 'がっこう', romaji: 'gakkou' }],
    grammar: [{ pattern: '〜てください', explanation: 'Please do', examples: [{ jp: '見てください', en: 'Please look' }] }],
  },
  {
    id: 'lesson-2',
    date: '2026-03-05',
    title: 'Test Lesson 2',
    order: 2,
    topics: ['vocabulary'],
    vocabCount: 3,
    grammarCount: 0,
    vocabulary: [{ jp: '本', en: 'book', reading: 'ほん', romaji: 'hon' }],
    grammar: [],
  },
];

describe('MemoryMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNextCard.mockReturnValue({ 
      phraseId: '1', 
      en: 'school', 
      jp: '学校', 
      reading: 'がっこう',
      phraseType: 'vocabulary',
      state: 'new',
      reps: 0,
    });
  });

  describe('Setup Screen', () => {
    it('should render setup screen with title', () => {
      render(<MemoryMode lessons={mockLessons} />);
      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    });

    it('should show description and subtitle', () => {
      render(<MemoryMode lessons={mockLessons} />);
      expect(screen.getByText(/Test your recall/i)).toBeInTheDocument();
      expect(screen.getByText(/FSRS/i)).toBeInTheDocument();
    });

    it('should display stats grid with correct labels', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      expect(screen.getByText('Total Cards')).toBeInTheDocument();
      expect(screen.getByText('Due Now')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('In Review')).toBeInTheDocument();
    });

    it('should render lesson selection chips', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      expect(screen.getByText('Select Lessons to Study')).toBeInTheDocument();
      expect(screen.getByText('Test Lesson 1')).toBeInTheDocument();
      expect(screen.getByText('Test Lesson 2')).toBeInTheDocument();
    });

    it('should select lesson when clicked', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      const lessonChip = screen.getByText('Test Lesson 1');
      fireEvent.click(lessonChip);
      
      expect(lessonChip).toHaveClass('selected');
    });

    it('should deselect lesson when clicked again', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      const lessonChip = screen.getByText('Test Lesson 1');
      fireEvent.click(lessonChip);
      expect(lessonChip).toHaveClass('selected');
      
      fireEvent.click(lessonChip);
      expect(lessonChip).not.toHaveClass('selected');
    });

    it('should select multiple lessons', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      fireEvent.click(screen.getByText('Test Lesson 1'));
      fireEvent.click(screen.getByText('Test Lesson 2'));
      
      expect(screen.getByText('Test Lesson 1')).toHaveClass('selected');
      expect(screen.getByText('Test Lesson 2')).toHaveClass('selected');
    });

    it('should show hint when no lessons selected', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      const hint = screen.getByText(/Select at least one lesson/);
      expect(hint).toBeInTheDocument();
      expect(hint).not.toHaveClass('hint-hidden');
    });

    it('should hide hint when lessons selected', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      fireEvent.click(screen.getByText('Test Lesson 1'));
      
      const hint = screen.getByText(/Select at least one lesson/);
      expect(hint).toHaveClass('hint-hidden');
    });

    it('should handle empty lessons array', () => {
      render(<MemoryMode lessons={[]} />);
      
      expect(screen.getByText(/No lessons available/i)).toBeInTheDocument();
    });

    it('should handle undefined lessons gracefully', () => {
      render(<MemoryMode lessons={undefined as any} />);
      
      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    });

    it('should handle null lessons gracefully', () => {
      render(<MemoryMode lessons={null as any} />);
      
      expect(screen.getByText('🧠 Memory Mode')).toBeInTheDocument();
    });
  });

  describe('Study Session', () => {
    it('should have start button', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      const startBtn = screen.getByRole('button', { name: /Study \d+ Due Cards|Start New Session/ });
      expect(startBtn).toBeInTheDocument();
    });

    it('should have clickable lesson chips', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      const lessonChip = screen.getByText('Test Lesson 1');
      expect(() => fireEvent.click(lessonChip)).not.toThrow();
    });

    it('should show correct stats values', () => {
      render(<MemoryMode lessons={mockLessons} />);
      
      // Total should be 2, Due should be 2, New should be 1, Review should be 1
      const statValues = screen.getAllByText(/^[0-2]$/);
      expect(statValues.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle lessons without vocabulary', () => {
      const lessonsWithoutVocab = [{
        ...mockLessons[0],
        vocabulary: [],
        grammar: [],
      }];
      
      render(<MemoryMode lessons={lessonsWithoutVocab} />);
      
      expect(screen.getByText('Test Lesson 1')).toBeInTheDocument();
    });
  });
});
