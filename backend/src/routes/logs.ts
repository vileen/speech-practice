import { Router } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const router = Router();
const ERROR_LOG_FILE = join(process.cwd(), 'logs', 'errors.log');
const APP_LOG_FILE = join(process.cwd(), 'logs', 'app.log');

// Get error logs
router.get('/errors', (_req, res) => {
  try {
    if (!existsSync(ERROR_LOG_FILE)) {
      return res.json({ logs: 'No errors logged yet' });
    }
    
    const content = readFileSync(ERROR_LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(Boolean).slice(-100);
    
    // Parse JSON log entries
    const entries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return { raw: line };
      }
    });
    
    res.json({ 
      count: entries.length,
      entries: entries.reverse() // Most recent first
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// Get app logs (if using winston/pino later)
router.get('/app', (_req, res) => {
  try {
    if (!existsSync(APP_LOG_FILE)) {
      return res.json({ logs: 'No app logs yet' });
    }
    
    const content = readFileSync(APP_LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(Boolean).slice(-100);
    
    res.json({ lines: lines.reverse() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// Clear logs (for admin use)
router.delete('/errors', (_req, res) => {
  try {
    if (existsSync(ERROR_LOG_FILE)) {
      require('fs').writeFileSync(ERROR_LOG_FILE, '');
    }
    res.json({ message: 'Error logs cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

export default router;
