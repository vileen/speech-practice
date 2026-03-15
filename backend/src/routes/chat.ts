import { Router } from 'express';
import { pool } from '../db/pool.js';
import { generateChatResponse } from '../services/chat.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

router.post('/', checkPassword, async (req, res) => {
  try {
    const { session_id, message } = req.body;
    
    // Get session info
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1',
      [session_id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get previous messages
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [session_id]
    );
    
    const messages = messagesResult.rows.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    
    // Add user message
    messages.push({ role: 'user', content: message });
    
    // Get lesson context if active (stored in session.lesson_context)
    const lessonContext = session.lesson_context;
    
    // Generate AI response
    const response = await generateChatResponse(messages, lessonContext || undefined);
    
    // Save messages to database
    await pool.query(
      'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
      [session_id, 'user', message]
    );
    
    await pool.query(
      'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
      [session_id, 'assistant', response.text]
    );
    
    // Return snake_case to match frontend expectations
    res.json({
      text: response.text,
      text_with_furigana: response.textWithFurigana,
      romaji: response.romaji,
      translation: response.translation,
    });
  } catch (error) {
    console.error('Error generating chat response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router;
