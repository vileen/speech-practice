import { Router } from 'express';
import { checkPassword } from '../middleware/auth.js';
import { convert_pdf, batch_convert, check_opendataloader, check_java } from '../services/pdf_converter.js';
import { upload } from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Check if OpenDataLoader is available
router.get('/status', checkPassword, async (_req, res) => {
  const hasJava = check_java();
  const hasOpenDataLoader = check_opendataloader();
  
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
    const outputDir = path.join('uploads', 'converted', uuidv4());
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    const result = await convert_pdf(
      inputPath,
      outputDir,
      output_format=format,
      use_hybrid=hybrid === 'true',
      use_ocr=ocr === 'true',
      ocr_languages=lang
    );
    
    // Clean up uploaded file
    fs.unlinkSync(inputPath);
    
    if (result.success) {
      // Read converted content
      const content = fs.readFileSync(result.output, 'utf-8');
      
      res.json({
        success: true,
        filename: path.basename(result.output),
        format,
        content,
        download_url: `/api/pdf/download/${path.basename(outputDir)}/${path.basename(result.output)}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
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
    
    const outputDir = path.join('uploads', 'converted', uuidv4());
    fs.mkdirSync(outputDir, { recursive: true });
    
    const inputPaths = (req.files as Express.Multer.File[]).map(f => f.path);
    
    const results = await batch_convert(
      inputPaths,
      outputDir,
      output_format=format,
      use_hybrid=hybrid === 'true',
      use_ocr=ocr === 'true',
      ocr_languages=lang
    );
    
    // Clean up uploaded files
    inputPaths.forEach(p => fs.unlinkSync(p));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    res.json({
      success: failed.length === 0,
      total: results.length,
      converted: successful.length,
      failed: failed.length,
      results: results.map(r => ({
        input: path.basename(r.input),
        success: r.success,
        output: r.output ? path.basename(r.output) : null,
        error: r.error
      })),
      download_url: `/api/pdf/download/${path.basename(outputDir)}`
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
