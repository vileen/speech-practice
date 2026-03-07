import { Router } from 'express';
import OpenAI from 'openai';
import { checkPassword } from '../middleware/auth.js';
import { appConfig } from '../config/index.js';

const router = Router();
const openai = new OpenAI({
  apiKey: appConfig.apiKeys.openai,
});

router.post('/', checkPassword, async (req, res) => {
  try {
    const { text, targetLang = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a translator. Translate the following Japanese text to ${targetLang === 'en' ? 'English' : targetLang}. Only return the translation, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });
    
    const translation = response.choices[0]?.message?.content?.trim() || '';
    
    res.json({ translation });
  } catch (error) {
    console.error('Error translating:', error);
    res.status(500).json({ error: 'Failed to translate' });
  }
});

export default router;
