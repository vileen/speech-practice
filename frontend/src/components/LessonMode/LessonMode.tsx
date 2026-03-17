import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioPlayer } from '../AudioPlayer/index.js';
import { VoiceRecorder } from '../VoiceRecorder/index.js';
import { HighlightedText } from '../HighlightedText/index.js';
import { Header } from '../Header/index.js';
import { API_URL } from '../../config/api.js';
import './LessonMode.css';

// Type definitions
interface LessonPhrase {
  id: string;
  japanese: string;
  romaji?: string;
  translation: string;
  audioUrl: string;
  isUserMessage: boolean;
}

interface LessonAudioFile {
  filename: string;
  duration: number;
  url?: string;
}

interface LessonData {
  id: string;
  title: string;
  date: string;
  phrases: LessonPhrase[];
  audioFile: LessonAudioFile;
  ankiCards?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

export function LessonMode() {
  const { id: lessonId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'phrases' | 'transcription' | 'anki'>('phrases');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [, setRecordings] = useState<{[key: string]: Blob}>({});
  const [transcription, setTranscription] = useState<string>('');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      
      try {
        const response = await fetch(`${API_URL}/api/lessons/${lessonId}`);
        if (!response.ok) throw new Error('Failed to fetch lesson');
        
        const data = await response.json();
        setLesson(data);
        
        // Fetch transcription if available
        try {
          const transResponse = await fetch(`${API_URL}/api/lessons/${lessonId}/transcription`);
          if (transResponse.ok) {
            const transData = await transResponse.json();
            setTranscription(transData.content || '');
          }
        } catch (err) {
          console.log('No transcription available');
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLesson();
  }, [lessonId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lesson) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentPhraseIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          setCurrentPhraseIndex(prev => 
            Math.min(lesson.phrases.length - 1, prev + 1)
          );
          break;
        case 'Home':
          setCurrentPhraseIndex(0);
          break;
        case 'End':
          setCurrentPhraseIndex(lesson.phrases.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lesson]);

  const handleRecordingComplete = (phraseId: string, blob: Blob) => {
    setRecordings(prev => ({ ...prev, [phraseId]: blob }));
  };

  const handlePlayPhrase = (index: number) => {
    setCurrentPhraseIndex(index);
    setIsPlaying(true);
  };

  if (isLoading) {
    return (
      <div className="lesson-mode">
        <div className="loading">Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-mode">
        <div className="error">Lesson not found</div>
      </div>
    );
  }

  const currentPhrase = lesson.phrases[currentPhraseIndex];

  return (
    <div className="lesson-mode">
      <Header
        title="Speech Practice"
        icon="📚"
        onBack={() => navigate('/lessons')}
        actions={
          <button
            className="furigana-toggle"
            onClick={() => setShowFurigana(!showFurigana)}
            title={showFurigana ? 'Hide furigana' : 'Show furigana'}
          >
            {showFurigana ? 'あ' : '漢'}
          </button>
        }
      />
      <div className="lesson-tabs">
        <button
          className={`tab ${activeTab === 'phrases' ? 'active' : ''}`}
          onClick={() => setActiveTab('phrases')}
        >
          Lekcje
        </button>
        <button
          className={`tab ${activeTab === 'transcription' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcription')}
        >
          Transkrypcja
        </button>
        <button
          className={`tab ${activeTab === 'anki' ? 'active' : ''}`}
          onClick={() => setActiveTab('anki')}
        >
          Anki
        </button>
      </div>

      <main className="lesson-content">
        {activeTab === 'phrases' && (
          <>
            <div className="lesson-info">
              <h3>{lesson.title}</h3>
              <div className="phrase-counter">
                {currentPhraseIndex + 1} / {lesson.phrases.length}
              </div>
            </div>

            <div className="phrase-display">
              {currentPhrase && (
                <div className={`phrase ${currentPhrase.isUserMessage ? 'user' : 'assistant'}`}>
                  <HighlightedText 
                    text={currentPhrase.japanese}
                    reading={showFurigana ? currentPhrase.romaji || null : null}
                    audioElement={audioElement}
                    isPlaying={isPlaying}
                  />
                  <div className="translation">{currentPhrase.translation}</div>
                </div>
              )}
            </div>

            <div className="audio-controls">
              <AudioPlayer 
                audioUrl={currentPhrase?.audioUrl || lesson.audioFile?.url || ''}
                volume={1}
                isActive={isPlaying}
                onPlay={(audio) => setAudioElement(audio)}
                onPause={() => setIsPlaying(false)}
                onStop={() => setIsPlaying(false)}
                onStopOthers={() => {}}
              />
            </div>

            <div className="recording-section">
              <VoiceRecorder 
                key={currentPhrase?.id}
                onRecordingComplete={(blob) => currentPhrase?.id && handleRecordingComplete(currentPhrase.id, blob)}
                isListening={false}
                onStartListening={() => {}}
                onStopListening={() => {}}
                mode="push-to-talk"
              />
            </div>

            <div className="navigation">
              <button 
                onClick={() => setCurrentPhraseIndex(prev => Math.max(0, prev - 1))}
                disabled={currentPhraseIndex === 0}
              >
                ← Previous
              </button>
              <button 
                onClick={() => setCurrentPhraseIndex(prev => 
                  Math.min(lesson.phrases.length - 1, prev + 1)
                )}
                disabled={currentPhraseIndex === lesson.phrases.length - 1}
              >
                Next →
              </button>
            </div>

            <div className="phrase-list">
              {lesson.phrases.map((phrase, index) => (
                <button
                  key={phrase.id}
                  className={`phrase-item ${index === currentPhraseIndex ? 'active' : ''}`}
                  onClick={() => handlePlayPhrase(index)}
                >
                  <span className="phrase-number">{index + 1}</span>
                  <span className="phrase-text">{(phrase.japanese || '').slice(0, 30)}...</span>
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === 'transcription' && (
          <div className="transcription-content">
            <h3>Transkrypcja</h3>
            {transcription ? (
              <pre className="transcription-text">{transcription}</pre>
            ) : (
              <p className="no-transcription">Brak transkrypcji dla tej lekcji.</p>
            )}
          </div>
        )}

        {activeTab === 'anki' && (
          <div className="anki-content">
            <h3>Karty Anki</h3>
            {lesson.ankiCards && lesson.ankiCards.length > 0 ? (
              <div className="anki-cards">
                {lesson.ankiCards.map((card) => (
                  <div key={card.id} className="anki-card">
                    <div className="anki-question">{card.question}</div>
                    <div className="anki-answer">{card.answer}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-anki">Brak kart Anki dla tej lekcji.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
