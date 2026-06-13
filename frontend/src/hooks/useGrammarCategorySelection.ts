import { useState, useEffect, useCallback } from 'react';
import { CATEGORY_GROUPS } from '../components/GrammarMode/PatternSelection.js';

const STORAGE_KEY = 'grammar_selected_categories';

export function useGrammarCategorySelection(categories: string[]) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved categories:', e);
      }
    }
    return [];
  });
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Select all categories by default when categories are loaded and nothing saved
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setSelectedCategories(categories);
      }
    }
  }, [categories]);

  // Save selected categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  const isGroupActive = useCallback((groupKey: string): boolean => {
    const group = CATEGORY_GROUPS[groupKey];
    if (!group) return false;

    const groupCategories = groupKey === 'all'
      ? categories
      : group.categories.filter(cat => categories.includes(cat));

    if (groupCategories.length === 0) return false;
    if (selectedCategories.length !== groupCategories.length) return false;

    return groupCategories.every(cat => selectedCategories.includes(cat));
  }, [categories, selectedCategories]);

  // Update active group when categories change manually
  useEffect(() => {
    for (const [key] of Object.entries(CATEGORY_GROUPS)) {
      if (isGroupActive(key)) {
        setActiveGroup(key);
        return;
      }
    }
    setActiveGroup(null);
  }, [selectedCategories, categories, isGroupActive]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const selectAllCategories = useCallback(() => {
    setSelectedCategories(categories);
  }, [categories]);

  const deselectAllCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const clearCategorySelection = useCallback(() => {
    setSelectedCategories([]);
    setActiveGroup(null);
  }, []);

  const selectGroupCategories = useCallback((groupKey: string) => {
    const group = CATEGORY_GROUPS[groupKey];
    if (!group) return;

    let groupCategories: string[];
    if (groupKey === 'all') {
      groupCategories = categories;
    } else {
      // Only include categories that actually exist in the data
      groupCategories = group.categories.filter(cat => categories.includes(cat));
    }

    if (groupCategories.length === 0) {
      alert(`No categories found for "${group.name}"`);
      return;
    }

    setSelectedCategories(groupCategories);
    setActiveGroup(groupKey);
    setExpandedGroup(null); // Collapse accordion after selection
  }, [categories]);

  return {
    selectedCategories,
    activeGroup,
    expandedGroup,
    setExpandedGroup,
    toggleCategory,
    selectAllCategories,
    deselectAllCategories,
    clearCategorySelection,
    selectGroupCategories,
  };
}
