import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useFurigana } from '../../hooks/useFurigana.js';
import { Header } from '../Header/index.js';
import { API_URL } from '../../config/api.js';
import './ReadingMode.css';

interface Passage {
  id: number;
  title: string;
  content: string;
  level: string;
  topic: string;
  character_count: number;
  created_at: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  question_type: 'main_idea' | 'detail' | 'inference' | 'vocabulary' | 'grammar';
}

interface AnswerResult {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  questionType: string;
}

interface ReadingResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: AnswerResult[];
  readingTimeSeconds: number | null;
  charsPerMinute: number | null;
}

type ViewState = 'list' | 'reading' | 'questions' | 'results';

const LEVEL_COLORS: Record<string, string> = {
  N5: '#4ade80', // green
  N4: '#60a5fa', // blue
  N3: '#fbbf24', // amber
};

const TYPE_LABELS: Record<string, string> = {
  main_idea: 'Main Idea',
  detail: 'Detail',
  inference: 'Inference',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
};

// Furigana display component
const FuriganaDisplay: React.FC<{
  text: string;
  showFurigana: boolean;
  className?: string;
}> = ({ text, showFurigana, className = '' }) => {
  const { furigana } = useFurigana(text, showFurigana);
  
  if (!showFurigana || !furigana) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span 
      className={`furigana-text ${className}`}
      dangerouslySetInnerHTML={{ __html: furigana }}
    />
  );
};

