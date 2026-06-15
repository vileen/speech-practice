import { useEffect, useState, useRef } from 'react';
import { API_URL } from '../config/api.js';

export interface Lesson {
  id: string;
  date: string;
  title: string;
  order: number;
  topics: string[];
  vocabCount: number;
  grammarCount: number;
}

export interface LessonDetail {
  id: string;
  date: string;
  title: string;
  topics: string[];
  vocabulary: Array<{
    jp: string;
    reading: string;
    romaji: string;
    en: string;
    type?: string;
    furigana?: string | null;
  }>;
  grammar: Array<{
    pattern: string;
    explanation: string;
    romaji?: string;
    examples: Array<{ jp: string; en: string; furigana?: string | null }>;
  }>;
  practice_phrases: Array<{ jp: string; en: string; romaji?: string; furigana?: string | null }>;
}

export function useLessonMode(
  password: string,
  selectedLessonId: string | undefined,
  onSelectLesson: (lessonId: string | null) => void
) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const scrollPositionRef = useRef<number>(0);
  const lessonsListRef = useRef<HTMLDivElement>(null);
  const lastLoadedLessonRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedLessonId) {
      if (lastLoadedLessonRef.current !== selectedLessonId) {
        lastLoadedLessonRef.current = selectedLessonId;
        loadLessonDetail(selectedLessonId, false, false);
      }
    } else if (!selectedLessonId) {
      lastLoadedLessonRef.current = null;
      setSelectedLesson(null);
      setTimeout(() => {
        if (lessonsListRef.current) {
          lessonsListRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 0);
    }
  }, [selectedLessonId]);

  useEffect(() => {
    if (!selectedLessonId) {
      loadLessons();
    }
  }, []);

  const loadLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/api/lessons`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        const sorted = data.lessons.sort((a: Lesson, b: Lesson) => b.order - a.order);
        setLessons(sorted);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessonDetail = async (id: string, saveScroll = true, notifyParent = true) => {
    if (saveScroll && lessonsListRef.current) {
      scrollPositionRef.current = lessonsListRef.current.scrollTop;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/lessons/${id}?furigana=true`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedLesson(data);
        if (notifyParent) {
          onSelectLesson(id);
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    onSelectLesson(lessonId);
  };

  const handleBackToList = () => {
    setSelectedLesson(null);
    onSelectLesson(null);
  };

  const allTags = Array.isArray(lessons)
    ? Array.from(new Set(lessons.flatMap(l => l.topics || []))).sort()
    : [];

  const filteredLessons = Array.isArray(lessons)
    ? lessons.filter(lesson => {
        if (selectedTags.length === 0) return true;
        const lessonTags = lesson.topics || [];
        return selectedTags.some(tag => lessonTags.includes(tag));
      })
    : [];

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return {
    lessons,
    selectedLesson,
    loading,
    sortOrder,
    setSortOrder,
    selectedTags,
    setSelectedTags,
    allTags,
    sortedLessons,
    lessonsListRef,
    handleLessonClick,
    handleBackToList,
    loadLessonDetail,
  };
}

// Format date to YYYY-MM-DD (local timezone)
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}
