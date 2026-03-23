import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../components/Header/Header';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Header', () => {
  const defaultProps = {
    title: 'Test Title',
  };

  const renderWithRouter = (props = defaultProps) => {
    return render(
      <MemoryRouter>
        <Header {...props} />
      </MemoryRouter>
    );
  };

  describe('rendering title', () => {
    it('should render the title', () => {
      renderWithRouter();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render title with icon when icon is provided', () => {
      renderWithRouter({ ...defaultProps, icon: '🎤' });
      expect(screen.getByText('🎤')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  describe('rendering subtitle', () => {
    it('should render subtitle when provided', () => {
      renderWithRouter({ ...defaultProps, subtitle: 'Test Subtitle' });
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should not render subtitle when not provided', () => {
      renderWithRouter();
      expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
    });
  });

  describe('back button', () => {
    it('should show back button by default', () => {
      renderWithRouter();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should hide back button when showBackButton is false', () => {
      renderWithRouter({ ...defaultProps, showBackButton: false });
      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });

    it('should call custom onBack handler when provided', () => {
      const onBackMock = vi.fn();
      renderWithRouter({ ...defaultProps, onBack: onBackMock });
      
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);
      
      expect(onBackMock).toHaveBeenCalledTimes(1);
    });

    it('should navigate to home when onBack is not provided', () => {
      const navigateMock = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(navigateMock);
      
      renderWithRouter();
      
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);
      
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  describe('actions', () => {
    it('should render actions when provided', () => {
      renderWithRouter({
        ...defaultProps,
        actions: <button data-testid="action-btn">Action</button>,
      });
      expect(screen.getByTestId('action-btn')).toBeInTheDocument();
    });

    it('should not break when actions is not provided', () => {
      renderWithRouter();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on back button', () => {
      renderWithRouter();
      expect(screen.getByLabelText('Back')).toBeInTheDocument();
    });

    it('should render as header element', () => {
      renderWithRouter();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});
