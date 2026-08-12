import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RepeatMode } from '../../../components/RepeatMode/RepeatMode';
import * as useFuriganaModule from '../../../hooks/useFurigana';
import * as useAudioPlayerModule from '../../../hooks/useAudioPlayer';
import * as usePronunciationCheckModule from '../../../hooks/usePronunciationCheck';

// Mock child components and hooks
vi.mock('../../../components/Header', () => ({
  Header: ({ title, icon }: any) => (
    <header data-testid="header">
      <span>{icon}</span>
      <h1>{title}</h1>
    </header>
  ),
}));

vi.mock('../../../components/JapanesePhrase', () => ({
  JapanesePhrase: ({ text, translation, showFurigana, showTranslation }: any) => (
    <div data-testid="japanese-phrase">
      <span data-testid="phrase-text">{text}</span>
      {translation && showTranslation && (
        <span data-testid="phrase-translation">🇬🇧 {translation}</span>
      )}
      <span data-testid="phrase-furigana-state">
        {showFurigana ? 'furigana-on' : 'furigana-off'}
      </span>
    </div>
  ),
}));

vi.mock('../../../components/VoiceRecorder', () => ({
  VoiceRecorder: ({ onRecordingComplete, mode, disabled }: any) => (
    <button
      data-testid="voice-recorder"
      data-mode={mode}
      data-disabled={disabled}
      onClick={() => onRecordingComplete?.(new Blob(['test']))}
    >
      Voice Recorder
    </button>
  ),
}));

vi.mock('../../../hooks/useFurigana');
vi.mock('../../../hooks/useAudioPlayer');
vi.mock('../../../hooks/usePronunciationCheck');

describe('RepeatMode', () => {
  const mockPlay = vi.fn();
  const mockCheck = vi.fn();
  const mockClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    // Default localStorage mocks
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {});

    // Mock URL.createObjectURL for audio blob handling
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob://mock-audio-url') });

    // Mock fetch for audio endpoint
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['mock-audio'])),
      })
    );

    vi.mocked(useFuriganaModule.useFurigana).mockReturnValue({
      furigana: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    vi.mocked(useAudioPlayerModule.useAudioPlayer).mockReturnValue({
      play: mockPlay,
      pause: vi.fn(),
      stop: vi.fn(),
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });

    vi.mocked(usePronunciationCheckModule.usePronunciationCheck).mockReturnValue({
      result: null,
      isChecking: false,
      error: null,
      check: mockCheck,
      clear: mockClear,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should render header with title and icon', () => {
    render(<RepeatMode />);
    expect(screen.getByTestId('header')).toHaveTextContent('Repeat After Me');
    expect(screen.getByTestId('header')).toHaveTextContent('🎯');
  });

  it('should display the first phrase on mount', async () => {
    render(<RepeatMode />);
    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    });
  });

  it('should auto-fetch audio for the first phrase', async () => {
    render(<RepeatMode />);

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

    expect(mockPlay).toHaveBeenCalledWith('blob://mock-audio-url');
  });

  it('should toggle translation visibility', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('phrase-translation')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('🇬🇧 Show Translation'));
    expect(screen.getByTestId('phrase-translation')).toHaveTextContent('Good morning');

    fireEvent.click(screen.getByText('🙈 Hide Translation'));
    expect(screen.queryByTestId('phrase-translation')).not.toBeInTheDocument();
  });

  it('should toggle furigana visibility', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('phrase-furigana-state')).toHaveTextContent('furigana-on');
    });

    fireEvent.click(screen.getByText('🙈 Hide Furigana'));
    expect(screen.getByTestId('phrase-furigana-state')).toHaveTextContent('furigana-off');

    fireEvent.click(screen.getByText('👀 Show Furigana'));
    expect(screen.getByTestId('phrase-furigana-state')).toHaveTextContent('furigana-on');
  });

  it('should advance to the next phrase when Next is clicked', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    });

    fireEvent.click(screen.getByText(/Next Phrase/));

    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('こんにちは');
    });

    expect(mockClear).toHaveBeenCalled();
  });

  it('should advance to the next phrase on spacebar press', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    });

    fireEvent.keyDown(window, { code: 'Space' });

    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('こんにちは');
    });
  });

  it('should not advance on spacebar when an input is focused', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    });

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(window, { code: 'Space' });

    expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    document.body.removeChild(input);
  });

  it('should render the VoiceRecorder with correct mode and disabled state', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    });

    const recorder = screen.getByTestId('voice-recorder');
    expect(recorder).toHaveAttribute('data-mode', 'push-to-talk');
    expect(recorder).toHaveAttribute('data-disabled', 'false');
  });

  it('should switch recording mode between voice-activated and push-to-talk', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🎤 Voice Activated'));
    expect(screen.getByTestId('voice-recorder')).toHaveAttribute('data-mode', 'voice-activated');

    fireEvent.click(screen.getByText('🎙️ Push to Talk'));
    expect(screen.getByTestId('voice-recorder')).toHaveAttribute('data-mode', 'push-to-talk');
  });

  it('should submit recording to pronunciation check', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('voice-recorder'));

    await waitFor(() => {
      expect(mockCheck).toHaveBeenCalledWith(
        expect.any(Blob),
        'おはようございます',
        'japanese'
      );
    });
  });

  it('should display pronunciation result when available', async () => {
    vi.mocked(usePronunciationCheckModule.usePronunciationCheck).mockReturnValue({
      result: {
        target_text: 'おはようございます',
        transcription: 'おはようございます',
        score: 92,
        feedback: 'Excellent pronunciation!',
        text_with_furigana: 'おはようございます',
        errors: ['Try to lengthen the first vowel'],
      },
      isChecking: false,
      error: null,
      check: mockCheck,
      clear: mockClear,
    });

    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByText('92%')).toBeInTheDocument();
    });

    expect(screen.getByText('Excellent pronunciation!')).toBeInTheDocument();
    expect(screen.getByText('Try to lengthen the first vowel')).toBeInTheDocument();
  });

  it('should show checking state while pronunciation is being evaluated', async () => {
    vi.mocked(usePronunciationCheckModule.usePronunciationCheck).mockReturnValue({
      result: null,
      isChecking: true,
      error: null,
      check: mockCheck,
      clear: mockClear,
    });

    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByText('Checking pronunciation...')).toBeInTheDocument();
    });
  });

  it('should update and persist volume', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    const volumeInput = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(volumeInput, { target: { value: '0.5' } });

    expect(window.localStorage.setItem).toHaveBeenCalledWith('speechPracticeVolume', '0.5');
  });

  it('should disable controls while loading', async () => {
    vi.mocked(useFuriganaModule.useFurigana).mockReturnValue({
      furigana: null,
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    });

    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
    });

    expect(screen.getByRole('button', { name: /Next Phrase/ })).toBeDisabled();
    expect(screen.getByRole('slider')).toBeDisabled();
    expect(screen.getByTestId('voice-recorder')).toHaveAttribute('data-disabled', 'true');
  });

  it('should fetch audio for the next phrase when Next is clicked', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('おはようございます');
    });

    // Clear fetch calls from initial auto-play
    vi.mocked(global.fetch).mockClear();

    fireEvent.click(screen.getByText(/Next Phrase/));

    await waitFor(() => {
      expect(screen.getByTestId('phrase-text')).toHaveTextContent('こんにちは');
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/repeat-after-me'),
        expect.objectContaining({
          body: expect.stringContaining('こんにちは'),
        })
      );
    });
  });

  it('should play existing audio URL without re-fetching when available', async () => {
    render(<RepeatMode />);

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /listen/i }));
    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalledTimes(2);
    });
  });
});
