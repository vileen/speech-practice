import { useState, useEffect, useCallback } from 'react';
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

type Mode = 'menu' | 'study' | 'table' | 'quiz' | 'mixed' | 'category-quiz' | 'review';

interface QuizQuestion {
  pattern: CounterPattern;
  group: CounterGroup;
  questionText: string;
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
  
  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  
  // Mixed quiz state
  const [mixedQuestions, setMixedQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Category selection state
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

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

  const getQuestionText = (pattern: CounterPattern, group: CounterGroup): string => {
    // Use example English if available
    const ex = pattern.examples?.[0];
    if (ex?.en) {
      return `How do you say: "${ex.en}"?`;
    }
    // Fallback to group description + pattern
    return `What is the reading for ${group.counts}?`;
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
    pickRandomQuestion();
  };

  const pickRandomQuestion = useCallback(() => {
    if (selectedGroup) {
      const random = selectedGroup.patterns[Math.floor(Math.random() * selectedGroup.patterns.length)];
      setCurrentPattern(random);
      setQuizQuestion({
        pattern: random,
        group: selectedGroup,
        questionText: getQuestionText(random, selectedGroup)
      });
      setShowAnswer(false);
    }
  }, [selectedGroup]);

  const handleAnswer = (_known: boolean) => {
    if (mode === 'mixed' || mode === 'category-quiz') {
      nextMixedQuestion();
    } else {
      pickRandomQuestion();
    }
  };

  // Toggle group selection for category quiz
  const toggleGroupSelection = (baseForm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGroups(prev => {
      const next = new Set(prev);
      if (next.has(baseForm)) {
        next.delete(baseForm);
      } else {
        next.add(baseForm);
      }
      return next;
    });
  };

  // Start quiz from selected groups only
  const startSelectedQuiz = () => {
    const questions: QuizQuestion[] = [];
    const targetCount = 20;
    
    const selectedPatterns: { pattern: CounterPattern; group: CounterGroup }[] = [];
    counterGroups.forEach(group => {
      if (selectedGroups.has(group.baseForm)) {
        group.patterns.forEach(pattern => {
          selectedPatterns.push({ pattern, group });
        });
      }
    });
    
    const shuffled = selectedPatterns.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));
    
    selected.forEach(({ pattern, group }) => {
      questions.push({
        pattern,
        group,
        questionText: getQuestionText(pattern, group)
      });
    });
    
