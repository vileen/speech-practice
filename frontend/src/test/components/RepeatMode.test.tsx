import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { RepeatMode } from '../../components/RepeatMode/RepeatMode';

// Mock the hooks
vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: vi.fn(() => ({
    furigana: null,
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  })),
}));

vi.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: vi.fn(() => ({
    play: vi.fn(),
    isPlaying: false,
  })),
}));

vi.mock('../../hooks/usePronunciationCheck', () => ({
  usePronunciationCheck: vi.fn(() => ({
    result: null,
    isChecking: false,
    check: vi.fn(),
    clear: vi.fn(),
  })),
}));

// Mock VoiceRecorder component
vi.mock('../../components/VoiceRecorder/VoiceRecorder', () => ({
  VoiceRecorder: vi.fn(({ mode, disabled, isListening, onStartListening, onStopListening, onRecordingComplete }) => (
    <div data-testid="voice-recorder" data-mode={mode} data-disabled={disabled} data-listening={isListening}>
      <button onClick={onStartListening}>Mock Start</button>
      <button onClick={onStopListening}>Mock Stop</button>
      <button onClick={() => onRecordingComplete(new Blob(['test']))}>Mock Complete</button>
    </div>
  )),
}));

// Mock JapanesePhrase component
vi.mock('../../components/JapanesePhrase/JapanesePhrase', () => ({
  JapanesePhrase: vi.fn(({ text, translation, showFurigana, showTranslation }) => (
    <div data-testid="japanese-phrase">
      <span data-testid="phrase-text">{text}</span>
      {showTranslation && <span data-testid="phrase-translation">{translation}</span>}
    </div>
  )),
}));

// Mock Header component
vi.mock('../../components/Header/Header', () => ({
  Header: vi.fn(({ title, icon }) => (
    <header data-testid="header">{icon} {title}</header>
  )),
}));

import { useFurigana } from '../../hooks/useFurigana';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { usePronunciationCheck } from '../../hooks/usePronunciationCheck';

