# Struktura Danych Lekcji - Standard

> Oficjalna struktura danych dla wszystkich lekcji w speech-practice.
> MUSI być zachowana spójność dla wszystkich lekcji!

## Wymagana Struktura JSON

```typescript
interface LessonDetail {
  id: string;
  date: string;
  title: string;
  topics: string[];
  vocabulary: Array<{
    jp: string;           // Kanji/hiragana
    reading: string;      // Hiragana reading
    romaji: string;       // Romaji reading
    en: string;           // English meaning
    type?: string;        // 'noun', 'verb', 'i-adjective', etc.
    furigana?: string | null;  // HTML furigana: <ruby>漢字<rt>かんじ</rt></ruby>
  }>;
  grammar: Array<{
    pattern: string;      // Grammar pattern (e.g., "〜てください")
    explanation: string;  // Detailed explanation
    romaji?: string;      // Optional romaji
    examples: Array<{
      jp: string;         // Japanese example sentence
      en: string;         // English translation
      furigana?: string | null;  // HTML furigana
    }>;
  }>;
  practice_phrases: Array<{
    jp: string;           // Japanese phrase
    en: string;           // English translation
    romaji?: string;      // Romaji reading
    furigana?: string | null;  // HTML furigana
  }>;
}
```

## Wymagane Pola

### Vocabulary
- ✅ `jp` (string) - Japanese text (kanji/hiragana)
- ✅ `reading` (string) - Hiragana reading
- ✅ `romaji` (string) - Romaji reading
- ✅ `en` (string) - English meaning
- ✅ `type` (string) - Word type
- ✅ `furigana` (string|null) - HTML with ruby tags

### Grammar
- ✅ `pattern` (string) - Grammar pattern name
- ✅ `explanation` (string) - Detailed explanation
- ✅ `romaji` (string, optional) - Romaji reading of pattern
- ✅ `examples` (array) - Example sentences
  - ✅ `jp` (string) - Japanese sentence
  - ✅ `en` (string) - English translation
  - ✅ `furigana` (string|null) - HTML furigana

### Practice Phrases
- ✅ `jp` (string) - Japanese phrase
- ✅ `en` (string) - English translation
- ✅ `romaji` (string, optional) - Romaji reading
- ✅ `furigana` (string|null) - HTML furigana

## Pola ZAKAZANE (nie używać!)

❌ `word` - użyj `jp`
❌ `kanji` - użyj `jp`
❌ `meaning` - użyj `en`
❌ `japanese` - użyj `jp`
❌ `english` - użyj `en`
❌ `situation` - nie używać
❌ `formation` - dodaj do `explanation`

## Weryfikacja Przed Importem

```bash
# Sprawdź vocabulary
curl -s "https://speech.vileen.pl/api/lessons/lesson-YYYY-MM-DD?furigana=true" \
  -H "X-Password: [hasło]" | jq '.vocabulary[0] | keys'
# Oczekiwane: ["en", "furigana", "jp", "reading", "romaji", "type"]

# Sprawdź grammar
curl -s "https://speech.vileen.pl/api/lessons/lesson-YYYY-MM-DD?furigana=true" \
  -H "X-Password: [hasło]" | jq '.grammar[0] | keys'
# Oczekiwane: ["examples", "explanation", "pattern", "romaji"]

# Sprawdź grammar examples
curl -s "https://speech.vileen.pl/api/lessons/lesson-YYYY-MM-DD?furigana=true" \
  -H "X-Password: [hasło]" | jq '.grammar[0].examples[0] | keys'
# Oczekiwane: ["en", "furigana", "jp"]

# Sprawdź practice_phrases
curl -s "https://speech.vileen.pl/api/lessons/lesson-YYYY-MM-DD?furigana=true" \
  -H "X-Password: [hasło]" | jq '.practice_phrases[0] | keys'
# Oczekiwane: ["en", "furigana", "jp", "romaji"]
```

## Przykład Poprawnego JSON

```json
{
  "vocabulary": [
    {
      "jp": "学校",
      "reading": "がっこう",
      "romaji": "gakkou",
      "en": "school",
      "type": "noun",
      "furigana": "<ruby>学校<rt>がっこう</rt></ruby>"
    }
  ],
  "grammar": [
    {
      "pattern": "〜てください",
      "explanation": "Used to make polite requests. Attach to verb te-form.",
      "romaji": "te kudasai",
      "examples": [
        {
          "jp": "見てください",
          "en": "Please look",
          "furigana": "<ruby>見<rt>み</rt></ruby>てください"
        }
      ]
    }
  ],
  "practice_phrases": [
    {
      "jp": "明日学校に行きます",
      "en": "Tomorrow I will go to school",
      "romaji": "ashita gakkou ni ikimasu",
      "furigana": "<ruby>明日<rt>あした</rt></ruby><ruby>学校<rt>がっこう</rt></ruby>に<ruby>行<rt>い</rt></ruby>きます"
    }
  ]
}
```

## Wersja
Last updated: 2026-03-05
Version: 1.0
