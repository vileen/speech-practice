import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatSetup } from '../../pages/ChatSetup';

// Mock the AuthenticatedRoute to just render children
vi.mock('../../App', () => ({
  AuthenticatedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../config/api', () => ({
  API_URL: 'https://test-api.example.com',
  getPassword: () => 'test-password',
}));

describe('ChatSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => {
          if (key === 'voiceStyle') return 'normal';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
    // Mock fetch
    global.fetch = vi.fn();
    // Mock navigate
    Object.defineProperty(window, 'location', {
      value: { assign: vi.fn() },
      writable: true,
    });
  });

  const renderChatSetup = () => {
    return render(
      <MemoryRouter>
        <ChatSetup />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('should render the chat setup title', () => {
      renderChatSetup();
      expect(screen.getByText('💬 Chat Setup')).toBeInTheDocument();
    });

    it('should render the setup description', () => {
      renderChatSetup();
      expect(screen.getByText('Configure your chat session')).toBeInTheDocument();
    });

    it('should render voice selection section', () => {
      renderChatSetup();
      expect(screen.getByText('Voice')).toBeInTheDocument();
      expect(screen.getByText('♂️ Male')).toBeInTheDocument();
      expect(screen.getByText('♀️ Female')).toBeInTheDocument();
    });

    it('should render voice style selection section', () => {
      renderChatSetup();
      expect(screen.getByText('Voice Style')).toBeInTheDocument();
      expect(screen.getByText('🎙️ Normal')).toBeInTheDocument();
      expect(screen.getByText('✨ Anime')).toBeInTheDocument();
    });

    it('should render start chat button', () => {
      renderChatSetup();
      expect(screen.getByText('🚀 Start Chat')).toBeInTheDocument();
    });
  });

  describe('gender selection', () => {
    it('should default to female gender', () => {
      renderChatSetup();
      const femaleButton = screen.getByText('♀️ Female');
      expect(femaleButton).toHaveClass('active');
    });

    it('should switch to male gender when clicked', () => {
      renderChatSetup();
      const maleButton = screen.getByText('♂️ Male');
      fireEvent.click(maleButton);
      expect(maleButton).toHaveClass('active');
      expect(screen.getByText('♀️ Female')).not.toHaveClass('active');
    });

    it('should switch back to female when clicked', () => {
      renderChatSetup();
      const maleButton = screen.getByText('♂️ Male');
      const femaleButton = screen.getByText('♀️ Female');
      fireEvent.click(maleButton);
      fireEvent.click(femaleButton);
      expect(femaleButton).toHaveClass('active');
      expect(maleButton).not.toHaveClass('active');
    });
  });

  describe('voice style selection', () => {
    it('should default to normal voice style from localStorage', () => {
      renderChatSetup();
      const normalButton = screen.getByText('🎙️ Normal');
      expect(normalButton).toHaveClass('active');
    });

    it('should read voice style from localStorage', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn((key: string) => {
            if (key === 'voiceStyle') return 'anime';
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true,
      });
      renderChatSetup();
      const animeButton = screen.getByText('✨ Anime');
      expect(animeButton).toHaveClass('active');
    });

    it('should switch to anime voice style when clicked', () => {
      renderChatSetup();
      const animeButton = screen.getByText('✨ Anime');
      fireEvent.click(animeButton);
      expect(animeButton).toHaveClass('active');
      expect(screen.getByText('🎙️ Normal')).not.toHaveClass('active');
    });

    it('should show anime hint when anime is selected', () => {
      renderChatSetup();
      const animeButton = screen.getByText('✨ Anime');
      fireEvent.click(animeButton);
      expect(screen.getByText('Anime-style expressive voice')).toBeInTheDocument();
    });

    it('should show normal hint when normal is selected', () => {
      renderChatSetup();
      expect(screen.getByText('Natural conversational voice')).toBeInTheDocument();
    });
  });

  describe('start chat', () => {
    it('should call API with correct parameters when starting chat', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 123, language: 'japanese' }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      renderChatSetup();
      const maleButton = screen.getByText('♂️ Male');
      fireEvent.click(maleButton);

      const startButton = screen.getByText('🚀 Start Chat');
      fireEvent.click(startButton);

      // Wait for async
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/sessions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Password': 'test-password',
          },
          body: JSON.stringify({ language: 'japanese', voice_gender: 'male' }),
        })
      );
    });

    it('should handle API error gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      renderChatSetup();
      const startButton = screen.getByText('🚀 Start Chat');
      fireEvent.click(startButton);

      // Wait for async
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not crash - component still renders
      expect(screen.getByText('💬 Chat Setup')).toBeInTheDocument();
    });

    it('should default to female gender in API call', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 456 }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      renderChatSetup();
      const startButton = screen.getByText('🚀 Start Chat');
      fireEvent.click(startButton);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ language: 'japanese', voice_gender: 'female' }),
        })
      );
    });
  });
});
