import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { HealthCheckWrapper } from '../../components/HealthCheckWrapper/HealthCheckWrapper';

// Mock the API config
vi.mock('../../config/api', () => ({
  API_URL: 'https://test-api.example.com',
}));

describe('HealthCheckWrapper', () => {
  const mockChildren = <div data-testid="children">App Content</div>;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Initial Loading State', () => {
    it('should show checking state on initial render', () => {
      // Make fetch hang to keep checking state
      fetchMock.mockImplementation(() => new Promise(() => {}));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      expect(screen.getByText(/Checking connection.../i)).toBeInTheDocument();
      expect(screen.getByText(/🎤 Speech Practice/i)).toBeInTheDocument();
    });

    it('should not render children while checking', () => {
      fetchMock.mockImplementation(() => new Promise(() => {}));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      expect(screen.queryByTestId('children')).not.toBeInTheDocument();
    });
  });

  describe('Online State', () => {
    it('should render children when API is online', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByTestId('children')).toBeInTheDocument();
      });
    });

    it('should show app content when health check passes', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText('App Content')).toBeInTheDocument();
      });
    });

    it('should call health endpoint with correct URL', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          'https://test-api.example.com/api/health',
          expect.objectContaining({
            method: 'GET',
            headers: { Accept: 'application/json' },
          })
        );
      });
    });

    it('should use AbortSignal.timeout', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        const calls = fetchMock.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        // Check that signal was passed
        expect(calls[0][1]).toHaveProperty('signal');
      });
    });
  });

  describe('Offline State', () => {
    it('should show offline screen when API returns error', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
      });
    });

    it('should show offline screen when fetch throws error', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
      });
    });

    it('should not render children when offline', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('children')).not.toBeInTheDocument();
    });

    it('should display the API URL in offline screen', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText(/test-api.example.com/i)).toBeInTheDocument();
      });
    });
  });

  describe('Retry Functionality', () => {
    it('should transition to checking state when retry is clicked', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await act(async () => {
        retryButton.click();
      });

      // Should show checking state again
      expect(screen.getByText(/Checking connection.../i)).toBeInTheDocument();
    });

    it('should have working retry button in offline screen', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });

      // Verify the retry button exists and is clickable
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeEnabled();
      
      // Clicking should not throw
      await act(async () => {
        retryButton.click();
      });
    });
  });

  describe('Auto-retry Interval', () => {
    it('should auto-retry when offline every 5 seconds', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
      });

      const initialCallCount = fetchMock.mock.calls.length;

      // Advance time by 5 seconds
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(fetchMock.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('should stop auto-retry when API comes back online', async () => {
      // First health check fails
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
      });

      // Next auto-retry succeeds
      fetchMock.mockResolvedValue({ ok: true });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('children')).toBeInTheDocument();
      });

      const callCountAfterRecovery = fetchMock.mock.calls.length;

      // Advance time again - should not make more calls
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Should not have made additional calls since we're online
      expect(fetchMock.mock.calls.length).toBe(callCountAfterRecovery);
    });

    it('should clear interval on unmount', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      const { unmount } = render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
      });

      const callCountBeforeUnmount = fetchMock.mock.calls.length;

      unmount();

      // Advance time - should not make more calls since unmounted
      vi.advanceTimersByTime(10000);

      expect(fetchMock.mock.calls.length).toBe(callCountBeforeUnmount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle fetch timeout', async () => {
      // Simulate AbortSignal.timeout by making fetch hang
      fetchMock.mockImplementation(() => new Promise(() => {}));

      render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      // Should stay in checking state since fetch hangs
      expect(screen.getByText(/Checking connection.../i)).toBeInTheDocument();
    });

    it('should handle component unmounting during health check', async () => {
      let resolveFetch: (value: { ok: boolean }) => void;
      fetchMock.mockImplementation(() => new Promise((resolve) => {
        resolveFetch = resolve;
      }));

      const { unmount } = render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      // Unmount while fetch is pending
      unmount();

      // Resolve fetch after unmount - should not throw
      await act(async () => {
        resolveFetch!({ ok: true });
      });

      // No error should be thrown
      expect(fetchMock).toHaveBeenCalled();
    });

    it('should handle state transitions without errors', async () => {
      // Start with failing connection
      fetchMock.mockRejectedValue(new Error('Network error'));

      const { rerender } = render(<HealthCheckWrapper>{mockChildren}</HealthCheckWrapper>);

      // Wait for offline state
      await waitFor(() => {
        expect(screen.getByText(/Oops! 🙃/i)).toBeInTheDocument();
      });

      // Verify retry button works
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await act(async () => {
        retryButton.click();
      });

      // Should transition through checking
      expect(screen.getByText(/Checking connection.../i)).toBeInTheDocument();
    });
  });
});
