import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFurigana } from '../../hooks/useFurigana.js';
import { Header } from '../Header/index.js';
import { API_URL } from '../../config/api.js';
import { PatternGraph } from './PatternGraph.js';
import './GrammarMode.css';

export interface GrammarPattern {
  id: number;
  pattern: string;
  category: string;
  jlpt_level: string;
  formation_rules: any[];
  examples: any[];
  common_mistakes: any[];
  related_patterns?: number[];
  ease_factor?: number;
  streak?: number;
  total_attempts?: number;
  correct_attempts?: number;
  confusion_pairs?: number[];
  base_form?: string;           // For counter grouping
  variants?: GrammarPattern[];  // Variants when this is a counter group
  variant_count?: number;       // Number of variants
  isCounterGroup?: boolean;     // Flag for counter base forms
}

interface GrammarExercise {
  id: number;
  type: 'construction' | 'transformation' | 'error_correction' | 'fill_blank' | 'discrimination';
  prompt: string;
  context: string;
  correct_answer: string;
  hints: any[];
  difficulty: number;
  options?: DiscriminationOption[];
}

interface DiscriminationOption {
  pattern_id: number;
  pattern: string;
  category: string;
  is_correct: boolean;
  explanation: string;
}

interface DiscriminationAlert {
  confusedWith: GrammarPattern;
  message: string;
}

type ExerciseState = 'loading' | 'prompt' | 'input' | 'processing' | 'feedback' | 'discrimination_select';
type ReviewMode = 'normal' | 'mixed' | 'discrimination';

// Category Groups for Quick Select
interface CategoryGroup {
  name: string;
  categories: string[];
}

const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
  particles: {
    name: 'Particles',
    categories: ['Particles']
  },
  permission: {
    name: 'Permission/Obligation',
    categories: ['Permission', 'Prohibition', 'Obligation', 'Lack of Obligation']
  },
  adjectives: {
    name: 'Adjectives',
    categories: ['I-Adjectives', 'Na-Adjectives']
  },
  actions: {
    name: 'Actions',
    categories: ['Desire', 'Ability', 'Invitation', 'Suggestion']
  },
  all: {
    name: 'All',
    categories: [] // Populated dynamically based on available categories
  }
};

// Memoized PatternCard - defined outside GrammarMode to prevent rerenders
const PatternCard: React.FC<{
  pattern: GrammarPattern;
  showFurigana: boolean;
  onClick: () => void;
  onCompare?: () => void;
  hasConfusion?: boolean;
}> = React.memo(({ pattern, showFurigana, onClick, onCompare, hasConfusion }) => {
  const { furigana } = useFurigana(pattern.pattern, showFurigana);
  
  return (
    <div className={`pattern-card ${hasConfusion ? 'has-confusion' : ''}`} onClick={onClick}>
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
      {hasConfusion && (
        <div className="confusion-badge">⚠️</div>
      )}
      {onCompare && pattern.related_patterns && pattern.related_patterns.length > 0 && (
        <button 
          className="compare-btn" 
          onClick={(e) => { e.stopPropagation(); onCompare(); }}
          title="Compare with similar patterns"
        >
          Compare
        </button>
      )}
    </div>
  );
});

// Memoized ExerciseDisplay - defined outside GrammarMode to prevent rerenders
const ExerciseDisplay: React.FC<{
  text: string;
  showFurigana: boolean;
  className?: string;
}> = React.memo(({ text, showFurigana, className = '' }) => {
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
});

