import type { Request, Response, NextFunction } from 'express';
import { appConfig } from '../config/index.js';

export function checkPassword(req: Request, res: Response, next: NextFunction): void {
  const providedPassword = req.headers['x-password'] || req.body.password;
  if (providedPassword !== appConfig.password) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
