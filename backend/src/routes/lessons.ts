import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getLessonIndex, getRecentLessons, getLesson, getLessonSystemPrompt } from '../services/lessons.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// List all lessons
router.get('/', checkPassword, async (_req, res) => {
  try {
    const index = await getLessonIndex();
    res.json(index);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get recent lessons
router.get('/recent', checkPassword, async (req, res) => {
  try {
    const count = parseInt(req.query.count as string) || 3;
    const lessons = await getRecentLessons(count);
    res.json({ lessons });
  } catch (error) {
    console.error('Error fetching recent lessons:', error);
    res.status(500).json({ error: 'Failed to fetch recent lessons' });
  }
});

// Get lessons for Memory Mode
router.get('/memory', checkPassword, async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, date, title, order_num as order, topics, vocabulary, grammar FROM lessons ORDER BY order_num DESC'
    );
    
    const lessons = result.rows.map(row => ({
      id: row.id,
      date: row.date,
      title: row.title,
      order: row.order,
      topics: row.topics || [],
      vocabulary: row.vocabulary || [],
      grammar: row.grammar || []
    }));
    
    res.json({ count: lessons.length, lessons });
  } catch (error) {
    console.error('Error fetching lessons for memory mode:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get specific lesson

// Get vocabulary with sources for a lesson
router.get('/:id/vocabulary-with-sources', checkPassword, async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    const result = await pool.query(`
      SELECT vocabulary
      FROM lessons
      WHERE id = $1
    `, [lessonId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const vocabulary = result.rows[0].vocabulary || [];
    
    const vocabWithSources = await Promise.all(
      vocabulary.map(async (word: any) => {
        const wordText = word.jp || word.word;
        if (!wordText) return { ...word, otherLessons: [] };
        
        const otherLessons = await pool.query(`
          SELECT DISTINCT l.id, l.title, l.date, l.order_num as order
          FROM lessons l
          WHERE l.id != $1
            AND EXISTS (
              SELECT 1 FROM jsonb_array_elements(l.vocabulary) AS v
              WHERE v->>'jp' = $2 OR v->>'word' = $2
            )
          ORDER BY l.date DESC
          LIMIT 5
        `, [lessonId, wordText]);
        
        return {
          ...word,
          otherLessons: otherLessons.rows
        };
      })
    );
    
    res.json({
      lessonId,
      vocabulary: vocabWithSources
    });
  } catch (error) {
    console.error('Error fetching vocabulary with sources:', error);
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
});

router.get('/:id', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const includeFurigana = req.query.furigana === 'true';
    const lesson = await getLesson(id, includeFurigana);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Start lesson conversation
router.post('/:id/start', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const { relaxed = true, session_id, simpleMode = false } = req.body;
    
    const lesson = await getLesson(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const systemPrompt = getLessonSystemPrompt(lesson, relaxed, simpleMode);
    
    if (session_id) {
      await pool.query(
        `UPDATE sessions 
         SET lesson_context = $1, lesson_id = $2 
         WHERE id = $3`,
        [systemPrompt, lesson.id, session_id]
      );
    }
    
    res.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        date: lesson.date,
        topics: lesson.topics,
      },
      system_prompt: systemPrompt,
      vocabulary_count: lesson.vocabulary.length,
      grammar_count: lesson.grammar.length,
    });
  } catch (error) {
    console.error('Error starting lesson:', error);
    res.status(500).json({ error: 'Failed to start lesson' });
  }
});

export default router;
