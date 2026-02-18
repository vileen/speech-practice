// Fetch reading from Jisho API with retry logic
async function getReadingFromJisho(word: string): Promise<string | null> {
  await loadCache();
  
  // Check cache first
  if (furiganaCache.has(word)) {
    console.log(`[Furigana] Cache hit for: ${word} = ${furiganaCache.get(word)}`);
    return furiganaCache.get(word)!;
  }
  
  console.log(`[Furigana] Fetching from Jisho: ${word}`);
  
  // Retry with exponential backoff for rate limiting (429)
  const maxRetries = 3;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
      console.log(`[Furigana] Jisho response status: ${response.status} (attempt ${attempt + 1})`);
      
      if (response.status === 429) {
        // Rate limited - wait and retry with increasing delay
        const delay = 500 + (attempt * 500); // 500ms, 1000ms, 1500ms
        console.log(`[Furigana] Rate limited (429), waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (!response.ok) {
        console.log(`[Furigana] Jisho request failed: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      console.log(`[Furigana] Jisho results count: ${data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        // First try: exact match
        for (const result of data.data) {
          const japanese = result.japanese?.[0];
          if (japanese) {
            const resultWord = japanese.word;
            const reading = japanese.reading;
            
            // Only use if the word matches exactly and has a reading
            if (resultWord === word && reading) {
              furiganaCache.set(word, reading);
              await saveCache();
              console.log(`[Furigana] Cached (exact): ${word} = ${reading}`);
              return reading;
            }
          }
        }
        
        // Second try: find partial match including okurigana
        for (const result of data.data) {
          for (const japanese of (result.japanese || [])) {
            const resultWord = japanese.word;
            const fullReading = japanese.reading;
            
            if (resultWord && fullReading && resultWord.includes(word)) {
              furiganaCache.set(word, fullReading);
              await saveCache();
              console.log(`[Furigana] Cached (partial match): ${word} = ${fullReading} (from ${resultWord})`);
              return fullReading;
            }
          }
        }
        
        console.log(`[Furigana] No result with reading found for: ${word}`);
        return null;
      } else {
        console.log(`[Furigana] No results for: ${word}`);
        return null;
      }
    } catch (error) {
      console.error(`[Furigana] Error fetching from Jisho (attempt ${attempt + 1}):`, error);
      
      if (attempt < maxRetries) {
        const delay = 500 + (attempt * 500);
        console.log(`[Furigana] Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.log(`[Furigana] All ${maxRetries + 1} attempts failed for: ${word}`);
        return null;
      }
    }
  }
  
  return null;
}
