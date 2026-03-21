import { Router } from 'express';
import { pool } from '../db/pool.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// Get all grammar patterns (optionally filtered by category or JLPT level)
router.get('/patterns', checkPassword, async (req, res) => {
  try {
    const { category, jlptLevel } = req.query;
    
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
    
    query += ' ORDER BY jlpt_level, category, id';
    
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
    const { patternId, result, errorType, userSentence, exerciseId, confusedWithPatternId } = req.body;
    
    // Record attempt
    await pool.query(
      `INSERT INTO grammar_attempts (pattern_id, exercise_id, user_sentence, result, error_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [patternId, exerciseId || null, userSentence, result, errorType || null]
    );
    
    // Update progress with FSRS
    const progress = await updateProgress(patternId, result);
    
    // If confusion was detected, log it
    if (confusedWithPatternId && result === 'wrong') {
      await pool.query(
        `INSERT INTO grammar_confusion_events (pattern_id, confused_with_pattern_id, user_sentence)
         VALUES ($1, $2, $3)`,
        [patternId, confusedWithPatternId, userSentence || null]
      );
      
      // Update confusion_pairs in user_grammar_progress
      await pool.query(
        `UPDATE user_grammar_progress 
         SET confusion_pairs = COALESCE(
           (SELECT jsonb_agg(DISTINCT elem) FROM jsonb_array_elements(confusion_pairs || jsonb_build_array($2::int)) AS elem),
           jsonb_build_array($2::int)
         )
         WHERE pattern_id = $1`,
        [patternId, confusedWithPatternId]
      );
    }
    
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

// Get related patterns for comparison
router.get('/patterns/:id/related', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the pattern's related pattern IDs
    const patternResult = await pool.query(
      'SELECT related_patterns FROM grammar_patterns WHERE id = $1',
      [id]
    );
    
    if (patternResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pattern not found' });
    }
    
    const relatedIds = patternResult.rows[0].related_patterns || [];
    
    if (relatedIds.length === 0) {
      return res.json({ patterns: [] });
    }
    
    // Fetch the related patterns
    const relatedResult = await pool.query(
      'SELECT * FROM grammar_patterns WHERE id = ANY($1) ORDER BY category, id',
      [relatedIds]
    );
    
    res.json({ patterns: relatedResult.rows });
  } catch (error) {
    console.error('Error fetching related patterns:', error);
    res.status(500).json({ error: 'Failed to fetch related patterns' });
  }
});

// Log confusion event
router.post('/confusion', checkPassword, async (req, res) => {
  try {
    const { patternId, confusedWithPatternId, userSentence } = req.body;
    
    // Validate required fields
    if (!patternId || !confusedWithPatternId) {
      return res.status(400).json({ error: 'patternId and confusedWithPatternId are required' });
    }
    
    // Insert confusion event
    const result = await pool.query(
      `INSERT INTO grammar_confusion_events (pattern_id, confused_with_pattern_id, user_sentence)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [patternId, confusedWithPatternId, userSentence || null]
    );
    
    // Update confusion_pairs in user_grammar_progress
    await pool.query(
      `UPDATE user_grammar_progress 
       SET confusion_pairs = COALESCE(
         (SELECT jsonb_agg(DISTINCT elem) FROM jsonb_array_elements(confusion_pairs || jsonb_build_array($2::int)) AS elem),
         jsonb_build_array($2::int)
       )
       WHERE pattern_id = $1`,
      [patternId, confusedWithPatternId]
    );
    
    res.json({ success: true, event: result.rows[0] });
  } catch (error) {
    console.error('Error logging confusion:', error);
    res.status(500).json({ error: 'Failed to log confusion event' });
  }
});

// Get user's confusion stats
router.get('/confusion-stats', checkPassword, async (_req, res) => {
  try {
    // Get confusion events with pattern details
    const eventsResult = await pool.query(`
      SELECT 
        ce.*,
        p1.pattern as pattern_name,
        p2.pattern as confused_with_pattern_name
      FROM grammar_confusion_events ce
      JOIN grammar_patterns p1 ON ce.pattern_id = p1.id
      JOIN grammar_patterns p2 ON ce.confused_with_pattern_id = p2.id
      ORDER BY ce.created_at DESC
      LIMIT 50
    `);
    
    // Get confusion pair counts
    const pairsResult = await pool.query(`
      SELECT 
        p1.pattern as pattern_name,
        p2.pattern as confused_with_pattern_name,
        COUNT(*) as count
      FROM grammar_confusion_events ce
      JOIN grammar_patterns p1 ON ce.pattern_id = p1.id
      JOIN grammar_patterns p2 ON ce.confused_with_pattern_id = p2.id
      GROUP BY p1.pattern, p2.pattern
      ORDER BY count DESC
      LIMIT 10
    `);
    
    res.json({
      recentEvents: eventsResult.rows,
      topConfusions: pairsResult.rows
    });
  } catch (error) {
    console.error('Error fetching confusion stats:', error);
    res.status(500).json({ error: 'Failed to fetch confusion stats' });
  }
});

