import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLessonIndex,
  getLesson,
  getRecentLessons,
  upsertLesson,
  deleteLesson,
  getLessonContext,
  getLessonSystemPrompt,
  findLesson,
  getCachedFurigana,
  cacheFurigana,
} from '../../services/lessons.js';

// Mock the pool module
vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

// Mock romaji service
vi.mock('../../services/romaji.js', () => ({
  generateRomaji: vi.fn((text: string) => Promise.resolve(`romaji-${text}`)),
  generateFuriganaFromReading: vi.fn((jp: string, reading: string) => {
    if (!reading) return null;
    return `<ruby>${jp}<rt>${reading}</rt></ruby>`;
  }),
}));

import { pool } from '../../db/pool.js';
import { generateRomaji, generateFuriganaFromReading } from '../../services/romaji.js';

const mockQuery = vi.mocked(pool.query);
const mockGenerateRomaji = vi.mocked(generateRomaji);
const mockGenerateFuriganaFromReading = vi.mocked(generateFuriganaFromReading);

describe('lessons service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLessonIndex', () => {
    it('should return all lessons with counts', async () => {
      const mockRows = [
        { id: '2025-01-01', date: '2025-01-01', title: 'Lesson 1', order: 1, topics: ['greetings'], vocabcount: '5', grammarcount: '2' },
        { id: '2025-01-02', date: '2025-01-02', title: 'Lesson 2', order: 2, topics: ['numbers'], vocabcount: '8', grammarcount: '3' },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows } as any);

      const result = await getLessonIndex();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String)
      );
      expect(result.count).toBe(2);
      expect(result.lessons).toHaveLength(2);
      expect(result.lessons[0].title).toBe('Lesson 1');
      expect(result.lessons[0].vocabCount).toBe(5);
      expect(result.lessons[0].grammarCount).toBe(2);
    });

    it('should return empty index when no lessons', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getLessonIndex();

      expect(result.count).toBe(0);
      expect(result.lessons).toEqual([]);
    });
  });

  describe('getLesson', () => {
    it('should return lesson with enriched phrases', async () => {
      const mockRow = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test Lesson',
        order: 1,
        topics: ['greetings'],
        vocabulary: [
          { jp: '漢字', reading: 'かんじ', en: 'kanji', tags: ['n5'] },
        ],
        grammar: [
          {
            pattern: '〜です',
            explanation: 'Copula',
            examples: [{ jp: '私です', en: 'It is me' }],
          },
        ],
        practice_phrases: [
          { jp: 'こんにちは', en: 'Hello' },
        ],
      };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await getLesson('2025-01-01');

      expect(result).toBeDefined();
      expect(result!.id).toBe('2025-01-01');
      expect(result!.title).toBe('Test Lesson');
      expect(result!.phrases).toHaveLength(1);
      expect(result!.phrases![0].jp).toBe('こんにちは');
      expect(result!.phrases![0].romaji).toBe('romaji-こんにちは');
    });

    it('should return null when lesson not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getLesson('nonexistent');

      expect(result).toBeNull();
    });

    it('should convert string practice_phrases to objects with jp field', async () => {
      const mockRow = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test Lesson',
        order: 1,
        topics: [],
        vocabulary: [],
        grammar: [],
        practice_phrases: ['こんにちは', 'さようなら'],
      };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await getLesson('2025-01-01');

      expect(result).toBeDefined();
      expect(result!.phrases).toHaveLength(2);
      // String phrases should be converted to objects
      expect(typeof result!.phrases![0]).toBe('object');
      expect(result!.phrases![0].jp).toBe('こんにちは');
      expect(result!.phrases![1].jp).toBe('さようなら');
      expect(result!.phrases![0].en).toBe('');
    });

    it('should enrich vocabulary with furigana when includeFurigana is true', async () => {
      const mockRow = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test Lesson',
        order: 1,
        topics: [],
        vocabulary: [
          { jp: '漢字', reading: 'かんじ', en: 'kanji', tags: ['n5'] },
        ],
        grammar: [],
        practice_phrases: [],
      };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await getLesson('2025-01-01', true);

      expect(result).toBeDefined();
      expect(result!.vocabulary[0].furigana).toBe('<ruby>漢字<rt>かんじ</rt></ruby>');
      expect(mockGenerateFuriganaFromReading).toHaveBeenCalledWith('漢字', 'かんじ');
    });

    it('should batch fetch furigana for grammar examples', async () => {
      const mockRow = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test Lesson',
        order: 1,
        topics: [],
        vocabulary: [],
        grammar: [
          {
            pattern: '〜です',
            explanation: 'Copula',
            examples: [{ jp: '私です', en: 'It is me' }],
          },
        ],
        practice_phrases: [],
      };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockRow] } as any)
        .mockResolvedValueOnce({ rows: [{ original_text: '私です', furigana_html: '<ruby>私<rt>わたし</rt></ruby>です' }] } as any);

      const result = await getLesson('2025-01-01', true);

      expect(result).toBeDefined();
      expect(result!.grammar[0].examples[0].furigana).toBe('<ruby>私<rt>わたし</rt></ruby>です');
    });

    it('should handle empty practice_phrases', async () => {
      const mockRow = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test Lesson',
        order: 1,
        topics: [],
        vocabulary: [],
        grammar: [],
        practice_phrases: [],
      };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await getLesson('2025-01-01');

      expect(result!.phrases).toEqual([]);
      expect(result!.practice_phrases).toEqual([]);
    });
  });

  describe('getRecentLessons', () => {
    it('should return recent lessons with default count', async () => {
      const mockRows = [
        { id: '2025-01-03', date: '2025-01-03', title: 'Lesson 3', order: 3, topics: [], vocabulary: [], grammar: [], practice_phrases: [] },
        { id: '2025-01-02', date: '2025-01-02', title: 'Lesson 2', order: 2, topics: [], vocabulary: [], grammar: [], practice_phrases: [] },
        { id: '2025-01-01', date: '2025-01-01', title: 'Lesson 1', order: 1, topics: [], vocabulary: [], grammar: [], practice_phrases: [] },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows } as any);

      const result = await getRecentLessons();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $1'),
        [3]
      );
      expect(result).toHaveLength(3);
    });

    it('should return recent lessons with custom count', async () => {
      const mockRows = [
        { id: '2025-01-02', date: '2025-01-02', title: 'Lesson 2', order: 2, topics: [], vocabulary: [], grammar: [], practice_phrases: [] },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows } as any);

      const result = await getRecentLessons(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $1'),
        [1]
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('upsertLesson', () => {
    it('should insert or update lesson', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const lesson = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test Lesson',
        order: 1,
        topics: ['greetings'],
        vocabulary: [{ jp: 'こんにちは', reading: 'こんにちは', en: 'hello', tags: [] }],
        grammar: [],
        practice_phrases: [{ jp: 'こんにちは', en: 'Hello' }],
      };

      await upsertLesson(lesson);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO lessons'),
        [
          lesson.id,
          lesson.date,
          lesson.title,
          lesson.order,
          lesson.topics,
          JSON.stringify(lesson.vocabulary),
          JSON.stringify(lesson.grammar),
          lesson.practice_phrases,
        ]
      );
    });
  });

  describe('deleteLesson', () => {
    it('should delete lesson by id', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      await deleteLesson('2025-01-01');

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM lessons WHERE id = $1',
        ['2025-01-01']
      );
    });
  });

  describe('getLessonContext', () => {
    it('should generate context string with vocabulary and grammar', () => {
      const lesson = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Greetings',
        order: 1,
        topics: ['greetings'],
        vocabulary: [
          { jp: 'こんにちは', reading: 'こんにちは', en: 'hello', tags: [] },
        ],
        grammar: [{ pattern: '〜です', explanation: 'copula', examples: [] }],
        practice_phrases: [{ jp: 'こんにちは', en: 'Hello' }],
      };

      const result = getLessonContext(lesson);

      expect(result).toContain('Lesson: Greetings');
      expect(result).toContain('こんにちは');
      expect(result).toContain('〜です');
    });

    it('should limit vocabulary to 20 items', () => {
      const lesson = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test',
        order: 1,
        topics: [],
        vocabulary: Array.from({ length: 25 }, (_, i) => ({
          jp: `word${i}`,
          reading: `reading${i}`,
          en: `meaning${i}`,
          tags: [],
        })),
        grammar: [],
        practice_phrases: [],
      };

      const result = getLessonContext(lesson);

      expect(result).toContain('word0');
      expect(result).toContain('word19');
      expect(result).not.toContain('word20');
    });
  });

  describe('getLessonSystemPrompt', () => {
    it('should include lesson title and vocabulary', () => {
      const lesson = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Greetings',
        order: 1,
        topics: ['greetings'],
        vocabulary: [
          { jp: 'こんにちは', reading: 'こんにちは', en: 'hello', tags: [] },
        ],
        grammar: [{ pattern: '〜です', explanation: 'copula', examples: [] }],
        practice_phrases: [{ jp: 'こんにちは', en: 'Hello' }],
      };

      const result = getLessonSystemPrompt(lesson);

      expect(result).toContain('Greetings');
      expect(result).toContain('こんにちは');
      expect(result).toContain('〜です');
      expect(result).toContain('RELAXED MODE');
    });

    it('should include strict mode instructions when relaxed is false', () => {
      const lesson = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test',
        order: 1,
        topics: ['test'],
        vocabulary: [],
        grammar: [],
        practice_phrases: [],
      };

      const result = getLessonSystemPrompt(lesson, false);

      expect(result).toContain('STRICT MODE');
      expect(result).not.toContain('RELAXED MODE');
    });

    it('should include simple mode instructions when simpleMode is true', () => {
      const lesson = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test',
        order: 1,
        topics: ['test'],
        vocabulary: [],
        grammar: [],
        practice_phrases: [],
      };

      const result = getLessonSystemPrompt(lesson, true, true);

      expect(result).toContain('SIMPLE MODE');
      expect(result).toContain('JLPT N5/N4');
    });

    it('should use topics as starter when available', () => {
      const lesson = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test',
        order: 1,
        topics: ['shopping', 'food'],
        vocabulary: [],
        grammar: [],
        practice_phrases: [],
      };

      const result = getLessonSystemPrompt(lesson);

      expect(result).toContain('shopping, food');
    });

    it('should fallback to title for starter topics when no topics', () => {
      const lesson = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Custom Title',
        order: 1,
        topics: [],
        vocabulary: [],
        grammar: [],
        practice_phrases: [],
      };

      const result = getLessonSystemPrompt(lesson);

      expect(result).toContain('Custom Title');
    });
  });

  describe('findLesson', () => {
    it('should find lesson by exact id', async () => {
      const mockRow = {
        id: '2025-01-01',
        date: '2025-01-01',
        title: 'Test Lesson',
        order: 1,
        topics: [],
        vocabulary: [],
        grammar: [],
        practice_phrases: [],
      };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await findLesson('2025-01-01');

      expect(result).toBeDefined();
      expect(result!.id).toBe('2025-01-01');
    });

    it('should find lesson by partial id match', async () => {
      const mockRow = { id: '2025-01-01' };
      mockQuery
        .mockResolvedValueOnce({ rows: [] } as any) // exact match fails
        .mockResolvedValueOnce({ rows: [mockRow] } as any) // partial match succeeds
        .mockResolvedValueOnce({ rows: [{
          id: '2025-01-01',
          date: '2025-01-01',
          title: 'Found',
          order: 1,
          topics: [],
          vocabulary: [],
          grammar: [],
          practice_phrases: [],
        }] } as any);

      const result = await findLesson('01-01');

      expect(result).toBeDefined();
      expect(result!.id).toBe('2025-01-01');
    });

    it('should find lesson by title match', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] } as any) // exact match fails
        .mockResolvedValueOnce({ rows: [] } as any) // partial id fails
        .mockResolvedValueOnce({ rows: [{ id: '2025-01-01' }] } as any) // title match succeeds
        .mockResolvedValueOnce({ rows: [{
          id: '2025-01-01',
          date: '2025-01-01',
          title: 'Greetings Lesson',
          order: 1,
          topics: [],
          vocabulary: [],
          grammar: [],
          practice_phrases: [],
        }] } as any);

      const result = await findLesson('Greetings');

      expect(result).toBeDefined();
      expect(result!.title).toBe('Greetings Lesson');
    });

    it('should return null when no match found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] } as any)
        .mockResolvedValueOnce({ rows: [] } as any)
        .mockResolvedValueOnce({ rows: [] } as any);

      const result = await findLesson('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getCachedFurigana', () => {
    it('should return cached furigana', async () => {
      mockQuery.mockResolvedValue({ rows: [{ furigana_html: '<ruby>漢字<rt>かんじ</rt></ruby>' }] } as any);

      const result = await getCachedFurigana('漢字');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT furigana_html FROM furigana_cache WHERE original_text = $1',
        ['漢字']
      );
      expect(result).toBe('<ruby>漢字<rt>かんじ</rt></ruby>');
    });

    it('should return null when not cached', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getCachedFurigana('漢字');

      expect(result).toBeNull();
    });
  });

  describe('cacheFurigana', () => {
    it('should insert or update furigana cache', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      await cacheFurigana('漢字', '<ruby>漢字<rt>かんじ</rt></ruby>');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO furigana_cache'),
        ['漢字', '<ruby>漢字<rt>かんじ</rt></ruby>']
      );
    });
  });
});
