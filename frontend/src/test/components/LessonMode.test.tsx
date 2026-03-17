import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonMode } from '../../components/LessonMode/LessonMode';

// Mock fetch
global.fetch = vi.fn();

const mockLessons = [
  {
    id: '2026-03-01',
    date: '2026-03-01',
    title: 'Test Lesson 1',
    order: 1,
    topics: ['topic1', 'topic2'],
    vocabCount: 10,
    grammarCount: 5,
  },
];

const mockLessonDetail = {
  id: '2026-03-01',
  date: '2026-03-01',
  title: 'Test Lesson 1',
  topics: ['topic1', 'topic2'],
  vocabulary: [
    { jp: 'テスト', reading: 'てすと', romaji: 'tesuto', en: 'test', type: 'noun' },
  ],
  grammar: [
    { pattern: 'テスト文法', explanation: 'test grammar', examples: [{ jp: '例文', en: 'example' }] },
  ],
  practice_phrases: [
    { jp: '練習フレーズ', en: 'practice phrase' },
  ],
};

describe('LessonMode', () => {
  const mockOnBack = vi.fn();
  const mockOnStartLessonChat = vi.fn();
  const mockOnSelectLesson = vi.fn();

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/lessons/') && !url.includes('/transcription')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLessonDetail),
        });
      } else if (url.includes('/api/lessons')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLessons),
        });
      } else if (url.includes('/api/vocabulary-with-sources')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      } else if (url.includes('/api/vocabulary-reviews')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('should render loading state initially', () => {
    renderWithRouter(
      <LessonMode
        password="test"
        onBack={mockOnBack}
        onStartLessonChat={mockOnStartLessonChat}
        onSelectLesson={mockOnSelectLesson}
      />
    );
    
    expect(screen.getByText(/Loading lessons/i)).toBeInTheDocument();
  });

  it('should load and display lessons list', async () => {
    renderWithRouter(
      <LessonMode
        password="test"
        onBack={mockOnBack}
        onStartLessonChat={mockOnStartLessonChat}
        onSelectLesson={mockOnSelectLesson}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Your Lessons/i)).toBeInTheDocument();
    });
  });

  it('should call onBack when back button clicked', async () => {
    renderWithRouter(
      <LessonMode
        password="test"
        onBack={mockOnBack}
        onStartLessonChat={mockOnStartLessonChat}
        onSelectLesson={mockOnSelectLesson}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Your Lessons/i)).toBeInTheDocument();
    });
    
    const backButton = screen.getByText(/Back/i);
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });
});
