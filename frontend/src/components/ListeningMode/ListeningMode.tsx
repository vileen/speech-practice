import React, { useState, useRef, useEffect } from 'react';
import './ListeningMode.css';
import { useListeningMode } from '../../hooks/useListeningMode.js';
import { Header } from '../Header/index.js';
import { PassageList } from './PassageList.js';
import { ListeningPlayer } from './ListeningPlayer.js';
import { QuestionsView } from './QuestionsView.js';
import { ResultsView } from './ResultsView.js';

const FURIGANA_STORAGE_KEY = 'listening_show_furigana';

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

  const handleBack = () => {
    if (viewState === 'listening') {
      setViewState('list');
      reset();
    } else if (viewState === 'questions') {
      setViewState('listening');
    } else if (viewState === 'results') {
      setViewState('list');
      reset();
    }
  };

  return (
    <div className="app">
      <Header
        title="Listening Practice"
        icon="🎧"
        onBack={viewState !== 'list' ? handleBack : undefined}
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
        {viewState === 'list' && (
          <PassageList
            passages={passages}
            loading={loading}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            onPassageClick={startListening}
          />
        )}
        {viewState === 'listening' && currentPassage && (
          <>
            <audio
              ref={audioRef}
              src={currentPassage.audio_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
            <ListeningPlayer
              currentPassage={currentPassage}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              playbackSpeed={playbackSpeed}
              onPlayPause={handlePlayPause}
              onReplay={handleReplay}
              onSeek={handleSeek}
              onSpeedChange={setPlaybackSpeed}
              onContinue={() => setViewState('questions')}
              disabledContinue={currentTime === 0}
            />
          </>
        )}
        {viewState === 'questions' && currentPassage && (
          <QuestionsView
            questions={questions}
            answers={answers}
            showFurigana={showFurigana}
            onSelectAnswer={selectAnswer}
            onSubmit={handleSubmit}
            onBack={() => setViewState('listening')}
          />
        )}
        {viewState === 'results' && result && currentPassage && (
          <ResultsView
            result={result}
            questions={questions}
            transcript={transcript}
            showTranscript={showTranscript}
            showFurigana={showFurigana}
            onShowTranscript={handleShowTranscript}
            onBack={() => {
              setViewState('list');
              reset();
            }}
            onNext={goToNextPassage}
          />
        )}
      </main>
    </div>
  );
};

export default ListeningMode;
