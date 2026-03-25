import { Router } from 'express';
import { checkPassword } from '../middleware/auth.js';
import { pool } from '../db/pool.js';

const router = Router();

// GET /api/verbs/random - returns random verb with conjugations
router.get('/random', checkPassword, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM verbs WHERE is_common = true ORDER BY RANDOM() LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No verbs found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching random verb:', error);
    res.status(500).json({ error: 'Failed to fetch verb' });
  }
});

// GET /api/verbs/:id - returns specific verb
router.get('/:id', checkPassword, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM verbs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Verb not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching verb:', error);
    res.status(500).json({ error: 'Failed to fetch verb' });
  }
});

// POST /api/verbs/check - checks conjugation answer
router.post('/check', checkPassword, async (req, res) => {
  try {
    const { verbId, fromForm, toForm, userAnswer } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM verbs WHERE id = $1',
      [verbId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Verb not found' });
    }
    
    const verb = result.rows[0];
    const formMap: Record<string, string> = {
      'masu': verb.masu_form,
      'te': verb.te_form,
      'nai': verb.nai_form,
      'ta': verb.ta_form,
      'conditional': verb.conditional_form,
      'potential': verb.potential_form,
      'passive': verb.passive_form
    };
    
    const correctAnswer = formMap[toForm];
    const isCorrect = userAnswer === correctAnswer;
    
    res.json({
      correct: isCorrect,
      correctAnswer,
      userAnswer,
      verb: {
        dictionary_form: verb.dictionary_form,
        meaning: verb.meaning,
        verb_group: verb.verb_group
      }
    });
  } catch (error) {
    console.error('Error checking verb answer:', error);
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

export default router;
