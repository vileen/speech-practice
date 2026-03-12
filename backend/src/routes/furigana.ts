import { Router } from 'express';
import { addFurigana, saveFuriganaCache } from '../services/elevenlabs.js';
import { getCachedFurigana, cacheFurigana } from '../services/lessons.js';
import { checkPassword } from '../middleware/auth.js';

const router = Router();

// Get text with furigana
router.post('/', checkPassword, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    // Check cache first
    const cached = await getCachedFurigana(text);
    if (cached) {
      return res.json({ 
        original: text,
        with_furigana: cached,
        cached: true
      });
    }
    
    // Generate furigana
    const textWithFurigana = await addFurigana(text);
    const hasFurigana = textWithFurigana.includes('<ruby>');
    
    if (hasFurigana) {
      await cacheFurigana(text, textWithFurigana);
    }
    
    if (!hasFurigana && text.match(/[\u4e00-\u9faf]/)) {
      // Return 200 with original text instead of 404 - client can handle gracefully
      return res.json({
        original: text,
        with_furigana: text,
        cached: false,
        hasFurigana: false
      });
    }
    
    res.json({ 
      original: text,
      with_furigana: textWithFurigana,
      cached: false,
      hasFurigana
    });
  } catch (error) {
    console.error('Error adding furigana:', error);
    res.status(500).json({ error: 'Failed to add furigana' });
  }
});

// Save furigana cache to disk
router.post('/save', checkPassword, async (_req, res) => {
  try {
    await saveFuriganaCache();
    res.json({ status: 'saved', message: 'Furigana cache saved to disk' });
  } catch (error) {
    console.error('Error saving cache:', error);
    res.status(500).json({ error: 'Failed to save cache' });
  }
});

export default router;
