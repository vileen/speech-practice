import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGrammarCategorySelection } from '../../hooks/useGrammarCategorySelection';

const STORAGE_KEY = 'grammar_selected_categories';
const TEST_CATEGORIES = ['Particles', 'I-Adjectives', 'Na-Adjectives', 'Desire', 'Ability'];

describe('useGrammarCategorySelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should auto-select all categories when localStorage is empty', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));
      expect(result.current.selectedCategories).toEqual(TEST_CATEGORIES);
    });

    it('should load selected categories from localStorage', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return JSON.stringify(['Particles', 'Desire']);
        return null;
      });

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));
      expect(result.current.selectedCategories).toEqual(['Particles', 'Desire']);
    });

    it('should initialize with activeGroup as null before effect runs', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));
      expect(result.current.expandedGroup).toBeNull();
    });

    it('should initialize with expandedGroup as null', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));
      expect(result.current.expandedGroup).toBeNull();
    });

    it('should handle invalid localStorage data gracefully', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return 'invalid-json';
        return null;
      });

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));
      // Invalid JSON returns [], and auto-select is skipped because localStorage has a value
      expect(result.current.selectedCategories).toEqual([]);
    });

    it('should handle non-array localStorage data gracefully', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return JSON.stringify({ notAnArray: true });
        return null;
      });

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));
      // Non-array returns [], and auto-select is skipped because localStorage has a value
      expect(result.current.selectedCategories).toEqual([]);
    });

    it('should NOT auto-select when localStorage has saved data', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return JSON.stringify(['Particles']);
        return null;
      });

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));
      expect(result.current.selectedCategories).toEqual(['Particles']);
    });

    it('should NOT auto-select when categories array is empty', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection([]));
      expect(result.current.selectedCategories).toEqual([]);
    });
  });

  describe('localStorage Persistence', () => {
    it('should save to localStorage when categories are toggled', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // Clear mocks after initial render (useEffect runs on mount and saves)
      vi.mocked(localStorage.setItem).mockClear();

      act(() => {
        result.current.toggleCategory('Particles');
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );
    });

    it('should persist selected categories across re-renders', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result, rerender } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.deselectAllCategories();
      });

      rerender();

      expect(result.current.selectedCategories).toEqual([]);
    });
  });

  describe('toggleCategory', () => {
    it('should add a category when not selected', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // Start with all selected, deselect first
      act(() => {
        result.current.deselectAllCategories();
      });

      act(() => {
        result.current.toggleCategory('Particles');
      });

      expect(result.current.selectedCategories).toContain('Particles');
    });

    it('should remove a category when already selected', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.toggleCategory('Particles');
      });

      expect(result.current.selectedCategories).not.toContain('Particles');
    });

    it('should toggle multiple categories independently', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.toggleCategory('Particles');
      });
      expect(result.current.selectedCategories).not.toContain('Particles');

      act(() => {
        result.current.toggleCategory('Desire');
      });
      expect(result.current.selectedCategories).not.toContain('Desire');

      // Re-add one
      act(() => {
        result.current.toggleCategory('Particles');
      });
      expect(result.current.selectedCategories).toContain('Particles');
      expect(result.current.selectedCategories).not.toContain('Desire');
    });
  });

  describe('selectAllCategories', () => {
    it('should select all categories', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // First deselect some
      act(() => {
        result.current.deselectAllCategories();
      });
      expect(result.current.selectedCategories).toEqual([]);

      // Then select all
      act(() => {
        result.current.selectAllCategories();
      });

      expect(result.current.selectedCategories).toEqual(TEST_CATEGORIES);
    });

    it('should set activeGroup when all categories are selected', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // Start with some selected, then select all
      act(() => {
        result.current.deselectAllCategories();
      });

      act(() => {
        result.current.selectAllCategories();
      });

      expect(result.current.activeGroup).toBe('all');
    });
  });

  describe('deselectAllCategories', () => {
    it('should clear all selected categories', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.deselectAllCategories();
      });

      expect(result.current.selectedCategories).toEqual([]);
    });

    it('should set activeGroup to null when all deselected', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.deselectAllCategories();
      });

      // Wait for useEffect to run and update activeGroup
      expect(result.current.activeGroup).toBeNull();
    });
  });

  describe('clearCategorySelection', () => {
    it('should clear all categories and reset activeGroup', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.clearCategorySelection();
      });

      expect(result.current.selectedCategories).toEqual([]);
      expect(result.current.activeGroup).toBeNull();
    });
  });

  describe('selectGroupCategories', () => {
    it('should select categories for a specific group', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.selectGroupCategories('particles');
      });

      expect(result.current.selectedCategories).toEqual(['Particles']);
      expect(result.current.activeGroup).toBe('particles');
    });

    it('should select all categories when "all" group is chosen', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // First deselect all
      act(() => {
        result.current.deselectAllCategories();
      });

      act(() => {
        result.current.selectGroupCategories('all');
      });

      expect(result.current.selectedCategories).toEqual(TEST_CATEGORIES);
      expect(result.current.activeGroup).toBe('all');
    });

    it('should collapse expanded group after selection', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // Set expanded group first
      act(() => {
        result.current.setExpandedGroup('groups');
      });

      act(() => {
        result.current.selectGroupCategories('particles');
      });

      expect(result.current.expandedGroup).toBeNull();
    });

    it('should alert when group has no matching categories', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      const { result } = renderHook(() => useGrammarCategorySelection(['SomeOtherCategory']));

      act(() => {
        result.current.selectGroupCategories('particles');
      });

      expect(window.alert).toHaveBeenCalledWith('No categories found for "Particles"');
    });

    it('should do nothing for invalid group key', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return JSON.stringify(TEST_CATEGORIES);
        return null;
      });

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.selectGroupCategories('nonexistent');
      });

      // Should not change selection
      expect(result.current.selectedCategories).toEqual(TEST_CATEGORIES);
    });
  });

  describe('Active Group Detection', () => {
    it('should detect "all" group as active when all categories selected', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // All categories are auto-selected
      expect(result.current.activeGroup).toBe('all');
    });

    it('should detect "particles" group as active when only Particles selected', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.deselectAllCategories();
      });

      act(() => {
        result.current.toggleCategory('Particles');
      });

      expect(result.current.activeGroup).toBe('particles');
    });

    it('should set activeGroup to null for partial selections', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // Remove one category from full selection
      act(() => {
        result.current.toggleCategory('Particles');
      });

      expect(result.current.activeGroup).toBeNull();
    });
  });

  describe('expandedGroup', () => {
    it('should update expandedGroup when setExpandedGroup is called', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      act(() => {
        result.current.setExpandedGroup('groups');
      });

      expect(result.current.expandedGroup).toBe('groups');

      act(() => {
        result.current.setExpandedGroup(null);
      });

      expect(result.current.expandedGroup).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty categories array', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection([]));

      expect(result.current.selectedCategories).toEqual([]);
      expect(result.current.activeGroup).toBeNull();
    });

    it('should handle category toggle with empty initial state', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // Clear and toggle
      act(() => {
        result.current.deselectAllCategories();
      });

      act(() => {
        result.current.toggleCategory('Particles');
      });

      expect(result.current.selectedCategories).toEqual(['Particles']);
    });

    it('should persist changes through multiple operations', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useGrammarCategorySelection(TEST_CATEGORIES));

      // Deselect all
      act(() => {
        result.current.deselectAllCategories();
      });

      // Select specific group
      act(() => {
        result.current.selectGroupCategories('particles');
      });

      // Toggle another category
      act(() => {
        result.current.toggleCategory('I-Adjectives');
      });

      expect(result.current.selectedCategories).toContain('Particles');
      expect(result.current.selectedCategories).toContain('I-Adjectives');
    });
  });
});
