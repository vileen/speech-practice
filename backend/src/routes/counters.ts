import { Router } from 'express';
import { pool } from '../db/pool.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// Get all counter groups (for CountersMode)
router.get('/groups', checkPassword, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        base_form,
        COUNT(*) as count,
        jsonb_agg(
          jsonb_build_object(
            'id', id,
            'pattern', pattern,
            'formation_rules', formation_rules,
            'examples', examples
          ) ORDER BY pattern
        ) as patterns,
        (SELECT formation_rules->0->>'counts' FROM grammar_patterns gp2 
         WHERE gp2.base_form = gp.base_form AND gp2.formation_rules->0->>'counts' IS NOT NULL 
         LIMIT 1) as counts,
        (SELECT formation_rules->0->>'usage' FROM grammar_patterns gp3 
         WHERE gp3.base_form = gp.base_form AND gp3.formation_rules->0->>'usage' IS NOT NULL 
         LIMIT 1) as description
      FROM grammar_patterns gp
      WHERE category = 'Counters' AND base_form IS NOT NULL
      GROUP BY base_form
      ORDER BY 
        CASE 
          WHEN base_form = '〜つ' THEN 1
          WHEN base_form = '〜人' THEN 2
          WHEN base_form = '〜本' THEN 3
          WHEN base_form = '〜個' THEN 4
          WHEN base_form = '〜枚' THEN 5
          WHEN base_form = '〜日' THEN 6
          ELSE 7
        END,
        base_form
    `);
    
    res.json({
      count: result.rows.length,
      groups: result.rows.map(row => ({
        baseForm: row.base_form,
        count: parseInt(row.count),
        patterns: row.patterns,
        counts: row.counts || 'Various',
        description: row.description || 'Counter for counting items'
      }))
    });
  } catch (error) {
    console.error('Error fetching counter groups:', error);
    res.status(500).json({ error: 'Failed to fetch counter groups' });
  }
});

// Get counter variants by base_form (e.g., all variants of 〜本)
router.get('/:baseForm/variants', checkPassword, async (req, res) => {
  try {
    const { baseForm } = req.params;
    
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
      WHERE gp.category = 'Counters' AND gp.base_form = $1
      ORDER BY gp.pattern
    `, [baseForm]);
    
    res.json({
      baseForm,
      count: result.rows.length,
      variants: result.rows
    });
  } catch (error) {
    console.error('Error fetching counter variants:', error);
    res.status(500).json({ error: 'Failed to fetch counter variants' });
  }
});

export default router;
