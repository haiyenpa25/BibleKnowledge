const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const SOURCES_DIR = path.join(DATA_DIR, 'sources');
const TREE_DIR = path.join(DATA_DIR, 'tree');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');

function cleanAndParseToTree(raw) {
  const content = raw.content || '';
  const rawLines = content.split('\n').map(l => l.trim()).filter(Boolean);

  let author = '';
  let series = '';
  let bibleBooks = [];
  const title = raw.title || '';

  const wiersbeMatch = title.match(/Wiersbe.*?BE Series.*?–\s*(.*)/i);
  if (wiersbeMatch) {
    series = "Wiersbe's BE Series";
    author = wiersbeMatch[1].trim();
    const booksMatch = title.match(/\((.*?)\)/);
    if (booksMatch) {
      bibleBooks = booksMatch[1].split(',').map(b => b.trim());
    }
  } else {
    const authorMatch = title.match(/–\s*([^–]+)$/);
    if (authorMatch) {
      author = authorMatch[1].trim();
    }
  }

  const titleKeywords = title.split(/[-–()]/)[0].trim().toLowerCase();

  const chapters = [];
  let currentChapter = {
    index: 0,
    chapter_number: 'Front Matter',
    title: 'Introduction & Front Matter',
    scripture: '',
    sections: []
  };

  let currentSection = {
    heading: 'Overview',
    paragraphs: []
  };

  function flushSection() {
    if (currentSection.paragraphs.length > 0 || currentSection.heading) {
      currentChapter.sections.push(currentSection);
      currentSection = { heading: '', paragraphs: [] };
    }
  }

  function flushChapter() {
    flushSection();
    if (currentChapter.sections.length > 0) {
      chapters.push(currentChapter);
    }
  }

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i];

    // Filter out page numbers
    if (/^\d{1,4}$/.test(line)) continue;

    // Filter out running headers
    if (line.toLowerCase() === titleKeywords || (author && line.toLowerCase() === author.toLowerCase())) {
      continue;
    }

    // Detect Chapter header: e.g. "Chapter One", "Chapter 1", "Chapter Two"
    const chapMatch = line.match(/^(chapter\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|\d+))/i);
    const majorHeader = /^(the big idea|a word from the author|introduction|contents|conclusion|epilogue|appendix|notes)$/i.test(line);

    if (chapMatch || majorHeader) {
      flushChapter();
      let chapNumber = chapMatch ? chapMatch[1] : line;
      let chapTitle = line;
      let scripture = '';

      if (chapMatch) {
        const next = rawLines[i + 1] || '';
        if (next && next.length < 90 && !/^(chapter|by\s|[0-9]+\.)/i.test(next)) {
          chapTitle = next;
          i++;
          const scMatch = chapTitle.match(/\((.*?)\)/);
          if (scMatch) {
            scripture = scMatch[1].trim();
            chapTitle = chapTitle.replace(/\(.*?\)/, '').trim();
          }
        }
      }

      currentChapter = {
        index: chapters.length + 1,
        chapter_number: chapNumber,
        title: chapTitle,
        scripture: scripture,
        sections: []
      };
      currentSection = {
        heading: 'Introduction',
        paragraphs: []
      };
      continue;
    }

    // Check if line has an embedded heading like: "2. THE RETURN OF THE REMNANT (1:5—2:67) God not only stirred..."
    const embeddedHeadingMatch = line.match(/^([0-9]+\.\s+[A-Z\s,–—-]{3,}(?:\s*\([^)]+\))?)\s+(.*)/);
    if (embeddedHeadingMatch) {
      flushSection();
      currentSection = {
        heading: embeddedHeadingMatch[1].trim(),
        paragraphs: [embeddedHeadingMatch[2].trim()]
      };
      continue;
    }

    // Detect standalone section headings:
    const isSectionHeading = /^(stage\s+[a-z0-9]+:|[0-9]+\.\s+[A-Z\s,–—-]{3,}|questions for personal reflection)/i.test(line) && line.length < 100;
    if (isSectionHeading) {
      flushSection();
      currentSection = {
        heading: line,
        paragraphs: []
      };
      continue;
    }

    // Subheadings: e.g. "The treasure (1:5–11)."
    const isSubHeading = /^[A-Z][A-Za-z\s]{3,35}\s\(\d+:\d+.*?\)\./.test(line) && line.length < 60;
    if (isSubHeading) {
      flushSection();
      currentSection = {
        heading: line,
        paragraphs: []
      };
      continue;
    }

    // Regular paragraph
    currentSection.paragraphs.push(line);
  }

  flushChapter();

  // Filter out empty chapters if any
  const cleanChapters = chapters.filter(c => c.sections.some(s => s.paragraphs.length > 0));

  return {
    index: raw.index,
    id: raw.id,
    title: raw.title,
    author: author || undefined,
    series: series || undefined,
    bible_books: bibleBooks.length > 0 ? bibleBooks : undefined,
    notebook_id: raw.notebook_id,
    notebook_name: raw.notebook_name,
    downloaded_at: raw.downloaded_at,
    total_chars: raw.total_chars,
    total_chapters: cleanChapters.length,
    chapters: cleanChapters
  };
}

function processAllSources() {
  if (!fs.existsSync(TREE_DIR)) {
    fs.mkdirSync(TREE_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCES_DIR).filter(f => f.endsWith('.json'));
  console.log(`🌲 Đang chuyển đổi ${files.length} tài liệu sang cấu trúc cây JSON...`);

  let count = 0;
  for (const f of files) {
    const rawPath = path.join(SOURCES_DIR, f);
    const treePath = path.join(TREE_DIR, f);

    try {
      const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
      const tree = cleanAndParseToTree(raw);
      fs.writeFileSync(treePath, JSON.stringify(tree, null, 2), 'utf8');
      count++;
      if (count % 25 === 0 || count === files.length) {
        console.log(`✅ Đã chuyển đổi [${count}/${files.length}] file -> data/tree/`);
      }
    } catch (err) {
      console.error(`❌ Lỗi file ${f}:`, err.message);
    }
  }

  console.log(`\n🎉 HOÀN THÀNH: Đã tạo ${count} file JSON cấu trúc cây trong ${TREE_DIR}`);
}

processAllSources();
