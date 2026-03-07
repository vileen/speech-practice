import { Router } from 'express';
import multer from 'multer';
import { readFile } from 'fs/promises';
import { generateSpeech } from '../services/elevenlabs.js';
import { addFurigana } from '../services/elevenlabs.js';
import { transcribeAudioDirect } from '../services/whisper.js';
import { checkPassword } from '../middleware/auth.js';
import { appConfig } from '../config/index.js';

const router = Router();

const storage = multer.diskStorage({
  destination: appConfig.audio.storagePath,
  filename: (_req, _file, cb) => {
    cb(null, `recording_${Date.now()}.mp3`);
  },
});

const upload = multer({ storage });

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
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

// Fix common Whisper transcription errors for Japanese
function fixJapaneseTranscription(text: string, target: string): string {
  if (!text) return text;
  
  let fixed = text;
  
  if (target.includes('犬') && (fixed.includes('hen') || fixed.includes('gen'))) {
    fixed = fixed.replace(/\b(hen|gen)\b/g, 'inu');
  }
  if (target.includes('猫') && fixed.includes('kon')) {
    fixed = fixed.replace(/\bkon\b/g, 'neko');
  }
  
  return fixed;
}

// Find differences between target and heard text
function findDifferences(target: string, heard: string): string[] {
  const differences: string[] = [];
  const normTarget = target.replace(/[。、！？\s]/g, '');
  const normHeard = heard.replace(/[。、！？\s]/g, '');
  
  if (normTarget.includes('ています') && !normHeard.includes('ています')) {
    differences.push('Missing い in ~ています (progressive form)');
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
  
  if (Math.abs(normTarget.length - normHeard.length) > 2) {
    differences.push('Sentence length differs significantly');
  }
  
  return differences.length > 0 ? differences : ['Minor pronunciation differences'];
}

router.post('/', checkPassword, upload.single('audio'), async (req, res) => {
  try {
    const { target_text, language, gender, voiceStyle } = req.body;
    
    if (!target_text) {
      return res.status(400).json({ error: 'No target text provided' });
    }

    // No audio file - return TTS for listen phase
    if (!req.file) {
      const audioBuffer = await generateSpeech({
        text: target_text,
        language: language || 'japanese',
        gender: gender || 'female',
        voiceStyle: voiceStyle || 'normal'
      });
      
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
    
    const processedTranscription = language === 'japanese' 
      ? fixJapaneseTranscription(transcription || '', target_text)
      : transcription || '';
    
    const normalizedTarget = target_text.replace(/[。、！？\s]/g, '').toLowerCase();
    const normalizedTranscription = processedTranscription.replace(/[。、！？\s]/g, '').toLowerCase();
    
    let score = 0;
    let feedback = '';
    let errors: string[] = [];
    
    if (normalizedTranscription === normalizedTarget) {
      score = 100;
      feedback = 'Perfect! 🎉';
      errors = [];
    } else if (normalizedTranscription.length > 0) {
      const distance = levenshteinDistance(normalizedTarget, normalizedTranscription);
      const maxLength = Math.max(normalizedTarget.length, normalizedTranscription.length);
      score = Math.round(((maxLength - distance) / maxLength) * 100);
      score = Math.min(100, Math.round(score * 1.1));
      
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
      transcription: processedTranscription,
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

export default router;
