import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, appendFileSync } from 'fs';
import { appConfig, validateConfig } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = appConfig.port;

// Ensure logs directory exists
const LOGS_DIR = join(process.cwd(), 'logs');
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}\n\n`;
  console.error(logEntry);
  try {
    appendFileSync(join(LOGS_DIR, 'errors.log'), logEntry);
  } catch {}
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  const timestamp = new Date().toISOString();
  const err = reason instanceof Error ? reason : new Error(String(reason));
  const logEntry = `[${timestamp}] UNHANDLED REJECTION: ${err.message}\n${err.stack}\n\n`;
  console.error(logEntry);
  try {
    appendFileSync(join(LOGS_DIR, 'errors.log'), logEntry);
  } catch {}
});

// Validate configuration
validateConfig();

// Middleware
app.use(cors({
  origin: appConfig.cors.origins,
  credentials: appConfig.cors.credentials,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-password'],
}));

// Debug: log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - x-password: ${req.headers['x-password'] ? 'present' : 'missing'}`);
  next();
});

app.use(express.json());

// Ensure directories exist
if (!existsSync(appConfig.audio.storagePath)) {
  mkdirSync(appConfig.audio.storagePath, { recursive: true });
}

// Mount API routes
app.use('/api', routes);

// Serve static frontend files
const staticPath = join(__dirname, '../dist');
app.use(express.static(staticPath));

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(join(staticPath, 'index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Audio storage: ${appConfig.audio.storagePath}`);
  console.log(`📁 Static files: ${staticPath}`);
  console.log(`📁 Logs: ${LOGS_DIR}`);
});
