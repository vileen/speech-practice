import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CountersMode } from '../../../../src/components/CountersMode/CountersMode';

vi.mock('../../../../src/config/api.js', () => ({
  API_URL: 'http://localhost:3001'
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

global.fetch = vi.fn();

describe('CountersMode uncovered flows', () => {
  const mockCounterGroups = [
    {
      baseForm: 'hito',
      count: 2,
      patterns: [
        {
          id: 1,
          pattern: 'ひとり',
          base_form: 'hito',
          formation_rules: [{ rule: 'hito + ri' }],
          examples: [{ jp: 'ひとりです', en: 'I am one person', romaji: 'hitori desu' }]
        },
        {
          id: 2,
          pattern: 'ふたり',
          base_form: 'hito',
          formation_rules: [{ rule: 'futa + ri' }],
          examples: [{ jp: 'ふたりです', en: 'Two people', romaji: 'futari desu' }]
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
          formation_rules: [{ rule: 'ichi + pon' }],
          examples: [{ jp: 'えんぴつをいっぽん', en: 'One pencil', romaji: 'ippon' }]
        }
      ],
      counts: 'long objects',
      description: 'Counter for long cylindrical objects'
    },
    {
      baseForm: 'ko',
      count: 1,
      patterns: [
        {
          id: 4,
          pattern: 'ひとつ',
          base_form: 'ko',
          formation_rules: [{ rule: 'hito + tsu' }],
          examples: [{ jp: 'りんごをひとつ', en: '', romaji: 'hitotsu' }]
        }
      ],
      counts: 'small objects',
      description: 'Counter for small objects'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-password');
  });

  const renderWithRouter = () => render(
    <MemoryRouter>
      <CountersMode />
    </MemoryRouter>
  );

  const loadMenu = async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockCounterGroups })
    });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('hito')).toBeInTheDocument();
    });
  };

  it('should switch to table view and display formation rules', async () => {
    await loadMenu();

    fireEvent.click(screen.getByText('hito'));

    await waitFor(() => {
      expect(screen.getByText('📋 Table')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 Table'));

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    expect(screen.getByText('Counter')).toBeInTheDocument();
    expect(screen.getByText('Meaning')).toBeInTheDocument();
    expect(screen.getByText('Rule')).toBeInTheDocument();
    expect(screen.getByText('hito + ri')).toBeInTheDocument();
    expect(screen.getByText('I am one person')).toBeInTheDocument();
  });

  it('should switch back from table view to card study', async () => {
    await loadMenu();

    fireEvent.click(screen.getByText('hito'));
    await waitFor(() => {
      expect(screen.getByText('📋 Table')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 Table'));
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('📋 Cards'));
    await waitFor(() => {
      expect(screen.getByText('← Menu')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  it('should select groups via checkbox and show practice FAB', async () => {
    await loadMenu();

    const hitoLabel = screen.getAllByText('hito')[0].closest('.group-card')?.querySelector('.group-checkbox');
    expect(hitoLabel).toBeInTheDocument();

    fireEvent.click(hitoLabel!);

    await waitFor(() => {
      expect(screen.getByText(/Practice 1 group/i)).toBeInTheDocument();
    });

    fireEvent.click(hitoLabel!);

    await waitFor(() => {
      expect(screen.queryByText(/Practice/i)).not.toBeInTheDocument();
    });
  });

  it('should start category quiz from selected groups', async () => {
    await loadMenu();

    const hitoLabel = screen.getAllByText('hito')[0].closest('.group-card')?.querySelector('.group-checkbox');
    fireEvent.click(hitoLabel!);

    await waitFor(() => {
      expect(screen.getByText(/Practice 1 group/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Practice 1 group/i));

    await waitFor(() => {
      expect(screen.getByText(/Category Quiz/i)).toBeInTheDocument();
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  it('should progress through mixed quiz until completion', async () => {
    await loadMenu();

    fireEvent.click(screen.getByText('Start →'));

    await waitFor(() => {
      expect(screen.getByText('1 / 4')).toBeInTheDocument();
    });

    // Answer first three questions
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText('Show Answer'));
      await waitFor(() => {
        expect(screen.getByText('✅ Knew it')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('✅ Knew it'));
      if (i < 2) {
        await waitFor(() => {
          expect(screen.getByText(`${i + 2} / 4`)).toBeInTheDocument();
        });
      }
    }

    // Answer final question
    fireEvent.click(screen.getByText('Show Answer'));
    await waitFor(() => {
      expect(screen.getByText('✅ Knew it')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('✅ Knew it'));

    await waitFor(() => {
      expect(screen.getByText('📊 Japanese Counters')).toBeInTheDocument();
    });
  });

  it('should fall back to group-based question when example has no English', async () => {
    // Provide only the ko group with a pattern lacking an English example.
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        groups: [
          {
            baseForm: 'ko',
            count: 1,
            patterns: [
              {
                id: 4,
                pattern: 'ひとつ',
                base_form: 'ko',
                formation_rules: [{ rule: 'hito + tsu' }],
                examples: [{ jp: 'りんごをひとつ', en: '', romaji: 'hitotsu' }]
              }
            ],
            counts: 'small objects',
            description: 'Counter for small objects'
          }
        ]
      })
    });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('ko')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Start →'));

    await waitFor(() => {
      expect(screen.getByText('What is the reading for small objects?')).toBeInTheDocument();
    });
  });

  it('should stop group card click from toggling checkbox', async () => {
    await loadMenu();

    const groupCard = screen.getByText('hito').closest('.group-card');
    expect(groupCard).toBeInTheDocument();

    // Clicking the card itself enters study mode, not selection
    fireEvent.click(groupCard!);

    await waitFor(() => {
      expect(screen.getByText('hito - people')).toBeInTheDocument();
    });

    // No FAB because no group was checkbox-selected
    expect(screen.queryByText(/Practice/i)).not.toBeInTheDocument();
  });
});
