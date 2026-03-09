import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LessonMode } from '../../components/LessonMode/LessonMode';

// Mock translations
vi.mock('../../translations.js', () => ({
  translateLessonTitle: (title: string) => title,
}));

const mockLessons = [
  {
    id: 'lesson-2026-03-01',
    date: '2026-03-01',
    title: 'Lesson 1: Basic Greetings',
    order: 1,
    topics: ['vocabulary', 'grammar'],
    vocabCount: 5,
    grammarCount: 2,
  },
];

const mockLessonDetail = {
  id: 'lesson-2026-03-01',
  date: '2026-03-01',
  title: 'Lesson 1: Basic Greetings',
  topics: ['vocabulary', 'grammar'],
  vocabulary: [
    { jp: 'こんにちは', reading: 'こんにちは', romaji: 'konnichiwa', en: 'Hello', type: 'expression' },
  ],
  grammar: [
    {
      pattern: '〜です',
      explanation: 'Polite copula',
      examples: [{ jp: '私は学生です', en: 'I am a student' }],
    },
  ],
  practice_phrases: [
    { jp: 'おはようございます', en: 'Good morning' },
  ],
};

const mockOnBack = vi.fn();
const mockOnStartLessonChat = vi.fn();
const mockOnSelectLesson = vi.fn();

describe('LessonMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/lessons/') && url.includes('?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLessonDetail),
        } as Response);
      } else if (url.includes('/api/lessons')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLessons),
        } as Response);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('should render loading state initially', () => {
    render(
      <LessonMode
        password="test-password"
        onBack={mockOnBack}
        onStartLessonChat={mockOnStartLessonChat}
        onSelectLesson={mockOnSelectLesson}
      />
    );
    
    expect(screen.getByText(/Loading lessons/i)).toBeInTheDocument();
  });



  it('should load lesson detail when selectedLessonId provided', async () => {
    render(
      <LessonMode
        password="test-password"
        onBack={mockOnBack}
        onStartLessonChat={mockOnStartLessonChat}
        selectedLessonId="lesson-2026-03-01"
        onSelectLesson={mockOnSelectLesson}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Lesson 1: Basic Greetings')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle fetch error gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <LessonMode
        password="test-password"
        onBack={mockOnBack}
        onStartLessonChat={mockOnStartLessonChat}
        onSelectLesson={mockOnSelectLesson}
      />
    );
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    consoleSpy.mockRestore();
  });
});
