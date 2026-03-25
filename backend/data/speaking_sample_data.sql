-- Sample conversation templates
INSERT INTO conversation_templates (title, scenario, difficulty, turns) VALUES
(
  'Ordering at a Restaurant',
  'restaurant',
  'N5',
  '[
    {"speaker": "waiter", "japanese": "いらっしゃいませ。何名様ですか？", "romaji": "Irasshaimase. Nan-mei-sama desu ka?", "meaning": "Welcome. How many people?"},
    {"speaker": "customer", "japanese": "二人です。", "romaji": "Futari desu.", "meaning": "Two people."},
    {"speaker": "waiter", "japanese": "かしこまりました。こちらへどうぞ。", "romaji": "Kashikomarimashita. Kochira e dōzo.", "meaning": "Understood. This way please."},
    {"speaker": "waiter", "japanese": "ご注文はお決まりですか？", "romaji": "Go-chūmon wa okimari desu ka?", "meaning": "Have you decided on your order?"},
    {"speaker": "customer", "japanese": "ラーメンを一つお願いします。", "romaji": "Rāmen o hitotsu onegai shimasu.", "meaning": "One ramen please."},
    {"speaker": "waiter", "japanese": "かしこまりました。しばらくお待ちください。", "romaji": "Kashikomarimashita. Shibaraku omachi kudasai.", "meaning": "Understood. Please wait a moment."}
  ]'::jsonb
),
(
  'Shopping for Clothes',
  'shopping',
  'N5',
  '[
    {"speaker": "staff", "japanese": "いらっしゃいませ。何かお探しですか？", "romaji": "Irasshaimase. Nanika osagashi desu ka?", "meaning": "Welcome. Are you looking for something?"},
    {"speaker": "customer", "japanese": "Tシャツを探しています。", "romaji": "T-shatsu o sagashite imasu.", "meaning": "I am looking for a T-shirt."},
    {"speaker": "staff", "japanese": "こちらにあります。サイズはいくつですか？", "romaji": "Kochira ni arimasu. Saizu wa ikutsu desu ka?", "meaning": "They are over here. What size?"},
    {"speaker": "customer", "japanese": "Mサイズをお願いします。", "romaji": "Emu-saizu o onegai shimasu.", "meaning": "M size please."},
    {"speaker": "customer", "japanese": "これはいくらですか？", "romaji": "Kore wa ikura desu ka?", "meaning": "How much is this?"},
    {"speaker": "staff", "japanese": "二千円です。試着室はあちらです。", "romaji": "Ni-sen en desu. Shichakushitsu wa achira desu.", "meaning": "It is 2000 yen. The fitting room is over there."}
  ]'::jsonb
),
(
  'Self Introduction',
  'greetings',
  'N5',
  '[
    {"speaker": "self", "japanese": "はじめまして。私は田中です。", "romaji": "Hajimemashite. Watashi wa Tanaka desu.", "meaning": "Nice to meet you. I am Tanaka."},
    {"speaker": "other", "japanese": "はじめまして。私はスミスです。どうぞよろしく。", "romaji": "Hajimemashite. Watashi wa Sumisu desu. Dōzo yoroshiku.", "meaning": "Nice to meet you. I am Smith. Please treat me well."},
    {"speaker": "self", "japanese": "アメリカから来ました。日本語を勉強しています。", "romaji": "Amerika kara kimashita. Nihongo o benkyō shite imasu.", "meaning": "I came from America. I am studying Japanese."},
    {"speaker": "other", "japanese": "そうですか。日本語が上手ですね。", "romaji": "Sō desu ka. Nihongo ga jōzu desu ne.", "meaning": "Is that so? Your Japanese is good."},
    {"speaker": "self", "japanese": "いいえ、まだまだです。", "romaji": "Iie, mada mada desu.", "meaning": "No, not yet. (I still have a long way to go.)"},
    {"speaker": "other", "japanese": "頑張ってください。", "romaji": "Ganbatte kudasai.", "meaning": "Please do your best."}
  ]'::jsonb
);

-- Sample shadowing exercises
INSERT INTO shadowing_exercises (title, audio_url, japanese_text, level, duration_seconds) VALUES
(
  'Daily Greeting',
  'https://example.com/audio/greeting.mp3',
  'おはようございます。今日も良い天気ですね。元気にいきましょう。',
  'N5',
  8
),
(
  'At the Station',
  'https://example.com/audio/station.mp3',
  '次は東京です。お出口は左側です。お忘れ物のないようにお気をつけください。',
  'N4',
  10
),
(
  'Restaurant Order',
  'https://example.com/audio/order.mp3',
  'すみません、注文をお願いします。焼き魚定食とお茶を一つください。',
  'N5',
  9
);

-- Sample response drills
INSERT INTO response_drills (cue_text, suggested_response, time_limit_seconds, difficulty, category) VALUES
(
  'A friend says "おはようございます" (Good morning). How do you respond?',
  'おはようございます。',
  10,
  'N5',
  'greetings'
),
(
  'A shop staff asks "何名様ですか？" (How many people?). You are alone. Respond.',
  '一名です。 / 一人です。',
  15,
  'N5',
  'restaurant'
),
(
  'Someone asks "お名前は何ですか？" (What is your name?). Respond with your name.',
  '（名前）です。どうぞよろしく。',
  15,
  'N5',
  'introduction'
),
(
  'You want to order coffee. What do you say to the waiter?',
  'コーヒーを一つお願いします。',
  15,
  'N5',
  'restaurant'
),
(
  'Someone compliments your Japanese: "日本語が上手ですね。" How do you respond humbly?',
  'いいえ、まだまだです。',
  10,
  'N5',
  'conversation'
);
