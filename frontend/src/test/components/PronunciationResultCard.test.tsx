import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PronunciationResultCard } from '../../components/RepeatMode/PronunciationResultCard';
import type { PronunciationResult } from '../../hooks/usePronunciationCheck';

describe('PronunciationResultCard', () => {
  const baseResult: PronunciationResult = {
    target_text: 'こんにちは',
    transcription: 'こんにちは',
    score: 95,
    feedback: 'Excellent pronunciation!',
    text_with_furigana: '',
  };

  const renderCard = (result: PronunciationResult) =>
    render(<PronunciationResultCard result={result} />);

  describe('Initial Render', () => {
    it('should render the score as a percentage', () => {
      renderCard(baseResult);

      expect(screen.getByText('95%')).toBeInTheDocument();
    });

    it('should render the feedback message', () => {
      renderCard(baseResult);

      expect(screen.getByText('Excellent pronunciation!')).toBeInTheDocument();
    });

    it('should render the target text in the expected row', () => {
      renderCard(baseResult);

      const expectedRow = document.querySelector('.transcription-comparison .expected');
      expect(expectedRow).toHaveTextContent('Expected:');
      expect(expectedRow).toHaveTextContent('こんにちは');
    });

    it('should render the transcription in the heard row', () => {
      renderCard(baseResult);

      const heardRow = document.querySelector('.transcription-comparison .heard');
      expect(heardRow).toHaveTextContent('Heard:');
      expect(heardRow).toHaveTextContent('こんにちは');
    });

    it('should apply the score-based CSS class', () => {
      const { container } = renderCard(baseResult);

      expect(container.firstChild).toHaveClass('result-card', 'score-95');
    });
  });

  describe('Empty Transcription', () => {
    it("should show '(nothing)' when transcription is empty", () => {
      renderCard({ ...baseResult, transcription: '' });

      expect(screen.getByText('(nothing)')).toBeInTheDocument();
    });
  });

  describe('Errors Section', () => {
    it('should not render the errors section when there are no errors', () => {
      renderCard({ ...baseResult, errors: [] });

      expect(screen.queryByText(/what to improve/i)).not.toBeInTheDocument();
    });

    it('should not render the errors section when errors is undefined', () => {
      renderCard({ ...baseResult, errors: undefined });

      expect(screen.queryByText(/what to improve/i)).not.toBeInTheDocument();
    });

    it('should render each error when errors are present', () => {
      renderCard({
        ...baseResult,
        errors: ['Vowel length was too short', 'Pitch accent on second syllable'],
      });

      expect(screen.getByText(/what to improve/i)).toBeInTheDocument();
      expect(screen.getByText('Vowel length was too short')).toBeInTheDocument();
      expect(screen.getByText('Pitch accent on second syllable')).toBeInTheDocument();
    });

    it('should render errors as list items', () => {
      renderCard({ ...baseResult, errors: ['One error'] });

      const list = document.querySelector('.errors-section ul');
      expect(list).toBeInTheDocument();
      expect(list?.querySelectorAll('li')).toHaveLength(1);
    });
  });

  describe('Low Score Result', () => {
    it('should render a failing score correctly', () => {
      renderCard({
        ...baseResult,
        score: 42,
        feedback: 'Keep practicing!',
        transcription: 'こんばんは',
        errors: ['Wrong word detected'],
      });

      expect(screen.getByText('42%')).toBeInTheDocument();
      expect(screen.getByText('Keep practicing!')).toBeInTheDocument();
      expect(screen.getByText('こんばんは')).toBeInTheDocument();
      expect(screen.getByText('Wrong word detected')).toBeInTheDocument();
    });
  });
});
