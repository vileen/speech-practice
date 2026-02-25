# Japanese Data Quality Audit - Complete Findings

## Summary
- **Total Lessons:** 26
- **Lessons with Corrupted Practice Phrases:** 18
- **Total Corrupted Phrases:** ~744
- **False Positives from Scan Script:** ~45 ("roku" is valid Japanese for "six", "this" in "This is a book" is valid, etc.)

## User-Reported Issues - VERIFICATION RESULTS

### Issue 1: 安い showing やすい as furigana
- **Status:** ✅ CORRECT - Not an error
- **Lesson:** 2026-02-19
- **Current Data:** jp: "安い", reading: "やすい"
- **Verification:** 安い is correctly read as やすい (yasui = cheap)
- **User Confusion:** User may have expected different field ordering

### Issue 2: 美味しい showing おいしい as furigana
- **Status:** ✅ CORRECT - Not an error
- **Lesson:** 2026-02-19
- **Current Data:** jp: "美味しい", reading: "おいしい"
- **Verification:** 美味しい is correctly read as おいしい (oishii = delicious)

## REAL DATA CORRUPTION FOUND

### Category 1: Polish Text in Practice Phrases (18 lessons affected)

**Lessons with Polish contamination:**
1. 2025-10-01 - 63 phrases (Polish: "po prostu", "dzia naj", "albo", "zamiast", "Krakow", "Dokładno")
2. 2025-10-08 - 55 phrases (Polish: "na przykład", "albo naka", "przy jedzeniu", "Jesteśmy japońskimi uczniami")
3. 2025-10-15 - 37 phrases (Polish: "ad shio", "albo naka", "no ja nai", "amerykajin")
4. 2025-10-20 - 71 phrases (Polish: "czy I", "na przykład", "Ile to kosztuje?", "Tutaj jest policja")
5. 2025-10-22 - 11 phrases (Polish: "na przykład", "bo na przykład", "Kim ty jesteś?")
6. 2025-10-27 - 135 phrases (Polish: "po prostu", "albo teone time", "Dzisiaj mam fajny day", "Pamiętamy?")
7. 2025-11-03 - 100 phrases (Polish: "na przykład", "no i", "na przykład", "Dlaczego?")
8. 2025-11-12 - 29 phrases (Polish: "o kupowa", "tnę włosy", "dokładno yes", "robić")
9. 2025-12-10 - 17 phrases (Polish: "Czyli", "Zaczynajmy", "Tutaj mamy")
10. 2025-12-17 - 18 phrases (Polish: "Czyli", "życzenia", "Po lewej strono")
11. 2025-12-23 - 4 phrases (Polish: "na przykład", "prawda")
12. 2026-01-28 - 24 phrases (Polish: "Czyli", "na przykład", "Tajhen", "Patrycja")
13. 2026-02-02 - 20 phrases (Polish: "na przykład", "O", "na przykład", "na przykład")
14. 2026-02-04 - 19 phrases (Polish: "na przykład", "na przykład", "Można i yes")
15. 2026-02-09 - 77 phrases (Polish: "na przykład", "na przykład", "na przykład")
16. 2026-02-11 - 29 phrases (Polish: "na przykład", "na przykład", "na przykład")
17. 2026-02-16 - 54 phrases (Polish: "na przykład", "na przykład", "na przykład")
18. 2026-02-19 - 23 phrases (Polish: "na przykład", "na przykład", "na przykład")

### Category 2: Garbled/Gibberish Text in Practice Phrases

**Examples of garbled text:**
- "dzia naj desu" (should be "じゃないです")
- "ad shio" (should be "お塩" or similar)
- "ad patrycja" (garbled)
- "deweropa" (garbled)
- "yszy" (garbled)
- "Kyoro san" (should be "Kyouko san" or similar)
- "Pchim kara" (garbled city name)
- "Czokoleto" (should be "chocolate")
- "Czekoreto" (should be "chocolate")
- "kalpisu" (should be "Calpis")
- "dziugio" (garbled)
- "chiu goku" (should be "chuugoku" - China)
- "ingilizy" (garbled)
- "Polandzin" (should be "Porandojin")
- "teone time" (garbled "one time")
- "Igeri" (should be "Igirisu" - England/UK)

### Category 3: Grammar Explanation Issues

**Lesson 2025-11-12:**
- Pattern: "ga"
- Current: " z iru."
- Should be: "Subject particle - marks the grammatical subject"

### Category 4: Vocabulary with Garbled Readings

**Lesson 2026-01-28:**
- "junbi" (preparation) - EN field contains "rat" fragment (false positive)

## Specific Inventory of Issues by Lesson

