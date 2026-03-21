#!/usr/bin/env node
/**
 * Generate file with skipped JLab cards for manual translation
 */

import * as fs from 'fs';

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

function parseMeaning(meaningField: string): string | null {
  const cleaned = cleanHtml(meaningField);
  const firstSegment = cleaned.split(/<br>\s*<br>|\n\n/)[0] || cleaned;
  const colonMatch = firstSegment.match(/^[^:]*:\s*([^.!?<;]+)/);
  if (!colonMatch) return null;
  let meaning = colonMatch[1].trim();
  const skipWords = ['is a', 'is the', 'is an', 'is used', 'declares', 'means', 'refers'];
  for (const sw of skipWords) {
    if (meaning.toLowerCase().includes(sw)) return null;
  }
  return meaning;
}

function isInstructionCard(card: any): boolean {
  const instructionPatterns = [
    'Press "@"', 'Before you start', 'important advice', 'What about learning grammar',
    'This is super weird', 'For the sake of completeness', 'Double consonants'
  ];
  const textToCheck = (card.notes + ' ' + card.meaning).toLowerCase();
  for (const pattern of instructionPatterns) {
    if (textToCheck.includes(pattern.toLowerCase())) return true;
  }
  if (!card.source || card.source === '') return true;
  if (!card.kanji && !card.kana) return true;
  return false;
}

const lines = fs.readFileSync('/Users/dominiksoczewka/Documents/Jlab\'s beginner course__Part 1_ Listening comprehension.txt', 'utf-8').split('\n');
const dataLines = lines.filter(l => !l.startsWith('#') && l.trim());

const skipped: any[] = [];

for (const line of dataLines) {
  const fields = line.split('\t');
  if (fields.length < 26) continue;
  
  const card = {
    id: fields[1]?.trim(),
    source: fields[2]?.trim(),
    meaning: fields[6]?.trim(),
    kanji: fields[19]?.trim(),
    kana: fields[16]?.trim(),
    romaji: fields[22]?.trim(),
  };
  
  if (isInstructionCard(card)) continue;
  
  const parsedMeaning = parseMeaning(card.meaning);
  const japanese = cleanHtml(card.kanji || card.kana);
  
  // Skip if it was included in production deck
  if (parsedMeaning && japanese) continue;
  
  // Add to skipped list
  if (japanese && card.meaning) {
    skipped.push({
      japanese,
      reading: cleanHtml(card.kana),
      romaji: cleanHtml(card.romaji),
      rawMeaning: cleanHtml(card.meaning).substring(0, 100)
    });
  }
}

// Generate TSV for manual translation
let output = '#separator:tab\n#html:false\n# These cards need manual translation\n# Format: Japanese<TAB>Reading<TAB>Romaji<TAB>Original meaning (for reference)\n';
for (const card of skipped.slice(0, 150)) {
  output += `${card.japanese}\t${card.reading}\t${card.romaji}\t${card.rawMeaning.replace(/\t/g, ' ')}\n`;
}

fs.writeFileSync('/Users/dominiksoczewka/Documents/JLab_Skipped_Cards.txt', output);
console.log(`Generated file with ${skipped.length} skipped cards`);
console.log('Saved to: ~/Documents/JLab_Skipped_Cards.txt');
console.log('\nFormat: Japanese | Reading | Romaji | Original description');
console.log('Add your own English translation and import to Anki.');
