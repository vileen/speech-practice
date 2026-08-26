import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeButton } from '../../components/ModeButton/ModeButton';

describe('ModeButton', () => {
  const defaultProps = {
    icon: '🎤',
    label: 'Speaking',
    onClick: vi.fn(),
  };

  it('should render icon and label', () => {
    render(<ModeButton {...defaultProps} />);
    expect(screen.getByText('🎤')).toBeInTheDocument();
    expect(screen.getByText('Speaking')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClickMock = vi.fn();
    render(<ModeButton {...defaultProps} onClick={onClickMock} />);

    fireEvent.click(screen.getByRole('button', { name: /speaking/i }));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should apply default variant class', () => {
    const { container } = render(<ModeButton {...defaultProps} />);
    expect(container.querySelector('button')).toHaveClass('mode-button', 'default');
  });

  it('should apply primary variant class when specified', () => {
    const { container } = render(<ModeButton {...defaultProps} variant="primary" />);
    expect(container.querySelector('button')).toHaveClass('mode-button', 'primary');
  });

  it('should apply custom border color style', () => {
    const { container } = render(<ModeButton {...defaultProps} borderColor="#ff0000" />);
    const button = container.querySelector('button');
    expect(button).toHaveStyle('--border-color: #ff0000');
  });

  it('should be keyboard accessible as a button', () => {
    render(<ModeButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: /speaking/i })).toBeInTheDocument();
  });
});
