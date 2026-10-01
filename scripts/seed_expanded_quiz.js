/**
 * seed_expanded_quiz.js — Seed Theological Multiple Choice Quiz Questions
 * 
 * Expands quiz question bank with 18 seminary-grade questions covering:
 * - The Pentateuch / Ngũ Kinh Môi-se (Genesis, Exodus, Leviticus, Numbers, Deuteronomy)
 * - Pauline Epistles / Thư Tín Phao-lô (Romans, 1 & 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 2 Timothy)
 * 
 * Usage:
 *   node scripts/seed_expanded_quiz.js
 */

const { execSync } = require('child_process');

const QUESTIONS = [
  {
    question_type: 'multiple_choice',
    question_text: 'Khi Đức Chúa Trời hứa cho Áp-ram một dòng dõi đông như sao trên trời, điều gì đã xảy ra khiến ông được xưng là công bình?',
    options: [
      'Áp-ram dâng một của lễ thiêu hoàn hảo bằng mười con bò đực',
      'Áp-ram tin Đức Giê-hô-va, và Ngài kể sự đó là công bình cho người',
      'Áp-ram ngay lập tức xây dựng một bàn thờ bằng đá tại Si-chem',
      'Áp-ram tuân thủ trọn vẹn mọi điều khoản của luật pháp nghi lễ'
    ],
    correct_option: 1,
    explanation: 'Sáng-thế Ký 15:6 là nền tảng thần học cốt lõi cho giáo lý xưng công bình bởi đức tin (Sola Fide), được Sứ đồ Phao-lô trích dẫn trọng tâm trong Rô-ma 4:3 và Ga-la-ti 3:6.',
    scripture_reference: 'Sáng-thế Ký 15:6',
    difficulty: 2
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Trên núi Mô-ri-a, khi Đức Chúa Trời bảo Áp-ra-ham dừng tay không giết Y-sác, Ngài đã chu cấp điều gì để thay thế, và Áp-ra-ham đặt tên nơi đó là gì?',
    options: [
      'Một con bồ câu trắng; đặt tên là Giê-hô-va Nisi',
      'Một con chiên đực mắc sừng trong bụi cây; đặt tên là Giê-hô-va Di-rê',
      'Một con bò tơ không tì vít; đặt tên là Giê-hô-va Sa-lôm',
      'Một con dê đực làm của lễ chuộc tội; đặt tên là Ê-then'
    ],
    correct_option: 1,
    explanation: 'Sáng-thế Ký 22:13-14 ghi lại hình bóng tiên tri tuyệt đỉnh về Chiên Con của Đức Chúa Trời bị hiến tế thay thế cho tội nhân. Danh xưng Giê-hô-va Di-rê nghĩa là "Đức Giê-hô-va sẽ chu cấp".',
    scripture_reference: 'Sáng-thế Ký 22:13-14',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Trong đêm Lễ Vượt Qua tại xứ Ai Cập, dấu hiệu nào bảo đảm kẻ hành hại sẽ vượt qua và không giáng tai họa diệt mạng trên nhà của tuyển dân?',
    options: [
      'Khói hương trầm thơm ngát bay lên từ bàn thờ gia đình',
      'Huyết của chiên con không tì vít bôi trên hai mày cây và ngạch cửa',
      'Cành bài hương nhúng vào nước tinh khiết đặt trước cửa lều',
      'Lời cầu nguyện chúc phước của trưởng lão trong dòng họ Lê-vi'
    ],
    correct_option: 1,
    explanation: 'Huyết chiên con bôi trên ngạch cửa bảo vệ con đầu lòng của dân Y-sơ-ra-ên khỏi sự đoán phạt, là hình bóng hoàn hảo về Huyết Chúa Giê-xu - Chiên Con Lễ Vượt Qua của chúng ta (I Cô-rinh-tô 5:7).',
    scripture_reference: 'Xuất Ê-díp-tô Ký 12:12-13',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Điều răn thứ nhất trong Mười Điều Răn (Thập Tự Giới) mà Đức Chúa Trời phán truyền tại núi Si-na-i là gì?',
    options: [
      'Ngươi chớ làm tượng chạm cho mình để thờ lạy',
      'Hãy nhớ ngày nghỉ đặng làm nên ngày thánh',
      'Trước mặt ta, ngươi chớ có các thần khác',
      'Ngươi chớ lấy danh Giê-hô-va Đức Chúa Trời ngươi mà làm chơi'
    ],
    correct_option: 2,
    explanation: 'Xuất Ê-díp-tô Ký 20:3 xác lập quyền tể trị độc tôn của Đấng Tạo Hóa: "Trước mặt ta, ngươi chớ có các thần khác", cấm mọi hình thức đa thần giáo và chủ nghĩa thần tượng.',
    scripture_reference: 'Xuất Ê-díp-tô Ký 20:1-3',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Trong Đại Lễ Chuộc Tội (Yom Kippur), Thầy tế lễ thượng phẩm đã làm gì với con dê đực thứ hai (con dê gánh tội - Azazel)?',
    options: [
      'Giết nó tại bàn thờ dâng của lễ thiêu rồi lấy huyết rảy vào Nơi Rất Thánh',
      'Đặt hai tay lên đầu nó xưng các tội ác của dân Y-sơ-ra-ên rồi thả nó vào đồng vắng',
      'Thiêu toàn bộ thịt và da của nó bên ngoài trại quân mà không lấy huyết',
      'Tặng con dê này cho người nghèo và người ngoại bang trú ngụ trong xứ'
    ],
    correct_option: 1,
    explanation: 'Lê-vi Ký 16:21-22 biểu thị sự cất bỏ hoàn toàn án phạt và sự ô uế của tội lỗi ra khỏi cộng đồng dân Chúa, hướng đến Đấng Christ là Đấng gánh tội lỗi thế gian (Giăng 1:29).',
    scripture_reference: 'Lê-vi Ký 16:21-22',
    difficulty: 2
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Lý do tối hậu mà Đức Giê-hô-va truyền lệnh cho toàn thể hội chúng Y-sơ-ra-ên: "Hãy nên thánh" là gì?',
    options: [
      'Vì các ngươi phải vượt trội hơn mọi dân tộc lân bang về đạo đức',
      'Vì Ta, Giê-hô-va Đức Chúa Trời các ngươi, là thánh',
      'Để các ngươi xứng đáng được nhận đất đượm sữa và mật',
      'Để tránh các bệnh dịch truyền nhiễm của xứ Ai Cập'
    ],
    correct_option: 1,
    explanation: 'Lê-vi Ký 19:2 đặt nền tảng luân lý và đạo đức của tuyển dân trên chính bản tính thánh khiết tự hữu của Đức Chúa Trời. Câu này được Sứ đồ Phi-e-rơ tái khẳng định trong I Phi-e-rơ 1:16.',
    scripture_reference: 'Lê-vi Ký 19:2',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Khi dân sự bị rắn lửa cắn trong đồng vắng, Đức Chúa Trời truyền cho Môi-se làm vật gì để hễ ai nhìn đến thì được sống?',
    options: [
      'Đúc một con bò con vàng đặt tại trung tâm hội mạc',
      'Làm một con rắn bằng đồng treo lên một cây sào',
      'Khắc một bảng đá có ghi mười điều răn giơ cao trước dân chúng',
      'Lấy cây gậy trổ hoa của A-rôn chỉ về hướng bốn phương'
    ],
    correct_option: 1,
    explanation: 'Dân-số Ký 21:8-9 được chính Chúa Giê-xu dùng làm biểu tượng tiên tri trực tiếp về sự chết chuộc tội của Ngài: "Xưa Môi-se treo con rắn lên nơi đồng vắng thể nào, thì Con người cũng phải bị treo lên dường ấy" (Giăng 3:14-15).',
    scripture_reference: 'Dân-số Ký 21:8-9',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Bản tuyên xưng đức tin Shema Y-sơ-ra-ên mở đầu bằng mệnh đề căn bản nào?',
    options: [
      'Hỡi Y-sơ-ra-ên, hãy nghe! Giê-hô-va Đức Chúa Trời chúng ta là Giê-hô-va có một không hai',
      'Hỡi Y-sơ-ra-ên, hãy dâng của lễ đầu mùa cho Đấng đã giải phóng ngươi',
      'Hỡi các chi phái Y-sơ-ra-ên, hãy giữ ngày Sa-bát của Chúa các ngươi',
      'Hỡi Y-sơ-ra-ên, hãy bước đi trong sự kính sợ và gìn giữ giao ước'
    ],
    correct_option: 0,
    explanation: 'Phục-truyền 6:4-5 (Shema) là lời tuyên xưng độc thần giáo căn tảng của đức tin Do Thái và Cơ Đốc, dạy lòng kính yêu Chúa hết lòng, hết linh hồn và hết sức mình, được Chúa Giê-xu gọi là điều răn lớn nhất (Ma-thi-ơ 22:37).',
    scripture_reference: 'Phục-truyền Luật-lệ Ký 6:4-5',
    difficulty: 2
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Trong Phục-truyền 18:15, Môi-se tiên tri rằng Đức Chúa Trời sẽ dấy lên cho dân sự một Đấng như thế nào?',
    options: [
      'Một vị vua chiến binh đánh bại mọi kẻ thù La Mã',
      'Một Đấng Tiên Tri như Môi-se dấy lên từ giữa anh em họ',
      'Một thầy tế lễ đời đời theo ban Mên-chi-xê-đéc',
      'Một thiên sứ trưởng với gươm lửa sáng lòa'
    ],
    correct_option: 1,
    explanation: 'Lời tiên tri về Đấng Tiên Tri lớn hơn Môi-se được ứng nghiệm trọn vẹn nơi Đức Chúa Jêsus Christ, như Phi-e-rơ và Ê-tiên đã trích dẫn trong Công-vụ các Sứ-đồ 3:22 và 7:37.',
    scripture_reference: 'Phục-truyền Luật-lệ Ký 18:15',
    difficulty: 2
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Theo Sứ đồ Phao-lô trong Rô-ma chương 3, bởi nguyên nhân nào mà người tin Chúa được xưng công bình vô điều kiện?',
    options: [
      'Bởi vì người ấy đã tuân giữ trọn vẹn mọi phép nghi lễ theo luật Môi-se',
      'Nhờ ân điển Ngài, bởi sự cứu chuộc đã làm trọn trong Đức Chúa Jêsus Christ',
      'Nhờ những công đức và việc từ thiện cá nhân tích lũy qua năm tháng',
      'Nhờ nguồn gốc huyết thống xuất thân từ dòng dõi tuyển dân Áp-ra-ham'
    ],
    correct_option: 1,
    explanation: 'Rô-ma 3:23-24 xác định tình trạng mọi người đều đã phạm tội hụt mất sự vinh hiển Đức Chúa Trời, và sự xưng công bình là quà tặng nhưng không bởi ân điển nhờ giá chuộc của Chúa Cứu Thế Jêsus.',
    scripture_reference: 'Rô-ma 3:23-24',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Rô-ma 8:1 công bố lẽ thật giải phóng vĩ đại nào cho người thuộc về Chúa?',
    options: [
      'Người tin Chúa sẽ không bao giờ gặp phải thử thách hay đau khổ thể xác',
      'Cho nên hiện nay chẳng còn có sự đoán phạt nào cho những kẻ ở trong Đức Chúa Jêsus Christ',
      'Luật pháp Cựu Ước đã bị hủy bỏ hoàn toàn và không còn giá trị luân lý',
      'Mọi người trên thế gian đều tự động được cứu rỗi không cần ăn năn'
    ],
    correct_option: 1,
    explanation: 'Rô-ma 8:1 là một trong những lời khẳng định bảo đảm nhất của Tân Ước về an ninh đời đời của người ở trong Đấng Christ nhờ công tác cứu chuộc trọn vẹn trên thập tự giá.',
    scripture_reference: 'Rô-ma 8:1',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Hình ảnh ẩn dụ trung tâm nào được Phao-lô sử dụng trong I Cô-rinh-tô 12 để diễn tả sự hiệp một trong đa dạng của Hội Thánh?',
    options: [
      'Một đạo quân La Mã với kỷ luật sắt và cấp bậc nghiêm ngặt',
      'Thân thể có nhiều chi thể nhưng chỉ là một thân duy nhất',
      'Một con thuyền lớn vượt qua sóng gió trần gian',
      'Một cây nho với nhiều cành đơm hoa kết trái'
    ],
    correct_option: 1,
    explanation: 'Phao-lô ví Hội Thánh như một Thân thể của Đấng Christ: dù mắt, tai, tay, chân có chức năng khác nhau nhưng đều thuộc về một thân và cần thiết lẫn nhau dưới quyền Đầu là Đấng Christ.',
    scripture_reference: 'I Cô-rinh-tô 12:12-13',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Theo I Cô-rinh-tô 15:3-4, nội dung cốt lõi của Tin Lành mà Phao-lô đã truyền giảng trước hết là gì?',
    options: [
      'Các quy tắc ăn uống kiêng cữ và giữ ngày trăng mới',
      'Đấng Christ chịu chết vì tội chúng ta theo lời Kinh Thánh, Ngài đã bị chôn và đến ngày thứ ba Ngài sống lại',
      'Những bài học luân lý nhân nghĩa theo truyền thống các giáo sư Do Thái',
      'Phương pháp cầu nguyện tĩnh tâm để đạt đến sự giác ngộ tâm linh'
    ],
    correct_option: 1,
    explanation: 'I Cô-rinh-tô 15:3-4 ghi lại bản tín điều nguyên thủy của Hội Thánh tiên khởi: Sự chết chuộc tội, sự chôn và sự phục sinh vinh quang của Đấng Christ theo đúng lời Kinh Thánh dự ngôn.',
    scripture_reference: 'I Cô-rinh-tô 15:3-4',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Theo II Cô-rinh-tô 5:17, tình trạng tâm linh của một người khi ở trong Đấng Christ được mô tả như thế nào?',
    options: [
      'Vẫn là con người cũ nhưng được sửa chữa và cải thiện hành vi bên ngoài',
      'Ấy là người được dựng nên mới; những sự cũ đã qua đi, nầy mọi sự đều trở nên mới',
      'Trở thành một thiên sứ tạm thời sống trong thân xác phàm nhân',
      'Được miễn trừ khỏi mọi quy luật tự nhiên và trách nhiệm xã hội'
    ],
    correct_option: 1,
    explanation: 'Sự tái sinh trong Đấng Christ không phải là tu bổ nhân cách mà là một cuộc sáng tạo tâm linh hoàn toàn mới (kaine ktisis) do Thánh Linh thực hiện.',
    scripture_reference: 'II Cô-rinh-tô 5:17',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Cụm từ then chốt nào trong Ê-phê-sô 2:8-9 bác bỏ hoàn toàn quan điểm tự cứu rỗi bằng việc làm công đức?',
    options: [
      'Bởi vì các ngươi đã giữ trọn vẹn mọi điều răn của tổ phụ',
      'Ấy chẳng phải bởi việc làm đâu, hầu cho không ai khoe mình',
      'Nhờ sự hy sinh lớn lao của các bậc tử đạo tiên khởi',
      'Bởi lòng mộ đạo chân thành và tri thức triết học thâm sâu'
    ],
    correct_option: 1,
    explanation: 'Ê-phê-sô 2:8-9 là khẩu hiệu nền tảng của phong trào Cải Chánh Giáo Hội: Sự cứu rỗi là món quà ban tặng (gift) của Đức Chúa Trời bởi ân điển nhờ đức tin, không bởi việc làm để dập tắt mọi sự tự hào xác thịt.',
    scripture_reference: 'Ê-phê-sô 2:8-9',
    difficulty: 1
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Bài ca về sự tự hạ mình của Đấng Christ (Kenosis) trong Phi-líp 2 chép rằng dẫu Ngài vốn có hình Đức Chúa Trời, Ngài đã làm gì?',
    options: [
      'Tự xưng vương tại thành Giê-ru-sa-lem để đánh đuổi quân đô hộ',
      'Chẳng coi sự bình đẳng với Đức Chúa Trời là sự nên nắm giữ, nhưng tự bỏ mình đi, lấy hình tôi tớ và vâng phục cho đến chết trên cây thập tự',
      'Dùng quyền năng thiên thượng biến đá thành bánh để nuôi muôn dân',
      'Che giấu sự vinh hiển thiên đàng và sống ẩn dật trong sa mạc'
    ],
    correct_option: 1,
    explanation: 'Phi-líp 2:5-11 là một trong những đoạn văn Kitô học vĩ đại nhất của Tân Ước, mô tả sự tự nguyện trút bỏ vinh quang thiên thượng để nhận lấy hình hài tôi tớ và chịu chết đền tội trên thập tự giá.',
    scripture_reference: 'Phi-líp 2:6-8',
    difficulty: 2
  },
  {
    question_type: 'multiple_choice',
    question_text: 'Sách Cô-lô-se chương 1 tôn vinh địa vị tột đỉnh của Chúa Giê-xu đối với muôn vật thọ tạo như thế nào?',
    options: [
      'Ngài là thọ tạo cao cấp nhất được sinh ra trước các thiên sứ',
      'Ngài là hình ảnh của Đức Chúa Trời không thấy được, là Đấng sinh ra trước hết thảy mọi vật dựng nên; muôn vật đều được dựng nên bởi Ngài và vì Ngài',
      'Ngài là một giáo sư đạo đức vĩ đại tiếp nối các đại tiên tri thời Cựu Ước',
      'Ngài là vị quan tòa thứ hai cai trị sau các vua của trần gian'
    ],
    correct_option: 1,
    explanation: 'Cô-lô-se 1:15-17 khẳng định thần tính tuyệt đối và quyền năng sáng tạo của Ngôi Lời (Logos): Ngài không phải là tạo vật, mà là Đấng Sáng Tạo và Đấng Bảo Tồn muôn vật.',
    scripture_reference: 'Cô-lô-se 1:15-17',
    difficulty: 2
  },
  {
    question_type: 'multiple_choice',
    question_text: 'II Ti-mô-thê 3:16 định nghĩa nguồn gốc và công năng của Lời Chúa trong Kinh Thánh như thế nào?',
    options: [
      'Cả Kinh Thánh đều là ý kiến chủ quan của các văn sĩ qua nhiều thời kỳ',
      'Cả Kinh Thánh đều là bởi Đức Chúa Trời soi dẫn, có ích cho sự dạy dỗ, bẻ trách, sửa trị, dạy người trong sự công bình',
      'Chỉ những sách trong Tân Ước mới được thần cảm, còn Cựu Ước chỉ có giá trị lịch sử',
      'Kinh Thánh chỉ có ích khi được giải thích bởi truyền thống của các giáo phụ'
    ],
    correct_option: 1,
    explanation: 'II Ti-mô-thê 3:16 thiết lập giáo lý về sự hà hơi/thần cảm của Kinh Thánh (Theopneustos - God-breathed), bảo đảm thẩm quyền tuyệt đối và tính đầy đủ của Lời Đức Chúa Trời cho đời sống người tin Chúa.',
    scripture_reference: 'II Ti-mô-thê 3:16',
    difficulty: 1
  }
];

