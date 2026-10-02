import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ConversationMode } from '../../../components/SpeakingMode/ConversationMode';
import * as useConversationModeModule from '../../../components/SpeakingMode/hooks/useConversationMode';

vi.mock('../../../components/SpeakingMode/hooks/useConversationMode');

const mockStartConversation = vi.fn();
const mockHandleTurnComplete = vi.fn();
const mockPlayTurn = vi.fn();
const mockGoBack = vi.fn();

const mockTemplate = {
  id: 1,
  title: 'At the Restaurant',
  scenario: 'Ordering food',
  difficulty: 'Beginner',
  turns: [
    {
      speaker: 'A',
      japanese: 'いらっしゃいませ',
      romaji: 'irasshaimase',
      meaning: 'Welcome!',
    },
    {
      speaker: 'B',
      japanese: 'すみません、メニューをください',
      romaji: 'sumimasen, menyuu wo kudasai',
      meaning: 'Excuse me, please give me the menu',
    },
    {
      speaker: 'A',
      japanese: 'はい、どうぞ',
      romaji: 'hai, douzo',
      meaning: 'Yes, here you go',
    },
  ],
};

const mockTemplate2 = {
  id: 2,
  title: 'At the Station',
  scenario: 'Asking for directions',
  difficulty: 'Intermediate',
  turns: [
    {
      speaker: 'A',
      japanese: '駅はどこですか',
      romaji: 'eki wa doko desu ka',
      meaning: 'Where is the station?',
    },
  ],
};

type HookState = Partial<ReturnType<typeof useConversationModeModule.useConversationMode>>;

function mockHookState(overrides: HookState = {}) {
  vi.mocked(useConversationModeModule.useConversationMode).mockReturnValue({
    templates: [mockTemplate, mockTemplate2],
    selectedTemplate: null,
    userRole: '',
    currentTurnIndex: 0,
    loading: false,
    completedTurns: new Set<number>(),
    currentTurn: undefined,
    isUserTurn: false,
    isComplete: false,
    setSelectedTemplate: vi.fn(),
    startConversation: mockStartConversation,
    handleTurnComplete: mockHandleTurnComplete,
    playTurn: mockPlayTurn,
    goBack: mockGoBack,
    ...overrides,
  } as ReturnType<typeof useConversationModeModule.useConversationMode>);
}

