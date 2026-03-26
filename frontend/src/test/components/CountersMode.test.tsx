import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CountersMode } from '../../../src/components/CountersMode/CountersMode';

// Mock the API config
vi.mock('../../../src/config/api.js', () => ({
  API_URL: 'http://localhost:3001'
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock fetch
global.fetch = vi.fn();

describe('CountersMode', () => {
  const mockCounterGroups = [
    {
      baseForm: 'hito',
      count: 2,
      patterns: [
        {
          id: 1,
          pattern: 'ひとり',
          base_form: 'hito',
          formation_rules: [],
          examples: [{ jp: 'ひとりです', en: 'I am one person' }]
        },
        {
          id: 2,
          pattern: 'ふたり',
          base_form: 'hito',
          formation_rules: [],
          examples: [{ jp: 'ふたりです', en: 'Two people' }]
        }
      ],
      counts: 'people',
      description: 'Counter for people'
    },
    {
      baseForm: 'hon',
      count: 1,
      patterns: [
        {
          id: 3,
          pattern: 'いっぽん',
          base_form: 'hon',
          formation_rules: [],
          examples: [{ jp: 'えんぴつをいっぽん', en: 'One pencil' }]
        }
      ],
      counts: 'long objects',
      description: 'Counter for long cylindrical objects'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-password');
  });

  it('should render loading state initially', () => {
    (fetch as any).mockImplementationOnce(() => new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading counters...')).toBeInTheDocument();
  });

  it('should render menu with counter groups after loading', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('📊 Japanese Counters')).toBeInTheDocument();
    });

    expect(screen.getByText('2 counter groups')).toBeInTheDocument();
    expect(screen.getByText('hito')).toBeInTheDocument();
    expect(screen.getByText('hon')).toBeInTheDocument();
    expect(screen.getByText('people')).toBeInTheDocument();
    expect(screen.getByText('long objects')).toBeInTheDocument();
  });

  it('should display counter explanation section', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('What are counters?')).toBeInTheDocument();
    });

    expect(screen.getByText(/In Japanese, counters/)).toBeInTheDocument();
    expect(screen.getByText('ひとり')).toBeInTheDocument();
    expect(screen.getByText('いっぽん')).toBeInTheDocument();
  });

  it('should display mixed quiz banner', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('🎯 Mixed Quiz')).toBeInTheDocument();
    });

    expect(screen.getByText(/Test your knowledge with 20 random counters/)).toBeInTheDocument();
  });

  it('should navigate to study mode when clicking a group card', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('hito')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('hito'));

    await waitFor(() => {
      expect(screen.getByText('hito - people')).toBeInTheDocument();
    });

    expect(screen.getByText('ひとり')).toBeInTheDocument();
    expect(screen.getByText('Counts: people')).toBeInTheDocument();
  });

  it('should navigate between patterns in study mode', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('hito')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('hito'));

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    // Click next
    fireEvent.click(screen.getByText('Next →'));
    
    await waitFor(() => {
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
      expect(screen.getByText('ふたり')).toBeInTheDocument();
    });

    // Previous should be enabled now
    const prevButton = screen.getByText('← Previous');
    expect(prevButton).not.toBeDisabled();
  });

  it('should enter quiz mode from study mode', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('hito')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('hito'));

    await waitFor(() => {
      expect(screen.getByText('🎯 Quiz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🎯 Quiz'));

    await waitFor(() => {
      expect(screen.getByText(/Quiz: hito/)).toBeInTheDocument();
    });

    expect(screen.getByText('Show Answer')).toBeInTheDocument();
  });

  it('should show answer and handle response buttons in quiz mode', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('hito')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('hito'));

    await waitFor(() => {
      expect(screen.getByText('🎯 Quiz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('🎯 Quiz'));

    await waitFor(() => {
      expect(screen.getByText('Show Answer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show Answer'));

    await waitFor(() => {
      expect(screen.getByText("❌ Didn't know")).toBeInTheDocument();
      expect(screen.getByText('✅ Knew it')).toBeInTheDocument();
    });
  });

  it('should start mixed quiz from menu', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('🎯 Mixed Quiz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Start →'));

    await waitFor(() => {
      expect(screen.getByText('🎯 Mixed Quiz')).toBeInTheDocument();
      expect(screen.getByText('1 / 3')).toBeInTheDocument(); // 3 questions from mock data
    });

    expect(screen.getByText('Show Answer')).toBeInTheDocument();
  });

  it('should navigate back to menu from study mode', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('hito')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('hito'));

    await waitFor(() => {
      expect(screen.getByText('← Menu')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('← Menu'));

    await waitFor(() => {
      expect(screen.getByText('📊 Japanese Counters')).toBeInTheDocument();
    });
  });

  it('should navigate back to home from menu', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    expect(screen.getByText('← Back')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load counters:', expect.any(Error));
    });

    // Should still render the menu with 0 groups
    await waitFor(() => {
      expect(screen.getByText('0 counter groups')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should handle non-ok API response', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('0 counter groups')).toBeInTheDocument();
    });
  });

  it('should include password header in API requests', async () => {
    localStorageMock.getItem.mockReturnValue('my-secret-password');
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/counters/groups',
        expect.objectContaining({
          headers: { 'X-Password': 'my-secret-password' }
        })
      );
    });
  });

  it('should display pattern examples in study mode', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });

    render(
      <MemoryRouter>
        <CountersMode />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('hito')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('hito'));

    await waitFor(() => {
      expect(screen.getByText('Examples:')).toBeInTheDocument();
    });

    expect(screen.getByText('ひとりです')).toBeInTheDocument();
    expect(screen.getByText('I am one person')).toBeInTheDocument();
  });
});
