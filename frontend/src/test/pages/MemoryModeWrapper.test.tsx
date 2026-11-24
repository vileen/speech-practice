import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryModeWrapper } from '../../pages/MemoryModeWrapper';
import { API_URL } from '../../config/api';
import type { Lesson } from '../../types/index';

// Mock AuthenticatedRoute as a pass-through wrapper
vi.mock('../../App', () => ({
  AuthenticatedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated-route">{children}</div>
  ),
}));

// Mock MemoryMode so we can assert on the lessons prop
vi.mock('../../components/MemoryMode', () => ({
  MemoryMode: ({ lessons }: { lessons: Lesson[] }) => (
    <div data-testid="memory-mode" data-lesson-count={lessons.length} />
  ),
}));

const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    date: '2026-11-01',
    title: 'Lesson 1',
    order: 1,
    topics: ['greetings'],
    vocabCount: 10,
    grammarCount: 3,
  },
  {
    id: 'lesson-2',
    date: '2026-11-02',
    title: 'Lesson 2',
    order: 2,
    topics: ['verbs'],
    vocabCount: 15,
    grammarCount: 5,
  },
];

function mockFetchResponse(ok: boolean, jsonData: unknown) {
  vi.mocked(fetch).mockResolvedValue({
    ok,
    json: async () => jsonData,
  } as Response);
}

describe('MemoryModeWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('test-password');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows a loading spinner while lessons are being fetched', () => {
    // Never-resolving fetch keeps the component in loading state
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}) as Promise<Response>);

    render(<MemoryModeWrapper />);

    expect(screen.getByTestId('authenticated-route')).toBeInTheDocument();
    expect(screen.queryByTestId('memory-mode')).not.toBeInTheDocument();
    expect(document.querySelector('.pi-spinner')).toBeInTheDocument();
  });

  it('fetches lessons from the memory endpoint with the auth password header', async () => {
    mockFetchResponse(true, { lessons: mockLessons });

    render(<MemoryModeWrapper />);

    await waitFor(() => expect(screen.getByTestId('memory-mode')).toBeInTheDocument());

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/lessons/memory`, {
      headers: { 'X-Password': 'test-password' },
    });
  });

  it('renders MemoryMode with the fetched lessons', async () => {
    mockFetchResponse(true, { lessons: mockLessons });

    render(<MemoryModeWrapper />);

    const memoryMode = await screen.findByTestId('memory-mode');
    expect(memoryMode).toHaveAttribute('data-lesson-count', '2');
  });

  it('supports a plain array response body (no lessons wrapper)', async () => {
    mockFetchResponse(true, mockLessons);

    render(<MemoryModeWrapper />);

    const memoryMode = await screen.findByTestId('memory-mode');
    expect(memoryMode).toHaveAttribute('data-lesson-count', '2');
  });

  it('renders MemoryMode with no lessons when the response is not ok', async () => {
    mockFetchResponse(false, {});

    render(<MemoryModeWrapper />);

    const memoryMode = await screen.findByTestId('memory-mode');
    expect(memoryMode).toHaveAttribute('data-lesson-count', '0');
  });

  it('renders MemoryMode with no lessons when the fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'));

    render(<MemoryModeWrapper />);

    const memoryMode = await screen.findByTestId('memory-mode');
    expect(memoryMode).toHaveAttribute('data-lesson-count', '0');
    expect(console.error).toHaveBeenCalled();
  });

  it('renders MemoryMode with no lessons when the payload is not an array', async () => {
    mockFetchResponse(true, { unexpected: 'shape' });

    render(<MemoryModeWrapper />);

    const memoryMode = await screen.findByTestId('memory-mode');
    expect(memoryMode).toHaveAttribute('data-lesson-count', '0');
  });

  it('fetches lessons exactly once on mount', async () => {
    mockFetchResponse(true, { lessons: mockLessons });

    render(<MemoryModeWrapper />);

    await screen.findByTestId('memory-mode');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
