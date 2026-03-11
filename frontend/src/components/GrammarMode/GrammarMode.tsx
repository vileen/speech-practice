import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const STORAGE_KEY = 'grammar_selected_categories';

  const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');
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
    if (selectedCategories.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]);

  const loadPatterns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/grammar/patterns?limit=100`, {
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

    // Simple validation (exact match for now)
    const isCorrect = userAnswer.trim() === exercise?.correct_answer?.trim();
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

  const filteredPatterns = selectedCategories.length > 0
    ? patterns.filter(p => selectedCategories.includes(p.category))
    : patterns;

  return (
    <div className="grammar-mode">
      <header className="grammar-header">
        {!currentPattern ? (
          <>
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back
            </button>
            <h2>📚 Grammar Drills</h2>
            <div className="grammar-stats">
              {dueCount > 0 && (
                <span className="due-badge">{dueCount} due</span>
              )}
              <span>{patterns.length} patterns</span>
            </div>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={() => setCurrentPattern(null)}>
              ← Back
            </button>
            <h2>Grammar Drills</h2>
            <div style={{ width: '60px' }}></div>
          </>
        )}
      </header>

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

          <div className="patterns-grid">
            {filteredPatterns.map(pattern => (
              <div
                key={pattern.id}
                className="pattern-card"
                onClick={() => startPattern(pattern)}
              >
                <div className="pattern-header">
                  <span className="pattern-text">{pattern.pattern}</span>
                  <span className="pattern-level">{pattern.jlpt_level}</span>
                </div>
                <div className="pattern-category">{pattern.category}</div>
                {(pattern.streak ?? 0) > 0 && (
                  <div className="pattern-streak">🔥 {pattern.streak}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="exercise-container">
          <div className="pattern-info">
            <h3>{currentPattern.pattern}</h3>
            <p className="category">{currentPattern.category}</p>
          </div>

          {state === 'loading' && <div className="loading">Loading exercise...</div>}

          {state === 'input' && exercise && (
            <div className="exercise-prompt">
              <div className="prompt-type">{exercise.type.replace('_', ' ')}</div>
              <p className="prompt-text">{exercise.prompt}</p>
              {exercise.context && (
                <p className="context">{exercise.context}</p>
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
                  <p>{feedback.userAnswer}</p>
                </div>
                {!feedback.correct && (
                  <div className="correct-answer">
                    <label>Correct answer:</label>
                    <p>{feedback.correctAnswer}</p>
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
