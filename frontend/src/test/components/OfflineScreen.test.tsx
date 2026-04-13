import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OfflineScreen } from '../../components/OfflineScreen/OfflineScreen';

describe('OfflineScreen', () => {
  const mockOnRetry = vi.fn();
  const testApiUrl = 'https://api.example.com';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the offline screen container', () => {
      render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
    });

    it('should display the API URL', () => {
      render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      expect(screen.getByText(/Can't reach:/i)).toBeInTheDocument();
      expect(screen.getByText(testApiUrl)).toBeInTheDocument();
    });

    it('should show a funny message', () => {
      render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      // Check for one of the known funny messages
      const messageElement = screen.getByText(/Someone forgot|hamster|WiFi|hide and seek|existential crisis|snack|404|internet tubes/i);
      expect(messageElement).toBeInTheDocument();
    });

    it('should show connection hint', () => {
      render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      expect(screen.getByText(/Check your connection or try again later/i)).toBeInTheDocument();
    });

    it('should display an error GIF image', () => {
      const { container } = render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      const img = container.querySelector('.error-gif');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', 'Error');
    });
  });

  describe('Retry Button', () => {
    it('should render retry button with correct text', () => {
      render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry multiple times when clicked multiple times', () => {
      render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('Props', () => {
    it('should display different API URLs correctly', () => {
      const localApiUrl = 'http://localhost:3001';
      const { rerender } = render(<OfflineScreen apiUrl={localApiUrl} onRetry={mockOnRetry} />);
      
      expect(screen.getByText(localApiUrl)).toBeInTheDocument();
      
      const cloudflareUrl = 'https://something.trycloudflare.com';
      rerender(<OfflineScreen apiUrl={cloudflareUrl} onRetry={mockOnRetry} />);
      
      expect(screen.getByText(cloudflareUrl)).toBeInTheDocument();
    });

    it('should use a different callback when prop changes', () => {
      const newMockRetry = vi.fn();
      const { rerender } = render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
      
      rerender(<OfflineScreen apiUrl={testApiUrl} onRetry={newMockRetry} />);
      fireEvent.click(retryButton);
      expect(newMockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Random Content', () => {
    it('should select random GIF from available options', () => {
      // Mock Math.random to return predictable values
      const mockMath = vi.spyOn(Math, 'random');
      
      // First render - should pick first GIF
      mockMath.mockReturnValue(0);
      const { container: container1 } = render(
        <OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />
      );
      const img1 = container1.querySelector('.error-gif') as HTMLImageElement;
      expect(img1).toBeInTheDocument();
      expect(img1.src).toContain('giphy.com');
      
      mockMath.mockRestore();
    });

    it('should select random message from available options', () => {
      // Mock Math.random to return predictable values
      const mockMath = vi.spyOn(Math, 'random');
      
      // First render
      mockMath.mockReturnValue(0);
      const { unmount: unmount1 } = render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      const message1 = screen.getByText(/Someone forgot|hamster|WiFi|hide and seek|existential crisis|snack|404|internet tubes/i).textContent;
      unmount1();
      
      // Second render with different random value
      mockMath.mockReturnValue(0.7);
      render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      const message2 = screen.getByText(/Someone forgot|hamster|WiFi|hide and seek|existential crisis|snack|404|internet tubes/i).textContent;
      
      // Both should have valid messages (they might be same or different)
      expect(message1).toBeTruthy();
      expect(message2).toBeTruthy();
      
      mockMath.mockRestore();
    });
  });

  describe('CSS Classes', () => {
    it('should have correct CSS classes for styling', () => {
      const { container } = render(<OfflineScreen apiUrl={testApiUrl} onRetry={mockOnRetry} />);
      
      expect(container.querySelector('.offline-screen')).toBeInTheDocument();
      expect(container.querySelector('.offline-container')).toBeInTheDocument();
      expect(container.querySelector('.gif-container')).toBeInTheDocument();
      expect(container.querySelector('.offline-title')).toBeInTheDocument();
      expect(container.querySelector('.offline-message')).toBeInTheDocument();
      expect(container.querySelector('.offline-details')).toBeInTheDocument();
      expect(container.querySelector('.offline-hint')).toBeInTheDocument();
      expect(container.querySelector('.retry-btn')).toBeInTheDocument();
    });
  });
});
