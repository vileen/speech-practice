import express from 'express';
import { pool } from '../db/pool.js';

const router = express.Router();

// GET /api/speaking/templates - list conversation templates
router.get('/templates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, scenario, difficulty, created_at FROM conversation_templates ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/speaking/templates/:id - get specific template
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM conversation_templates WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// GET /api/speaking/shadowing - list shadowing exercises
router.get('/shadowing', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, audio_url, level, duration_seconds FROM shadowing_exercises ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shadowing exercises:', error);
    res.status(500).json({ error: 'Failed to fetch shadowing exercises' });
  }
});

// GET /api/speaking/shadowing/:id - get specific shadowing exercise
router.get('/shadowing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM shadowing_exercises WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shadowing exercise not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching shadowing exercise:', error);
    res.status(500).json({ error: 'Failed to fetch shadowing exercise' });
  }
});

// GET /api/speaking/response-drills - list response drills
router.get('/response-drills', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, cue_text, time_limit_seconds, difficulty, category FROM response_drills ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching response drills:', error);
    res.status(500).json({ error: 'Failed to fetch response drills' });
  }
});

// GET /api/speaking/response-drills/:id - get specific response drill
router.get('/response-drills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM response_drills WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Response drill not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching response drill:', error);
    res.status(500).json({ error: 'Failed to fetch response drill' });
  }
});

// POST /api/speaking/evaluate-response - basic evaluation
router.post('/evaluate-response', async (req, res) => {
  try {
    const { userResponse, suggestedResponse, drillId } = req.body;

    if (!userResponse || !suggestedResponse) {
      return res.status(400).json({ error: 'Missing userResponse or suggestedResponse' });
    }

    // Basic completion check - in production this could use AI
    const normalizedUser = userResponse.toLowerCase().trim();
    const normalizedSuggested = suggestedResponse.toLowerCase().trim();

    // Calculate simple similarity score
    const similarity = calculateSimilarity(normalizedUser, normalizedSuggested);
    
    let feedback: string;
    let score: number;

    if (similarity >= 0.8) {
      score = 100;
      feedback = 'Excellent! Your response matches the expected answer very well.';
    } else if (similarity >= 0.5) {
      score = 70;
      feedback = 'Good attempt! The meaning is close, but there are some differences.';
    } else {
      score = 40;
      feedback = 'Keep practicing! Try to match the suggested response more closely.';
    }

    res.json({
      score,
      feedback,
      similarity,
      userResponse,
      suggestedResponse
    });
  } catch (error) {
    console.error('Error evaluating response:', error);
    res.status(500).json({ error: 'Failed to evaluate response' });
  }
});

// Simple string similarity calculation (Levenshtein-based)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export default router;
