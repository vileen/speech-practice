import { Router } from 'express';
import { checkPassword } from '../middleware/auth.js';
import {
  getPassages,
  getPassageById,
  getPassageWithTranscript,
  getQuestionsByPassageId,
  submitAnswers,
  getListeningStats,
} from '../services/listening.js';

const router = Router();

// Get all listening passages (optionally filtered by level)
// Does NOT include transcript - that's hidden until after quiz
router.get('/passages', checkPassword, async (req, res) => {
  try {
    const { level } = req.query;
    const passages = await getPassages(level as string | undefined);

    res.json({
      count: passages.length,
      passages,
    });
  } catch (error) {
    console.error('Error fetching listening passages:', error);
    res.status(500).json({ error: 'Failed to fetch listening passages' });
  }
});

// Get specific passage (NO transcript - audio only)
router.get('/passages/:id', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const passageId = parseInt(id, 10);

    if (isNaN(passageId)) {
      return res.status(400).json({ error: 'Invalid passage ID' });
    }

    const passage = await getPassageById(passageId);

    if (!passage) {
      return res.status(404).json({ error: 'Passage not found' });
    }

    res.json({ passage });
  } catch (error) {
    console.error('Error fetching listening passage:', error);
    res.status(500).json({ error: 'Failed to fetch listening passage' });
  }
});

// Get audio URL for a passage
router.get('/passages/:id/audio', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const passageId = parseInt(id, 10);

    if (isNaN(passageId)) {
      return res.status(400).json({ error: 'Invalid passage ID' });
    }

    const passage = await getPassageById(passageId);

    if (!passage) {
      return res.status(404).json({ error: 'Passage not found' });
    }

    res.json({
      audioUrl: passage.audio_url,
      duration: passage.duration_seconds,
    });
  } catch (error) {
    console.error('Error fetching audio:', error);
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

// Get questions for a passage
router.get('/passages/:id/questions', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const passageId = parseInt(id, 10);

    if (isNaN(passageId)) {
      return res.status(400).json({ error: 'Invalid passage ID' });
    }

    const questions = await getQuestionsByPassageId(passageId);

    res.json({
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get transcript (only after quiz completion or for review)
router.get('/passages/:id/transcript', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const passageId = parseInt(id, 10);

    if (isNaN(passageId)) {
      return res.status(400).json({ error: 'Invalid passage ID' });
    }

    const passage = await getPassageWithTranscript(passageId);

    if (!passage) {
      return res.status(404).json({ error: 'Passage not found' });
    }

    res.json({
      transcript: passage.transcript,
      japaneseText: passage.japanese_text,
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// Submit answers and get score
router.post('/submit', checkPassword, async (req, res) => {
  try {
    const { passageId, answers, startTime, endTime } = req.body;

    if (!passageId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'passageId and answers array are required' });
    }

    const result = await submitAnswers(
      passageId,
      answers,
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined
    );

    res.json(result);
  } catch (error) {
    console.error('Error submitting listening answers:', error);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

// Get listening stats
router.get('/stats', checkPassword, async (_req, res) => {
  try {
    const stats = await getListeningStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching listening stats:', error);
    res.status(500).json({ error: 'Failed to fetch listening stats' });
  }
});

export default router;
