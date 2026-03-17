import { useState, useEffect } from 'react';
import './LessonMode.css';
import { translateLessonTitle } from '../../translations.js';
import { API_URL } from '../../config/api.js';
import { Header } from '../Header/index.js';

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
    romaji: string;
    en: string;
    type?: string;
    furigana?: string | null;
  }>;
  grammar: Array<{
    pattern: string;
    explanation: string;
    romaji?: string;
    examples: Array<{jp: string; en: string; furigana?: string | null}>;
  }>;
  practice_phrases: Array<{jp: string; en: string; romaji?: string; furigana?: string | null}>;
}

// Format date to YYYY-MM-DD (local timezone)
function formatDate(dateString: string): string {
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

interface LessonModeProps {
  password: string;
  onBack: () => void;
  onStartLessonChat: (lessonId: string, lessonTitle: string) => void;
  selectedLessonId?: string;
  onSelectLesson: (lessonId: string | null) => void;
}

export function LessonMode({
  password: _password,
  onBack,
  onStartLessonChat,
  selectedLessonId: _selectedLessonId,
  onSelectLesson
}: LessonModeProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLessonState] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeTab, setActiveTab] = useState<'overview' | 'vocab' | 'grammar' | 'practice'>('overview');
  const [_vocabWithSources, setVocabWithSources] = useState<any[]>([]);
  const [showFurigana, setShowFurigana] = useState(() => {
    // Read from localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showFurigana');
      return saved === 'true';
    }
    return false;
  });
  
  // Save to localStorage when showFurigana changes
  useEffect(() => {
    localStorage.setItem('showFurigana', showFurigana.toString());
  }, [showFurigana]);
  
  // Furigana cache version for invalidation
  const FURIGANA_CACHE_VERSION = '3';
  
  // Load furigana cache from localStorage on init
  const loadFuriganaCacheFromStorage = (): Record<string, { furigana: string; timestamp: number; version: string }> => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('furiganaCache');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check version - invalidate if different
        const cachedVersion = localStorage.getItem('furiganaCacheVersion');
        if (cachedVersion !== FURIGANA_CACHE_VERSION) {
          localStorage.removeItem('furiganaCache');
          localStorage.setItem('furiganaCacheVersion', FURIGANA_CACHE_VERSION);
          return {};
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load furigana cache:', e);
    }
    return {};
  };
  
  const [furiganaCache, setFuriganaCache] = useState<Record<string, { furigana: string; timestamp: number; version: string }>>(loadFuriganaCacheFromStorage());
  
  // Save furigana cache to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('furiganaCache', JSON.stringify(furiganaCache));
      localStorage.setItem('furiganaCacheVersion', FURIGANA_CACHE_VERSION);
    }
  }, [furiganaCache]);
  
  // Simple hash function for text
  const hashText = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  };
  
  // Check if cache entry is valid (less than 24 hours old)
  const isCacheValid = (entry: { timestamp: number }): boolean => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return (now - entry.timestamp) < oneDay;
  };
  
  // Fetch furigana with caching
  const fetchFurigana = async (text: string): Promise<string | null> => {
    const cacheKey = hashText(text);
    
    // Check cache first
    const cached = furiganaCache[cacheKey];
    if (cached && isCacheValid(cached)) {
      return cached.furigana;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/furigana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch furigana');
      
      const data = await response.json();
      
      // Update cache
      setFuriganaCache(prev => ({
        ...prev,
        [cacheKey]: {
          furigana: data.with_furigana,
          timestamp: Date.now(),
          version: FURIGANA_CACHE_VERSION,
        }
      }));
      
      return data.with_furigana;
    } catch (error) {
      console.error('Error fetching furigana:', error);
      return null;
    }
  };
  
  // Prefetch furigana for vocabulary and grammar
  useEffect(() => {
    if (selectedLesson && showFurigana) {
      // Prefetch vocabulary furigana
      selectedLesson.vocabulary.forEach(async (vocab) => {
        if (!furiganaCache[hashText(vocab.jp)]) {
          await fetchFurigana(vocab.jp);
        }
      });
      
      // Prefetch grammar pattern furigana
      selectedLesson.grammar.forEach(async (grammar) => {
        if (!furiganaCache[hashText(grammar.pattern)]) {
          await fetchFurigana(grammar.pattern);
        }
      });
    }
  }, [selectedLesson, showFurigana]);
  
  // Get cached furigana
  const getCachedFurigana = (text: string): string | null => {
    const cached = furiganaCache[hashText(text)];
    if (cached && isCacheValid(cached)) {
      return cached.furigana;
    }
    return null;
  };

  // Fetch all lessons
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${API_URL}/api/lessons`);
        if (!response.ok) throw new Error('Failed to fetch lessons');
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  // Fetch vocabulary with lesson sources
  const fetchVocabWithSources = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vocabulary-with-sources`);
      if (!response.ok) throw new Error('Failed to fetch vocab with sources');
      const data = await response.json();
      setVocabWithSources(data);
    } catch (error) {
      console.error('Error fetching vocab with sources:', error);
    }
  };
  
  useEffect(() => {
    fetchVocabWithSources();
  }, []);

  // Handle lesson selection
  const handleSelectLesson = async (lessonId: string) => {
    onSelectLesson(lessonId);
    try {
      const response = await fetch(`${API_URL}/api/lessons/${lessonId}`);
      if (!response.ok) throw new Error('Failed to fetch lesson details');
      const data = await response.json();
      setSelectedLessonState(data);
      setActiveTab('overview');
    } catch (error) {
      console.error('Error fetching lesson details:', error);
    }
  };

  const handleBackToLessons = () => {
    onSelectLesson(null);
    setSelectedLessonState(null);
    setActiveTab('overview');
  };

  // Sort lessons
  const sortedLessons = [...lessons].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Get badge class based on review count
  const getReviewBadgeClass = (reviewCount: number): string => {
    if (reviewCount >= 5) return 'badge-mastered';
    if (reviewCount >= 3) return 'badge-advanced';
    if (reviewCount >= 1) return 'badge-learning';
    return 'badge-new';
  };

  // Group vocabulary by type
  const groupedVocab = selectedLesson?.vocabulary.reduce((acc, vocab) => {
    const type = vocab.type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(vocab);
    return acc;
  }, {} as Record<string, typeof selectedLesson.vocabulary>);

  // Fetch review counts for vocabulary
  const [vocabReviews, setVocabReviews] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const fetchVocabReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/vocabulary-reviews`);
        if (!response.ok) throw new Error('Failed to fetch vocab reviews');
        const data = await response.json();
        // Convert array to record for quick lookup
        const reviewsRecord: Record<string, number> = {};
        data.forEach((item: { word: string; reviewCount: number }) => {
          reviewsRecord[item.word] = item.reviewCount;
        });
        setVocabReviews(reviewsRecord);
      } catch (error) {
        console.error('Error fetching vocab reviews:', error);
      }
    };
    fetchVocabReviews();
  }, []);

  if (loading) {
    return (
      <div className="lesson-mode">
        <Header title="Lesson Mode" icon="📚" onBack={onBack} />
        <div className="lesson-mode-content">
          <div className="loading">Loading lessons...</div>
        </div>
      </div>
    );
  }

  // Lesson Detail View
  if (selectedLesson) {
    return (
      <div className="lesson-mode">
        <Header 
          title={`Lesson ${selectedLesson.id}`} 
          icon="📚" 
          onBack={handleBackToLessons}
          actions={
            <button
              className="furigana-toggle"
              onClick={() => setShowFurigana(!showFurigana)}
              title={showFurigana ? 'Ukryj furigana' : 'Pokaż furigana'}
            >
              {showFurigana ? 'あ' : '漢'}
            </button>
          }
        />
        <div className="lesson-mode-content">
          <div className="lesson-detail">
            <div className="lesson-header">
              <div className="lesson-meta">
                <span className="lesson-date">{formatDate(selectedLesson.date)}</span>
                <span className="lesson-topics">{selectedLesson.topics.join(', ')}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="lesson-tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab ${activeTab === 'vocab' ? 'active' : ''}`}
                onClick={() => setActiveTab('vocab')}
              >
                Vocabulary ({selectedLesson.vocabulary.length})
              </button>
              <button 
                className={`tab ${activeTab === 'grammar' ? 'active' : ''}`}
                onClick={() => setActiveTab('grammar')}
              >
                Grammar ({selectedLesson.grammar.length})
              </button>
              <button 
                className={`tab ${activeTab === 'practice' ? 'active' : ''}`}
                onClick={() => setActiveTab('practice')}
              >
                Practice ({selectedLesson.practice_phrases.length})
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-content">
                <div className="lesson-stats">
                  <div className="stat-card">
                    <div className="stat-number">{selectedLesson.vocabulary.length}</div>
                    <div className="stat-label">Vocabulary</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{selectedLesson.grammar.length}</div>
                    <div className="stat-label">Grammar Points</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{selectedLesson.practice_phrases.length}</div>
                    <div className="stat-label">Practice Phrases</div>
                  </div>
                </div>
                
                <button 
                  className="start-lesson-chat-btn"
                  onClick={() => onStartLessonChat(selectedLesson.id, selectedLesson.title)}
                >
                  Start Lesson Chat
                </button>
              </div>
            )}

            {/* Vocabulary Tab */}
            {activeTab === 'vocab' && (
              <div className="tab-content">
                {groupedVocab && Object.entries(groupedVocab).map(([type, vocabList]) => (
                  <div key={type} className="vocab-group">
                    <h4>{type}</h4>
                    <div className="vocab-grid">
                      {vocabList.map((vocab, index) => {
                        const reviewCount = vocabReviews[vocab.jp] || 0;
                        const furiganaHtml = showFurigana ? getCachedFurigana(vocab.jp) : null;
                        return (
                          <div key={index} className="vocab-item">
                            <div className="vocab-main">
                              {furiganaHtml ? (
                                <span 
                                  className="vocab-jp"
                                  dangerouslySetInnerHTML={{ __html: furiganaHtml }}
                                />
                              ) : (
                                <span className="vocab-jp">{vocab.jp}</span>
                              )}
                              <span className={`review-badge ${getReviewBadgeClass(reviewCount)}`}>
                                {reviewCount}
                              </span>
                            </div>
                            <div className="vocab-reading">{vocab.reading}</div>
                            <div className="vocab-en">{vocab.en}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grammar Tab */}
            {activeTab === 'grammar' && (
              <div className="tab-content">
                <div className="grammar-list">
                  {selectedLesson.grammar.map((grammar, index) => {
                    const furiganaHtml = showFurigana ? getCachedFurigana(grammar.pattern) : null;
                    return (
                      <div key={index} className="grammar-item">
                        <div className="grammar-pattern">
                          {furiganaHtml ? (
                            <span dangerouslySetInnerHTML={{ __html: furiganaHtml }} />
                          ) : (
                            grammar.pattern
                          )}
                        </div>
                        <div className="grammar-explanation">{grammar.explanation}</div>
                        {grammar.examples && grammar.examples.length > 0 && (
                          <div className="grammar-examples">
                            {grammar.examples.map((example, exIndex) => {
                              const exFuriganaHtml = showFurigana ? getCachedFurigana(example.jp) : null;
                              return (
                                <div key={exIndex} className="grammar-example">
                                  {exFuriganaHtml ? (
                                    <span dangerouslySetInnerHTML={{ __html: exFuriganaHtml }} />
                                  ) : (
                                    <span className="example-jp">{example.jp}</span>
                                  )}
                                  <span className="example-en">{example.en}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Practice Tab */}
            {activeTab === 'practice' && (
              <div className="tab-content">
                <div className="practice-list">
                  {selectedLesson.practice_phrases.map((phrase, index) => {
                    const furiganaHtml = showFurigana ? getCachedFurigana(phrase.jp) : null;
                    return (
                      <div key={index} className="practice-item">
                        <div className="practice-number">{index + 1}</div>
                        <div className="practice-content">
                          {furiganaHtml ? (
                            <div className="practice-jp" dangerouslySetInnerHTML={{ __html: furiganaHtml }} />
                          ) : (
                            <div className="practice-jp">{phrase.jp}</div>
                          )}
                          <div className="practice-en">{phrase.en}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Lessons List View
  return (
    <div className="lesson-mode">
      <Header title="Lesson Mode" icon="📚" onBack={onBack} />
      <div className="lesson-mode-content">
        <div className="lessons-list-header">
          <h2>Your Lessons</h2>
          <button 
            className="sort-button"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          >
            {sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
          </button>
        </div>
        
        <div className="lessons-list">
          {sortedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="lesson-card"
              onClick={() => handleSelectLesson(lesson.id)}
            >
              <div className="lesson-card-header">
                <span className="lesson-number">Lesson {lesson.order}</span>
                <span className="lesson-date">{formatDate(lesson.date)}</span>
              </div>
              <h3 className="lesson-title">{translateLessonTitle(lesson.title)}</h3>
              <div className="lesson-topics-preview">
                {lesson.topics.slice(0, 2).join(', ')}
                {lesson.topics.length > 2 && '...'}
              </div>
              <div className="lesson-stats-preview">
                <span className="stat">📝 {lesson.vocabCount}</span>
                <span className="stat">📐 {lesson.grammarCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
