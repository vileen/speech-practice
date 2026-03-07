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
