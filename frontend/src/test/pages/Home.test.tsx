import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { Home } from '../../pages/Home';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock child components to keep test focused on Home page structure
vi.mock('../../components/Header', () => ({
  Header: ({ title, icon }: { title: string; icon?: string }) => (
    <header data-testid="header">
      {icon && <span>{icon}</span>}
      <h1>{title}</h1>
    </header>
  ),
}));

vi.mock('../../components/ModeButton', () => ({
  ModeButton: ({
    icon,
    label,
    onClick,
    variant,
    borderColor,
  }: {
    icon: string;
    label: string;
    onClick: () => void;
    variant?: string;
    borderColor?: string;
  }) => (
    <button
      data-testid={`mode-button-${label.toLowerCase().replace(/\s+/g, '-')}`}
      data-variant={variant}
      data-border-color={borderColor}
      onClick={onClick}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  ),
}));

describe('Home', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    // Mock localStorage for AuthenticatedRoute
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue('test-password'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  const renderHome = () => {
    return render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('should render the header with title and icon', () => {
      renderHome();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Speech Practice')).toBeInTheDocument();
      expect(screen.getByText('🎤')).toBeInTheDocument();
    });

    it('should render all mode categories', () => {
      renderHome();
      expect(screen.getByText('Core Practice')).toBeInTheDocument();
      expect(screen.getByText('Review & Memory')).toBeInTheDocument();
      expect(screen.getByText('Drills & Exercises')).toBeInTheDocument();
      expect(screen.getByText('Reading, Listening & Speaking')).toBeInTheDocument();
    });

    it('should render all mode buttons', () => {
      renderHome();
      const expectedButtons = [
        'Start Chat',
        'Repeat After Me',
        'Lesson Mode',
        'Memory Mode',
        'Progress Dashboard',
        'Grammar Drills',
        'Verb Conjugation',
        'Counters',
        'Kanji Practice',
        'Reading Practice',
        'Listening Practice',
        'Speaking Drills',
      ];

      for (const label of expectedButtons) {
        const testId = `mode-button-${label.toLowerCase().replace(/\s+/g, '-')}`;
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      }
    });

    it('should mark Start Chat as primary variant', () => {
      renderHome();
      const startChatButton = screen.getByTestId('mode-button-start-chat');
      expect(startChatButton).toHaveAttribute('data-variant', 'primary');
    });

    it('should render quote footer', () => {
      renderHome();
      expect(screen.getByText(/Overthinking|dysfunctional|energy drinks|Either|Retardmaxxing|Skill issue|outworked|odd to be number 1|Fuck it|Nobody cares|your process|your output/i)).toBeInTheDocument();
    });

    it('should render built-with link', () => {
      renderHome();
      const link = screen.getByText('vileen');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://github.com/vileen');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('navigation', () => {
    it('should navigate to chat setup when Start Chat is clicked', () => {
      renderHome();
      const startChatButton = screen.getByTestId('mode-button-start-chat');
      fireEvent.click(startChatButton);
      expect(navigateMock).toHaveBeenCalledWith('/chat/setup');
    });

    it('should navigate to lessons when Lesson Mode is clicked', () => {
      renderHome();
      const lessonButton = screen.getByTestId('mode-button-lesson-mode');
      fireEvent.click(lessonButton);
      expect(navigateMock).toHaveBeenCalledWith('/lessons');
    });

    it('should navigate to memory when Memory Mode is clicked', () => {
      renderHome();
      const memoryButton = screen.getByTestId('mode-button-memory-mode');
      fireEvent.click(memoryButton);
      expect(navigateMock).toHaveBeenCalledWith('/memory');
    });

    it('should navigate to progress when Progress Dashboard is clicked', () => {
      renderHome();
      const progressButton = screen.getByTestId('mode-button-progress-dashboard');
      fireEvent.click(progressButton);
      expect(navigateMock).toHaveBeenCalledWith('/progress');
    });

    it('should navigate to grammar when Grammar Drills is clicked', () => {
      renderHome();
      const grammarButton = screen.getByTestId('mode-button-grammar-drills');
      fireEvent.click(grammarButton);
      expect(navigateMock).toHaveBeenCalledWith('/grammar');
    });

    it('should navigate to kanji when Kanji Practice is clicked', () => {
      renderHome();
      const kanjiButton = screen.getByTestId('mode-button-kanji-practice');
      fireEvent.click(kanjiButton);
      expect(navigateMock).toHaveBeenCalledWith('/kanji');
    });
  });
});
