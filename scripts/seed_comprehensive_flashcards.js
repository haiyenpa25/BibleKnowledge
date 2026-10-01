/**
 * Seed comprehensive 5-type flashcards according to ROADMAP1.md §4 & §5
 * Covers: Person Cards, Verse Cards, Event Cards, Timeline Cards, Word Study Cards.
 */
const { execSync } = require('child_process');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function runSql(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `docker exec -i bibleknowledge-postgres psql -U postgres -d bible_knowledge -c "${escaped}"`;
  return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
}

const COMPREHENSIVE_FLASHCARDS = [
  // ==========================================
  // 1. PERSON CARDS (10 cards)
  // ==========================================
  {
    card_type: 'person',
    difficulty_level: 2,
    front_text: 'Sứ đồ Phi-e-rơ là ai trong Tân Ước?',
    back_text: '• Tên nguyên thủy: Si-môn con Giô-na, Chúa đặt tên là Kê-pha (Phi-e-rơ nghĩa là Đá).\n• Nghề nghiệp: Ngư phủ tại biển Ga-li-lê (thành Bết-sai-đa/Ca-bê-na-um).\n• Anh em: Anh-rê (người dẫn Phi-e-rơ đến với Chúa Giê-xu).\n• Vai trò: Trưởng đoàn Môn đồ, người tuyên tín Chúa Giê-xu là Đấng Christ (Ma-thi-ơ 16:16).\n• Biến cố then chốt: Đi trên mặt nước, chứng kiến Biến hình, chối Chúa 3 lần trong đêm bị bắt, được phục hồi bên bờ hồ (Giăng 21), giảng luận đầy quyền năng ngày Ngũ Tuần (Công-vụ 2) dẫn 3,000 người tin Chúa, mở cửa đạo cho dân ngoại tại nhà Cọt-nây (Công-vụ 10).'
  },
  {
    card_type: 'person',
    difficulty_level: 2,
    front_text: 'Sứ đồ Phao-lô (Sau-lơ người Tạt-sơ) là ai?',
    back_text: '• Xuất thân: Sau-lơ người Tạt-sơ xứ Si-li-si, thuộc chi phái Bên-gia-min, người Pha-ri-si kiên định, học trò của giáo sư Ga-ma-li-ên.\n• Vai trò: Sứ đồ cho dân ngoại (Apostle to the Gentiles).\n• Biến cố then chốt: Bắt bớ Hội Thánh Chúa, được Chúa phục sinh hiện ra trên đường Đa-mách (Công-vụ 9), trải qua 3 chuyến hành trình truyền giáo mở mang Hội Thánh khắp Tiểu Á và Hy Lạp, bị cầm tù tại La-mã.\n• Trước tác: Viết 13 thư tín Tân Ước (từ Rô-ma đến Phi-lê-môn), định hình hệ thống giáo lý cứu rỗi bởi ân điển qua đức tin.'
  },
  {
    card_type: 'person',
    difficulty_level: 2,
    front_text: 'Vua Đa-vít là ai trong Cựu Ước?',
    back_text: '• Xuất thân: Con trai út của Y-sai tại Bết-lê-hem, thuộc chi phái Giu-đa, thiếu niên chăn chiên.\n• Vai trò: Vua thứ hai của vương quốc Y-sơ-ra-ên, người được xức dầu bởi tiên tri Sa-mu-ên, được Chúa gọi là "người đẹp lòng lòng Ta".\n• Biến cố then chốt: Đánh bại gã khổng lồ Gô-li-át bằng dây phóng đá và đức tin (I Sa-mu-ên 17), gắn bó với Giô-na-than, chạy trốn Sau-lơ trong đồng vắng, thống nhất 12 chi phái, lập Giê-ru-sa-lem làm thủ đô, nhận Giao Ước Đa-vít về dòng dõi đời đời (II Sa-mu-ên 7 — cội rễ Đấng Mê-si).\n• Trước tác: Trước giả chính của phần lớn sách Thi Thiên.'
  },
  {
    card_type: 'person',
    difficulty_level: 2,
    front_text: 'Môi-se là ai trong lịch sử cứu chuộc?',
    back_text: '• Xuất thân: Thuộc chi phái Lê-vi, sinh ra tại Ai Cập thời kỳ bị bách hại, được công chúa Pha-ra-ôn nhận làm con nuôi.\n• Vai trò: Người giải phóng dân Y-sơ-ra-ên khỏi ách nô lệ Ai Cập, trung gian ban hành Luật Pháp Giao Ước tại núi Si-na-i, tiên tri vĩ đại của Cựu Ước.\n• 3 giai đoạn 40 năm: 40 năm làm hoàng tử Ai Cập; 40 năm chăn chiên tại Ma-đi-an; 40 năm lãnh đạo dân sự đi trong đồng vắng hướng về Đất Hứa.\n• Biến cố: Bụi gai cháy (Xuất 3), 10 tai vạ, Lễ Vượt Qua, rẽ Biển Đỏ, nhận 10 Điều Răn, dựng Đền Tạm.\n• Trước tác: Viết Ngũ Kinh (Sáng-thế Ký đến Phục-truyền Luật-lệ Ký).'
  },
  {
    card_type: 'person',
    difficulty_level: 1,
    front_text: 'Áp-ra-ham là ai trong Kinh Thánh?',
    back_text: '• Tên gọi: Ban đầu tên Áp-ram ("Cha cao quý"), được Đức Chúa Trời đổi tên thành Áp-ra-ham ("Cha của nhiều dân tộc").\n• Quê hương: Rời thành U-rơ của người Canh-đê và Ha-ran theo tiếng gọi của Chúa để đi đến xứ Ca-na-an (Sáng 12).\n• Danh hiệu: "Tổ phụ của đức tin" và "Bạn của Đức Chúa Trời" (Gia-cơ 2:23).\n• Giao ước: Giao Ước Áp-ra-ham vô điều kiện (Sáng 12, 15, 17) hứa ban đất đai, dòng dõi đông như sao trên trời, và qua dòng dõi người mọi dân tộc sẽ được phước (ứng nghiệm nơi Đấng Christ).\n• Đức tin đỉnh cao: Sẵn sàng dâng Y-sác trên núi Mô-ri-a (Sáng 22).'
  },
  {
    card_type: 'person',
    difficulty_level: 2,
    front_text: 'Tiên tri Ê-li là ai?',
    back_text: '• Xuất thân: Người Thi-sê-be xứ Ga-la-át, thi hành chức vụ trong vương quốc phía Bắc dưới triều vua A-háp và hoàng hậu Giê-sa-bên.\n• Sứ mạng: Đòi lại lòng trung thành tuyệt đối của Y-sơ-ra-ên dành cho Đức Giê-hô-va, chống lại tà giáo Ba-anh và Át-tạt-tê.\n• Biến cố then chốt: Cầu nguyện khiến trời đóng lại không mưa 3 năm 6 tháng, được quạ nuôi bên khe Kê-rít, khiến con trai góa phụ Sa-rép-ta sống lại, thách thức và chiến thắng 450 tiên tri Ba-anh trên núi Cạt-mên bằng lửa giáng từ trời (I Các Vua 18), nghe tiếng thì thầm êm dịu của Chúa tại núi Hô-rếp (Si-na-i), được cất lên trời trong luồng gió lốc bằng xe ngựa lửa (II Các Vua 2).'
  },
  {
    card_type: 'person',
    difficulty_level: 2,
    front_text: 'Giăng Báp-tít (Giăng Người Làm Phép Báp-têm) là ai?',
    back_text: '• Xuất thân: Con trai của thầy tế lễ Xa-cha-ri và bà Ê-li-sa-bét, sinh ra nhờ phép lạ lúc cha mẹ tuổi già, bà con của Chúa Giê-xu.\n• Vai trò: Tiên tri tiên phong dọn đường cho Đấng Mê-si theo lời tiên tri Ê-sai 40:3 và Ma-la-chi 4:5 trong tinh thần và quyền năng của Ê-li.\n• Chức vụ: Kêu gọi ăn năn trong đồng vắng Giu-đê, làm báp-têm tại sông Giô-đanh, làm chứng về Chúa Giê-xu: "Kìa, Chiên Con của Đức Chúa Trời, là Đấng cất tội lỗi thế gian đi!" (Giăng 1:29), làm báp-têm cho chính Chúa Giê-xu.\n• Tuận đạo: Bị Hê-rốt An-ti-pa trảm quyết vì dũng cảm quở trách tội hôn nhân gian dâm của vua.'
  },
  {
    card_type: 'person',
    difficulty_level: 2,
    front_text: 'Giô-sép (Con trai Gia-cốp) là ai?',
    back_text: '• Xuất thân: Con trai thứ 11 của Gia-cốp (Y-sơ-ra-ên) và là con đầu lòng của Ra-chên, người cha yêu quý nhất và tặng áo choàng nhiều màu.\n• Biến cố: Nhận chiêm bao thấy các anh sấp mình, bị các anh ghen ghét bán sang Ai Cập làm nô lệ, phục vụ nhà Phô-ti-pha, giữ lòng thanh khiết trước cám dỗ, bị vu oan tống ngục, giải mộng cho quan tửu chánh và quan thủ khố, giải chiêm bao 7 năm được mùa và 7 năm đói kém cho Pha-ra-ôn.\n• Thăng tiến: Được lập làm tể tướng toàn xứ Ai Cập lúc 30 tuổi, cứu sống gia tộc và các dân tộc trong nạn đói.\n• Tuyên ngôn thần học: "Các anh toan hại tôi, nhưng Đức Chúa Trời lại toan làm điều ích cho tôi" (Sáng 50:20 — hình bóng tuyệt mỹ về Đấng Christ).'
  },
  {
    card_type: 'person',
    difficulty_level: 3,
    front_text: 'Tiên tri Đa-ni-ên là ai?',
    back_text: '• Xuất thân: Dòng quý tộc vương triều Giu-đa, bị bắt lưu đày sang Ba-by-lôn đợt đầu tiên năm 605 TCN dưới thời Nê-bu-cát-nết-xa.\n• Đời sống: Giữ mình thánh khiết không ô uế bởi đồ ăn dâng thần tượng, phục vụ xuất sắc qua 4 đời vua (Nê-bu-cát-nết-xa, Bên-xát-xa, Đa-ri-út, Si-ru) thuộc 2 đế quốc hùng mạnh (Ba-by-lôn và Ba Tư).\n• Phép lạ & Chức vụ: Giải chiêm bao pho tượng vàng và các đế quốc, được bảo vệ sống sót trong hang sư tử, cầu nguyện trung tín ngày 3 lần hướng về Giê-ru-sa-lem.\n• Khải tượng tiên tri: Khải tượng 70 tuần lễ (Đa-ni-ên 9), các con thú biểu tượng cho các đế quốc thế giới, và khải tượng về "Con Người" đến trên mây trời đến cùng Đấng Thượng Cổ nhận vương quốc đời đời (Đa-ni-ên 7:13-14).'
  },
  {
    card_type: 'person',
    difficulty_level: 2,
    front_text: 'Ru-tơ (Người Nữ Mô-áp) là ai?',
    back_text: '• Xuất thân: Người nữ ngoại bang xứ Mô-áp, góa phụ của Mạc-lôn (con trai Ê-li-mê-léc và Na-ô-mi).\n• Lòng trung tín tuyệt đối: Quyết tâm theo mẹ chồng Na-ô-mi về Bết-lê-hem: "Mẹ đi đâu, tôi sẽ đi đó... Dân sự của mẹ tức là dân sự của tôi, Đức Chúa Trời của mẹ tức là Đức Chúa Trời của tôi" (Ru-tơ 1:16).\n• Tình yêu cứu chuộc: Mót lúa trên đồng ruộng của Bô-ô, được Bô-ô chuộc lại sản nghiệp với tư cách Người Cứu Chuộc Gần (Go\'el).\n• Ý nghĩa thần học: Bà trở thành bà cố của Vua Đa-vít, và tên của người nữ ngoại bang này được vinh dự ghi vào gia phả của Chúa Cứu Thế Giê-xu (Ma-thi-ơ 1:5).'
  },

  // ==========================================
  // 2. VERSE CARDS (12 cards)
  // ==========================================
  {
    card_type: 'verse',
    difficulty_level: 1,
    front_text: 'Giăng 3:16 (Phúc Âm Toàn Cảnh Trong Một Câu)',
    back_text: '📖 "Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời."\n\n• Trước giả: Sứ đồ Giăng.\n• Bối cảnh: Chúa Giê-xu đối thoại ban đêm với Ni-cô-đem về sự tái sinh.\n• Trọng tâm giáo lý: Động cơ tối thượng của sự cứu rỗi (Tình yêu Đức Chúa Trời), Cái giá cứu chuộc (Ban Con Độc Sanh), Điều kiện tiếp nhận (Đức tin cá nhân), và Kết quả vĩnh cửu (Không hư mất, nhận sự sống đời đời).'
  },
  {
    card_type: 'verse',
    difficulty_level: 2,
    front_text: 'Rô-ma 8:28 (Sự Quan Phòng Tối Cao Của Chúa)',
    back_text: '📖 "Vả, chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời, tức là cho kẻ được gọi theo ý muốn Ngài đã định."\n\n• Trước giả: Sứ đồ Phao-lô.\n• Ý nghĩa giải kinh: Từ "mọi sự" (panta) bao gồm cả hoạn nạn, thử thách, đau khổ; Đức Chúa Trời nắm quyền tể trị tuyệt đối để dệt nên ích lợi thuộc linh và sự biến đổi nên giống hình ảnh Đấng Christ cho những ai ở trong mục đích vĩnh cửu của Ngài.'
  },
  {
    card_type: 'verse',
    difficulty_level: 1,
    front_text: 'Phi-líp 4:13 (Quyền Năng Của Đấng Christ)',
    back_text: '📖 "Tôi làm được mọi sự nhờ Đấng ban thêm sức cho tôi."\n\n• Trước giả: Sứ đồ Phao-lô (viết khi đang bị cầm tù tại La-mã).\n• Ngữ cảnh: Phao-lô đang chia sẻ về bí quyết thỏa lòng trong mọi cảnh ngộ — dù no hay đói, dù dư dật hay thiếu thốn. "Mọi sự" ở đây là khả năng chịu đựng và đắc thắng mọi hoàn cảnh nhờ sức thiêng nội tại của Đấng Christ.'
  },
  {
    card_type: 'verse',
    difficulty_level: 1,
    front_text: 'Thi-thiên 23:1 (Đức Giê-hô-va Là Đấng Chăn Giữ)',
    back_text: '📖 "Đức Giê-hô-va là Đấng chăn giữ tôi: tôi chẳng thiếu thốn gì."\n\n• Trước giả: Vua Đa-vít.\n• Ý nghĩa: Danh hiệu Giê-hô-va Rohi (Đấng Chăn Chiên). Người tin Chúa đặt mình dưới sự bảo bọc, dẫn dắt và chu cấp trọn vẹn của Chúa, nên tìm thấy sự bình an tuyệt đối không còn âu lo thiếu thốn.'
  },
  {
    card_type: 'verse',
    difficulty_level: 2,
    front_text: 'Châm-ngôn 3:5-6 (Hết Lòng Tin Cậy Đức Giê-hô-va)',
    back_text: '📖 "Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con; phàm trong các việc làm của con, khá nhận biết Ngài, thì Ngài sẽ chỉ dẫn các nẻo của con."\n\n• Trước giả: Vua Sa-lô-môn.\n• Nguyên tắc khôn ngoan: Sự đầu phục ý chí hoàn toàn, không dựa vào lý trí hạn hẹp của xác thịt, nhưng công nhận quyền tể trị của Chúa trong từng quyết định thường nhật để Ngài san bằng mọi lối đi gập ghềnh.'
  },
  {
    card_type: 'verse',
    difficulty_level: 2,
    front_text: 'Ga-la-ti 2:20 (Đời Sống Cùng Đóng Đinh Với Đấng Christ)',
    back_text: '📖 "Tôi đã bị đóng đinh vào thập tự giá với Đấng Christ, mà tôi sống, không phải là tôi sống nữa, nhưng Đấng Christ sống trong tôi; nay tôi còn sống trong xác thịt, ấy là sống trong đức tin của Con Đức Chúa Trời, là Đấng đã yêu tôi, và đã phó chính mình Ngài vì tôi."\n\n• Ý nghĩa: Bản ngã cũ (tội lỗi, kiêu ngạo) đã chết trên thập tự giá; người Cơ Đốc nay sống một đời sống mới được tiếp sinh lực bởi chính sự hiện diện phục sinh của Đấng Christ ngự trị bên trong.'
  },
  {
    card_type: 'verse',
    difficulty_level: 2,
    front_text: 'Ê-phê-sô 2:8-9 (Cứu Rỗi Bởi Ân Điển Qua Đức Tin)',
    back_text: '📖 "Vả, ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu, điều đó không phải đến từ anh em, bèn là sự ban cho của Đức Chúa Trời. Ấy chẳng phải bởi việc làm đâu, hầu cho không ai khoe mình."\n\n• Nền tảng cải chánh: Sola Gratia (Chỉ bởi ân điển) & Sola Fide (Chỉ qua đức tin). Sự cứu rỗi là món quà nhưng không 100% từ Đức Chúa Trời, loại trừ mọi nỗ lực công đức tôn giáo của loài người.'
  },
  {
    card_type: 'verse',
    difficulty_level: 2,
    front_text: 'II Ti-mô-thê 3:16-17 (Uy Quyền Của Lời Kinh Thánh)',
    back_text: '📖 "Cả Kinh Thánh đều là bởi Đức Chúa Trời soi dẫn, có ích cho sự dạy dỗ, bẻ trách, sửa trị, dạy người trong sự công bình, hầu cho người của Đức Chúa Trời được trọn vẹn và sắm sẵn để làm mọi việc lành."\n\n• Thuật ngữ then chốt: "Soi dẫn" (Theopneustos — Chúa thở ra). Khẳng định tính không sai lạc, thẩm quyền tối cao và sự đầy đủ của 66 sách Kinh Thánh trong việc định hình tâm linh Cơ Đốc nhân.'
  },
  {
    card_type: 'verse',
    difficulty_level: 1,
    front_text: 'Giô-suê 1:9 (Vững Vàng Và Can Đảm)',
    back_text: '📖 "Ta há không có phán dặn ngươi sao? Hãy vững lòng bền chí, chớ run sợ, chớ kinh khủng; vì Giê-hô-va Đức Chúa Trời ngươi vẫn ở cùng ngươi trong mọi nơi ngươi đi."\n\n• Bối cảnh: Giô-suê nhận trọng trách lãnh đạo dân sự tiến vào chinh phục Đất Hứa sau khi Môi-se qua đời.\n• Lời hứa: Sự hiện diện bất biến của Đức Chúa Trời là cội nguồn của lòng can đảm chiến thắng mọi trở ngại.'
  },
  {
    card_type: 'verse',
    difficulty_level: 1,
    front_text: 'Ma-thi-ơ 28:19-20 (Đại Mạng Lệnh Của Chúa Giê-xu)',
    back_text: '📖 "Vậy, hãy đi dạy dỗ muôn dân, hãy nhân danh Đức Cha, Đức Con, và Đức Thánh Linh mà làm phép báp-têm cho họ, và dạy họ giữ hết cả mọi điều mà ta đã truyền cho các ngươi. Và này, ta thường ở cùng các ngươi luôn cho đến tận thế."\n\n• Trọng tâm: Mạng lệnh làm môn đồ hóa muôn dân (make disciples), báp-têm nhân danh Ba Ngôi Đức Chúa Trời, giáo dục Lời Chúa, cùng lời hứa đồng hành vĩnh cửu.'
  },
  {
    card_type: 'verse',
    difficulty_level: 2,
    front_text: 'Rô-ma 12:1-2 (Dâng Thân Thể Làm Của Lễ Sống)',
    back_text: '📖 "Vậy, hỡi anh em, tôi lấy sự thương xót của Đức Chúa Trời khuyên anh em nên dâng thân thể mình làm của lễ sống và thánh, đẹp lòng Đức Chúa Trời, ấy là sự thờ phượng phải lẽ của anh em. Đừng làm theo đời nầy, nhưng hãy biến hóa bởi sự đổi mới của tâm thần mình..."\n\n• Trọng tâm: Sự thờ phượng đích thực không chỉ là nghi thức tôn giáo mà là toàn bộ đời sống thánh khiết dâng lên Chúa, từ chối khuôn mẫu thế gian để tâm trí được Chúa canh tân.'
  },
  {
    card_type: 'verse',
    difficulty_level: 2,
    front_text: 'I Cô-rinh-tô 13:4-7 (Bản Thi Ca Tình Yêu Thương)',
    back_text: '📖 "Tình yêu thương hay nhịn nhục; tình yêu thương hay nhân từ; tình yêu thương chẳng ghen tị, chẳng khoe mình, chẳng lên mình kiêu ngạo, chẳng làm điều trái phép, chẳng kiếm tư lợi, chẳng nóng giận, chẳng nghi ngờ sự dữ... Tình yêu thương dung thứ mọi sự, tin mọi sự, trông cậy mọi sự, nín chịu mọi sự."\n\n• Ý nghĩa: Tình yêu Agape siêu nhiên — bản tính của Đức Chúa Trời, giá trị cao trọng hơn hết mọi ân tứ thuộc linh.'
  },

  // ==========================================
  // 3. EVENT CARDS (10 cards)
  // ==========================================
  {
    card_type: 'event',
    difficulty_level: 2,
    front_text: 'Sự kiện Ngày Lễ Ngũ Tuần (Pentecost) xảy ra ở đâu và có ý nghĩa gì?',
    back_text: '• Địa điểm: Thành Giê-ru-sa-lem (phòng cao nơi các môn đồ nhóm lại cầu nguyện).\n• Kinh Thánh: Công-vụ các Sứ-đồ 2:1-47.\n• Biến cố: Tiếng gió thổi ào ào, lưỡi rời rạc như lưỡi lửa ngự trên từng người, các môn đồ được đầy dẫy Đức Thánh Linh và nói các thứ tiếng khác nhau.\n• Kết quả & Ý nghĩa: Bài giảng của Phi-e-rơ đem 3,000 người vào Hội Thánh; đánh dấu sự khai sinh chính thức của Hội Thánh Tân Ước và thời kỳ Đức Thánh Linh giáng lâm ngự trị trong người tin Chúa.'
  },
  {
    card_type: 'event',
    difficulty_level: 2,
    front_text: 'Biến cố Lễ Vượt Qua (Passover) đầu tiên diễn ra tại đâu và có ý nghĩa gì?',
    back_text: '• Địa điểm: Xứ Ai Cập (vùng Gô-sen nơi dân Y-sơ-ra-ên sinh sống).\n• Kinh Thánh: Xuất Ê-díp-tô Ký 12:1-30.\n• Biến cố: Mỗi gia đình giết một chiên con không tì vết, bôi huyết lên mày cửa và hai thanh cửa. Thiên sứ hủy diệt đi ngang qua xứ Ai Cập, thấy huyết bèn vượt qua (pass over), bảo toàn tính mạng cho các con đầu lòng Y-sơ-ra-ên trong khi các con đầu lòng Ai Cập bị tiêu diệt.\n• Ý nghĩa hình bóng: Chiên Con Lễ Vượt Qua là hình bóng tiên tri hoàn hảo về Chúa Cứu Thế Giê-xu bị đóng đinh đổ huyết để giải phóng nhân loại khỏi án phạt của tội lỗi.'
  },
  {
    card_type: 'event',
    difficulty_level: 2,
    front_text: 'Biến cố Rẽ Biển Đỏ diễn ra ở đâu và thể hiện điều gì?',
    back_text: '• Địa điểm: Bờ Biển Đỏ (Hồng Hải / Vịnh Suez).\n• Kinh Thánh: Xuất Ê-díp-tô Ký 14:1-31.\n• Biến cố: Dân Y-sơ-ra-ên bị kẹp giữa Biển Đỏ phía trước và đạo binh chiến xa Pha-ra-ôn đuổi gấp phía sau. Môi-se giơ gậy trên biển theo lệnh Chúa, ngọn gió đông thổi mạnh suốt đêm rẽ nước làm đôi tạo thành bức tường hai bên, dân sự đi qua biển như trên đất khô ráo. Khi quân Ai Cập đuổi theo, nước tràn lấp tiêu diệt toàn bộ đạo quân.\n• Ý nghĩa: Sự giải cứu vĩ đại quyền năng của Đức Giê-hô-va, ấn chứng sự ra đời của một tuyển dân độc lập thuộc về Chúa.'
  },
  {
    card_type: 'event',
    difficulty_level: 3,
    front_text: 'Sự kiện Chúa Giê-xu Biến Hình (Transfiguration) diễn ra ở đâu?',
    back_text: '• Địa điểm: Trên một ngọn núi cao (truyền thống là Núi Hẹt-môn hoặc Núi Tha-bô).\n• Nhân chứng: Phi-e-rơ, Gia-cơ và Giăng.\n• Kinh Thánh: Ma-thi-ơ 17:1-9, Mác 9:2-8, Lu-ca 9:28-36.\n• Hiện tượng: Mặt Ngài sáng láng như mặt trời, áo Ngài trắng như ánh sáng rực rỡ; Môi-se (đại diện cho Luật Pháp) và Ê-li (đại diện cho Các Tiên Tri) hiện ra đàm đạo với Chúa về sự xuất ly (sự chết) của Ngài tại Giê-ru-sa-lem; tiếng phán từ đám mây sáng rực: "Này là Con yêu dấu của ta, đẹp lòng ta mọi đường; hãy nghe lời Con đó!".'
  },
  {
    card_type: 'event',
    difficulty_level: 1,
    front_text: 'Sự Phục Sinh của Chúa Cứu Thế Giê-xu diễn ra tại đâu và có ý nghĩa gì?',
    back_text: '• Địa điểm: Ngôi mộ trống trong khu vườn gần đồi Gô-gô-tha, Giê-ru-sa-lem.\n• Kinh Thánh: Ma-thi-ơ 28, Mác 16, Lu-ca 24, Giăng 20.\n• Thời điểm: Ngày thứ nhất trong tuần (Chúa Nhật), sau 3 ngày trong mồ mả.\n• Chứng cớ: Ngôi mộ trống, vải liệm xếp ngăn nắp, thiên sứ hiện ra báo tin, Chúa hiện ra với Ma-ri Ma-đơ-len, hai môn đồ trên đường Em-ma-út, nhóm 11 môn đồ, và hơn 500 anh em cùng một lúc (I Cô-rinh-tô 15:6).\n• Ý nghĩa tối thượng: Đấng Christ chiến thắng sự chết, tội lỗi và ma quỷ, ấn chứng lời xưng công bình và bảo đảm sự sống lại đời đời cho mọi tín hữu.'
  },
  {
    card_type: 'event',
    difficulty_level: 1,
    front_text: 'Sự Đóng Đinh của Chúa Giê-xu (Crucifixion) diễn ra tại đâu?',
    back_text: '• Địa điểm: Đồi Gô-gô-tha (tiếng Hy Lạp là Kranion / Calvaria nghĩa là "Nơi Cái Sọ"), bên ngoài tường thành Giê-ru-sa-lem.\n• Kinh Thánh: Ma-thi-ơ 27, Giăng 19.\n• Hiện tượng siêu nhiên: Trời đất tối tăm suốt 3 giờ (từ 12h trưa đến 3h chiều), bức màn trong đền thờ xé đôi từ trên xuống dưới, đất rúng động, đá vỡ ra.\n• Lời tuyên bố đắc thắng: "Mọi sự đã được trọn!" (Tetelestai — nợ tội lỗi đã trả xong toàn bộ).'
  },
  {
    card_type: 'event',
    difficulty_level: 2,
    front_text: 'Sự sụp đổ của bức thành Giê-ri-cô diễn ra như thế nào?',
    back_text: '• Địa điểm: Thành cổ Giê-ri-cô, cửa ngõ tiến vào Đất Hứa xứ Ca-na-an.\n• Lãnh đạo: Giô-suê.\n• Kinh Thánh: Giô-suê 6:1-27.\n• Chiến thuật đức tin: Dân sự đi vòng quanh thành mỗi ngày 1 lần trong 6 ngày; ngày thứ bảy đi vòng quanh 7 lần; các thầy tế lễ thổi kèn sừng cừu, dân sự đồng thanh reo hò lớn tiếng; các vách thành kiên cố sụp đổ tan tành ngay tại chỗ.\n• Khảo cổ học: Các cuộc khai quật tại Tell es-Sultan phát hiện tường thành gạch bùn sụp đổ hướng ra ngoài tạo thành bậc thang cho quân xâm lược tràn vào.'
  },
  {
    card_type: 'event',
    difficulty_level: 2,
    front_text: 'Cuộc đọ sức lịch sử giữa Tiên tri Ê-li và 450 tiên tri Ba-anh diễn ra ở đâu?',
    back_text: '• Địa điểm: Đỉnh Núi Cạt-mên (Mount Carmel), miền Bắc Y-sơ-ra-ên.\n• Kinh Thánh: I Các Vua 18:16-46.\n• Thử thách: Lập bàn thờ, đặt sinh tế nhưng không mồi lửa; thần nào đáp lời bằng lửa thì ấy là Đức Chúa Trời chân thật.\n• Kết quả: Các tiên tri Ba-anh kêu gào rạch mình suốt từ sáng đến chiều không kết quả; Ê-li tu bổ bàn thờ Chúa bằng 12 hòn đá, xối 3 lần nước ướt đẫm, cầu nguyện một lời ngắn gọn; lửa của Đức Giê-hô-va giáng xuống thiêu rụi của lễ, củi, đá, bụi và liếm sạch nước trong mương. Toàn dân sấp mặt kêu lên: "Giê-hô-va là Đức Chúa Trời!".'
  },
  {
    card_type: 'event',
    difficulty_level: 2,
    front_text: 'Sự kiện biến đổi cuộc đời của Sau-lơ (Phao-lô) diễn ra tại đâu?',
    back_text: '• Địa điểm: Trên con đường tiến về thành Đa-mách (Damascus, Syria).\n• Kinh Thánh: Công-vụ các Sứ-đồ 9:1-19.\n• Biến cố: Giữa ban trưa, ánh sáng chói lòa từ trời chiếu quanh Sau-lơ; ông ngã xuống đất và nghe tiếng phán: "Sau-lơ, Sau-lơ, sao ngươi bắt bớ ta?... Ta là Giê-xu mà ngươi bắt bớ". Ông bị mù mắt 3 ngày, được dẫn vào thành Đa-mách, môn đồ A-na-nia được Chúa sai đến đặt tay cầu nguyện, vảy rơi khỏi mắt, ông chịu phép báp-têm và bắt đầu rao giảng Chúa Giê-xu là Con Đức Chúa Trời.'
  },
  {
    card_type: 'event',
    difficulty_level: 3,
    front_text: 'Lễ Cung Hiến Đền Thờ Thứ Nhất của Sa-lô-môn diễn ra tại đâu và có biểu hiện gì?',
    back_text: '• Địa điểm: Núi Mô-ri-a, Giê-ru-sa-lem.\n• Kinh Thánh: I Các Vua 8:1-66, II Sử-ký 5-7.\n• Biến cố: Rước Hòm Giao Ước từ Si-ôn vào Nơi Chí Thánh của Đền Thờ mới xây dựng; Vua Sa-lô-môn quỳ gối dang tay cầu nguyện cung hiến cảm động; mây vinh quang Shekinah của Đức Giê-hô-va giáng xuống đầy dẫy đền thờ đến nỗi các thầy tế lễ không thể đứng thi hành chức vụ; lửa từ trời giáng xuống thiêu hóa của lễ thiêu.'
  },

  // ==========================================
  // 4. TIMELINE CARDS (10 cards — So sánh thứ tự niên đại §4)
  // ==========================================
  {
    card_type: 'timeline',
    difficulty_level: 2,
    front_text: 'Giữa Biến cố Xuất Hành (Moses) và Việc Xây Đền Thờ Thứ Nhất (Solomon), sự kiện nào xảy ra trước?',
    back_text: '⏳ ĐÁP ÁN: BIẾN CỐ XUẤT HÀNH XẢY RA TRƯỚC (~1446 TCN).\n\n• Xuất Hành khỏi Ai Cập: Khoảng năm 1446 TCN dưới sự dẫn dắt của Môi-se.\n• Xây Đền Thờ Sa-lô-môn: Bắt đầu vào năm thứ 4 triều đại Sa-lô-môn, khoảng năm 966 TCN (tức 480 năm sau cuộc Xuất Hành theo đúng I Các Vua 6:1).'
  },
  {
    card_type: 'timeline',
    difficulty_level: 2,
    front_text: 'Giữa Cuộc Lưu Đày Ba-by-lôn và Chức Vụ Tiên Tri Ê-sai, sự kiện nào xảy ra trước?',
    back_text: '⏳ ĐÁP ÁN: CHỨC VỤ TIÊN TRI Ê-SAI DIỄN RA TRƯỚC (~740–681 TCN).\n\n• Tiên tri Ê-sai: Thi hành chức vụ tại vương quốc phía Nam Giu-đa từ năm vua Ô-xia băng hà (~740 TCN) đến thời vua Ê-xê-chia.\n• Cuộc Lưu Đày Ba-by-lôn: Xảy ra hơn 100 năm sau đó, khi Nê-bu-cát-nết-xa phá hủy Giê-ru-sa-lem vào năm 586 TCN (II Các Vua 25).'
  },
  {
    card_type: 'timeline',
    difficulty_level: 2,
    front_text: 'Giữa Giao Ước Áp-ra-ham và Luật Pháp Ban Trên Núi Si-na-i, sự kiện nào xảy ra trước?',
    back_text: '⏳ ĐÁP ÁN: GIAO ƯỚC ÁP-RA-HAM CÓ TRƯỚC (~2091 TCN).\n\n• Giao Ước Áp-ra-ham: Được lập khoảng năm 2091 TCN (Sáng-thế Ký 12, 15).\n• Luật Pháp Si-na-i: Được ban qua Môi-se khoảng năm 1446 TCN.\n• Bằng chứng Kinh Thánh: Sứ đồ Phao-lô khẳng định trong Ga-la-ti 3:17: "Giao ước mà Đức Chúa Trời đã định trước, thì luật pháp sau bốn trăm ba mươi năm mới có, không thể hủy bỏ đặng".'
  },
  {
    card_type: 'timeline',
    difficulty_level: 2,
    front_text: 'Giữa Triều Đại Vua Đa-vít và Thời Kỳ Các Quan Xét, thời kỳ nào diễn ra trước?',
    back_text: '⏳ ĐÁP ÁN: THỜI KỲ CÁC QUAN XÉT DIỄN RA TRƯỚC (~1375–1050 TCN).\n\n• Thời kỳ Các Quan Xét: Kéo dài từ sau khi Giô-suê qua đời đến thời tiên tri Sa-mu-ên (~1375–1050 TCN) với chu kỳ sa ngã - áp bức - kêu cầu - giải cứu.\n• Triều đại Vua Đa-vít: Diễn ra sau thời kỳ Quan Xét và sau thời Vua Sau-lơ, kéo dài 40 năm (~1010–970 TCN).'
  },
  {
    card_type: 'timeline',
    difficulty_level: 1,
    front_text: 'Giữa Sự Đóng Đinh của Chúa Giê-xu và Ngày Lễ Ngũ Tuần Đổ Thánh Linh, sự kiện nào xảy ra trước?',
    back_text: '⏳ ĐÁP ÁN: SỰ ĐÓNG ĐINH & PHỤC SINH XẢY RA TRƯỚC (Tháng Nisan, năm 30/33 SC).\n\n• Sự Đóng Đinh: Diễn ra vào đúng dịp Lễ Vượt Qua (thứ Sáu tuần Khổ Nạn).\n• Sự Phục Sinh: Ngày thứ ba (Chúa Nhật Lễ Phục Sinh).\n• Lễ Ngũ Tuần (Pentecost nghĩa là 50 ngày): Diễn ra đúng 50 ngày sau Lễ Vượt Qua (Công-vụ 1-2).'
  },
  {
    card_type: 'timeline',
    difficulty_level: 3,
    front_text: 'Giữa Chuyến Truyền Giáo Thứ Nhất của Phao-lô và Giáo Hội Nghị Giê-ru-sa-lem, điều gì diễn ra trước?',
    back_text: '⏳ ĐÁP ÁN: CHUYẾN TRUYỀN GIÁO THỨ NHẤT DIỄN RA TRƯỚC (~46–48 SC).\n\n• Chuyến truyền giáo 1 của Phao-lô & Ba-na-ba: Đến đảo Chíp-rơ và vùng Nam Ga-la-ti khoảng năm 46–48 SC (Công-vụ 13–14).\n• Giáo Hội Nghị Giê-ru-sa-lem: Họp vào khoảng năm 49/50 SC (Công-vụ 15) chính là để giải quyết tranh luận nảy sinh sau chuyến đi này: Liệu tín hữu ngoại bang có buộc phải chịu phép cắt bì theo luật Môi-se để được cứu không.'
  },
  {
    card_type: 'timeline',
    difficulty_level: 2,
    front_text: 'Giữa Sự Sụp Đổ của Sa-ma-ri (Bắc Y-sơ-ra-ên) và Sự Sụp Đổ của Giê-ru-sa-lem (Nam Giu-đa), vương quốc nào sụp đổ trước?',
    back_text: '⏳ ĐÁP ÁN: SA-MA-RI (BẮC Y-SƠ-RA-ÊN) SỤP ĐỔ TRƯỚC (Năm 722 TCN).\n\n• Vương quốc phía Bắc (10 chi phái, thủ đô Sa-ma-ri): Sụp đổ năm 722 TCN dưới tay đế quốc A-si-ri (Sargon II — II Các Vua 17).\n• Vương quốc phía Nam (Giu-đa, thủ đô Giê-ru-sa-lem): Tồn tại thêm 136 năm, mãi đến năm 586 TCN mới bị Ba-by-lôn tàn phá (II Các Vua 25).'
  },
  {
    card_type: 'timeline',
    difficulty_level: 3,
    front_text: 'Giữa Chức Vụ Tiên Tri Đa-ni-ên và Cuộc Hồi Hương Xây Lại Đền Thờ của Xô-rô-ba-bên, điều gì diễn ra trước?',
    back_text: '⏳ ĐÁP ÁN: CHỨC VỤ TIÊN TRI ĐA-NI-ÊN DIỄN RA TRƯỚC (~605–536 TCN).\n\n• Tiên tri Đa-ni-ên: Bị đày và phục vụ tại triều đình Ba-by-lôn và Ba Tư suốt từ năm 605 TCN đến những năm đầu triều đại Si-ru.\n• Cuộc hồi hương của Xô-rô-ba-bên: Diễn ra sau sắc chỉ của Vua Si-ru năm 538 TCN, dẫn 5 vạn dân lưu đày hồi hương xây lại Đền Thờ thứ hai (hoàn tất năm 516 TCN — E-xơ-ra 1-6).'
  },
  {
    card_type: 'timeline',
    difficulty_level: 1,
    front_text: 'Giữa Tiếng Kêu Trong Đồng Vắng của Giăng Báp-tít và Sự Khởi Đầu Chức Vụ Công Khai của Chúa Giê-xu, điều gì diễn ra trước?',
    back_text: '⏳ ĐÁP ÁN: CHỨC VỤ GIĂNG BÁP-TÍT DIỄN RA TRƯỚC (~26–27 SC).\n\n• Giăng Báp-tít: Bắt đầu rao giảng sự ăn năn và dọn đường trước trong đồng vắng Giu-đê (Lu-ca 3:1-3).\n• Chúa Giê-xu: Đến nhận phép báp-têm từ Giăng tại sông Giô-đanh, chịu ma quỷ cám dỗ 40 ngày trong đồng vắng, rồi sau đó mới chính thức khởi sự chức vụ công khai khi Giăng bị tống ngục (Mác 1:14-15).'
  },
  {
    card_type: 'timeline',
    difficulty_level: 1,
    front_text: 'Giữa Cơn Nước Lụt Thời Nô-ê và Biến Cố Tháp Ba-bên Lộn Xộn Tiếng Nói, sự kiện nào xảy ra trước?',
    back_text: '⏳ ĐÁP ÁN: CƠN NƯỚC LỤT NÔ-Ê XẢY RA TRƯỚC (Sáng-thế Ký 6–9).\n\n• Nước Lụt Đại Hồng Thủy: Hủy diệt nhân loại gian ác thời cổ, chỉ có gia đình 8 người của Nô-ê sống sót trong tàu (Sáng 6-9).\n• Tháp Ba-bên: Xảy ra nhiều thế hệ sau đó (Sáng-thế Ký 11), khi hậu duệ của Nô-ê nhóm lại tại đồng bằng Si-nê-a toan xây tháp cao chọc trời để làm nổi danh mình, dẫn đến việc Chúa làm lộn xộn ngôn ngữ và tản lạc khắp đất.'
  },

  // ==========================================
  // 5. WORD STUDY CARDS (10 cards — Căn từ Hy Lạp & Hê-bơ-rơ §4, §14)
  // ==========================================
  {
    card_type: 'word',
    difficulty_level: 2,
    front_text: 'Khảo Cứu Từ Hy Lạp: ἀγάπη (Agape — G0026)',
    back_text: '• Ngôn ngữ: Hy Lạp Koine.\n• Lemma: ἀγάπη (Agape) | Mã Strong: G0026.\n• Phiên âm: ag-ah\'-pay.\n• Định nghĩa: Tình yêu vị tha vô điều kiện, tự hiến, không dựa trên sự xứng đáng của đối tượng tiếp nhận; bản tính tối thượng của Đức Chúa Trời (I Giăng 4:8).\n• Phân biệt: Khác với Phileo (tình bạn hữu, tình cảm thân ái), Eros (tình yêu nam nữ si mê), Storge (tình cảm gia đình ruột thịt).\n• Câu kinh điển: Giăng 3:16, I Cô-rinh-tô 13, Rô-ma 5:8.'
  },
  {
    card_type: 'word',
    difficulty_level: 2,
    front_text: 'Khảo Cứu Từ Hê-bơ-rơ: שָׁלוֹם (Shalom — H7965)',
    back_text: '• Ngôn ngữ: Hê-bơ-rơ Cựu Ước.\n• Lemma: שָׁלוֹם (Shalom) | Mã Strong: H7965.\n• Phiên âm: shaw-lome\'.\n• Định nghĩa: Sự trọn vẹn, toàn hảo, thịnh vượng tâm linh, bình an nội tâm, hòa thuận trong các mối quan hệ và sự an nghỉ trong giao ước của Chúa.\n• Chiều sâu thần học: Không chỉ là "vắng bóng chiến tranh", mà là sự phục hồi trọn vẹn mọi điều đổ vỡ theo trật tự ban đầu của Đức Chúa Trời.\n• Ứng nghiệm: Chúa Giê-xu là "Chúa Bình An" (Sar Shalom — Ê-sai 9:5, Giăng 14:27).'
  },
  {
    card_type: 'word',
    difficulty_level: 3,
    front_text: 'Khảo Cứu Từ Hê-bơ-rơ: חֶסֶד (Hesed / Chesed — H2617)',
    back_text: '• Ngôn ngữ: Hê-bơ-rơ Cựu Ước.\n• Lemma: חֶסֶד (Hesed) | Mã Strong: H2617.\n• Phiên âm: kheh\'-sed.\n• Định nghĩa: Lòng nhân từ kiên định, tình yêu giao ước trung tín đời đời (Covenant Loyalty / Steadfast Love).\n• Đặc điểm: Tình yêu phát xuất từ giao ước bất biến của Chúa, luôn tha thứ và theo đuổi con người dù họ bất trung; thường đi kèm với Emet (Chân thật).\n• Câu kinh điển: Thi-thiên 136 ("Vì sự nhân từ Ngài còn đến đời đời"), Ca-thương 3:22-23.'
  },
  {
    card_type: 'word',
    difficulty_level: 2,
    front_text: 'Khảo Cứu Từ Hy Lạp: πίστις (Pistis — G4102)',
    back_text: '• Ngôn ngữ: Hy Lạp Koine.\n• Lemma: πίστις (Pistis) | Mã Strong: G4102.\n• Phiên âm: pis\'-tis.\n• Định nghĩa: Đức tin, sự tin cậy vững chắc, lòng xác tín và sự ký thác trọn vẹn sinh mạng vào thân vị và lời hứa của Đức Chúa Trời.\n• 3 yếu tố thần học: Notitia (tri thức về Lời Chúa), Assensus (đồng thuận của lý trí), Fiducia (sự tin cậy và trao phó hoàn toàn của ý chí).\n• Câu kinh điển: Hê-bơ-rơ 11:1, Rô-ma 1:17, Ê-phê-sô 2:8.'
  },
  {
    card_type: 'word',
    difficulty_level: 3,
    front_text: 'Khảo Cứu Từ Hy Lạp: λόγος (Logos — G3056)',
    back_text: '• Ngôn ngữ: Hy Lạp Koine.\n• Lemma: λόγος (Logos) | Mã Strong: G3056.\n• Phiên âm: log\'-os.\n• Định nghĩa: Lời phán, lý trí tối cao, sự khải thị trọn hảo của Đức Chúa Trời.\n• Thần học Giăng: Sứ đồ Giăng dùng Logos để chỉ về Thân Vị của Chúa Cứu Thế Giê-xu — Đấng Tự Hữu từ ban đầu, đồng đẳng với Đức Chúa Trời, Đấng Sáng Tạo muôn vật và đã trở nên xác thịt cư ngụ giữa loài người.\n• Câu kinh điển: Giăng 1:1 ("Ban đầu có Ngôi Lời, Ngôi Lời ở cùng Đức Chúa Trời, và Ngôi Lời là Đức Chúa Trời"), Giăng 1:14.'
  },
  {
    card_type: 'word',
    difficulty_level: 2,
    front_text: 'Khảo Cứu Từ Hy Lạp: κοινωνία (Koinonia — G2842)',
    back_text: '• Ngôn ngữ: Hy Lạp Koine.\n• Lemma: κοινωνία (Koinonia) | Mã Strong: G2842.\n• Phiên âm: koy-nohn-ee\'-ah.\n• Định nghĩa: Sự thông công sâu nhiệm, sự hiệp nhất gắn bó, sự đồng dự phần và chia sẻ cuộc sống chung trong ân điển.\n• Biểu hiện thực tế: Người Cơ Đốc thông công với Đức Chúa Trời và thông công gắn bó với nhau qua việc học Lời Chúa, bẻ bánh, cầu nguyện và san sẻ của cải cho người thiếu thốn.\n• Câu kinh điển: Công-vụ 2:42, I Giăng 1:3, II Cô-rinh-tô 13:13.'
  },
  {
    card_type: 'word',
    difficulty_level: 2,
    front_text: 'Khảo Cứu Từ Hy Lạp: μετάνοια (Metanoia — G3341)',
    back_text: '• Ngôn ngữ: Hy Lạp Koine.\n• Lemma: μετάνοia (Metanoia) | Mã Strong: G3341.\n• Phiên âm: met-an\'-oy-ah.\n• Cấu tạo từ: Meta (biến đổi) + Nous (tâm trí).\n• Định nghĩa: Sự ăn năn thật — sự thay đổi triệt để về nhận thức, tâm trí, tấm lòng dẫn đến sự quay ngoắt 180 độ từ bỏ tội lỗi để quy hướng trọn vẹn về Đức Chúa Trời.\n• Phân biệt: Khác với cảm giác ân hận hay tiếc nuối nhất thời (Metamelomai); Metanoia luôn sinh ra bông trái xứng đáng với sự ăn năn.\n• Câu kinh điển: Ma-thi-ơ 3:8, Mác 1:15, Công-vụ 2:38.'
  },
  {
    card_type: 'word',
    difficulty_level: 3,
    front_text: 'Khảo Cứu Từ Hê-bơ-rơ: גֹּאֵל (Go\'el — H1350)',
    back_text: '• Ngôn ngữ: Hê-bơ-rơ Cựu Ước.\n• Lemma: גָּאַל (Ga\'al / Go\'el) | Mã Strong: H1350.\n• Phiên âm: go-ale\'.\n• Định nghĩa: Người Cứu Chuộc Gần (Kinsman-Redeemer).\n• Luật pháp Cựu Ước: Người bà con huyết thống gần gũi có quyền và trách nhiệm chuộc lại sản nghiệp bị cầm cố, chuộc tự do cho người thân bị bán làm nô lệ, và cưới góa phụ để nối dõi (Luật Lê-vi 25, Phục-truyền 25).\n• Ý nghĩa Đấng Christ: Chúa Giê-xu mang lấy huyết nhục loài người để trở thành "Go\'el" đích thực, trả giá huyết vô tội của Ngài chuộc lại sản nghiệp vĩnh cửu cho con cái Chúa (Ru-tơ 3:9, Gióp 19:25: "Tôi biết rằng Đấng Cứu Chuộc tôi vẫn sống").'
  },
  {
    card_type: 'word',
    difficulty_level: 2,
    front_text: 'Khảo Cứu Từ Hê-bơ-rơ: חָכְמָה (Chokmah — H2451)',
    back_text: '• Ngôn ngữ: Hê-bơ-rơ Cựu Ước.\n• Lemma: חָכְמָה (Chokmah) | Mã Strong: H2451.\n• Phiên âm: khok-maw\'.\n• Định nghĩa: Sự khôn ngoan thánh khiết, nghệ thuật sống đẹp lòng Đức Chúa Trời, kỹ năng áp dụng chân lý vào mọi khía cạnh thực tế của cuộc đời.\n• Nền tảng cốt lõi: "Sự kính sợ Đức Giê-hô-va là khởi đầu sự khôn ngoan" (Châm-ngôn 9:10).\n• Đặc điểm: Khác với tri thức lý thuyết (knowledge); Chokmah là sự khôn ngoan thực hành trong công lý, chính trực và thanh khiết.'
  },
  {
    card_type: 'word',
    difficulty_level: 2,
    front_text: 'Khảo Cứu Từ Hy Lạp: χάρις (Charis — G5485)',
    back_text: '• Ngôn ngữ: Hy Lạp Koine.\n• Lemma: χάρις (Charis) | Mã Strong: G5485.\n• Phiên âm: khar\'-ece.\n• Định nghĩa: Ân điển (Grace) — sự ưu ái, nhân từ và phước lành nhưng không của Đức Chúa Trời ban cho những tội nhân hoàn toàn bất xứng và không thể tự cứu chuộc.\n• Công thức ghi nhớ: G.R.A.C.E. (God\'s Riches At Christ\'s Expense — Sự Giàu Có Của Chúa Với Cái Giá Của Đấng Christ).\n• Câu kinh điển: Giăng 1:16-17, Ê-phê-sô 2:8-9, II Cô-rinh-tô 12:9 ("Ân điển ta đủ cho ngươi rồi").'
  }
];

