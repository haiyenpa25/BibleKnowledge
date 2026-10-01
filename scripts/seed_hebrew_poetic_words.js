/**
 * seed_hebrew_poetic_words.js
 * Ingest iconic Old Testament Poetic & Wisdom Hebrew Lexicon entries into Postgres strong_lexicon table.
 * Adheres to ROADMAP1.md §14, §49 and docs/ROADMAP.md "Extended Hebrew grammatical parsing".
 */

const { execSync } = require('child_process');

const HEBREW_POETIC_WORDS = [
  {
    id: "H1984",
    strong_number: "H1984",
    language: "hebrew",
    lemma: "הָלַל",
    transliteration: "halal",
    pronunciation: "haw-lal'",
    part_of_speech: "Verb",
    definition: "Ca ngợi, ngợi khen, tán dương, chiếu sáng rực rỡ, khoe khoang trong Đức Giê-hô-va (căn nguyên của Ha-lê-lu-gia).",
    theological_significance: "Chủ đề trung tâm của toàn bộ sách Thi Thiên (Tehillim). Sự ca ngợi là phản ứng tự nhiên và bổn phận giao ước của tạo vật đối với sự vĩ đại và nhân từ của Đức Chúa Trời.",
    occurrences_count: 165,
    key_verses: JSON.stringify(["Thi-thiên 150:6", "Thi-thiên 113:1", "Thi-thiên 148:1", "Châm-ngôn 27:2"])
  },
  {
    id: "H2451",
    strong_number: "H2451",
    language: "hebrew",
    lemma: "חָכְמָה",
    transliteration: "chokmah",
    pronunciation: "khok-maw'",
    part_of_speech: "Noun Feminine",
    definition: "Sự khôn ngoan, sáng suốt đạo đức, kỹ năng sống đẹp lòng Đức Chúa Trời theo quy luật sáng tạo và luật pháp.",
    theological_significance: "Trụ cột của Văn chương Khôn ngoan (Châm Ngôn, Gióp, Truyền Đạo). Sự khôn ngoan đến từ Đức Chúa Trời, được nhân cách hóa trong Châm Ngôn 8 và ứng nghiệm trọn vẹn nơi Đức Chúa Jêsus Christ.",
    occurrences_count: 153,
    key_verses: JSON.stringify(["Châm-ngôn 1:7", "Châm-ngôn 9:10", "Gióp 28:28", "Thi-thiên 111:10"])
  },
  {
    id: "H3374",
    strong_number: "H3374",
    language: "hebrew",
    lemma: "יִרְאָה",
    transliteration: "yirah",
    pronunciation: "yir-aw'",
    part_of_speech: "Noun Feminine",
    definition: "Sự kính sợ, tôn kính sâu nhiệm, kính ngưỡng tôn thờ Đấng Thánh Khiết Tối Cao.",
    theological_significance: "Nền tảng của đạo đức và sự thông sáng thật trong Cựu Ước: 'Kính sợ Đức Giê-hô-va, ấy là khởi đầu sự khôn ngoan' (Châm Ngôn 1:7).",
    occurrences_count: 45,
    key_verses: JSON.stringify(["Châm-ngôn 1:7", "Thi-thiên 19:9", "Thi-thiên 34:11", "Gióp 28:28"])
  },
  {
    id: "H0835",
    strong_number: "H0835",
    language: "hebrew",
    lemma: "אַשְׁרֵי",
    transliteration: "ashrei",
    pronunciation: "ash-ray'",
    part_of_speech: "Noun Masculine Plural",
    definition: "Phước thay, hạnh phúc trọn vẹn, trạng thái được Đức Chúa Trời ban phước và chuẩn nhận.",
    theological_significance: "Từ mở đầu sách Thi Thiên (Thi Thiên 1:1) và Bài giảng trên núi của Đấng Christ (Các Phước Lành / Beatitudes), diễn tả sự an lạc của người gắn bó với Lời Chúa.",
    occurrences_count: 45,
    key_verses: JSON.stringify(["Thi-thiên 1:1", "Thi-thiên 32:1", "Thi-thiên 84:4", "Châm-ngôn 3:13"])
  },
  {
    id: "H7462",
    strong_number: "H7462",
    language: "hebrew",
    lemma: "רָעָה",
    transliteration: "raah",
    pronunciation: "raw-aw'",
    part_of_speech: "Verb",
    definition: "Chăn dắt, chăn bầy, nuôi nấng, bảo vệ, đồng hành như người chăn hiền lành.",
    theological_significance: "Hình ảnh người chăn gắn liền với Đức Giê-hô-va và Vua lý tưởng của Israel; tiên tri về Đấng Mê-si là Đấng Chăn Chiên Lớn (Thi Thiên 23:1, Ê-xê-chi-ên 34, Giăng 10).",
    occurrences_count: 173,
    key_verses: JSON.stringify(["Thi-thiên 23:1", "Thi-thiên 80:1", "Sáng-thế Ký 48:15", "Ê-sai 40:11"])
  },
  {
    id: "H0982",
    strong_number: "H0982",
    language: "hebrew",
    lemma: "בָּטַח",
    transliteration: "batach",
    pronunciation: "baw-takh'",
    part_of_speech: "Verb",
    definition: "Tin cậy, nương tựa vững vàng, an lòng không sợ hãi nơi Đấng Thành Tín.",
    theological_significance: "Thái độ đức tin cốt lõi trong Thi Thiên và Châm Ngôn: giao thác trọn vẹn cuộc đời cho Chúa thay vì nương cậy loài người hay vật chất.",
    occurrences_count: 120,
    key_verses: JSON.stringify(["Châm-ngôn 3:5", "Thi-thiên 56:3", "Thi-thiên 91:2", "Ê-sai 26:3"])
  },
  {
    id: "H6666",
    strong_number: "H6666",
    language: "hebrew",
    lemma: "צְדָקָה",
    transliteration: "tzedakah",
    pronunciation: "tsed-aw-kaw'",
    part_of_speech: "Noun Feminine",
    definition: "Sự công bình, ngay thẳng, lối sống công chính theo giao ước của Đức Chúa Trời.",
    theological_significance: "Chuẩn mực đạo đức thiên thượng được ban cho người có đức tin; nền tảng cho sự xưng công bình trong Kinh Thánh.",
    occurrences_count: 157,
    key_verses: JSON.stringify(["Sáng-thế Ký 15:6", "Thi-thiên 15:2", "Châm-ngôn 10:2", "Châm-ngôn 14:34"])
  }
];