// Check if user answer matches a related pattern (confusion detection)
router.post('/check-confusion', checkPassword, async (req, res) => {
  try {
    const { patternId, userSentence } = req.body;
    
    if (!patternId || !userSentence) {
      return res.status(400).json({ error: 'patternId and userSentence are required' });
    }
    
    // Get related patterns
    const patternResult = await pool.query(
      'SELECT related_patterns FROM grammar_patterns WHERE id = $1',
      [patternId]
    );
    
    if (patternResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pattern not found' });
    }
    
    const relatedIds = patternResult.rows[0].related_patterns || [];
    
    if (relatedIds.length === 0) {
      return res.json({ confusedWith: null });
    }
    
    // Get patterns the user might have confused with
    const relatedPatterns = await pool.query(
      'SELECT id, pattern, category FROM grammar_patterns WHERE id = ANY($1)',
      [relatedIds]
    );
    
    // Simple heuristic: check if user's answer contains key markers of related patterns
    const confusedWith = relatedPatterns.rows.find(p => {
      const patternText = p.pattern.toLowerCase();
      const userText = userSentence.toLowerCase();
      
      // Extract key markers from pattern (e.g., 〜てもいいです -> てもいい)
      const markers = extractPatternMarkers(patternText);
      
      // Check if user's answer contains these markers
      return markers.some(marker => userText.includes(marker));
    });
    
    res.json({ 
      confusedWith: confusedWith ? {
        id: confusedWith.id,
        pattern: confusedWith.pattern,
        category: confusedWith.category
      } : null
    });
  } catch (error) {
    console.error('Error checking confusion:', error);
    res.status(500).json({ error: 'Failed to check confusion' });
  }
});

// Get mixed review patterns (shuffled from similar categories)
router.get('/mixed-review', checkPassword, async (req, res) => {
  try {
    const { categories, limit = 10 } = req.query;
    
    let categoryList: string[] = [];
    if (categories) {
      categoryList = (categories as string).split(',');
    }
    
    // Build query
    let query = `
      SELECT 
        gp.*,
        COALESCE(ugp.ease_factor, 2.5) as ease_factor,
        COALESCE(ugp.interval_days, 1) as interval_days,
        COALESCE(ugp.streak, 0) as streak,
        COALESCE(ugp.total_attempts, 0) as total_attempts,
        COALESCE(ugp.correct_attempts, 0) as correct_attempts,
        COALESCE(ugp.confusion_pairs, '[]'::jsonb) as confusion_pairs
      FROM grammar_patterns gp
      LEFT JOIN user_grammar_progress ugp ON gp.id = ugp.pattern_id
    `;
    
    const params: any[] = [];
    
    if (categoryList.length > 0) {
      params.push(categoryList);
      query += ` WHERE gp.category = ANY($${params.length})`;
    }
    
    query += ` ORDER BY RANDOM() LIMIT $${params.length + 1}`;
    params.push(parseInt(limit as string) || 10);
    
    const result = await pool.query(query, params);
    
    res.json({
      count: result.rows.length,
      patterns: result.rows
    });
  } catch (error) {
    console.error('Error fetching mixed review:', error);
    res.status(500).json({ error: 'Failed to fetch mixed review patterns' });
  }
});

// Helper function to extract pattern markers for confusion detection
function extractPatternMarkers(pattern: string): string[] {
  const markers: string[] = [];
  
  // Common pattern markers
  const commonPatterns: Record<string, string[]> = {
    'てもいい': ['てもいい', 'てもいいです'],
    'てはいけません': ['てはいけ', 'てはいけません', 'てはいけない'],
    'なければなりません': ['なければ', 'なければなりません', 'なきゃ', 'ないと'],
    'なくてもいい': ['なくてもいい', 'なくてもいいです'],
    'は': ['は'],
    'が': ['が'],
    'に': ['に'],
    'で': ['で'],
    'くない': ['くない'],
    'ではありません': ['ではありません', 'じゃありません', 'ではない'],
  };
  
  for (const [key, values] of Object.entries(commonPatterns)) {
    if (pattern.includes(key)) {
      markers.push(...values);
    }
  }
  
  return markers;
}

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
