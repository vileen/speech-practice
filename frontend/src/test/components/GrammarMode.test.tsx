import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GrammarMode } from '../../components/GrammarMode/GrammarMode';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockPatterns = [
  { id: 1, pattern: '〜てもいいです', category: 'Permission', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
  { id: 2, pattern: '〜てはいけません', category: 'Prohibition', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
  { id: 3, pattern: 'は (topic marker)', category: 'Particles', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
  { id: 4, pattern: 'い-adjectives: Present affirmative', category: 'I-Adjectives', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
];

describe('GrammarMode Category Filter', () => {
  const STORAGE_KEY = 'grammar_selected_categories';

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFetchResponse = () => {
    (fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/grammar/patterns')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ patterns: mockPatterns, count: mockPatterns.length }),
        });
      }
      if (url.includes('/api/grammar/review')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: 0, patterns: [] }),
        });
      }
      return Promise.resolve({ ok: false });
    });
  };

  it('should select all categories by default when localStorage is empty', async () => {
    mockFetchResponse();
    
    await act(async () => {
      render(
        <MemoryRouter>
          <GrammarMode />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Permission')).toBeInTheDocument();
    });

    // All checkboxes should be checked by default
    expect(screen.getByLabelText('Permission')).toBeChecked();
    expect(screen.getByLabelText('Prohibition')).toBeChecked();
    expect(screen.getByLabelText('Particles')).toBeChecked();
    expect(screen.getByLabelText('I-Adjectives')).toBeChecked();
  });

  it('should load saved categories from localStorage', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['Permission', 'Particles']));
    mockFetchResponse();
    
    await act(async () => {
      render(
        <MemoryRouter>
          <GrammarMode />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Permission')).toBeInTheDocument();
    });

    // Should load saved selection
    expect(screen.getByLabelText('Permission')).toBeChecked();
    expect(screen.getByLabelText('Particles')).toBeChecked();
  });

  it('should toggle category checkbox', async () => {
    mockFetchResponse();
    
    await act(async () => {
      render(
        <MemoryRouter>
          <GrammarMode />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Particles')).toBeInTheDocument();
    });

    const particlesCheckbox = screen.getByLabelText('Particles');
    
    // Initially checked
    expect(particlesCheckbox).toBeChecked();

    // Click to uncheck
    await act(async () => {
      fireEvent.click(particlesCheckbox);
    });

    expect(particlesCheckbox).not.toBeChecked();
  });

  it('should have Select All and Deselect All buttons', async () => {
    mockFetchResponse();
    
    await act(async () => {
      render(
        <MemoryRouter>
          <GrammarMode />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Select All')).toBeInTheDocument();
      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });
  });

  it('should deselect all categories when Deselect All is clicked', async () => {
    mockFetchResponse();
    
    await act(async () => {
      render(
        <MemoryRouter>
          <GrammarMode />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Deselect All'));
    });

    // All checkboxes should be unchecked
    expect(screen.getByLabelText('Permission')).not.toBeChecked();
    expect(screen.getByLabelText('Prohibition')).not.toBeChecked();
    expect(screen.getByLabelText('Particles')).not.toBeChecked();
    expect(screen.getByLabelText('I-Adjectives')).not.toBeChecked();
  });

  it('should select all categories when Select All is clicked', async () => {
    mockFetchResponse();
    
    await act(async () => {
      render(
        <MemoryRouter>
          <GrammarMode />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    // First deselect all
    await act(async () => {
      fireEvent.click(screen.getByText('Deselect All'));
    });

    expect(screen.getByLabelText('Permission')).not.toBeChecked();

    // Then select all
    await act(async () => {
      fireEvent.click(screen.getByText('Select All'));
    });

    expect(screen.getByLabelText('Permission')).toBeChecked();
    expect(screen.getByLabelText('Prohibition')).toBeChecked();
    expect(screen.getByLabelText('Particles')).toBeChecked();
    expect(screen.getByLabelText('I-Adjectives')).toBeChecked();
  });

  it('should show no patterns message after clicking Deselect All', async () => {
    mockFetchResponse();
    
    await act(async () => {
      render(
        <MemoryRouter>
          <GrammarMode />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });

    // Deselect all
    await act(async () => {
      fireEvent.click(screen.getByText('Deselect All'));
    });

    // Should show the no selection message
    expect(screen.getByText('Select at least one category to see patterns')).toBeInTheDocument();
  });
});