describe('RepeatMode', () => {
  const mockPlay = vi.fn();
  const mockCheck = vi.fn();
  const mockClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Setup default mock returns - not loading by default
    vi.mocked(useAudioPlayer).mockReturnValue({
      play: mockPlay,
      isPlaying: false,
    });

    vi.mocked(usePronunciationCheck).mockReturnValue({
      result: null,
      isChecking: false,
      check: mockCheck,
      clear: mockClear,
    });

    vi.mocked(useFurigana).mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    // Mock fetch for audio API - return success immediately
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['audio'])),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to wait for loading to complete
  const waitForLoading = async () => {
    await waitFor(() => {
      const loadingText = screen.queryByText('Loading...');
      return !loadingText;
    }, { timeout: 3000 });
  };

  describe('Initial Render', () => {
    it('should render the header with correct title', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      expect(screen.getByTestId('header')).toHaveTextContent('🎯 Repeat After Me');
    });

    it('should render the first phrase', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    });

    it('should render the voice recorder', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    });

    it('should render listen button after loading', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Look for button with "Listen" text (partial match since emoji separates it)
      expect(screen.getByText(/Listen/i)).toBeInTheDocument();
    });

    it('should render next phrase button', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      expect(screen.getByText('Next Phrase →')).toBeInTheDocument();
    });
  });

  describe('Phrase Navigation', () => {
    it('should navigate to next phrase when clicking next button', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Initial phrase
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
      
      // Click next
      fireEvent.click(screen.getByText('Next Phrase →'));
      
      // Should show second phrase
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('こんにちは');
    });

    it('should cycle back to first phrase after last phrase', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Navigate through all phrases (16 total)
      for (let i = 0; i < 16; i++) {
        await act(async () => {
          fireEvent.click(screen.getByText('Next Phrase →'));
        });
      }
      
      // Should be back to first phrase
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    });

    it('should clear pronunciation check when navigating', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      fireEvent.click(screen.getByText('Next Phrase →'));
      
      expect(mockClear).toHaveBeenCalled();
    });

    it('should reset audio URL when navigating to next phrase', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      
      // Wait for initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      // Clear mock to check next call
      vi.mocked(global.fetch).mockClear();
      
      // Navigate to next phrase
      await act(async () => {
        fireEvent.click(screen.getByText('Next Phrase →'));
      });
      
      // Should fetch new audio
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/repeat-after-me'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate to next phrase on spacebar', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
      
      fireEvent.keyDown(window, { code: 'Space' });
      
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('こんにちは');
    });

    it('should not navigate on spacebar when checking pronunciation', async () => {
      vi.mocked(usePronunciationCheck).mockReturnValue({
        result: null,
        isChecking: true,
        check: mockCheck,
        clear: mockClear,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      const initialPhrase = screen.getByTestId('phrase-text').textContent;
      
      fireEvent.keyDown(window, { code: 'Space' });
      
      expect(screen.getByTestId('phrase-text')).toHaveTextContent(initialPhrase || '');
    });

    it('should not navigate on spacebar when input is focused', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Create and focus an input
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      
      const initialPhrase = screen.getByTestId('phrase-text').textContent;
      
      fireEvent.keyDown(window, { code: 'Space' });
      
      expect(screen.getByTestId('phrase-text')).toHaveTextContent(initialPhrase || '');
      
      document.body.removeChild(input);
    });

    it('should not navigate on repeated spacebar events', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      fireEvent.keyDown(window, { code: 'Space', repeat: true });
      
      // Should still be on first phrase
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    });
  });

  describe('Audio Playback', () => {
    it('should fetch and play audio when clicking listen button', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      const listenBtn = screen.getByText(/Listen/i);
      fireEvent.click(listenBtn);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/repeat-after-me'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('おはようございます'),
          })
        );
      });
      
      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    it('should show loading state while fetching audio', async () => {
      // Create a delayed fetch that never resolves to keep loading state
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      
      vi.mocked(global.fetch).mockReturnValue(fetchPromise);

      await act(async () => {
        render(<RepeatMode />);
      });
      
      // Component should show loading state during initial fetch
      // Find button that contains "Loading..." text
      const playButton = screen.getByRole('button', { name: /Loading/i });
      expect(playButton).toBeInTheDocument();
      expect(playButton).toBeDisabled();
      
      // Resolve the fetch to clean up
      resolveFetch!({ ok: true, blob: () => Promise.resolve(new Blob(['audio'])) } as Response);
    });

    it('should handle audio fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Trigger a refetch by clicking listen
      fireEvent.click(screen.getByText(/Listen/i));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching audio:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Translation Toggle', () => {
    it('should toggle translation visibility', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Initially hidden
      expect(screen.queryByTestId('phrase-translation')).not.toBeInTheDocument();
      
      // Show translation
      fireEvent.click(screen.getByText('🇬🇧 Show Translation'));
      expect(screen.getByTestId('phrase-translation')).toBeInTheDocument();
      expect(screen.getByTestId('phrase-translation')).toHaveTextContent('Good morning');
      
      // Hide translation
      fireEvent.click(screen.getByText('🙈 Hide Translation'));
      expect(screen.queryByTestId('phrase-translation')).not.toBeInTheDocument();
    });
  });

  describe('Furigana Toggle', () => {
    it('should have hide furigana button visible for Japanese', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      expect(screen.getByText('🙈 Hide Furigana')).toBeInTheDocument();
    });

    it('should toggle furigana visibility', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Initially showing
      expect(screen.getByText('🙈 Hide Furigana')).toBeInTheDocument();
      
      // Hide furigana
      fireEvent.click(screen.getByText('🙈 Hide Furigana'));
      expect(screen.getByText('👀 Show Furigana')).toBeInTheDocument();
      
      // Show furigana
      fireEvent.click(screen.getByText('👀 Show Furigana'));
      expect(screen.getByText('🙈 Hide Furigana')).toBeInTheDocument();
    });
  });

  describe('Recording Mode', () => {
    it('should default to push-to-talk mode', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      const recorder = screen.getByTestId('voice-recorder');
      expect(recorder).toHaveAttribute('data-mode', 'push-to-talk');
    });

    it('should switch to voice-activated mode', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      fireEvent.click(screen.getByText('🎤 Voice Activated'));
      
      const recorder = screen.getByTestId('voice-recorder');
      expect(recorder).toHaveAttribute('data-mode', 'voice-activated');
    });

    it('should switch back to push-to-talk mode', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      fireEvent.click(screen.getByText('🎤 Voice Activated'));
      fireEvent.click(screen.getByText('🎙️ Push to Talk'));
      
      const recorder = screen.getByTestId('voice-recorder');
      expect(recorder).toHaveAttribute('data-mode', 'push-to-talk');
    });
  });

  describe('Volume Control', () => {
    it('should render volume slider', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      expect(screen.getByText('🔊 Volume:')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should display current volume percentage', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('should save volume to localStorage when changed', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '0.5' } });
      
      expect(localStorage.setItem).toHaveBeenCalledWith('speechPracticeVolume', '0.5');
    });

    it('should load volume from localStorage on mount', async () => {
      // Set up localStorage before rendering
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn((key: string) => {
            if (key === 'speechPracticeVolume') return '0.3';
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Check that the volume percentage shows 30%
      expect(screen.getByText('30%')).toBeInTheDocument();
    });
  });

  describe('Pronunciation Check', () => {
    it('should show checking state', async () => {
      vi.mocked(usePronunciationCheck).mockReturnValue({
        result: null,
        isChecking: true,
        check: mockCheck,
        clear: mockClear,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      
      expect(screen.getByText('Checking pronunciation...')).toBeInTheDocument();
    });

    it('should display pronunciation result', async () => {
      vi.mocked(usePronunciationCheck).mockReturnValue({
        result: {
          score: 85,
          feedback: 'Good job!',
          target_text: 'おはようございます',
          transcription: 'おはようございます',
          errors: [],
        },
        isChecking: false,
        check: mockCheck,
        clear: mockClear,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Good job!')).toBeInTheDocument();
    });

    it('should display errors when pronunciation has issues', async () => {
      vi.mocked(usePronunciationCheck).mockReturnValue({
        result: {
          score: 45,
          feedback: 'Keep practicing!',
          target_text: 'おはようございます',
          transcription: 'おはよう',
          errors: ['Missing polite suffix', 'Pitch accent incorrect'],
        },
        isChecking: false,
        check: mockCheck,
        clear: mockClear,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('Missing polite suffix')).toBeInTheDocument();
      expect(screen.getByText('Pitch accent incorrect')).toBeInTheDocument();
    });

    it('should show (nothing) when transcription is empty', async () => {
      vi.mocked(usePronunciationCheck).mockReturnValue({
        result: {
          score: 0,
          feedback: 'No speech detected',
          target_text: 'おはようございます',
          transcription: '',
          errors: ['Please speak louder'],
        },
        isChecking: false,
        check: mockCheck,
        clear: mockClear,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      
      expect(screen.getByText('(nothing)')).toBeInTheDocument();
    });
  });

  describe('Disabled States', () => {
    it('should disable controls when checking pronunciation', async () => {
      vi.mocked(usePronunciationCheck).mockReturnValue({
        result: null,
        isChecking: true,
        check: mockCheck,
        clear: mockClear,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      
      // Volume slider should be disabled
      expect(screen.getByRole('slider')).toBeDisabled();
    });

    it('should disable voice recorder when checking', async () => {
      vi.mocked(usePronunciationCheck).mockReturnValue({
        result: null,
        isChecking: true,
        check: mockCheck,
        clear: mockClear,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      
      const recorder = screen.getByTestId('voice-recorder');
      expect(recorder).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Settings', () => {
    it('should load settings from localStorage on mount', async () => {
      // Set up localStorage with settings
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn((key: string) => {
            if (key === 'repeatModeSettings') return JSON.stringify({ gender: 'male', voiceStyle: 'anime' });
            if (key === 'speechPracticeVolume') return '0.8';
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      // Settings loaded without error
      expect(screen.getByTestId('japanese-phrase')).toBeInTheDocument();
    });

    it('should handle invalid settings JSON gracefully', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn((key: string) => {
            if (key === 'repeatModeSettings') return 'invalid json';
            if (key === 'speechPracticeVolume') return '0.8';
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      await act(async () => {
        render(<RepeatMode />);
      });
      
      // Should not throw - component handles invalid JSON
      expect(screen.getByTestId('japanese-phrase')).toBeInTheDocument();
    });
  });

  describe('VoiceRecorder Key Prop', () => {
    it('should reset voice recorder when changing phrases', async () => {
      await act(async () => {
        render(<RepeatMode />);
      });
      await waitForLoading();
      
      const initialRecorder = screen.getByTestId('voice-recorder');
      
      fireEvent.click(screen.getByText('Next Phrase →'));
      
      // Voice recorder should be re-mounted (different key)
      const newRecorder = screen.getByTestId('voice-recorder');
      expect(newRecorder).toBeInTheDocument();
    });
  });
});
