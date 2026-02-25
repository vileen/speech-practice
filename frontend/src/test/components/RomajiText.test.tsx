import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RomajiText } from '../../components/RomajiText.js';

describe('RomajiText', () => {
  it('should render romaji text', () => {
    render(<RomajiText romaji="kyou wa" />);
    expect(screen.getByText('kyou wa')).toBeInTheDocument();
  });

  it('should return null when romaji is not provided', () => {
    const { container } = render(<RomajiText />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply custom className', () => {
    const { container } = render(<RomajiText romaji="test" className="custom-romaji" />);
    expect(container.querySelector('.custom-romaji')).toBeInTheDocument();
  });
});
