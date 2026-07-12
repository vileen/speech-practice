import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RepeatSetup } from '../../pages/RepeatSetup';

// Mock the AuthenticatedRoute to just render children
vi.mock('../../App', () => ({
  AuthenticatedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RepeatSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  const renderRepeatSetup = () => {
    return render(
      <MemoryRouter>
        <RepeatSetup />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('should render the setup title', () => {
      renderRepeatSetup();
      expect(screen.getByText('🎯 Repeat After Me Setup')).toBeInTheDocument();
    });

    it('should render the practice description', () => {
      renderRepeatSetup();
      expect(screen.getByText('Practice pronunciation')).toBeInTheDocument();
    });

    it('should render voice selection section', () => {
      renderRepeatSetup();
      expect(screen.getByText('Voice')).toBeInTheDocument();
      expect(screen.getByText('♂️ Male')).toBeInTheDocument();
      expect(screen.getByText('♀️ Female')).toBeInTheDocument();
    });

    it('should render voice style selection section', () => {
      renderRepeatSetup();
      expect(screen.getByText('Voice Style')).toBeInTheDocument();
      expect(screen.getByText('🎙️ Normal')).toBeInTheDocument();
      expect(screen.getByText('✨ Anime')).toBeInTheDocument();
    });

    it('should render start practice button', () => {
      renderRepeatSetup();
      expect(screen.getByText('🚀 Start Practice')).toBeInTheDocument();
    });

    it('should render back link', () => {
      renderRepeatSetup();
      expect(screen.getByText('← Back to Home')).toBeInTheDocument();
    });
  });

  describe('gender selection', () => {
    it('should default to female gender', () => {
      renderRepeatSetup();
      const femaleButton = screen.getByText('♀️ Female');
      expect(femaleButton).toHaveClass('active');
    });

    it('should switch to male gender when clicked', () => {
      renderRepeatSetup();
      const maleButton = screen.getByText('♂️ Male');
      fireEvent.click(maleButton);
      expect(maleButton).toHaveClass('active');
      expect(screen.getByText('♀️ Female')).not.toHaveClass('active');
    });

    it('should switch back to female when clicked', () => {
      renderRepeatSetup();
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
      renderRepeatSetup();
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
      renderRepeatSetup();
      const animeButton = screen.getByText('✨ Anime');
      expect(animeButton).toHaveClass('active');
    });

    it('should switch to anime voice style when clicked', () => {
      renderRepeatSetup();
      const animeButton = screen.getByText('✨ Anime');
      fireEvent.click(animeButton);
      expect(animeButton).toHaveClass('active');
      expect(screen.getByText('🎙️ Normal')).not.toHaveClass('active');
    });

    it('should show anime hint when anime is selected', () => {
      renderRepeatSetup();
      const animeButton = screen.getByText('✨ Anime');
      fireEvent.click(animeButton);
      expect(screen.getByText('Anime-style expressive voice')).toBeInTheDocument();
    });

    it('should show normal hint when normal is selected', () => {
      renderRepeatSetup();
      expect(screen.getByText('Natural conversational voice')).toBeInTheDocument();
    });
  });

  describe('start practice', () => {
    it('should store settings in localStorage and navigate to repeat mode', () => {
      renderRepeatSetup();
      const maleButton = screen.getByText('♂️ Male');
      fireEvent.click(maleButton);

      const startButton = screen.getByText('🚀 Start Practice');
      fireEvent.click(startButton);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'repeatModeSettings',
        JSON.stringify({ gender: 'male', voiceStyle: 'normal' })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/repeat');
    });

    it('should default to female gender in localStorage', () => {
      renderRepeatSetup();
      const startButton = screen.getByText('🚀 Start Practice');
      fireEvent.click(startButton);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'repeatModeSettings',
        JSON.stringify({ gender: 'female', voiceStyle: 'normal' })
      );
    });

    it('should prevent double-click by disabling button during navigation', () => {
      renderRepeatSetup();
      const startButton = screen.getByText('🚀 Start Practice');
      fireEvent.click(startButton);
      // Second click should be ignored since button is disabled
      fireEvent.click(startButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when starting practice', () => {
      renderRepeatSetup();
      const startButton = screen.getByText('🚀 Start Practice');
      fireEvent.click(startButton);

      expect(screen.getByText('⏳ Loading...')).toBeInTheDocument();
    });
  });
});
