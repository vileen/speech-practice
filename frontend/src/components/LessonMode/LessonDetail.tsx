import { useState, useEffect } from 'react';
import { Header } from '../Header/index.js';
import { type LessonDetail } from '../../hooks/useLessonMode.js';
import { translateLessonTitle } from '../../translations.js';
import { API_URL } from '../../config/api.js';
import './LessonMode.css';

export interface LessonDetailProps {
  lesson: LessonDetail;
  onBack: () => void;
  onStartLessonChat: (lessonId: string, lessonTitle: string) => void;
  onSelectLesson?: (lessonId: string | null) => void;
  showFurigana: boolean;
  setShowFurigana: (show: boolean) => void;
  renderFurigana: (text: string, reading?: string | null) => string | React.ReactElement;
  renderExplanationWithTables: (explanation: string) => React.ReactElement;
  prefetchFurigana: (lesson: LessonDetail) => void;
}

export function LessonDetailView({
  lesson,
  onBack,
  onStartLessonChat,
  onSelectLesson,
  showFurigana,
  setShowFurigana,
  renderFurigana,
  renderExplanationWithTables,
  prefetchFurigana,
}: LessonDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'vocab' | 'grammar' | 'practice'>('overview');
  const [vocabWithSources, setVocabWithSources] = useState<Record<string, any[]>>({});
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  useEffect(() => {
    if (showFurigana) {
      prefetchFurigana(lesson);
    }
  }, [lesson, showFurigana]);

  // Fetch vocabulary with sources (appearances in other lessons)
  useEffect(() => {
    const fetchVocabSources = async () => {
      if (!lesson?.id) return;
      try {
        const response = await fetch(`${API_URL}/api/lessons/${lesson.id}/vocabulary-with-sources`);
        if (!response.ok) throw new Error('Failed to fetch vocab sources');
        const data = await response.json();
        const sourcesMap: Record<string, any[]> = {};
        (data.vocabulary || []).forEach((word: any) => {
          const wordText = word.jp || word.word;
          if (wordText) {
            sourcesMap[wordText] = word.otherLessons || [];
          }
        });
        setVocabWithSources(sourcesMap);
      } catch (error) {
        console.error('Error fetching vocab sources:', error);
      }
    };
    fetchVocabSources();
  }, [lesson.id]);

  return (
    <div className="lesson-mode">
      <Header
        title={translateLessonTitle(lesson.title)}
        icon="📚"
        onBack={onBack}
        actions={
          <button
            className="start-chat-btn"
            onClick={() => onStartLessonChat(lesson.id, translateLessonTitle(lesson.title))}
          >
            💬 Practice Conversation
          </button>
        }
      />

      <div className="lesson-detail">
        <div className="lesson-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'vocab' ? 'active' : ''} onClick={() => setActiveTab('vocab')}>Vocabulary ({lesson.vocabulary.length})</button>
          <button className={activeTab === 'grammar' ? 'active' : ''} onClick={() => setActiveTab('grammar')}>Grammar ({lesson.grammar.length})</button>
          <button className={activeTab === 'practice' ? 'active' : ''} onClick={() => setActiveTab('practice')}>Practice ({lesson.practice_phrases.length})</button>
        </div>

        <button
          className="furigana-toggle"
          onClick={() => setShowFurigana(!showFurigana)}
          title={showFurigana ? 'Hide furigana' : 'Show furigana'}
        >
          {showFurigana ? 'あ' : '漢'}
        </button>

        <div className="lesson-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-card">
                <h3>Lesson Info</h3>
                <p><strong>Date:</strong> {lesson.date}</p>
                {lesson.topics.length > 0 && (
                  <p><strong>Topics:</strong> {lesson.topics.join(', ')}</p>
                )}
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-number">{lesson.vocabulary.length}</span>
                  <span className="stat-label">Vocabulary Words</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{lesson.grammar.length}</span>
                  <span className="stat-label">Grammar Points</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{lesson.practice_phrases.length}</span>
                  <span className="stat-label">Practice Phrases</span>
                </div>
              </div>

              <div className="quick-start">
                <h3>Ready to practice?</h3>
                <button
                  className="big-button"
                  onClick={() => onStartLessonChat(lesson.id, lesson.title)}
                >
                  💬 Start Conversation Practice
                </button>
              </div>
            </div>
          )}

          {activeTab === 'vocab' && (
            <div className="vocab-tab">
              <div className="vocab-grid">
                {(lesson.vocabulary || []).map((item, idx) => {
                  const wordText = item.jp || (item as any).word || '';
                  const otherLessons = vocabWithSources[wordText] || [];
                  return (
                    <div key={idx} className="vocab-card">
                      <div className="vocab-card-header">
                        <div className="jp-word">{renderFurigana(wordText, item.reading)}</div>
                        {otherLessons.length > 0 && (
                          <div
                            className="appearances-badge-container"
                            onMouseEnter={() => setHoveredWord(wordText)}
                            onMouseLeave={() => setHoveredWord(null)}
                          >
                            <span className="appearances-badge">{otherLessons.length}</span>
                            {hoveredWord === wordText && (
                              <div className="appearances-tooltip">
                                <div className="appearances-tooltip-header">Appears in {otherLessons.length} lesson{otherLessons.length !== 1 ? 's' : ''}</div>
                                {otherLessons.map((l: any) => (
                                  <div key={l.id} className="appearances-tooltip-item" onClick={() => onSelectLesson?.(l.id)}>
                                    <span className="appearances-tooltip-title">{l.title}</span>
                                    <span className="appearances-tooltip-date">{l.date}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="romaji">{item.romaji || item.reading}</div>
                      <div className="meaning">{item.en || (item as any).meaning || 'No meaning'}</div>
                      {item.type && <span className="type-tag">{item.type}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'grammar' && (
            <div className="grammar-tab">
              {(lesson.grammar || []).map((item, idx) => (
                <div key={idx} className="grammar-card">
                  <h3>{renderFurigana(item.pattern)}</h3>
                  {item.romaji && <div className="romaji">{item.romaji}</div>}
                  <div className="explanation">
                    {renderExplanationWithTables(item.explanation)}
                  </div>
                  {(item.examples || []).length > 0 && (
                    <div className="examples">
                      <h4>Examples:</h4>
                      {(item.examples || []).map((ex, exIdx) => (
                        <div key={exIdx} className="example">
                          <span className="jp">{renderFurigana(ex.jp || (ex as any).japanese || '', ex.furigana)}</span>
                          <span className="en">{ex.en || (ex as any).english || 'No translation'}</span>
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
                {(lesson.practice_phrases || []).map((phrase, idx) => (
                  <div key={idx} className="practice-item">
                    <span className="number">{idx + 1}.</span>
                    <div className="phrase-content">
                      <span className="phrase-jp">
                        {showFurigana && phrase.furigana ? (
                          <span dangerouslySetInnerHTML={{ __html: phrase.furigana }} />
                        ) : (
                          renderFurigana(phrase.jp || (phrase as any).japanese || '', phrase.furigana)
                        )}
                      </span>
                      {(phrase.romaji || (phrase as any).reading) && <span className="phrase-romaji">{phrase.romaji || (phrase as any).reading}</span>}
                      <span className="phrase-en">{phrase.en || (phrase as any).english || 'No translation'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
