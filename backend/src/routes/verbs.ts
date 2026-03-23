import { Router } from 'express';
import { pool } from '../db/pool.js';
import { checkPassword } from '../middleware/auth.js';
import { conjugate, getAllConjugations, generateExercise, ConjugationType } from '../services/verbConjugation.js';

const router = Router();

// Get all verbs (optionally filtered by JLPT level or group)
router.get('/verbs', checkPassword, async (req, res) => {
  try {
    const { jlptLevel, group, commonOnly } = req.query;
    
    let query = 'SELECT * FROM verbs WHERE 1=1';
    const params: any[] = [];
    
    if (jlptLevel) {
      params.push(jlptLevel);
      query += ` AND jlpt_level = $${params.length}`;
    }
    
    if (group) {
      params.push(group);
      query += ` AND verb_group = $${params.length}`;
    }
    
    if (commonOnly === 'true') {
      query += ` AND is_common = true`;
    }
    
    query += ' ORDER BY jlpt_level, verb_group, dictionary_form';
    
    const result = await pool.query(query, params);
    
    res.json({
      count: result.rows.length,
      verbs: result.rows
    });
  } catch (error) {
    console.error('Error fetching verbs:', error);
    res.status(500).json({ error: 'Failed to fetch verbs' });
  }
});

// Get specific verb with all conjugations
router.get('/verbs/:id', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    
    const verbResult = await pool.query(
      'SELECT * FROM verbs WHERE id = $1',
      [id]
    );
    
    if (verbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Verb not found' });
    }
    
    const verb = verbResult.rows[0];
    const conjugations = getAllConjugations(verb);
    
    res.json({
      verb,
      conjugations
    });
  } catch (error) {
    console.error('Error fetching verb:', error);
    res.status(500).json({ error: 'Failed to fetch verb' });
  }
});

// Get conjugation for a specific verb
router.get('/verbs/:id/conjugate/:type', checkPassword, async (req, res) => {
  try {
    const { id, type } = req.params;
    
    const verbResult = await pool.query(
      'SELECT * FROM verbs WHERE id = $1',
      [id]
    );
    
    if (verbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Verb not found' });
    }
    
    const verb = verbResult.rows[0];
    const conjugated = conjugate(verb, type as ConjugationType);
    
    res.json({
      verb: verb.dictionary_form,
      type,
      result: conjugated
    });
  } catch (error) {
    console.error('Error conjugating verb:', error);
    res.status(500).json({ error: 'Failed to conjugate verb' });
  }
});

// Generate random conjugation exercise
router.get('/verbs/exercise/random', checkPassword, async (req, res) => {
  try {
    const { jlptLevel } = req.query;
    
    let query = 'SELECT * FROM verbs WHERE is_common = true';
    const params: any[] = [];
    
    if (jlptLevel) {
      params.push(jlptLevel);
      query += ` AND jlpt_level = $${params.length}`;
    }
    
    query += ' ORDER BY RANDOM() LIMIT 1';
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No verbs found' });
    }
    
    const exercise = generateExercise(result.rows[0]);
    
    res.json(exercise);
  } catch (error) {
    console.error('Error generating exercise:', error);
    res.status(500).json({ error: 'Failed to generate exercise' });
  }
});

// Get verbs due for review (SRS)
router.get('/verbs/review', checkPassword, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.*,
        COALESCE(vps.ease_factor, 2.5) as ease_factor,
        COALESCE(vps.interval_days, 1) as interval_days,
        COALESCE(vps.streak, 0) as streak,
        COALESCE(vps.total_attempts, 0) as total_attempts,
        COALESCE(vps.correct_attempts, 0) as correct_attempts
      FROM verbs v
      LEFT JOIN verb_practice_sessions vps ON v.id = vps.verb_id
      WHERE vps.next_review_at IS NULL OR vps.next_review_at <= NOW()
      ORDER BY 
        CASE WHEN vps.next_review_at IS NULL THEN 0 ELSE 1 END,
        vps.next_review_at NULLS FIRST,
        v.jlpt_level
      LIMIT 10
    `);
    
    res.json({
      count: result.rows.length,
      verbs: result.rows
    });
  } catch (error) {
    console.error('Error fetching review verbs:', error);
    res.status(500).json({ error: 'Failed to fetch review verbs' });
  }
});

// Submit practice result (for SRS tracking)
router.post('/verbs/:id/practice', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const { conjugation_type, correct, time_ms } = req.body;
    
    // Get current SRS state
    const currentResult = await pool.query(
      `SELECT * FROM verb_practice_sessions 
       WHERE verb_id = $1 AND conjugation_type = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [id, conjugation_type]
    );
    
    const current = currentResult.rows[0];
    const oldEase = current?.ease_factor || 2.5;
    const oldStreak = current?.streak || 0;
    
    // Simple FSRS-like calculation
    let newEase = oldEase;
    let newStreak = correct ? oldStreak + 1 : 0;
    let newInterval: number;
    
    if (correct) {
      newEase = Math.max(1.3, oldEase + 0.1);
      newInterval = oldStreak === 0 ? 1 : Math.ceil(oldStreak * oldEase);
    } else {
      newEase = Math.max(1.3, oldEase - 0.2);
      newInterval = 1;
    }
    
    // Cap interval at 365 days
    newInterval = Math.min(newInterval, 365);
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    
    // Insert practice session
    await pool.query(
      `INSERT INTO verb_practice_sessions 
       (verb_id, conjugation_type, attempts, correct, ease_factor, interval_days, next_review_at, streak)
       VALUES ($1, $2, 1, $3, $4, $5, $6, $7)`,
      [id, conjugation_type, correct ? 1 : 0, newEase, newInterval, nextReview, newStreak]
    );
    
    res.json({
      correct,
      newEase,
      newInterval,
      nextReview: nextReview.toISOString(),
      streak: newStreak
    });
  } catch (error) {
    console.error('Error recording practice:', error);
    res.status(500).json({ error: 'Failed to record practice' });
  }
});

export default router;
