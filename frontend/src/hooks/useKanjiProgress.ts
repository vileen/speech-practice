import { useState, useEffect, useCallback } from 'react';
import { Card, createCard, reviewCard, getDueCards, Rating, getIntervalPreview } from '../lib/fsrs';

const STORAGE_KEY = 'speech-practice-kanji-progress';

export interface KanjiCard extends Card {
  kanjiId: string;
  character: string;
  meanings: string[];
  readings: { type: 'kun' | 'on'; reading: string }[];
  lessonId?: string;
  mnemonic?: string;
  examples: { word: string; reading: string; meaning: string }[];
  strokeCount?: number;
}

export interface KanjiProgress {
  cards: KanjiCard[];
  lastSynced: string;
}

export function useKanjiProgress() {
  const [cards, setCards] = useState<KanjiCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dueCount, setDueCount] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: KanjiProgress = JSON.parse(stored);
        const revivedCards = parsed.cards.map(card => ({
          ...card,
          due: new Date(card.due),
          lastReview: card.lastReview ? new Date(card.lastReview) : undefined,
        }));
        setCards(revivedCards);
      } catch (e) {
        console.error('Failed to load kanji progress:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      const progress: KanjiProgress = {
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

  // Add new kanji card
  const addCard = useCallback((kanji: {
    id: string;
    character: string;
    meanings: string[];
    readings: { type: 'kun' | 'on'; reading: string }[];
    lessonId?: string;
    mnemonic?: string;
    examples?: { word: string; reading: string; meaning: string }[];
    strokeCount?: number;
  }): KanjiCard => {
    const existing = cards.find(c => c.kanjiId === kanji.id);
    if (existing) return existing;

    const newCard: KanjiCard = {
      ...createCard(kanji.id),
      kanjiId: kanji.id,
      character: kanji.character,
      meanings: kanji.meanings,
      readings: kanji.readings,
      lessonId: kanji.lessonId,
      mnemonic: kanji.mnemonic,
      examples: kanji.examples || [],
      strokeCount: kanji.strokeCount,
    };
    
    setCards(prev => [...prev, newCard]);
    return newCard;
  }, [cards]);

  // Review a card
  const review = useCallback((cardId: string, rating: Rating) => {
    setCards(prev => prev.map(card => {
      if (card.kanjiId === cardId) {
        const fsrsCard = reviewCard(card, rating);
        return { ...card, ...fsrsCard };
      }
      return card;
    }));
  }, []);

  // Get next due card
  const getNextCard = useCallback((): KanjiCard | null => {
    const due = getDueCards(cards);
    if (due.length === 0) return null;
    
    // Pick random from due cards
    const randomIndex = Math.floor(Math.random() * due.length);
    return due[randomIndex] as KanjiCard;
  }, [cards]);

  // Get preview of what will happen with each rating
  const getPreview = useCallback((cardId: string, rating: Rating): number | null => {
    const card = cards.find(c => c.kanjiId === cardId);
    if (!card) return null;
    return getIntervalPreview(card, rating);
  }, [cards]);

  // Import kanji from API
  const importKanji = useCallback(async (filters?: { lessonId?: string; limit?: number }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.lessonId) params.append('lessonId', filters.lessonId);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await fetch(`/api/kanji?${params}`);
      if (!response.ok) throw new Error('Failed to fetch kanji');
      
      const kanjiList = await response.json();
      const addedCards: KanjiCard[] = [];
      
      for (const kanji of kanjiList) {
        const card = addCard({
          id: kanji.id,
          character: kanji.character,
          meanings: kanji.meanings,
          readings: kanji.readings,
          lessonId: kanji.lesson_id,
          mnemonic: kanji.mnemonic,
          examples: kanji.examples,
          strokeCount: kanji.stroke_count,
        });
        addedCards.push(card);
      }
      
      return addedCards;
    } catch (error) {
      console.error('Failed to import kanji:', error);
      return [];
    }
  }, [addCard]);

  // Get available lessons from cards
  const getAvailableLessons = useCallback(() => {
    const lessons = new Set<string>();
    cards.forEach(card => {
      if (card.lessonId) lessons.add(card.lessonId);
    });
    return Array.from(lessons).sort();
  }, [cards]);

  // Filter cards by lesson
  const getCardsByLesson = useCallback((lessonId: string) => {
    return cards.filter(card => card.lessonId === lessonId);
  }, [cards]);

  // Get stats
  const stats = {
    total: cards.length,
    due: dueCount,
    new: cards.filter(c => c.reps === 0).length,
    learning: cards.filter(c => c.reps > 0 && c.state === 'learning').length,
    review: cards.filter(c => c.state === 'review').length,
  };

  return {
    cards,
    isLoading,
    stats,
    dueCount,
    review,
    getNextCard,
    getPreview,
    importKanji,
    addCard,
    getAvailableLessons,
    getCardsByLesson,
  };
}
