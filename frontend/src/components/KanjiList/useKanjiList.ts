import { useState, useEffect, useMemo, useCallback } from 'react';
import { API_URL } from '../../config/api.js';
import type { KanjiItem, Lesson, SortOrder } from './types';

const ALL_LESSONS_VALUE = '';

export { ALL_LESSONS_VALUE };
export type { SortOrder };

export const useKanjiList = () => {
  const [kanji, setKanji] = useState<KanjiItem[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(ALL_LESSONS_VALUE);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    let cancelled = false;

    const fetchLessons = async () => {
      try {
        const response = await fetch(`${API_URL}/api/lessons`);
        if (!response.ok) {
          throw new Error(`Failed to fetch lessons: ${response.status}`);
        }
        const data = await response.json();
        if (!cancelled) {
          const sortedLessons = (data.lessons || []).sort((a: Lesson, b: Lesson) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setLessons(sortedLessons);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      }
    };

    fetchLessons();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchKanji = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (selectedLessonId) {
          params.append('lessonId', selectedLessonId);
        }
        params.append('sort', sortOrder === 'newest' ? 'desc' : 'asc');
        const queryString = params.toString();
        const response = await fetch(`${API_URL}/api/kanji${queryString ? `?${queryString}` : ''}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch kanji: ${response.status}`);
        }
        const data = await response.json();
        if (!cancelled) {
          setKanji(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch kanji');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchKanji();
    return () => { cancelled = true; };
  }, [selectedLessonId, sortOrder]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleLessonChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLessonId(e.target.value);
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as SortOrder);
  }, []);

  const filteredKanji = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return kanji;
    return kanji.filter((item) => {
      const matchesCharacter = item.character.includes(query);
      const matchesMeaning = item.meanings.some((meaning) =>
        meaning.toLowerCase().includes(query)
      );
      const matchesReading = item.readings.some((reading) =>
        reading.reading.toLowerCase().includes(query)
      );
      return matchesCharacter || matchesMeaning || matchesReading;
    });
  }, [kanji, search]);

  return {
    lessons,
    isLoading,
    error,
    search,
    selectedLessonId,
    sortOrder,
    filteredKanji,
    handleSearchChange,
    handleLessonChange,
    handleSortChange,
  };
};
