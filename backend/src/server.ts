import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';
import { appConfig, validateConfig } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = appConfig.port;

// Validate configuration
validateConfig();

// Middleware
app.use(cors({
  origin: appConfig.cors.origins,
  credentials: appConfig.cors.credentials,
}));

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
});
