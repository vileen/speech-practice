import { useState, useEffect, useRef } from 'react';
import './AudioPlayer.css';

interface AudioPlayerProps {
  audioUrl: string;
  volume: number;
  isActive: boolean;
  onPlay: (audio: HTMLAudioElement) => void;
  onPause: () => void;
  onStop: () => void;
  onStopOthers: () => void;
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ audioUrl, volume, isActive, onPlay: _onPlay, onPause, onStop, onStopOthers }: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Initialize audio when URL changes
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audio.preload = 'auto';
    
    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });
    
    audio.addEventListener('canplay', () => {
      if (isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });
    
    audio.addEventListener('ended', () => {
      onStop();
      setProgress(0);
      setCurrentTime(0);
    });
    
    audio.addEventListener('pause', () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    });
    
    audioRef.current = audio;
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl, onStop]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle play/pause based on isActive prop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isActive) {
      // Start playing
      const playAudio = async () => {
        try {
          onStopOthers();
          await audio.play();
          
          const updateProgress = () => {
            if (audio && !audio.paused) {
              const currentProgress = (audio.currentTime / audio.duration) * 100;
              setProgress(isFinite(currentProgress) ? currentProgress : 0);
              setCurrentTime(audio.currentTime);
              rafRef.current = requestAnimationFrame(updateProgress);
            }
          };
          
          rafRef.current = requestAnimationFrame(updateProgress);
        } catch (error) {
          console.error('Error playing audio:', error);
          onStop();
        }
      };
      
      playAudio();
    } else {
      // Stop playing
      audio.pause();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive, onStop, onStopOthers]);

  // Handle click on progress bar
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !progressBarRef.current || !isFinite(audio.duration)) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * audio.duration;
    
    if (isFinite(newTime)) {
      audio.currentTime = newTime;
      setProgress(newProgress);
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="audio-player">
      <button
        className="play-btn"
        onClick={() => {
          const audio = audioRef.current;
          if (!audio) return;

          if (isActive) {
            // Pause (preserve position)
            audio.pause();
            onPause();
          } else {
            // Play from current position
            _onPlay(audio);
          }
        }}
        aria-label={isActive ? 'Pause' : 'Play'}
      >
        {isActive ? '⏸️' : '▶️'}
      </button>
      <button
        className="stop-btn"
        onClick={() => {
          const audio = audioRef.current;
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
          setProgress(0);
          setCurrentTime(0);
          onStop();
        }}
        aria-label="Stop"
        disabled={!isActive && currentTime === 0}
      >
        ⏹️
      </button>
      <div 
        className="progress-bar-container"
        ref={progressBarRef}
        onClick={handleProgressClick}
      >
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
