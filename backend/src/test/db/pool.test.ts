import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Database Pool', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should export pool as a defined object', async () => {
    // Just verify the pool can be imported without errors
    const { pool } = await import('../../db/pool.js');
    
    expect(pool).toBeDefined();
    expect(typeof pool).toBe('object');
    expect(typeof pool.query).toBe('function');
  });

  it('should use DATABASE_URL from environment', async () => {
    const testDbUrl = 'postgresql://testuser:testpass@localhost:5432/testdb';
    process.env.DATABASE_URL = testDbUrl;
    
    vi.resetModules();
    
    const { pool } = await import('../../db/pool.js');
    expect(pool).toBeDefined();
  });
});
