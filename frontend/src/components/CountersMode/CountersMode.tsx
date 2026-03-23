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
  counts: string; // What it counts (people, objects, etc.)
  description: string;
}

type Mode = 'menu' | 'study' | 'quiz' | 'review';

export function CountersMode() {
  const navigate = useNavigate();
  const password = localStorage.getItem('speech_practice_password') || '';
  
  const [mode, setMode] = useState<Mode>('menu');
  const [counterGroups, setCounterGroups] = useState<CounterGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CounterGroup | null>(null);
  const [currentPattern, setCurrentPattern] = useState<CounterPattern | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all counter groups
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
    // Pick first pattern or random
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
    // TODO: Send to backend for SRS tracking
    pickRandomPattern();
  };

  if (mode === 'menu') {
    return (
      <div className="counters-mode">
        <header className="counters-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <h1>📊 Liczniki Japońskie</h1>
          <div className="counters-stats">
            <span>{counterGroups.length} grup liczników</span>
          </div>
        </header>

        <div className="counters-intro">
          <h2>Co to są liczniki?</h2>
          <p>
            W japońskim liczniki (数詞 - sūshi) to specjalne słowa używane do liczenia rzeczy. 
            W zależności od tego co liczysz (osoby, przedmioty, minuty), używasz innego licznika.
          </p>
          <div className="counter-examples">
            <div className="counter-example">
              <span className="jp">ひとり</span> 
              <span className="desc">1 osoba</span>
            </div>
            <div className="counter-example">
              <span className="jp">いっぽん</span> 
              <span className="desc">1 długi przedmiot (ołówek)</span>
            </div>
            <div className="counter-example">
              <span className="jp">さんこ</span> 
              <span className="desc">3 małe przedmioty (jabłka)</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Ładowanie liczników...</div>
        ) : (
          <div className="counter-groups">
            <h2>Wybierz grupę do nauki:</h2>
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
                    <span>{group.count} wariantów</span>
                    <button className="study-btn">Ucz się →</button>
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
              <h3>Liczy: {selectedGroup.counts}</h3>
              <p>{selectedGroup.description}</p>
            </div>

            {currentPattern.examples?.length > 0 && (
              <div className="counter-examples-section">
                <h4>Przykłady:</h4>
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
                ← Poprzedni
              </button>
              <span>{selectedGroup.patterns.indexOf(currentPattern) + 1} / {selectedGroup.patterns.length}</span>
              <button onClick={() => {
                const idx = selectedGroup.patterns.indexOf(currentPattern);
                if (idx < selectedGroup.patterns.length - 1) setCurrentPattern(selectedGroup.patterns[idx + 1]);
              }} disabled={selectedGroup.patterns.indexOf(currentPattern) === selectedGroup.patterns.length - 1}>
                Następny →
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
              <p className="question-text">Jak powiesz "{Math.floor(Math.random() * 10) + 1} {selectedGroup.counts}"?</p>
            </div>

            {!showAnswer ? (
              <button className="show-answer-btn" onClick={() => setShowAnswer(true)}>
                Pokaż odpowiedź
              </button>
            ) : (
              <div className="quiz-answer">
                <div className="answer-pattern">{currentPattern.pattern}</div>
                {currentPattern.examples?.[0] && (
                  <p className="answer-example">{currentPattern.examples[0].jp}</p>
                )}
                
                <div className="answer-buttons">
                  <button className="wrong-btn" onClick={() => handleAnswer(false)}>
                    ❌ Nie wiedziałem
                  </button>
                  <button className="correct-btn" onClick={() => handleAnswer(true)}>
                    ✅ Wiedziałem
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
