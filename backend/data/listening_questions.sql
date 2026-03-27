-- Seed data for listening_passages
-- Note: Audio URLs are placeholders - replace with actual audio file URLs

-- N5 Level - Daily Life Conversation
INSERT INTO listening_passages (title, level, audio_url, transcript, japanese_text, duration_seconds, difficulty_speed, topic_category) VALUES
(
  'At the Convenience Store',
  'N5',
  '/audio/n5_convenience_store.mp3',
  'A: Irasshaimase! B: Sumimasen, kore wa ikura desu ka? A: Hai, 150 en desu. B: Jaa, kore mo onegaishimasu. A: Kashikomarimashita. Zeikomi de 320 en ni narimasu. B: Hai, douzo. A: Arigatou gozaimasu. 320 en no otsuri desu. B: Arigatou gozaimasu.',
  'A: いらっしゃいませ！ B: すみません、これはいくらですか？ A: はい、150円です。 B: じゃあ、これもお願いします。 A: かしこまりました。税込みで320円になります。 B: はい、どうぞ。 A: ありがとうございます。320円のお釣りです。 B: ありがとうございます。',
  45,
  'normal',
  'Shopping'
);

-- N5 Level - Travel
INSERT INTO listening_passages (title, level, audio_url, transcript, japanese_text, duration_seconds, difficulty_speed, topic_category) VALUES
(
  'Asking for Directions',
  'N5',
  '/audio/n5_directions.mp3',
  'A: Sumimasen, eki wa doko desu ka? B: Eki desu ka? Koko kara massugu itte, hidari ni magatte kudasai. A: Massugu itte, hidari desu ne? B: Hai, sou desu. Tochuu ni ookii depaato ga arimasu. Sono mae desu. A: Wakarimashita. Arigatou gozaimasu! B: Iitte kimochi desu.',
  'A: すみません、駅はどこですか？ B: 駅ですか？ここからまっすぐ行って、左に曲がってください。 A: まっすぐ行って、左ですね？ B: はい、そうです。途中に大きいデパートがあります。その前です。 A: わかりました。ありがとうございます！ B: いってらっしゃい。',
  52,
  'normal',
  'Travel'
);

-- N5 Level - Restaurant
INSERT INTO listening_passages (title, level, audio_url, transcript, japanese_text, duration_seconds, difficulty_speed, topic_category) VALUES
(
  'Ordering at a Restaurant',
  'N5',
  '/audio/n5_restaurant.mp3',
  'A: Irasshaimase. Nan mei sama desu ka? B: Hitori desu. A: Douzo, kochira e. B: Arigatou gozaimasu. A: Oomori ni saremasu ka? B: Iie, futsuu de ii desu. A: Kashikomarimashita. Onomimono wa? B: Mizu wo onegaishimasu. A: Hai, shouchi shimashita.',
  'A: いらっしゃいませ。何名様ですか？ B: 一人です。 A: どうぞ、こちらへ。 B: ありがとうございます。 A: 大盛りにされますか？ B: いいえ、普通でいいです。 A: かしこまりました。お飲み物は？ B: 水をお願いします。 A: はい、承知しました。',
  48,
  'slow',
  'Daily Life'
);

-- N4 Level - Weather and Plans
INSERT INTO listening_passages (title, level, audio_url, transcript, japanese_text, duration_seconds, difficulty_speed, topic_category) VALUES
(
  'Weekend Plans',
  'N4',
  '/audio/n4_weekend_plans.mp3',
  'A: Kondo no shuumatsu, nani wo suru tsumori desu ka? B: Tenki yokattara, kouen ni ikou to omotteimasu. A: Ii desu ne. Dare to ikimasu ka? B: Tomodachi to ikou to omotteimasu ga, mada kimete imasen. A: Watashi mo ittara ii desu ka? B: Mochiron desu! Issho ni ikimashou. A: Tanoshimi ni shiteimasu!',
  'A: 今度の週末、何をするつもりですか？ B: 天気よかったら、公園に行こうと思っています。 A: いいですね。誰と行きますか？ B: 友達と行こうと思っていますが、まだ決めていません。 A: 私も行ったらいいですか？ B: もちろんです！一緒に行きましょう。 A: 楽しみにしています！',
  58,
  'normal',
  'Daily Life'
);

-- N4 Level - Shopping with Problems
INSERT INTO listening_passages (title, level, audio_url, transcript, japanese_text, duration_seconds, difficulty_speed, topic_category) VALUES
(
  'Returning an Item',
  'N4',
  '/audio/n4_return_item.mp3',
  'A: Sumimasen, kono shatsu wo kaeshitai n desu ga. B: Hai, nanika mondai ga arimashita ka? A: Hai, saizu ga chotto chiisakute, kiru no ga muzukashii n desu. B: Wakarimashita. Receipt wa omochi desu ka? A: Hai, koko ni arimasu. B: Arigatou gozaimasu. Okane no henkin ni narimasu ga, yoroshii deshou ka? A: Hai, onegaishimasu.',
  'A: すみません、このシャツを返したいんですが。 B: はい、何か問題がありましたか？ A: はい、サイズがちょっと小さくて、着るのが難しいんです。 B: わかりました。レシートはお持ちですか？ A: はい、ここにあります。 B: ありがとうございます。お金の返金になりますが、よろしいでしょうか？ A: はい、お願いします。',
  65,
  'normal',
  'Shopping'
);

-- Get the IDs of inserted passages and add questions
-- Note: In production, you would use RETURNING id or known IDs
