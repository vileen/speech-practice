import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api.js';
import './CountersMode.css';

interface CounterPattern {
  id: number;
  pattern: string;
  base_form: string;
  formation_rules: any[];
  examples: any[];
  total_attempts?: number;
  correct_attempts?: number;
}

interface CounterGroup {
  baseForm: string;
  count: number;
  patterns: CounterPattern[];
  counts: string;
  description: string;
}

type Mode = 'menu' | 'study' | 'quiz' | 'mixed' | 'review';

interface MixedQuestion {
  pattern: CounterPattern;
  group: CounterGroup;
  number: number;
}

export function CountersMode() {
  const navigate = useNavigate();
  const password = localStorage.getItem('speech_practice_password') || '';
  
  const [mode, setMode] = useState<Mode>('menu');
  const [counterGroups, setCounterGroups] = useState<CounterGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CounterGroup | null>(null);
  const [currentPattern, setCurrentPattern] = useState<CounterPattern | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Mixed quiz state
  const [mixedQuestions, setMixedQuestions] = useState<MixedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    loadCounterGroups();
  }, []);

  const loadCounterGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/counters/groups`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setCounterGroups(data.groups);
      }
    } catch (err) {
      console.error('Failed to load counters:', err);
    } finally {
      setLoading(false);
    }
  };

  const startStudy = (group: CounterGroup) => {
    setSelectedGroup(group);
    setMode('study');
    if (group.patterns.length > 0) {
      setCurrentPattern(group.patterns[0]);
    }
  };

  const startQuiz = () => {
    setMode('quiz');
    pickRandomPattern();
  };

  const pickRandomPattern = () => {
    if (selectedGroup) {
      const random = selectedGroup.patterns[Math.floor(Math.random() * selectedGroup.patterns.length)];
      setCurrentPattern(random);
      setShowAnswer(false);
    }
  };

  const handleAnswer = (_known: boolean) => {
    if (mode === 'mixed') {
      nextMixedQuestion();
    } else {
      pickRandomPattern();
    }
  };

  // Generate mixed quiz questions from all groups
  const startMixedQuiz = () => {
    const questions: MixedQuestion[] = [];
    const targetCount = 20;
    
    // Get all available patterns from all groups
    const allPatterns: { pattern: CounterPattern; group: CounterGroup }[] = [];
    counterGroups.forEach(group => {
      group.patterns.forEach(pattern => {
        allPatterns.push({ pattern, group });
      });
    });
    
    // Shuffle and pick 20 (or all if less than 20)
    const shuffled = allPatterns.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));
    
    // Create questions with random numbers (1-10)
    selected.forEach(({ pattern, group }) => {
      questions.push({
        pattern,
        group,
        number: Math.floor(Math.random() * 10) + 1
      });
    });
    
    setMixedQuestions(questions);
    setCurrentQuestionIndex(0);
    setMode('mixed');
    setShowAnswer(false);
  };

  const nextMixedQuestion = () => {
    if (currentQuestionIndex < mixedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Quiz complete - back to menu
      setMode('menu');
    }
  };

  if (mode === 'menu') {
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => navigate('/grammar')}>← Back</button>
          <h1>📊 Japanese Counters</h1>
          <div className="counters-stats">
            <span>{counterGroups.length} counter groups</span>
          </div>
        </header>

        <div className="counters-intro">
          <h2>What are counters?</h2>
          <p>
            In Japanese, counters (数詞 - sūshi) are special words used to count things. 
            Depending on what you're counting (people, objects, minutes), you use a different counter.
          </p>
          <div className="counter-examples">
            <div className="counter-example">
              <span className="jp">ひとり</span> 
              <span className="desc">1 person</span>
            </div>
            <div className="counter-example">
              <span className="jp">いっぽん</span> 
              <span className="desc">1 long object (pencil)</span>
            </div>
            <div className="counter-example">
              <span className="jp">さんこ</span> 
              <span className="desc">3 small objects (apples)</span>
            </div>
          </div>
        </div>

        {/* Mixed Quiz Banner */}
        <div className="mixed-quiz-banner" onClick={startMixedQuiz}>
          <div className="mixed-quiz-info">
            <span className="mixed-quiz-title">🎯 Mixed Quiz</span>
            <span className="mixed-quiz-desc">
              Test your knowledge with 20 random counters from all groups
            </span>
          </div>
          <button className="mixed-quiz-btn">Start →</button>
        </div>

        {loading ? (
          <div className="loading">Loading counters...</div>
        ) : (
          <div className="counter-groups">
            <h2>Select a group to study:</h2>
            <div className="groups-grid">
              {counterGroups.map(group => (
                <div 
                  key={group.baseForm}
                  className="group-card"
                  onClick={() => startStudy(group)}
                >
                  <h3>{group.baseForm}</h3>
                  <p className="group-counts">{group.counts}</p>
                  <p className="group-desc">{group.description}</p>
                  <div className="group-meta">
                    <span>{group.count} variants</span>
                    <button className="study-btn">Study →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'study' && selectedGroup && currentPattern) {
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => setMode('menu')}>← Menu</button>
          <h1>{selectedGroup.baseForm} - {selectedGroup.counts}</h1>
          <button className="quiz-btn" onClick={startQuiz}>🎯 Quiz</button>
        </header>

        <div className="study-container">
          <div className="counter-card">
            <div className="counter-pattern-large">{currentPattern.pattern}</div>
            
            <div className="counter-info-section">
              <h3>Counts: {selectedGroup.counts}</h3>
              <p>{selectedGroup.description}</p>
            </div>

            {currentPattern.examples?.length > 0 && (
              <div className="counter-examples-section">
                <h4>Examples:</h4>
                {currentPattern.examples.slice(0, 2).map((ex: any, i: number) => (
                  <div key={i} className="example-item">
                    <p className="jp">{ex.jp}</p>
                    <p className="en">{ex.en}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="counter-navigation">
              <button onClick={() => {
                const idx = selectedGroup.patterns.indexOf(currentPattern);
                if (idx > 0) setCurrentPattern(selectedGroup.patterns[idx - 1]);
              }} disabled={selectedGroup.patterns.indexOf(currentPattern) === 0}>
                ← Previous
              </button>
              <span>{selectedGroup.patterns.indexOf(currentPattern) + 1} / {selectedGroup.patterns.length}</span>
              <button onClick={() => {
                const idx = selectedGroup.patterns.indexOf(currentPattern);
                if (idx < selectedGroup.patterns.length - 1) setCurrentPattern(selectedGroup.patterns[idx + 1]);
              }} disabled={selectedGroup.patterns.indexOf(currentPattern) === selectedGroup.patterns.length - 1}>
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz' && selectedGroup && currentPattern) {
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => setMode('study')}>← Study</button>
          <h1>🎯 Quiz: {selectedGroup.baseForm}</h1>
        </header>

        <div className="quiz-container">
          <div className="quiz-card">
            <div className="quiz-question">
              <p className="question-text">How do you say "{Math.floor(Math.random() * 10) + 1} {selectedGroup.counts}"?</p>
            </div>

            {!showAnswer ? (
              <button className="show-answer-btn" onClick={() => setShowAnswer(true)}>
                Show Answer
              </button>
            ) : (
              <div className="quiz-answer">
                <div className="answer-pattern">{currentPattern.pattern}</div>
                {currentPattern.examples?.[0] && (
                  <p className="answer-example">{currentPattern.examples[0].jp}</p>
                )}
                
                <div className="answer-buttons">
                  <button className="wrong-btn" onClick={() => handleAnswer(false)}>
                    ❌ Didn't know
                  </button>
                  <button className="correct-btn" onClick={() => handleAnswer(true)}>
                    ✅ Knew it
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'mixed' && mixedQuestions.length > 0) {
    const currentQ = mixedQuestions[currentQuestionIndex];
    const progress = `${currentQuestionIndex + 1} / ${mixedQuestions.length}`;
    
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => setMode('menu')}>← Menu</button>
          <h1>🎯 Mixed Quiz</h1>
          <span className="quiz-progress">{progress}</span>
        </header>

        <div className="quiz-container">
          <div className="quiz-card">
            <div className="quiz-category">{currentQ.group.baseForm} — {currentQ.group.counts}</div>
            
            <div className="quiz-question">
              <p className="question-text">How do you say "{currentQ.number} {currentQ.group.counts}"?</p>
            </div>

            {!showAnswer ? (
              <button className="show-answer-btn" onClick={() => setShowAnswer(true)}>
                Show Answer
              </button>
            ) : (
              <div className="quiz-answer">
                <div className="answer-pattern">{currentQ.pattern.pattern}</div>
                {currentQ.pattern.examples?.[0] && (
                  <p className="answer-example">{currentQ.pattern.examples[0].jp}</p>
                )}
                
                <div className="answer-buttons">
                  <button className="wrong-btn" onClick={() => handleAnswer(false)}>
                    ❌ Didn't know
                  </button>
                  <button className="correct-btn" onClick={() => handleAnswer(true)}>
                    ✅ Knew it
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
