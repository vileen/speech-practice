import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { pool } from './db/pool.js';
import { generateSpeech, addFurigana, addFuriganaSync, saveFuriganaCache } from './services/elevenlabs.js';
import { getLessonIndex, getLesson, getRecentLessons, getLessonSystemPrompt } from './services/lessons.js';
import { transcribeAudioDirect } from './services/whisper.js';
import { generateChatResponse } from './services/chat.js';
import { readFile } from 'fs/promises';

const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = config({ path: envPath });
console.log('Dotenv result:', result.error ? 'Error: ' + result.error.message : 'OK');
console.log('ELEVENLABS_API_KEY exists:', !!process.env.ELEVENLABS_API_KEY);

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

// Database pool imported from ./db/pool.js

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
    
    // Transcribe audio with Whisper
    let transcription = null;
    try {
      const audioBuffer = await readFile(req.file.path);
      const langCode = target_language === 'japanese' ? 'ja' : 'it';
      transcription = await transcribeAudioDirect(audioBuffer, langCode);
      
      // Update database with transcription
      await pool.query(
        'UPDATE user_recordings SET transcription = $1 WHERE id = $2',
        [transcription, result.rows[0].id]
      );
      
      console.log(`Transcribed: ${transcription}`);
    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
      // Don't fail the upload if transcription fails
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

// Repeat After Me - Practice mode with pronunciation checking
app.post('/api/repeat-after-me', checkPassword, upload.single('audio'), async (req, res) => {
  try {
    const { target_text, language } = req.body;
    
    if (!target_text) {
      return res.status(400).json({ error: 'No target text provided' });
    }

    // If no audio file, just return the TTS for "listen" phase
    if (!req.file) {
      const audioBuffer = await generateSpeech({ 
        text: target_text, 
        language: language || 'japanese', 
        gender: 'female' 
      });
      
      // Add furigana for display (async with Jisho API)
      const textWithFurigana = await addFurigana(target_text);
      
      res.set('Content-Type', 'audio/mpeg');
      res.set('X-Text-With-Furigana', encodeURIComponent(textWithFurigana));
      res.set('X-Target-Text', encodeURIComponent(target_text));
      res.send(audioBuffer);
      return;
    }

    // User provided audio - check pronunciation
    const audioBuffer = await readFile(req.file.path);
    const langCode = language === 'japanese' ? 'ja' : 'it';
    const transcription = await transcribeAudioDirect(audioBuffer, langCode);
    
    // Post-process Japanese transcription - fix common Whisper errors
    function fixJapaneseTranscription(text: string, target: string): string {
      if (!text) return text;
      
      // Common Whisper misheard words in isolation
      const fixes: Record<string, string> = {
        'hen': 'inu',      // 犬
        'gen': 'inu',      // 犬 (alternative mishearing)
        'kon': 'neko',     // 猫
        'gon': 'inu',      // 犬
        'kin': 'inu',      // 犬
        'sen': 'san',      // さん
        'chen': 'chan',    // ちゃん
        'jun': 'juu',      // 十
        'shichi': 'nana',  // 七
      };
      
      let fixed = text;
      
      // Check if target contains specific kanji that Whisper often mishears
      if (target.includes('犬') && (fixed.includes('hen') || fixed.includes('gen'))) {
        fixed = fixed.replace(/\b(hen|gen)\b/g, 'inu');
      }
      if (target.includes('猫') && fixed.includes('kon')) {
        fixed = fixed.replace(/\bkon\b/g, 'neko');
      }
      
      return fixed;
    }
    
    // Apply post-processing for Japanese
    const processedTranscription = language === 'japanese' 
      ? fixJapaneseTranscription(transcription || '', target_text)
      : transcription || '';
    
    // Compare transcription with target (fuzzy matching)
    const normalizedTarget = target_text.replace(/[。、！？\s]/g, '').toLowerCase();
    const normalizedTranscription = processedTranscription.replace(/[。、！？\s]/g, '').toLowerCase();
    
    // Calculate similarity using Levenshtein distance
    function levenshteinDistance(a: string, b: string): number {
      const matrix = [];
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }
    
    // Use processed transcription for comparison and display
    const finalTranscription = processedTranscription;
    
    // Find differences between target and transcription
    function findDifferences(target: string, heard: string): string[] {
      const differences: string[] = [];
      
      // Normalize for comparison but keep original for display
      const normTarget = target.replace(/[。、！？\s]/g, '');
      const normHeard = heard.replace(/[。、！？\s]/g, '');
      
      // Check for missing words/particles
      if (normTarget.includes('ています') && !normHeard.includes('ています')) {
        differences.push('Missing い in ~ています (progressive form)');
      }
      if (normTarget.includes('でいます') && !normHeard.includes('でいます')) {
        differences.push('Missing い in ~でいます (progressive form)');
      }
      if (normTarget.includes('ます') && !normHeard.includes('ます')) {
        differences.push('Missing polite ending ~ます');
      }
      if (normTarget.includes('は') && !normHeard.includes('は')) {
        differences.push('Missing topic particle は (wa)');
      }
      if (normTarget.includes('を') && !normHeard.includes('を')) {
        differences.push('Missing object particle を (wo)');
      }
      if (normTarget.includes('に') && !normHeard.includes('に')) {
        differences.push('Missing particle に (ni)');
      }
      if (normTarget.includes('が') && !normHeard.includes('が')) {
        differences.push('Missing subject particle が (ga)');
      }
      if (normTarget.includes('の') && !normHeard.includes('の')) {
        differences.push('Missing possessive particle の (no)');
      }
      if (normTarget.includes('と') && !normHeard.includes('と')) {
        differences.push('Missing particle と (to)');
      }
      
      // Check length difference
      if (Math.abs(normTarget.length - normHeard.length) > 2) {
        differences.push('Sentence length differs significantly');
      }
      
      return differences.length > 0 ? differences : ['Minor pronunciation differences'];
    }
    
    let score = 0;
    let feedback = '';
    let errors: string[] = [];
    
    if (normalizedTranscription === normalizedTarget) {
      score = 100;
      feedback = 'Perfect! 🎉';
      errors = [];
    } else if (normalizedTranscription.length > 0) {
      // Calculate Levenshtein similarity
      const distance = levenshteinDistance(normalizedTarget, normalizedTranscription);
      const maxLength = Math.max(normalizedTarget.length, normalizedTranscription.length);
      score = Math.round(((maxLength - distance) / maxLength) * 100);
      
      // Boost score slightly for partial matches (more forgiving)
      score = Math.min(100, Math.round(score * 1.1));
      
      // Find specific errors
      errors = findDifferences(target_text, transcription || '');
      
      if (score >= 85) {
        feedback = 'Excellent! Almost perfect 👏';
      } else if (score >= 70) {
        feedback = 'Very good! 👍';
      } else if (score >= 50) {
        feedback = 'Good try! Keep practicing 💪';
      } else if (score >= 30) {
        feedback = 'Getting there! Try again 🎯';
      } else {
        feedback = 'Keep practicing! Listen and repeat 🎤';
      }
    } else {
      score = 0;
      feedback = 'Could not hear you. Try again! 🎤';
      errors = ['No audio detected'];
    }

    res.json({
      target_text: target_text,
      transcription: finalTranscription,
      score: score,
      feedback: feedback,
      errors: errors,
      text_with_furigana: await addFurigana(target_text),
    });
  } catch (error) {
    console.error('Error in repeat-after-me:', error);
    res.status(500).json({ error: 'Failed to process pronunciation check' });
  }
});

// Get text with furigana (async with Jisho API fallback)
app.post('/api/furigana', checkPassword, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    const textWithFurigana = await addFurigana(text);
    res.json({ 
      original: text,
      with_furigana: textWithFurigana 
    });
  } catch (error) {
    console.error('Error adding furigana:', error);
    res.status(500).json({ error: 'Failed to add furigana' });
  }
});

