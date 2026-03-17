import { Router } from 'express';
import multer from 'multer';
import { checkPassword } from '../middleware/auth.js';
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const router = Router();

// Configure multer for PDF uploads
const upload = multer({
  dest: 'uploads/pdfs/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Helper to check if OpenDataLoader is available
function checkOpenDataLoader(): boolean {
  try {
    execSync('python -c "import opendataloader_pdf"', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkJava(): boolean {
  try {
    const result = execSync('java -version 2>&1', { encoding: 'utf-8' });
    return result.includes('version');
  } catch {
    return false;
  }
}

// Check if OpenDataLoader is available
router.get('/status', checkPassword, async (_req, res) => {
  const hasJava = checkJava();
  const hasOpenDataLoader = checkOpenDataLoader();
  
  res.json({
    available: hasJava && hasOpenDataLoader,
    java: hasJava,
    opendataloader: hasOpenDataLoader,
    message: !hasJava 
      ? 'Java 11+ is required. Install from https://adoptium.net/'
      : !hasOpenDataLoader 
        ? 'OpenDataLoader not installed. Run: pip install opendataloader-pdf'
        : 'Ready'
  });
});

// Convert uploaded PDF
router.post('/convert', checkPassword, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }
    
    const {
      format = 'markdown',
      hybrid = 'false',
      ocr = 'false',
      lang = 'eng'
    } = req.body;
    
    const inputPath = req.file.path;
    const outputDir = path.join('uploads', 'converted', crypto.randomUUID());
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Build command
    const args = [
      path.join(process.cwd(), 'scripts', 'convert_pdf.py'),
      inputPath,
      outputDir,
      '--format', format
    ];
    
    if (hybrid === 'true') args.push('--hybrid');
    if (ocr === 'true') args.push('--ocr');
    if (lang) args.push('--lang', lang);
    
    // Run conversion
    const result = spawn('python', args);
    
    let stdout = '';
    let stderr = '';
    
    result.stdout.on('data', (data) => { stdout += data; });
    result.stderr.on('data', (data) => { stderr += data; });
    
    result.on('close', (code) => {
      // Clean up uploaded file
      fs.unlinkSync(inputPath);
      
      if (code === 0) {
        // Find output file
        const outputFiles = fs.readdirSync(outputDir);
        const outputFile = outputFiles.find(f => f.endsWith('.md') || f.endsWith('.json') || f.endsWith('.html'));
        
        if (outputFile) {
          const outputPath = path.join(outputDir, outputFile);
          const content = fs.readFileSync(outputPath, 'utf-8');
          
          res.json({
            success: true,
            filename: outputFile,
            format,
            content,
            download_url: `/api/pdf/download/${path.basename(outputDir)}/${outputFile}`
          });
        } else {
          res.status(500).json({ success: false, error: 'Output file not found' });
        }
      } else {
        res.status(500).json({ success: false, error: stderr || 'Conversion failed' });
      }
    });
    
  } catch (error: any) {
    console.error('PDF conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Conversion failed'
    });
  }
});

// Batch convert multiple PDFs
router.post('/batch', checkPassword, upload.array('pdfs', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No PDF files provided' });
    }
    
    const {
      format = 'markdown',
      hybrid = 'false',
      ocr = 'false',
      lang = 'eng'
    } = req.body;
    
    const outputDir = path.join('uploads', 'converted', crypto.randomUUID());
    fs.mkdirSync(outputDir, { recursive: true });
    
    const inputPaths = (req.files as Express.Multer.File[]).map(f => f.path);
    
    // Build command
    const args = [
      path.join(process.cwd(), 'scripts', 'convert_pdf.py'),
      ...inputPaths,
      outputDir,
      '--format', format
    ];
    
    if (hybrid === 'true') args.push('--hybrid');
    if (ocr === 'true') args.push('--ocr');
    if (lang) args.push('--lang', lang);
    
    // Run conversion
    const child = spawn('python', args);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    
    child.on('close', (code) => {
      // Clean up uploaded files
      inputPaths.forEach(p => {
        try { fs.unlinkSync(p); } catch {}
      });
      
      if (code === 0) {
        const outputFiles = fs.readdirSync(outputDir);
        
        res.json({
          success: true,
          total: inputPaths.length,
          converted: outputFiles.length,
          download_url: `/api/pdf/download/${path.basename(outputDir)}`
        });
      } else {
        res.status(500).json({
          success: false,
          error: stderr || 'Batch conversion failed'
        });
      }
    });
    
  } catch (error: any) {
    console.error('Batch PDF conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Batch conversion failed'
    });
  }
});

export default router;
