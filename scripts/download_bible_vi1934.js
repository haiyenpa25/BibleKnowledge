const https = require('https');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const books = require('./bible_books_metadata.js');

const BASE_DIR = path.resolve(__dirname, '../data/bible/vi1934');
const RAW_DIR = path.join(BASE_DIR, 'raw');
const BOOKS_DIR = path.join(BASE_DIR, 'books');

// Ensure directories exist
fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(BOOKS_DIR, { recursive: true });

function fetchUrlWithRetry(url, maxRetries = 4) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    function tryFetch() {
      attempt++;
      const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BibleKnowledge/1.0' } }, (res) => {
        if (res.statusCode !== 200) {
          if (attempt <= maxRetries) {
            setTimeout(tryFetch, attempt * 800);
          } else {
            reject(new Error(`Failed HTTP ${res.statusCode} for ${url}`));
          }
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', (err) => {
        if (attempt <= maxRetries) {
          setTimeout(tryFetch, attempt * 800);
        } else {
          reject(err);
        }
      });

      req.setTimeout(12000, () => {
        req.destroy();
        if (attempt <= maxRetries) {
          setTimeout(tryFetch, attempt * 800);
        } else {
          reject(new Error(`Timeout for ${url}`));
        }
      });
    }

    tryFetch();
  });
}

function parseChapterHtml(html, bookCode, chapterNum) {
  const verses = [];
  let currentSection = '';

  const itemRegex = /(<h3[^>]*>[\s\S]*?<\/h3>|<span\s+class=["']verse\s+([^"']+)["']>([\s\S]*?)<\/span>)/gi;

  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    if (fullMatch.startsWith('<h3') || fullMatch.startsWith('<H3')) {
      currentSection = fullMatch.replace(/<[^>]+>/g, '').trim();
    } else {
      const classAttr = match[2];
      const innerHtml = match[3];

      const parts = classAttr.trim().split('_');
      const vNumStr = parts[parts.length - 1];
      const vNum = parseInt(vNumStr, 10);

      const crossRefs = [];
      const refRegex = /<a[^>]*title=["']([^"']+)["'][^>]*>⚓<\/a>/gi;
      let refMatch;
      while ((refMatch = refRegex.exec(innerHtml)) !== null) {
        const refs = refMatch[1].split(';').map(s => s.trim()).filter(Boolean);
        crossRefs.push(...refs);
      }

      let text = innerHtml
        .replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '')
        .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/&emsp;/gi, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&quot;/gi, '"')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      verses.push({
        verse: isNaN(vNum) ? verses.length + 1 : vNum,
        section_title: currentSection,
        text,
        cross_references: crossRefs
      });
    }
  }

  return verses;
}

// Concurrency pool helper
async function mapConcurrent(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;
  let running = 0;

  return new Promise((resolve, reject) => {
    function next() {
      if (index === items.length && running === 0) {
        return resolve(results);
      }

      while (running < limit && index < items.length) {
        const curIdx = index++;
        running++;
        fn(items[curIdx], curIdx)
          .then((res) => {
            results[curIdx] = res;
            running--;
            next();
          })
          .catch((err) => {
            reject(err);
          });
      }
    }

    next();
  });
}

