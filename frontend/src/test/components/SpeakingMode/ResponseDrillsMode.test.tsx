import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponseDrillsMode } from '../../../components/SpeakingMode/ResponseDrillsMode';
import * as useResponseDrillsModule from '../../../components/SpeakingMode/hooks/useResponseDrills';
import type { ResponseDrill } from '../../../components/SpeakingMode/hooks/useResponseDrills';

vi.mock('../../../components/SpeakingMode/hooks/useResponseDrills');
vi.mock('../../../components/VoiceRecorder/VoiceRecorder', () => ({
  VoiceRecorder: (props: {
    onRecordingComplete: (blob: Blob) => void;
    isListening: boolean;
    onStartListening: () => void;
    onStopListening: () => void;
    mode: string;
  }) => (
    <div data-testid="voice-recorder" data-mode={props.mode}>
      <button onClick={() => props.onRecordingComplete(new Blob(['audio']))}>
        Finish Recording
      </button>
    </div>
  ),
}));

const mockStartDrill = vi.fn();
const mockHandleRecordingComplete = vi.fn();
const mockGoBack = vi.fn();
const mockGetTimerClass = vi.fn(() => '');

const mockDrill: ResponseDrill = {
  id: 1,
  cue_text: 'Your friend asks if you want to go to the movies this weekend. How do you respond?',
  suggested_response: 'ええ、ぜひ行きたいです。何時に会いましょうか。',
  time_limit_seconds: 30,
  difficulty: 'Beginner',
  category: 'Invitations',
};

const mockDrill2: ResponseDrill = {
  id: 2,
  cue_text: 'A coworker asks you to cover their shift tomorrow but you already have plans.',
  suggested_response: 'すみません、明日は予定があります。また今度お願いします。',
  time_limit_seconds: 45,
  difficulty: 'Intermediate',
  category: 'Work',
};

type HookState = Partial<ReturnType<typeof useResponseDrillsModule.useResponseDrills>>;

function mockHookState(overrides: HookState = {}) {
  vi.mocked(useResponseDrillsModule.useResponseDrills).mockReturnValue({
    drills: [mockDrill, mockDrill2],
    currentDrill: null,
    loading: false,
    timeLeft: 0,
    isActive: false,
    evaluation: null,
    startDrill: mockStartDrill,
    handleRecordingComplete: mockHandleRecordingComplete,
    goBack: mockGoBack,
    getTimerClass: mockGetTimerClass,
    ...overrides,
  } as ReturnType<typeof useResponseDrillsModule.useResponseDrills>);
}

