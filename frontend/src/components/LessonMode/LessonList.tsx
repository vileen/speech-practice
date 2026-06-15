import { Header } from '../Header/index.js';
import { formatDate, type Lesson } from '../../hooks/useLessonMode.js';
import { translateLessonTitle } from '../../translations.js';
import './LessonMode.css';

export interface LessonListProps {
  lessons: Lesson[];
  sortedLessons: Lesson[];
  allTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[] | ((prev: string[]) => string[])) => void;
  sortOrder: 'newest' | 'oldest';
  setSortOrder: (order: 'newest' | 'oldest') => void;
  onBack: () => void;
  onLessonClick: (lessonId: string) => void;
  lessonsListRef: React.RefObject<HTMLDivElement>;
}

export function LessonList({
  sortedLessons,
  allTags,
  selectedTags,
  setSelectedTags,
  sortOrder,
  setSortOrder,
  onBack,
  onLessonClick,
  lessonsListRef,
}: LessonListProps) {
  return (
    <div className="lesson-mode">
      <Header
        title="Lessons"
        icon="📚"
        onBack={onBack}
        actions={
          <div className="sort-controls">
            <button
              className={sortOrder === 'newest' ? 'active' : ''}
              onClick={() => setSortOrder('newest')}
            >
              Newest
            </button>
            <button
              className={sortOrder === 'oldest' ? 'active' : ''}
              onClick={() => setSortOrder('oldest')}
            >
              Oldest
            </button>
          </div>
        }
      />

      {allTags.length > 0 && (
        <div className="tag-filters">
          <div className="tag-filters-header">
            <span>Filter by tag:</span>
            {selectedTags.length > 0 && (
              <button
                className="clear-filters"
                onClick={() => setSelectedTags([])}
              >
                Clear ({selectedTags.length})
              </button>
            )}
          </div>
          <div className="tag-chips">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(prev => prev.filter(t => t !== tag));
                  } else {
                    setSelectedTags(prev => [...prev, tag]);
                  }
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="results-count">
          Showing {sortedLessons.length} of {sortedLessons.length} lessons
        </div>
      )}

      <div className="lessons-list" ref={lessonsListRef}>
        {sortedLessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="lesson-card"
            onClick={() => onLessonClick(lesson.id)}
          >
            <div className="lesson-card-header">
              <span className="lesson-date">{formatDate(lesson.date)}</span>
              <span className="lesson-number">Lesson #{sortOrder === 'newest' ? sortedLessons.length - index : index + 1}</span>
              <span className="lesson-title">{translateLessonTitle(lesson.title)}</span>
            </div>
            <div className="lesson-card-stats">
              <span>📝 {lesson.vocabCount} words</span>
              <span>📖 {lesson.grammarCount} grammar</span>
            </div>
            {lesson.topics.length > 0 && (
              <div className="lesson-topics">
                {lesson.topics.slice(0, 3).join(', ')}
                {lesson.topics.length > 3 && '...'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
