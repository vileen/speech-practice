import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanjiCardView } from '../../components/KanjiPracticeMode/KanjiCardView';
import type { KanjiCard } from '../../hooks/useKanjiProgress';

const baseCard: KanjiCard = {
  id: 'kanji-1',
  due: new Date('2026-09-04'),
  stability: 1,
  difficulty: 5,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  state: 'new',
  kanjiId: 'kanji-1',
  character: '日',
  meanings: ['sun', 'day'],
  readings: [
    { type: 'kun', reading: 'ひ' },
    { type: 'on', reading: 'ニチ' },
  ],
  examples: [
    { word: '日本', reading: 'にほん', meaning: 'Japan' },
  ],
  lessonId: 'lesson-1',
  mnemonic: 'A sun on the horizon',
};

const defaultProps = {
  isRevealed: false,
  isEditingMnemonic: false,
  editedMnemonic: '',
  onEditMnemonic: vi.fn(),
  onSaveMnemonic: vi.fn(),
  onCancelEditMnemonic: vi.fn(),
  onMnemonicChange: vi.fn(),
};

const renderCard = (card: Partial<KanjiCard> = {}, props: Partial<typeof defaultProps> = {}) => {
  return render(
    <KanjiCardView card={{ ...baseCard, ...card }} {...defaultProps} {...props} />
  );
};

describe('KanjiCardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('unrevealed state', () => {
    it('renders only the kanji character', () => {
      renderCard();
      expect(screen.getByText('日')).toBeInTheDocument();
    });

    it('shows a recall hint when not revealed', () => {
      renderCard();
      expect(screen.getByText(/recall the meaning/i)).toBeInTheDocument();
    });

    it('does not render the card back', () => {
      renderCard();
      expect(screen.queryByText(/meanings:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/readings:/i)).not.toBeInTheDocument();
    });

    it('applies revealed class only when revealed', () => {
      const { container } = renderCard();
      expect(container.querySelector('.kanji-card')).not.toHaveClass('revealed');
    });
  });

  describe('revealed state', () => {
    it('applies revealed class', () => {
      const { container } = renderCard({}, { isRevealed: true });
      expect(container.querySelector('.kanji-card')).toHaveClass('revealed');
    });

    it('lists all meanings', () => {
      renderCard({}, { isRevealed: true });
      expect(screen.getByText('sun')).toBeInTheDocument();
      expect(screen.getByText('day')).toBeInTheDocument();
    });

    it('renders kunyomi and onyomi readings with correct titles', () => {
      renderCard({}, { isRevealed: true });
      expect(screen.getByTitle(/kunyomi/i)).toHaveTextContent('ひ');
      expect(screen.getByTitle(/onyomi/i)).toHaveTextContent('ニチ');
    });

    it('renders readings legend for both reading types', () => {
      renderCard({}, { isRevealed: true });
      expect(screen.getByText('Kunyomi (Japanese)')).toBeInTheDocument();
      expect(screen.getByText('Onyomi (Chinese)')).toBeInTheDocument();
    });

    it('renders mnemonic text and edit button', () => {
      renderCard({}, { isRevealed: true });
      expect(screen.getByText('A sun on the horizon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('calls onEditMnemonic when edit button is clicked', () => {
      const onEditMnemonic = vi.fn();
      renderCard({}, { isRevealed: true, onEditMnemonic });
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      expect(onEditMnemonic).toHaveBeenCalledTimes(1);
    });

    it('renders example words with reading and meaning', () => {
      const { container } = renderCard({}, { isRevealed: true });
      const examples = container.querySelector('.kanji-examples');
      expect(examples).not.toBeNull();
      expect(examples).toHaveTextContent('日本');
      expect(examples).toHaveTextContent('(にほん)');
      expect(examples).toHaveTextContent('- Japan');
    });

    it('shows lesson tag when lessonId is present', () => {
      renderCard({}, { isRevealed: true });
      expect(screen.getByText(/lesson: lesson-1/i)).toBeInTheDocument();
    });

    it('hides mnemonic section when no mnemonic and not editing', () => {
      renderCard({ mnemonic: undefined }, { isRevealed: true });
      expect(screen.queryByText(/mnemonic/i)).not.toBeInTheDocument();
    });

    it('hides examples section when examples are empty', () => {
      renderCard({ examples: [] }, { isRevealed: true });
      expect(screen.queryByText(/examples from lessons/i)).not.toBeInTheDocument();
    });

    it('hides lesson tag when lessonId is absent', () => {
      renderCard({ lessonId: undefined }, { isRevealed: true });
      expect(screen.queryByText(/lesson:/i)).not.toBeInTheDocument();
    });
  });

  describe('mnemonic editing', () => {
    it('shows textarea with editedMnemonic value when editing', () => {
      renderCard({}, { isRevealed: true, isEditingMnemonic: true, editedMnemonic: 'My story' });
      const textarea = screen.getByPlaceholderText(/enter your mnemonic/i);
      expect(textarea).toHaveValue('My story');
    });

    it('hides edit button while editing', () => {
      renderCard({}, { isRevealed: true, isEditingMnemonic: true });
      expect(screen.queryByRole('button', { name: /✏️ edit/i })).not.toBeInTheDocument();
    });

    it('calls onMnemonicChange when textarea changes', () => {
      const onMnemonicChange = vi.fn();
      renderCard({}, { isRevealed: true, isEditingMnemonic: true, onMnemonicChange });
      fireEvent.change(screen.getByPlaceholderText(/enter your mnemonic/i), {
        target: { value: 'new story' },
      });
      expect(onMnemonicChange).toHaveBeenCalledWith('new story');
    });

    it('calls onSaveMnemonic when save is clicked', () => {
      const onSaveMnemonic = vi.fn();
      renderCard({}, { isRevealed: true, isEditingMnemonic: true, onSaveMnemonic });
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
      expect(onSaveMnemonic).toHaveBeenCalledTimes(1);
    });

    it('calls onCancelEditMnemonic when cancel is clicked', () => {
      const onCancelEditMnemonic = vi.fn();
      renderCard({}, { isRevealed: true, isEditingMnemonic: true, onCancelEditMnemonic });
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancelEditMnemonic).toHaveBeenCalledTimes(1);
    });

    it('shows edit form even without existing mnemonic when editing', () => {
      renderCard({ mnemonic: undefined }, { isRevealed: true, isEditingMnemonic: true });
      expect(screen.getByPlaceholderText(/enter your mnemonic/i)).toBeInTheDocument();
    });
  });
});
