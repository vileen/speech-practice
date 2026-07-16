import React from 'react';
import { ListeningPassage } from '../../hooks/useListeningMode.js';

const SPEED_OPTIONS = [
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.25x', value: 1.25 },
];

const LEVEL_COLORS: Record<string, string> = {
  N5: '#4ade80',
  N4: '#60a5fa',
  N3: '#fbbf24',
};

interface ListeningPlayerProps {
  currentPassage: ListeningPassage;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  onPlayPause: () => void;
  onReplay: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSpeedChange: (speed: number) => void;
  onContinue: () => void;
  disabledContinue: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ListeningPlayer: React.FC<ListeningPlayerProps> = ({
  currentPassage,
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  onPlayPause,
  onReplay,
  onSeek,
  onSpeedChange,
  onContinue,
  disabledContinue,
}) => {
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

      <div className="audio-player">
        <div className={`audio-visualizer ${isPlaying ? 'playing' : ''}`}>
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="wave-bar" 
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        <div className="progress-container">
          <span className="time-current">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="progress-bar"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={onSeek}
          />
          <span className="time-total">{formatTime(duration)}</span>
        </div>

        <div className="player-controls">
          <button 
            className="control-btn replay-btn"
            onClick={onReplay}
            title="Replay"
          >
            ↺
          </button>
          
          <button 
            className="control-btn play-btn"
            onClick={onPlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className="speed-control">
            {SPEED_OPTIONS.map(speed => (
              <button
                key={speed.value}
                className={`speed-btn ${playbackSpeed === speed.value ? 'active' : ''}`}
                onClick={() => onSpeedChange(speed.value)}
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
          onClick={onContinue}
          disabled={disabledContinue}
        >
          Continue to Questions →
        </button>
      </div>
    </div>
  );
};
