import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListeningPlayer } from '../../components/ListeningMode/ListeningPlayer';
import type { ListeningPassage } from '../../hooks/useListeningMode';

describe('ListeningPlayer', () => {
  const mockPassage: ListeningPassage = {
    id: 1,
    title: 'Test Passage',
    level: 'N5',
    audio_url: 'https://example.com/audio.mp3',
    duration_seconds: 120,
    difficulty_speed: 'slow',
    topic_category: 'Daily Life',
    created_at: '2024-01-01',
  };

  const defaultProps = {
    currentPassage: mockPassage,
    isPlaying: false,
    currentTime: 15,
    duration: 120,
    playbackSpeed: 1,
    onPlayPause: vi.fn(),
    onReplay: vi.fn(),
    onSeek: vi.fn(),
    onSpeedChange: vi.fn(),
    onContinue: vi.fn(),
    disabledContinue: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render passage title and badges', () => {
    render(<ListeningPlayer {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Test Passage' })).toBeInTheDocument();
    expect(screen.getByText('N5')).toBeInTheDocument();
    expect(screen.getByText('Daily Life')).toBeInTheDocument();
  });

  it('should render level badge without topic when topic_category is null', () => {
    render(
      <ListeningPlayer
        {...defaultProps}
        currentPassage={{ ...mockPassage, topic_category: null }}
      />
    );

    expect(screen.getByText('N5')).toBeInTheDocument();
    expect(screen.queryByText('Daily Life')).not.toBeInTheDocument();
  });

  it('should display formatted current and total time', () => {
    render(<ListeningPlayer {...defaultProps} />);

    expect(screen.getByText('0:15')).toBeInTheDocument();
    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('should show play button when not playing', () => {
    render(<ListeningPlayer {...defaultProps} isPlaying={false} />);

    const playButton = screen.getByTitle('Play');
    expect(playButton).toBeInTheDocument();
    expect(playButton).toHaveTextContent('▶');
  });

  it('should show pause button when playing', () => {
    render(<ListeningPlayer {...defaultProps} isPlaying={true} />);

    const pauseButton = screen.getByTitle('Pause');
    expect(pauseButton).toBeInTheDocument();
    expect(pauseButton).toHaveTextContent('⏸');
  });

  it('should call onPlayPause when play/pause button is clicked', () => {
    render(<ListeningPlayer {...defaultProps} />);

    fireEvent.click(screen.getByTitle('Play'));
    expect(defaultProps.onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('should call onReplay when replay button is clicked', () => {
    render(<ListeningPlayer {...defaultProps} />);

    fireEvent.click(screen.getByTitle('Replay'));
    expect(defaultProps.onReplay).toHaveBeenCalledTimes(1);
  });

  it('should render speed options and highlight active speed', () => {
    render(<ListeningPlayer {...defaultProps} playbackSpeed={1.25} />);

    const activeSpeed = screen.getByText('1.25x');
    expect(activeSpeed).toHaveClass('active');
    expect(screen.getByText('0.75x')).not.toHaveClass('active');
    expect(screen.getByText('1x')).not.toHaveClass('active');
  });

  it('should call onSpeedChange when a speed button is clicked', () => {
    render(<ListeningPlayer {...defaultProps} playbackSpeed={1} />);

    fireEvent.click(screen.getByText('0.75x'));
    expect(defaultProps.onSpeedChange).toHaveBeenCalledWith(0.75);

    fireEvent.click(screen.getByText('1.25x'));
    expect(defaultProps.onSpeedChange).toHaveBeenCalledWith(1.25);
  });

  it('should call onSeek when progress slider changes', () => {
    render(<ListeningPlayer {...defaultProps} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '45' } });

    expect(defaultProps.onSeek).toHaveBeenCalledTimes(1);
    const event = defaultProps.onSeek.mock.calls[0][0] as React.ChangeEvent<HTMLInputElement>;
    expect(event.target).toBe(slider);
  });

  it('should disable continue button when disabledContinue is true', () => {
    render(<ListeningPlayer {...defaultProps} disabledContinue={true} />);

    const continueButton = screen.getByRole('button', { name: /Continue to Questions/i });
    expect(continueButton).toBeDisabled();
  });

  it('should enable continue button when disabledContinue is false', () => {
    render(<ListeningPlayer {...defaultProps} disabledContinue={false} />);

    const continueButton = screen.getByRole('button', { name: /Continue to Questions/i });
    expect(continueButton).not.toBeDisabled();
  });

  it('should call onContinue when continue button is clicked', () => {
    render(<ListeningPlayer {...defaultProps} disabledContinue={false} />);

    fireEvent.click(screen.getByRole('button', { name: /Continue to Questions/i }));
    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1);
  });

  it('should apply level color to the level badge', () => {
    const { container } = render(<ListeningPlayer {...defaultProps} />);

    const badge = container.querySelector('.level-badge');
    expect(badge).toHaveStyle({ backgroundColor: '#4ade80' });
  });

  it('should handle zero duration without crashing', () => {
    render(<ListeningPlayer {...defaultProps} duration={0} />);

    expect(screen.getByText('0:00')).toBeInTheDocument();
  });
});