export const ReadingMode: React.FC = () => {
  // const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('list');
  const [passages, setPassages] = useState<Passage[]>([]);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showFurigana, setShowFurigana] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const password = localStorage.getItem('speech_practice_password') || '';
  const FURIGANA_STORAGE_KEY = 'reading_show_furigana';

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

  // Load passages on mount
  useEffect(() => {
    loadPassages();
  }, []);

  const loadPassages = async () => {
    setLoading(true);
    try {
      const url = selectedLevel 
        ? `${API_URL}/api/reading/passages?level=${selectedLevel}`
        : `${API_URL}/api/reading/passages`;
      
      const response = await fetch(url, {
        headers: { 'X-Password': password }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPassages(data.passages || []);
      }
    } catch (err) {
      console.error('Failed to load passages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload when level filter changes
  useEffect(() => {
    loadPassages();
  }, [selectedLevel]);

  const startReading = async (passage: Passage) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reading/passages/${passage.id}`, {
        headers: { 'X-Password': password }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentPassage(data.passage);
        setQuestions(data.questions || []);
        setStartTime(new Date());
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        setViewState('reading');
      }
    } catch (err) {
      console.error('Failed to load passage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitAnswers = async () => {
    if (!currentPassage || !startTime) return;
    
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => answers[q.id] === undefined);
    if (unansweredQuestions.length > 0) {
      if (!window.confirm(`You have ${unansweredQuestions.length} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }
    
    const endTime = new Date();
    
    const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId: parseInt(questionId),
      selectedOption,
    }));
    
    try {
      const response = await fetch(`${API_URL}/api/reading/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password
        },
        body: JSON.stringify({
          passageId: currentPassage.id,
          answers: answersArray,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setSubmitted(true);
        setViewState('results');
      }
    } catch (err) {
      console.error('Failed to submit answers:', err);
    }
  };

  const goToNextPassage = () => {
    if (!currentPassage) return;
    
    const currentIndex = passages.findIndex(p => p.id === currentPassage.id);
    const nextPassage = passages[currentIndex + 1];
    
    if (nextPassage) {
      startReading(nextPassage);
    } else {
      // Go back to list if no more passages
      setViewState('list');
      setCurrentPassage(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPassageList = () => (
    <div className="reading-list">
      <div className="reading-filters">
        <label>Filter by Level:</label>
        <select 
          value={selectedLevel} 
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="level-select"
        >
          <option value="">All Levels</option>
          <option value="N5">N5 (Beginner)</option>
          <option value="N4">N4 (Elementary)</option>
          <option value="N3">N3 (Intermediate)</option>
        </select>
      </div>
      
      {loading ? (
        <div className="loading">Loading passages...</div>
      ) : passages.length === 0 ? (
        <div className="no-passages">No passages found.</div>
      ) : (
        <div className="passages-grid">
          {passages.map(passage => (
            <div 
              key={passage.id} 
              className="passage-card"
              onClick={() => startReading(passage)}
            >
              <div className="passage-header">
                <h3>{passage.title}</h3>
                <span 
                  className="level-badge"
                  style={{ backgroundColor: LEVEL_COLORS[passage.level] }}
                >
                  {passage.level}
                </span>
              </div>
              <div className="passage-meta">
                {passage.topic && <span className="topic">{passage.topic}</span>}
                <span className="char-count">{passage.character_count} characters</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReadingView = () => {
    if (!currentPassage) return null;
    
    return (
      <div className="reading-view">
        <div className="passage-info">
          <h2>{currentPassage.title}</h2>
          <div className="passage-badges">
            <span 
              className="level-badge"
              style={{ backgroundColor: LEVEL_COLORS[currentPassage.level] }}
            >
              {currentPassage.level}
            </span>
            {currentPassage.topic && (
              <span className="topic-badge">{currentPassage.topic}</span>
            )}
            <span className="char-count-badge">
              {currentPassage.character_count} characters
            </span>
          </div>
        </div>
        
        <div className="passage-content">
          <FuriganaDisplay 
            text={currentPassage.content} 
            showFurigana={showFurigana}
            className="passage-text"
          />
        </div>
        
        <div className="reading-actions">
          <button 
            className="continue-btn"
            onClick={() => setViewState('questions')}
          >
            Continue to Questions →
          </button>
        </div>
      </div>
    );
  };

  const renderQuestionsView = () => {
    if (!currentPassage) return null;
    
    return (
      <div className="questions-view">
        <div className="questions-header">
          <h2>Questions</h2>
          <span className="progress">
            {Object.keys(answers).length} / {questions.length} answered
          </span>
        </div>
        
        <div className="questions-list">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className={`question-card ${answers[question.id] !== undefined ? 'answered' : ''}`}
            >
              <div className="question-header">
                <span className="question-number">{index + 1}</span>
                <span className="question-type">{TYPE_LABELS[question.question_type]}</span>
              </div>
              
              <p className="question-text">
                <FuriganaDisplay 
                  text={question.question} 
                  showFurigana={showFurigana}
                />
              </p>
              
              <div className="options-list">
                {question.options.map((option, optionIndex) => (
                  <label 
                    key={optionIndex}
                    className={`option-label ${answers[question.id] === optionIndex ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => handleAnswerSelect(question.id, optionIndex)}
                    />
                    <span className="option-letter">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="option-text">
                      <FuriganaDisplay 
                        text={option} 
                        showFurigana={showFurigana}
                      />
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="questions-actions">
          <button 
            className="back-btn"
            onClick={() => setViewState('reading')}
          >
            ← Back to Passage
          </button>
          <button 
            className="submit-btn"
            onClick={submitAnswers}
            disabled={Object.keys(answers).length === 0}
          >
            Submit Answers
          </button>
        </div>
      </div>
    );
  };

  const renderResultsView = () => {
    if (!result || !currentPassage) return null;
    
    return (
      <div className="results-view">
        <div className="results-header">
          <h2>Results</h2>
          <div className="score-circle" style={{
            background: `conic-gradient(
              ${result.score >= 80 ? '#4ade80' : result.score >= 60 ? '#fbbf24' : '#f87171'} 
              ${result.score * 3.6}deg, 
              #374151 0deg
            )`
          }}>
            <span className="score-value">{result.score}%</span>
          </div>
        </div>
        
        <div className="results-stats">
          <div className="stat-item">
            <span className="stat-label">Correct</span>
            <span className="stat-value correct">
              {result.correctCount} / {result.totalQuestions}
            </span>
          </div>
          {result.readingTimeSeconds && (
            <div className="stat-item">
              <span className="stat-label">Reading Time</span>
              <span className="stat-value">{formatTime(result.readingTimeSeconds)}</span>
            </div>
          )}
          {result.charsPerMinute && (
            <div className="stat-item">
              <span className="stat-label">Speed</span>
              <span className="stat-value">{result.charsPerMinute} chars/min</span>
            </div>
          )}
        </div>
        
        <div className="answers-review">
          <h3>Review Answers</h3>
          {result.results.map((answer, index) => (
            <div 
              key={answer.questionId}
              className={`answer-review ${answer.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="answer-review-header">
                <span className="question-number">{index + 1}</span>
                <span className="answer-status">
                  {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <span className="question-type">{TYPE_LABELS[answer.questionType]}</span>
              </div>
              
              <p className="question-text">
                <FuriganaDisplay 
                  text={questions.find(q => q.id === answer.questionId)?.question || ''} 
                  showFurigana={showFurigana}
                />
              </p>
              
              <div className="answer-details">
                <div className="your-answer">
                  <span className="label">Your answer:</span>
                  <span className={`value ${answer.isCorrect ? 'correct' : 'wrong'}`}>
                    {String.fromCharCode(65 + answer.selectedOption)}. {' '}
                    <FuriganaDisplay 
                      text={questions.find(q => q.id === answer.questionId)?.options[answer.selectedOption] || ''} 
                      showFurigana={showFurigana}
                    />
                  </span>
                </div>
                
                {!answer.isCorrect && (
                  <div className="correct-answer">
                    <span className="label">Correct answer:</span>
                    <span className="value correct">
                      {String.fromCharCode(65 + answer.correctAnswer)}. {' '}
                      <FuriganaDisplay 
                        text={questions.find(q => q.id === answer.questionId)?.options[answer.correctAnswer] || ''} 
                        showFurigana={showFurigana}
                      />
                    </span>
                  </div>
                )}
              </div>
              
              <div className="explanation">
                <span className="label">Explanation:</span>
                <p>
                  <FuriganaDisplay 
                    text={answer.explanation} 
                    showFurigana={showFurigana}
                  />
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="results-actions">
          <button 
            className="back-btn"
            onClick={() => setViewState('list')}
          >
            ← Back to List
          </button>
          <button 
            className="next-btn"
            onClick={goToNextPassage}
          >
            Next Passage →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <Header
        title="Reading Practice"
        icon="📖"
        onBack={viewState !== 'list' ? () => {
          if (viewState === 'reading') setViewState('list');
          else if (viewState === 'questions') setViewState('reading');
          else if (viewState === 'results') setViewState('list');
        } : undefined}
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
      
      <main className="reading-mode-container">
        {viewState === 'list' && renderPassageList()}
        {viewState === 'reading' && renderReadingView()}
        {viewState === 'questions' && renderQuestionsView()}
        {viewState === 'results' && renderResultsView()}
      </main>
    </div>
  );
};

export default ReadingMode;
