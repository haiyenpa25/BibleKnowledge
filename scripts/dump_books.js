/**
 * dump_books.js — BibleKnowledge Theological Library Ingestion & Seeding Engine
 * 
 * Inspects all 275 theological works in data/sources and data/catalog.json,
 * extracts canonical metadata, series, authors, chapter counts, and produces:
 * 1. A comprehensive SQL seed file (db/init/07_theological_books.sql)
 * 2. Directly seeds the PostgreSQL `documents` table if --apply is passed
 * 3. Prints detailed catalog statistics by category, author, and series
 * 
 * Usage:
 *   node scripts/dump_books.js            (Generates SQL file & prints statistics)
 *   node scripts/dump_books.js --apply    (Generates SQL file and applies directly into Docker PostgreSQL)
 *   node scripts/dump_books.js --json     (Outputs catalog summary as JSON)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SOURCES_DIR = path.join(DATA_DIR, 'sources');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');
const OUTPUT_SQL = path.join(ROOT_DIR, 'db', 'init', '07_theological_books.sql');

function determineCategory(title, author) {
  const t = (title || '').toLowerCase();
  const a = (author || '').toLowerCase();

  if (
    t.includes('commentary') ||
    t.includes('tntc') ||
    t.includes('totc') ||
    t.includes('nivac') ||
    t.includes('bk commentary') ||
    t.includes('be series') ||
    t.includes('be-series') ||
    t.includes('expositor') ||
    t.includes('macarthur bible commentary') ||
    t.includes('asbury') ||
    t.includes('wycliffe') ||
    t.includes('theology of work')
  ) {
    return { category: 'commentary', category_vi: 'Bộ Chú Giải Kinh Thánh' };
  }

  if (
    t.includes('dictionary') ||
    t.includes('encyclopedia') ||
    t.includes('lexicon') ||
    t.includes('concordance') ||
    t.includes('atlas') ||
    t.includes("strong's") ||
    t.includes('easton') ||
    t.includes('eerdmans') ||
    t.includes('holman illustrated') ||
    t.includes("nelson's new illustrated") ||
    t.includes("vine's")
  ) {
    return { category: 'dictionary', category_vi: 'Từ Điển & Bách Khoa Toàn Thư' };
  }

  if (
    t.includes('survey') ||
    t.includes('introduction') ||
    t.includes('background') ||
    t.includes('essentials') ||
    t.includes('manners and customs') ||
    t.includes('companion') ||
    t.includes('world of the new testament') ||
    t.includes('origins of the bible') ||
    t.includes('mears bible survey')
  ) {
    return { category: 'survey', category_vi: 'Khảo Lược & Dẫn Nhập' };
  }

  return { category: 'monograph', category_vi: 'Thần Học Chuyên Đề & Đời Sống' };
}

function extractSeries(title) {
  const t = title || '';
  if (/wiersbe.*be\s+series/i.test(t)) return "Warren Wiersbe's Be Series";
  if (/tntc/i.test(t) || /tyndale new testament/i.test(t)) return 'Tyndale New Testament Commentaries (TNTC)';
  if (/totc/i.test(t) || /tyndale old testament/i.test(t)) return 'Tyndale Old Testament Commentaries (TOTC)';
  if (/nivac/i.test(t) || /niv application/i.test(t)) return 'NIV Application Commentary';
  if (/bk commentary/i.test(t) || /bible knowledge commentary/i.test(t)) return 'Bible Knowledge Commentary';
  if (/oxford/i.test(t)) return 'Oxford Reference Collection';
  if (/ivp/i.test(t)) return 'IVP Reference & Academic';
  if (/zondervan/i.test(t)) return 'Zondervan Reference Collection';
  if (/holman/i.test(t)) return 'Holman Reference Guides';
  return 'Độc lập / Tuyển tập chuyên khảo';
}

function sanitizeText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\u0000/g, '')
    .replace(/\\u0000/g, '')
    .replace(/\0/g, '');
}

function escapeSql(str) {
  if (str === null || str === undefined) return "''";
  const clean = sanitizeText(str);
  return "'" + clean.replace(/'/g, "''") + "'";
}

function main() {
  const args = process.argv.slice(2);
  const shouldApply = args.includes('--apply');
  const jsonOutput = args.includes('--json');

  if (!fs.existsSync(CATALOG_FILE)) {
    console.error(`Không tìm thấy file danh mục catalog: ${CATALOG_FILE}`);
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf-8'));
  const sources = catalog.sources || [];

  const processedBooks = [];
  const categoryStats = { commentary: 0, dictionary: 0, survey: 0, monograph: 0 };
  const seriesStats = {};
  let totalChars = 0;
  let totalChapters = 0;

  for (const s of sources) {
    const filename = s.filename;
    const sourceKey = filename.replace(/\.json$/i, '');
    const title = s.title || '';
    const author = s.author || '';
    const chars = s.chars || 0;
    const chapters = s.total_chapters || 1;
    const cat = determineCategory(title, author);
    const series = extractSeries(title);

    categoryStats[cat.category] = (categoryStats[cat.category] || 0) + 1;
    seriesStats[series] = (seriesStats[series] || 0) + 1;
    totalChars += chars;
    totalChapters += chapters;

    // Read details from source JSON file if available
    let summaryOutline = [];
    const sourceFilePath = path.join(SOURCES_DIR, filename);
    if (fs.existsSync(sourceFilePath)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));
        if (fileContent.chapters && Array.isArray(fileContent.chapters)) {
          summaryOutline = fileContent.chapters.slice(0, 10).map((ch, idx) => ({
            index: idx + 1,
            title: sanitizeText(ch.title || `Chương ${idx + 1}`)
          }));
        }
      } catch (err) {
        // Fallback
      }
    }

    processedBooks.push({
      index: s.index,
      source_key: sourceKey,
      title: sanitizeText(title),
      author: sanitizeText(author),
      series: sanitizeText(series),
      category: cat.category,
      category_vi: cat.category_vi,
      chars,
      total_chapters: chapters,
      outline_preview: summaryOutline,
      filename
    });
  }

  // Generate SQL file
  const sqlLines = [
    '-- ==============================================================================',
    '-- 07_theological_books.sql — Full Seed of 275 Theological References',
    `-- Generated on ${new Date().toISOString()}`,
    '-- ==============================================================================',
    '',
    'BEGIN;',
    ''
  ];

  for (const b of processedBooks) {
    const metadataObj = {
      index: b.index,
      category: b.category,
      category_vi: b.category_vi,
      chars: b.chars,
      filename: b.filename,
      outline_sample: b.outline_preview
    };

    const cleanJson = sanitizeText(JSON.stringify(metadataObj));

    const sql = `
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    ${escapeSql(b.source_key)},
    ${escapeSql(b.title)},
    ${escapeSql(b.author)},
    ${escapeSql(b.series)},
    ${b.total_chapters},
    ${escapeSql(cleanJson)}::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
`.trim();

    sqlLines.push(sql);
  }

  sqlLines.push('');
  sqlLines.push('COMMIT;');
  sqlLines.push('');

  fs.writeFileSync(OUTPUT_SQL, sqlLines.join('\n'), 'utf-8');

  if (jsonOutput) {
    console.log(JSON.stringify({
      total_books: processedBooks.length,
      total_chapters: totalChapters,
      total_chars: totalChars,
      categories: categoryStats,
      series: seriesStats
    }, null, 2));
    return;
  }

  console.log('================================================================');
  console.log(`  BIBLEKNOWLEDGE THEOLOGICAL LIBRARY DUMP (${processedBooks.length} TÀI LIỆU)`);
  console.log('================================================================');
  console.log(`- Tổng số tài liệu: ${processedBooks.length} sách chuyên khảo & từ điển`);
  console.log(`- Tổng số chương mục: ${totalChapters.toLocaleString()} chương`);
  console.log(`- Tổng dung lượng ký tự: ${(totalChars / 1000000).toFixed(2)} triệu ký tự (~${(totalChars / 1024 / 1024).toFixed(1)} MB)`);
  console.log('');
  console.log('Phân bổ theo Thể loại:');
  console.log(`  • Bộ Chú Giải (Commentaries):      ${categoryStats.commentary} bộ`);
  console.log(`  • Từ Điển & Bách Khoa (Dictionary): ${categoryStats.dictionary} bộ`);
  console.log(`  • Khảo Lược & Dẫn Nhập (Survey):    ${categoryStats.survey} bộ`);
  console.log(`  • Thần Học Chuyên Đề (Monograph):   ${categoryStats.monograph} bộ`);
  console.log('');
  console.log('Phân bổ theo Tuyển tập / Bộ sách lớn:');
  for (const [s, count] of Object.entries(seriesStats).sort((a, b) => b[1] - a[1])) {
    console.log(`  • ${s.padEnd(45)}: ${count} tập`);
  }
  console.log('');
  console.log(`Đã xuất thành công file SQL: ${OUTPUT_SQL}`);

  if (shouldApply) {
    console.log('');
    console.log('Đang thực thi nạp dữ liệu vào PostgreSQL Docker (database bible_knowledge)...');
    try {
      execSync('docker exec -i bibleknowledge-postgres psql -U postgres -d bible_knowledge', {
        input: fs.readFileSync(OUTPUT_SQL),
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log('NẠP DỮ LIỆU THÀNH CÔNG VÀO BẢNG documents TRONG POSTGRESQL!');
    } catch (e) {
      console.error('Lỗi khi nạp dữ liệu vào PostgreSQL qua docker exec:', e.message);
    }
  } else {
    console.log('');
    console.log('Mẹo: Chạy `node scripts/dump_books.js --apply` để nạp trực tiếp toàn bộ 275 sách vào PostgreSQL!');
  }
}

main();
