import React from 'react';
import { useKanjiList, ALL_LESSONS_VALUE } from './useKanjiList';
import { KanjiListItem } from './KanjiListItem';
import './KanjiList.css';

interface KanjiListProps {
  onStartPractice?: () => void;
}

export const KanjiList: React.FC<KanjiListProps> = ({ onStartPractice }) => {
  const {
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
  } = useKanjiList();

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
                {new Date(lesson.date).toLocaleDateString('pl-PL')} — {lesson.title}
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
