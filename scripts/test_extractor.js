const BibleExtractor = require('./bible_extractor.js');

const bible = new BibleExtractor();

console.log('====================================================');
console.log(' KIỂM TRA TRÍCH DẪN KINH THÁNH BẢN DỊCH 1925 (VI1934) ');
console.log('====================================================\n');

// Test 1: Trích câu đơn lẻ
console.log('--- TEST 1: TRÍCH CÂU ĐƠN LẺ ("Giăng 3:16") ---');
const single = bible.getRange('Giăng 3:16');
console.log(`Số câu lấy được: ${single.length}`);
console.log(`[${single[0].book_name} ${single[0].chapter}:${single[0].verse}] (Mã: ${single[0].verse_code}, Global ID: ${single[0].global_id})`);
console.log(`Tiêu đề: ${single[0].section_title}`);
console.log(`Kinh văn: "${single[0].text}"`);
console.log(`Tham chiếu chéo:`, single[0].cross_references);

// Test 2: Trích khoảng câu trong 1 đoạn
console.log('\n--- TEST 2: TRÍCH KHOẢNG TRONG ĐOẠN ("Giăng 3:16-18") ---');
const intraRange = bible.getRange('Giăng 3:16-18');
console.log(`Số câu lấy được: ${intraRange.length}`);
intraRange.forEach(v => {
  console.log(`  ${v.chapter}:${v.verse} -> "${v.text}"`);
});

// Test 3: Trích khoảng câu LIÊN ĐOẠN (CROSS-CHAPTER): "Ma-thi-ơ 14:22 - 15:5"
console.log('\n--- TEST 3: TRÍCH KHOẢNG LIÊN ĐOẠN ("Ma-thi-ơ 14:22 - 15:5") ---');
const crossRange = bible.getRange('Ma-thi-ơ 14:22 - 15:5');
console.log(`Số câu lấy được: ${crossRange.length}`);
console.log(`Câu đầu tiên: ${crossRange[0].book_name} ${crossRange[0].chapter}:${crossRange[0].verse} -> "${crossRange[0].text}"`);
console.log(`Câu kết thúc đoạn 14: ${crossRange.find(v => v.chapter === 14 && v.verse === 36)?.text}`);
console.log(`Câu đầu đoạn 15: ${crossRange.find(v => v.chapter === 15 && v.verse === 1)?.text}`);
console.log(`Câu cuối cùng: ${crossRange[crossRange.length - 1].book_name} ${crossRange[crossRange.length - 1].chapter}:${crossRange[crossRange.length - 1].verse} -> "${crossRange[crossRange.length - 1].text}"`);

// Test 4: Trích tạo thành trời đất: "Sáng-thế Ký 1:31 - 2:3"
console.log('\n--- TEST 4: TRÍCH LIÊN ĐOẠN ("Sáng-thế Ký 1:31 - 2:3") ---');
const creationRange = bible.getRange('Sáng-thế Ký 1:31 - 2:3');
console.log(`Số câu: ${creationRange.length}`);
creationRange.forEach(v => {
  console.log(`  ${v.book_name} ${v.chapter}:${v.verse} (${v.section_title ? 'Tiểu đoạn: ' + v.section_title : '---'}) -> "${v.text}"`);
});

// Test 5: Full-Text Search (FTS5)
console.log('\n--- TEST 5: TÌM KIẾM TỪ KHÓA (FTS5 Search) ---');
const searchResults = bible.search('bánh hằng sống', 3);
console.log(`Tìm kiếm từ khóa "bánh hằng sống" (Top 3 kết quả):`);
searchResults.forEach(r => {
  console.log(`  [${r.book_name} ${r.chapter}:${r.verse}] "${r.text}"`);
});
