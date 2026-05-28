import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../../pages/Login';

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  const renderLogin = () => {
    return render(<Login />);
  };

  describe('rendering', () => {
    it('should render the login container with title', () => {
      renderLogin();
      expect(screen.getByText('Speech Practice')).toBeInTheDocument();
    });

    it('should render password input with placeholder', () => {
      renderLogin();
      const input = screen.getByPlaceholderText('Enter password');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render login button', () => {
      renderLogin();
      expect(screen.getByText('Enter')).toBeInTheDocument();
    });
  });

  describe('password input', () => {
    it('should update input value when typing', () => {
      renderLogin();
      const input = screen.getByPlaceholderText('Enter password') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'my-secret-password' } });
      expect(input.value).toBe('my-secret-password');
    });

    it('should handle empty password input', () => {
      renderLogin();
      const input = screen.getByPlaceholderText('Enter password') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '' } });
      expect(input.value).toBe('');
    });
  });

  describe('login button', () => {
    it('should store password in localStorage and reload on button click', () => {
      renderLogin();
      const input = screen.getByPlaceholderText('Enter password');
      const button = screen.getByText('Enter');

      fireEvent.change(input, { target: { value: 'test-password' } });
      fireEvent.click(button);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'speech_practice_password',
        'test-password'
      );
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should store empty password in localStorage and reload when password is empty', () => {
      renderLogin();
      const button = screen.getByText('Enter');

      fireEvent.click(button);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'speech_practice_password',
        ''
      );
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('keyboard interaction', () => {
    it('should trigger login when Enter key is pressed in input', () => {
      renderLogin();
      const input = screen.getByPlaceholderText('Enter password');

      fireEvent.change(input, { target: { value: 'enter-password' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'speech_practice_password',
        'enter-password'
      );
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should not trigger login for non-Enter keys', () => {
      renderLogin();
      const input = screen.getByPlaceholderText('Enter password');

      fireEvent.change(input, { target: { value: 'some-password' } });
      fireEvent.keyPress(input, { key: 'Escape', code: 'Escape', charCode: 27 });

      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });
});
