/**
 * HEADER REGRESSION TESTS
 *
 * ⚠️ WARNING: These tests verify critical bugs that have been fixed.
 * DO NOT modify these tests without explicit user approval.
 *
 * AI REMINDER: Changing regression tests is a SERIOUS step.
 * ALWAYS ask the user before modifying, skipping, or deleting these tests.
 * These are the last line of defense against re-introducing production bugs.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../../components/Header/Header';

describe('Header Regression Tests', () => {
  it('should render title with icon', () => {
    render(
      <MemoryRouter>
        <Header title="Home" icon="🏠" showBackButton={false} />
      </MemoryRouter>
    );

    const title = screen.getByText('Home');
    const icon = screen.getByText('🏠');
    
    expect(title).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });

  it('should render back button when showBackButton is true', () => {
    render(
      <MemoryRouter>
        <Header title="Lessons" icon="📚" showBackButton={true} />
      </MemoryRouter>
    );

    const backBtn = screen.getByText('← Back');
    const title = screen.getByText('Lessons');
    
    expect(backBtn).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('should NOT render back button when showBackButton is false', () => {
    render(
      <MemoryRouter>
        <Header title="Home" icon="🏠" showBackButton={false} />
      </MemoryRouter>
    );

    expect(screen.queryByText('← Back')).not.toBeInTheDocument();
  });

  it('should render actions in header-right', () => {
    const actions = <button data-testid="action-btn">Action</button>;
    
    render(
      <MemoryRouter>
        <Header title="Test" actions={actions} />
      </MemoryRouter>
    );

    const actionBtn = screen.getByTestId('action-btn');
    const headerRight = document.querySelector('.header-right');
    
    expect(actionBtn).toBeInTheDocument();
    expect(headerRight).toContainElement(actionBtn);
  });

  it('should have proper header structure with left, center, right sections', () => {
    render(
      <MemoryRouter>
        <Header title="Test" icon="🧪" showBackButton={true} />
      </MemoryRouter>
    );

    expect(document.querySelector('.header-left')).toBeInTheDocument();
    expect(document.querySelector('.header-center')).toBeInTheDocument();
    expect(document.querySelector('.header-right')).toBeInTheDocument();
  });
});
