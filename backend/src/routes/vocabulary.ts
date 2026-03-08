import { Router } from 'express';
import { pool } from '../db/pool.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// Get vocabulary for a lesson with info about other lessons where each word appears
router.get('/lessons/:id/vocabulary-with-sources', checkPassword, async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    // Get all vocabulary entries for this lesson from JSONB
    const result = await pool.query(`
      SELECT vocabulary
      FROM lessons
      WHERE id = $1
    `, [lessonId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const vocabulary = result.rows[0].vocabulary || [];
    
    // For each word, find other lessons where it appears
    const vocabWithSources = await Promise.all(
      vocabulary.map(async (word: any) => {
        const wordText = word.jp || word.word;
        if (!wordText) return { ...word, otherLessons: [] };
        
        // Find other lessons with this word
        const otherLessons = await pool.query(`
          SELECT DISTINCT l.id, l.title, l.date
          FROM lessons l
          WHERE l.id != $1
            AND l.vocabulary @> $2::jsonb
          ORDER BY l.date DESC
          LIMIT 5
        `, [lessonId, JSON.stringify([{ jp: wordText }])]);
        
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

export default router;