function runPsql(sql) {
  const cmd = `docker exec -i bibleknowledge-postgres psql -U postgres -d bible_knowledge -t -A`;
  return execSync(cmd, { input: sql, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
}

function main() {
  console.log('=== SEEDING EXPANDED THEOLOGICAL QUIZ QUESTIONS ===\n');

  let insertedCount = 0;
  let skippedCount = 0;

  for (const q of QUESTIONS) {
    // Check if question already exists by scripture reference & question_type
    const checkSql = `SELECT count(*) FROM quiz_questions WHERE scripture_reference = '${q.scripture_reference}' AND question_type = '${q.question_type}';`;
    const count = parseInt(runPsql(checkSql) || '0', 10);

    if (count > 0) {
      console.log(`[SKIP] Already exists: ${q.scripture_reference}`);
      skippedCount++;
      continue;
    }

    const optionsJson = JSON.stringify(q.options).replace(/'/g, "''");
    const qTextEsc = q.question_text.replace(/'/g, "''");
    const expEsc = q.explanation.replace(/'/g, "''");
    const refEsc = q.scripture_reference.replace(/'/g, "''");

    const insertSql = `
      INSERT INTO quiz_questions (question_type, question_text, options, correct_option, explanation, scripture_reference, difficulty)
      VALUES ('${q.question_type}', '${qTextEsc}', '${optionsJson}'::jsonb, ${q.correct_option}, '${expEsc}', '${refEsc}', ${q.difficulty});
    `;

    runPsql(insertSql);
    console.log(`[INSERT] Added: ${q.scripture_reference} - ${q.question_text.slice(0, 45)}...`);
    insertedCount++;
  }

  console.log(`\n=== SEEDING COMPLETE: ${insertedCount} inserted, ${skippedCount} skipped ===`);
  const total = runPsql("SELECT count(*) FROM quiz_questions;");
  console.log(`Total questions in quiz_questions table: ${total}`);
}

main();
