import { Router } from 'express';
import { pool } from '../db/pool.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// GET /api/progress/overview - summary stats
router.get('/overview', checkPassword, async (req, res) => {
  try {
    // Total study time - estimate from grammar attempts (assuming 2 min per attempt)
    const studyTimeResult = await pool.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as week_attempts
      FROM grammar_attempts
    `);
    
    const totalAttempts = parseInt(studyTimeResult.rows[0].total_attempts) || 0;
    const weekAttempts = parseInt(studyTimeResult.rows[0].week_attempts) || 0;
    const studyTimeWeek = Math.round(weekAttempts * 2); // 2 min per attempt
    const studyTimeTotal = Math.round(totalAttempts * 2);
    
    // Current streak - consecutive days with activity
    const streakResult = await pool.query(`
      WITH daily_activity AS (
        SELECT DISTINCT DATE(created_at) as activity_date
        FROM grammar_attempts
        UNION
        SELECT DISTINCT DATE(created_at) as activity_date
        FROM user_kanji_progress
        WHERE total_attempts > 0
      ),
      streak_calc AS (
        SELECT 
          activity_date,
          activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date))::integer AS streak_group
        FROM daily_activity
      )
      SELECT COUNT(*) as streak
      FROM streak_calc
      WHERE streak_group = (
        SELECT streak_group 
        FROM streak_calc 
        WHERE activity_date = CURRENT_DATE 
        UNION 
        SELECT streak_group 
        FROM streak_calc 
        WHERE activity_date = CURRENT_DATE - 1
        ORDER BY streak_group DESC 
        LIMIT 1
      )
    `);
    
    // Grammar patterns mastered (accuracy >= 0.8 and at least 5 attempts)
    const grammarResult = await pool.query(`
      SELECT 
        COUNT(*) as total_patterns,
        COUNT(*) FILTER (
          WHERE total_attempts >= 5 
          AND (correct_attempts::float / NULLIF(total_attempts, 0)) >= 0.8
        ) as mastered_patterns
      FROM user_grammar_progress
    `);
    
    // Kanji learned (accuracy >= 0.8 and at least 3 attempts)
    const kanjiResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM kanji) as total_kanji,
        COUNT(*) as learned_kanji
      FROM user_kanji_progress
      WHERE total_attempts >= 3 
      AND (correct_attempts::float / NULLIF(total_attempts, 0)) >= 0.8
    `);
    
    // Lessons completed (lessons with associated grammar or kanji progress)
    const lessonsResult = await pool.query(`
      SELECT COUNT(DISTINCT l.id) as completed_lessons
      FROM lessons l
      WHERE EXISTS (
        SELECT 1 FROM grammar_patterns gp
        JOIN user_grammar_progress ugp ON gp.id = ugp.pattern_id
        WHERE gp.lesson_id = l.id AND ugp.total_attempts > 0
      ) OR EXISTS (
        SELECT 1 FROM kanji k
        JOIN user_kanji_progress ukp ON k.id = ukp.kanji_id
        WHERE k.lesson_id = l.id AND ukp.total_attempts > 0
      )
    `);
    
    const totalLessonsResult = await pool.query('SELECT COUNT(*) as total FROM lessons');
    
    res.json({
      studyTime: {
        thisWeek: studyTimeWeek,
        allTime: studyTimeTotal,
        unit: 'minutes'
      },
      streak: parseInt(streakResult.rows[0]?.streak) || 0,
      grammar: {
        mastered: parseInt(grammarResult.rows[0].mastered_patterns) || 0,
        total: parseInt(grammarResult.rows[0].total_patterns) || 0
      },
      kanji: {
        learned: parseInt(kanjiResult.rows[0].learned_kanji) || 0,
        total: parseInt(kanjiResult.rows[0].total_kanji) || 0
      },
      lessons: {
        completed: parseInt(lessonsResult.rows[0].completed_lessons) || 0,
        total: parseInt(totalLessonsResult.rows[0].total) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

// GET /api/progress/by-level - JLPT progress breakdown
router.get('/by-level', checkPassword, async (req, res) => {
  try {
    // Grammar patterns by JLPT level with progress
    const grammarByLevel = await pool.query(`
      SELECT 
        gp.jlpt_level,
        COUNT(*) as total_patterns,
        COUNT(ugp.pattern_id) as attempted_patterns,
        COUNT(*) FILTER (
          WHERE ugp.total_attempts >= 5 
          AND (ugp.correct_attempts::float / NULLIF(ugp.total_attempts, 0)) >= 0.8
        ) as mastered_patterns
      FROM grammar_patterns gp
      LEFT JOIN user_grammar_progress ugp ON gp.id = ugp.pattern_id
      WHERE gp.jlpt_level IN ('N5', 'N4', 'N3')
      GROUP BY gp.jlpt_level
      ORDER BY gp.jlpt_level DESC
    `);
    
    // Kanji by JLPT level with progress
    const kanjiByLevel = await pool.query(`
      SELECT 
        k.jlpt_level,
        COUNT(*) as total_kanji,
        COUNT(ukp.kanji_id) as attempted_kanji,
        COUNT(*) FILTER (
          WHERE ukp.total_attempts >= 3 
          AND (ukp.correct_attempts::float / NULLIF(ukp.total_attempts, 0)) >= 0.8
        ) as mastered_kanji
      FROM kanji k
      LEFT JOIN user_kanji_progress ukp ON k.id = ukp.kanji_id
      WHERE k.jlpt_level IN ('N5', 'N4', 'N3')
      GROUP BY k.jlpt_level
      ORDER BY k.jlpt_level DESC
    `);
    
    // Combine and calculate percentages
    const levels = ['N5', 'N4', 'N3'];
    const result = levels.map(level => {
      const grammar = grammarByLevel.rows.find(r => r.jlpt_level === level) || {
        total_patterns: 0, attempted_patterns: 0, mastered_patterns: 0
      };
      const kanji = kanjiByLevel.rows.find(r => r.jlpt_level === level) || {
        total_kanji: 0, attempted_kanji: 0, mastered_kanji: 0
      };
      
      const totalItems = parseInt(grammar.total_patterns) + parseInt(kanji.total_kanji);
      const masteredItems = parseInt(grammar.mastered_patterns) + parseInt(kanji.mastered_kanji);
      
      return {
        level,
        grammar: {
          total: parseInt(grammar.total_patterns),
          mastered: parseInt(grammar.mastered_patterns),
          percentage: parseInt(grammar.total_patterns) > 0 
            ? Math.round((parseInt(grammar.mastered_patterns) / parseInt(grammar.total_patterns)) * 100)
            : 0
        },
        kanji: {
          total: parseInt(kanji.total_kanji),
          mastered: parseInt(kanji.mastered_kanji),
          percentage: parseInt(kanji.total_kanji) > 0
            ? Math.round((parseInt(kanji.mastered_kanji) / parseInt(kanji.total_kanji)) * 100)
            : 0
        },
        overall: {
          total: totalItems,
          mastered: masteredItems,
          percentage: totalItems > 0 ? Math.round((masteredItems / totalItems) * 100) : 0
        }
      };
    });
    
    res.json({ levels: result });
  } catch (error) {
    console.error('Error fetching JLPT progress:', error);
    res.status(500).json({ error: 'Failed to fetch JLPT progress' });
  }
});

// GET /api/progress/weak-points - lowest accuracy items
router.get('/weak-points', checkPassword, async (req, res) => {
  try {
    // Categories with lowest accuracy
    const categoryAccuracy = await pool.query(`
      SELECT 
        gp.category,
        COUNT(*) as total_patterns,
        SUM(ugp.total_attempts) as total_attempts,
        SUM(ugp.correct_attempts) as correct_attempts,
        CASE 
          WHEN SUM(ugp.total_attempts) > 0 
          THEN ROUND((SUM(ugp.correct_attempts)::float / SUM(ugp.total_attempts)) * 100, 1)
          ELSE 0
        END as accuracy_percentage
      FROM grammar_patterns gp
      JOIN user_grammar_progress ugp ON gp.id = ugp.pattern_id
      WHERE ugp.total_attempts > 0
      GROUP BY gp.category
      ORDER BY accuracy_percentage ASC
      LIMIT 5
    `);
    
    // Specific patterns with lowest accuracy (minimum 3 attempts)
    const weakPatterns = await pool.query(`
      SELECT 
        gp.id,
        gp.pattern,
        gp.category,
        gp.jlpt_level,
        ugp.total_attempts,
        ugp.correct_attempts,
        ROUND((ugp.correct_attempts::float / ugp.total_attempts) * 100, 1) as accuracy_percentage
      FROM grammar_patterns gp
      JOIN user_grammar_progress ugp ON gp.id = ugp.pattern_id
      WHERE ugp.total_attempts >= 3
      ORDER BY (ugp.correct_attempts::float / ugp.total_attempts) ASC
      LIMIT 10
    `);
    
    // Most confused pattern pairs
    const confusedPairs = await pool.query(`
      SELECT 
        ga.pattern_id as pattern_id,
        gp1.pattern as pattern_name,
        gp1.category as pattern_category,
        ga.confused_with_id,
        gp2.pattern as confused_with_name,
        COUNT(*) as confusion_count
      FROM grammar_attempts ga
      JOIN grammar_patterns gp1 ON ga.pattern_id = gp1.id
      JOIN grammar_patterns gp2 ON ga.confused_with_id = gp2.id
      WHERE ga.confused_with_id IS NOT NULL
      GROUP BY ga.pattern_id, gp1.pattern, gp1.category, ga.confused_with_id, gp2.pattern
      ORDER BY confusion_count DESC
      LIMIT 5
    `);
    
    res.json({
      weakCategories: categoryAccuracy.rows.map(row => ({
        category: row.category,
        accuracy: parseFloat(row.accuracy_percentage),
        totalPatterns: parseInt(row.total_patterns),
        totalAttempts: parseInt(row.total_attempts)
      })),
      weakPatterns: weakPatterns.rows.map(row => ({
        id: row.id,
        pattern: row.pattern,
        category: row.category,
        jlptLevel: row.jlpt_level,
        accuracy: parseFloat(row.accuracy_percentage),
        attempts: parseInt(row.total_attempts),
        correct: parseInt(row.correct_attempts)
      })),
      confusedPairs: confusedPairs.rows.map(row => ({
        patternId: row.pattern_id,
        patternName: row.pattern_name,
        patternCategory: row.pattern_category,
        confusedWithId: row.confused_with_id,
        confusedWithName: row.confused_with_name,
        count: parseInt(row.confusion_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching weak points:', error);
    res.status(500).json({ error: 'Failed to fetch weak points' });
  }
});

// GET /api/progress/activity - last 7 days
router.get('/activity', checkPassword, async (req, res) => {
  try {
    const activityResult = await pool.query(`
      WITH date_range AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date as date
      )
      SELECT 
        dr.date,
        COALESCE(COUNT(ga.id), 0) as grammar_attempts,
        COALESCE(COUNT(ukp.id) FILTER (WHERE ukp.updated_at::date = dr.date), 0) as kanji_attempts,
        COALESCE(COUNT(ga.id), 0) + COALESCE(COUNT(ukp.id) FILTER (WHERE ukp.updated_at::date = dr.date), 0) as total_sessions
      FROM date_range dr
      LEFT JOIN grammar_attempts ga ON DATE(ga.created_at) = dr.date
      LEFT JOIN user_kanji_progress ukp ON ukp.updated_at::date = dr.date
      GROUP BY dr.date
      ORDER BY dr.date ASC
    `);
    
    res.json({
      activity: activityResult.rows.map(row => ({
        date: row.date,
        grammarAttempts: parseInt(row.grammar_attempts),
        kanjiAttempts: parseInt(row.kanji_attempts),
        totalSessions: parseInt(row.total_sessions)
      }))
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

// GET /api/progress/categories - category breakdown
router.get('/categories', checkPassword, async (req, res) => {
  try {
    const categoryResult = await pool.query(`
      SELECT 
        gp.category,
        COUNT(DISTINCT gp.id) as total_patterns,
        SUM(ugp.total_attempts) as total_attempts,
        SUM(ugp.correct_attempts) as correct_attempts,
        CASE 
          WHEN SUM(ugp.total_attempts) > 0 
          THEN ROUND((SUM(ugp.correct_attempts)::float / SUM(ugp.total_attempts)) * 100, 1)
          ELSE 0
        END as accuracy_percentage
      FROM grammar_patterns gp
      LEFT JOIN user_grammar_progress ugp ON gp.id = ugp.pattern_id
      GROUP BY gp.category
      ORDER BY total_attempts DESC
    `);
    
    res.json({
      categories: categoryResult.rows.map(row => ({
        category: row.category,
        totalPatterns: parseInt(row.total_patterns),
        totalAttempts: parseInt(row.total_attempts) || 0,
        accuracy: parseFloat(row.accuracy_percentage) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
});

export default router;