async function seed() {
  const fs = require('fs');
  console.log('Generating scripts/flashcards.sql for 52 comprehensive flashcards...');

  const statements = [];
  statements.push('BEGIN;');
  for (const card of COMPREHENSIVE_FLASHCARDS) {
    statements.push(`
      INSERT INTO flashcards (
        id, card_type, front_text, back_text, difficulty_level,
        repetition_count, interval_days, next_review_at
      ) VALUES (
        uuid_generate_v4(),
        ${escapeSql(card.card_type)},
        ${escapeSql(card.front_text)},
        ${escapeSql(card.back_text)},
        ${card.difficulty_level || 1},
        0,
        1,
        CURRENT_TIMESTAMP
      );
    `);
  }
  statements.push('COMMIT;');

  fs.writeFileSync('scripts/flashcards.sql', statements.join('\n'), 'utf8');
  execSync('docker cp scripts/flashcards.sql bibleknowledge-postgres:/tmp/flashcards.sql', { stdio: 'inherit' });
  execSync('docker exec bibleknowledge-postgres psql -U postgres -d bible_knowledge -f /tmp/flashcards.sql', { stdio: 'inherit' });
  fs.unlinkSync('scripts/flashcards.sql');

  console.log(`✓ Successfully seeded ${COMPREHENSIVE_FLASHCARDS.length} flashcards into PostgreSQL!`);
}

seed().catch(console.error);
