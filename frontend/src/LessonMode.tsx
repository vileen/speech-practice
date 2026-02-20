import { useState, useEffect, useRef, useCallback } from 'react';
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
    furigana?: string | null;
  }>;
  grammar: Array<{
    pattern: string;
    explanation: string;
    examples: Array<{jp: string; en: string; furigana?: string | null}>;
  }>;
  practice_phrases: Array<{jp: string; en: string}>;
}

const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');

// Format date to YYYY-MM-DD
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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

export function LessonMode({ password, onBack, onStartLessonChat, selectedLessonId, onSelectLesson }: LessonModeProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLessonState] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeTab, setActiveTab] = useState<'overview' | 'vocab' | 'grammar' | 'practice'>('overview');
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
  
  // Furigana cache to avoid repeated API calls
  const [furiganaCache, setFuriganaCache] = useState<Record<string, string>>({});
  const [furiganaLoading, setFuriganaLoading] = useState<Record<string, boolean>>({});
  const [furiganaFailed, setFuriganaFailed] = useState<Record<string, boolean>>({});
  // Use refs to avoid dependency loops in useEffect
  const furiganaCacheRef = useRef<Record<string, string>>({});
  const furiganaLoadingRef = useRef<Record<string, boolean>>({});
  const furiganaFailedRef = useRef<Record<string, boolean>>({});
  
  // Keep refs in sync with state
  useEffect(() => {
    furiganaCacheRef.current = furiganaCache;
  }, [furiganaCache]);
  
  useEffect(() => {
    furiganaLoadingRef.current = furiganaLoading;
  }, [furiganaLoading]);
  
  useEffect(() => {
    furiganaFailedRef.current = furiganaFailed;
  }, [furiganaFailed]);
  
  // Ref for scroll position
  const lessonsListRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Handle selected lesson changes from props
  useEffect(() => {
    if (selectedLessonId && lessons.length > 0) {
      // Load lesson when prop changes
      loadLessonDetail(selectedLessonId, false);
    } else if (!selectedLessonId) {
      // Go back to list when prop is null/undefined
      setSelectedLessonState(null);
      // Restore scroll position when going back
      setTimeout(() => {
        if (lessonsListRef.current) {
          lessonsListRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 0);
    }
  }, [selectedLessonId, lessons]);

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

  const loadLessonDetail = async (id: string, saveScroll = true) => {
    if (saveScroll && lessonsListRef.current) {
      scrollPositionRef.current = lessonsListRef.current.scrollTop;
    }
    
    setLoading(true);
    try {
      // Always fetch with furigana included (cached in DB)
      const response = await fetch(`${API_URL}/api/lessons/${id}?furigana=true`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedLessonState(data);
        setActiveTab('overview');
        // Notify parent of selection change (only for user clicks, not prop-driven loads)
        if (saveScroll) {
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
    loadLessonDetail(lessonId, true);
  };

  const handleBackToList = () => {
    setSelectedLessonState(null);
    onSelectLesson(null);
  };

  // Fetch furigana from backend - uses refs to avoid dependency loops
  const fetchFurigana = useCallback(async (text: string): Promise<string> => {
    // Check cache using ref to avoid dependency loop
    const cached = furiganaCacheRef.current[text];
    if (cached) {
      return cached;
    }
    
    // Skip if already loading
    if (furiganaLoadingRef.current[text]) {
      return text;
    }
    
    // Mark as loading
    furiganaLoadingRef.current = { ...furiganaLoadingRef.current, [text]: true };
    setFuriganaLoading({ ...furiganaLoadingRef.current });
    
    try {
      const response = await fetch(`${API_URL}/api/furigana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const withFurigana = data.with_furigana;
        // Cache the result
        furiganaCacheRef.current = { ...furiganaCacheRef.current, [text]: withFurigana };
        setFuriganaCache({ ...furiganaCacheRef.current });
        return withFurigana;
      } else {
        // Mark as failed
        furiganaFailedRef.current = { ...furiganaFailedRef.current, [text]: true };
        setFuriganaFailed({ ...furiganaFailedRef.current });
      }
    } catch (error) {
      console.error('Error fetching furigana:', error);
      // Mark as failed
      furiganaFailedRef.current = { ...furiganaFailedRef.current, [text]: true };
      setFuriganaFailed({ ...furiganaFailedRef.current });
    } finally {
      furiganaLoadingRef.current = { ...furiganaLoadingRef.current, [text]: false };
      setFuriganaLoading({ ...furiganaLoadingRef.current });
    }
    
    return text;
  }, [password]);

  // Fetch all furigana for a lesson when showFurigana is enabled
  // Only runs when selectedLesson or showFurigana changes - NOT when cache changes
  useEffect(() => {
    if (!selectedLesson || !showFurigana) return;
    
    const textsToFetch: string[] = [];
    
    // Collect all Japanese text that needs furigana (check cache ref to avoid dependency loop)
    selectedLesson.vocabulary.forEach(item => {
      if (!furiganaCacheRef.current[item.jp]) textsToFetch.push(item.jp);
    });
    
    selectedLesson.grammar.forEach(item => {
      // Collect pattern text
      if (!furiganaCacheRef.current[item.pattern]) textsToFetch.push(item.pattern);
      // Collect explanation text (split by lines and filter for Japanese text)
      item.explanation.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!/[\u4e00-\u9faf]/.test(trimmed)) return; // Skip lines without kanji
        if (furiganaCacheRef.current[trimmed]) return; // Skip already cached
        
        // Handle markdown table rows - extract cell contents
        if (trimmed.startsWith('|')) {
          const cells = trimmed.split('|').map(c => c.trim()).filter(c => c && !c.startsWith('-'));
          cells.forEach(cell => {
            if (/[\u4e00-\u9faf]/.test(cell) && !furiganaCacheRef.current[cell]) {
              textsToFetch.push(cell);
            }
          });
        } else {
          textsToFetch.push(trimmed);
        }
      });
      // Collect examples
      item.examples.forEach(ex => {
        if (!furiganaCacheRef.current[ex.jp]) textsToFetch.push(ex.jp);
      });
    });
    
    selectedLesson.practice_phrases.forEach(phrase => {
      if (!furiganaCacheRef.current[phrase.jp]) textsToFetch.push(phrase.jp);
    });
    
    // Fetch furigana for all texts (with small delays to avoid overwhelming the API)
    textsToFetch.forEach((text, index) => {
      setTimeout(() => {
        fetchFurigana(text);
      }, index * 50); // 50ms delay between requests
    });
  }, [selectedLesson, showFurigana]); // Intentionally NOT including fetchFurigana or cache

  const renderFurigana = (text: string, preloadedFurigana?: string | null) => {
    if (!showFurigana) return text;
    
    // If we have preloaded furigana from DB, use it
    if (preloadedFurigana) {
      return <span dangerouslySetInnerHTML={{ __html: preloadedFurigana }} />;
    }
    
    // If we have cached furigana in memory, use it
    const cached = furiganaCacheRef.current[text] || furiganaCache[text];
    if (cached) {
      return <span dangerouslySetInnerHTML={{ __html: cached }} />;
    }
    
    // Check if fetch failed
    const failed = furiganaFailedRef.current[text] || furiganaFailed[text];
    if (failed) {
      // Show "failed" in red above each kanji
      const kanjiRegex = /[\u4e00-\u9faf]/g;
      const parts: JSX.Element[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = kanjiRegex.exec(text)) !== null) {
        // Add text before kanji
        if (match.index > lastIndex) {
          parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
        }
        // Add kanji with "failed" above
        parts.push(
          <ruby key={`kanji-${match.index}`} className="furigana-failed">
            {match[0]}<rt>failed</rt>
          </ruby>
        );
        lastIndex = match.index + 1;
      }
      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
      }
      
      return <span>{parts}</span>;
    }
    
    // Otherwise show plain text (it will be fetched)
    return text;
  };

  // Render explanation with support for both markdown and HTML tables, and furigana
  const renderExplanationWithTables = (explanation: string) => {
    // Check if explanation contains HTML table
    if (explanation.includes('<table')) {
      // For HTML tables, we still need to render them as-is
      // But we should also try to apply furigana to text content
      return <div className="grammar-explanation" dangerouslySetInnerHTML={{ __html: explanation }} />;
    }

    // Parse markdown tables
    const lines = explanation.split('\n');
    const elements: JSX.Element[] = [];
    let currentTable: string[] = [];
    let tableKey = 0;

    const flushTable = () => {
      if (currentTable.length === 0) return;

      // Filter out separator lines (|-----|)
      const dataRows = currentTable.filter(row => !row.trim().startsWith('|-'));
      if (dataRows.length === 0) {
        currentTable = [];
        return;
      }

      elements.push(
        <table key={`table-${tableKey++}`} className="grammar-table">
          <tbody>
            {dataRows.map((row, rowIdx) => {
              const cells = row.split('|').map(c => c.trim()).filter(c => c);
              return (
                <tr key={rowIdx}>
                  {cells.map((cell, cellIdx) => (
                    <td key={cellIdx}>{renderFurigana(cell)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
      currentTable = [];
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|')) {
        currentTable.push(line);
      } else {
        flushTable();
        if (trimmed) {
          elements.push(<p key={`p-${i}`}>{renderFurigana(line)}</p>);
        } else {
          elements.push(<br key={`br-${i}`} />);
        }
      }
    });
    flushTable();

    return <>{elements}</>;
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
          <button className="back-btn" onClick={handleBackToList}>← All Lessons</button>
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
          <button className={activeTab === 'practice' ? 'active' : ''} onClick={() => setActiveTab('practice')}>Practice ({selectedLesson.practice_phrases.length})</button>
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
                <p><strong>Date:</strong> {formatDate(selectedLesson.date)}</p>
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
                    <div className="jp-word">{renderFurigana(item.jp, item.furigana)}</div>
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
              {selectedLesson.grammar.map((item, idx) => (
                <div key={idx} className="grammar-card">
                  <h3>{renderFurigana(item.pattern)}</h3>
                  <div className="explanation">
                    {renderExplanationWithTables(item.explanation)}
                  </div>
                  {item.examples.length > 0 && (
                    <div className="examples">
                      <h4>Examples:</h4>
                      {item.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="example">
                          <span className="jp">{renderFurigana(ex.jp, ex.furigana)}</span>
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
              <div className="practice-list">
                {selectedLesson.practice_phrases.map((phrase, idx) => (
                  <div key={idx} className="practice-item">
                    <span className="number">{idx + 1}.</span>
                    <div className="phrase-content">
                      <span className="phrase-jp">{renderFurigana(phrase.jp)}</span>
                      <span className="phrase-en">{phrase.en}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sort lessons based on selected order
  const sortedLessons = [...lessons].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="lesson-mode">
      <div className="lesson-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>📚 Lessons</h2>
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
      </div>
      
      <div className="lessons-list" ref={lessonsListRef}>
        {sortedLessons.map(lesson => (
          <div 
            key={lesson.id} 
            className="lesson-card"
            onClick={() => handleLessonClick(lesson.id)}
          >
            <div className="lesson-card-header">
              <span className="lesson-date">{formatDate(lesson.date)}</span>
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