// Save furigana cache to disk
app.post('/api/furigana/save', checkPassword, async (req, res) => {
  try {
    await saveFuriganaCache();
    res.json({ status: 'saved', message: 'Furigana cache saved to disk' });
  } catch (error) {
    console.error('Error saving cache:', error);
    res.status(500).json({ error: 'Failed to save cache' });
  }
});

// LESSON MODE API

// List all lessons
app.get('/api/lessons', checkPassword, async (req, res) => {
  try {
    const index = await getLessonIndex();
    res.json(index);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get recent lessons for quick access
app.get('/api/lessons/recent', checkPassword, async (req, res) => {
  try {
    const count = parseInt(req.query.count as string) || 3;
    const lessons = await getRecentLessons(count);
    res.json({ lessons });
  } catch (error) {
    console.error('Error fetching recent lessons:', error);
    res.status(500).json({ error: 'Failed to fetch recent lessons' });
  }
});

// Get specific lesson
app.get('/api/lessons/:id', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await getLesson(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Start lesson conversation (returns system prompt)
app.post('/api/lessons/:id/start', checkPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const { relaxed = true, session_id } = req.body;
    
    const lesson = await getLesson(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const systemPrompt = getLessonSystemPrompt(lesson, relaxed);
    
    // Store lesson context in session for chat
    if (session_id) {
      await pool.query(
        `UPDATE sessions 
         SET lesson_context = $1, lesson_id = $2 
         WHERE id = $3`,
        [systemPrompt, lesson.id, session_id]
      );
    }
    
    res.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        date: lesson.date,
        topics: lesson.topics,
      },
      system_prompt: systemPrompt,
      vocabulary_count: lesson.vocabulary.length,
      grammar_count: lesson.grammar.length,
    });
  } catch (error) {
    console.error('Error starting lesson:', error);
    res.status(500).json({ error: 'Failed to start lesson' });
  }
});

// Chat endpoint for AI conversation
app.post('/api/chat', checkPassword, async (req, res) => {
  try {
    const { session_id, message } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    // Get session with lesson context
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1',
      [session_id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    const lessonContext = session.lesson_context;
    
    // Get conversation history
    const historyResult = await pool.query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT 20',
      [session_id]
    );
    
    // Build messages array
    const messages = historyResult.rows.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));
    
    // Add user message (or start trigger)
    if (message !== '[START_CONVERSATION]') {
      messages.push({ role: 'user', content: message });
      
      // Save user message
      await pool.query(
        'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
        [session_id, 'user', message]
      );
    }
    
    // Generate AI response
    const aiResponse = await generateChatResponse(messages, lessonContext);
    
    // Save AI message
    await pool.query(
      'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
      [session_id, 'assistant', aiResponse.text]
    );
    
    res.json({
      text: aiResponse.text,
      text_with_furigana: aiResponse.textWithFurigana,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Serve static frontend files
const staticPath = join(__dirname, '../dist');
app.use(express.static(staticPath));

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(staticPath, 'index.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Audio storage: ${audioStoragePath}`);
  console.log(`Static files: ${staticPath}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
