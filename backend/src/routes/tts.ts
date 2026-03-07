import { Router } from 'express';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { generateSpeech } from '../services/elevenlabs.js';
import { checkPassword } from '../middleware/auth.js';
import { appConfig } from '../config/index.js';

const router = Router();
const audioStoragePath = appConfig.audio.storagePath;

router.post('/', checkPassword, async (req, res) => {
  try {
    const { text, language, gender, voiceStyle } = req.body;
    
    console.log('[TTS] Using ElevenLabs TTS for', language);
    const audioBuffer = await generateSpeech({ text, language, gender, voiceStyle });
    
    const filename = `tts_${Date.now()}.mp3`;
    const filepath = join(audioStoragePath, filename);
    
    await writeFile(filepath, audioBuffer);
    
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

export default router;