describe('ConversationMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state while templates are being fetched', () => {
    mockHookState({ loading: true });

    render(<ConversationMode />);

    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
    expect(screen.queryByText('Conversation Practice')).not.toBeInTheDocument();
  });

  it('should render template selection screen with all templates', () => {
    mockHookState();

    render(<ConversationMode />);

    expect(screen.getByRole('heading', { name: 'Conversation Practice' })).toBeInTheDocument();
    expect(screen.getByText('Practice real conversations! Choose a scenario and role.')).toBeInTheDocument();

    expect(screen.getByText('At the Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Scenario: Ordering food')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('3 turns')).toBeInTheDocument();

    expect(screen.getByText('At the Station')).toBeInTheDocument();
    expect(screen.getByText('Scenario: Asking for directions')).toBeInTheDocument();
    expect(screen.getByText('1 turns')).toBeInTheDocument();
  });

  it('should call startConversation with template and Role A when Play Role A is clicked', () => {
    mockHookState();

    render(<ConversationMode />);

    const roleAButtons = screen.getAllByRole('button', { name: 'Play Role A' });
    fireEvent.click(roleAButtons[0]);

    expect(mockStartConversation).toHaveBeenCalledWith(mockTemplate, 'A');
  });

  it('should call startConversation with template and Role B when Play Role B is clicked', () => {
    mockHookState();

    render(<ConversationMode />);

    const roleBButtons = screen.getAllByRole('button', { name: 'Play Role B' });
    fireEvent.click(roleBButtons[1]);

    expect(mockStartConversation).toHaveBeenCalledWith(mockTemplate2, 'B');
  });

  it('should render conversation screen with template title and user role', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurn: mockTemplate.turns[0],
      isUserTurn: true,
    });

    render(<ConversationMode />);

    expect(screen.getByRole('button', { name: '← Back to Templates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'At the Restaurant' })).toBeInTheDocument();
    expect(screen.getByText('You are playing:')).toBeInTheDocument();
    // 'A' appears both in the user-role line and as a turn speaker — expect both
    expect(screen.getAllByText('A').length).toBeGreaterThanOrEqual(2);
  });

  it('should render past and current dialogue turns with speaker, japanese, romaji, and meaning', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurnIndex: 1,
      currentTurn: mockTemplate.turns[1],
      isUserTurn: false,
    });

    render(<ConversationMode />);

    // Past and current turns both appear in the dialogue container (the
    // current line is duplicated in the action panel, so scope to the dialogue)
    const dialogue = document.querySelector('.dialogue-container')!;

    // Past turn (index 0)
    expect(within(dialogue).getByText('いらっしゃいませ')).toBeInTheDocument();
    expect(within(dialogue).getByText('irasshaimase')).toBeInTheDocument();
    expect(within(dialogue).getByText('Welcome!')).toBeInTheDocument();

    // Current turn (index 1)
    expect(within(dialogue).getByText('すみません、メニューをください')).toBeInTheDocument();
    expect(within(dialogue).getByText('sumimasen, menyuu wo kudasai')).toBeInTheDocument();
    expect(within(dialogue).getByText('Excuse me, please give me the menu')).toBeInTheDocument();

    // Future turn (index 2) must not be rendered yet
    expect(within(dialogue).queryByText('はい、どうぞ')).not.toBeInTheDocument();
  });

  it('should show your-turn prompt and current line when it is the user turn', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurn: mockTemplate.turns[0],
      isUserTurn: true,
    });

    render(<ConversationMode />);

    expect(screen.getByText("🎤 It's your turn! Practice saying the line above.")).toBeInTheDocument();
    expect(screen.getByText('Your line:')).toBeInTheDocument();
    // The current line is shown in both the dialogue container and the action
    // panel, so assert on the count rather than a unique match
    expect(screen.getAllByText('いらっしゃいませ').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: '🔊 Hear It' })).toBeInTheDocument();
  });

  it('should call playTurn when Hear It is clicked on the user turn', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurn: mockTemplate.turns[0],
      isUserTurn: true,
    });

    render(<ConversationMode />);

    fireEvent.click(screen.getByRole('button', { name: '🔊 Hear It' }));

    expect(mockPlayTurn).toHaveBeenCalledWith(mockTemplate.turns[0]);
  });

  it('should call handleTurnComplete when I Said It is clicked on the user turn', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurn: mockTemplate.turns[0],
      isUserTurn: true,
    });

    render(<ConversationMode />);

    fireEvent.click(screen.getByRole('button', { name: '✓ I Said It' }));

    expect(mockHandleTurnComplete).toHaveBeenCalledTimes(1);
  });

  it('should show partner turn UI with Play Audio and Next buttons', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurnIndex: 1,
      currentTurn: mockTemplate.turns[1],
      isUserTurn: false,
    });

    render(<ConversationMode />);

    expect(screen.getByText('Partner says:')).toBeInTheDocument();
    // The current line is shown in both the dialogue container and the action
    // panel, so assert on the count rather than a unique match
    expect(screen.getAllByText('すみません、メニューをください').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: '🔊 Play Audio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next →' })).toBeInTheDocument();
  });

  it('should call playTurn and handleTurnComplete from the partner turn controls', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurnIndex: 1,
      currentTurn: mockTemplate.turns[1],
      isUserTurn: false,
    });

    render(<ConversationMode />);

    fireEvent.click(screen.getByRole('button', { name: '🔊 Play Audio' }));
    expect(mockPlayTurn).toHaveBeenCalledWith(mockTemplate.turns[1]);

    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(mockHandleTurnComplete).toHaveBeenCalledTimes(1);
  });

  it('should show completion message when conversation is complete', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurnIndex: 3,
      currentTurn: undefined,
      isUserTurn: false,
      isComplete: true,
    });

    render(<ConversationMode />);

    expect(screen.getByText('🎉 Conversation Complete!')).toBeInTheDocument();
    expect(screen.getByText('Great job practicing this conversation!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next →' })).not.toBeInTheDocument();
  });

  it('should call goBack when Back to Templates is clicked', () => {
    mockHookState({
      selectedTemplate: mockTemplate,
      userRole: 'A',
      currentTurn: mockTemplate.turns[0],
      isUserTurn: true,
    });

    render(<ConversationMode />);

    fireEvent.click(screen.getByRole('button', { name: '← Back to Templates' }));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
