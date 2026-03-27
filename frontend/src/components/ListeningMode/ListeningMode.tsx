import React, { useState, useRef, useEffect } from 'react';
import './ListeningMode.css';
import { useListeningMode } from '../../hooks/useListeningMode.js';
import { Header } from '../Header/index.js';
import { useFurigana } from '../../hooks/useFurigana.js';

const LEVEL_COLORS: Record<string, string> = {
  N5: '#4ade80', // green
  N4: '#60a5fa', // blue
  N3: '#fbbf24', // amber
};

const TYPE_LABELS: Record<string, string> = {
  main_idea: 'Main Idea',
  detail: 'Detail',
  inference: 'Inference',
};

const SPEED_OPTIONS = [
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.25x', value: 1.25 },
];

// Furigana display component
const FuriganaDisplay: React.FC<{
  text: string;
  showFurigana: boolean;
  className?: string;
}> = ({ text, showFurigana, className = '' }) => {
  const { furigana } = useFurigana(text, showFurigana);
  
  if (!showFurigana || !furigana) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span 
      className={`furigana-text ${className}`}
      dangerouslySetInnerHTML={{ __html: furigana }}
    />
  );
};

export const ListeningMode: React.FC = () => {
  const [viewState, setViewState] = useState<'list' | 'listening' | 'questions' | 'results'>('list');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showFurigana, setShowFurigana] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const FURIGANA_STORAGE_KEY = 'listening_show_furigana';
  
  const {
    passages,
    currentPassage,
    questions,
    answers,
    result,
    transcript,
    loading,
    error,
    fetchPassages,
    fetchPassage,
    selectAnswer,
    submitAnswers,
    fetchTranscript,
    reset,
  } = useListeningMode();

  // Load furigana preference
  useEffect(() => {
    const saved = localStorage.getItem(FURIGANA_STORAGE_KEY);
    if (saved !== null) {
      setShowFurigana(saved === 'true');
    }
  }, []);

  // Save furigana preference
  useEffect(() => {
    localStorage.setItem(FURIGANA_STORAGE_KEY, showFurigana.toString());
  }, [showFurigana]);

  // Load passages on mount
  useEffect(() => {
    fetchPassages();
  }, [fetchPassages]);

  // Reload when level filter changes
  useEffect(() => {
    fetchPassages(selectedLevel || undefined);
  }, [selectedLevel, fetchPassages]);

  // Handle audio speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const startListening = async (passage: typeof passages[0]) => {
    await fetchPassage(passage.id);
    setViewState('listening');
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    const unansweredCount = questions.filter(q => answers[q.id] === undefined).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }
    await submitAnswers();
    setViewState('results');
  };

  const handleShowTranscript = async () => {
    await fetchTranscript();
    setShowTranscript(true);
  };

  const goToNextPassage = () => {
    if (!currentPassage) return;
    const currentIndex = passages.findIndex(p => p.id === currentPassage.id);
    const nextPassage = passages[currentIndex + 1];
    if (nextPassage) {
      startListening(nextPassage);
    } else {
      setViewState('list');
      reset();
    }
  };

  const renderPassageList = () => (
    <div className="listening-list">
      <div className="listening-filters">
        <label>Filter by Level:</label>
        <select 
          value={selectedLevel} 
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="level-select"
        >
          <option value="">All Levels</option>
          <option value="N5">N5 (Beginner)</option>
          <option value="N4">N4 (Elementary)</option>
          <option value="N3">N3 (Intermediate)</option>
        </select>
      </div>
      
      {loading ? (
        <div className="loading">Loading passages...</div>
      ) : passages.length === 0 ? (
        <div className="no-passages">No listening passages found.</div>
      ) : (
        <div className="passages-grid">
          {passages.map(passage => (
            <div 
              key={passage.id} 
              className="passage-card"
              onClick={() => startListening(passage)}
            >
              <div className="passage-header">
                <h3>{passage.title}</h3>
                <span 
                  className="level-badge"
                  style={{ backgroundColor: LEVEL_COLORS[passage.level] }}
                >
                  {passage.level}
                </span>
              </div>
              <div className="passage-meta">
                {passage.topic_category && (
                  <span className="topic">{passage.topic_category}</span>
                )}
                {passage.duration_seconds && (
                  <span className="duration">{formatTime(passage.duration_seconds)}</span>
                )}
                {passage.difficulty_speed && (
                  <span className="speed">{passage.difficulty_speed}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderListeningView = () => {
    if (!currentPassage) return null;
    
    return (
      <div className="listening-view">
        <div className="passage-info">
          <h2>{currentPassage.title}</h2>
          <div className="passage-badges">
            <span 
              className="level-badge"
              style={{ backgroundColor: LEVEL_COLORS[currentPassage.level] }}
            >
              {currentPassage.level}
            </span>
            {currentPassage.topic_category && (
              <span className="topic-badge">{currentPassage.topic_category}</span>
            )}
          </div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={currentPassage.audio_url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Audio Player UI */}
        <div className="audio-player">
          {/* Visual Wave Indicator */}
          <div className={`audio-visualizer ${isPlaying ? 'playing' : ''}`}>
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="wave-bar" 
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <span className="time-current">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="progress-bar"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
            />
            <span className="time-total">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="player-controls">
            <button 
              className="control-btn replay-btn"
              onClick={handleReplay}
              title="Replay"
            >
              ↺
            </button>
            
            <button 
              className="control-btn play-btn"
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <div className="speed-control">
              {SPEED_OPTIONS.map(speed => (
                <button
                  key={speed.value}
                  className={`speed-btn ${playbackSpeed === speed.value ? 'active' : ''}`}
                  onClick={() => setPlaybackSpeed(speed.value)}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="listening-instructions">
          <p>🎧 Listen to the audio carefully. You can replay it as many times as needed.</p>
          <p>When you're ready, click "Continue to Questions" to answer comprehension questions.</p>
        </div>

        <div className="listening-actions">
          <button 
            className="continue-btn"
            onClick={() => setViewState('questions')}
            disabled={currentTime === 0}
          >
            Continue to Questions →
          </button>
        </div>
      </div>
    );
  };

  const renderQuestionsView = () => {
    if (!currentPassage) return null;
    
    return (
      <div className="questions-view">
        <div className="questions-header">
          <h2>Questions</h2>
          <span className="progress">
            {Object.keys(answers).length} / {questions.length} answered
          </span>
        </div>
        
        <div className="questions-list">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className={`question-card ${answers[question.id] !== undefined ? 'answered' : ''}`}
            >
              <div className="question-header">
                <span className="question-number">{index + 1}</span>
                <span className="question-type">{TYPE_LABELS[question.question_type]}</span>
              </div>
              
              <p className="question-text">
                <FuriganaDisplay 
                  text={question.question_text} 
                  showFurigana={showFurigana}
                />
              </p>
              
              <div className="options-list">
                {question.options.map((option, optionIndex) => (
                  <label 
                    key={optionIndex}
                    className={`option-label ${answers[question.id] === optionIndex ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => selectAnswer(question.id, optionIndex)}
                    />
                    <span className="option-letter">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="option-text">
                      <FuriganaDisplay 
                        text={option} 
                        showFurigana={showFurigana}
                      />
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="questions-actions">
          <button 
            className="back-btn"
            onClick={() => setViewState('listening')}
          >
            ← Back to Audio
          </button>
          <button 
            className="submit-btn"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0}
          >
            Submit Answers
          </button>
        </div>
      </div>
    );
  };

  const renderResultsView = () => {
    if (!result || !currentPassage) return null;
    
    return (
      <div className="results-view">
        <div className="results-header">
          <h2>Results</h2>
          <div className="score-circle" style={{
            background: `conic-gradient(
              ${result.score >= 80 ? '#4ade80' : result.score >= 60 ? '#fbbf24' : '#f87171'} 
              ${result.score * 3.6}deg, 
              #374151 0deg
            )`
          }}>
            <span className="score-value">{result.score}%</span>
          </div>
        </div>
        
        <div className="results-stats">
          <div className="stat-item">
            <span className="stat-label">Correct</span>
            <span className="stat-value correct">
              {result.correctCount} / {result.totalQuestions}
            </span>
          </div>
          {result.listeningTimeSeconds && (
            <div className="stat-item">
              <span className="stat-label">Listening Time</span>
              <span className="stat-value">{formatTime(result.listeningTimeSeconds)}</span>
            </div>
          )}
        </div>

        {/* Transcript reveal section */}
        {!showTranscript ? (
          <div className="transcript-reveal">
            <button 
              className="show-transcript-btn"
              onClick={handleShowTranscript}
            >
              📜 Show Transcript
            </button>
          </div>
        ) : transcript && (
          <div className="transcript-section">
            <h3>Transcript</h3>
            <div className="transcript-content">
              <FuriganaDisplay 
                text={transcript.japaneseText || transcript.transcript} 
                showFurigana={showFurigana}
                className="transcript-text"
              />
            </div>
          </div>
        )}
        
        <div className="answers-review">
          <h3>Review Answers</h3>
          {result.results.map((answer, index) => {
            const question = questions.find(q => q.id === answer.questionId);
            return (
              <div 
                key={answer.questionId}
                className={`answer-review ${answer.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="answer-review-header">
                  <span className="question-number">{index + 1}</span>
                  <span className="answer-status">
                    {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                  <span className="question-type">{TYPE_LABELS[answer.questionType]}</span>
                </div>
                
                <p className="question-text">
                  <FuriganaDisplay 
                    text={question?.question_text || ''} 
                    showFurigana={showFurigana}
                  />
                </p>
                
                <div className="answer-details">
                  <div className="your-answer">
                    <span className="label">Your answer:</span>
                    <span className={`value ${answer.isCorrect ? 'correct' : 'wrong'}`}>
                      {String.fromCharCode(65 + answer.selectedOption)}. {' '}
                      <FuriganaDisplay 
                        text={question?.options[answer.selectedOption] || ''} 
                        showFurigana={showFurigana}
                      />
                    </span>
                  </div>
                  
                  {!answer.isCorrect && (
                    <div className="correct-answer">
                      <span className="label">Correct answer:</span>
                      <span className="value correct">
                        {String.fromCharCode(65 + answer.correctAnswer)}. {' '}
                        <FuriganaDisplay 
                          text={question?.options[answer.correctAnswer] || ''} 
                          showFurigana={showFurigana}
                        />
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="explanation">
                  <span className="label">Explanation:</span>
                  <p>
                    <FuriganaDisplay 
                      text={answer.explanation} 
                      showFurigana={showFurigana}
                    />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="results-actions">
          <button 
            className="back-btn"
            onClick={() => {
              setViewState('list');
              reset();
            }}
          >
            ← Back to List
          </button>
          <button 
            className="next-btn"
            onClick={goToNextPassage}
          >
            Next Passage →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <Header
        title="Listening Practice"
        icon="🎧"
        onBack={viewState !== 'list' ? () => {
          if (viewState === 'listening') {
            setViewState('list');
            reset();
          } else if (viewState === 'questions') {
            setViewState('listening');
          } else if (viewState === 'results') {
            setViewState('list');
            reset();
          }
        } : undefined}
        showBackButton={true}
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
      
      <main className="listening-mode-container">
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
        {viewState === 'list' && renderPassageList()}
        {viewState === 'listening' && renderListeningView()}
        {viewState === 'questions' && renderQuestionsView()}
        {viewState === 'results' && renderResultsView()}
      </main>
    </div>
  );
};

export default ListeningMode;