### Lesson 2025-10-01 (63 phrases)
**Polish words found:**
- "po prostu" (just/simply)
- "dzia naj" (garbled "じゃない")
- "albo" (or)
- "zamiast" (instead of)
- "Dokładno" (exactly)
- "Krakow" (city name in Polish)
- "Pchim" (garbled city)
- "Kyoro" (garbled name)
- "tabako" (should be "tobacco")
- "Buta san" (garbled)
- "Jagieron" (garbled university name)
- "Porando" (should be "Poland")
- "Patrycja" (name in Polish)
- "Sensei jest troszkę" (Teacher is a little bit)
- "deweropa" (garbled)
- "patrycja sensei" (Polish name)

### Lesson 2025-10-08 (55 phrases)
**Polish words found:**
- "na przykład" (for example) - 3 times
- "ad" (garbled)
- "albo" (or) - 2 times
- "przy jedzeniu" (while eating)
- "Jesteśmy japońskimi uczniami" (We are Japanese students)
- "na przykład" in Japanese: "przy jedzeniu"

### Lesson 2025-10-15 (37 phrases)
**Polish words found:**
- "na przykład" (for example)
- "no" (garbled particle)
- "ja nai" (garbled "じゃない")
- "albo" (or)
- "amerykajin" (garbled "Amerikajin")
- "przy" (at/by)

### Lesson 2025-10-20 (71 phrases)
**Polish words found:**
- "czy" (whether/if)
- "na przykład" (for example) - 3 times
- "Ile to kosztuje?" (How much does it cost?)
- "Tutaj jest policja" (Here is the police)
- "bardzo" (very)
- "na przykład" - multiple

### Lesson 2025-10-27 (135 phrases)
**Polish words found:**
- "po prostu" (just/simply) - 2 times
- "albo" (or) - multiple
- "teone time" (garbled "one time")
- "Dzisiaj mam fajny day" (Today I have a nice day)
- "Pamiętamy?" (Do we remember?)
- "też będzie ok" (will also be ok)
- "może być" (can be)
- "prawda?" (right?)

### Lesson 2025-11-03 (100 phrases)
**Polish words found:**
- "na przykład" (for example) - multiple
- "no" (garbled particle)
- "Dlaczego?" (Why?)
- "czyli" (that is)

### Lesson 2025-11-12 (29 phrases)
**Polish words found:**
- "o kupowa" (garbled)
- "tnę włosy" (I cut hair)
- "ścinam włosem" (I cut hair)
- "dokładno yes" (exactly yes)
- "robić" (to do)
- "ubierać kimono" (to wear kimono)

### Lesson 2025-12-01 (37 phrases)
**Polish words found:**
- Table markdown artifacts: "|", "---"
- Polish notes mixed throughout
- "na przykład" (for example)
- "więc" (so)

### Lesson 2025-12-10 (17 phrases)
**Polish words found:**
- Extensive Polish explanations mixed with Japanese
- "Czyli" (That is)
- "Tutaj mamy" (Here we have)

### Lesson 2025-12-17 (18 phrases)
**Polish words found:**
- "Czyli" (That is)
- "życzenia" (wishes)
- "Po lewej strono" (On the left side)
- "Po prawej strono" (On the right side)

### Lesson 2025-12-23 (4 phrases)
**Polish words found:**
- "na przykład" (for example)
- "prawda?" (right?)

### Lesson 2026-01-28 (24 phrases)
**Polish words found:**
- "Czyli" (That is) - multiple
- "na przykład" (for example) - multiple
- "Tajhen" (garbled)
- "Patrycja" (Polish name)
- "Kołdżoł" (garbled "college")

### Lesson 2026-02-02 (20 phrases)
**Polish words found:**
- "na przykład" (for example) - multiple
- "O" (Oh)
- "na przykład" - multiple

### Lesson 2026-02-04 (19 phrases)
**Polish words found:**
- "na przykład" (for example) - multiple
- "Można i yes" (One can and yes)

### Lesson 2026-02-09 (77 phrases)
**Polish words found:**
- "na przykład" (for example) - multiple
- Extensive Polish text throughout

### Lesson 2026-02-11 (29 phrases)
**Polish words found:**
- "na przykład" (for example) - multiple
- "albo" (or)
- "czyli" (that is)
- "ra" (garbled)

### Lesson 2026-02-16 (54 phrases)
**Polish words found:**
- "na przykład" (for example) - multiple
- "czyli" (that is)
- "czy" (whether/if)

### Lesson 2026-02-19 (23 phrases)
**Polish words found:**
- "na przykład" (for example) - multiple
- "czyli" (that is)
- "Najpięknojsze" (most beautiful - incorrect Polish)

## Recommendations

1. **Delete corrupted practice_phrases** - The practice phrases in the 18 affected lessons are too corrupted to salvage
2. **Keep vocabulary and grammar** - These sections are mostly intact
3. **Fix the one grammar explanation** in 2025-11-12
4. **Add data validation** to prevent future Polish contamination
5. **Re-import clean practice phrases** from original source if available
