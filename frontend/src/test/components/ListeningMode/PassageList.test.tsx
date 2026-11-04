import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassageList } from '../../../components/ListeningMode/PassageList';
import { ListeningPassage } from '../../../hooks/useListeningMode';

const mockPassage = (overrides: Partial<ListeningPassage> = {}): ListeningPassage => ({
  id: 1,
  title: 'Daily Conversation',
  level: 'N5',
  audio_url: '/audio/1.mp3',
  duration_seconds: 125,
  difficulty_speed: 'normal',
  topic_category: 'Daily Life',
  created_at: '2026-11-01T00:00:00Z',
  ...overrides,
});

const renderPassageList = (props: Partial<Parameters<typeof PassageList>[0]> = {}) => {
  const defaultProps = {
    passages: [] as ListeningPassage[],
    loading: false,
    selectedLevel: '',
    onLevelChange: vi.fn(),
    onPassageClick: vi.fn(),
  };
  return render(<PassageList {...defaultProps} {...props} />);
};

describe('PassageList', () => {
  let onLevelChange: ReturnType<typeof vi.fn>;
  let onPassageClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onLevelChange = vi.fn();
    onPassageClick = vi.fn();
  });

  describe('rendering states', () => {
    it('should show loading message when loading', () => {
      renderPassageList({ loading: true });

      expect(screen.getByText('Loading passages...')).toBeInTheDocument();
      expect(screen.queryByText('No listening passages found.')).not.toBeInTheDocument();
    });

    it('should show empty message when there are no passages', () => {
      renderPassageList({ passages: [] });

      expect(screen.getByText('No listening passages found.')).toBeInTheDocument();
    });

    it('should not show empty message while loading even with no passages', () => {
      renderPassageList({ loading: true, passages: [] });

      expect(screen.getByText('Loading passages...')).toBeInTheDocument();
      expect(screen.queryByText('No listening passages found.')).not.toBeInTheDocument();
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
      mockPassage({ id: 1, title: 'At the Station', level: 'N5', duration_seconds: 65 }),
      mockPassage({
        id: 2,
        title: 'Job Interview',
        level: 'N3',
        duration_seconds: 301,
        topic_category: 'Business',
        difficulty_speed: 'fast',
      }),
    ];

    it('should render a card for each passage', () => {
      renderPassageList({ passages });

      expect(screen.getByText('At the Station')).toBeInTheDocument();
      expect(screen.getByText('Job Interview')).toBeInTheDocument();
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

    it('should format duration as m:ss', () => {
      renderPassageList({ passages });

      expect(screen.getByText('1:05')).toBeInTheDocument();
      expect(screen.getByText('5:01')).toBeInTheDocument();
    });

    it('should show topic category and speed when present', () => {
      renderPassageList({ passages });

      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('fast')).toBeInTheDocument();
    });

    it('should hide optional meta fields when absent', () => {
      renderPassageList({
        passages: [mockPassage({ topic_category: null, difficulty_speed: null })],
      });

      expect(screen.queryByText('Business')).not.toBeInTheDocument();
      expect(screen.queryByText('fast')).not.toBeInTheDocument();
    });

    it('should call onPassageClick with the passage when a card is clicked', () => {
      renderPassageList({ passages, onPassageClick });

      fireEvent.click(screen.getByText('Job Interview'));

      expect(onPassageClick).toHaveBeenCalledTimes(1);
      expect(onPassageClick).toHaveBeenCalledWith(passages[1]);
    });
  });
});
