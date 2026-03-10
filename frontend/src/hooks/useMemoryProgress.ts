import { useState, useEffect, useCallback } from 'react';
import { Card, createCard, reviewCard, getDueCards, Rating, getIntervalPreview } from '../lib/fsrs';
import type { Lesson } from '../types/index.js';

const STORAGE_KEY = 'speech-practice-memory-progress';

export interface MemoryCard extends Card {
  phraseId: string;
  phraseType: 'vocabulary' | 'grammar';
  lessonId: string;
  // Original phrase data (for display)
  jp: string;
  en: string;
  reading?: string;
  romaji?: string;
}

export interface MemoryProgress {
  cards: MemoryCard[];
  lastSynced: string;
}

export function useMemoryProgress() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dueCount, setDueCount] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: MemoryProgress = JSON.parse(stored);
        // Revive dates from JSON
        const revivedCards = parsed.cards.map(card => ({
          ...card,
          due: new Date(card.due),
          lastReview: card.lastReview ? new Date(card.lastReview) : undefined,
        }));
        setCards(revivedCards);
      } catch (e) {
        console.error('Failed to load memory progress:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever cards change
  useEffect(() => {
    if (!isLoading) {
      const progress: MemoryProgress = {
        cards,
        lastSynced: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [cards, isLoading]);

  // Calculate due count
  useEffect(() => {
    const due = getDueCards(cards);
    setDueCount(due.length);
  }, [cards]);

  // Add new card from phrase
  const addCard = useCallback((phrase: {
    id: string;
    type: 'vocabulary' | 'grammar';
    lessonId: string;
    jp: string;
    en: string;
    reading?: string;
    romaji?: string;
  }): MemoryCard => {
    const existing = cards.find(c => c.phraseId === phrase.id);
    if (existing) return existing;

    const newCard: MemoryCard = {
      ...createCard(phrase.id),
      phraseId: phrase.id,
      phraseType: phrase.type,
      lessonId: phrase.lessonId,
      jp: phrase.jp,
      en: phrase.en,
      reading: phrase.reading,
      romaji: phrase.romaji,
    };
    
    setCards(prev => [...prev, newCard]);
    return newCard;
  }, [cards]);

  // Review a card
  const review = useCallback((cardId: string, rating: Rating) => {
    setCards(prev => prev.map(card => {
      if (card.phraseId === cardId) {
        const fsrsCard = reviewCard(card, rating);
        return { ...card, ...fsrsCard };
      }
      return card;
    }));
  }, []);

  // Get next card to review (due cards first, then new cards)
  const getNextCard = useCallback((): MemoryCard | null => {
    const now = new Date();
    
    // First, get due cards
    const dueCards = cards.filter(c => c.due <= now && c.state !== 'new');
    if (dueCards.length > 0) {
      // Sort by due date (oldest first)
      dueCards.sort((a, b) => a.due.getTime() - b.due.getTime());
      return dueCards[0];
    }
    
    // Then, get new cards
    const newCards = cards.filter(c => c.state === 'new');
    if (newCards.length > 0) {
      return newCards[0];
    }
    
    return null;
  }, [cards]);

  // Get interval preview for UI
  const getPreview = useCallback((cardId: string, rating: Rating): number => {
    const card = cards.find(c => c.phraseId === cardId);
    if (!card) return 0;
    return getIntervalPreview(card, rating);
  }, [cards]);

  // Get stats
  const stats = {
    total: cards.length,
    new: cards.filter(c => c.state === 'new').length,
    learning: cards.filter(c => c.state === 'learning').length,
    review: cards.filter(c => c.state === 'review').length,
    relearning: cards.filter(c => c.state === 'relearning').length,
    due: dueCount,
  };

  // Reset all progress (for testing/debug)
  const resetProgress = useCallback(() => {
    setCards([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Import cards from lesson
  const importFromLesson = useCallback((lesson: Lesson) => {
    const newCards: MemoryCard[] = [];
    
    // Import vocabulary
    lesson.vocabulary?.forEach((vocab, index) => {
      const id = `lesson-${lesson.id}-vocab-${index}`;
      if (!cards.find(c => c.phraseId === id)) {
        newCards.push({
          ...createCard(id),
          phraseId: id,
          phraseType: 'vocabulary',
          lessonId: lesson.id,
          jp: vocab.jp,
          en: vocab.en,
          reading: vocab.reading,
          romaji: vocab.romaji,
        });
      }
    });
    
    // Import grammar (use first example or pattern)
    lesson.grammar?.forEach((grammar, index) => {
      const id = `lesson-${lesson.id}-grammar-${index}`;
      if (!cards.find(c => c.phraseId === id)) {
        const example = grammar.examples?.[0];
        newCards.push({
          ...createCard(id),
          phraseId: id,
          phraseType: 'grammar',
          lessonId: lesson.id,
          jp: example?.jp || grammar.pattern,
          en: example?.en || grammar.explanation,
          reading: undefined,
          romaji: undefined,
        });
      }
    });
    
    if (newCards.length > 0) {
      setCards(prev => [...prev, ...newCards]);
    }
    
    return newCards.length;
  }, [cards]);

  // Import unique vocabulary from lesson (words that first appeared in this lesson)
  const importUniqueVocabulary = useCallback(async (lessonId: string, password: string) => {
    const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');
    
    const response = await fetch(`${API_URL}/api/lessons/${lessonId}/unique-vocabulary`, {
      headers: {
        'X-Password': password,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch unique vocabulary');
    }
    
    const data = await response.json();
    const newCards: MemoryCard[] = [];
    
    // Import unique vocabulary
    data.vocabulary?.forEach((vocab: any, index: number) => {
      const id = `lesson-${lessonId}-vocab-${index}`;
      if (!cards.find(c => c.phraseId === id)) {
        newCards.push({
          ...createCard(id),
          phraseId: id,
          phraseType: 'vocabulary',
          lessonId: lessonId,
          jp: vocab.jp,
          en: vocab.en,
          reading: vocab.reading,
          romaji: vocab.romaji,
        });
      }
    });
    
    if (newCards.length > 0) {
      setCards(prev => [...prev, ...newCards]);
    }
    
    return {
      imported: newCards.length,
      total: data.totalVocab,
      unique: data.uniqueVocab,
    };
  }, [cards]);

  return {
    cards,
    isLoading,
    dueCount,
    stats,
    addCard,
    review,
    getNextCard,
    getPreview,
    resetProgress,
    importFromLesson,
    importUniqueVocabulary,
  };
}

export default useMemoryProgress;
