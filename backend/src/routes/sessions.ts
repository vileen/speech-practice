import { Router } from 'express';
import { pool } from '../db/pool.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// Create new session
router.post('/', checkPassword, async (req, res) => {
  try {
    const { language, voice_gender } = req.body;
    const result = await pool.query(
      'INSERT INTO sessions (language, voice_gender) VALUES ($1, $2) RETURNING *',
      [language, voice_gender]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// List all sessions
router.get('/', checkPassword, async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sessions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get session history
router.get('/:id', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sessionResult = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [id]
    );
    
    res.json({
      session: sessionResult.rows[0],
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

export default router;
