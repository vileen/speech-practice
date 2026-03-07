import { Router } from 'express';
import multer from 'multer';
import { readFile } from 'fs/promises';
import { pool } from '../db/pool.js';
import { transcribeAudioDirect } from '../services/whisper.js';
import { checkPassword } from '../middleware/auth.js';
import { appConfig } from '../config/index.js';

const router = Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: appConfig.audio.storagePath,
  filename: (_req, _file, cb) => {
    const timestamp = Date.now();
    cb(null, `recording_${timestamp}.mp3`);
  },
});

const upload = multer({ storage });

router.post('/', checkPassword, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    const { session_id, target_language } = req.body;
    
    const result = await pool.query(
      'INSERT INTO user_recordings (session_id, audio_path, target_language) VALUES ($1, $2, $3) RETURNING *',
      [session_id, req.file.path, target_language]
    );
    
    // Transcribe audio
    let transcription = null;
    try {
      const audioBuffer = await readFile(req.file.path);
      const langCode = target_language === 'japanese' ? 'ja' : 'it';
      transcription = await transcribeAudioDirect(audioBuffer, langCode);
      
      await pool.query(
        'UPDATE user_recordings SET transcription = $1 WHERE id = $2',
        [transcription, result.rows[0].id]
      );
      
      console.log(`Transcribed: ${transcription}`);
    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
    }
    
    res.json({
      id: result.rows[0].id,
      filename: req.file.filename,
      path: req.file.path,
      transcription: transcription,
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({ error: 'Failed to upload recording' });
  }
});

export default router;
