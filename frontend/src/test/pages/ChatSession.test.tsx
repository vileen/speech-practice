import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ChatSession } from '../../pages/ChatSession';

// --- Hoisted mock state (shared with vi.mock factories) ---
const mockFetchTTS = vi.hoisted(() => vi.fn());

const chatSessionState = vi.hoisted(() => ({
  session: { id: 42, language: 'japanese' } as Record<string, unknown> | null,
  language: 'japanese',
  voiceStyle: 'normal',
  isLoadingSession: false,
  clearSession: vi.fn(),
  initialMessages: [] as Record<string, unknown>[],
}));

// Mock the session hook so we control session/messages deterministically.
// Messages use real React state so page-level setMessages calls work.
vi.mock('../../hooks/useChatSession', async () => {
  const React = await import('react');
  return {
    useChatSession: () => {
      const [messages, setMessages] = React.useState(chatSessionState.initialMessages);
      return {
        session: chatSessionState.session,
        language: chatSessionState.language,
        voiceStyle: chatSessionState.voiceStyle,
        messages,
        setMessages,
        isLoadingSession: chatSessionState.isLoadingSession,
        clearSession: chatSessionState.clearSession,
      };
    },
  };
});

vi.mock('../../hooks/useTTS', () => ({
  useTTS: () => ({ fetchTTS: mockFetchTTS }),
}));

// Mock the AuthenticatedRoute to just render children
vi.mock('../../App', () => ({
  AuthenticatedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../config/api', () => ({
  API_URL: 'https://test-api.example.com',
  getPassword: () => 'test-password',
}));

// Lightweight component mocks — we test page behavior, not child internals
vi.mock('../../components/AudioPlayer', () => ({
  AudioPlayer: ({ audioUrl }: { audioUrl: string }) => (
    <div data-testid="audio-player">{audioUrl}</div>
  ),
}));

vi.mock('../../components/VoiceRecorder', () => ({
  VoiceRecorder: ({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) => (
    <button onClick={() => onRecordingComplete(new Blob(['audio'], { type: 'audio/webm' }))}>
      Simulate Voice Recording
    </button>
  ),
}));

vi.mock('../../components/HighlightedText', () => ({
  HighlightedText: ({ text }: { text: string }) => <span>{text}</span>,
}));

describe('ChatSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chatSessionState.session = { id: 42, language: 'japanese' };
    chatSessionState.language = 'japanese';
    chatSessionState.voiceStyle = 'normal';
    chatSessionState.isLoadingSession = false;
    chatSessionState.initialMessages = [];
  });

  const renderChatSession = () => {
    return render(
      <MemoryRouter initialEntries={['/chat/session']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/chat/session" element={<ChatSession />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('should show loading state while session is loading', () => {
      chatSessionState.isLoadingSession = true;
      renderChatSession();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render the loading state once session is loaded', () => {
      renderChatSession();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render the app header', () => {
      renderChatSession();
      expect(screen.getByRole('heading', { name: /speech practice/i })).toBeInTheDocument();
    });

    it('should render session info with language and End button', () => {
      renderChatSession();
      expect(screen.getByText('Japanese')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'End' })).toBeInTheDocument();
    });

    it('should render the furigana toggle for japanese sessions', () => {
      renderChatSession();
      expect(screen.getByText('Furigana')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render message input and send button', () => {
      renderChatSession();
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    });

    it('should render messages with correct role badges', () => {
      chatSessionState.initialMessages = [
        { role: 'user', text: 'こんにちは' },
        { role: 'assistant', text: 'こんにちは！元気ですか？' },
      ];
      renderChatSession();
      expect(screen.getByText('You')).toBeInTheDocument();
      expect(screen.getByText('Teacher')).toBeInTheDocument();
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
      expect(screen.getByText('こんにちは！元気ですか？')).toBeInTheDocument();
    });

    it('should render an audio player for messages with an audioUrl', () => {
      chatSessionState.initialMessages = [
        { role: 'assistant', text: 'hello', audioUrl: 'blob:mock-audio' },
      ];
      renderChatSession();
      expect(screen.getByTestId('audio-player')).toHaveTextContent('blob:mock-audio');
    });
  });

  describe('sending messages', () => {
    it('should send a message via the Send button and show the assistant echo', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ with_furigana: '元気ですか' }),
      });

      renderChatSession();
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: '元気ですか' } });
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));

      expect(await screen.findByText('元気ですか')).toBeInTheDocument();
      // Input is cleared after sending
      expect(input).toHaveValue('');
      // Furigana is fetched for japanese input
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/furigana',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Password': 'test-password',
          },
          body: JSON.stringify({ text: '元気ですか' }),
        })
      );
    });

    it('should send a message by pressing Enter', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ with_furigana: 'さようなら' }),
      });

      renderChatSession();
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'さようなら' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(await screen.findByText('さようなら')).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('should not send an empty or whitespace-only message', () => {
      renderChatSession();
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));

      expect(global.fetch).not.toHaveBeenCalled();
      // No new message rendered
      expect(screen.queryByText('You')).not.toBeInTheDocument();
    });
  });

  describe('voice recording flow', () => {
    it('should request an AI response when a voice recording completes', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          text: 'はい、続けてください。',
          text_with_furigana: 'はい、続けてください。',
          romaji: 'hai, tsuzukete kudasai',
          translation: 'Yes, please continue.',
        }),
      });
      mockFetchTTS.mockResolvedValue(null);

      renderChatSession();
      fireEvent.click(screen.getByText('Simulate Voice Recording'));

      expect(await screen.findByText('はい、続けてください。')).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/chat',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ session_id: 42, message: '[Voice message]' }),
        })
      );
    });

    it('should remove the pending message when the AI response fails', async () => {
      (global.fetch as any).mockResolvedValue({ ok: false, status: 500 });

      renderChatSession();
      fireEvent.click(screen.getByText('Simulate Voice Recording'));

      // Wait for the request to settle, then confirm nothing stuck around
      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      expect(screen.queryByText('Teacher')).not.toBeInTheDocument();
    });
  });

  describe('session controls', () => {
    it('should clear the session and navigate home when End is clicked', () => {
      renderChatSession();
      fireEvent.click(screen.getByRole('button', { name: 'End' }));

      expect(chatSessionState.clearSession).toHaveBeenCalled();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should toggle the furigana checkbox', () => {
      renderChatSession();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });
});
