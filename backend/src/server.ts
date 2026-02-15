import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pg from 'pg';
import { generateSpeech } from './services/elevenlabs.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const PASSWORD = process.env.ACCESS_PASSWORD || 'default123';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://vileen.github.io'],
  credentials: true,
}));
app.use(express.json());

// Database
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Ensure audio storage directory exists
const audioStoragePath = process.env.AUDIO_STORAGE_PATH || './audio_recordings';
if (!existsSync(audioStoragePath)) {
  mkdirSync(audioStoragePath, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: audioStoragePath,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `recording_${timestamp}.mp3`);
  },
});
const upload = multer({ storage });

// Auth middleware
const checkPassword = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const providedPassword = req.headers['x-password'] || req.body.password;
  if (providedPassword !== PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create new session
app.post('/api/sessions', checkPassword, async (req, res) => {
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

// Generate TTS
app.post('/api/tts', checkPassword, async (req, res) => {
  try {
    const { text, language, gender } = req.body;
    const audioBuffer = await generateSpeech({ text, language, gender });
    
    const filename = `tts_${Date.now()}.mp3`;
    const filepath = join(audioStoragePath, filename);
    
    // Save to disk
    const { writeFile } = await import('fs/promises');
    await writeFile(filepath, audioBuffer);
    
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Upload user recording
app.post('/api/upload', checkPassword, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    const { session_id, target_language } = req.body;
    
    // Save to database
    const result = await pool.query(
      'INSERT INTO user_recordings (session_id, audio_path, target_language) VALUES ($1, $2, $3) RETURNING *',
      [session_id, req.file.path, target_language]
    );
    
    res.json({
      id: result.rows[0].id,
      filename: req.file.filename,
      path: req.file.path,
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({ error: 'Failed to upload recording' });
  }
});

// Get session history
app.get('/api/sessions/:id', checkPassword, async (req, res) => {
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

// List all sessions
app.get('/api/sessions', checkPassword, async (req, res) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Audio storage: ${audioStoragePath}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
