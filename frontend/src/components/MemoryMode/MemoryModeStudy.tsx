import React from 'react';
import { MemoryCard } from '../../hooks/useMemoryProgress.js';
import { Rating } from '../../lib/fsrs.js';
import { JapanesePhrase } from '../JapanesePhrase/index.js';
import { formatInterval } from './memoryModeUtils.js';

interface MemoryModeStudyProps {
  currentCard: MemoryCard;
  stats: { total: number; due: number; new: number; review: number };
  isRevealed: boolean;
  previews: { again: number; hard: number; good: number; easy: number } | null;
  onReveal: () => void;
  onReview: (rating: Rating) => void;
}

export const MemoryModeStudy: React.FC<MemoryModeStudyProps> = ({
  currentCard,
  stats,
  isRevealed,
  previews,
  onReveal,
  onReview,
}) => {
  return (
    <div className="memory-mode-study">
      <div className="memory-card">

        {/* Progress */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((stats.total - stats.new - stats.due + 1) / Math.max(1, stats.total)) * 100}%` }}
          />
        </div>

        {/* Question (Hidden) */}
        <div className="question">
          <div className="question-label">Translate to Japanese</div>
          <div className="question-text">{currentCard.en}</div>
        </div>

        {/* Reveal or Answer */}
        {!isRevealed ? (
          <div className="reveal-section">
            <button className="reveal-btn" onClick={onReveal}>
              Reveal Answer
            </button>
            <p className="reveal-hint">
              Try to say the Japanese phrase out loud before revealing
              <br />
              <kbd>Space</kbd> to reveal
            </p>
          </div>
        ) : (
          <div className="answer-section">
            <div className="answer-box">
              <JapanesePhrase
                text={currentCard.jp}
                furiganaHtml={undefined}
                romaji={currentCard.romaji}
                showFurigana={true}
                showRomaji={true}
                size="large"
              />
            </div>

            {/* Voice Recorder - placeholder for now */}
            <div className="recorder-section">
              <p className="recorder-hint">💡 Practice saying: {currentCard.jp}</p>
            </div>

            {/* Self Assessment */}
            <div className="assessment">
              <p className="assessment-label">How well did you know it?</p>
              <div className="assessment-buttons">
                <button
                  className="assessment-btn again"
                  onClick={() => onReview('again')}
                >
                  <span className="btn-key">1</span>
                  Again {previews && `(${formatInterval(previews.again)})`}
                </button>
                <button
                  className="assessment-btn hard"
                  onClick={() => onReview('hard')}
                >
                  <span className="btn-key">2</span>
                  Hard {previews && `(${formatInterval(previews.hard)})`}
                </button>
                <button
                  className="assessment-btn good"
                  onClick={() => onReview('good')}
                >
                  <span className="btn-key">3</span>
                  Good {previews && `(${formatInterval(previews.good)})`}
                </button>
                <button
                  className="assessment-btn easy"
                  onClick={() => onReview('easy')}
                >
                  <span className="btn-key">4</span>
                  Easy {previews && `(${formatInterval(previews.easy)})`}
                </button>
              </div>
              <p className="keyboard-hint">Space or 1 · 2 · 3 · 4</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
