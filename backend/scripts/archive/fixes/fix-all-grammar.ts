import { pool } from '../src/db/pool.js';

const GRAMMAR_FIXES: Record<string, any> = {
  // LESSON 1: Hiragana + Adjectives
  '2025-10-16': {
    grammar: [
      {
        pattern: 'い-adjectives',
        explanation: 'Adjectives ending in い. Used to describe nouns directly before them (without の).',
        examples: [
          { jp: '高い山', en: 'tall mountain' },
          { jp: '安い本', en: 'cheap book' },
          { jp: 'おいしい寿司', en: 'delicious sushi' }
        ]
      },
      {
        pattern: 'な-adjectives',
        explanation: 'Adjectives ending in な when before nouns. Require な to connect to nouns.',
        examples: [
          { jp: 'きれいな花', en: 'beautiful flower' },
          { jp: '元気な子供', en: 'energetic child' },
          { jp: '静かな部屋', en: 'quiet room' }
        ]
      },
      {
        pattern: '〜です (polite)',
        explanation: 'Polite form for both い and な adjectives. For い-adjectives, add です directly. For な-adjectives, add です directly.',
        examples: [
          { jp: '高いです', en: 'It is tall/expensive' },
          { jp: 'きれいです', en: 'It is beautiful' }
        ]
      }
    ]
  },
  
  // LESSON 2: Katakana + Verbs
  '2025-10-27': {
    grammar: [
      {
        pattern: '〜を〜ます',
        explanation: 'Object marker を with polite verb form. Pattern: [object]を[verb stem] + ます.',
        examples: [
          { jp: '本を読みます', en: 'I read a book' },
          { jp: '映画を見ます', en: 'I watch a movie' },
          { jp: '音楽を聞きます', en: 'I listen to music' }
        ]
      },
      {
        pattern: 'を (object marker)',
        explanation: 'Particle marking the direct object of a verb - the thing being acted upon.',
        examples: [
          { jp: '寿司を食べます', en: 'I eat sushi' },
          { jp: '日本語を勉強します', en: 'I study Japanese' }
        ]
      }
    ]
  },
  
  // LESSON 3: Adjectives + Preferences
  '2025-10-29': {
    grammar: [
      {
        pattern: '〜が好きです',
        explanation: '"I like ~". Pattern: [thing]が好きです. Uses が to mark the thing liked.',
        examples: [
          { jp: '猫が好きです', en: 'I like cats' },
          { jp: '日本料理が好きです', en: 'I like Japanese food' }
        ]
      },
      {
        pattern: '〜が嫌いです',
        explanation: '"I dislike ~". Pattern: [thing]が嫌いです.',
        examples: [
          { jp: '雨が嫌いです', en: 'I dislike rain' },
          { jp: '早起きが嫌いです', en: 'I dislike waking up early' }
        ]
      },
      {
        pattern: 'どちらが好きですか',
        explanation: '"Which one do you like/prefer?" Used when choosing between two options.',
        examples: [
          { jp: '犬と猫と、どちらが好きですか？', en: 'Between dogs and cats, which do you prefer?' }
        ]
      }
    ]
  },
  
  // LESSON 4: Particles + Plain Form
  '2025-11-12': {
    grammar: [
      {
        pattern: 'Plain form (dictionary form)',
        explanation: 'The casual/dictionary form of verbs and adjectives. Used in informal speech and before certain grammar patterns.',
        examples: [
          { jp: '食べる (polite: 食べます)', en: 'to eat' },
          { jp: '高い (polite: 高いです)', en: 'is expensive/tall' },
          { jp: '静かだ (polite: 静かです)', en: 'is quiet' }
        ]
      },
      {
        pattern: '〜から (because)',
        explanation: 'Gives a reason. Pattern: [reason]から、[result]. Can end a sentence with just から.',
        examples: [
          { jp: 'お腹が空いたから、食べます', en: 'Because I am hungry, I will eat' },
          { jp: '寒いですから、コートを着ます', en: 'Because it is cold, I wear a coat' }
        ]
      },
      {
        pattern: '〜けど (but/however)',
        explanation: 'Casual "but". Used to contrast two statements. More casual than が.',
        examples: [
          { jp: '高いけど、買います', en: 'It is expensive, but I will buy it' },
          { jp: '好きだけど、食べない', en: 'I like it, but I will not eat it' }
        ]
      }
    ]
  },
  
  // LESSON 5: Frequency Adverbs
  '2025-12-01': {
    grammar: [
      {
        pattern: 'いつも (always)',
        explanation: 'Frequency adverb meaning "always". Placed before the verb.',
        examples: [
          { jp: 'いつも朝ご飯を食べます', en: 'I always eat breakfast' },
          { jp: 'いつも電車で行きます', en: 'I always go by train' }
        ]
      },
      {
        pattern: 'よく (often)',
        explanation: 'Frequency adverb meaning "often". Placed before the verb.',
        examples: [
          { jp: 'よく映画を見ます', en: 'I often watch movies' },
          { jp: 'よく公園を散歩します', en: 'I often walk in the park' }
        ]
      },
      {
        pattern: 'たまに (occasionally)',
        explanation: 'Frequency adverb meaning "occasionally/sometimes".',
        examples: [
          { jp: 'たまに外食します', en: 'I occasionally eat out' },
          { jp: 'たまに実家に帰ります', en: 'I occasionally go back to my parents\' house' }
        ]
      },
      {
        pattern: 'あまり〜ません (not much)',
        explanation: '"Not often/not much". Pattern: あまり[negative verb]. Always used with negative form.',
        examples: [
          { jp: 'あまり肉を食べません', en: 'I do not eat meat much' },
          { jp: 'あまりテレビを見ません', en: 'I do not watch TV much' }
        ]
      },
      {
        pattern: '〜ませんか (suggestion)',
        explanation: '"Shall we ~?" / "Won\'t you ~?" Used to make polite suggestions.',
        examples: [
          { jp: '一緒に映画を見ませんか？', en: 'Shall we watch a movie together?' },
          { jp: 'コーヒーを飲みませんか？', en: 'Shall we have coffee?' }
        ]
      }
    ]
  },
  
  // LESSON 6: Existence Verbs
  '2025-12-03': {
    grammar: [
      {
        pattern: 'あります (inanimate existence)',
        explanation: '"There is/are" for inanimate objects (things, places). Also means "to have".',
        examples: [
          { jp: '机の上に本があります', en: 'There is a book on the desk' },
          { jp: '銀行の近くに公園があります', en: 'There is a park near the bank' }
        ]
      },
      {
        pattern: 'います (animate existence)',
        explanation: '"There is/are" for animate things (people, animals). Also means "to have" (for people/animals).',
        examples: [
          { jp: '部屋に猫がいます', en: 'There is a cat in the room' },
          { jp: '日本に友達がいます', en: 'I have a friend in Japan' }
        ]
      },
      {
        pattern: '〜に (location marker)',
        explanation: 'Particle に marks the location where something exists (with あります/います).',
        examples: [
          { jp: '東京にあります', en: 'It is in Tokyo' },
          { jp: '学校にいます', en: 'I am at school' }
        ]
      }
    ]
  },
  
  // LESSON 7: Location Words
  '2025-12-10': {
    grammar: [
      {
        pattern: '〜の上に (on top of)',
        explanation: '"On top of ~". Pattern: [thing]の上に.',
        examples: [
          { jp: '机の上に本があります', en: 'There is a book on the desk' },
          { jp: 'ベッドの上に猫がいます', en: 'There is a cat on the bed' }
        ]
      },
      {
        pattern: '〜の下に (under/below)',
        explanation: '"Under/below ~". Pattern: [thing]の下に.',
        examples: [
          { jp: '机の下に靴があります', en: 'There are shoes under the desk' },
          { jp: '椅子の下に猫がいます', en: 'There is a cat under the chair' }
        ]
      },
      {
        pattern: '〜の中に (inside)',
        explanation: '"Inside ~". Pattern: [thing]の中に.',
        examples: [
          { jp: '箱の中にプレゼントがあります', en: 'There is a present inside the box' },
          { jp: '部屋の中に人がいます', en: 'There are people inside the room' }
        ]
      },
      {
        pattern: '〜の隣に (next to)',
        explanation: '"Next to/beside ~". Pattern: [thing]の隣に.',
        examples: [
          { jp: '銀行の隣に本屋があります', en: 'There is a bookstore next to the bank' },
          { jp: '私の隣に座ってください', en: 'Please sit next to me' }
        ]
      },
      {
        pattern: '〜の近くに (near)',
        explanation: '"Near ~". Pattern: [thing]の近くに.',
        examples: [
          { jp: '駅の近くにレストランがあります', en: 'There is a restaurant near the station' },
          { jp: '学校の近くに住んでいます', en: 'I live near the school' }
        ]
      }
    ]
  },
  
  // LESSON 8: TE-form + Appearance
  '2025-12-23': {
    grammar: [
      {
        pattern: '〜ています (ongoing state)',
        explanation: 'Describes an ongoing state or current appearance. TE-form + います.',
        examples: [
          { jp: '赤いセーターを着ています', en: 'I am wearing a red sweater' },
          { jp: '眼鏡をかけています', en: 'I am wearing glasses' }
        ]
      },
      {
        pattern: '〜ています (resultant state)',
        explanation: 'Describes a state that resulted from a past action and continues.',
        examples: [
          { jp: '窓が開いています', en: 'The window is open (has been opened)' },
          { jp: '電気がついています', en: 'The light is on' }
        ]
      },
      {
        pattern: '〜を着ています (wearing ~)',
        explanation: 'TE-form of 着る (to wear) + います. Describes what someone is wearing.',
        examples: [
          { jp: 'Tシャツを着ています', en: 'I am wearing a T-shirt' },
          { jp: '黒い靴をはいています', en: 'I am wearing black shoes' }
        ]
      }
    ]
  },
  
  // LESSON 9: TE-form + State Descriptions
  '2026-01-28': {
    grammar: [
      {
        pattern: '〜てあります (deliberate state)',
        explanation: 'Describes a state that was deliberately created and remains. Used with transitive verbs.',
        examples: [
          { jp: '窓が開けてあります', en: 'The window has been left open (on purpose)' },
          { jp: '黒板に字が書いてあります', en: 'There is writing on the blackboard (someone wrote it)' }
        ]
      },
      {
        pattern: '〜ておきます (preparation)',
        explanation: '"Do something in advance/preparation". TE-form + おきます.',
        examples: [
          { jp: '事前に予約しておきます', en: 'I will make a reservation in advance' },
          { jp: 'メモしておきます', en: 'I will make a note (for later)' }
        ]
      },
      {
        pattern: '〜ている vs 〜てある',
        explanation: 'ている = naturally occurring state. てある = deliberately created state.',
        examples: [
          { jp: 'ドアが開いている (naturally)', en: 'The door is open' },
          { jp: 'ドアが開けてある (deliberately)', en: 'The door has been left open (by someone)' }
        ]
      }
    ]
  },
  
  // LESSON 10: Appearance + Weather (USER'S COMPLAINT)
  '2026-02-09': {
    grammar: [
      {
        pattern: '〜そうです (appearance/hearsay)',
        explanation: '"Looks like ~" / "I heard that ~". Attach to stem of い-adjective or な-adjective.',
        examples: [
          { jp: 'おいしそうです', en: 'It looks delicious' },
          { jp: '元気そうです', en: 'You look well/healthy' },
          { jp: '雨が降りそうです', en: 'It looks like rain' }
        ]
      },
      {
        pattern: '〜が〜 (physical features)',
        explanation: 'Using が to describe body parts and physical features.',
        examples: [
          { jp: '背が高いです', en: 'I am tall (height is high)' },
          { jp: '髪が長いです', en: 'My hair is long' },
          { jp: '目が大きいです', en: 'My eyes are big' }
        ]
      },
      {
        pattern: '天気 (weather)',
        explanation: 'Common weather expressions using 〜です.',
        examples: [
          { jp: '今日は晴れです', en: 'Today is sunny' },
          { jp: '明日は雨です', en: 'Tomorrow is rainy' },
          { jp: '昨日は曇りでした', en: 'Yesterday was cloudy' }
        ]
      },
      {
        pattern: '〜人 (nationality/person)',
        explanation: 'Suffix for nationality or type of person.',
        examples: [
          { jp: '日本人です', en: 'I am Japanese' },
          { jp: 'アメリカ人です', en: 'I am American' },
          { jp: '会社員です', en: 'I am a company employee' }
        ]
      }
    ]
  },
  
  // LESSON 11: Comparisons + Days of Week
  '2026-02-11': {
    grammar: [
      {
        pattern: '〜の中で〜が一番〜',
        explanation: '"Among ~, ~ is the most ~". Pattern: [group]の中で[topic]が一番[adjective].',
        examples: [
          { jp: '季節の中で、夏が一番好きです', en: 'Among seasons, I like summer the most' },
          { jp: '曜日の中で、金曜日が一番好きです', en: 'Among days of the week, I like Friday the most' }
        ]
      },
      {
        pattern: '〜より〜の方が〜',
        explanation: '"A is more ~ than B". Pattern: [B]より[A]の方が[adjective].',
        examples: [
          { jp: '月曜日より金曜日の方が好きです', en: 'I like Friday more than Monday' },
          { jp: '冬より夏の方が好きです', en: 'I like summer more than winter' }
        ]
      },
      {
        pattern: '〜が一番〜です',
        explanation: '"~ is the most ~". Used for superlatives within a known group.',
        examples: [
          { jp: '日本料理の中で、寿司が一番好きです', en: 'Among Japanese food, I like sushi the most' },
          { jp: '週末の中で、土曜日が一番好きです', en: 'Among weekends, I like Saturday the most' }
        ]
      }
    ]
  }
};

async function applyGrammarFixes() {
  console.log('Applying grammar fixes to all problematic lessons...\n');
  
  let fixed = 0;
  let failed = 0;
  
  for (const [lessonId, data] of Object.entries(GRAMMAR_FIXES)) {
    const result = await pool.query(
      'UPDATE lessons SET grammar = $1::jsonb WHERE id = $2 RETURNING id, title',
      [JSON.stringify(data.grammar), lessonId]
    );
    
    if (result.rowCount && result.rowCount > 0) {
      console.log(`✅ ${lessonId}: ${result.rows[0].title.substring(0, 50)}`);
      console.log(`   Updated with ${data.grammar.length} grammar patterns`);
      fixed++;
    } else {
      console.log(`❌ ${lessonId}: Not found`);
      failed++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Fixed: ${fixed} lessons`);
  console.log(`Failed: ${failed} lessons`);
  console.log(`========================================`);
  
  await pool.end();
}

applyGrammarFixes().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
