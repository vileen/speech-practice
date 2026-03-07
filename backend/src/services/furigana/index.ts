// Re-export from original elevenlabs.ts for now
// This maintains backward compatibility while enabling future split

export { addFurigana, addFuriganaSync } from '../elevenlabs.js';
export { loadFuriganaCache, saveFuriganaCache, getCachedFurigana, setCachedFurigana } from './cache.js';
