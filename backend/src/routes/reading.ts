import { Router } from 'express';
import { pool } from '../db/pool.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// Get all reading passages (optionally filtered by level)
router.get('/passages', checkPassword, async (req, res) => {
  try {
    const { level } = req.query;
    
    let query = 'SELECT id, title, level, topic, character_count, created_at FROM reading_passages';
    const params: any[] = [];
    
    if (level) {
      params.push(level);
      query += ` WHERE level = $${params.length}`;
    }
    
    query += ' ORDER BY level, created_at';
    
    const result = await pool.query(query, params);
    
    res.json({
      count: result.rows.length,
      passages: result.rows
    });
  } catch (error) {
    console.error('Error fetching reading passages:', error);
    res.status(500).json({ error: 'Failed to fetch reading passages' });
  }
});

// Get specific passage with questions
router.get('/passages/:id', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get passage
    const passageResult = await pool.query(
      'SELECT * FROM reading_passages WHERE id = $1',
      [id]
    );
    
    if (passageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Passage not found' });
    }
    
    // Get questions for this passage
    const questionsResult = await pool.query(
      'SELECT id, question, options, correct_answer, explanation, question_type FROM reading_questions WHERE passage_id = $1 ORDER BY id',
      [id]
    );
    
    res.json({
      passage: passageResult.rows[0],
      questions: questionsResult.rows
    });
  } catch (error) {
    console.error('Error fetching reading passage:', error);
    res.status(500).json({ error: 'Failed to fetch reading passage' });
  }
});

// Submit answers and get score
router.post('/submit', checkPassword, async (req, res) => {
  try {
    const { passageId, answers, startTime, endTime } = req.body;
    
    if (!passageId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'passageId and answers array are required' });
    }
    
    // Get correct answers
    const questionsResult = await pool.query(
      'SELECT id, correct_answer, explanation, question_type FROM reading_questions WHERE passage_id = $1 ORDER BY id',
      [passageId]
    );
    
    const questions = questionsResult.rows;
    
    // Calculate score
    let correctCount = 0;
    const results = answers.map((answer: { questionId: number; selectedOption: number }) => {
      const question = questions.find(q => q.id === answer.questionId);
      const isCorrect = question && question.correct_answer === answer.selectedOption;
      if (isCorrect) correctCount++;
      
      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        correctAnswer: question?.correct_answer,
        explanation: question?.explanation,
        questionType: question?.question_type
      };
    });
    
    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    // Calculate reading time in seconds
    const readingTimeSeconds = startTime && endTime 
      ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
      : null;
    
    // Calculate characters per minute
    const passageResult = await pool.query(
      'SELECT character_count FROM reading_passages WHERE id = $1',
      [passageId]
    );
    const characterCount = passageResult.rows[0]?.character_count || 0;
    const charsPerMinute = readingTimeSeconds && readingTimeSeconds > 0
      ? Math.round((characterCount / readingTimeSeconds) * 60)
      : null;
    
    res.json({
      score,
      correctCount,
      totalQuestions,
      results,
      readingTimeSeconds,
      charsPerMinute
    });
  } catch (error) {
    console.error('Error submitting reading answers:', error);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

// Get reading stats (optional - for tracking progress)
router.get('/stats', checkPassword, async (_req, res) => {
  try {
    // Count passages by level
    const levelStats = await pool.query(`
      SELECT level, COUNT(*) as count 
      FROM reading_passages 
      GROUP BY level 
      ORDER BY level
    `);
    
    // Total question count
    const questionStats = await pool.query(`
      SELECT COUNT(*) as total_questions 
      FROM reading_questions
    `);
    
    res.json({
      byLevel: levelStats.rows,
      totalQuestions: parseInt(questionStats.rows[0]?.total_questions || '0')
    });
  } catch (error) {
    console.error('Error fetching reading stats:', error);
    res.status(500).json({ error: 'Failed to fetch reading stats' });
  }
});

export default router;