function escapeSql(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function runSqlInContainer(sql) {
  try {
    return execSync('docker exec -i bibleknowledge-postgres psql -U postgres -d bible_knowledge', {
      input: sql,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'inherit']
    });
  } catch (err) {
    console.error('SQL Execution Error:', err.message);
    throw err;
  }
}

console.log('Seeding iconic Hebrew Poetic & Wisdom Lexicon words into Postgres strong_lexicon...');

let sqlStatements = [];
for (const w of HEBREW_POETIC_WORDS) {
  const sql = `
INSERT INTO strong_lexicon (
  id, strong_number, language, lemma, transliteration, pronunciation,
  part_of_speech, definition, theological_significance, occurrences_count, key_verses
) VALUES (
  ${escapeSql(w.id)},
  ${escapeSql(w.strong_number)},
  ${escapeSql(w.language)},
  ${escapeSql(w.lemma)},
  ${escapeSql(w.transliteration)},
  ${escapeSql(w.pronunciation)},
  ${escapeSql(w.part_of_speech)},
  ${escapeSql(w.definition)},
  ${escapeSql(w.theological_significance)},
  ${w.occurrences_count},
  ${escapeSql(w.key_verses)}::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  lemma = EXCLUDED.lemma,
  transliteration = EXCLUDED.transliteration,
  pronunciation = EXCLUDED.pronunciation,
  part_of_speech = EXCLUDED.part_of_speech,
  definition = EXCLUDED.definition,
  theological_significance = EXCLUDED.theological_significance,
  occurrences_count = EXCLUDED.occurrences_count,
  key_verses = EXCLUDED.key_verses;
`;
  sqlStatements.push(sql);
}

runSqlInContainer(sqlStatements.join('\n'));
console.log(`✅ Successfully seeded ${HEBREW_POETIC_WORDS.length} Hebrew Poetic & Wisdom entries into strong_lexicon!`);
