import React, { useState, useEffect, useRef } from 'react';
import { VoiceRecorder } from '../VoiceRecorder/VoiceRecorder';
import { usePronunciationCheck } from '../../hooks/usePronunciationCheck';
import { Header } from '../Header/index.js';
import { API_URL } from '../../config/api.js';
import './SpeakingMode.css';

type TabMode = 'shadowing' | 'response' | 'conversation';

interface ConversationTemplate {
  id: number;
  title: string;
  scenario: string;
  difficulty: string;
  turns: Turn[];
}

interface Turn {
  speaker: string;
  japanese: string;
  romaji: string;
  meaning: string;
}

interface ShadowingExercise {
  id: number;
  title: string;
  audio_url: string;
  japanese_text: string;
  level: string;
  duration_seconds: number;
}

interface ResponseDrill {
  id: number;
  cue_text: string;
  suggested_response: string;
  time_limit_seconds: number;
  difficulty: string;
  category: string;
}

export const SpeakingMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('shadowing');

  return (
    <div className="app">
      <Header title="Speaking Practice" icon="🎤" showBackButton={true} />
      <main className="speaking-mode-container">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${activeTab === 'shadowing' ? 'active' : ''}`}
            onClick={() => setActiveTab('shadowing')}
          >
            🎧 Shadowing
          </button>
          <button
            className={`mode-tab ${activeTab === 'response' ? 'active' : ''}`}
            onClick={() => setActiveTab('response')}
          >
            ⚡ Response Drills
          </button>
          <button
            className={`mode-tab ${activeTab === 'conversation' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversation')}
          >
            💬 Conversation
          </button>
        </div>

        <div className="mode-content">
          {activeTab === 'shadowing' && <ShadowingMode />}
          {activeTab === 'response' && <ResponseDrillsMode />}
          {activeTab === 'conversation' && <ConversationMode />}
        </div>
      </main>
    </div>
  );
};

// ==================== SHADOWING MODE ====================

