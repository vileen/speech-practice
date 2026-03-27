import express from 'express';
import multer from 'multer';
import { transcribeAudio, comparePronunciation, AssessmentResult } from '../services/speechAssessment.js';
import { pool } from '../db/pool.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimes = [
      'audio/webm',
      'audio/ogg',
      'audio/opus',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Expected audio file.`));
    }
  },
});

// POST /api/speech/assess - Assess pronunciation
router.post('/assess', upload.single('audio'), async (req, res) => {
  try {
    const { target_text, expected_romaji, user_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!target_text) {
      return res.status(400).json({ error: 'target_text is required' });
    }

    // Transcribe the audio
    const transcript = await transcribeAudio(req.file.buffer);

    // Compare with expected text
    const assessment = comparePronunciation(
      transcript,
      target_text,
      expected_romaji
    );

    // Save to database if user_id provided
    if (user_id) {
      await saveAssessment(user_id, assessment);
    }

    res.json(assessment);
  } catch (error) {
    console.error('Speech assessment error:', error);
    res.status(500).json({
      error: 'Failed to assess pronunciation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/speech/transcribe - Just transcribe audio (no comparison)
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const transcript = await transcribeAudio(req.file.buffer);

    res.json({
      transcript,
      language: 'ja',
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: 'Failed to transcribe audio',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/speech/assessments/:userId - Get user's assessment history
router.get('/assessments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await pool.query(
      `SELECT id, target_phrase, user_transcript, accuracy_score, feedback, created_at
       FROM speech_assessments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// GET /api/speech/assessments/:userId/stats - Get user's pronunciation stats
router.get('/assessments/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_attempts,
        AVG(accuracy_score) as average_score,
        MAX(accuracy_score) as best_score,
        COUNT(CASE WHEN accuracy_score >= 80 THEN 1 END) as excellent_count
       FROM speech_assessments
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Save assessment to database
 */
async function saveAssessment(userId: string, assessment: AssessmentResult): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO speech_assessments 
       (user_id, target_phrase, user_transcript, accuracy_score, feedback)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        assessment.expected,
        assessment.transcript,
        assessment.accuracyScore,
        JSON.stringify(assessment.feedback),
      ]
    );
  } catch (error) {
    console.error('Error saving assessment:', error);
    // Don't throw - assessment should still work even if saving fails
  }
}

export default router;
