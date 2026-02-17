#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

const polishToEnglish: Record<string, string> = {
  // Common words
  'pies': 'dog', 'gardło': 'throat', 'zapach': 'smell', 'pieniądze': 'money',
  'ogień': 'fire', 'normalny': 'normal', 'przeciętny': 'average', 'kości': 'bones',
  'szczupły': 'slender', 'słowo': 'word', 'góra': 'mountain', 'na': 'on',
  'padać': 'to fall', 'deszcz': 'rain', 'ponieważ': 'because', 'z tego powodu': 'therefore',
  'mleko': 'milk', 'składnik': 'ingredient', 'osoba': 'person', 'człowiek': 'human',
  'być': 'to be', 'przedmiot': 'thing/object', 'rzadko używane': 'rarely used',
  'partykuła': 'particle', 'prawie nieużywane': 'almost unused',
  'jeść': 'eat', 'oglądać': 'watch', 'czytać': 'read', 'iść': 'go', 'robić': 'do',
  'dodatkowe': 'additional', 'lubić': 'like', 'nosić': 'wear', 'tworzyć': 'create',
  'padać deszcz': 'rain falls', 'przychodzić': 'come', 'neutralnie': 'neutral',
  'wiadomości': 'news', 'taksówka': 'taxi', 'ośmiornica': 'octopus', 'ręcznik': 'towel',
  'nóż': 'knife', 'pół': 'half', 'połówka': 'half', 'nieduży': 'not big', 'niemały': 'not small',
  'głośny': 'loud', 'mały': 'small', 'duży': 'big', 'ciepły': 'warm', 'trudny': 'difficult',
  'męczący': 'tiring', 'w porządku': 'okay', 'ok': 'OK', 'tam': 'there', 'obok': 'next to',
  'przy': 'at/near', 'kimś': 'someone', 'czymś': 'something', 'zawsze': 'always',
  'ciągle': 'constantly', 'piękny': 'beautiful', 'flower': 'flower', 'wiśnia': 'cherry',
  'wygoda': 'comfort', 'przyszłość': 'future', 'obok2': 'next to', 'przyjemny zapach': 'pleasant smell',
  'samochód': 'car', 'wracać': 'return', 'historia': 'history', 'przykład': 'example',
  'wanna': 'bathtub', 'kąpiel': 'bath', 'świeczka': 'candle', 'tył': 'back',
  'ja': 'I/me', 'formalnie': 'formally', 'staroświecko': 'old-fashioned',
  'książka': 'book', 'prawda': 'truth', 'kobieta': 'woman', 'mężczyzna': 'man',
  'czytana': 'read', 'jak': 'as/like', 'dopełnienie': 'object', 'dawno temu': 'long ago',
  'śpiący': 'sleepy', 'ucho': 'ear', 'ulica': 'street', 'port': 'port', 'południe': 'south',
  'miasto': 'city', 'czekać': 'wait', 'jeszcze raz': 'again', 'oko': 'eye',
  'żółw': 'turtle', 'zakupy': 'shopping', 'napoje': 'drinks', 'brzoskwinia': 'peach',
  'góra2': 'mountain', 'odpoczywać': 'rest', 'rodzice': 'parents', 'sen': 'dream',
  'marzenie': 'dream', 'gorąca woda': 'hot water', 'swędzi': 'itchy', 'rezerwacja': 'reservation',
  'środek nocy': 'middle of night', 'dobry': 'good', 'pożegnanie': 'farewell',
  'rodzeństwo': 'siblings', 'bracia': 'brothers', 'siostry': 'sisters',
  'młodszy brat': 'younger brother', 'młodsza siostra': 'younger sister',
  'wujek': 'uncle', 'dziadek': 'grandfather', 'starszy mężczyzna': 'elderly man',
  'niebieski': 'blue', 'czerwony': 'red', 'który': 'which', 'słówka': 'vocabulary',
  'porównywania': 'comparison', 'kolory': 'colors',
  // Hiragana/Katakana descriptions
  'Górna kreska odczepiona': 'Top line detached',
  'przecięcie': 'crossing',
  'Hiragana: łezki': 'Hiragana: tear drops',
  'Katakana: prosta': 'Katakana: straight',
  'Pętelka z dołu do góry': 'Loop from bottom to top',
  'Dwie poziome + środkowa': 'Two horizontal + middle',
  'Prosty kształt': 'Simple shape',
  'Kwadratowy kształt': 'Square shape',
  'Pętelka + zjazd': 'Loop + slide',
  'Bez pętelki': 'Without loop',
  'Z dołu do góry': 'From bottom to top',
  'Łezka + przecięcie': 'Tear + crossing',
  'kanciaste': 'angular',
  'Mała wersja': 'Small version',
  'z góry na dół': 'top to bottom',
  'Proste krzyżyk': 'Simple cross',
  'krótsza kreska z lewej': 'shorter line from left',
  'Pętelka z przytupem': 'Loop with emphasis',
  'Prosta kreska z góry w lewo': 'Straight line from top to left',
  'Prosty kształt jak hiragana': 'Simple shape like hiragana',
  'Bez pętelki, kanciasty': 'No loop, angular',
  'Krzyżyk + poziome kreski': 'Cross + horizontal lines',
  'Podobne do hiragana': 'Similar to hiragana',
  'Prosty krzyżyk': 'Simple cross',
  // Grammar terms
  'Z dakuon': 'With dakuten',
  'dwiema kreseczkami': 'two marks',
  'Pytania o pochodzenie': 'Questions about origin',
  'Skąd jesteś': 'Where are you from',
  'Odpowiedź': 'Answer',
  'miejsce': 'place',
  'krótki': 'short',
  'powtórka': 'review',
  'poprzedni': 'previous',
  'wiersz': 'row',
  'ćwiczenia': 'exercises',
  'rozpoznawanie': 'recognition',
  'znaki': 'characters',
  'Vocabulary przykładowe': 'Example vocabulary',
  'Czym jest': 'What is',
  'Drugi sylabariusz': 'Second syllabary',
  'pierwszy to': 'first is',
  'Te same dźwięki': 'Same sounds',
  'inne zastosowanie': 'different usage',
  'Zapisywany': 'Written',
  'W druku': 'In print',
  'często pogrubiony': 'often bold',
  'na dole': 'at bottom',
  'oznacza': 'means',
  'Dakuon': 'Dakuten',
  'dwiem kreski': 'two marks',
  'Tworzenie nowych dźwięków': 'Creating new sounds',
  'Małe a-i-u-e-o': 'Small a-i-u-e-o',
  'łączone z': 'combined with',
  'poprzednią sylabą': 'previous syllable',
  'Rozróżnienie': 'Distinction',
  // Numbers/Age
  'Rei używane w niektórych kontekstach': 'Rei used in some contexts',
  'Uwaga': 'Note',
  'unikać': 'avoid',
  'śmierć': 'death',
  'częściej używane': 'more commonly used',
  'lat': 'years',
  'W Japonii': 'In Japan',
  'pełnoletność': 'adulthood',
  'dorosłość': 'coming of age',
  'Od tego momentu': 'From this moment',
  'można pić alkohol': 'can drink alcohol',
  'głosować': 'vote',
  'Ceremonia': 'Ceremony',
  'święto dorosłości': 'coming of age ceremony',
  'w styczniu': 'in January',
  'Dziewczyny ubierają się': 'Girls dress in',
  'drogie kimona': 'expensive kimono',
  'Nie dodajemy': 'We do not add',
  'mówi się po prostu': 'we simply say',
  'Szkoły i Rok Szkolny': 'Schools and School Year',
  'Rodzaje szkół': 'School Types',
  'Szkoła podstawowa': 'Elementary school',
  'gimnazjum': 'junior high school',
  'liceum': 'high school',
  // Verbs/Grammar
  'ciąć': 'cut',
  'kroić': 'slice',
  'Grupa': 'Group',
  'zamiana': 'changing',
  'słownik': 'dictionary',
  'Kiru - dwa znaczenia': 'Kiru - two meanings',
  'dwie grupy': 'two groups',
  'Zawiera': 'Contains',
  'podstawowych znaków': 'basic characters',
  'Udźwięc': 'Voiced sounds',
  'Tylko trzy znaki': 'Only three characters',
  'Kontekst': 'Context',
  'Pożegnanie': 'Farewell',
  'Użycie': 'Usage',
  'Wskazuje': 'Indicates',
  'minut': 'minutes',
  // Misc
  'kanciasty': 'angular',
  'łezka': 'teardrop',
  'z przytupem': 'with emphasis',
  'zjazd': 'slide',
  'odczepiona': 'detached',
  'łezki': 'teardrops',
  'prosta': 'straight',
  'Uwagi': 'Notes',
  'Rozróżnienie ra-ri-ru-re-ro / la-li-lu-le-lo': 'Distinction between ra-ri-ru-re-ro and la-li-lu-le-lo',
  'Podsumowanie': 'Summary',
  'wszystkich znaków': 'all characters',
  'czy jesteś w stanie': 'are you able to',
};

