import { useState, useEffect } from 'react';
import { API_URL } from '../config/api.js';

export interface OverviewStats {
  studyTime: {
    thisWeek: number;
    allTime: number;
    unit: string;
  };
  streak: number;
  grammar: {
    mastered: number;
    total: number;
  };
  kanji: {
    learned: number;
    total: number;
  };
  lessons: {
    completed: number;
    total: number;
  };
}

export interface JLPTLevel {
  level: string;
  grammar: {
    total: number;
    mastered: number;
    percentage: number;
  };
  kanji: {
    total: number;
    mastered: number;
    percentage: number;
  };
  overall: {
    total: number;
    mastered: number;
    percentage: number;
  };
}

export interface WeakCategory {
  category: string;
  accuracy: number;
  totalPatterns: number;
  totalAttempts: number;
}

export interface WeakPattern {
  id: number;
  pattern: string;
  category: string;
  jlptLevel: string;
  accuracy: number;
  attempts: number;
  correct: number;
}

export interface ConfusedPair {
  patternId: number;
  patternName: string;
  patternCategory: string;
  confusedWithId: number;
  confusedWithName: string;
  count: number;
}

export interface ActivityDay {
  date: string;
  grammarAttempts: number;
  kanjiAttempts: number;
  totalSessions: number;
}

export interface CategoryBreakdown {
  category: string;
  totalPatterns: number;
  totalAttempts: number;
  accuracy: number;
}

export const useProgressData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [jlptLevels, setJlptLevels] = useState<JLPTLevel[]>([]);
  const [weakCategories, setWeakCategories] = useState<WeakCategory[]>([]);
  const [weakPatterns, setWeakPatterns] = useState<WeakPattern[]>([]);
  const [confusedPairs, setConfusedPairs] = useState<ConfusedPair[]>([]);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overviewRes, levelsRes, weakPointsRes, activityRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/progress/overview`),
          fetch(`${API_URL}/api/progress/by-level`),
          fetch(`${API_URL}/api/progress/weak-points`),
          fetch(`${API_URL}/api/progress/activity`),
          fetch(`${API_URL}/api/progress/categories`)
        ]);

        if (!overviewRes.ok) throw new Error('Failed to fetch overview');
        if (!levelsRes.ok) throw new Error('Failed to fetch JLPT levels');
        if (!weakPointsRes.ok) throw new Error('Failed to fetch weak points');
        if (!activityRes.ok) throw new Error('Failed to fetch activity');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');

        const overviewData = await overviewRes.json();
        const levelsData = await levelsRes.json();
        const weakPointsData = await weakPointsRes.json();
        const activityData = await activityRes.json();
        const categoriesData = await categoriesRes.json();

        setOverview(overviewData);
        setJlptLevels(levelsData.levels);
        setWeakCategories(weakPointsData.weakCategories);
        setWeakPatterns(weakPointsData.weakPatterns);
        setConfusedPairs(weakPointsData.confusedPairs);
        setActivity(activityData.activity);
        setCategories(categoriesData.categories);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return {
    loading,
    error,
    overview,
    jlptLevels,
    weakCategories,
    weakPatterns,
    confusedPairs,
    activity,
    categories,
  };
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const getDayLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getStreakEmoji = (streak: number): string => {
  if (streak >= 30) return '🔥';
  if (streak >= 14) return '⚡';
  if (streak >= 7) return '💪';
  return '✨';
};

export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 80) return '#27ae60';
  if (accuracy >= 60) return '#f39c12';
  return '#e74c3c';
};

export const computeMaxActivity = (activity: ActivityDay[]): number => {
  return Math.max(...activity.map(d => d.totalSessions), 1);
};
