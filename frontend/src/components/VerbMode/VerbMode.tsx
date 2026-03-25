import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFurigana } from '../../hooks/useFurigana.js';
import { Header } from '../Header/index.js';
import { API_URL } from '../../config/api.js';
import './VerbMode.css';

export interface Verb {
  id: number;
  dictionary_form: string;
  reading: string;
  meaning: string;
  group: 'I' | 'II' | 'III';
  jlpt_level: string;
  conjugations: ConjugationMap;
  streak?: number;
  total_attempts?: number;
  correct_attempts?: number;
  ease_factor?: number;
}

export interface ConjugationMap {
  [key: string]: string | undefined;
  te_form?: string;
  ta_form?: string;
  negative?: string;
  past_negative?: string;
  polite?: string;
  polite_negative?: string;
  polite_past?: string;
  polite_past_negative?: string;
  potential?: string;
  volitional?: string;
  imperative?: string;
  conditional?: string;
  passive?: string;
  causative?: string;
  causative_passive?: string;
}

export type PracticeType = 'recognition' | 'construction' | 'transformation';
export type AnswerMode = 'input' | 'multiple-choice';

interface Exercise {
  verb: Verb;
  questionType: 'recognition' | 'construction' | 'transformation';
  targetForm: string;
  sourceForm?: string;
  prompt: string;
  correctAnswer: string;
  options?: string[];
}

interface FeedbackState {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  streak?: number;
}

type ExerciseState = 'loading' | 'input' | 'feedback' | 'selection' | 'processing';

// Memoized components defined outside VerbMode to prevent rerenders
// Note: VerbCard component available for future use in verb browsing
/*
const VerbCard: React.FC<{
  verb: Verb;
  showFurigana: boolean;
  onClick: () => void;
}> = React.memo(({ verb, showFurigana, onClick }) => {
  const { furigana } = useFurigana(verb.dictionary_form, showFurigana);
  
  return (
    <div className="verb-card" onClick={onClick}>
      <div className="verb-header">
        <span className="verb-dictionary">
          {showFurigana && furigana ? (
            <span dangerouslySetInnerHTML={{ __html: furigana }} />
          ) : (
            verb.dictionary_form
          )}
        </span>
        <span className={`verb-group group-${verb.group.toLowerCase()}`}>
          Group {verb.group}
        </span>
      </div>
      <div className="verb-meaning">{verb.meaning}</div>
      <div className="verb-reading">{verb.reading}</div>
      {(verb.streak ?? 0) > 0 && (
        <div className="verb-streak">🔥 {verb.streak}</div>
      )}
    </div>
  );
});
*/

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

const FORM_DISPLAY_NAMES: Record<string, string> = {
  'te_form': 'TE-form',
  'ta_form': 'TA-form (past)',
  'negative': 'Negative (plain)',
  'past_negative': 'Past Negative',
  'polite': 'Polite (ます)',
  'polite_negative': 'Polite Negative',
  'polite_past': 'Polite Past',
  'polite_past_negative': 'Polite Past Negative',
  'potential': 'Potential',
  'volitional': 'Volitional',
  'imperative': 'Imperative',
  'conditional': 'Conditional',
  'passive': 'Passive',
  'causative': 'Causative',
  'causative_passive': 'Causative Passive',
  'dictionary_form': 'Dictionary Form',
};

const FORM_DESCRIPTIONS: Record<string, string> = {
  'te_form': 'Used for connecting verbs, making requests (～てください), and expressing continuous states',
  'ta_form': 'The plain past tense form',
  'negative': 'The plain negative form, ends in ない',
  'past_negative': 'The plain past negative, ends in なかった',
  'polite': 'The polite present/future form, ends in ます',
  'polite_negative': 'The polite negative, ends in ません',
  'polite_past': 'The polite past, ends in ました',
  'polite_past_negative': 'The polite past negative, ends in ませんでした',
  'potential': 'Expresses ability ("can do"), Group I → ～える, Group II → ～られる',
  'volitional': 'Expresses intention ("let\'s do"), Group I → ～おう, Group II → ～よう',
  'imperative': 'Direct command form',
  'conditional': 'The "if" form, ends in ～えば',
  'passive': 'Passive form ("is done"), Group I → ～れる, Group II → ～られる',
  'causative': 'Causative form ("make/let do"), Group I → ～せる, Group II → ～させる',
  'causative_passive': 'Causative passive ("be made to do")',
  'dictionary_form': 'The base form of the verb',
};

