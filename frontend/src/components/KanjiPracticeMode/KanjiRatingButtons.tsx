import React from 'react';
import { Rating } from '../../lib/fsrs.js';

interface KanjiRatingButtonsProps {
  intervals: Record<Rating, string>;
  onReview: (rating: Rating) => void;
}

export const KanjiRatingButtons: React.FC<KanjiRatingButtonsProps> = ({
  intervals,
  onReview,
}) => {
  const ratings: { key: Rating; label: string; keyHint: string; className: string }[] = [
    { key: 'again', label: 'Again', keyHint: '1', className: 'again' },
    { key: 'hard', label: 'Hard', keyHint: '2', className: 'hard' },
    { key: 'good', label: 'Good', keyHint: '3', className: 'good' },
    { key: 'easy', label: 'Easy', keyHint: '4', className: 'easy' },
  ];

  return (
    <div className="kanji-rating-buttons">
      {ratings.map((rating) => (
        <button
          key={rating.key}
          className={`rating-btn ${rating.className}`}
          onClick={() => onReview(rating.key)}
        >
          <span className="rating-key">{rating.keyHint}</span>
          <span className="rating-label">{rating.label}</span>
          <span className="rating-interval">{intervals[rating.key]}</span>
        </button>
      ))}
    </div>
  );
};
