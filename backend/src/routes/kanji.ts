import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

  // GET /api/kanji - Get all kanji with optional filters
  router.get('/', async (req, res) => {
    try {
      const { lessonId, limit } = req.query;
      
      let query = 'SELECT * FROM kanji';
      const params: any[] = [];
      const conditions: string[] = [];
      
      if (lessonId) {
        conditions.push(`lesson_id = $${params.length + 1}`);
        params.push(lessonId);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY lesson_id, character';
      
      if (limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(parseInt(limit as string));
      }
      
      const result = await pool.query(query, params);
      
      // Transform database rows to API response
      const kanjiList = result.rows.map(row => ({
        id: row.id,
        character: row.character,
        meanings: row.meanings,
        readings: row.readings,
        lesson_id: row.lesson_id,
        mnemonic: row.mnemonic,
        stroke_count: row.stroke_count,
        jlpt_level: row.jlpt_level,
        examples: row.examples || [],
      }));
      
      res.json(kanjiList);
    } catch (error) {
      console.error('Error fetching kanji:', error);
      res.status(500).json({ error: 'Failed to fetch kanji' });
    }
  });

  // GET /api/kanji/:id - Get specific kanji by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM kanji WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Kanji not found' });
      }
      
      const row = result.rows[0];
      res.json({
        id: row.id,
        character: row.character,
        meanings: row.meanings,
        readings: row.readings,
        lesson_id: row.lesson_id,
        mnemonic: row.mnemonic,
        stroke_count: row.stroke_count,
        jlpt_level: row.jlpt_level,
        examples: row.examples || [],
      });
    } catch (error) {
      console.error('Error fetching kanji:', error);
      res.status(500).json({ error: 'Failed to fetch kanji' });
    }
  });

export default router;