const AVAILABLE_FORMS = [
  'te_form',
  'ta_form',
  'negative',
  'past_negative',
  'polite',
  'polite_negative',
  'polite_past',
  'polite_past_negative',
  'potential',
  'volitional',
  'imperative',
  'conditional',
  'passive',
  'causative',
];

export const VerbMode: React.FC = () => {
  const navigate = useNavigate();
  const [verbs] = useState<Verb[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [state, setState] = useState<ExerciseState>('selection');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [selectedPracticeType, setSelectedPracticeType] = useState<PracticeType>('construction');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('multiple-choice');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['I', 'II', 'III']);
  const [showFurigana, setShowFurigana] = useState(true);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const password = localStorage.getItem('speech_practice_password') || '';
  const STORAGE_KEY = 'verb_practice_settings';
  const FURIGANA_STORAGE_KEY = 'verb_show_furigana';

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.practiceType) setSelectedPracticeType(parsed.practiceType);
        if (parsed.answerMode) setAnswerMode(parsed.answerMode);
        if (parsed.groups) setSelectedGroups(parsed.groups);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    
    const savedFurigana = localStorage.getItem(FURIGANA_STORAGE_KEY);
    if (savedFurigana !== null) {
      setShowFurigana(savedFurigana === 'true');
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      practiceType: selectedPracticeType,
      answerMode: answerMode,
      groups: selectedGroups,
    }));
  }, [selectedPracticeType, answerMode, selectedGroups]);

  useEffect(() => {
    localStorage.setItem(FURIGANA_STORAGE_KEY, showFurigana.toString());
  }, [showFurigana]);

  // Keyboard shortcut: Space to submit or go to next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ') return;
      
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      e.preventDefault();
      
      if (state === 'input' && userAnswer.trim()) {
        handleSubmit();
      } else if (state === 'feedback') {
        loadNextExercise();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, userAnswer]);

  const loadRandomVerb = async (): Promise<Verb | null> => {
    try {
      const response = await fetch(`${API_URL}/api/verbs/random?groups=${selectedGroups.join(',')}`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        return data.verb;
      }
    } catch (err) {
      console.error('Failed to load random verb:', err);
    }
    return null;
  };

  const generateExercise = async (verb: Verb): Promise<Exercise> => {
    const availableConjugations = Object.entries(verb.conjugations)
      .filter(([form, value]) => value && AVAILABLE_FORMS.includes(form))
      .map(([form]) => form);
    
    if (availableConjugations.length === 0) {
      // Fallback to dictionary form if no conjugations available
      return {
        verb,
        questionType: 'recognition',
        targetForm: 'dictionary_form',
        prompt: `What is the dictionary form of "${verb.reading}"?`,
        correctAnswer: verb.dictionary_form,
      };
    }

    const targetForm = availableConjugations[Math.floor(Math.random() * availableConjugations.length)];
    const correctAnswer = verb.conjugations[targetForm] || '';

    switch (selectedPracticeType) {
      case 'recognition':
        return generateRecognitionExercise(verb, targetForm, correctAnswer);
      case 'construction':
        return generateConstructionExercise(verb, targetForm, correctAnswer);
      case 'transformation':
        return generateTransformationExercise(verb, targetForm, correctAnswer);
      default:
        return generateConstructionExercise(verb, targetForm, correctAnswer);
    }
  };

  const generateRecognitionExercise = (verb: Verb, targetForm: string, correctAnswer: string): Exercise => {
    // Generate distractors from other verbs
    const distractors = verbs
      .filter(v => v.id !== verb.id && v.conjugations[targetForm])
      .map(v => v.conjugations[targetForm]!)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    return {
      verb,
      questionType: 'recognition',
      targetForm,
      prompt: `Which form is "${correctAnswer}"?`,
      correctAnswer,
      options,
    };
  };

  const generateConstructionExercise = (verb: Verb, targetForm: string, correctAnswer: string): Exercise => {
    const options = answerMode === 'multiple-choice' 
      ? generateDistractors(correctAnswer, verb.group)
      : undefined;

    return {
      verb,
      questionType: 'construction',
      targetForm,
      prompt: `Conjugate "${verb.dictionary_form}" to ${FORM_DISPLAY_NAMES[targetForm] || targetForm}`,
      correctAnswer,
      options,
    };
  };

  const generateTransformationExercise = (verb: Verb, targetForm: string, correctAnswer: string): Exercise => {
    // Pick a source form that's different from target
    const availableSourceForms = ['dictionary_form', 'te_form', 'polite', 'negative'].filter(f => 
      f !== targetForm && (f === 'dictionary_form' || verb.conjugations[f])
    );
    
    const sourceForm = availableSourceForms.length > 0 
      ? availableSourceForms[Math.floor(Math.random() * availableSourceForms.length)]
      : 'dictionary_form';
    
    const sourceValue = sourceForm === 'dictionary_form' 
      ? verb.dictionary_form 
      : (verb.conjugations[sourceForm] || verb.dictionary_form);

    const options = answerMode === 'multiple-choice'
      ? generateDistractors(correctAnswer, verb.group)
      : undefined;

    return {
      verb,
      questionType: 'transformation',
      targetForm,
      sourceForm,
      prompt: `Change "${sourceValue}" (${FORM_DISPLAY_NAMES[sourceForm] || sourceForm}) → ${FORM_DISPLAY_NAMES[targetForm] || targetForm}`,
      correctAnswer,
      options,
    };
  };

  const generateDistractors = (correctAnswer: string, group: string): string[] => {
    // Generate plausible wrong answers based on verb group
    const distractors: string[] = [];
    
    // Common conjugation errors based on group
    if (group === 'I') {
      // Group I (u-verbs) common errors
      if (correctAnswer.endsWith('て')) {
        distractors.push(correctAnswer.replace(/て$/, 'で'));
      }
      if (correctAnswer.endsWith('った')) {
        distractors.push(correctAnswer.replace(/った$/, 'た'));
      }
    } else if (group === 'II') {
      // Group II (ru-verbs) common errors  
      if (correctAnswer.endsWith('られる')) {
        distractors.push(correctAnswer.replace(/られる$/, 'れる'));
      }
    }

    // Add random conjugations from other verbs as distractors
    const randomDistractors = verbs
      .map(v => Object.values(v.conjugations))
      .flat()
      .filter((v): v is string => v !== undefined && v !== correctAnswer && !distractors.includes(v))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 - distractors.length);

    const allOptions = [correctAnswer, ...distractors, ...randomDistractors].slice(0, 4);
    return allOptions.sort(() => Math.random() - 0.5);
  };

  const loadNextExercise = async () => {
    setState('loading');
    setUserAnswer('');
    setFeedback(null);
    
    const verb = await loadRandomVerb();
    if (verb) {
      const exercise = await generateExercise(verb);
      setCurrentExercise(exercise);
      setState('input');
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !currentExercise) return;
    
    setState('processing' as ExerciseState);

    // Verify answer (client-side with normalization)
    const normalize = (text: string) => text
      .trim()
      .replace(/[。．、，！？・…ー〜〃〄々〆〇〈〉《》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟]/g, '')
      .replace(/[.!,?…\-~""''()[\]{}]/g, '')
      .replace(/\s+/g, '');

    const normUser = normalize(userAnswer);
    const normCorrect = normalize(currentExercise.correctAnswer);
    
    // Levenshtein distance for fuzzy matching
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
    const similarity = maxLen > 0 ? Math.round((1 - distance / maxLen) * 100) : 100;
    
    const isCorrect = distance <= 2 || similarity >= 90 || normUser === normCorrect;
    
    // Send result to backend
    try {
      const response = await fetch(`${API_URL}/api/verbs/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password
        },
        body: JSON.stringify({
          verbId: currentExercise.verb.id,
          fromForm: currentExercise.sourceForm || 'dictionary_form',
          toForm: currentExercise.targetForm,
          userAnswer: userAnswer,
          isCorrect,
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local stats
        setScore(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
        }));
        
        if (isCorrect) {
          setStreak(prev => prev + 1);
        } else {
          setStreak(0);
        }

        setFeedback({
          correct: isCorrect,
          userAnswer,
          correctAnswer: currentExercise.correctAnswer,
          explanation: FORM_DESCRIPTIONS[currentExercise.targetForm],
          streak: data.progress?.streak
        });
        setState('feedback');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      // Still show feedback even if backend fails
      setFeedback({
        correct: isCorrect,
        userAnswer,
        correctAnswer: currentExercise.correctAnswer,
        explanation: FORM_DESCRIPTIONS[currentExercise.targetForm],
      });
      setState('feedback');
    }
  };

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const selectAllGroups = () => setSelectedGroups(['I', 'II', 'III']);
  const deselectAllGroups = () => setSelectedGroups([]);

  // Selection screen
  if (state === 'selection') {
    return (
      <div className="verb-mode">
        <Header
          title="Verb Conjugation Practice"
          icon="🎯"
          onBack={() => navigate('/')}
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

        <div className="verb-selection">
          {/* Practice Type Selection */}
          <div className="practice-type-section">
            <h3>Practice Type</h3>
            <div className="practice-type-options">
              <button
                className={`practice-type-btn ${selectedPracticeType === 'recognition' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeType('recognition')}
              >
                <span className="btn-title">🧠 Recognition</span>
                <span className="btn-desc">"Which form is 食べて?"</span>
              </button>
              <button
                className={`practice-type-btn ${selectedPracticeType === 'construction' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeType('construction')}
              >
                <span className="btn-title">🔨 Construction</span>
                <span className="btn-desc">"Conjugate 食べる to TE-form"</span>
              </button>
              <button
                className={`practice-type-btn ${selectedPracticeType === 'transformation' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeType('transformation')}
              >
                <span className="btn-title">🔄 Transformation</span>
                <span className="btn-desc">"Change 食べる → 食べます"</span>
              </button>
            </div>
          </div>

          {/* Answer Mode Selection */}
          <div className="answer-mode-section">
            <h3>Answer Mode</h3>
            <div className="answer-mode-options">
              <button
                className={`answer-mode-btn ${answerMode === 'multiple-choice' ? 'active' : ''}`}
                onClick={() => setAnswerMode('multiple-choice')}
              >
                Multiple Choice
              </button>
              <button
                className={`answer-mode-btn ${answerMode === 'input' ? 'active' : ''}`}
                onClick={() => setAnswerMode('input')}
              >
                Type Answer
              </button>
            </div>
          </div>

          {/* Group Filter */}
          <div className="group-filter">
            <div className="group-filter-header">
              <h3>Verb Groups</h3>
              <div className="filter-actions">
                <button className="filter-btn" onClick={selectAllGroups}>All</button>
                <button className="filter-btn" onClick={deselectAllGroups}>None</button>
              </div>
            </div>
            <div className="group-checkboxes">
              {['I', 'II', 'III'].map(group => (
                <label key={group} className="group-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group)}
                    onChange={() => toggleGroup(group)}
                  />
                  <span className={`group-badge group-${group.toLowerCase()}`}>
                    Group {group}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Stats */}
          {score.total > 0 && (
            <div className="practice-stats">
              <div className="stat-item">
                <span className="stat-label">Score</span>
                <span className="stat-value">{score.correct}/{score.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{Math.round((score.correct / score.total) * 100)}%</span>
              </div>
              {streak > 0 && (
                <div className="stat-item streak">
                  <span className="stat-label">Streak</span>
                  <span className="stat-value">🔥 {streak}</span>
                </div>
              )}
            </div>
          )}

          {/* Start Button */}
          <button
            className="start-practice-btn"
            onClick={loadNextExercise}
            disabled={selectedGroups.length === 0}
          >
            Start Practice →
          </button>
        </div>
      </div>
    );
  }

  // Exercise screen
  return (
    <div className="verb-mode">
      <Header
        title="Verb Conjugation"
        icon="🎯"
        onBack={() => setState('selection')}
        showBackButton={true}
        actions={
          <>
            {streak > 0 && (
              <span className="streak-badge">🔥 {streak}</span>
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

      <div className="exercise-container">
        {state === 'loading' && (
          <div className="loading">Loading exercise...</div>
        )}

        {currentExercise && (state === 'input' || state === 'processing') && (
          <div className="exercise-prompt">
            {/* Verb Info Card */}
            <div className="verb-info-card">
              <div className="verb-info-main">
                <h2 className="verb-dictionary-form">
                  <ExerciseDisplay 
                    text={currentExercise.verb.dictionary_form} 
                    showFurigana={showFurigana} 
                  />
                </h2>
                <div className="verb-meta">
                  <span className={`verb-group-badge group-${currentExercise.verb.group.toLowerCase()}`}>
                    Group {currentExercise.verb.group}
                  </span>
                  <span className="verb-meaning-text">
                    {currentExercise.verb.meaning}
                  </span>
                </div>
              </div>
              {currentExercise.sourceForm && (
                <div className="source-form-display">
                  <span className="source-label">From:</span>
                  <span className="source-value">
                    {currentExercise.sourceForm === 'dictionary_form' 
                      ? currentExercise.verb.dictionary_form
                      : (currentExercise.verb.conjugations[currentExercise.sourceForm] || '')
                    }
                  </span>
                  <span className="source-form-name">
                    ({FORM_DISPLAY_NAMES[currentExercise.sourceForm] || currentExercise.sourceForm})
                  </span>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="question-section">
              <div className="question-type-badge">
                {selectedPracticeType === 'recognition' && '🧠 Recognition'}
                {selectedPracticeType === 'construction' && '🔨 Construction'}
                {selectedPracticeType === 'transformation' && '🔄 Transformation'}
              </div>
              <p className="question-prompt">{currentExercise.prompt}</p>
              {answerMode === 'input' && (
                <p className="target-form-hint">
                  Target: <strong>{FORM_DISPLAY_NAMES[currentExercise.targetForm] || currentExercise.targetForm}</strong>
                </p>
              )}
            </div>

            {/* Answer Section */}
            <div className="answer-section">
              {answerMode === 'multiple-choice' && currentExercise.options ? (
                <div className="multiple-choice-options">
                  {currentExercise.options.map((option, index) => (
                    <button
                      key={index}
                      className="choice-btn"
                      onClick={() => {
                        setUserAnswer(option);
                        handleSubmit();
                      }}
                    >
                      <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="choice-text">
                        <ExerciseDisplay text={option} showFurigana={showFurigana} />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="input-section">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Type your answer in Japanese..."
                    className="answer-input"
                    autoFocus
                    disabled={state === 'processing'}
                  />
                  <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim() || state === 'processing'}
                  >
                    {state === 'processing' ? 'Checking...' : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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

            {feedback.explanation && (
              <div className="explanation">
                <h4>💡 Explanation</h4>
                <p>{feedback.explanation}</p>
              </div>
            )}

            {feedback.streak !== undefined && feedback.streak > 0 && (
              <div className="streak-update">
                <span>🔥 Streak: {feedback.streak}</span>
              </div>
            )}

            <button className="next-btn" onClick={loadNextExercise}>
              Next Exercise →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerbMode;
