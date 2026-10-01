/**
 * Bible VI1934 Scripture Reference & Range Extractor
 * Supports:
 *  1. Single verse: getRange("Giăng 3:16")
 *  2. Intra-chapter range: getRange("Giăng 3:16-18")
 *  3. Cross-chapter range: getRange("Ma-thi-ơ 14:22 - 15:5")
 *  4. Parametric query: getCrossChapter("Ma-thi-ơ", 14, 22, 15, 5)
 *  5. Full-text search (FTS5): search("ban đầu đức chúa trời")
 */

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

class BibleExtractor {
  constructor(dbPath) {
    this.dbPath = dbPath || path.resolve(__dirname, '../data/bible/vi1934/bible_vi1934.sqlite');
    this.db = new DatabaseSync(this.dbPath);
    this._loadAliases();
  }

  _loadAliases() {
    this.books = this.db.prepare('SELECT * FROM books ORDER BY order_num ASC').all();
    this.aliasMap = new Map();

    for (const b of this.books) {
      // Direct names
      this.aliasMap.set(b.name_vi.toLowerCase(), b);
      this.aliasMap.set(b.name_en.toLowerCase(), b);
      this.aliasMap.set(b.osis.toLowerCase(), b);
      this.aliasMap.set(b.code.toLowerCase(), b);

      // Common Vietnamese short forms / abbreviations without hyphens
      const noHyphen = b.name_vi.replace(/-/g, ' ').toLowerCase();
      this.aliasMap.set(noHyphen, b);

      // Numbers like 1 Sa-mu-ên -> 1sa, i sa-mu-ên -> 1sa
      const noRoman = b.name_vi
        .replace(/^I\s+/i, '1 ')
        .replace(/^II\s+/i, '2 ')
        .replace(/^III\s+/i, '3 ')
        .toLowerCase();
      this.aliasMap.set(noRoman, b);
      this.aliasMap.set(noRoman.replace(/-/g, ' '), b);
    }

    // Common abbreviations
    const extras = {
      'sáng': 'sa', 'stk': 'sa', 'gen': 'sa',
      'xuất': 'xu', 'xkt': 'xu', 'exo': 'xu',
      'lê': 'le', 'lvk': 'le', 'lev': 'le',
      'dân': 'dan', 'dso': 'dan', 'num': 'dan',
      'phục': 'phu', 'ptk': 'phu', 'deu': 'phu',
      'thi': 'thi', 'ps': 'thi', 'psa': 'thi',
      'châm': 'ch', 'pro': 'ch',
      'mat': 'mat', 'mt': 'mat', 'ma-thi-ơ': 'mat', 'mathio': 'mat',
      'mác': 'mac', 'mc': 'mac', 'mrk': 'mac',
      'lu': 'lu', 'lc': 'lu', 'luk': 'lu',
      'giăng': 'gi', 'jn': 'gi', 'joh': 'gi',
      'công': 'cong', 'cv': 'cong', 'act': 'cong',
      'rô': 'ro', 'rm': 'ro', 'rom': 'ro',
      'khải': 'kh', 'kh': 'kh', 'rev': 'kh'
    };

    for (const [alias, code] of Object.entries(extras)) {
      const book = this.books.find(b => b.code === code);
      if (book) {
        this.aliasMap.set(alias.toLowerCase(), book);
      }
    }
  }

  resolveBook(nameOrAlias) {
    if (!nameOrAlias) return null;
    const clean = nameOrAlias.trim().toLowerCase();
    return this.aliasMap.get(clean) || null;
  }