// Comparison View Component
const ComparisonView: React.FC<{
  patterns: GrammarPattern[];
  showFurigana: boolean;
  onClose: () => void;
  onSelectPattern: (pattern: GrammarPattern) => void;
}> = ({ patterns, showFurigana, onClose, onSelectPattern }) => {
  return (
    <div className="comparison-modal">
      <div className="comparison-content">
        <div className="comparison-header">
          <h3>🔍 Pattern Comparison</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="comparison-grid">
          {patterns.map((pattern, index) => (
            <div key={pattern.id} className="comparison-card">
              <div className="comparison-index">{index + 1}</div>
              <h4>
                <ExerciseDisplay text={pattern.pattern} showFurigana={showFurigana} />
              </h4>
              <span className="comparison-category">{pattern.category}</span>
              
              {/* What this counter counts */}
              {pattern.formation_rules?.some((r: any) => r.counts) && (
                <div className="counter-info">
                  <span className="counter-label">Liczy:</span>
                  <span className="counter-value">
                    {pattern.formation_rules.find((r: any) => r.counts)?.counts}
                  </span>
                  {pattern.formation_rules.find((r: any) => r.usage)?.usage && (
                    <span className="counter-usage">
                      ({pattern.formation_rules.find((r: any) => r.usage)?.usage})
                    </span>
                  )}
                </div>
              )}
              
              <div className="formation-rules">
                <h5>Formation:</h5>
                <ul>
                  {pattern.formation_rules?.filter((r: any) => r.rule).map((rule: any, i: number) => (
                    <li key={i}>
                      {rule.step && <span className="step-num">{rule.step}.</span>}
                      <ExerciseDisplay text={rule.rule} showFurigana={showFurigana} />
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="examples">
                <h5>Examples:</h5>
                {pattern.examples?.slice(0, 2).map((ex, i) => (
                  <div key={i} className="example">
                    <p className="jp">
                      <ExerciseDisplay text={ex.jp} showFurigana={showFurigana} />
                    </p>
                    <p className="en">{ex.en}</p>
                  </div>
                ))}
              </div>
              
              {pattern.common_mistakes?.length > 0 && (
                <div className="common-mistakes">
                  <h5>⚠️ Common Mistakes:</h5>
                  {pattern.common_mistakes?.slice(0, 1).map((m, i) => (
                    <div key={i} className="mistake">
                      <p className="mistake-name">{m.mistake}</p>
                      <p className="mistake-expl">{m.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                className="practice-this-btn"
                onClick={() => onSelectPattern(pattern)}
              >
                Practice This →
              </button>
            </div>
          ))}
        </div>
        
        {patterns.length === 2 && (
          <div className="comparison-diff">
            <h4>🎯 Key Differences</h4>
            <div className="diff-grid">
              <div className="diff-item">
                <span className="diff-pattern">
                  <ExerciseDisplay text={patterns[0].pattern} showFurigana={showFurigana} />
                </span>
                <span className="diff-desc">{patterns[0].category}</span>
              </div>
              <div className="diff-vs">vs</div>
              <div className="diff-item">
                <span className="diff-pattern">
                  <ExerciseDisplay text={patterns[1].pattern} showFurigana={showFurigana} />
                </span>
                <span className="diff-desc">{patterns[1].category}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Discrimination Drill Component
const DiscriminationDrill: React.FC<{
  exercise: GrammarExercise;
  patterns: GrammarPattern[];
  showFurigana: boolean;
  onSelectOption: (option: DiscriminationOption, pattern: GrammarPattern) => void;
}> = ({ exercise, patterns, showFurigana, onSelectOption }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  if (!exercise.options || exercise.options.length === 0) {
    return <div className="discrimination-error">No options available for this drill.</div>;
  }
  
  return (
    <div className="discrimination-drill">
      <div className="discrimination-context">
        <p className="discrimination-prompt">
          <ExerciseDisplay text={exercise.prompt} showFurigana={showFurigana} />
        </p>
        {exercise.context && (
          <p className="discrimination-hint">
            <ExerciseDisplay text={exercise.context} showFurigana={showFurigana} />
          </p>
        )}
      </div>
      
      <div className="discrimination-question">
        <p>Choose the correct pattern:</p>
      </div>
      
      <div className="discrimination-options">
        {exercise.options.map((option, index) => {
          const pattern = patterns.find(p => p.id === option.pattern_id);
          if (!pattern) return null;
          
          const isSelected = selectedOption === option.pattern_id;
          
          return (
            <button
              key={option.pattern_id}
              className={`discrimination-option ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setSelectedOption(option.pattern_id);
                onSelectOption(option, pattern);
              }}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <div className="option-content">
                <span className="option-pattern">
                  <ExerciseDisplay text={option.pattern} showFurigana={showFurigana} />
                </span>
                <span className="option-category">{option.category}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

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
  const [duePatterns, setDuePatterns] = useState<GrammarPattern[]>([]);
  const [showFurigana, setShowFurigana] = useState(true);
  
  // Anti-confusion features
  const [comparisonPatterns, setComparisonPatterns] = useState<GrammarPattern[] | null>(null);
  const [discriminationAlert, setDiscriminationAlert] = useState<DiscriminationAlert | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('normal');
  const [confusionStats, setConfusionStats] = useState<{patternId: number, count: number}[]>([]);
  const [showPatternGraph, setShowPatternGraph] = useState(false);

  // Discrimination drill state
  const [selectedDiscriminationOption, setSelectedDiscriminationOption] = useState<DiscriminationOption | null>(null);
  const [discriminationFeedback, setDiscriminationFeedback] = useState<{isCorrect: boolean; explanation: string} | null>(null);

  // Category Groups accordion state
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const STORAGE_KEY = 'grammar_selected_categories';
  const FURIGANA_STORAGE_KEY = 'grammar_show_furigana';

  const password = localStorage.getItem('speech_practice_password') || '';

  // Load patterns and stats on mount
  useEffect(() => {
    loadPatterns();
    loadDuePatterns();
    loadConfusionStats();
  }, []);

  // Reload due patterns count when selected categories change
  useEffect(() => {
    if (patterns.length > 0) {
      loadDuePatterns();
    }
  }, [selectedCategories]);

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

  // Keyboard shortcut: Space to submit or go to next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ') return;
      
      // Don't trigger if user is typing in an input
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      e.preventDefault();
      
      if (state === 'input' && userAnswer.trim()) {
        handleSubmit();
      } else if (state === 'feedback') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, userAnswer]);

  const loadPatterns = async () => {
    try {
      // Load regular patterns
      const response = await fetch(`${API_URL}/api/grammar/patterns`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        
        // Load counters grouped by base_form
        const countersResponse = await fetch(`${API_URL}/api/grammar/patterns?category=Counters&groupBy=base_form`, {
          headers: { 'X-Password': password }
        });
        
        let allPatterns = data.patterns;
        if (countersResponse.ok) {
          const countersData = await countersResponse.json();
          // Replace individual counters with grouped ones
          allPatterns = [
            ...data.patterns.filter((p: GrammarPattern) => p.category !== 'Counters'),
            ...countersData.patterns
          ];
        }
        
        setPatterns(allPatterns);
        // Extract unique categories
        const cats = [...new Set(allPatterns.map((p: GrammarPattern) => p.category))] as string[];
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
        setDuePatterns(data.patterns || []);
        setDueCount(data.count);
      }
    } catch (err) {
      console.error('Failed to load due patterns:', err);
    }
  };

  // Load counter variants when user clicks on a counter group
  const loadCounterVariants = async (baseForm: string): Promise<GrammarPattern[]> => {
    try {
      const response = await fetch(`${API_URL}/api/grammar/counters/${encodeURIComponent(baseForm)}/variants`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        return data.variants || [];
      }
    } catch (err) {
      console.error('Failed to load counter variants:', err);
    }
    return [];
  };

  const loadConfusionStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/grammar/confusion-stats`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        // Count confusions per pattern
        const counts: Record<number, number> = {};
        data.topConfusions?.forEach((conf: any) => {
          // Find pattern ID by name
          const pattern = patterns.find(p => p.pattern === conf.pattern_name);
          if (pattern) {
            counts[pattern.id] = (counts[pattern.id] || 0) + parseInt(conf.count);
          }
        });
        setConfusionStats(Object.entries(counts).map(([id, count]) => ({ 
          patternId: parseInt(id), 
          count 
        })));
      }
    } catch (err) {
      console.error('Failed to load confusion stats:', err);
    }
  };

  const startReview = async (useSelected: boolean = false, mixed: boolean = false) => {
    try {
      let patternsToReview: GrammarPattern[] = [];

      if (mixed) {
        // Mixed review mode - shuffle patterns from selected categories
        const categoriesParam = selectedCategories.join(',');
        const response = await fetch(
          `${API_URL}/api/grammar/mixed-review?categories=${categoriesParam}&limit=10`,
          { headers: { 'X-Password': password } }
        );
        if (response.ok) {
          const data = await response.json();
          patternsToReview = data.patterns || [];
        }
        setReviewMode('mixed');
      } else if (useSelected && selectedCategories.length > 0) {
        // Use ALL patterns from selected categories (not just due ones)
        patternsToReview = patterns.filter(p => selectedCategories.includes(p.category));
        // Shuffle patterns for variety
        patternsToReview = [...patternsToReview].sort(() => Math.random() - 0.5);
        setReviewMode('normal');
      } else {
        // Use due patterns from API (original behavior)
        const response = await fetch(`${API_URL}/api/grammar/review`, {
          headers: { 'X-Password': password }
        });
        if (response.ok) {
          const data = await response.json();
          patternsToReview = data.patterns || [];
        }
        setReviewMode('normal');
      }

      if (patternsToReview.length > 0) {
        const firstPattern = patternsToReview[0];
        setCurrentPattern(firstPattern);
        await loadExercise(firstPattern.id);
      } else {
        // Build helpful message
        let message = 'No patterns available.';
        if (useSelected) {
          message = 'No patterns found in the selected categories.';
          message += '\n\nTry selecting different categories.';
        } else {
          // Build helpful message showing which categories have due patterns
          const dueCategoriesList = duePatterns.map(p => p.category);
          const uniqueDueCategories = [...new Set(dueCategoriesList)];
          const categoryCounts = uniqueDueCategories.map(cat => {
            const count = duePatterns.filter(p => p.category === cat).length;
            return `${cat} (${count})`;
          });
          
          message = 'No patterns due for review.';
          if (duePatterns.length > 0 && categoryCounts.length > 0) {
            message += `\n\nThe ${duePatterns.length} due patterns are from:\n${categoryCounts.join(', ')}`;
          }
          message += '\n\nTry selecting different categories or browse patterns to learn new ones.';
        }
        
        alert(message);
      }
    } catch (err) {
      console.error('Failed to start review:', err);
    }
  };

  const startDiscriminationDrill = async () => {
    try {
      // Get patterns from selected categories that have related patterns
      const eligiblePatterns = patterns.filter(p => 
        selectedCategories.includes(p.category) && 
        p.related_patterns && 
        p.related_patterns.length > 0
      );
      
      if (eligiblePatterns.length === 0) {
        alert('No patterns with relationships found in selected categories. Try selecting more categories.');
        return;
      }
      
      // Pick a random eligible pattern
      const basePattern = eligiblePatterns[Math.floor(Math.random() * eligiblePatterns.length)];
      setCurrentPattern(basePattern);
      
      // Load discrimination exercise
      await loadDiscriminationExercise(basePattern.id);
      setReviewMode('discrimination');
    } catch (err) {
      console.error('Failed to start discrimination drill:', err);
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
        setDiscriminationAlert(null);
        setSelectedDiscriminationOption(null);
        setDiscriminationFeedback(null);
        setState('input');
      }
    } catch (err) {
      console.error('Failed to load exercise:', err);
    }
  };

  const loadDiscriminationExercise = async (patternId: number) => {
    setState('loading');
    try {
      const response = await fetch(`${API_URL}/api/grammar/patterns/${patternId}/discrimination`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setExercise(data.exercise);
        setUserAnswer('');
        setDiscriminationAlert(null);
        setSelectedDiscriminationOption(null);
        setDiscriminationFeedback(null);
        setState('discrimination_select');
      }
    } catch (err) {
      console.error('Failed to load discrimination exercise:', err);
    }
  };

  const startPattern = async (pattern: GrammarPattern) => {
    // If this is a counter group, load variants first
    if (pattern.isCounterGroup && pattern.pattern) {
      const variants = await loadCounterVariants(pattern.pattern);
      // For counter groups, pick a random variant to practice
      if (variants.length > 0) {
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        setCurrentPattern({
          ...randomVariant,
          base_form: pattern.pattern,
          variants: variants
        });
        await loadExercise(randomVariant.id);
        return;
      }
    }
    setCurrentPattern(pattern);
    await loadExercise(pattern.id);
  };

  const handleCompare = async (pattern: GrammarPattern) => {
    try {
      const response = await fetch(`${API_URL}/api/grammar/patterns/${pattern.id}/related`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setComparisonPatterns([pattern, ...data.patterns].slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load related patterns:', err);
    }
  };

  const handleDiscriminationSelect = async (option: DiscriminationOption, _pattern: GrammarPattern) => {
    setSelectedDiscriminationOption(option);
    
    // Show immediate feedback
    setDiscriminationFeedback({
      isCorrect: option.is_correct,
      explanation: option.explanation
    });
    
    // If correct, move to construction phase
    if (option.is_correct) {
      setTimeout(() => {
        setState('input');
      }, 2000);
    } else {
      // Wrong choice - log confusion and show comparison option
      if (currentPattern) {
        try {
          await fetch(`${API_URL}/api/grammar/confusion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Password': password
            },
            body: JSON.stringify({
              patternId: currentPattern.id,
              confusedWithPatternId: option.pattern_id,
              userSentence: `Discrimination error: selected ${option.pattern} instead of ${currentPattern.pattern}`
            })
          });
          loadConfusionStats();
        } catch (err) {
          console.error('Failed to log confusion:', err);
        }
      }
    }
  };

  const checkForConfusion = async (userSentence: string, patternId: number): Promise<DiscriminationAlert | null> => {
    try {
      const response = await fetch(`${API_URL}/api/grammar/check-confusion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password
        },
        body: JSON.stringify({ patternId, userSentence })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.confusedWith) {
          return {
            confusedWith: data.confusedWith,
            message: `⚠️ This looks like "${data.confusedWith.pattern}" (${data.confusedWith.category})!`
          };
        }
      }
    } catch (err) {
      console.error('Failed to check confusion:', err);
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    
    setState('processing');

    // Check for confusion before submitting
    const confusion = await checkForConfusion(userAnswer, currentPattern?.id || 0);
    if (confusion) {
      setDiscriminationAlert(confusion);
    }

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
          confusedWithPatternId: confusion?.confusedWith?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback({
          correct: isCorrect,
          userAnswer: userAnswer,
          correctAnswer: exercise?.correct_answer,
          progress: data.progress,
          confusion: confusion
        });
        setState('feedback');
        loadDuePatterns();
        loadConfusionStats();
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      setState('input');
    }
  };

  const handleNext = () => {
    if (reviewMode === 'discrimination') {
      // In discrimination mode, load a new discrimination exercise
      startDiscriminationDrill();
    } else if (currentPattern) {
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

  const clearCategorySelection = () => {
    setSelectedCategories([]);
    setActiveGroup(null);
  };

  // Check if a group's categories exactly match current selection
  const isGroupActive = (groupKey: string): boolean => {
    const group = CATEGORY_GROUPS[groupKey];
    if (!group) return false;

    const groupCategories = groupKey === 'all' 
      ? categories 
      : group.categories.filter(cat => categories.includes(cat));

    if (groupCategories.length === 0) return false;
    if (selectedCategories.length !== groupCategories.length) return false;

    return groupCategories.every(cat => selectedCategories.includes(cat));
  };

  // Select categories from a group
  const selectGroupCategories = (groupKey: string) => {
    const group = CATEGORY_GROUPS[groupKey];
    if (!group) return;

    let groupCategories: string[];
    if (groupKey === 'all') {
      groupCategories = categories;
    } else {
      // Only include categories that actually exist in the data
      groupCategories = group.categories.filter(cat => categories.includes(cat));
    }

    if (groupCategories.length === 0) {
      alert(`No categories found for "${group.name}"`);
      return;
    }

    setSelectedCategories(groupCategories);
    setActiveGroup(groupKey);
    setExpandedGroup(null); // Collapse accordion after selection
  };

  // Update active group when categories change manually
  useEffect(() => {
    for (const [key] of Object.entries(CATEGORY_GROUPS)) {
      if (isGroupActive(key)) {
        setActiveGroup(key);
        return;
      }
    }
    setActiveGroup(null);
  }, [selectedCategories, categories]);

  const filteredPatterns = patterns.filter(p => selectedCategories.includes(p.category));

  // Calculate due patterns breakdown by category
  const dueByCategory = React.useMemo(() => {
    const breakdown: Record<string, number> = {};
    duePatterns.forEach(p => {
      breakdown[p.category] = (breakdown[p.category] || 0) + 1;
    });
    // Sort by count descending
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1]);
  }, [duePatterns]);

  // Calculate total patterns count for selected categories
  const selectedPatternsCount = selectedCategories.length > 0
    ? patterns.filter(p => selectedCategories.includes(p.category)).length
    : 0;

  // Check if pattern has confusion history
  const hasConfusion = (patternId: number) => {
    return confusionStats.some(c => c.patternId === patternId && c.count > 0);
  };

  const handleHeaderBack = () => {
    if (currentPattern) {
      setCurrentPattern(null);
      setReviewMode('normal');
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

      {/* Comparison Modal */}
      {comparisonPatterns && (
        <ComparisonView
          patterns={comparisonPatterns}
          showFurigana={showFurigana}
          onClose={() => setComparisonPatterns(null)}
          onSelectPattern={(pattern) => {
            setComparisonPatterns(null);
            startPattern(pattern);
          }}
        />
      )}

      {/* Pattern Graph Modal */}
      {showPatternGraph && (
        <PatternGraph
          patterns={patterns}
          confusionStats={confusionStats}
          onSelectPattern={(pattern) => {
            setShowPatternGraph(false);
            startPattern(pattern);
          }}
          onComparePatterns={(pats) => {
            setShowPatternGraph(false);
            setComparisonPatterns(pats);
          }}
          onClose={() => setShowPatternGraph(false)}
        />
      )}

      {!currentPattern ? (
        <div className="pattern-selection">
          {dueCount > 0 && (
            <div className="review-banner">
              <div className="review-banner-content">
                <span className="review-banner-title">🔥 {dueCount} patterns ready for review</span>
                {dueByCategory.length > 0 && (
                  <div className="due-categories">
                    {dueByCategory.map(([category, count]) => (
                      <span
                        key={category}
                        className={`due-category-pill ${selectedCategories.includes(category) ? 'selected' : ''}`}
                        title={selectedCategories.includes(category) ? 'Selected' : 'Not selected'}
                      >
                        {category} ({count})
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="review-actions">
                <button
                  className="review-btn practice-selected-btn"
                  onClick={() => startReview(true)}
                  disabled={selectedCategories.length === 0 || selectedPatternsCount === 0}
                >
                  Practice Selected ({selectedPatternsCount} patterns)
                </button>
                <button className="review-btn" onClick={() => startReview(false)}>
                  Practice All
                </button>
              </div>
            </div>
          )}

          {/* Mixed Review Banner */}
          <div className="mixed-review-banner">
            <div className="mixed-review-content">
              <span className="mixed-review-title">🎯 Mixed Review Mode</span>
              <span className="mixed-review-desc">
                Practice shuffled patterns from selected categories to improve discrimination
              </span>
            </div>
            <button 
              className="mixed-review-btn"
              onClick={() => {
                if (selectedCategories.length === 0) {
                  alert('Please select at least one category first. Use Quick Select Groups or select categories manually.');
                  return;
                }
                startReview(true, true);
              }}
              disabled={selectedPatternsCount === 0}
            >
              Start Mixed Review
            </button>
          </div>

          {/* Discrimination Drill Banner */}
          <div className="discrimination-banner">
            <div className="discrimination-content">
              <span className="discrimination-title">🎭 Discrimination Drills</span>
              <span className="discrimination-desc">
                Choose between similar patterns in context - trains you to pick the right one under pressure
              </span>
            </div>
            <button 
              className="discrimination-btn"
              onClick={startDiscriminationDrill}
              disabled={selectedPatternsCount === 0}
            >
              Start Discrimination Drill
            </button>
          </div>

          {/* Pattern Graph Button */}
          <div className="pattern-graph-banner">
            <div className="pattern-graph-info">
              <span className="pattern-graph-title">🕸️ Pattern Relationship Graph</span>
              <span className="pattern-graph-desc">
                Visual map showing how patterns connect - opposites, similarities, and your mastery status
              </span>
            </div>
            <button 
              className="pattern-graph-open-btn"
              onClick={() => setShowPatternGraph(true)}
            >
              View Graph
            </button>
          </div>

          {/* Quick Select Groups Accordion */}
          <div className="category-groups-accordion">
            <div 
              className="accordion-header"
              onClick={() => setExpandedGroup(expandedGroup === 'groups' ? null : 'groups')}
            >
              <span className="accordion-icon">📁</span>
              <span className="accordion-title">Quick Select Groups</span>
              <span className="accordion-toggle">
                {expandedGroup === 'groups' ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedGroup === 'groups' && (
              <div className="accordion-content">
                {Object.entries(CATEGORY_GROUPS).map(([key, group]) => {
                  const availableCount = key === 'all' 
                    ? categories.length 
                    : group.categories.filter(cat => categories.includes(cat)).length;
                  const isActive = activeGroup === key;

                  return (
                    <div
                      key={key}
                      className={`group-item ${isActive ? 'active' : ''}`}
                      onClick={() => selectGroupCategories(key)}
                    >
                      <span className="group-name">{group.name}</span>
                      <span className="group-count">({availableCount})</span>
                      {isActive && <span className="group-check">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
            {selectedCategories.length > 0 && (
              <div className="selected-categories">
                <div className="selected-categories-header">
                  <span className="selected-label">Selected ({selectedPatternsCount} patterns):</span>
                  <button className="clear-categories-btn" onClick={clearCategorySelection}>
                    All Categories
                  </button>
                </div>
                <div className="selected-pills">
                  {selectedCategories.map(cat => (
                    <span key={cat} className="category-pill">
                      {cat}
                      <button
                        className="remove-pill"
                        onClick={() => toggleCategory(cat)}
                        title={`Remove ${cat}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                  onCompare={() => handleCompare(pattern)}
                  hasConfusion={hasConfusion(pattern.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="exercise-container">
          {/* Review Mode Indicator */}
          {reviewMode === 'mixed' && (
            <div className="mixed-mode-badge">🎯 Mixed Review Mode</div>
          )}
          {reviewMode === 'discrimination' && (
            <div className="discrimination-mode-badge">🎭 Discrimination Drill</div>
          )}

          <div className="pattern-info">
            <h3>
              <ExerciseDisplay text={currentPattern.pattern} showFurigana={showFurigana} />
            </h3>
            <p className="category">{currentPattern.category}</p>
            
            {/* Confusion Warning */}
            {currentPattern.confusion_pairs && currentPattern.confusion_pairs.length > 0 && (
              <div className="confusion-warning">
                ⚠️ Often confused with: {currentPattern.confusion_pairs.map(id => {
                  const p = patterns.find(pt => pt.id === id);
                  return p ? p.pattern : id;
                }).join(', ')}
                <button 
                  className="compare-link"
                  onClick={() => handleCompare(currentPattern)}
                >
                  Compare →
                </button>
              </div>
            )}
          </div>

          {state === 'loading' && <div className="loading">Loading exercise...</div>}

          {state === 'discrimination_select' && exercise && (
            <div className="discrimination-container">
              <DiscriminationDrill
                exercise={exercise}
                patterns={patterns}
                showFurigana={showFurigana}
                onSelectOption={handleDiscriminationSelect}
              />
              
              {discriminationFeedback && (
                <div className={`discrimination-feedback ${discriminationFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="discrimination-feedback-icon">
                    {discriminationFeedback.isCorrect ? '✅' : '❌'}
                  </div>
                  <div className="discrimination-feedback-content">
                    <p className="discrimination-feedback-title">
                      {discriminationFeedback.isCorrect ? 'Correct pattern!' : 'Wrong pattern!'}
                    </p>
                    <p className="discrimination-feedback-explanation">
                      {discriminationFeedback.explanation}
                    </p>
                    {!discriminationFeedback.isCorrect && (
                      <button 
                        className="compare-btn-inline"
                        onClick={() => {
                          if (selectedDiscriminationOption && currentPattern) {
                            const otherPattern = patterns.find(p => p.id === selectedDiscriminationOption.pattern_id);
                            if (otherPattern) {
                              setComparisonPatterns([currentPattern, otherPattern]);
                            }
                          }
                        }}
                      >
                        Compare Patterns →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {state === 'input' && exercise && (
            <div className="exercise-prompt">
              {/* Confusion Alert */}
              {discriminationAlert && (
                <div className="confusion-alert">
                  <div className="confusion-alert-icon">⚠️</div>
                  <div className="confusion-alert-content">
                    <p className="confusion-alert-title">Possible Confusion Detected!</p>
                    <p className="confusion-alert-message">{discriminationAlert.message}</p>
                    <button 
                      className="compare-alert-btn"
                      onClick={() => handleCompare(currentPattern)}
                    >
                      Compare Patterns
                    </button>
                  </div>
                </div>
              )}

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
              
              {/* Confusion Feedback */}
              {feedback.confusion && (
                <div className="confusion-feedback">
                  <div className="confusion-feedback-icon">💡</div>
                  <p>
                    You used the pattern for <strong>{feedback.confusion.confusedWith.pattern}</strong>,
                    but the exercise is asking for <strong>{currentPattern?.pattern}</strong>.
                  </p>
                  <button 
                    className="compare-feedback-btn"
                    onClick={() => handleCompare(currentPattern!)}
                  >
                    See Comparison
                  </button>
                </div>
              )}
              
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
