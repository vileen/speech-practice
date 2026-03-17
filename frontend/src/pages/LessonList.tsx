import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header/index.js';
import { API_URL, getPassword } from '../config/api.js';
import './LessonList.css';

interface Lesson {
  id: string;
  title: string;
  date: string;
  topics: string[];
  lessonNumber?: number;
}

type SortOrder = 'newest' | 'oldest';

export function LessonList() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${API_URL}/api/lessons`, {
          headers: {
            'X-Password': getPassword(),
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }
        
        const data = await response.json();
        const lessonsArray = data.lessons || data;
        setLessons(lessonsArray);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load lessons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Get all unique tags from lessons
  const allTags = Array.from(new Set(lessons.flatMap(l => l.topics || []))).sort();

  // Filter lessons by selected tags
  const filteredLessons = selectedTags.length > 0
    ? lessons.filter(lesson => selectedTags.some(tag => (lesson.topics || []).includes(tag)))
    : lessons;

  // Assign lesson numbers based on chronological order (oldest = #1)
  const lessonsWithNumbers = [...filteredLessons]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((lesson, index) => ({ ...lesson, lessonNumber: index + 1 }));

  // Then sort for display based on user preference
  const sortedLessons = [...lessonsWithNumbers].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const sortButtons = (
    <div className="lesson-sort-buttons">
      <button
        className={sortOrder === 'newest' ? 'active' : ''}
        onClick={() => setSortOrder('newest')}
        title="Newest first"
      >
        ↓ Newest
      </button>
      <button
        className={sortOrder === 'oldest' ? 'active' : ''}
        onClick={() => setSortOrder('oldest')}
        title="Oldest first"
      >
        ↑ Oldest
      </button>
    </div>
  );

  // Render selected tags summary for accordion header
  const renderSelectedTagsSummary = () => {
    if (selectedTags.length === 0) {
      return <span className="tags-summary-placeholder">All lessons</span>;
    }
    
    const maxVisible = 2;
    const visibleTags = selectedTags.slice(0, maxVisible);
    const remainingCount = selectedTags.length - maxVisible;
    
    return (
      <div className="tags-summary">
        {visibleTags.map(tag => (
          <span key={tag} className="tags-summary-tag">{tag}</span>
        ))}
        {remainingCount > 0 && (
          <span className="tags-summary-more">+{remainingCount}</span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="app">
        <Header title="Lessons" icon="📚" onBack={() => navigate('/')} />
        <main>
          <div className="lesson-list-loading">
            <div className="spinner">Loading lessons...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header title="Lessons" icon="📚" onBack={() => navigate('/')} />
        <main>
          <div className="lesson-list-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header title="Lessons" icon="📚" onBack={() => navigate('/')} actions={sortButtons} />
      <main>
        <div className="lesson-list">
          {/* Tag Filters Accordion */}
          {allTags.length > 0 && (
            <div className={`tag-filters-accordion ${isAccordionOpen ? 'open' : ''}`}>
              <button 
                className="tag-filters-header"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              >
                <div className="tag-filters-header-content">
                  <span className="tag-filters-label">Tags:</span>
                  {renderSelectedTagsSummary()}
                </div>
                <div className="tag-filters-header-actions">
                  {selectedTags.length > 0 && (
                    <span 
                      className="tag-filters-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTags([]);
                      }}
                    >
                      Clear
                    </span>
                  )}
                  <span className={`accordion-arrow ${isAccordionOpen ? 'open' : ''}`}>▼</span>
                </div>
              </button>
              
              {isAccordionOpen && (
                <div className="tag-filters-content">
                  <div className="tag-filters-results">
                    Showing {sortedLessons.length} of {lessons.length} lessons
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
            </div>
          )}

          <h2>Select a Lesson</h2>

          {sortedLessons.length === 0 ? (
            <p className="no-lessons">No lessons available.</p>
          ) : (
            <div className="lessons-grid">
              {sortedLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className="lesson-card"
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                >
                  <div className="lesson-number">#{lesson.lessonNumber}</div>
                  <div className="lesson-info">
                    <h3>{lesson.title}</h3>
                    <p className="lesson-date">{formatDate(lesson.date)}</p>
                    <div className="lesson-topics">
                      {lesson.topics?.map((topic) => (
                        <span key={topic} className="topic-tag">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
