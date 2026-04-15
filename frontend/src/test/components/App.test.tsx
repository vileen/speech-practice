import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AuthenticatedRoute } from '../../App';

// Mock all page components to avoid rendering full app logic
vi.mock('../../pages/Login', () => ({
  Login: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('../../pages/Home', () => ({
  Home: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('../../components/HealthCheckWrapper', () => ({
  HealthCheckWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="health-check-wrapper">{children}</div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Routing', () => {
    it('should render home page at root path', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('should redirect unknown routes to home', () => {
      render(
        <MemoryRouter initialEntries={['/unknown']}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('should wrap routes in HealthCheckWrapper', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('health-check-wrapper')).toBeInTheDocument();
    });
  });
});

describe('AuthenticatedRoute', () => {
  let getItemMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    getItemMock = vi.fn();
    (global as any).localStorage = {
      getItem: getItemMock,
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render Login when user is not authenticated', async () => {
    getItemMock.mockReturnValue(null);

    render(
      <AuthenticatedRoute>
        <div data-testid="protected-content">Protected</div>
      </AuthenticatedRoute>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', async () => {
    getItemMock.mockReturnValue('secret123');

    render(
      <AuthenticatedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </AuthenticatedRoute>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('should check the correct localStorage key', async () => {
    getItemMock.mockReturnValue(null);

    render(
      <AuthenticatedRoute>
        <div data-testid="protected-content">Protected</div>
      </AuthenticatedRoute>
    );

    await waitFor(() => {
      expect(getItemMock).toHaveBeenCalledWith('speech_practice_password');
    });
  });

  it('should handle empty string password as unauthenticated', async () => {
    getItemMock.mockReturnValue('');

    render(
      <AuthenticatedRoute>
        <div data-testid="protected-content">Protected</div>
      </AuthenticatedRoute>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('should unmount without errors', async () => {
    getItemMock.mockReturnValue('secret123');

    const { unmount } = render(
      <AuthenticatedRoute>
        <div data-testid="protected-content">Protected</div>
      </AuthenticatedRoute>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    expect(() => unmount()).not.toThrow();
  });
});
