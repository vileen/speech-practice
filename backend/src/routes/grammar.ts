import { Router } from 'express';
import { pool } from '../db/pool.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// Get all grammar patterns (optionally filtered by category or JLPT level)
router.get('/patterns', checkPassword, async (req, res) => {
  try {
    const { category, jlptLevel, limit = '50' } = req.query;
    
    let query = 'SELECT * FROM grammar_patterns WHERE 1=1';
    const params: any[] = [];
    
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    
    if (jlptLevel) {
      params.push(jlptLevel);
      query += ` AND jlpt_level = $${params.length}`;
    }
    
    query += ' ORDER BY jlpt_level, category, id LIMIT $' + (params.length + 1);
    params.push(parseInt(limit as string));
    
    const result = await pool.query(query, params);
    
    res.json({
      count: result.rows.length,
      patterns: result.rows
    });
  } catch (error) {
    console.error('Error fetching grammar patterns:', error);
    res.status(500).json({ error: 'Failed to fetch grammar patterns' });
  }
});

// Get specific pattern with exercises
router.get('/patterns/:id', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    
    const patternResult = await pool.query(
      'SELECT * FROM grammar_patterns WHERE id = $1',
      [id]
    );
    
    if (patternResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pattern not found' });
    }
    
    const exercisesResult = await pool.query(
      'SELECT * FROM grammar_exercises WHERE pattern_id = $1 ORDER BY difficulty, id',
      [id]
    );
    
    const progressResult = await pool.query(
      `SELECT * FROM user_grammar_progress WHERE pattern_id = $1`,
      [id]
    );
    
    res.json({
      pattern: patternResult.rows[0],
      exercises: exercisesResult.rows,
      progress: progressResult.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching grammar pattern:', error);
    res.status(500).json({ error: 'Failed to fetch grammar pattern' });
  }
});

// Get patterns due for review (SRS)
router.get('/review', checkPassword, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        gp.*,
        COALESCE(ugp.ease_factor, 2.5) as ease_factor,
        COALESCE(ugp.interval_days, 1) as interval_days,
        COALESCE(ugp.streak, 0) as streak,
        COALESCE(ugp.total_attempts, 0) as total_attempts,
        COALESCE(ugp.correct_attempts, 0) as correct_attempts
      FROM grammar_patterns gp
      LEFT JOIN user_grammar_progress ugp ON gp.id = ugp.pattern_id
      WHERE ugp.next_review_at IS NULL OR ugp.next_review_at <= NOW()
      ORDER BY 
        CASE WHEN ugp.next_review_at IS NULL THEN 0 ELSE 1 END,
        ugp.next_review_at NULLS FIRST,
        gp.jlpt_level,
        gp.id
      LIMIT 10
    `);
    
    res.json({
      count: result.rows.length,
      patterns: result.rows
    });
  } catch (error) {
    console.error('Error fetching review patterns:', error);
    res.status(500).json({ error: 'Failed to fetch review patterns' });
  }
});

// Get random exercise for a pattern
router.get('/patterns/:id/exercise', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    
    let query = 'SELECT * FROM grammar_exercises WHERE pattern_id = $1';
    const params: any[] = [id];
    
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    
    query += ' ORDER BY RANDOM() LIMIT 1';
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No exercises found for this pattern' });
    }
    
    res.json({ exercise: result.rows[0] });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// Submit attempt and update progress
router.post('/progress', checkPassword, async (req, res) => {
  try {
    const { patternId, result, errorType, userSentence, exerciseId } = req.body;
    
    // Record attempt
    await pool.query(
      `INSERT INTO grammar_attempts (pattern_id, exercise_id, user_sentence, result, error_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [patternId, exerciseId || null, userSentence, result, errorType || null]
    );
    
    // Update progress with FSRS
    const progress = await updateProgress(patternId, result);
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get user stats
router.get('/stats', checkPassword, async (_req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT pattern_id) as total_patterns,
        SUM(total_attempts) as total_attempts,
        SUM(correct_attempts) as correct_attempts,
        AVG(CASE WHEN total_attempts > 0 
          THEN (correct_attempts::FLOAT / total_attempts) 
          ELSE 0 END) as accuracy,
        COUNT(CASE WHEN next_review_at <= NOW() THEN 1 END) as due_for_review
      FROM user_grammar_progress
    `);
    
    const categoryStats = await pool.query(`
      SELECT 
        gp.category,
        COUNT(*) as pattern_count,
        AVG(CASE WHEN ugp.total_attempts > 0 
          THEN (ugp.correct_attempts::FLOAT / ugp.total_attempts) 
          ELSE 0 END) as avg_accuracy
      FROM grammar_patterns gp
      LEFT JOIN user_grammar_progress ugp ON gp.id = ugp.pattern_id
      GROUP BY gp.category
      ORDER BY pattern_count DESC
    `);
    
    res.json({
      overall: statsResult.rows[0],
      byCategory: categoryStats.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Helper function to update progress using simplified FSRS
async function updateProgress(patternId: number, result: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current progress
    const progressResult = await client.query(
      `SELECT * FROM user_grammar_progress WHERE pattern_id = $1`,
      [patternId]
    );
    
    let progress = progressResult.rows[0];
    
    if (!progress) {
      // Create new progress entry
      const newResult = await client.query(
        `INSERT INTO user_grammar_progress (pattern_id, ease_factor, interval_days, next_review_at, total_attempts, correct_attempts, streak)
         VALUES ($1, 2.5, 1, NOW() + INTERVAL '1 day', 0, 0, 0)
         RETURNING *`,
        [patternId]
      );
      progress = newResult.rows[0];
    }
    
    // Calculate new values based on FSRS-like algorithm
    let easeFactor = progress.ease_factor;
    let intervalDays = progress.interval_days;
    let streak = progress.streak;
    let correctAttempts = progress.correct_attempts;
    
    if (result === 'correct') {
      streak++;
      correctAttempts++;
      easeFactor = Math.min(3.0, easeFactor + 0.1);
      if (intervalDays === 1) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
    } else if (result === 'partial') {
      streak = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      intervalDays = 1;
    } else {
      streak = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      intervalDays = 1;
    }
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);
    
    const updatedResult = await client.query(
      `UPDATE user_grammar_progress 
       SET ease_factor = $1,
           interval_days = $2,
           next_review_at = $3,
           total_attempts = total_attempts + 1,
           correct_attempts = $4,
           streak = $5,
           updated_at = NOW()
       WHERE pattern_id = $6
       RETURNING *`,
      [easeFactor, intervalDays, nextReview, correctAttempts, streak, patternId]
    );
    
    await client.query('COMMIT');
    
    return updatedResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default router;
