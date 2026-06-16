import React from 'react';
import { useConversationMode } from './hooks/useConversationMode';

export const ConversationMode: React.FC = () => {
  const {
    templates,
    selectedTemplate,
    userRole,
    currentTurnIndex,
    loading,
    currentTurn,
    isUserTurn,
    isComplete,
    startConversation,
    handleTurnComplete,
    playTurn,
    goBack,
  } = useConversationMode();

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

  return (
    <div>
      <button className="back-button" onClick={goBack}>
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
            <p>{currentTurn?.japanese}</p>
            <p className="romaji">{currentTurn?.romaji}</p>
            <div className="audio-controls">
              <button
                className="control-button"
                onClick={() => currentTurn && playTurn(currentTurn)}
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
          <p>{currentTurn?.japanese}</p>
          <p className="romaji">{currentTurn?.romaji}</p>
          <div className="audio-controls">
            <button
              className="control-button primary"
              onClick={() => currentTurn && playTurn(currentTurn)}
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
