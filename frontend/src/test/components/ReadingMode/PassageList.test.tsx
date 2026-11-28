import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassageList } from '../../../components/ReadingMode/PassageList';
import { Passage } from '../../../components/ReadingMode/types';

const mockPassage = (overrides: Partial<Passage> = {}): Passage => ({
  id: 1,
  title: 'At the Convenience Store',
  content: 'コンビニで買い物をします。',
  level: 'N5',
  topic: 'Daily Life',
  character_count: 120,
  created_at: '2026-11-01T00:00:00Z',
  ...overrides,
});

const renderPassageList = (props: Partial<Parameters<typeof PassageList>[0]> = {}) => {
  const defaultProps = {
    passages: [] as Passage[],
    selectedLevel: '',
    loading: false,
    onLevelChange: vi.fn(),
    onPassageSelect: vi.fn(),
  };
  return render(<PassageList {...defaultProps} {...props} />);
};

describe('PassageList', () => {
  let onLevelChange: ReturnType<typeof vi.fn>;
  let onPassageSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onLevelChange = vi.fn();
    onPassageSelect = vi.fn();
  });

  describe('rendering states', () => {
    it('should show loading message when loading', () => {
      renderPassageList({ loading: true });

      expect(screen.getByText('Loading passages...')).toBeInTheDocument();
      expect(screen.queryByText('No passages found.')).not.toBeInTheDocument();
    });

    it('should show empty message when there are no passages', () => {
      renderPassageList({ passages: [] });

      expect(screen.getByText('No passages found.')).toBeInTheDocument();
    });

    it('should not show empty message while loading even with no passages', () => {
      renderPassageList({ loading: true, passages: [] });

      expect(screen.getByText('Loading passages...')).toBeInTheDocument();
      expect(screen.queryByText('No passages found.')).not.toBeInTheDocument();
    });
  });

  describe('level filter', () => {
    it('should render all level options', () => {
      renderPassageList();

      expect(screen.getByRole('option', { name: 'All Levels' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'N5 (Beginner)' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'N4 (Elementary)' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'N3 (Intermediate)' })).toBeInTheDocument();
    });

    it('should reflect the selected level', () => {
      renderPassageList({ selectedLevel: 'N4' });

      expect(screen.getByRole('combobox')).toHaveValue('N4');
    });

    it('should call onLevelChange when a level is selected', () => {
      renderPassageList({ onLevelChange });

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'N3' } });

      expect(onLevelChange).toHaveBeenCalledTimes(1);
      expect(onLevelChange).toHaveBeenCalledWith('N3');
    });
  });

  describe('passage cards', () => {
    const passages = [
      mockPassage({ id: 1, title: 'At the Park', level: 'N5', character_count: 80 }),
      mockPassage({
        id: 2,
        title: 'A Letter to a Friend',
        level: 'N3',
        character_count: 450,
        topic: 'Friendship',
      }),
    ];

    it('should render a card for each passage', () => {
      renderPassageList({ passages });

      expect(screen.getByText('At the Park')).toBeInTheDocument();
      expect(screen.getByText('A Letter to a Friend')).toBeInTheDocument();
    });

    it('should display level badges with correct text', () => {
      renderPassageList({ passages });

      expect(screen.getByText('N5')).toBeInTheDocument();
      expect(screen.getByText('N3')).toBeInTheDocument();
    });

    it('should apply the correct color to each level badge', () => {
      renderPassageList({ passages });

      expect(screen.getByText('N5')).toHaveStyle({ backgroundColor: '#4ade80' });
      expect(screen.getByText('N3')).toHaveStyle({ backgroundColor: '#fbbf24' });
    });

    it('should display the character count for each passage', () => {
      renderPassageList({ passages });

      expect(screen.getByText('80 characters')).toBeInTheDocument();
      expect(screen.getByText('450 characters')).toBeInTheDocument();
    });

    it('should show the topic when present', () => {
      renderPassageList({ passages });

      expect(screen.getByText('Daily Life')).toBeInTheDocument();
      expect(screen.getByText('Friendship')).toBeInTheDocument();
    });

    it('should hide the topic when it is empty', () => {
      renderPassageList({
        passages: [mockPassage({ topic: '' })],
      });

      expect(screen.queryByText('Daily Life')).not.toBeInTheDocument();
    });

    it('should call onPassageSelect with the passage when a card is clicked', () => {
      renderPassageList({ passages, onPassageSelect });

      fireEvent.click(screen.getByText('A Letter to a Friend'));

      expect(onPassageSelect).toHaveBeenCalledTimes(1);
      expect(onPassageSelect).toHaveBeenCalledWith(passages[1]);
    });
  });
});