const ShadowingMode: React.FC = () => {
  const [exercises, setExercises] = useState<ShadowingExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ShadowingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [_audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { result, check, isChecking } = usePronunciationCheck();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_URL}/api/speaking/shadowing`);
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Failed to fetch shadowing exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    if (selectedExercise) {
      await check(blob, selectedExercise.japanese_text, 'japanese');
    }
  };

  const playNativeAudio = () => {
    // In a real implementation, this would play the audio_url
    // For now, we'll use text-to-speech as a fallback
    if (selectedExercise) {
      const utterance = new SpeechSynthesisUtterance(selectedExercise.japanese_text);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) return <div className="loading">Loading exercises...</div>;

  if (!selectedExercise) {
    return (
      <div>
        <h2>Select an Exercise</h2>
        <div className="exercise-list">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="exercise-item"
              onClick={() => setSelectedExercise(exercise)}
            >
              <h4>{exercise.title}</h4>
              <div className="exercise-meta">
                <span>Level: {exercise.level}</span>
                <span>{exercise.duration_seconds}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-button" onClick={() => {
        setSelectedExercise(null);
        setAudioBlob(null);
      }}>
        ← Back to List
      </button>
      
      <h2>{selectedExercise.title}</h2>
      
      <div className="shadowing-player">
        <button 
          className="play-button"
          onClick={playNativeAudio}
        >
          ▶ Play Native Audio
        </button>
        
        <div className="japanese-text-display">
          <p>{selectedExercise.japanese_text}</p>
        </div>
      </div>

      <div className="recording-section">
        <h3>Your Turn - Record Yourself</h3>
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          isListening={false}
          onStartListening={() => {}}
          onStopListening={() => {}}
          mode="push-to-talk"
        />
        
        {isChecking && <p>Analyzing pronunciation...</p>}
        
        {result && (
          <div className="score-display">
            <h4>Pronunciation Score</h4>
            <div className="score-value">{result.score}%</div>
            <p>{result.score >= 80 ? 'Great job!' : result.score >= 60 ? 'Good attempt!' : 'Keep practicing!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== RESPONSE DRILLS MODE ====================

const ResponseDrillsMode: React.FC = () => {
  const [drills, setDrills] = useState<ResponseDrill[]>([]);
  const [currentDrill, setCurrentDrill] = useState<ResponseDrill | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [_audioBlob2, setAudioBlob] = useState<Blob | null>(null);
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchDrills();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const fetchDrills = async () => {
    try {
      const response = await fetch(`${API_URL}/api/speaking/response-drills`);
      const data = await response.json();
      setDrills(data);
    } catch (error) {
      console.error('Failed to fetch response drills:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDrill = (drill: ResponseDrill) => {
    setCurrentDrill(drill);
    setTimeLeft(drill.time_limit_seconds);
    setIsActive(true);
    setAudioBlob(null);
    setEvaluation(null);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentDrill) {
      try {
        // Convert blob to text for evaluation (in production, use STT)
        const response = await fetch(`${API_URL}/api/speaking/evaluate-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userResponse: '[recorded audio]',
            suggestedResponse: currentDrill.suggested_response,
            drillId: currentDrill.id
          })
        });
        const result = await response.json();
        setEvaluation(result);
      } catch (error) {
        console.error('Evaluation failed:', error);
      }
    }
  };

  const getTimerClass = () => {
    if (timeLeft <= 5) return 'danger';
    if (timeLeft <= 10) return 'warning';
    return '';
  };

  if (loading) return <div className="loading">Loading drills...</div>;

  if (!currentDrill) {
    return (
      <div>
        <h2>Response Drills</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Listen to the cue and respond quickly! You'll have a limited time to answer.
        </p>
        <div className="exercise-list">
          {drills.map((drill) => (
            <div
              key={drill.id}
              className="exercise-item"
              onClick={() => startDrill(drill)}
            >
              <h4>{drill.category}</h4>
              <p style={{ margin: '8px 0', color: '#555', fontSize: '14px' }}>
                {drill.cue_text.substring(0, 80)}...
              </p>
              <div className="exercise-meta">
                <span>{drill.difficulty}</span>
                <span>{drill.time_limit_seconds}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-button" onClick={() => {
        setCurrentDrill(null);
        setIsActive(false);
        setEvaluation(null);
        if (timerRef.current) clearInterval(timerRef.current);
      }}>
        ← Back to Drills
      </button>

      <div className="cue-card">
        <h3>Scenario</h3>
        <p className="cue-text">{currentDrill.cue_text}</p>
      </div>

      <div className="timer-display">
        <div className={`timer ${getTimerClass()}`}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
        <div className="timer-label">seconds remaining</div>
      </div>

      {isActive && (
        <div className="recording-section">
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isListening={false}
            onStartListening={() => {}}
            onStopListening={() => {}}
            mode="push-to-talk"
          />
        </div>
      )}

      {evaluation && (
        <div className={`evaluation-result ${
          evaluation.score >= 80 ? 'excellent' : 
          evaluation.score >= 50 ? 'good' : 'needs-work'
        }`}>
          <h4>{evaluation.score >= 80 ? '🎉 Excellent!' : evaluation.score >= 50 ? '👍 Good!' : '💪 Keep Practicing!'}</h4>
          <p>{evaluation.feedback}</p>
        </div>
      )}

      <div className="suggested-response">
        <h4>Suggested Response</h4>
        <p>{currentDrill.suggested_response}</p>
      </div>
    </div>
  );
};

// ==================== CONVERSATION MODE ====================

const ConversationMode: React.FC = () => {
  const [templates, setTemplates] = useState<ConversationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [_completedTurns, setCompletedTurns] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/speaking/templates`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = (template: ConversationTemplate, role: string) => {
    setSelectedTemplate(template);
    setUserRole(role);
    setCurrentTurnIndex(0);
    setCompletedTurns(new Set());
  };

  const handleTurnComplete = () => {
    setCompletedTurns(prev => new Set(prev).add(currentTurnIndex));
    setCurrentTurnIndex(prev => prev + 1);
  };

  const playTurn = (turn: Turn) => {
    const utterance = new SpeechSynthesisUtterance(turn.japanese);
    utterance.lang = 'ja-JP';
    speechSynthesis.speak(utterance);
  };

  if (loading) return <div className="loading">Loading templates...</div>;

  if (!selectedTemplate) {
    return (
      <div>
        <h2>Conversation Practice</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Practice real conversations! Choose a scenario and role.
        </p>
        <div className="exercise-list">
          {templates.map((template) => (
            <div key={template.id} className="exercise-item">
              <h4>{template.title}</h4>
              <p style={{ margin: '8px 0', color: '#555', fontSize: '14px' }}>
                Scenario: {template.scenario}
              </p>
              <div className="exercise-meta">
                <span>{template.difficulty}</span>
                <span>{template.turns?.length || 0} turns</span>
              </div>
              <div className="role-selection" style={{ marginTop: '12px' }}>
                <button 
                  className="role-button"
                  onClick={() => startConversation(template, template.turns[0]?.speaker || 'A')}
                >
                  Play Role A
                </button>
                <button 
                  className="role-button"
                  onClick={() => startConversation(template, template.turns[1]?.speaker || 'B')}
                >
                  Play Role B
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentTurn = selectedTemplate.turns[currentTurnIndex];
  const isUserTurn = currentTurn?.speaker === userRole;
  const isComplete = currentTurnIndex >= selectedTemplate.turns.length;

  return (
    <div>
      <button className="back-button" onClick={() => {
        setSelectedTemplate(null);
        setUserRole('');
        setCurrentTurnIndex(0);
        setCompletedTurns(new Set());
      }}>
        ← Back to Templates
      </button>

      <h2>{selectedTemplate.title}</h2>
      <p style={{ color: '#666', marginBottom: '16px' }}>
        You are playing: <strong>{userRole}</strong>
      </p>

      <div className="dialogue-container">
        {selectedTemplate.turns.map((turn, index) => {
          const isPast = index < currentTurnIndex;
          const isCurrent = index === currentTurnIndex;
          const isUser = turn.speaker === userRole;

          if (!isPast && !isCurrent) return null;

          return (
            <div
              key={index}
              className={`dialogue-turn ${isUser ? 'user' : 'partner'} ${isCurrent ? 'current' : ''}`}
            >
              <div className="turn-speaker">{turn.speaker}</div>
              <div className="turn-japanese">{turn.japanese}</div>
              <div className="turn-romaji">{turn.romaji}</div>
              <div className="turn-meaning">{turn.meaning}</div>
            </div>
          );
        })}
      </div>

      {isComplete ? (
        <div className="evaluation-result excellent">
          <h4>🎉 Conversation Complete!</h4>
          <p>Great job practicing this conversation!</p>
        </div>
      ) : isUserTurn ? (
        <div>
          <div className="your-turn-indicator">
            <p>🎤 It's your turn! Practice saying the line above.</p>
          </div>
          <div className="current-turn">
            <h4>Your line:</h4>
            <p>{currentTurn.japanese}</p>
            <p className="romaji">{currentTurn.romaji}</p>
            <div className="audio-controls">
              <button 
                className="control-button"
                onClick={() => playTurn(currentTurn)}
              >
                🔊 Hear It
              </button>
              <button 
                className="control-button primary"
                onClick={handleTurnComplete}
              >
                ✓ I Said It
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="current-turn">
          <h4>Partner says:</h4>
          <p>{currentTurn.japanese}</p>
          <p className="romaji">{currentTurn.romaji}</p>
          <div className="audio-controls">
            <button 
              className="control-button primary"
              onClick={() => playTurn(currentTurn)}
            >
              🔊 Play Audio
            </button>
            <button 
              className="control-button"
              onClick={handleTurnComplete}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
