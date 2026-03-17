import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFurigana } from '../../hooks/useFurigana';
import { Header } from '../Header/index.js';
import { API_URL } from '../../config/api.js';
import './GrammarMode.css';

interface GrammarPattern {
  id: number;
  pattern: string;
  category: string;
  jlpt_level: string;
  formation_rules: any[];
  examples: any[];
  common_mistakes: any[];
  ease_factor?: number;
  streak?: number;
  total_attempts?: number;
  correct_attempts?: number;
}

interface GrammarExercise {
  id: number;
  type: 'construction' | 'transformation' | 'error_correction' | 'fill_blank';
  prompt: string;
  context: string;
  correct_answer: string;
  hints: any[];
  difficulty: number;
}

type ExerciseState = 'loading' | 'prompt' | 'input' | 'processing' | 'feedback';

export const GrammarMode: React.FC = () => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<GrammarPattern[]>([]);
  const [currentPattern, setCurrentPattern] = useState<GrammarPattern | null>(null);
  const [exercise, setExercise] = useState<GrammarExercise | null>(null);
  const [state, setState] = useState<ExerciseState>('loading');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);

  const STORAGE_KEY = 'grammar_selected_categories';
  const FURIGANA_STORAGE_KEY = 'grammar_show_furigana';


  const password = localStorage.getItem('speech_practice_password') || '';

  // Load patterns and stats on mount
  useEffect(() => {
    loadPatterns();
    loadDuePatterns();
  }, []);

  // Load selected categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedCategories(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved categories:', e);
      }
    }
  }, []);

  // Save selected categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  // Load furigana preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(FURIGANA_STORAGE_KEY);
    if (saved !== null) {
      setShowFurigana(saved === 'true');
    }
  }, []);

  // Save furigana preference to localStorage
  useEffect(() => {
    localStorage.setItem(FURIGANA_STORAGE_KEY, showFurigana.toString());
  }, [showFurigana]);

  const loadPatterns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/grammar/patterns`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setPatterns(data.patterns);
        // Extract unique categories
        const cats = [...new Set(data.patterns.map((p: GrammarPattern) => p.category))] as string[];
        setCategories(cats);
        // Select all categories by default if nothing saved
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved && cats.length > 0) {
          setSelectedCategories(cats);
        }
      }
    } catch (err) {
      console.error('Failed to load patterns:', err);
    }
  };

  const loadDuePatterns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/grammar/review`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setDueCount(data.count);
      }
    } catch (err) {
      console.error('Failed to load due patterns:', err);
    }
  };

  const startReview = async () => {
    try {
      const response = await fetch(`${API_URL}/api/grammar/review`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.patterns.length > 0) {
          const firstPattern = data.patterns[0];
          setCurrentPattern(firstPattern);
          await loadExercise(firstPattern.id);
        }
      }
    } catch (err) {
      console.error('Failed to start review:', err);
    }
  };

  const loadExercise = async (patternId: number) => {
    setState('loading');
    try {
      const response = await fetch(`${API_URL}/api/grammar/patterns/${patternId}/exercise`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setExercise(data.exercise);
        setUserAnswer('');
        setState('input');
      }
    } catch (err) {
      console.error('Failed to load exercise:', err);
    }
  };

  const startPattern = async (pattern: GrammarPattern) => {
    setCurrentPattern(pattern);
    await loadExercise(pattern.id);
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    
    setState('processing');

    // Smart answer verification with Levenshtein distance and kanji strict + kana lenient
    const verifyAnswer = (user: string, correct: string): { isCorrect: boolean; similarity: number; issues: string[] } => {
      const issues: string[] = [];
      
      // Helper: Check if char is kanji
      const isKanji = (char: string) => /[\u4e00-\u9faf]/.test(char);
      
      // Step 1: Normalize (remove punctuation, whitespace)
      const normalize = (text: string) => text
        .trim()
        .replace(/[。．、，！？・…ー〜〃〄々〆〇〈〉《》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟]/g, '')
        .replace(/[.!,?…\-~"'""''()[\]{}]/g, '')
        .replace(/\s+/g, '');
      
      const normUser = normalize(user);
      const normCorrect = normalize(correct);
      
      // Step 2: Exact match after normalization = correct
      if (normUser === normCorrect) {
        return { isCorrect: true, similarity: 100, issues: [] };
      }
      
      // Step 3: Kanji strict check - kanji must match exactly
      const userKanji = [...normUser].filter(isKanji).join('');
      const correctKanji = [...normCorrect].filter(isKanji).join('');
      
      if (userKanji !== correctKanji) {
        issues.push('Kanji mismatch');
        // Kanji are crucial - if different, it's wrong
        return { isCorrect: false, similarity: 50, issues };
      }
      
      // Step 4: Levenshtein distance for kana parts
      const levenshtein = (a: string, b: string): number => {
        const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + cost
            );
          }
        }
        return matrix[a.length][b.length];
      };
      
      const distance = levenshtein(normUser, normCorrect);
      const maxLen = Math.max(normUser.length, normCorrect.length);
      const similarity = Math.round((1 - distance / maxLen) * 100);
      
      // Step 5: Kana lenient - allow small differences (は↔が, です↔だ, etc.)
      // Accept if: distance ≤ 3 OR similarity ≥ 85%
      const isCloseEnough = distance <= 3 || similarity >= 85;
      
      if (!isCloseEnough) {
        issues.push(`Too many differences (${distance} chars)`);
      }
      
      return { 
        isCorrect: isCloseEnough, 
        similarity, 
        issues: isCloseEnough ? [] : issues 
      };
    };

    const verification = verifyAnswer(userAnswer, exercise?.correct_answer || '');
    const isCorrect = verification.isCorrect;
    const result = isCorrect ? 'correct' : 'wrong';

    try {
      const response = await fetch(`${API_URL}/api/grammar/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password
        },
        body: JSON.stringify({
          patternId: currentPattern?.id,
          exerciseId: exercise?.id,
          userSentence: userAnswer,
          result: result,
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback({
          correct: isCorrect,
          userAnswer: userAnswer,
          correctAnswer: exercise?.correct_answer,
          progress: data.progress
        });
        setState('feedback');
        loadDuePatterns();
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      setState('input');
    }
  };

  const handleNext = () => {
    if (currentPattern) {
      loadExercise(currentPattern.id);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(categories);
  };

  const deselectAllCategories = () => {
    setSelectedCategories([]);
  };

  const filteredPatterns = patterns.filter(p => selectedCategories.includes(p.category));

  // Sub-component for pattern cards with furigana
  const PatternCard: React.FC<{
    pattern: GrammarPattern;
    showFurigana: boolean;
    onClick: () => void;
  }> = ({ pattern, showFurigana, onClick }) => {
    const { furigana } = useFurigana(pattern.pattern, showFurigana);
    
    return (
      <div className="pattern-card" onClick={onClick}>
        <div className="pattern-header">
          <span className="pattern-text">
            {showFurigana && furigana ? (
              <span dangerouslySetInnerHTML={{ __html: furigana }} />
            ) : (
              pattern.pattern
            )}
          </span>
          <span className="pattern-level">{pattern.jlpt_level}</span>
        </div>
        <div className="pattern-category">{pattern.category}</div>
        {(pattern.streak ?? 0) > 0 && (
          <div className="pattern-streak">🔥 {pattern.streak}</div>
        )}
      </div>
    );
  };

  // Sub-component for exercise display with furigana
  const ExerciseDisplay: React.FC<{
    text: string;
    showFurigana: boolean;
    className?: string;
  }> = ({ text, showFurigana, className = '' }) => {
    const { furigana } = useFurigana(text, showFurigana);
    
    return (
      <span className={className}>
        {showFurigana && furigana ? (
          <span dangerouslySetInnerHTML={{ __html: furigana }} />
        ) : (
          text
        )}
      </span>
    );
  };

  const handleHeaderBack = () => {
    if (currentPattern) {
      setCurrentPattern(null);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="grammar-mode">
      <Header
        title="Grammar Drills"
        icon="📚"
        onBack={currentPattern || dueCount > 0 ? handleHeaderBack : undefined}
        showBackButton={true}
        actions={
          <>
            {!currentPattern && (
              <div className="grammar-stats">
                {dueCount > 0 && (
                  <span className="due-badge">{dueCount} due</span>
                )}
                <span>{patterns.length} patterns</span>
              </div>
            )}
            <button
              className="furigana-toggle"
              onClick={() => setShowFurigana(!showFurigana)}
              title={showFurigana ? 'Hide furigana' : 'Show furigana'}
            >
              {showFurigana ? 'あ' : '漢'}
            </button>
          </>
        }
      />

      {!currentPattern ? (
        <div className="pattern-selection">
          {dueCount > 0 && (
            <div className="review-banner">
              <span>🔥 {dueCount} patterns ready for review</span>
              <button className="review-btn" onClick={startReview}>
                Start Review
              </button>
            </div>
          )}
          <div className="category-filter">
            <div className="category-filter-header">
              <label className="filter-label">Categories:</label>
              <div className="filter-actions">
                <button className="filter-btn" onClick={selectAllCategories}>Select All</button>
                <button className="filter-btn" onClick={deselectAllCategories}>Deselect All</button>
              </div>
            </div>
            <div className="category-checkboxes">
              {categories.map(cat => (
                <label key={cat} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedCategories.length === 0 ? (
            <div className="no-selection">
              <p>Select at least one category to see patterns</p>
            </div>
          ) : (
            <div className="patterns-grid">
              {filteredPatterns.map(pattern => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  showFurigana={showFurigana}
                  onClick={() => startPattern(pattern)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="exercise-container">
          <div className="pattern-info">
            <h3>
              <ExerciseDisplay text={currentPattern.pattern} showFurigana={showFurigana} />
            </h3>
            <p className="category">{currentPattern.category}</p>
          </div>

          {state === 'loading' && <div className="loading">Loading exercise...</div>}

          {state === 'input' && exercise && (
            <div className="exercise-prompt">
              <div className="prompt-type">{exercise.type.replace('_', ' ')}</div>
              <p className="prompt-text">
                <ExerciseDisplay text={exercise.prompt} showFurigana={showFurigana} />
              </p>
              {exercise.context && (
                <p className="context">
                  <ExerciseDisplay text={exercise.context} showFurigana={showFurigana} />
                </p>
              )}
              
              <div className="input-section">
                <p>Type your answer:</p>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Your answer in Japanese..."
                  className="answer-input"
                  autoFocus
                />
                <button 
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {state === 'processing' && <div className="processing">Checking...</div>}

          {state === 'feedback' && feedback && (
            <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              <div className="feedback-result">
                {feedback.correct ? '✅ Correct!' : '❌ Not quite'}
              </div>
              
              <div className="answer-comparison">
                <div className="your-answer">
                  <label>Your answer:</label>
                  <p>
                    <ExerciseDisplay text={feedback.userAnswer} showFurigana={showFurigana} />
                  </p>
                </div>
                {!feedback.correct && (
                  <div className="correct-answer">
                    <label>Correct answer:</label>
                    <p>
                      <ExerciseDisplay text={feedback.correctAnswer} showFurigana={showFurigana} />
                    </p>
                  </div>
                )}
              </div>

              {feedback.progress && (
                <div className="progress-update">
                  <span>Streak: {feedback.progress.streak}</span>
                  <span>Next review: {feedback.progress.interval_days} days</span>
                </div>
              )}

              <button className="next-btn" onClick={handleNext}>
                Next Exercise →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarMode;
