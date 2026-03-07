import { useState, useEffect, useRef } from 'react';
import './HighlightedText.css';

interface HighlightedTextProps {
  text: string;
  reading?: string | null;  // Reading for furigana generation
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  preloadedFurigana?: string | null;  // Optional preloaded HTML
}

// Generate furigana HTML from reading field
// Example: text="安い", reading="やす" -> "<ruby>安<rt>やす</rt></ruby>い"
function generateFurigana(text: string, reading: string | null | undefined): string | null {
  if (!reading || !text) return null;
  
  // Check if text has kanji
  const kanjiRegex = /[\u4e00-\u9faf]/;
  if (!kanjiRegex.test(text)) return null; // Pure hiragana/katakana - no furigana needed
  
  // Find the kanji portion (everything until first hiragana)
  let kanjiEnd = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (kanjiRegex.test(char)) {
      kanjiEnd = i + 1;
    } else if (/[ぁ-ん]/.test(char)) {
      // Hiragana found - this is okurigana, stop here
      break;
    }
  }
  
  const kanjiPart = text.substring(0, kanjiEnd);
  const okurigana = text.substring(kanjiEnd);
  
  if (kanjiPart.length === 0) return null;
  
  // Generate ruby HTML
  return `<ruby>${kanjiPart}<rt>${reading}</rt></ruby>${okurigana}`;
}

// Split text into segments
function splitText(text: string): string[] {
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  
  if (hasJapanese) {
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
    return text.split(/(\s+)/).filter(s => s.trim() !== '');
  }
}

export function HighlightedText({ 
  text, 
  reading, 
  audioElement, 
  isPlaying,
  preloadedFurigana 
}: HighlightedTextProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const rafRef = useRef<number | null>(null);
  
  const segments = splitText(text);
  
  // Generate furigana from reading if available, otherwise use preloaded
  const furiganaHtml = reading 
    ? generateFurigana(text, reading) 
    : preloadedFurigana;
  
  useEffect(() => {
    console.log('[HighlightedText] Effect triggered:', { hasAudio: !!audioElement, isPlaying });
    
    if (!audioElement || !isPlaying) {
      console.log('[HighlightedText] Stopping - no audio or not playing');
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    
    console.log('[HighlightedText] Starting animation frame loop');
    const updateTime = () => {
      if (audioElement) {
        setCurrentTime(audioElement.currentTime);
        setDuration(audioElement.duration || 0);
      }
      rafRef.current = requestAnimationFrame(updateTime);
    };
    
    rafRef.current = requestAnimationFrame(updateTime);
    
    return () => {
      console.log('[HighlightedText] Cleanup');
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [audioElement, isPlaying]);
  
  const getHighlightedIndex = (): number => {
    if (!duration || duration === 0 || segments.length === 0) return -1;
    
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
  
  console.log('[HighlightedText] Render:', { segments: segments.length, highlightedIndex, currentTime: currentTime.toFixed(2), duration: duration.toFixed(2) });
  
  // If we have furigana HTML, render it with highlighting
  if (furiganaHtml && !isPlaying) {
    return <span dangerouslySetInnerHTML={{ __html: furiganaHtml }} />;
  }
  
  if (furiganaHtml && isPlaying) {
    // For playing with furigana, we'd need more complex parsing
    // For now, just show highlighted plain text
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
  
  // No furigana, just show text with optional highlighting
  if (!isPlaying) {
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