describe('ResponseDrillsMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTimerClass.mockReturnValue('');
  });

  it('should render loading state while drills are being fetched', () => {
    mockHookState({ loading: true });

    render(<ResponseDrillsMode />);

    expect(screen.getByText('Loading drills...')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Response Drills' })).not.toBeInTheDocument();
  });

  it('should render drill list with header and description when no drill is selected', () => {
    mockHookState();

    render(<ResponseDrillsMode />);

    expect(screen.getByRole('heading', { name: 'Response Drills' })).toBeInTheDocument();
    expect(
      screen.getByText(/Listen to the cue and respond quickly!/)
    ).toBeInTheDocument();
  });

  it('should render each drill with category, truncated cue, difficulty, and time limit', () => {
    mockHookState();

    render(<ResponseDrillsMode />);

    expect(screen.getByRole('heading', { name: 'Invitations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Work' })).toBeInTheDocument();
    expect(
      screen.getByText(`${mockDrill.cue_text.substring(0, 80)}...`)
    ).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('45s')).toBeInTheDocument();
  });

  it('should call startDrill with the clicked drill', () => {
    mockHookState();

    render(<ResponseDrillsMode />);

    fireEvent.click(screen.getByRole('heading', { name: 'Work' }));

    expect(mockStartDrill).toHaveBeenCalledWith(mockDrill2);
  });

  it('should render back button, scenario card, and suggested response when a drill is active', () => {
    mockHookState({ currentDrill: mockDrill });

    render(<ResponseDrillsMode />);

    expect(screen.getByRole('button', { name: '← Back to Drills' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scenario' })).toBeInTheDocument();
    expect(screen.getByText(mockDrill.cue_text)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Suggested Response' })).toBeInTheDocument();
    expect(screen.getByText(mockDrill.suggested_response)).toBeInTheDocument();
  });

  it('should not render the drill list once a drill is selected', () => {
    mockHookState({ currentDrill: mockDrill });

    render(<ResponseDrillsMode />);

    expect(screen.queryByRole('heading', { name: 'Response Drills' })).not.toBeInTheDocument();
  });

  it('should format the timer as mm:ss', () => {
    mockHookState({ currentDrill: mockDrill, timeLeft: 75 });

    render(<ResponseDrillsMode />);

    expect(screen.getByText('1:15')).toBeInTheDocument();
    expect(screen.getByText('seconds remaining')).toBeInTheDocument();
  });

  it('should pad single-digit seconds in the timer', () => {
    mockHookState({ currentDrill: mockDrill, timeLeft: 5 });

    render(<ResponseDrillsMode />);

    expect(screen.getByText('0:05')).toBeInTheDocument();
  });

  it('should apply the timer class returned by getTimerClass', () => {
    mockGetTimerClass.mockReturnValue('danger');
    mockHookState({ currentDrill: mockDrill, timeLeft: 5 });

    render(<ResponseDrillsMode />);

    expect(document.querySelector('.timer.danger')).not.toBeNull();
  });

  it('should render VoiceRecorder only while the drill is active', () => {
    const { rerender } = render(
      <HookWrapper overrides={{ currentDrill: mockDrill, isActive: true }} />
    );

    expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();

    rerender(<HookWrapper overrides={{ currentDrill: mockDrill, isActive: false }} />);

    expect(screen.queryByTestId('voice-recorder')).not.toBeInTheDocument();
  });

  it('should forward recording completion to handleRecordingComplete', () => {
    mockHookState({ currentDrill: mockDrill, isActive: true });

    render(<ResponseDrillsMode />);

    fireEvent.click(screen.getByRole('button', { name: 'Finish Recording' }));

    expect(mockHandleRecordingComplete).toHaveBeenCalledTimes(1);
  });

  it('should show excellent evaluation for scores >= 80', () => {
    mockHookState({
      currentDrill: mockDrill,
      isActive: false,
      evaluation: { score: 92, feedback: 'Natural and accurate response!' },
    });

    render(<ResponseDrillsMode />);

    expect(screen.getByRole('heading', { name: '🎉 Excellent!' })).toBeInTheDocument();
    expect(screen.getByText('Natural and accurate response!')).toBeInTheDocument();
    expect(document.querySelector('.evaluation-result.excellent')).not.toBeNull();
  });

  it('should show good evaluation for scores between 50 and 79', () => {
    mockHookState({
      currentDrill: mockDrill,
      isActive: false,
      evaluation: { score: 65, feedback: 'Mostly correct, some awkward phrasing.' },
    });

    render(<ResponseDrillsMode />);

    expect(screen.getByRole('heading', { name: '👍 Good!' })).toBeInTheDocument();
    expect(screen.getByText('Mostly correct, some awkward phrasing.')).toBeInTheDocument();
    expect(document.querySelector('.evaluation-result.good')).not.toBeNull();
  });

  it('should show needs-work evaluation for scores below 50', () => {
    mockHookState({
      currentDrill: mockDrill,
      isActive: false,
      evaluation: { score: 30, feedback: 'Try responding more naturally.' },
    });

    render(<ResponseDrillsMode />);

    expect(screen.getByRole('heading', { name: '💪 Keep Practicing!' })).toBeInTheDocument();
    expect(screen.getByText('Try responding more naturally.')).toBeInTheDocument();
    expect(document.querySelector('.evaluation-result.needs-work')).not.toBeNull();
  });

  it('should not render evaluation block when evaluation is null', () => {
    mockHookState({ currentDrill: mockDrill, isActive: true, evaluation: null });

    render(<ResponseDrillsMode />);

    expect(document.querySelector('.evaluation-result')).toBeNull();
  });

  it('should call goBack when Back to Drills is clicked', () => {
    mockHookState({ currentDrill: mockDrill });

    render(<ResponseDrillsMode />);

    fireEvent.click(screen.getByRole('button', { name: '← Back to Drills' }));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});

/** Helper that renders ResponseDrillsMode with a specific mocked hook state. */
function HookWrapper({ overrides }: { overrides: HookState }) {
  mockHookState(overrides);
  return <ResponseDrillsMode />;
}
