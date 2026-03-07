import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const CACHE_FILE = './data/furigana-cache.json';

interface FuriganaCache {
  [key: string]: string;
}

let cache: FuriganaCache = {};
let cacheLoaded = false;

export async function loadFuriganaCache(): Promise<void> {
  if (cacheLoaded) return;
  
  try {
    if (existsSync(CACHE_FILE)) {
      const data = await readFile(CACHE_FILE, 'utf-8');
      cache = JSON.parse(data);
      console.log(`[Furigana] Loaded ${Object.keys(cache).length} cached entries`);
    }
  } catch (error) {
    console.error('[Furigana] Error loading cache:', error);
    cache = {};
  }
  cacheLoaded = true;
}

export async function saveFuriganaCache(): Promise<void> {
  try {
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`[Furigana] Saved ${Object.keys(cache).length} entries to cache`);
  } catch (error) {
    console.error('[Furigana] Error saving cache:', error);
  }
}

export function getCachedFurigana(text: string): string | undefined {
  if (!cacheLoaded) {
    loadFuriganaCache();
  }
  return cache[text];
}

export function setCachedFurigana(text: string, furigana: string): void {
  cache[text] = furigana;
}
