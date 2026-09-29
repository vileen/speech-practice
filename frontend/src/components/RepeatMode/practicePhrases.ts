export interface PracticePhrase {
  text: string;
  translation: string;
}

export const PRACTICE_PHRASES: Record<string, PracticePhrase[]> = {
  japanese: [
    { text: 'おはようございます', translation: 'Good morning' },
    { text: 'こんにちは', translation: 'Hello / Good afternoon' },
    { text: 'こんばんは', translation: 'Good evening' },
    { text: 'ありがとうございます', translation: 'Thank you (polite)' },
    { text: 'すみません', translation: 'Excuse me / Sorry' },
    { text: 'お名前は何ですか', translation: 'What is your name?' },
    { text: '私は学生です', translation: 'I am a student' },
    { text: '日本語を勉強しています', translation: 'I am studying Japanese' },
    { text: '今日は寒いです', translation: 'Today is cold' },
    { text: '明日は火曜日です', translation: 'Tomorrow is Tuesday' },
    { text: '犬と猫とどちらの方が好きですか', translation: 'Which do you prefer, dogs or cats?' },
    { text: '寿司とラーメンとどちらがいいですか', translation: 'Which is better, sushi or ramen?' },
    { text: '京都と東京とどちらが好きですか', translation: 'Which do you like more, Kyoto or Tokyo?' },
    { text: 'ポーランドの方がイタリアより好きです', translation: 'I prefer Poland over Italy' },
    { text: 'ラーメンの方がおいしいです', translation: 'Ramen is tastier' },
    { text: '伝統的な町が好きですから', translation: 'Because I like traditional towns' },
  ],
};
