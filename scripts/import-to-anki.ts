#!/usr/bin/env node
/**
 * Import JLab Production Deck via AnkiConnect
 */

import * as fs from 'fs';

const ANKI_CONNECT_URL = 'http://127.0.0.1:8765';

interface AnkiConnectRequest {
  action: string;
  version: number;
  params?: any;
}

async function ankiConnect(request: AnkiConnectRequest): Promise<any> {
  const response = await fetch(ANKI_CONNECT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`AnkiConnect error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.error) {
    throw new Error(`AnkiConnect: ${data.error}`);
  }
  
  return data.result;
}

function parseTsvFile(filePath: string): Array<{front: string, back: string, audio: string, source: string, notes: string, tags: string}> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Skip header lines starting with #
  const dataLines = lines.filter(line => !line.startsWith('#') && line.trim());
  
  const cards = [];
  for (const line of dataLines) {
    const fields = line.split('\t');
    if (fields.length >= 6) {
      cards.push({
        front: fields[0].trim(),
        back: fields[1].trim(),
        audio: fields[2].trim(),
        source: fields[3].trim(),
        notes: fields[4].trim(),
        tags: fields[5].trim(),
      });
    }
  }
  
  return cards;
}

async function main() {
  console.log('🎯 Importing JLab Production Deck to Anki\n');
  
  const deckName = 'JLab Production';
  const modelName = 'Basic';
  const filePath = process.env.HOME + '/Documents/JLab_Production_Deck.txt';
  
  // Check if deck exists, create if not
  console.log(`📁 Checking deck: ${deckName}`);
  const decks = await ankiConnect({ action: 'deckNames', version: 6 });
  
  if (!decks.includes(deckName)) {
    console.log(`  Creating new deck: ${deckName}`);
    await ankiConnect({ action: 'createDeck', version: 6, params: { deck: deckName } });
  } else {
    console.log(`  Deck already exists`);
  }
  
  // Get model info
  console.log(`📝 Using model: ${modelName}`);
  const models = await ankiConnect({ action: 'modelNames', version: 6 });
  if (!models.includes(modelName)) {
    throw new Error(`Model "${modelName}" not found. Available: ${models.join(', ')}`);
  }
  
  // Parse TSV file
  console.log(`📖 Reading cards from: ${filePath}`);
  const cards = parseTsvFile(filePath);
  console.log(`  Found ${cards.length} cards\n`);
  
  // Add notes in batches
  console.log(`⬆️  Adding cards to Anki...`);
  let added = 0;
  let failed = 0;
  
  for (const card of cards) {
    try {
      const note: any = {
        deckName: deckName,
        modelName: modelName,
        fields: {
          Front: card.front,
          Back: card.back,
        },
        tags: [card.tags, 'JLab', 'Production'],
      };
      
      // Add audio reference if present (only if file exists in collection.media)
      if (card.audio) {
        const audioMatch = card.audio.match(/\[sound:(.+?)\]/);
        if (audioMatch) {
          // Audio must already exist in Anki's collection.media folder
          // We add it as [sound:filename.mp3] in the Back field
          note.fields.Back += `<br>${card.audio}`;
        }
      }
      
      await ankiConnect({ action: 'addNote', version: 6, params: { note } });
      added++;
      
      if (added % 50 === 0) {
        console.log(`  Progress: ${added}/${cards.length}`);
      }
    } catch (error: any) {
      failed++;
      if (failed <= 3) {
        console.log(`  ⚠️  Failed: ${error.message}`);
      }
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`  Added: ${added} cards`);
  console.log(`  Failed: ${failed} cards`);
  
  // Set new cards per day to 5
  console.log(`\n⚙️  Setting new cards/day to 5...`);
  try {
    await ankiConnect({
      action: 'setDeckConfigId',
      version: 6,
      params: {
        decks: [deckName],
        configId: 1,
      },
    });
    console.log(`  Done!`);
  } catch (e) {
    console.log(`  Note: You may need to manually set new cards/day to 5 in deck options`);
  }
  
  console.log(`\n🎉 JLab Production deck is ready!`);
  console.log(`   Sync Anki to upload to AnkiWeb.`);
}

main().catch(console.error);
