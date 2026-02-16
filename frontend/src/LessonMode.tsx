import { useState, useEffect } from 'react';
import './LessonMode.css';
import { translateLessonTitle } from './translations.js';

interface Lesson {
  id: string;
  date: string;
  title: string;
  order: number;
  topics: string[];
  vocabCount: number;
  grammarCount: number;
}

interface LessonDetail {
  id: string;
  date: string;
  title: string;
  topics: string[];
  vocabulary: Array<{
    jp: string;
    reading: string;
    en: string;
    type?: string;
  }>;
  grammar: Array<{
    pattern: string;
    explanation: string;
    examples: Array<{jp: string; en: string}>;
  }>;
  practice_phrases: string[];
}

const API_URL = 'https://eds-grow-delivered-spending.trycloudflare.com'.replace(/\/$/, '');

interface LessonModeProps {
  password: string;
  onBack: () => void;
  onStartLessonChat: (lessonId: string, lessonTitle: string) => void;
}

export function LessonMode({ password, onBack, onStartLessonChat }: LessonModeProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vocab' | 'grammar' | 'practice'>('overview');
  const [showFurigana, setShowFurigana] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/api/lessons`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        // Sort by date descending (most recent first)
        const sorted = data.lessons.sort((a: Lesson, b: Lesson) => b.order - a.order);
        setLessons(sorted);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessonDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/lessons/${id}`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedLesson(data);
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFurigana = (text: string) => {
    if (!showFurigana) return text;
    // Simple regex to replace known patterns - backend does full furigana
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  if (loading && lessons.length === 0) {
    return (
      <div className="lesson-mode">
        <div className="lesson-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h2>📚 Lesson Mode</h2>
        </div>
        <div className="loading">Loading lessons...</div>
      </div>
    );
  }

  if (selectedLesson) {
    return (
      <div className="lesson-mode">
        <div className="lesson-header">
          <button className="back-btn" onClick={() => setSelectedLesson(null)}>← All Lessons</button>
          <h2>{translateLessonTitle(selectedLesson.title)}</h2>
          <button 
            className="start-chat-btn"
            onClick={() => onStartLessonChat(selectedLesson.id, translateLessonTitle(selectedLesson.title))}
          >
            💬 Practice Conversation
          </button>
        </div>

        <div className="lesson-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'vocab' ? 'active' : ''} onClick={() => setActiveTab('vocab')}>Vocabulary ({selectedLesson.vocabulary.length})</button>
          <button className={activeTab === 'grammar' ? 'active' : ''} onClick={() => setActiveTab('grammar')}>Grammar ({selectedLesson.grammar.length})</button>
          <button className={activeTab === 'practice' ? 'active' : ''} onClick={() => setActiveTab('practice')}>Practice</button>
        </div>

        <div className="furigana-toggle">
          <label>
            <input type="checkbox" checked={showFurigana} onChange={(e) => setShowFurigana(e.target.checked)} />
            Show Furigana
          </label>
        </div>

        <div className="lesson-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-card">
                <h3>Lesson Info</h3>
                <p><strong>Date:</strong> {selectedLesson.date}</p>
                {selectedLesson.topics.length > 0 && (
                  <p><strong>Topics:</strong> {selectedLesson.topics.join(', ')}</p>
                )}
              </div>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-number">{selectedLesson.vocabulary.length}</span>
                  <span className="stat-label">Vocabulary Words</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{selectedLesson.grammar.length}</span>
                  <span className="stat-label">Grammar Points</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{selectedLesson.practice_phrases.length}</span>
                  <span className="stat-label">Practice Phrases</span>
                </div>
              </div>

              <div className="quick-start">
                <h3>Ready to practice?</h3>
                <button 
                  className="big-button"
                  onClick={() => onStartLessonChat(selectedLesson.id, selectedLesson.title)}
                >
                  💬 Start Conversation Practice
                </button>
              </div>
            </div>
          )}

          {activeTab === 'vocab' && (
            <div className="vocab-tab">
              <div className="vocab-grid">
                {selectedLesson.vocabulary.map((item, idx) => (
                  <div key={idx} className="vocab-card">
                    <div className="jp-word">{renderFurigana(item.jp)}</div>
                    <div className="reading">{item.reading}</div>
                    <div className="meaning">{item.en}</div>
                    {item.type && <span className="type-tag">{item.type}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'grammar' && (
            <div className="grammar-tab">
              {selectedLesson.grammar.map((point, idx) => (
                <div key={idx} className="grammar-card">
                  <h4>{point.pattern}</h4>
                  <p className="explanation">{point.explanation}</p>
                  {point.examples.length > 0 && (
                    <div className="examples">
                      <h5>Examples:</h5>
                      {point.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="example">
                          <span className="jp">{renderFurigana(ex.jp)}</span>
                          <span className="en">{ex.en}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="practice-tab">
              <h3>Practice Phrases</h3>
              <div className="phrases-list">
                {selectedLesson.practice_phrases.map((phrase, idx) => (
                  <div key={idx} className="phrase-item">
                    <span className="number">{idx + 1}.</span>
                    <span className="phrase">{renderFurigana(phrase)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-mode">
      <div className="lesson-header">
        <button className="back-btn" onClick={onBack}>← Back to Menu</button>
        <h2>📚 Lesson Mode</h2>
        <span className="lesson-count">{lessons.length} lessons available</span>
      </div>

      <div className="lessons-list">
        {lessons.map((lesson) => (
          <div 
            key={lesson.id} 
            className="lesson-card"
            onClick={() => loadLessonDetail(lesson.id)}
          >
            <div className="lesson-date">{lesson.date}</div>
            <h3>{translateLessonTitle(lesson.title)}</h3>
            <div className="lesson-meta">
              <span>📝 {lesson.vocabCount} words</span>
              <span>📖 {lesson.grammarCount} grammar</span>
            </div>
            {lesson.topics.length > 0 && (
              <div className="lesson-topics">
                {lesson.topics.slice(0, 3).map((topic, i) => (
                  <span key={i} className="topic-tag">{topic}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
