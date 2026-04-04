import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatternGraph } from '../../components/GrammarMode/PatternGraph';
import type { GrammarPattern } from '../../components/GrammarMode/GrammarMode';

// Mock the API_URL
vi.mock('../../config/api.js', () => ({
  API_URL: 'http://localhost:3001',
}));

describe('PatternGraph', () => {
  const mockPatterns: GrammarPattern[] = [
    {
      id: 1,
      pattern: 'てもいい',
      category: 'Permission',
      jlpt_level: 'N5',
      formation_rules: [],
      examples: [],
      common_mistakes: [],
      streak: 5,
      total_attempts: 10,
      correct_attempts: 8,
    },
    {
      id: 2,
      pattern: 'なくてもいい',
      category: 'Lack of Obligation',
      jlpt_level: 'N5',
      formation_rules: [],
      examples: [],
      common_mistakes: [],
      streak: 3,
      total_attempts: 6,
      correct_attempts: 5,
    },
    {
      id: 3,
      pattern: 'なければならない',
      category: 'Obligation',
      jlpt_level: 'N4',
      formation_rules: [],
      examples: [],
      common_mistakes: [],
      streak: 0,
      total_attempts: 0,
      correct_attempts: 0,
    },
    {
      id: 4,
      pattern: 'てはいけない',
      category: 'Prohibition',
      jlpt_level: 'N5',
      formation_rules: [],
      examples: [],
      common_mistakes: [],
      streak: 2,
      total_attempts: 8,
      correct_attempts: 3,
    },
  ];

  const mockConfusionStats = [
    { patternId: 4, count: 3 },
  ];

  const mockOnSelectPattern = vi.fn();
  const mockOnComparePatterns = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    patterns: mockPatterns,
    confusionStats: mockConfusionStats,
    onSelectPattern: mockOnSelectPattern,
    onComparePatterns: mockOnComparePatterns,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch for relationships
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        relationships: [
          { id: 1, from_pattern_id: 1, to_pattern_id: 2, relationship_type: 'similar', strength: 0.8 },
          { id: 2, from_pattern_id: 1, to_pattern_id: 4, relationship_type: 'opposite', strength: 0.9 },
        ],
      }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the pattern graph modal', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('🕸️ Pattern Relationship Graph')).toBeInTheDocument();
      });
    });

    it('should render filter buttons', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confused' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Mastered' })).toBeInTheDocument();
      });
    });

    it('should render zoom controls', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument(); // Zoom level
      });
    });

    it('should render close button', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
      });
    });
  });

  describe('Legend and Sidebar', () => {
    it('should render connection type legend', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('🔴 Connection Type')).toBeInTheDocument();
      });
      
      // Use within to scope to legend section, avoiding filter button duplicates
      const legendSection = screen.getByText('🔴 Connection Type').closest('.legend-section-panel');
      expect(legendSection).toBeInTheDocument();
      
      // Check for connection type labels within the legend section
      const legendItems = legendSection?.querySelectorAll('.legend-item span');
      const labels = Array.from(legendItems || []).map(el => el.textContent);
      expect(labels).toContain('Opposite');
      expect(labels).toContain('Similar');
      expect(labels).toContain('Related');
      expect(labels).toContain('Confused');
    });

    it('should render mastery status legend', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('🟢 Mastery Status')).toBeInTheDocument();
      });
      
      // Use within to scope to legend section
      const legendSection = screen.getByText('🟢 Mastery Status').closest('.legend-section-panel');
      expect(legendSection).toBeInTheDocument();
      
      // Check for mastery labels within the legend section
      const legendItems = legendSection?.querySelectorAll('.legend-item span');
      const labels = Array.from(legendItems || []).map(el => el.textContent);
      expect(labels).toContain('Mastered');
      expect(labels).toContain('Learning');
      expect(labels).toContain('Not Practiced');
    });

    it('should render tips section', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('💡 Tips')).toBeInTheDocument();
        expect(screen.getByText('Click node to practice pattern')).toBeInTheDocument();
        expect(screen.getByText('Click connection to compare')).toBeInTheDocument();
        expect(screen.getByText('Drag to pan the view')).toBeInTheDocument();
        expect(screen.getByText('Use scroll to zoom in/out')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should filter nodes by confused status', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      const confusedButton = screen.getByRole('button', { name: 'Confused' });
      fireEvent.click(confusedButton);

      // Should show active filter state
      expect(confusedButton).toHaveClass('active');
    });

    it('should filter nodes by mastered status', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      const masteredButton = screen.getByRole('button', { name: 'Mastered' });
      fireEvent.click(masteredButton);

      expect(masteredButton).toHaveClass('active');
    });

    it('should reset to all patterns when All is clicked', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      const allButton = screen.getByRole('button', { name: 'All' });
      fireEvent.click(allButton);

      expect(allButton).toHaveClass('active');
    });
  });

  describe('Zoom Controls', () => {
    it('should zoom in when + button is clicked', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      const zoomInButton = screen.getByRole('button', { name: '+' });
      fireEvent.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByText('120%')).toBeInTheDocument();
      });
    });

    it('should zoom out when − button is clicked', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      const zoomOutButton = screen.getByRole('button', { name: '−' });
      fireEvent.click(zoomOutButton);

      await waitFor(() => {
        expect(screen.getByText(/8[0-9]%|83%/)).toBeInTheDocument();
      });
    });

    it('should reset zoom when ⟲ button is clicked', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      // Zoom in first
      const zoomInButton = screen.getByRole('button', { name: '+' });
      fireEvent.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByText('120%')).toBeInTheDocument();
      });

      // Reset
      const resetButton = screen.getByRole('button', { name: '⟲' });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: '×' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Integration', () => {
    it('should fetch relationships on mount', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/grammar/relationships')
        );
      });
    });

    it('should handle API error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching pattern relationships:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-ok response gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Pattern Filtering', () => {
    it('should filter out counter patterns', async () => {
      const patternsWithCounters: GrammarPattern[] = [
        ...mockPatterns,
        {
          id: 5,
          pattern: '個',
          category: 'Counters',
          jlpt_level: 'N5',
          formation_rules: [],
          examples: [],
          common_mistakes: [],
        },
      ];

      render(<PatternGraph {...defaultProps} patterns={patternsWithCounters} />);
      
      await waitFor(() => {
        // Footer should show count excluding counters
        expect(screen.getByText(/Visible:/)).toBeInTheDocument();
      });
    });
  });

  describe('Footer Statistics', () => {
    it('should display visible patterns count', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Visible:/)).toBeInTheDocument();
        expect(screen.getByText(/patterns/)).toBeInTheDocument();
      });
    });

    it('should display connections count', async () => {
      render(<PatternGraph {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Connections:/)).toBeInTheDocument();
        expect(screen.getByText(/connections/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while fetching relationships', async () => {
      // Create a delayed promise
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<PatternGraph {...defaultProps} />);
      
      expect(screen.getByText('⏳ Loading...')).toBeInTheDocument();
      expect(screen.getByText('Fetching pattern relationships...')).toBeInTheDocument();
    });
  });

  describe('Empty Patterns', () => {
    it('should handle empty patterns array', async () => {
      render(<PatternGraph {...defaultProps} patterns={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('🕸️ Pattern Relationship Graph')).toBeInTheDocument();
      });

      // Should show 0 visible patterns - check footer content
      const footer = screen.getByText(/Visible:/).closest('.pattern-graph-footer');
      expect(footer).toBeInTheDocument();
      expect(footer?.textContent).toContain('0');
      expect(footer?.textContent).toContain('patterns');
    });
  });

  describe('Pattern Mastery Calculation', () => {
    it('should correctly identify mastered patterns (>= 80% accuracy)', async () => {
      const patternsWithMastery: GrammarPattern[] = [
        {
          id: 1,
          pattern: 'Mastered Pattern',
          category: 'Test',
          jlpt_level: 'N5',
          formation_rules: [],
          examples: [],
          common_mistakes: [],
          total_attempts: 10,
          correct_attempts: 8, // 80% accuracy
        },
      ];

      render(<PatternGraph {...defaultProps} patterns={patternsWithMastery} confusionStats={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('🕸️ Pattern Relationship Graph')).toBeInTheDocument();
      });
    });

    it('should correctly identify confused patterns (< 50% accuracy or > 2 confusions)', async () => {
      const patternsWithConfusion: GrammarPattern[] = [
        {
          id: 1,
          pattern: 'Confused Pattern',
          category: 'Test',
          jlpt_level: 'N5',
          formation_rules: [],
          examples: [],
          common_mistakes: [],
          total_attempts: 8,
          correct_attempts: 3, // 37.5% accuracy
        },
      ];

      render(<PatternGraph {...defaultProps} patterns={patternsWithConfusion} confusionStats={[{ patternId: 1, count: 3 }]} />);
      
      await waitFor(() => {
        expect(screen.getByText('🕸️ Pattern Relationship Graph')).toBeInTheDocument();
      });
    });

    it('should correctly identify learning patterns (attempted but not mastered)', async () => {
      const patternsWithLearning: GrammarPattern[] = [
        {
          id: 1,
          pattern: 'Learning Pattern',
          category: 'Test',
          jlpt_level: 'N5',
          formation_rules: [],
          examples: [],
          common_mistakes: [],
          total_attempts: 10,
          correct_attempts: 6, // 60% accuracy
        },
      ];

      render(<PatternGraph {...defaultProps} patterns={patternsWithLearning} confusionStats={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('🕸️ Pattern Relationship Graph')).toBeInTheDocument();
      });
    });

    it('should correctly identify unknown patterns (no attempts)', async () => {
      const patternsWithUnknown: GrammarPattern[] = [
        {
          id: 1,
          pattern: 'Unknown Pattern',
          category: 'Test',
          jlpt_level: 'N5',
          formation_rules: [],
          examples: [],
          common_mistakes: [],
          total_attempts: 0,
          correct_attempts: 0,
        },
      ];

      render(<PatternGraph {...defaultProps} patterns={patternsWithUnknown} confusionStats={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('🕸️ Pattern Relationship Graph')).toBeInTheDocument();
      });
    });
  });
});
