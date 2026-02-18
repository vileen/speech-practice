import { pool } from './db/pool.js';

async function check() {
  const result = await pool.query("SELECT id, lesson_id, lesson_context FROM sessions WHERE id = 30");
  console.log(result.rows[0]);
  process.exit(0);
}
check();
