#!/usr/bin/env node
/**
 * AI-Powered JLab Production Deck Generator
 * Uses AI to generate clean English translations for ALL cards
 */

import * as fs from 'fs';

interface JLabCard {
  id: string;
  source: string;
  audio: string;
  meaning: string;
  kanji: string;
  kana: string;
  romaji: string;
  tags: string;
}

// Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'xai'; // 'xai' or 'openai'
const BATCH_SIZE = 50; // Process cards in batches
const DELAY_MS = 100; // Delay between API calls to avoid rate limits

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractAudioFilename(audioField: string): string {
  const match = audioField.match(/\[sound:(.+?)\]/);
  return match ? match[1] : '';
}

function isInstructionCard(card: JLabCard): boolean {
  const instructionPatterns = [
    'Press "@"', 'Press "!"', 'Before you start', 'important advice',
    'What about learning grammar', 'This is super weird',
    'For the sake of completeness', 'Double consonants',
    'Wait, that was not written', 'Throughout this course'
  ];
  const textToCheck = (card.meaning).toLowerCase();
  for (const pattern of instructionPatterns) {
    if (textToCheck.includes(pattern.toLowerCase())) return true;
  }
  if (!card.source || card.source === '') return true;
  if (!card.kanji && !card.kana) return true;
  return false;
}

function parseJLabExport(filePath: string): JLabCard[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const dataLines = lines.filter(line => !line.startsWith('#') && line.trim());
  
  const cards: JLabCard[] = [];
  
  for (const line of dataLines) {
    const fields = line.split('\t');
    if (fields.length < 26) continue;
    
    const card: JLabCard = {
      id: fields[1]?.trim() || '',
      source: fields[2]?.trim() || '',
      audio: extractAudioFilename(fields[3] || ''),
      meaning: fields[6]?.trim() || '',
      kanji: fields[19]?.trim() || '',
      kana: fields[16]?.trim() || '',
      romaji: fields[22]?.trim() || '',
      tags: fields[25]?.trim() || '',
    };
    
    if (isInstructionCard(card)) continue;
    if (!card.kanji && !card.kana) continue;
    
    cards.push(card);
  }
  
  return cards;
}

async function translateWithXAI(japanese: string, romaji: string, context: string): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error('XAI_API_KEY not set');
    return null;
  }

  const prompt = `Translate this Japanese phrase to English. Be concise (2-4 words max).

Japanese: ${japanese}
Romaji: ${romaji}
Context from original card: ${context.substring(0, 200)}

Rules:
- Give ONLY the English translation
- No explanations, no notes
- Keep it simple and natural
- For phrases like "X is a way to say Y", just give "Y" (the meaning)
- For grammar patterns, give the closest English equivalent

English translation:`;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let translation = data.choices[0]?.message?.content?.trim() || '';
    
    // Clean up the response
    translation = translation
      .replace(/^["']|["']$/g, '')
      .replace(/\n/g, ' ')
      .trim();
    
    // Limit length
    if (translation.length > 50) {
      translation = translation.substring(0, 47) + '...';
    }
    
    return translation;
  } catch (error) {
    console.error(`Translation failed for "${japanese}":`, error);
    return null;
  }
}

async function translateWithOpenAI(japanese: string, romaji: string, context: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set');
    return null;
  }

  const prompt = `Translate this Japanese phrase to English. Be concise (2-4 words max).

Japanese: ${japanese}
Romaji: ${romaji}
Context: ${context.substring(0, 200)}

Give ONLY the English translation, no explanations.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 30,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let translation = data.choices[0]?.message?.content?.trim() || '';
    
    translation = translation
      .replace(/^["']|["']$/g, '')
      .replace(/\n/g, ' ')
      .trim();
    
    if (translation.length > 50) {
      translation = translation.substring(0, 47) + '...';
    }
    
    return translation;
  } catch (error) {
    console.error(`Translation failed for "${japanese}":`, error);
    return null;
  }
}

async function translateCard(card: JLabCard): Promise<string | null> {
  const japanese = cleanHtml(card.kanji || card.kana);
  const romaji = cleanHtml(card.romaji);
  const context = cleanHtml(card.meaning);
  
  if (AI_PROVIDER === 'xai') {
    return translateWithXAI(japanese, romaji, context);
  } else {
    return translateWithOpenAI(japanese, romaji, context);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🤖 AI-Powered JLab Production Deck Generator\n');
  console.log(`Provider: ${AI_PROVIDER.toUpperCase()}`);
  console.log(`API Key: ${process.env.XAI_API_KEY || process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}\n`);
  
  const inputFile = process.argv[2] || '/Users/dominiksoczewka/Documents/Jlab\'s beginner course__Part 1_ Listening comprehension.txt';
  const outputFile = '/Users/dominiksoczewka/Documents/JLab_AI_Production_Deck.txt';
  
  console.log(`📖 Reading: ${inputFile}`);
  const cards = parseJLabExport(inputFile);
  console.log(`✅ Found ${cards.length} cards\n`);
  
  // Load existing translations cache
  const cacheFile = '/Users/dominiksoczewka/.jlab_translation_cache.json';
  let cache: Record<string, string> = {};
  if (fs.existsSync(cacheFile)) {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    console.log(`📦 Loaded ${Object.keys(cache).length} cached translations\n`);
  }
  
  const translated: Array<{japanese: string, reading: string, romaji: string, english: string, audio: string}> = [];
  let processed = 0;
  let cached = 0;
  
  console.log('⬆️  Translating cards...\n');
  
  for (const card of cards) {
    const japanese = cleanHtml(card.kanji || card.kana);
    const cacheKey = japanese;
    
    let english: string | null;
    
    if (cache[cacheKey]) {
      english = cache[cacheKey];
      cached++;
    } else {
      english = await translateCard(card);
      if (english) {
        cache[cacheKey] = english;
        // Save cache periodically
        if (processed % 10 === 0) {
          fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
        }
        await delay(DELAY_MS);
      }
    }
    
    if (english) {
      translated.push({
        japanese,
        reading: cleanHtml(card.kana),
        romaji: cleanHtml(card.romaji),
        english,
        audio: card.audio,
      });
    }
    
    processed++;
    if (processed % 50 === 0) {
      console.log(`  Progress: ${processed}/${cards.length} (cached: ${cached})`);
    }
  }
  
  // Final cache save
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  
  console.log(`\n✅ Translated ${translated.length} cards`);
  console.log(`   From cache: ${cached}`);
  console.log(`   New translations: ${translated.length - cached}\n`);
  
  // Generate TSV
  let output = '#separator:tab\n#html:true\n#tags column:5\n';
  for (const card of translated) {
    const back = `${card.japanese}<br><span style="color: #888; font-size: 0.9em;">${card.reading}</span><br><span style="color: #aaa; font-size: 0.8em;">${card.romaji}</span>`;
    const audioRef = card.audio ? `[sound:${card.audio}]` : '';
    output += `${card.english}\t${back}\t${audioRef}\tJLAB-AI\n`;
  }
  
  fs.writeFileSync(outputFile, output);
  console.log(`💾 Saved to: ${outputFile}\n`);
  
  console.log('📝 Next steps:');
  console.log('  1. Review a few translations manually');
  console.log('  2. Import to Anki: File → Import → select the file');
  console.log('  3. Set deck name: "JLab Production AI"');
  console.log('  4. Set new cards/day to 5');
}

main().catch(console.error);
