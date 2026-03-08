import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Ensure logs directory exists
const LOGS_DIR = join(process.cwd(), 'logs');
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

const ERROR_LOG_FILE = join(LOGS_DIR, 'errors.log');

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body ? JSON.stringify(req.body).substring(0, 500) : undefined
  };
  
  // Log to console
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  
  // Log to file
  try {
    appendFileSync(ERROR_LOG_FILE, JSON.stringify(logEntry) + '\n');
  } catch (e) {
    console.error('Failed to write error log:', e);
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp
  });
};

// Get recent errors (for debugging)
export function getRecentErrors(limit: number = 50): string[] {
  try {
    if (!existsSync(ERROR_LOG_FILE)) {
      return [];
    }
    const content = require('fs').readFileSync(ERROR_LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    return lines.slice(-limit);
  } catch (e) {
    return [];
  }
}
