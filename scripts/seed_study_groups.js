/**
 * Seed initial study groups and collaborative notes into PostgreSQL bible_knowledge database.
 * Run with: node scripts/seed_study_groups.js
 */
const { execSync } = require('child_process');

const SEED_GROUPS = [
  {
    id: 'group-roma-8',
    name: 'Ban Mục Vụ & Giảng Luận — Khảo Luận Rô-ma 8',
    description: 'Nhóm nghiên cứu chuyên sâu của các Mục sư và Chấp sự về chương 8 sách Rô-ma: Sự đắc thắng trong Đấng Christ, chức vụ Đức Thánh Linh và tình yêu không thể phân rẽ của Đức Chúa Trời.',
    leader_name: 'Mục sư Quản nhiệm Nguyễn Văn An',
    leader_role: 'Mục sư Quản nhiệm',
    scripture_focus: 'Rô-ma 8:1-39',
    meeting_schedule: 'Tối Thứ Tư 19:30 hàng tuần',
    members_count: 6,
    tags: ['giải kinh', 'rô-ma', 'thánh linh', 'ân điển', 'đắc thắng'],
    notes: [
      {
        id: 'note-roma8-katakrima',
        author_name: 'Mục sư Nguyễn Văn An',
        author_role: 'Mục sư Quản nhiệm',
        title: 'Khảo sát từ vựng Katakrima (Không còn án phạt nào) — Rô-ma 8:1',
        scripture_ref: 'Rô-ma 8:1-2',
        insight_type: 'exegesis',
        likes_count: 5,
        content: 'Trong nguyên văn Hy Lạp, từ "katakrima" (G2631) không chỉ mang ý nghĩa tuyên án (verdict) mà còn bao hàm việc thi hành bản án hình phạt. Đối với những kẻ "ở trong Đấng Christ Giê-xu", luật của Thánh Linh sự sống đã giải phóng hoàn toàn khỏi luật của tội lỗi và sự chết. Đây là nền tảng tối hậu cho sự bình an lương tâm của người tin Chúa.',
        comments: [
          {
            id: 'comm-1',
            author_name: 'Truyền đạo Lê Văn Bình',
            author_role: 'Phụ tá Mục vụ',
            text: 'Cảm ơn Mục sư đã làm sáng tỏ từ katakrima. Khi đối chiếu với Rô-ma 5:16, ta thấy sự tương phản tuyệt đối giữa sự đoán phạt trong A-đam và sự xưng công bình nhưng không trong Đấng Christ.',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 'comm-2',
            author_name: 'Chấp sự Trần Minh Đức',
            author_role: 'Trưởng ban Cơ Đốc Giáo Dục',
            text: 'Tôi sẽ dùng điểm này để giải thích cho các bạn thanh niên đang bị dày vò bởi cảm giác tội lỗi trong quá khứ.',
            created_at: new Date(Date.now() - 86400000 * 1).toISOString()
          }
        ]
      },
      {
        id: 'note-roma8-intercession',
        author_name: 'Mục sư Nhiệm chức Trần Đình Hùng',
        author_role: 'Mục sư Nhiệm chức',
        title: 'Đức Thánh Linh Cầu Thay Trong Sự Yếu Đuối Của Chúng Ta',
        scripture_ref: 'Rô-ma 8:26-27',
        insight_type: 'pastoral',
        likes_count: 4,
        content: 'Khi tín hữu đối diện với đau buồn tột cùng hoặc bế tắc mà không biết phải cầu nguyện làm sao cho hiệp ý Chúa, Đức Thánh Linh dùng sự thở than không thể nói ra mà cầu thay cho chúng ta. Đây là niềm an ủi mục vụ lớn lao nhất khi thăm viếng các gia đình đang trải qua tang chế hoặc bệnh hiểm nghèo.',
        comments: [
          {
            id: 'comm-3',
            author_name: 'Mục sư Nguyễn Văn An',
            author_role: 'Mục sư Quản nhiệm',
            text: 'Rất chính xác. Hãy liên kết điều này với câu 34: Đấng Christ Phục Sinh ngự bên hữu Đức Chúa Trời cũng đang cầu thay cho chúng ta! Chúng ta có Đấng Cầu Thay ở trong lòng (Thánh Linh) và Đấng Cầu Thay trên Thiên Đàng (Con Đức Chúa Trời).',
            created_at: new Date(Date.now() - 3600000 * 12).toISOString()
          }
        ]
      },
      {
        id: 'note-roma8-questions',
        author_name: 'Chấp sự Trần Minh Đức',
        author_role: 'Trưởng ban Cơ Đốc Giáo Dục',
        title: 'Câu hỏi thảo luận tổ tế bào: Đối diện thử thách với sự bảo đảm cứu rỗi',
        scripture_ref: 'Rô-ma 8:31-39',
        insight_type: 'discussion_question',
        likes_count: 3,
        content: '1. Nếu Đức Chúa Trời vùa giúp chúng ta, ai có thể nghịch lại chúng ta? Hãy chia sẻ một kinh nghiệm cụ thể khi bạn trải nghiệm sự bênh vực của Chúa.\n2. Phao-lô liệt kê 7 nan đề: hoạn nạn, khốn cùng, bắt bớ, đói khát, trần truồng, nguy hiểm, gươm giáo. Nan đề nào dễ làm bạn nghi ngờ tình yêu thương của Chúa nhất?\n3. Ý nghĩa của danh xưng "người hơn cả kẻ đắc thắng" (hupernikōmen) trong câu 37?',
        comments: []
      }
    ]
  },
  {
    id: 'group-hebrews-covenant',
    name: 'Hội Đồng Giảng Dạy — Thần Học Giao Ước & Chức Tế Lễ',
    description: 'Nghiên cứu hình bóng Cựu Ước, chức tế lễ theo ban Mên-chi-xê-đéc và Giao Ước Mới trổi hơn trong Thư tín Hê-bơ-rơ.',
    leader_name: 'Giáo sư Thần học Lê Hoàng Minh',
    leader_role: 'Giảng viên Thần học',
    scripture_focus: 'Hê-bơ-rơ 8:1-13',
    meeting_schedule: 'Sáng Thứ Bảy 08:30 cách tuần',
    members_count: 5,
    tags: ['giao ước mới', 'hê-bơ-rơ', 'mên-chi-xê-đéc', 'tế lễ', 'tiên tri'],
    notes: [
      {
        id: 'note-heb8-better-promises',
        author_name: 'Giáo sư Lê Hoàng Minh',
        author_role: 'Giảng viên Thần học',
        title: 'Giao Ước Được Lập Trên Những Lời Hứa Tốt Hơn (Kreittosin Epaggeliais)',
        scripture_ref: 'Hê-bơ-rơ 8:6',
        insight_type: 'exegesis',
        likes_count: 6,
        content: 'Giao ước cũ dựa trên điều kiện của con người ("nếu các ngươi vâng lời..."), trong khi Giao Ước Mới được lập trên lời hứa ân điển vô điều kiện của Đức Chúa Trời: "Ta sẽ ghi luật pháp Ta vào lòng chúng nó", "Ta sẽ tha sự gian ác của chúng nó, và không nhớ đến tội lỗi chúng nó nữa" (trích Giê-rê-mi 31:31-34).',
        comments: [
          {
            id: 'comm-4',
            author_name: 'Mục sư Hoàng Đình Khôi',
            author_role: 'Mục sư Giảng luận',
            text: 'Luận điểm này rất sắc bén để bảo vệ giáo lý Ân Điển Cứu Chuộc Duy Nhất (Sola Gratia).',
            created_at: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'group-proverbs-family',
    name: 'Tổ Phụ Huynh & Mục Vụ Gia Đình — Kính Sợ Chúa & Nuôi Dạy Con',
    description: 'Ứng dụng sự khôn ngoan của sách Châm Ngôn vào đời sống hôn nhân, nuôi dạy con cái trong đức tin và gìn giữ nền tảng gia đình Cơ Đốc.',
    leader_name: 'Chấp sự Trưởng ban Trần Đình Trọng',
    leader_role: 'Chấp sự Trưởng ban Gia đình',
    scripture_focus: 'Châm-ngôn 3:1-12',
    meeting_schedule: 'Tối Chúa Nhật 19:00',
    members_count: 8,
    tags: ['gia đình', 'châm ngôn', 'khôn ngoan', 'kính sợ chúa', 'nuôi dạy con'],
    notes: [
      {
        id: 'note-prov3-trust',
        author_name: 'Chấp sự Trần Đình Trọng',
        author_role: 'Chấp sự Trưởng ban Gia đình',
        title: 'Hết Lòng Tin Cậy Đức Giê-hô-va — Không Dựa Vào Sự Khôn Sáng Mình',
        scripture_ref: 'Châm-ngôn 3:5-6',
        insight_type: 'pastoral',
        likes_count: 7,
        content: 'Trong việc định hướng nghề nghiệp và tương lai cho con cái, các bậc phụ huynh Cơ Đốc thường dễ bị cám dỗ dựa vào tính toán thế gian. Lời Chúa mời gọi chúng ta trao phó trọn vẹn và nhận biết Ngài trong mọi đường lối mình, Ngài sẽ chỉ dẫn các nẻo của chúng ta.',
        comments: [
          {
            id: 'comm-5',
            author_name: 'Bà Nguyễn Thị Mai',
            author_role: 'Thành viên Ban Phụ Nữ',
            text: 'Xin nhóm cầu nguyện cho gia đình tôi khi đang hướng dẫn cháu lớn thi đại học trong sự kính sợ Chúa.',
            created_at: new Date(Date.now() - 86400000 * 1).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'group-acts-mission',
    name: 'Nhóm Môn Đồ Hóa & Tiên Phong Phúc Âm',
    description: 'Thảo luận chiến lược truyền giáo, thành lập điểm nhóm mới và phát triển các môn đồ năng động theo gương Hội Thánh đầu tiên.',
    leader_name: 'Mục sư Đặc trách Truyền giáo Phạm Quang Huy',
    leader_role: 'Mục sư Đặc trách Truyền giáo',
    scripture_focus: 'Công-vụ 1:8',
    meeting_schedule: 'Chiều Thứ Bảy 14:00',
    members_count: 10,
    tags: ['truyền giáo', 'công vụ', 'thánh linh', 'môn đồ hóa', 'chứng nhân'],
    notes: [
      {
        id: 'note-acts1-dunamis',
        author_name: 'Mục sư Phạm Quang Huy',
        author_role: 'Mục sư Đặc trách Truyền giáo',
        title: 'Quyền Năng Dunamis Của Thánh Linh Để Làm Chứng Nhân',
        scripture_ref: 'Công-vụ 1:8',
        insight_type: 'exegesis',
        likes_count: 8,
        content: 'Từ "dunamis" (quyền phép) chỉ về năng quyền nội tại của Đức Chúa Trời hành động qua người yếu đuối. Chứng nhân (martys) sẵn sàng làm chứng bằng cả đời sống và niềm tin kiên định từ Giê-ru-sa-lem đến cùng trái đất.',
        comments: []
      }
    ]
  }
];

function runSql(sql) {
  try {
    execSync('docker exec -i bibleknowledge-postgres psql -U postgres -d bible_knowledge', {
      input: sql,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (err) {
    console.error('SQL Execution Error:', err.message);
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

console.log("Seeding study groups and collaborative notes into PostgreSQL...");

for (const g of SEED_GROUPS) {
  const insertGroupSql = `
    INSERT INTO study_groups (
      id, name, description, leader_name, leader_role, scripture_focus,
      meeting_schedule, members_count, tags, created_at, updated_at
    ) VALUES (
      ${escapeSql(g.id)},
      ${escapeSql(g.name)},
      ${escapeSql(g.description)},
      ${escapeSql(g.leader_name)},
      ${escapeSql(g.leader_role)},
      ${escapeSql(g.scripture_focus)},
      ${escapeSql(g.meeting_schedule)},
      ${g.members_count || 1},
      ${escapeSql(JSON.stringify(g.tags))}::jsonb,
      NOW() - INTERVAL '${Math.floor(Math.random() * 5 + 1)} days',
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      leader_name = EXCLUDED.leader_name,
      leader_role = EXCLUDED.leader_role,
      scripture_focus = EXCLUDED.scripture_focus,
      meeting_schedule = EXCLUDED.meeting_schedule,
      members_count = EXCLUDED.members_count,
      tags = EXCLUDED.tags,
      updated_at = NOW();
  `;
  runSql(insertGroupSql);

  if (g.notes && g.notes.length > 0) {
    for (const n of g.notes) {
      const insertNoteSql = `
        INSERT INTO study_group_notes (
          id, group_id, author_name, author_role, title,
          scripture_ref, content, insight_type, likes_count,
          comments, created_at, updated_at
        ) VALUES (
          ${escapeSql(n.id)},
          ${escapeSql(g.id)},
          ${escapeSql(n.author_name)},
          ${escapeSql(n.author_role)},
          ${escapeSql(n.title)},
          ${escapeSql(n.scripture_ref)},
          ${escapeSql(n.content)},
          ${escapeSql(n.insight_type)},
          ${n.likes_count || 0},
          ${escapeSql(JSON.stringify(n.comments))}::jsonb,
          NOW() - INTERVAL '${Math.floor(Math.random() * 3 + 1)} days',
          NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          author_name = EXCLUDED.author_name,
          author_role = EXCLUDED.author_role,
          title = EXCLUDED.title,
          scripture_ref = EXCLUDED.scripture_ref,
          content = EXCLUDED.content,
          insight_type = EXCLUDED.insight_type,
          likes_count = EXCLUDED.likes_count,
          comments = EXCLUDED.comments,
          updated_at = NOW();
      `;
      runSql(insertNoteSql);
    }
  }
  console.log(`✓ Seeded study group & notes: ${g.name}`);
}

console.log("Seeding study groups completed successfully!");
