import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeButton } from '../../../components/ModeButton/ModeButton';

describe('ModeButton', () => {
  const baseProps = {
    icon: '🎵',
    label: 'Listening',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    baseProps.onClick.mockClear();
  });

  it('renders the icon and label', () => {
    render(<ModeButton {...baseProps} />);

    expect(screen.getByText('🎵')).toBeInTheDocument();
    expect(screen.getByText('Listening')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<ModeButton {...baseProps} />);

    fireEvent.click(screen.getByRole('button'));

    expect(baseProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('uses default variant when none is provided', () => {
    const { container } = render(<ModeButton {...baseProps} />);
    const button = container.querySelector('.mode-button');

    expect(button).toHaveClass('mode-button');
    expect(button).toHaveClass('default');
    expect(button).not.toHaveClass('primary');
  });

  it('applies primary variant when specified', () => {
    const { container } = render(<ModeButton {...baseProps} variant="primary" />);
    const button = container.querySelector('.mode-button');

    expect(button).toHaveClass('mode-button');
    expect(button).toHaveClass('primary');
  });

  it('applies custom border color through CSS variable', () => {
    const { container } = render(<ModeButton {...baseProps} borderColor="#ff0000" />);
    const button = container.querySelector('.mode-button') as HTMLElement;

    expect(button).toBeInTheDocument();
    expect(button.style.getPropertyValue('--border-color')).toBe('#ff0000');
  });

  it('does not set inline style when borderColor is omitted', () => {
    const { container } = render(<ModeButton {...baseProps} />);
    const button = container.querySelector('.mode-button') as HTMLElement;

    expect(button).toBeInTheDocument();
    expect(button.getAttribute('style')).toBeNull();
  });
});
