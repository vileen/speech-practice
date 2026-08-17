import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { API_URL } from '../../config/api.js';
import './KanjiList.css';

interface KanjiReading {
  type: 'kun' | 'on';
  reading: string;
}

interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

interface KanjiItem {
  id: string;
  character: string;
  meanings: string[];
  readings: KanjiReading[];
  lesson_id?: string;
  mnemonic?: string;
  stroke_count?: number;
  jlpt_level?: string;
  examples: KanjiExample[];
}

interface Lesson {
  id: string;
  date: string;
  title: string;
}

interface KanjiListProps {
  onStartPractice?: () => void;
}

type SortOrder = 'newest' | 'oldest';

const ALL_LESSONS_VALUE = '';

export const KanjiList: React.FC<KanjiListProps> = ({ onStartPractice }) => {
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
          setLessons(data.lessons || []);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      }
    };

    fetchLessons();
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

  if (isLoading) {
    return (
      <div className="kanji-list-loading">
        <div className="spinner" />
        <p>Loading kanji...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanji-list-error">
        <p className="kanji-list-error-title">❌ Error loading kanji</p>
        <p className="kanji-list-error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="kanji-list">
      {onStartPractice && (
        <div className="kanji-list-actions">
          <button
            className="kanji-list-start-btn"
            onClick={onStartPractice}
            aria-label="Start practice"
          >
            🎯 Start Practice
          </button>
        </div>
      )}
      <div className="kanji-list-controls">
        <input
          type="text"
          className="kanji-list-search"
          placeholder="Search by character, meaning, or reading..."
          value={search}
          onChange={handleSearchChange}
          aria-label="Search kanji"
        />
        <div className="kanji-list-filters">
          <select
            className="kanji-list-select"
            value={selectedLessonId}
            onChange={handleLessonChange}
            aria-label="Filter by lesson"
          >
            <option value={ALL_LESSONS_VALUE}>All lessons</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.date} — {lesson.title}
              </option>
            ))}
          </select>
          <select
            className="kanji-list-select"
            value={sortOrder}
            onChange={handleSortChange}
            aria-label="Sort order"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <div className="kanji-list-count">
          {filteredKanji.length} {filteredKanji.length === 1 ? 'kanji' : 'kanji'}
        </div>
      </div>

      {filteredKanji.length === 0 ? (
        <div className="kanji-list-empty">
          <p>No kanji found.</p>
        </div>
      ) : (
        <div className="kanji-list-grid">
          {filteredKanji.map((item) => (
            <KanjiListItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

const KanjiListItem: React.FC<{ item: KanjiItem }> = ({ item }) => {
  const kunyomi = item.readings.filter((r) => r.type === 'kun');
  const onyomi = item.readings.filter((r) => r.type === 'on');

  return (
    <article className="kanji-list-card">
      <div className="kanji-list-card-header">
        <div className="kanji-list-character">{item.character}</div>
        <div className="kanji-list-meta">
          {item.jlpt_level && (
            <span className="kanji-list-badge jlpt">JLPT {item.jlpt_level}</span>
          )}
          {item.stroke_count && (
            <span className="kanji-list-badge strokes">{item.stroke_count} strokes</span>
          )}
          {item.lesson_id && (
            <span className="kanji-list-badge lesson">Lesson {item.lesson_id}</span>
          )}
        </div>
      </div>

      <div className="kanji-list-card-body">
        <div className="kanji-list-section">
          <h3>Meanings</h3>
          <div className="kanji-list-meanings">
            {item.meanings.map((meaning, idx) => (
              <span key={idx} className="kanji-list-meaning">
                {meaning}
              </span>
            ))}
          </div>
        </div>

        <div className="kanji-list-section">
          <h3>Readings</h3>
          <div className="kanji-list-readings">
            {kunyomi.length > 0 && (
              <div className="kanji-list-reading-group">
                <span className="kanji-list-reading-label kunyomi">Kunyomi</span>
                <div className="kanji-list-reading-tags">
                  {kunyomi.map((r, idx) => (
                    <span key={`kun-${idx}`} className="kanji-list-reading-tag kunyomi">
                      {r.reading}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onyomi.length > 0 && (
              <div className="kanji-list-reading-group">
                <span className="kanji-list-reading-label onyomi">Onyomi</span>
                <div className="kanji-list-reading-tags">
                  {onyomi.map((r, idx) => (
                    <span key={`on-${idx}`} className="kanji-list-reading-tag onyomi">
                      {r.reading}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {item.examples && item.examples.length > 0 && (
          <div className="kanji-list-section">
            <h3>Examples</h3>
            <ul className="kanji-list-examples">
              {item.examples.map((ex, idx) => (
                <li key={idx} className="kanji-list-example">
                  <span className="kanji-list-example-word">{ex.word}</span>
                  <span className="kanji-list-example-reading">({ex.reading})</span>
                  <span className="kanji-list-example-meaning">— {ex.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
};
