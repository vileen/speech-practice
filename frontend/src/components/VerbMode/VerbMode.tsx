import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api.js';
import './VerbMode.css';

interface Verb {
  id: number;
  dictionary_form: string;
  reading: string;
  meaning: string;
  verb_group: 1 | 2 | 3;
  jlpt_level: string;
  transitivity: string;
}

type Mode = 'menu' | 'study' | 'quiz';
type ConjugationType = 'masu' | 'te' | 'nai' | 'ta' | 'conditional' | 'potential';

const CONJUGATION_NAMES: Record<ConjugationType, string> = {
  masu: 'Polite (ます)',
  te: 'Te-form (て)',
  nai: 'Negative (ない)',
  ta: 'Past (た)',
  conditional: 'Conditional (えば)',
  potential: 'Potential (can do)',
};

export function VerbMode() {
  const navigate = useNavigate();
  const password = localStorage.getItem('speech_practice_password') || '';
  
  const [mode, setMode] = useState<Mode>('menu');
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [selectedVerb, setSelectedVerb] = useState<Verb | null>(null);
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    loadVerbs();
  }, []);

  const loadVerbs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/verbs?commonOnly=true`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setVerbs(data.verbs);
      }
    } catch (err) {
      console.error('Failed to load verbs:', err);
    } finally {
      setLoading(false);
    }
  };

  const startGroupStudy = (group: 1 | 2 | 3) => {
    setSelectedGroup(group);
    const groupVerbs = verbs.filter(v => v.verb_group === group);
    if (groupVerbs.length > 0) {
      setSelectedVerb(groupVerbs[0]);
      setMode('study');
    }
  };

  const startQuiz = async () => {
    try {
      const response = await fetch(`${API_URL}/api/verbs/exercise/random`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const exercise = await response.json();
        setCurrentExercise(exercise);
        setUserAnswer('');
        setShowResult(false);
        setMode('quiz');
      }
    } catch (err) {
      console.error('Failed to load exercise:', err);
    }
  };

  const checkAnswer = async () => {
    if (!currentExercise) return;
    
    const correct = userAnswer.trim() === currentExercise.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Record result
    try {
      await fetch(`${API_URL}/api/verbs/${currentExercise.verb.id}/practice`, {
        method: 'POST',
        headers: { 
          'X-Password': password,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conjugation_type: currentExercise.toType,
          correct,
        })
      });
    } catch (err) {
      console.error('Failed to record practice:', err);
    }
  };

  const nextExercise = () => {
    startQuiz();
  };

  const getGroupName = (group: number) => {
    switch (group) {
      case 1: return 'Group I (Godan / U-verbs)';
      case 2: return 'Group II (Ichidan / Ru-verbs)';
      case 3: return 'Group III (Irregular)';
      default: return 'Unknown';
    }
  };



  if (mode === 'menu') {
    return (
      <div className="verb-mode">
        <header className="verb-header">
          <button className="back-btn" onClick={() => navigate('/grammar')}>← Back</button>
          <h1>🔥 Verb Conjugation</h1>
          <div className="verb-stats">
            <span>{verbs.length} verbs</span>
          </div>
        </header>

        <div className="verb-intro">
          <h2>Master Japanese Verb Conjugation</h2>
          <p>
            Japanese verbs change form based on tense, politeness, and grammar patterns. 
            There are 3 verb groups with different conjugation rules.
          </p>
          
          <div className="verb-groups-preview">
            <div className="group-card-v" onClick={() => startGroupStudy(1)}>
              <h3>Group I (Godan)</h3>
              <p className="group-pattern">書く, 読む, 話す...</p>
              <p className="group-rule">Transform last syllable</p>
              <span className="verb-count">{verbs.filter(v => v.verb_group === 1).length} verbs</span>
            </div>
            <div className="group-card-v" onClick={() => startGroupStudy(2)}>
              <h3>Group II (Ichidan)</h3>
              <p className="group-pattern">食べる, 見る, 寝る...</p>
              <p className="group-rule">Drop る, add ending</p>
              <span className="verb-count">{verbs.filter(v => v.verb_group === 2).length} verbs</span>
            </div>
            <div className="group-card-v" onClick={() => startGroupStudy(3)}>
              <h3>Group III</h3>
              <p className="group-pattern">来る, する...</p>
              <p className="group-rule">Irregular - memorize</p>
              <span className="verb-count">{verbs.filter(v => v.verb_group === 3).length} verbs</span>
            </div>
          </div>
        </div>

        <div className="verb-actions">
          <button className="quiz-btn-large" onClick={startQuiz}>
            🎯 Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'study' && selectedVerb && selectedGroup) {
    const groupVerbs = verbs.filter(v => v.verb_group === selectedGroup);
    const currentIndex = groupVerbs.findIndex(v => v.id === selectedVerb.id);

    return (
      <div className="verb-mode">
        <header className="verb-header">
          <button className="back-btn" onClick={() => setMode('menu')}>← Menu</button>
          <h1>{getGroupName(selectedGroup)}</h1>
          <button className="quiz-btn" onClick={startQuiz}>🎯 Quiz</button>
        </header>

        <div className="study-container">
          <div className="verb-card">
            <div className="verb-dictionary">{selectedVerb.dictionary_form}</div>
            <div className="verb-reading">({selectedVerb.reading})</div>
            <div className="verb-meaning">{selectedVerb.meaning}</div>
            <div className="verb-meta">
              <span className="jlpt-badge">{selectedVerb.jlpt_level}</span>
              <span className="transitivity">{selectedVerb.transitivity}</span>
            </div>

            <div className="conjugation-table">
              <h4>Conjugations:</h4>
              <div className="conj-grid">
                {Object.entries(CONJUGATION_NAMES).map(([type, name]) => (
                  <div key={type} className="conj-item">
                    <span className="conj-name">{name}</span>
                    <span className="conj-form">Loading...</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="verb-navigation">
              <button 
                onClick={() => setSelectedVerb(groupVerbs[currentIndex - 1])}
                disabled={currentIndex === 0}
              >
                ← Previous
              </button>
              <span>{currentIndex + 1} / {groupVerbs.length}</span>
              <button 
                onClick={() => setSelectedVerb(groupVerbs[currentIndex + 1])}
                disabled={currentIndex === groupVerbs.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz' && currentExercise) {
    return (
      <div className="verb-mode">
        <header className="verb-header">
          <button className="back-btn" onClick={() => setMode('menu')}>← Menu</button>
          <h1>🎯 Conjugation Quiz</h1>
        </header>

        <div className="quiz-container">
          <div className="quiz-card">
            <div className="quiz-verb">
              <div className="verb-large">{currentExercise.verb.dictionary_form}</div>
              <div className="verb-meaning">{currentExercise.verb.meaning}</div>
              <div className="verb-group-badge">Group {currentExercise.verb.verb_group}</div>
            </div>

            <div className="quiz-prompt">
              <p>Conjugate to <strong>{CONJUGATION_NAMES[currentExercise.toType as ConjugationType]}</strong>:</p>
            </div>

            {!showResult ? (
              <div className="quiz-input-section">
                <input
                  type="text"
                  className="answer-input"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                  placeholder="Type your answer..."
                  autoFocus
                />
                <button className="submit-btn" onClick={checkAnswer}>
                  Check Answer
                </button>
                <div className="hints">
                  {currentExercise.hints.map((hint: string, i: number) => (
                    <p key={i} className="hint">💡 {hint}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`quiz-result ${isCorrect ? 'correct' : 'wrong'}`}>
                <div className="result-icon">{isCorrect ? '✅' : '❌'}</div>
                <div className="correct-answer">
                  Correct: <strong>{currentExercise.correctAnswer}</strong>
                </div>
                {!isCorrect && (
                  <div className="your-answer">
                    Your answer: <strong>{userAnswer}</strong>
                  </div>
                )}
                <button className="next-btn" onClick={nextExercise}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <div className="loading">Loading...</div>;
}
