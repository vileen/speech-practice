import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VerbMode } from '../../components/VerbMode/VerbMode';

// Mock react-router-dom
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockVerb = {
  id: 1,
  dictionary_form: '食べる',
  reading: 'たべる',
  meaning: 'to eat',
  group: 'II',
  jlpt_level: 'N5',
  conjugations: {
    te_form: '食べて',
    ta_form: '食べた',
    negative: '食べない',
    past_negative: '食べなかった',
    polite: '食べます',
    polite_negative: '食べません',
    polite_past: '食べました',
    polite_past_negative: '食べませんでした',
    potential: '食べられる',
    volitional: '食べよう',
    imperative: '食べろ',
    conditional: '食べれば',
    passive: '食べられる',
    causative: '食べさせる',
    causative_passive: '食べさせられる',
  },
};

const mockCheckResponse = {
  correct: true,
  progress: {
    streak: 3,
    total_attempts: 10,
    correct_attempts: 8,
  },
};

describe('VerbMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
    
    // Default mock for fetch
    mockFetch.mockImplementation((url: string | Request | URL) => {
      const urlStr = url.toString();
      
      if (urlStr.includes('/api/verbs/random')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ verb: mockVerb }),
        } as Response);
      }
      
      if (urlStr.includes('/api/verbs/check')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckResponse),
        } as Response);
      }
      
      return Promise.resolve({ ok: false } as Response);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderVerbMode = () => {
    return render(
      <MemoryRouter>
        <VerbMode />
      </MemoryRouter>
    );
  };

  describe('Initial Render - Selection Screen', () => {
    it('should render selection screen with title', () => {
      renderVerbMode();
      
      expect(screen.getByText('Verb Conjugation Practice')).toBeInTheDocument();
    });

    it('should display practice type options', () => {
      renderVerbMode();
      
      expect(screen.getByText('🧠 Recognition')).toBeInTheDocument();
      expect(screen.getByText('🔨 Construction')).toBeInTheDocument();
      expect(screen.getByText('🔄 Transformation')).toBeInTheDocument();
    });

    it('should display practice type descriptions', () => {
      renderVerbMode();
      
      expect(screen.getByText(/Which form is/)).toBeInTheDocument();
      expect(screen.getByText(/Conjugate.*to/)).toBeInTheDocument();
      expect(screen.getByText(/Change.*→/)).toBeInTheDocument();
    });

    it('should have Construction selected by default', () => {
      renderVerbMode();
      
      const constructionBtn = screen.getByText('🔨 Construction').closest('button');
      expect(constructionBtn).toHaveClass('active');
    });

    it('should render answer mode section', () => {
      renderVerbMode();
      
      expect(screen.getByText('Answer Mode')).toBeInTheDocument();
      expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
      expect(screen.getByText('Type Answer')).toBeInTheDocument();
    });

    it('should render group selection checkboxes', () => {
      renderVerbMode();
      
      expect(screen.getByText('Verb Groups')).toBeInTheDocument();
      
      // Check for checkboxes by their labels
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(3); // At least 3 group checkboxes
    });

    it('should have all groups selected by default', () => {
      renderVerbMode();
      
      const checkboxes = screen.getAllByRole('checkbox');
      // All checkboxes should be checked by default
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should render start button', () => {
      renderVerbMode();
      
      expect(screen.getByText('Start Practice →')).toBeInTheDocument();
    });
  });

  describe('Practice Type Selection', () => {
    it('should switch to Recognition practice type when clicked', () => {
      renderVerbMode();
      
      const recognitionBtn = screen.getByText('🧠 Recognition').closest('button');
      fireEvent.click(recognitionBtn!);
      
      expect(recognitionBtn).toHaveClass('active');
    });

    it('should switch to Transformation practice type when clicked', () => {
      renderVerbMode();
      
      const transformationBtn = screen.getByText('🔄 Transformation').closest('button');
      fireEvent.click(transformationBtn!);
      
      expect(transformationBtn).toHaveClass('active');
    });
  });

  describe('Answer Mode Selection', () => {
    it('should switch to type answer mode when clicked', () => {
      renderVerbMode();
      
      const typeAnswerBtn = screen.getByText('Type Answer').closest('button');
      fireEvent.click(typeAnswerBtn!);
      
      expect(typeAnswerBtn).toHaveClass('active');
    });
  });

  describe('Group Selection', () => {
    it('should uncheck Group I when clicked', () => {
      renderVerbMode();
      
      const checkboxes = screen.getAllByRole('checkbox');
      const groupICheckbox = checkboxes[0];
      
      expect(groupICheckbox).toBeChecked();
      fireEvent.click(groupICheckbox);
      expect(groupICheckbox).not.toBeChecked();
    });

    it('should check Group I back when clicked again', () => {
      renderVerbMode();
      
      const checkboxes = screen.getAllByRole('checkbox');
      const groupICheckbox = checkboxes[0];
      
      fireEvent.click(groupICheckbox);
      fireEvent.click(groupICheckbox);
      
      expect(groupICheckbox).toBeChecked();
    });

    it('should select all groups when All is clicked', () => {
      renderVerbMode();
      
      // First uncheck some groups
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      
      // Click All
      const allBtn = screen.getByText('All');
      fireEvent.click(allBtn);
      
      // All should be checked
      const newCheckboxes = screen.getAllByRole('checkbox');
      newCheckboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should deselect all groups when None is clicked', () => {
      renderVerbMode();
      
      const noneBtn = screen.getByText('None');
      fireEvent.click(noneBtn);
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Starting Practice', () => {
    it('should load exercise when Start Practice is clicked', async () => {
      renderVerbMode();
      
      const startBtn = screen.getByText('Start Practice →');
      
      await act(async () => {
        fireEvent.click(startBtn);
      });
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/verbs/random'),
          expect.any(Object)
        );
      });
    });

    it('should show loading state while fetching', async () => {
      // Delay the fetch response
      mockFetch.mockImplementationOnce(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ verb: mockVerb }),
            } as Response);
          }, 100);
        })
      );

      renderVerbMode();
      
      const startBtn = screen.getByText('Start Practice →');
      fireEvent.click(startBtn);
      
      expect(screen.getByText('Loading exercise...')).toBeInTheDocument();
    });
  });

  describe('Exercise Screen - Construction Mode', () => {
    beforeEach(async () => {
      renderVerbMode();
      
      const startBtn = screen.getByText('Start Practice →');
      await act(async () => {
        fireEvent.click(startBtn);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Loading exercise...')).not.toBeInTheDocument();
      });
    });

    it('should display exercise with verb dictionary form', async () => {
      await waitFor(() => {
        expect(screen.getByText('食べる')).toBeInTheDocument();
      });
    });

    it('should display verb meaning', async () => {
      await waitFor(() => {
        expect(screen.getByText('to eat')).toBeInTheDocument();
      });
    });

    it('should display verb group badge', async () => {
      await waitFor(() => {
        expect(screen.getByText('Group II')).toBeInTheDocument();
      });
    });
  });



  describe('Back Navigation', () => {
    it('should navigate back when back button is clicked', () => {
      renderVerbMode();
      
      // Look for the back button (it's in the Header component)
      const backBtn = screen.getByLabelText('Back');
      fireEvent.click(backBtn);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderVerbMode();
      
      const startBtn = screen.getByText('Start Practice →');
      await act(async () => {
        fireEvent.click(startBtn);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load random verb:',
          expect.any(Error)
        );
      });
      
      consoleSpy.mockRestore();
    });
  });
});
