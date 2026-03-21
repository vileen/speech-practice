import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeButton } from '../../components/ModeButton/ModeButton';

describe('ModeButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with icon and label', () => {
      render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('🎤')).toBeInTheDocument();
      expect(screen.getByText('Recording')).toBeInTheDocument();
    });

    it('should render with different icon and label', () => {
      render(
        <ModeButton
          icon="🎯"
          label="Practice"
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('Practice')).toBeInTheDocument();
    });

    it('should render button element', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should render icon in a span with correct class', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      const iconSpan = container.querySelector('.mode-button-icon');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan).toHaveTextContent('🎤');
    });

    it('should render label in a span with correct class', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      const labelSpan = container.querySelector('.mode-button-label');
      expect(labelSpan).toBeInTheDocument();
      expect(labelSpan).toHaveTextContent('Recording');
    });
  });

  describe('CSS Class Variations', () => {
    it('should have "default" class when variant is not specified', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('mode-button', 'default');
    });

    it('should have "default" class when variant is explicitly set to "default"', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          variant="default"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('mode-button', 'default');
    });

    it('should have "primary" class when variant is set to "primary"', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          variant="primary"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('mode-button', 'primary');
    });

    it('should not have "primary" class when variant is "default"', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          variant="default"
        />
      );

      const button = container.querySelector('button');
      expect(button).not.toHaveClass('primary');
    });

    it('should not have "default" class when variant is "primary"', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          variant="primary"
        />
      );

      const button = container.querySelector('button');
      expect(button).not.toHaveClass('default');
    });
  });

  describe('User Interactions', () => {
    it('should call onClick handler when button is clicked', () => {
      render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick handler multiple times when clicked multiple times', () => {
      render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should call onClick handler for primary variant', () => {
      render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          variant="primary"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('BorderColor Inline Style', () => {
    it('should not have inline style when borderColor is not provided', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      const button = container.querySelector('button');
      expect(button).not.toHaveAttribute('style');
    });

    it('should have --border-color CSS variable when borderColor is provided', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          borderColor="#FF5733"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveStyle('--border-color: #FF5733');
    });

    it('should apply different border colors correctly', () => {
      const { container, rerender } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          borderColor="#FF5733"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveStyle('--border-color: #FF5733');

      rerender(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          borderColor="#33FF57"
        />
      );

      expect(button).toHaveStyle('--border-color: #33FF57');
    });

    it('should remove border color style when borderColor prop is removed', () => {
      const { container, rerender } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          borderColor="#FF5733"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveStyle('--border-color: #FF5733');

      rerender(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
        />
      );

      // React may render empty style attribute, so check style is empty or has no border-color
      const style = button?.getAttribute('style');
      expect(!style || !style.includes('--border-color')).toBe(true);
    });

    it('should work with borderColor and primary variant together', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          variant="primary"
          borderColor="#FF5733"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('mode-button', 'primary');
      expect(button).toHaveStyle('--border-color: #FF5733');
    });

    it('should work with borderColor and default variant together', () => {
      const { container } = render(
        <ModeButton
          icon="🎤"
          label="Recording"
          onClick={mockOnClick}
          variant="default"
          borderColor="#5733FF"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('mode-button', 'default');
      expect(button).toHaveStyle('--border-color: #5733FF');
    });
  });

  describe('Props Combinations', () => {
    it('should render with all props provided', () => {
      const { container } = render(
        <ModeButton
          icon="🎯"
          label="Practice Mode"
          onClick={mockOnClick}
          variant="primary"
          borderColor="#3498db"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('mode-button', 'primary');
      expect(button).toHaveStyle('--border-color: #3498db');
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('Practice Mode')).toBeInTheDocument();
    });

    it('should handle empty string icon', () => {
      render(
        <ModeButton
          icon=""
          label="Recording"
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Recording')).toBeInTheDocument();
    });

    it('should handle empty string label', () => {
      render(
        <ModeButton
          icon="🎤"
          label=""
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('🎤')).toBeInTheDocument();
    });
  });
});