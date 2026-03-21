#!/usr/bin/env node
/**
 * JLab Production Deck Generator
 * Converts JLab recognition deck (JP→EN) to production deck (EN→JP)
 */

import * as fs from 'fs';
import * as path from 'path';

interface JLabCard {
  id: string;
  source: string;
  audio: string;
  image: string;
  notes: string;
  meaning: string;
  kanji: string;
  kana: string;
  romaji: string;
  tags: string;
}

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

function parseMeaning(meaningField: string): string {
  // Extract English meaning from "romaji: english meaning" format
  const cleaned = cleanHtml(meaningField);
  
  // Take first line only
  let firstLine = cleaned.split(/\n|<br>/i)[0];
  
  // Extract what's AFTER the colon (English meaning)
  const colonIndex = firstLine.indexOf(':');
  if (colonIndex > 0 && colonIndex < 40) {
    firstLine = firstLine.substring(colonIndex + 1).trim();
  }
  
  // Clean up - stop at first sentence-ending punctuation or context words
  const stopWords = ['There', 'This', 'These', 'Throughout', 'Note', 'Again', 'See', 'For'];
  for (const word of stopWords) {
    const idx = firstLine.indexOf(' ' + word + ' ');
    if (idx > 3) {
      firstLine = firstLine.substring(0, idx).trim();
    }
  }
  
  // Remove trailing punctuation
  firstLine = firstLine.replace(/[.!?;]+$/, '').trim();
  
  // Limit length
  if (firstLine.length > 50) {
    firstLine = firstLine.substring(0, 47) + '...';
  }
  
  return firstLine;
}

function isInstructionCard(card: JLabCard): boolean {
  // Skip cards that are just instructions/remarks
  const instructionPatterns = [
    'Press "@"',
    'Press "!"',
    'Before you start',
    'important advice',
    'What about learning grammar',
    'This is super weird',
    'For the sake of completeness',
    'Double consonants',
    'Wait, that was not written',
    'Throughout this course',
    'This deck contains',
  ];
  
  const textToCheck = (card.notes + ' ' + card.meaning).toLowerCase();
  
  for (const pattern of instructionPatterns) {
    if (textToCheck.includes(pattern.toLowerCase())) return true;
  }
  
  // Skip cards without source (usually instructions)
  if (!card.source || card.source === '') return true;
  
  // Skip cards without actual Japanese content
  if (!card.kanji && !card.kana) return true;
  
  return false;
}

function parseJLabExport(filePath: string): JLabCard[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Skip header lines starting with #
  const dataLines = lines.filter(line => !line.startsWith('#') && line.trim());
  
  const cards: JLabCard[] = [];
  
  for (const line of dataLines) {
    const fields = line.split('\t');
    if (fields.length < 26) continue;
    
    const card: JLabCard = {
      id: fields[1]?.trim() || '',
      source: fields[2]?.trim() || '',
      audio: extractAudioFilename(fields[3] || ''),
      image: fields[4]?.trim() || '',
      notes: fields[5]?.trim() || '',
      meaning: fields[6]?.trim() || '',
      kanji: fields[19]?.trim() || '', // Column with kanji
      kana: fields[16]?.trim() || '',  // Hiragana reading
      romaji: fields[22]?.trim() || '', // Romaji
      tags: fields[25]?.trim() || '',
    };
    
    // Skip instruction/remark cards
    if (isInstructionCard(card)) continue;
    
    // Skip cards without meaningful content
    if (!card.meaning && !card.kanji) continue;
    
    cards.push(card);
  }
  
  return cards;
}

function generateProductionDeck(cards: JLabCard[]): string {
  // Anki header for TSV import
  let output = '#separator:tab\n#html:true\n#tags column:6\n';
  
  for (const card of cards) {
    const meaning = parseMeaning(card.meaning);
    const japanese = cleanHtml(card.kanji || card.kana);
    const reading = cleanHtml(card.kana);
    const romaji = cleanHtml(card.romaji);
    
    // Skip if no meaningful data
    if (!meaning || !japanese) continue;
    
    // Front: English meaning
    // Back: Japanese + reading + romaji + audio reference
    const front = meaning;
    const back = `${japanese}<br><span style="color: #888; font-size: 0.9em;">${reading}</span><br><span style="color: #aaa; font-size: 0.8em;">${romaji}</span>`;
    const audio = card.audio ? `[sound:${card.audio}]` : '';
    
    // TSV line: front, back, audio, source, notes, tags
    output += `${front}\t${back}\t${audio}\t${card.source}\t${cleanHtml(card.notes).substring(0, 100)}\tJLAB-PROD\n`;
  }
  
  return output;
}

function generateSampleSentences(cards: JLabCard[]): string {
  // Generate a separate file with sentence examples
  let output = '#separator:tab\n#html:true\n';
  output += '# This deck contains sample sentences for production practice\n';
  
  for (const card of cards.slice(0, 100)) { // First 100 cards only
    const meaning = parseMeaning(card.meaning);
    const japanese = cleanHtml(card.kanji || card.kana);
    
    if (!meaning || !japanese) continue;
    
    // Create a simple sentence template
    const front = `Use "${meaning}" in a sentence`;
    const back = japanese;
    
    output += `${front}\t${back}\tJLAB-SENTENCE\n`;
  }
  
  return output;
}

// Main execution
const inputFile = process.argv[2] || '~/Documents/Jlab\'s beginner course__Part 1_ Listening comprehension.txt';
const outputDir = process.argv[3] || '~/Documents';

console.log('🎯 JLab Production Deck Generator\n');

try {
  const resolvedInput = inputFile.replace(/^~/, process.env.HOME || '');
  const resolvedOutput = outputDir.replace(/^~/, process.env.HOME || '');
  
  console.log(`📖 Reading: ${resolvedInput}`);
  const cards = parseJLabExport(resolvedInput);
  
  console.log(`✅ Parsed ${cards.length} cards`);
  
  // Filter to first 500 cards (Core 1k equivalent, production should be smaller)
  const productionCards = cards.slice(0, 500);
  console.log(`🎯 Using first ${productionCards.length} cards for production deck`);
  
  // Generate production deck
  const productionDeck = generateProductionDeck(productionCards);
  const prodOutputPath = path.join(resolvedOutput, 'JLab_Production_Deck.txt');
  fs.writeFileSync(prodOutputPath, productionDeck, 'utf-8');
  console.log(`✅ Production deck saved: ${prodOutputPath}`);
  
  // Generate sample sentences
  const sentenceDeck = generateSampleSentences(productionCards);
  const sentOutputPath = path.join(resolvedOutput, 'JLab_Sentence_Practice.txt');
  fs.writeFileSync(sentOutputPath, sentenceDeck, 'utf-8');
  console.log(`✅ Sentence practice deck saved: ${sentOutputPath}`);
  
  // Print stats
  console.log('\n📊 Statistics:');
  console.log(`  Total cards: ${cards.length}`);
  console.log(`  Production cards: ${productionCards.length}`);
  console.log(`  With audio: ${productionCards.filter(c => c.audio).length}`);
  
  console.log('\n📝 Import instructions:');
  console.log('  1. Open Anki');
  console.log('  2. File → Import');
  console.log('  3. Select: JLab_Production_Deck.txt');
  console.log('  4. Type: Basic (and reversed card) - OR just Basic for one-way');
  console.log('  5. Deck: Create new "JLab Production"');
  console.log('  6. Set new cards/day to 5');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
