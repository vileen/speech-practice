// Lesson title translations (Polish -> English)
export const lessonTitleTranslations: Record<string, string> = {
  'Lekcja 2025-10-01 — Powtórka i Partykuła NO (Własność)': 'Lesson 2025-10-01 — Review and NO Particle (Possession)',
  'Lekcja 2025-10-06 — Liczby, Wiek i Hiragana (na-ni-nu-ne-no)': 'Lesson 2025-10-06 — Numbers, Age and Hiragana',
  'Lekcja 2025-10-08 — Hiragana: wiersz ha-hi-fu-he-ho, udźwięcznienia, dialogi': 'Lesson 2025-10-08 — Hiragana: ha-hi-fu-he-ho row, voicing, dialogues',
  'Lekcja 2025-10-15 — Hiragana: ma-mi-mu-me-mo, ya-yu-yo, czas, rodzina': 'Lesson 2025-10-15 — Hiragana: ma-mi-mu-me-mo, ya-yu-yo, time, family',
  'Lekcja 2025-10-16 — Hiragana: ra-ri-ru-re-ro, wa-wo-n, przymiotniki': 'Lesson 2025-10-16 — Hiragana: ra-ri-ru-re-ro, wa-wo-n, adjectives',
  'Lekcja 2025-10-20 — Czasowniki: grupy I/II/III, formy podstawowe': 'Lesson 2025-10-20 — Verbs: groups I/II/III, dictionary forms',
  'Lekcja 2025-10-22 — Partykuły wa, ga, no, o': 'Lesson 2025-10-22 — Particles wa, ga, no, o',
  'Lekcja 2025-10-27 — Partykuły ni, e, de, to': 'Lesson 2025-10-27 — Particles ni, e, de, to',
  'Lekcja 2025-10-29 — Krótka forma': 'Lesson 2025-10-29 — Short form',
  'Lekcja 2025-11-03 — Katakana (kontynuacja)': 'Lesson 2025-11-03 — Katakana (continued)',
  'Lekcja 2025-11-05 — Czytanki podstawowe': 'Lesson 2025-11-05 — Basic reading comprehension',
  'Lekcja 2025-11-12 — partykuły, krótka forma': 'Lesson 2025-11-12 — Particles, short form',
  'Lekcja 2025-12-01 — Frequency Adverbs and Suggestions': 'Lesson 2025-12-01 — Frequency Adverbs and Suggestions',
  'Lekcja 2025-12-03 — Existence Verbs and Food Vocabulary': 'Lesson 2025-12-03 — Existence Verbs and Food Vocabulary',
  'Lekcja 2025-12-10 — Location Words and Positional Phrases': 'Lesson 2025-12-10 — Location Words and Positional Phrases',
  'Lekcja 2025-12-12 — Technical Issues (Short Session)': 'Lesson 2025-12-12 — Technical Issues (Short Session)',
  'Lekcja 2025-12-15 — TE-form Practice and Activity Chains': 'Lesson 2025-12-15 — TE-form Practice and Activity Chains',
  'Lekcja 2025-12-17 — TE-form Review and Sentence Building': 'Lesson 2025-12-17 — TE-form Review and Sentence Building',
  'Lekcja 2025-12-23 — TE-form: Describing Appearance and Clothing': 'Lesson 2025-12-23 — TE-form: Describing Appearance and Clothing',
  'Lekcja 2026-01-28 — TE-form Review and State Descriptions': 'Lesson 2026-01-28 — TE-form Review and State Descriptions',
  'Lekcja 2026-02-02 — Clothing, Colors and Kanji Numbers': 'Lesson 2026-02-02 — Clothing, Colors and Kanji Numbers',
  'Lekcja 2026-02-04 — Days of the Month, Counters and Body Parts': 'Lesson 2026-02-04 — Days of the Month, Counters and Body Parts',
  'Lekcja 2026-02-09 — Appearance, Weather and Kanji Person': 'Lesson 2026-02-09 — Appearance, Weather and Kanji Person',
  'Lekcja 2026-02-11 — Comparisons, Preferences and Days': 'Lesson 2026-02-11 — Comparisons, Preferences and Days',
};

export function translateLessonTitle(polishTitle: string): string {
  return lessonTitleTranslations[polishTitle] || polishTitle;
}
