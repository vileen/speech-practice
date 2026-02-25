import { useState, useRef, useCallback } from 'react';

interface UseAudioPlayerResult {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: (audioUrl: string) => void;
  pause: () => void;
  stop: () => void;
}

export function useAudioPlayer(volume: number = 0.8): UseAudioPlayerResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const play = useCallback((audioUrl: string) => {
    // Stop any currently playing audio
    stop();

    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('error', () => {
      setIsPlaying(false);
      console.error('Audio playback error');
    });

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.error('Failed to play audio:', err);
      setIsPlaying(false);
    });
  }, [volume, stop]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    stop,
  };
}
