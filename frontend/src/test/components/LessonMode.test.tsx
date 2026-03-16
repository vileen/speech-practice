import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LessonMode } from '../../components/LessonMode/LessonMode';

// Mock AudioPlayer to avoid audio-related issues in tests
vi.mock('../../components/AudioPlayer/index.js', () => ({
  AudioPlayer: () => <div data-testid="audio-player">Audio Player</div>,
}));

// Mock VoiceRecorder
vi.mock('../../components/VoiceRecorder/index.js', () => ({
  VoiceRecorder: () => <div data-testid="voice-recorder">Voice Recorder</div>,
}));

// Mock HighlightedText
vi.mock('../../components/HighlightedText/index.js', () => ({
  HighlightedText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const mockLessonDetail = {
  id: 'lesson-2026-03-01',
  title: 'Lesson 1: Basic Greetings',
  date: '2026-03-01',
  phrases: [
    {
      id: 'phrase-1',
      japanese: 'こんにちは',
      romaji: 'konnichiwa',
      translation: 'Hello',
      audioUrl: '/audio/1.mp3',
      isUserMessage: false,
    },
  ],
  audioFile: {
    filename: 'lesson.mp3',
    duration: 60,
    url: '/audio/lesson.mp3',
  },
};

const renderWithRouter = (lessonId: string = 'lesson-2026-03-01') => {
  return render(
    <MemoryRouter initialEntries={[`/lessons/${lessonId}`]}>
      <Routes>
        <Route path="/lessons/:lessonId" element={<LessonMode />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('LessonMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/lessons/') && url.includes('/transcription')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: 'Test transcription' }),
        } as Response);
      } else if (url.includes('/api/lessons/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLessonDetail),
        } as Response);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('should render loading state initially', () => {
    renderWithRouter();
    
    expect(screen.getByText(/Loading lesson/i)).toBeInTheDocument();
  });

  it('should load and display lesson detail', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Lesson 1: Basic Greetings')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check that phrases are rendered (use function matcher for partial text)
    expect(screen.getByText((content) => content.includes('こんにちは'))).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle fetch error gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    consoleSpy.mockRestore();
  });
});