  /**
   * Parse scripture reference strings like:
   *  - "Giăng 3:16"
   *  - "Giăng 3:16-18"
   *  - "Ma-thi-ơ 14:22 - 15:5"
   *  - "Thi-thiên 23:1-6"
   */
  parseReference(refStr) {
    if (!refStr || typeof refStr !== 'string') return null;

    // Check for cross-chapter format: "Book Chap:V - Chap:V"
    // e.g. "Ma-thi-ơ 14:22 - 15:5" or "Ma-thi-ơ 14:22-15:5"
    const crossMatch = refStr.match(/^(.+?)\s+(\d+)[:\.](\d+)\s*[-–—]\s*(\d+)[:\.](\d+)$/);
    if (crossMatch) {
      const book = this.resolveBook(crossMatch[1]);
      if (!book) return null;
      return {
        book,
        startChapter: parseInt(crossMatch[2], 10),
        startVerse: parseInt(crossMatch[3], 10),
        endChapter: parseInt(crossMatch[4], 10),
        endVerse: parseInt(crossMatch[5], 10)
      };
    }

    // Check for intra-chapter range format: "Book Chap:V-V"
    // e.g. "Giăng 3:16-18"
    const intraMatch = refStr.match(/^(.+?)\s+(\d+)[:\.](\d+)\s*[-–—]\s*(\d+)$/);
    if (intraMatch) {
      const book = this.resolveBook(intraMatch[1]);
      if (!book) return null;
      const ch = parseInt(intraMatch[2], 10);
      return {
        book,
        startChapter: ch,
        startVerse: parseInt(intraMatch[3], 10),
        endChapter: ch,
        endVerse: parseInt(intraMatch[4], 10)
      };
    }

    // Check for single verse format: "Book Chap:V"
    // e.g. "Giăng 3:16"
    const singleMatch = refStr.match(/^(.+?)\s+(\d+)[:\.](\d+)$/);
    if (singleMatch) {
      const book = this.resolveBook(singleMatch[1]);
      if (!book) return null;
      const ch = parseInt(singleMatch[2], 10);
      const v = parseInt(singleMatch[3], 10);
      return {
        book,
        startChapter: ch,
        startVerse: v,
        endChapter: ch,
        endVerse: v
      };
    }

    return null;
  }

  /**
   * Get verses by reference string (Single, Range, or Cross-chapter)
   */
  getRange(refStr) {
    const parsed = this.parseReference(refStr);
    if (!parsed) {
      throw new Error(`Invalid scripture reference format: "${refStr}"`);
    }

    return this.getCrossChapter(
      parsed.book.order_num,
      parsed.startChapter,
      parsed.startVerse,
      parsed.endChapter,
      parsed.endVerse
    );
  }

  /**
   * Query verses between (startChap:startV) and (endChap:endV) using verse_code!
   * Formula: verse_code = (book_order * 1,000,000) + (chapter * 1,000) + verse
   */
  getCrossChapter(bookIdentifier, startChapter, startVerse, endChapter, endVerse) {
    let bookOrder;
    if (typeof bookIdentifier === 'number') {
      bookOrder = bookIdentifier;
    } else {
      const b = this.resolveBook(bookIdentifier);
      if (!b) throw new Error(`Unknown book: "${bookIdentifier}"`);
      bookOrder = b.order_num;
    }

    const startCode = (bookOrder * 1000000) + (startChapter * 1000) + startVerse;
    const endCode = (bookOrder * 1000000) + (endChapter * 1000) + endVerse;

    const rows = this.db.prepare(`
      SELECT global_id, verse_code, book_order, book_code, osis, book_name, chapter, verse, section_title, text, cross_references
      FROM verses
      WHERE verse_code >= ? AND verse_code <= ?
      ORDER BY verse_code ASC
    `).all(startCode, endCode);

    return rows.map(r => ({
      ...r,
      cross_references: JSON.parse(r.cross_references || '[]')
    }));
  }

  /**
   * Get a range by Global Verse Sequence ID (can even span across different books!)
   */
  getRangeByGlobalId(startGlobalId, endGlobalId) {
    const rows = this.db.prepare(`
      SELECT global_id, verse_code, book_order, book_code, osis, book_name, chapter, verse, section_title, text, cross_references
      FROM verses
      WHERE global_id >= ? AND global_id <= ?
      ORDER BY global_id ASC
    `).all(startGlobalId, endGlobalId);

    return rows.map(r => ({
      ...r,
      cross_references: JSON.parse(r.cross_references || '[]')
    }));
  }

  /**
   * Full-text search across the Bible
   */
  search(keyword, limit = 20) {
    const clean = keyword.replace(/['"*]/g, '');
    const rows = this.db.prepare(`
      SELECT v.global_id, v.verse_code, v.book_name, v.chapter, v.verse, v.section_title, v.text
      FROM verses_fts f
      JOIN verses v ON f.rowid = v.id
      WHERE verses_fts MATCH ?
      LIMIT ?
    `).all(clean, limit);

    return rows;
  }
}

module.exports = BibleExtractor;
