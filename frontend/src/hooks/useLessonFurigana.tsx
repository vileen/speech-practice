import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '../config/api.js';

const FURIGANA_CACHE_VERSION = '3';

interface FuriganaCacheEntry {
  furigana: string;
  timestamp: number;
  version: string;
}

interface UseLessonFuriganaResult {
  furiganaCache: Record<string, FuriganaCacheEntry>;
  furiganaLoading: Record<string, boolean>;
  furiganaFailed: Record<string, boolean>;
  fetchFurigana: (text: string) => Promise<string>;
  generateFuriganaFromReading: (text: string, reading: string | null | undefined) => string | null;
  renderFurigana: (
    text: string,
    showFurigana: boolean,
    reading?: string | null
  ) => string | React.ReactElement;
  prefetchLessonFurigana: (lesson: {
    vocabulary: Array<{ jp: string }>;
    grammar: Array<{
      pattern: string;
      explanation: string;
      examples: Array<{ jp: string }>;
    }>;
    practice_phrases: Array<{ jp: string }>;
  }) => void;
}

export function useLessonFurigana(password: string): UseLessonFuriganaResult {
  // Load furigana cache from localStorage on init
  const loadFuriganaCacheFromStorage = (): Record<string, FuriganaCacheEntry> => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('furiganaCache');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check version - invalidate if different
        const cachedVersion = localStorage.getItem('furiganaCacheVersion');
        if (cachedVersion !== FURIGANA_CACHE_VERSION) {
          localStorage.removeItem('furiganaCache');
          localStorage.setItem('furiganaCacheVersion', FURIGANA_CACHE_VERSION);
          return {};
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading furigana cache:', e);
    }
    return {};
  };

  const [furiganaCache, setFuriganaCache] = useState<Record<string, FuriganaCacheEntry>>(loadFuriganaCacheFromStorage());
  const [furiganaLoading, setFuriganaLoading] = useState<Record<string, boolean>>({});
  const [furiganaFailed, setFuriganaFailed] = useState<Record<string, boolean>>({});

  // Use refs to avoid dependency loops in useEffect
  const furiganaCacheRef = useRef<Record<string, FuriganaCacheEntry>>({});
  const furiganaLoadingRef = useRef<Record<string, boolean>>({});
  const furiganaFailedRef = useRef<Record<string, boolean>>({});

  // Keep refs in sync with state
  useEffect(() => { furiganaCacheRef.current = furiganaCache; }, [furiganaCache]);
  useEffect(() => { furiganaLoadingRef.current = furiganaLoading; }, [furiganaLoading]);
  useEffect(() => { furiganaFailedRef.current = furiganaFailed; }, [furiganaFailed]);

  // Save furigana cache to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('furiganaCache', JSON.stringify(furiganaCache));
      localStorage.setItem('furiganaCacheVersion', FURIGANA_CACHE_VERSION);
    }
  }, [furiganaCache]);

  // Fetch furigana from backend - uses refs to avoid dependency loops
  const fetchFurigana = useCallback(async (text: string): Promise<string> => {
    // Check cache using ref to avoid dependency loop
    const cached = furiganaCacheRef.current[text];
    if (cached && cached.furigana) {
      return cached.furigana;
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
        // Cache the result with metadata for versioning/invalidation
        furiganaCacheRef.current = {
          ...furiganaCacheRef.current,
          [text]: {
            furigana: withFurigana,
            timestamp: Date.now(),
            version: FURIGANA_CACHE_VERSION
          }
        };
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

  // Generate furigana HTML from reading field
  // Example: text="安い", reading="やす" -> "<ruby>安<rt>やす</rt></ruby>い"
  const generateFuriganaFromReading = useCallback((text: string, reading: string | null | undefined): string | null => {
    if (!reading || !text) return null;

    // Check if text has kanji
    const kanjiRegex = /[\u4e00-\u9faf]/;
    if (!kanjiRegex.test(text)) return null; // Pure hiragana/katakana - no furigana needed

    // Find the kanji portion (everything until first hiragana)
    let kanjiEnd = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      // Kanji range
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
  }, []);

  const renderFurigana = useCallback((): any => {
    return (text: string, showFurigana: boolean, reading?: string | null): string | React.ReactElement => {
      if (!showFurigana) return text;

      // Generate furigana from reading field (new approach - future-proof!)
      if (reading) {
        const furiganaHtml = generateFuriganaFromReading(text, reading);
        if (furiganaHtml) {
          return <span dangerouslySetInnerHTML={{ __html: furiganaHtml }} />;
        }
      }

      // Fallback: If we have cached furigana in memory, use it (legacy support)
      const cached = furiganaCacheRef.current[text] || furiganaCache[text];
      if (cached && cached.furigana) {
        return <span dangerouslySetInnerHTML={{ __html: cached.furigana }} />;
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

      // Otherwise show plain text
      return text;
    };
  }, [furiganaCache, furiganaFailed, generateFuriganaFromReading]);

  // Prefetch all furigana for a lesson
  const prefetchLessonFurigana = useCallback((lesson: {
    vocabulary: Array<{ jp: string }>;
    grammar: Array<{
      pattern: string;
      explanation: string;
      examples: Array<{ jp: string }>;
    }>;
    practice_phrases: Array<{ jp: string }>;
  }) => {
    const textsToFetch: string[] = [];

    // Collect all Japanese text that needs furigana (check cache ref to avoid dependency loop)
    lesson.vocabulary.forEach(item => {
      if (!furiganaCacheRef.current[item.jp]) textsToFetch.push(item.jp);
    });

    lesson.grammar.forEach(item => {
      // Collect pattern text
      if (!furiganaCacheRef.current[item.pattern]) textsToFetch.push(item.pattern);
      // Collect explanation text (split by lines and filter for Japanese text)
      (item.explanation || '').split('\n').forEach(line => {
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

    lesson.practice_phrases.forEach(phrase => {
      if (!furiganaCacheRef.current[phrase.jp]) textsToFetch.push(phrase.jp);
    });

    // Fetch furigana for all texts (with small delays to avoid overwhelming the API)
    textsToFetch.forEach((text, index) => {
      setTimeout(() => {
        fetchFurigana(text);
      }, index * 50); // 50ms delay between requests
    });
  }, [fetchFurigana]);

  return {
    furiganaCache,
    furiganaLoading,
    furiganaFailed,
    fetchFurigana,
    generateFuriganaFromReading,
    renderFurigana: renderFurigana(),
    prefetchLessonFurigana,
  };
}
