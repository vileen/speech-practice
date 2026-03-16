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
}

export function LessonList() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setLessons(data.lessons || data);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load lessons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
      <Header title="Lessons" icon="📚" onBack={() => navigate('/')} />
      <main>
        <div className="lesson-list">
          <h2>Select a Lesson</h2>
          
          {lessons.length === 0 ? (
            <p className="no-lessons">No lessons available.</p>
          ) : (
            <div className="lessons-grid">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  className="lesson-card"
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                >
                  <div className="lesson-number">#{index + 1}</div>
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
