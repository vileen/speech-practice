import { Router } from 'express';
import healthRoutes from './health.js';
import sessionRoutes from './sessions.js';
import ttsRoutes from './tts.js';
import chatRoutes from './chat.js';
import furiganaRoutes from './furigana.js';
import lessonRoutes from './lessons.js';
import translateRoutes from './translate.js';
import uploadRoutes from './upload.js';
import repeatRoutes from './repeat.js';
import logsRoutes from './logs.js';
import vocabularyRoutes from './vocabulary.js';
import grammarRoutes from './grammar.js';
import kanjiRoutes from './kanji.js';
import pdfRoutes from './pdf.js';

const router = Router();

// Mount all routes
router.use('/health', healthRoutes);
router.use('/sessions', sessionRoutes);
router.use('/tts', ttsRoutes);
router.use('/chat', chatRoutes);
router.use('/furigana', furiganaRoutes);
router.use('/lessons', lessonRoutes);
router.use('/translate', translateRoutes);
router.use('/upload', uploadRoutes);
router.use('/repeat-after-me', repeatRoutes);
router.use('/logs', logsRoutes);
router.use('/', vocabularyRoutes);
router.use('/grammar', grammarRoutes);
router.use('/kanji', kanjiRoutes);
router.use('/pdf', pdfRoutes);

export default router;
