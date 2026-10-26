import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OfflineScreen } from '../../../components/OfflineScreen/OfflineScreen';

describe('OfflineScreen', () => {
  const baseProps = {
    apiUrl: 'http://localhost:3001/api',
    onRetry: vi.fn(),
  };

  beforeEach(() => {
    baseProps.onRetry.mockClear();
  });

  it('renders the title', () => {
    render(<OfflineScreen {...baseProps} />);

    expect(screen.getByText(/Oops!/i)).toBeInTheDocument();
  });

  it('displays the API URL that cannot be reached', () => {
    render(<OfflineScreen {...baseProps} />);

    expect(screen.getByText("Can't reach:")).toBeInTheDocument();
    expect(screen.getByText(baseProps.apiUrl)).toBeInTheDocument();
  });

  it('shows a random funny message', () => {
    render(<OfflineScreen {...baseProps} />);

    // Message is one of the predefined funny messages — just verify one is rendered
    const message = screen.getByText(/internet|hamster|WiFi|hide and seek|existential|snack|404|tubes/i);
    expect(message).toBeInTheDocument();
  });

  it('renders an error gif image', () => {
    render(<OfflineScreen {...baseProps} />);

    const img = screen.getByAltText('Error');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('giphy'));
  });

  it('renders a retry button', () => {
    render(<OfflineScreen {...baseProps} />);

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', () => {
    render(<OfflineScreen {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(baseProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows a connection hint to the user', () => {
    render(<OfflineScreen {...baseProps} />);

    expect(screen.getByText(/check your connection/i)).toBeInTheDocument();
  });
});
