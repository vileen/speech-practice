import React from 'react';
import { KanjiCard } from '../../hooks/useKanjiProgress.js';

interface KanjiCardViewProps {
  card: KanjiCard;
  isRevealed: boolean;
  isEditingMnemonic: boolean;
  editedMnemonic: string;
  onEditMnemonic: () => void;
  onSaveMnemonic: () => void;
  onCancelEditMnemonic: () => void;
  onMnemonicChange: (value: string) => void;
}

export const KanjiCardView: React.FC<KanjiCardViewProps> = ({
  card,
  isRevealed,
  isEditingMnemonic,
  editedMnemonic,
  onEditMnemonic,
  onSaveMnemonic,
  onCancelEditMnemonic,
  onMnemonicChange,
}) => {
  return (
    <div className={`kanji-card ${isRevealed ? 'revealed' : ''}`}>
      {/* Front of card - only kanji */}
      <div className="kanji-card-front">
        <div className="kanji-character">{card.character}</div>
        <div className="kanji-hint">
          {!isRevealed && <p>Recall the meaning...</p>}
        </div>
      </div>

      {/* Back of card - revealed info */}
      {isRevealed && (
        <div className="kanji-card-back">
          <div className="kanji-meanings">
            <h3>Meanings:</h3>
            <ul>
              {card.meanings.map((meaning, idx) => (
                <li key={idx} className="kanji-meaning">
                  {meaning}
                </li>
              ))}
            </ul>
          </div>

          <div className="kanji-readings">
            <h3>Readings:</h3>
            <div className="readings-legend">
              <span className="legend-item">
                <span className="legend-badge kun">日本</span>
                <span className="legend-label">Kunyomi (Japanese)</span>
              </span>
              <span className="legend-item">
                <span className="legend-badge on">中文</span>
                <span className="legend-label">Onyomi (Chinese)</span>
              </span>
            </div>
            <div className="readings-list">
              {card.readings
                .filter((r) => r.type === 'kun')
                .map((r, idx) => (
                  <span
                    key={`kun-${idx}`}
                    className="reading kun"
                    title="Kunyomi (Japanese reading)"
                  >
                    {r.reading}
                  </span>
                ))}
              {card.readings
                .filter((r) => r.type === 'on')
                .map((r, idx) => (
                  <span
                    key={`on-${idx}`}
                    className="reading on"
                    title="Onyomi (Chinese reading)"
                  >
                    {r.reading}
                  </span>
                ))}
            </div>
          </div>

          {(card.mnemonic || isEditingMnemonic) && (
            <div className="kanji-mnemonic">
              <div className="mnemonic-header">
                <h3>Mnemonic (KLC):</h3>
                {!isEditingMnemonic && (
                  <button
                    className="edit-mnemonic-btn"
                    onClick={onEditMnemonic}
                    title="Edit mnemonic"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
              {isEditingMnemonic ? (
                <div className="mnemonic-edit-form">
                  <textarea
                    value={editedMnemonic}
                    onChange={(e) => onMnemonicChange(e.target.value)}
                    placeholder="Enter your mnemonic..."
                    rows={3}
                  />
                  <div className="mnemonic-edit-actions">
                    <button onClick={onSaveMnemonic} className="save-btn">
                      Save
                    </button>
                    <button onClick={onCancelEditMnemonic} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p>{card.mnemonic}</p>
              )}
            </div>
          )}

          {card.examples && card.examples.length > 0 && (
            <div className="kanji-examples">
              <h3>Examples from Lessons:</h3>
              <ul>
                {card.examples.map((ex, idx) => (
                  <li key={idx} className="example-item">
                    <span className="example-word">{ex.word}</span>
                    <span className="example-reading">({ex.reading})</span>
                    <span className="example-meaning">- {ex.meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.lessonId && (
            <div className="kanji-lesson-tag">
              <span>Lesson: {card.lessonId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
