const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

const NOTEBOOK_ID = '058481ca-131d-41e5-9d8f-8383604a7ed3';
const NOTEBOOK_NAME = 'NGHIÊN CỨU KINH THÁNH © AICoDoc.com';
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const SOURCES_DIR = path.join(DATA_DIR, 'sources');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');

// Helper to create safe filename
function toSafeFilename(index, title) {
  const paddedIndex = String(index).padStart(3, '0');
  const cleanTitle = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics for filename safety
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${paddedIndex}_${cleanTitle}.json`;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!fs.existsSync(SOURCES_DIR)) {
    fs.mkdirSync(SOURCES_DIR, { recursive: true });
  }

  console.log('🚀 Đang khởi động kết nối MCP đến NotebookLM...');
  const proc = spawn('cmd.exe', ['/c', 'npx', '-y', '@roomi-fields/notebooklm-mcp@3.2.0'], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  const rl = readline.createInterface({ input: proc.stdout });
  let msgId = 1;
  const callbacks = new Map();

  rl.on('line', line => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    } catch (e) {}
  });

  const send = (method, params) => new Promise(resolve => {
    const id = msgId++;
    callbacks.set(id, resolve);
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });

  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'downloader', version: '1.0' }
  });

  console.log(`📚 Đang lấy danh sách tài liệu từ Notebook [${NOTEBOOK_NAME}]...`);
  const listRes = await send('tools/call', {
    name: 'source_list',
    arguments: { notebook_id: NOTEBOOK_ID }
  });

  let rawSources = [];
  try {
    if (listRes.result && listRes.result.structuredContent && listRes.result.structuredContent.data) {
      rawSources = listRes.result.structuredContent.data.sources || [];
    } else if (listRes.result && listRes.result.content) {
      const parsed = JSON.parse(listRes.result.content[0].text);
      rawSources = parsed.data?.sources || [];
    }
  } catch (err) {
    console.error('❌ Lỗi đọc danh sách tài liệu:', err);
    proc.kill();
    process.exit(1);
  }

  const total = rawSources.length;
  console.log(`✅ Tìm thấy tổng cộng ${total} tài liệu nguồn.`);

  // Load existing catalog if available
  let catalog = {
    notebook_id: NOTEBOOK_ID,
    notebook_name: NOTEBOOK_NAME,
    total_sources: total,
    downloaded_sources: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources: []
  };

  if (fs.existsSync(CATALOG_FILE)) {
    try {
      catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
      catalog.total_sources = total;
    } catch (e) {}
  }

  // Build catalog map
  const catalogMap = new Map();
  if (Array.isArray(catalog.sources)) {
    for (const item of catalog.sources) {
      catalogMap.set(item.id, item);
    }
  }

  // Iterate and download
  let downloadedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < total; i++) {
    const src = rawSources[i];
    const index = i + 1;
    const filename = toSafeFilename(index, src.title || `source-${src.id}`);
    const filePath = path.join(SOURCES_DIR, filename);

    // Check if already downloaded
    if (fs.existsSync(filePath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (existingData.content && existingData.content.length > 0) {
          skippedCount++;
          catalogMap.set(src.id, {
            index,
            id: src.id,
            title: src.title,
            filename,
            chars: existingData.total_chars || existingData.content.length,
            status: 'completed',
            downloaded_at: existingData.downloaded_at || new Date().toISOString()
          });
          console.log(`⏩ [${index}/${total}] Đã có sẵn: ${src.title}`);
          continue;
        }
      } catch (e) {}
    }

    console.log(`⬇️ [${index}/${total}] Đang tải: ${src.title}...`);
    try {
      const readRes = await send('tools/call', {
        name: 'source_read',
        arguments: {
          notebook_id: NOTEBOOK_ID,
          source_id: src.id,
          paginate: false
        }
      });

      let content = '';
      let totalChars = 0;

      if (readRes.result && readRes.result.content) {
        const textData = JSON.parse(readRes.result.content[0].text);
        if (textData.success && textData.data) {
          content = textData.data.content || '';
          totalChars = textData.data.totalChars || content.length;
        }
      }

      if (!content) {
        console.warn(`⚠️ [${index}/${total}] Không lấy được nội dung cho: ${src.title}`);
        catalogMap.set(src.id, {
          index,
          id: src.id,
          title: src.title,
          filename,
          chars: 0,
          status: 'empty',
          downloaded_at: new Date().toISOString()
        });
        continue;
      }

      const fileData = {
        index,
        id: src.id,
        title: src.title,
        notebook_id: NOTEBOOK_ID,
        notebook_name: NOTEBOOK_NAME,
        downloaded_at: new Date().toISOString(),
        total_chars: totalChars,
        content
      };

      fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
      downloadedCount++;

      catalogMap.set(src.id, {
        index,
        id: src.id,
        title: src.title,
        filename,
        chars: totalChars,
        status: 'completed',
        downloaded_at: fileData.downloaded_at
      });

      console.log(`✅ [${index}/${total}] Đã tải xong (${totalChars.toLocaleString()} ký tự) -> ${filename}`);

      // Save catalog periodically
      if (downloadedCount % 5 === 0 || i === total - 1) {
        catalog.sources = Array.from(catalogMap.values());
        catalog.downloaded_sources = catalog.sources.filter(s => s.status === 'completed').length;
        catalog.updated_at = new Date().toISOString();
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');
      }

      // Gentle pause to avoid flooding Google
      await delay(800);
    } catch (err) {
      console.error(`❌ [${index}/${total}] Lỗi khi tải ${src.title}:`, err.message);
      catalogMap.set(src.id, {
        index,
        id: src.id,
        title: src.title,
        filename,
        chars: 0,
        status: 'failed',
        error: err.message
      });
      await delay(2000);
    }
  }

  // Final catalog save
  catalog.sources = Array.from(catalogMap.values());
  catalog.downloaded_sources = catalog.sources.filter(s => s.status === 'completed').length;
  catalog.updated_at = new Date().toISOString();
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');

  console.log('\n==========================================');
  console.log(`🎉 HOÀN TẤT TẢI DỮ LIỆU!`);
  console.log(`- Tổng số tài liệu: ${total}`);
  console.log(`- Mới tải về: ${downloadedCount}`);
  console.log(`- Bỏ qua (đã có): ${skippedCount}`);
  console.log(`- Danh mục mục lục: ${CATALOG_FILE}`);
  console.log(`- Thư mục chứa JSON: ${SOURCES_DIR}`);
  console.log('==========================================');

  proc.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