async function main() {
  console.log('=== KINH THÁNH BẢN DỊCH 1925 (VI1934) DOWNLOADER & BUILDER ===');
  console.log(`Target: 66 Books, 1,189 Chapters`);
  console.log(`Storage: ${BASE_DIR}`);

  // Build task list for all chapters
  const chapterTasks = [];
  for (const book of books) {
    for (let c = 1; c <= book.chapterCount; c++) {
      chapterTasks.push({
        book,
        chapter: c
      });
    }
  }

  console.log(`Total chapters to process: ${chapterTasks.length}`);

  let completedCount = 0;
  const startTime = Date.now();

  // Process chapters with concurrency limit of 5
  await mapConcurrent(chapterTasks, 5, async (task) => {
    const { book, chapter } = task;
    const orderPad = String(book.order).padStart(2, '0');
    const rawFile = path.join(RAW_DIR, `${orderPad}_${book.code}_${chapter}.html`);

    let html = '';
    if (fs.existsSync(rawFile) && fs.statSync(rawFile).size > 200) {
      html = fs.readFileSync(rawFile, 'utf8');
    } else {
      const url = `https://kinhthanh.httlvn.org/doc-kinh-thanh/${book.code}/${chapter}?v=VI1934`;
      html = await fetchUrlWithRetry(url);
      fs.writeFileSync(rawFile, html, 'utf8');
      // Gentle throttle between network calls
      await new Promise(r => setTimeout(r, 60));
    }

    task.verses = parseChapterHtml(html, book.code, chapter);
    completedCount++;

    if (completedCount % 100 === 0 || completedCount === chapterTasks.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = ((completedCount / chapterTasks.length) * 100).toFixed(1);
      console.log(`[${completedCount}/${chapterTasks.length}] ${pct}% completed (${elapsed}s) - Last: ${book.name_vi} ${chapter}`);
    }
  });

  console.log('\n--- Building Indexed Data Structures ---');
  let globalId = 1;
  const flatVerses = [];
  const catalog = [];

  // Group by book
  for (const book of books) {
    const bookTasks = chapterTasks.filter(t => t.book.order === book.order);
    let bookVerseCount = 0;
    const structuredChapters = [];

    for (const bt of bookTasks) {
      const chapterVerses = [];
      for (const v of bt.verses) {
        const verseCode = (book.order * 1000000) + (bt.chapter * 1000) + v.verse;
        const verseObj = {
          global_id: globalId++,
          verse_code: verseCode,
          book_order: book.order,
          book_code: book.code,
          osis: book.osis,
          book_name: book.name_vi,
          book_name_en: book.name_en,
          testament: book.testament,
          chapter: bt.chapter,
          verse: v.verse,
          section_title: v.section_title || '',
          text: v.text,
          cross_references: v.cross_references
        };

        chapterVerses.push(verseObj);
        flatVerses.push(verseObj);
        bookVerseCount++;
      }

      structuredChapters.push({
        chapter: bt.chapter,
        total_verses: chapterVerses.length,
        verses: chapterVerses
      });
    }

    const orderPad = String(book.order).padStart(2, '0');
    const bookFileName = `${orderPad}_${book.code}_${book.osis.toLowerCase()}.json`;
    const bookFilePath = path.join(BOOKS_DIR, bookFileName);

    const bookData = {
      order: book.order,
      code: book.code,
      osis: book.osis,
      name_vi: book.name_vi,
      name_en: book.name_en,
      testament: book.testament,
      chapter_count: book.chapterCount,
      total_verses: bookVerseCount,
      chapters: structuredChapters
    };

    fs.writeFileSync(bookFilePath, JSON.stringify(bookData, null, 2), 'utf8');

    catalog.push({
      order: book.order,
      code: book.code,
      osis: book.osis,
      name_vi: book.name_vi,
      name_en: book.name_en,
      testament: book.testament,
      chapter_count: book.chapterCount,
      total_verses: bookVerseCount,
      file: `books/${bookFileName}`
    });
  }

  // Save catalog.json
  const catalogPath = path.join(BASE_DIR, 'catalog.json');
  fs.writeFileSync(catalogPath, JSON.stringify({
    translation: 'VI1934',
    name: 'Kinh Thánh Tiếng Việt Bản dịch 1925',
    source: 'https://kinhthanh.httlvn.org/?v=VI1934',
    total_books: books.length,
    total_chapters: chapterTasks.length,
    total_verses: flatVerses.length,
    books: catalog
  }, null, 2), 'utf8');
  console.log(`Saved catalog: ${catalogPath} (${books.length} books, ${flatVerses.length} verses)`);

  // Save verses_flat.json
  const flatPath = path.join(BASE_DIR, 'verses_flat.json');
  fs.writeFileSync(flatPath, JSON.stringify(flatVerses, null, 2), 'utf8');
  console.log(`Saved verses_flat: ${flatPath} (${(fs.statSync(flatPath).size / (1024 * 1024)).toFixed(2)} MB)`);

  // Build SQLite Database
  console.log('\n--- Building SQLite Database with FTS5 ---');
  const dbPath = path.join(BASE_DIR, 'bible_vi1934.sqlite');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE books (
      id INTEGER PRIMARY KEY,
      order_num INTEGER UNIQUE,
      code TEXT UNIQUE,
      osis TEXT UNIQUE,
      name_vi TEXT,
      name_en TEXT,
      testament TEXT,
      chapter_count INTEGER,
      total_verses INTEGER
    );

    CREATE TABLE verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      global_id INTEGER UNIQUE,
      verse_code INTEGER UNIQUE,
      book_order INTEGER,
      book_code TEXT,
      osis TEXT,
      book_name TEXT,
      testament TEXT,
      chapter INTEGER,
      verse INTEGER,
      section_title TEXT,
      text TEXT,
      cross_references TEXT,
      FOREIGN KEY (book_order) REFERENCES books(order_num)
    );

    CREATE INDEX idx_verses_global_id ON verses(global_id);
    CREATE INDEX idx_verses_code ON verses(verse_code);
    CREATE INDEX idx_verses_book_chap_v ON verses(book_code, chapter, verse);
    CREATE INDEX idx_verses_osis_chap_v ON verses(osis, chapter, verse);
    CREATE INDEX idx_verses_name_chap_v ON verses(book_name, chapter, verse);

    CREATE VIRTUAL TABLE verses_fts USING fts5(
      book_name,
      chapter UNINDEXED,
      verse UNINDEXED,
      section_title,
      text,
      content='verses',
      content_rowid='id'
    );
  `);

  // Insert books
  const insertBook = db.prepare(`
    INSERT INTO books (order_num, code, osis, name_vi, name_en, testament, chapter_count, total_verses)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  for (const b of catalog) {
    insertBook.run(b.order, b.code, b.osis, b.name_vi, b.name_en, b.testament, b.chapter_count, b.total_verses);
  }
  db.exec('COMMIT');

  // Insert verses in batches
  const insertVerse = db.prepare(`
    INSERT INTO verses (global_id, verse_code, book_order, book_code, osis, book_name, testament, chapter, verse, section_title, text, cross_references)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFts = db.prepare(`
    INSERT INTO verses_fts (rowid, book_name, chapter, verse, section_title, text)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  for (let i = 0; i < flatVerses.length; i++) {
    const v = flatVerses[i];
    const rowid = i + 1;
    insertVerse.run(
      v.global_id,
      v.verse_code,
      v.book_order,
      v.book_code,
      v.osis,
      v.book_name,
      v.testament,
      v.chapter,
      v.verse,
      v.section_title,
      v.text,
      JSON.stringify(v.cross_references)
    );

    insertFts.run(
      rowid,
      v.book_name,
      v.chapter,
      v.verse,
      v.section_title,
      v.text
    );
  }
  db.exec('COMMIT');

  db.close();

  const dbSizeMb = (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2);
  console.log(`SQLite database successfully built at: ${dbPath} (${dbSizeMb} MB)`);
  console.log('=== ALL OPERATIONS COMPLETED SUCCESSFULLY! ===');
}

main().catch(err => {
  console.error('Fatal error in downloader:', err);
  process.exit(1);
});
