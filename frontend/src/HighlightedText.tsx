import { useState, useEffect, useRef } from 'react';
import './HighlightedText.css';

interface HighlightedTextProps {
  text: string;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

// Split text into segments (words for English, characters/words for Japanese)
function splitText(text: string): string[] {
  // Check if text contains Japanese characters
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  
  if (hasJapanese) {
    // For Japanese, split by meaningful units (roughly: particles, words)
    // This is a simple approximation - splitting by spaces and punctuation
    // while keeping Japanese characters together
    const segments: string[] = [];
    let current = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isSpace = /\s/.test(char);
      const isPunctuation = /[。、！？\.,!?]/.test(char);
      
      if (isSpace) {
        if (current) {
          segments.push(current);
          current = '';
        }
      } else if (isPunctuation) {
        if (current) {
          segments.push(current);
          current = '';
        }
        segments.push(char);
      } else {
        current += char;
      }
    }
    
    if (current) {
      segments.push(current);
    }
    
    return segments.filter(s => s.trim() !== '');
  } else {
    // For English/non-Japanese, split by spaces
    return text.split(/(\s+)/).filter(s => s.trim() !== '');
  }
}

export function HighlightedText({ text, audioElement, isPlaying }: HighlightedTextProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const rafRef = useRef<number | null>(null);
  
  const segments = splitText(text);
  
  useEffect(() => {
    if (!audioElement || !isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    
    const updateTime = () => {
      if (audioElement) {
        setCurrentTime(audioElement.currentTime);
        setDuration(audioElement.duration || 0);
      }
      rafRef.current = requestAnimationFrame(updateTime);
    };
    
    rafRef.current = requestAnimationFrame(updateTime);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [audioElement, isPlaying]);
  
  // Calculate which segment should be highlighted
  const getHighlightedIndex = (): number => {
    if (!duration || duration === 0 || segments.length === 0) return -1;
    
    // Distribute time roughly evenly among segments
    // Weight by segment length for better accuracy
    const totalLength = segments.reduce((sum, seg) => sum + seg.length, 0);
    
    let accumulatedTime = 0;
    for (let i = 0; i < segments.length; i++) {
      const segmentDuration = (segments[i].length / totalLength) * duration;
      if (currentTime < accumulatedTime + segmentDuration) {
        return i;
      }
      accumulatedTime += segmentDuration;
    }
    
    return segments.length - 1;
  };
  
  const highlightedIndex = isPlaying ? getHighlightedIndex() : -1;
  
  if (!isPlaying) {
    // When not playing, just render plain text
    return <>{text}</>;
  }
  
  return (
    <span className="highlighted-text">
      {segments.map((segment, idx) => (
        <span
          key={idx}
          className={`text-segment ${idx === highlightedIndex ? 'highlighted' : ''}`}
        >
          {segment}
        </span>
      ))}
    </span>
  );
}