async function deepClean() {
  console.log('🧹 Deep cleaning all lessons...\n');
  
  const result = await pool.query('SELECT id, title, vocabulary, grammar FROM lessons');
  
  for (const row of result.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    // Clean vocabulary
    vocab = vocab.map((v: any) => {
      const newV = { ...v };
      
      if (v.reading) {
        let fixed = v.reading;
        for (const [pl, en] of Object.entries(polishToEnglish)) {
          fixed = fixed.replace(new RegExp(pl, 'gi'), en);
        }
        if (fixed !== v.reading) {
          newV.reading = fixed;
          needsUpdate = true;
        }
      }
      
      if (v.en) {
        let fixed = v.en;
        for (const [pl, en] of Object.entries(polishToEnglish)) {
          fixed = fixed.replace(new RegExp(pl, 'gi'), en);
        }
        // Fix specific patterns
        fixed = fixed.replace(/\(o ([^)]+)\)/g, '(about $1)');
        if (fixed !== v.en) {
          newV.en = fixed;
          needsUpdate = true;
        }
      }
      
      return newV;
    });
    
    // Clean grammar
    grammar = grammar.map((g: any) => {
      const newG = { ...g };
      
      if (g.explanation) {
        let fixed = g.explanation;
        for (const [pl, en] of Object.entries(polishToEnglish)) {
          fixed = fixed.replace(new RegExp(pl, 'gi'), en);
        }
        // Fix table headers
        fixed = fixed.replace(/\| Character \| Reading \| Vocabulary przykładowe \|/g, '| Character | Reading | Example Vocabulary |');
        fixed = fixed.replace(/\| Japoński \| Znaczenie \| Kontekst \|/g, '| Japanese | Meaning | Context |');
        fixed = fixed.replace(/\| Japoński \| Romaji \| Znaczenie \|/g, '| Japanese | Romaji | Meaning |');
        fixed = fixed.replace(/\| Katakana \| Romaji \| Uwagi \|/g, '| Katakana | Romaji | Notes |');
        fixed = fixed.replace(/\| Czasownik \| Użycie \| Example \|/g, '| Verb | Usage | Example |');
        fixed = fixed.replace(/\| Grupa \| Pattern \| Example \|/g, '| Group | Pattern | Example |');
        fixed = fixed.replace(/Czytanki w hiraganie/g, 'Readings in hiragana');
        fixed = fixed.replace(/Dialog \d+:/g, (m: string) => m.replace('Dialog', 'Dialogue'));
        
        if (fixed !== g.explanation) {
          newG.explanation = fixed;
          needsUpdate = true;
        }
      }
      
      // Clean grammar examples
      if (g.examples && Array.isArray(g.examples)) {
        const newExamples = g.examples.map((ex: any) => ({
          jp: ex.jp,
          en: (ex.en || '').replace(/\((.*?)\)/g, (m: string, p1: string) => {
            let translated = p1;
            for (const [pl, en] of Object.entries(polishToEnglish)) {
              translated = translated.replace(new RegExp(pl, 'gi'), en);
            }
            return `(${translated})`;
          })
        }));
        if (JSON.stringify(newExamples) !== JSON.stringify(g.examples)) {
          newG.examples = newExamples;
          needsUpdate = true;
        }
      }
      
      return newG;
    });
    
    if (needsUpdate) {
      await pool.query(
        'UPDATE lessons SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [JSON.stringify(vocab), JSON.stringify(grammar), row.id]
      );
      console.log(`✅ Deep cleaned: ${row.id}`);
    }
  }
  
  console.log('\n🎉 Deep cleaning complete!');
  await pool.end();
}

deepClean();