    setMixedQuestions(questions);
    setCurrentQuestionIndex(0);
    setMode('category-quiz');
    setShowAnswer(false);
  };

  // Generate mixed quiz questions from all groups
  const startMixedQuiz = () => {
    const questions: QuizQuestion[] = [];
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
    
    selected.forEach(({ pattern, group }) => {
      questions.push({
        pattern,
        group,
        questionText: getQuestionText(pattern, group)
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
      setMode('menu');
    }
  };

  if (mode === 'menu') {
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
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
            <h2>Select a group to study, or pick multiple for a quiz:</h2>
            <div className="groups-grid">
              {counterGroups.map(group => {
                const isSelected = selectedGroups.has(group.baseForm);
                return (
                  <div 
                    key={group.baseForm}
                    className={`group-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => startStudy(group)}
                  >
                    <div className="group-card-header">
                      <h3>{group.baseForm}</h3>
                      <label 
                        className="group-checkbox"
                        onClick={(e) => toggleGroupSelection(group.baseForm, e)}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {}} 
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    <p className="group-counts">{group.counts}</p>
                    <div className="group-meta">
                      <span>{group.count} variants</span>
                      <button className="study-btn" onClick={(e) => { e.stopPropagation(); startStudy(group); }}>
                        Study →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating action: practice selected groups */}
        {selectedGroups.size > 0 && (
          <div className="selected-quiz-fab" onClick={startSelectedQuiz}>
            <span className="fab-label">🎯 Practice {selectedGroups.size} group{selectedGroups.size > 1 ? 's' : ''}</span>
            <span className="fab-count">{Array.from(selectedGroups).map(bf => counterGroups.find(g => g.baseForm === bf)?.count || 0).reduce((a,b) => a+b, 0)} cards</span>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'study' && selectedGroup && currentPattern) {
    const currentIdx = selectedGroup.patterns.indexOf(currentPattern);
    
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => setMode('menu')}>← Menu</button>
          <h1>{selectedGroup.baseForm} - {selectedGroup.counts}</h1>
          <div className="study-actions">
            <button className="table-btn" onClick={() => setMode('table')}>📋 Table</button>
            <button className="quiz-btn" onClick={startQuiz}>🎯 Quiz</button>
          </div>
        </header>

        <div className="study-container">
          <div className="counter-card">
            <div className="counter-pattern-large">{currentPattern.pattern}</div>
            
            <div className="counter-info-section">
              <h3>{selectedGroup.counts}</h3>
            </div>

            {currentPattern.examples?.length > 0 && (
              <div className="counter-examples-section">
                <h4>Examples:</h4>
                {currentPattern.examples.slice(0, 2).map((ex: any, i: number) => (
                  <div key={i} className="example-item">
                    <p className="jp">{ex.jp}</p>
                    <p className="en">{ex.en}</p>
                    {ex.romaji && <p className="romaji">{ex.romaji}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="counter-navigation">
              <button onClick={() => {
                if (currentIdx > 0) setCurrentPattern(selectedGroup.patterns[currentIdx - 1]);
              }} disabled={currentIdx === 0}>
                ← Previous
              </button>
              <span>{currentIdx + 1} / {selectedGroup.patterns.length}</span>
              <button onClick={() => {
                if (currentIdx < selectedGroup.patterns.length - 1) setCurrentPattern(selectedGroup.patterns[currentIdx + 1]);
              }} disabled={currentIdx === selectedGroup.patterns.length - 1}>
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'table' && selectedGroup) {
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => setMode('menu')}>← Menu</button>
          <h1>{selectedGroup.baseForm} - {selectedGroup.counts}</h1>
          <div className="study-actions">
            <button className="table-btn active" onClick={() => setMode('study')}>📋 Cards</button>
            <button className="quiz-btn" onClick={startQuiz}>🎯 Quiz</button>
          </div>
        </header>

        <div className="table-container">
          <table className="counter-table">
            <thead>
              <tr>
                <th>Counter</th>
                <th>Meaning</th>
                <th>Rule</th>
              </tr>
            </thead>
            <tbody>
              {selectedGroup.patterns.map(p => {
                const ex = p.examples?.[0];
                const rule = p.formation_rules?.[0]?.rule || '';
                return (
                  <tr key={p.id}>
                    <td className="col-counter">
                      <span className="table-pattern">{p.pattern}</span>
                      {ex?.romaji && <span className="table-romaji">{ex.romaji}</span>}
                    </td>
                    <td className="col-meaning">{ex?.en || '-'}</td>
                    <td className="col-rule">{rule}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mode === 'quiz' && selectedGroup && quizQuestion) {
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => setMode('study')}>← Study</button>
          <h1>🎯 Quiz: {selectedGroup.baseForm}</h1>
        </header>

        <div className="quiz-container">
          <div className="quiz-card">
            <div className="quiz-question">
              <p className="question-text">{quizQuestion.questionText}</p>
            </div>

            {!showAnswer ? (
              <button className="show-answer-btn" onClick={() => setShowAnswer(true)}>
                Show Answer
              </button>
            ) : (
              <div className="quiz-answer">
                <div className="answer-pattern">{quizQuestion.pattern.pattern}</div>
                {quizQuestion.pattern.examples?.[0] && (
                  <div className="answer-example">
                    <p className="jp">{quizQuestion.pattern.examples[0].jp}</p>
                    <p className="en">{quizQuestion.pattern.examples[0].en}</p>
                    {quizQuestion.pattern.examples[0].romaji && (
                      <p className="romaji">{quizQuestion.pattern.examples[0].romaji}</p>
                    )}
                  </div>
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

  if ((mode === 'mixed' || mode === 'category-quiz') && mixedQuestions.length > 0) {
    const currentQ = mixedQuestions[currentQuestionIndex];
    const progress = `${currentQuestionIndex + 1} / ${mixedQuestions.length}`;
    const title = mode === 'category-quiz' ? '🎯 Category Quiz' : '🎯 Mixed Quiz';
    
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => setMode('menu')}>← Menu</button>
          <h1>{title}</h1>
          <span className="quiz-progress">{progress}</span>
        </header>

        <div className="quiz-container">
          <div className="quiz-card">
            <div className="quiz-category">{currentQ.group.baseForm} — {currentQ.group.counts}</div>
            
            <div className="quiz-question">
              <p className="question-text">{currentQ.questionText}</p>
            </div>

            {!showAnswer ? (
              <button className="show-answer-btn" onClick={() => setShowAnswer(true)}>
                Show Answer
              </button>
            ) : (
              <div className="quiz-answer">
                <div className="answer-pattern">{currentQ.pattern.pattern}</div>
                {currentQ.pattern.examples?.[0] && (
                  <div className="answer-example">
                    <p className="jp">{currentQ.pattern.examples[0].jp}</p>
                    <p className="en">{currentQ.pattern.examples[0].en}</p>
                    {currentQ.pattern.examples[0].romaji && (
                      <p className="romaji">{currentQ.pattern.examples[0].romaji}</p>
                    )}
                  </div>
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
