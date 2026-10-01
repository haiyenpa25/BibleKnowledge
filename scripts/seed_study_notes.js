const fs = require('fs');

const notes = [
  {
    title: 'Tĩnh Nguyện S.O.A.P: Đức Giê-hô-va Là Đấng Chăn Giữ Tôi',
    scripture_ref: 'Thi Thiên 23:1-3',
    content: `### S — Scripture (Lời Chúa)
> "Đức Giê-hô-va là Đấng chăn giữ tôi; tôi chẳng thiếu thốn gì. Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh. Ngài bổ lại linh hồn tôi, dẫn tôi vào các lối công bình, vì cớ danh Ngài." (Thi Thiên 23:1-3 BTT 1925)

### O — Observation (Quan Sát Văn Mạch & Lẽ Thật)
- Đa-vít viết Thi Thiên này từ kinh nghiệm mục đồng đích thực. Ngài không xưng Chúa là một khái niệm trừu tượng xa vời, mà là "Đấng Chăn Giữ TÔI" (mối tương giao cá nhân mật thiết).
- Động từ "chẳng thiếu thốn gì" (Hê-bơ-rơ: Lo Echsar) không chỉ nói về vật chất, mà là sự trọn vẹn trong sự chu cấp toàn hảo của Chúa.
- "Đồng cỏ xanh tươi" và "mé nước bình tịnh" biểu trưng cho sự yên nghỉ nội tâm giữa những phong ba bão táp của cuộc đời.

### A — Application (Ứng Dụng Nếp Sống)
- Dừng lại những lo lắng vô ích về tương lai trong tuần này.
- Dành 15 phút đầu ngày để tĩnh lặng chiêm nghiệm sự hiện diện của Chúa trước khi mở điện thoại hay bắt đầu công việc.
- Học cách tin cậy sự hướng dẫn của Đấng Chăn Chiên ngay cả khi lối đi có vẻ gập ghềnh.

### P — Prayer (Lời Cầu Nguyện)
Lạy Chúa Giê-hô-va Rohi, Đấng Chăn Chiên Lớn của linh hồn con. Con tạ ơn Ngài vì Ngài biết rõ từng vết thương, từng nỗi âu lo trong lòng con. Xin giúp con biết an nghỉ nơi đồng cỏ lời Ngài hôm nay, bước theo sự dẫn dắt của Thánh Linh vào lối công chính vì cớ danh Ngài. Amen.`,
    tags: ['devotional', 'soap', 'psalm23', 'tin_nguyen', 'tam_linh']
  },
  {
    title: 'Khảo Luận Giải Kinh: Sợi Dây Chuyền Vàng Cứu Rỗi (Ordo Salutis)',
    scripture_ref: 'Rô-ma 8:28-30',
    content: `### 1. Bối Cảnh Lịch Sử & Thần Học
- Phao-lô viết thơ Rô-ma từ thành Cô-rinh-tô (khoảng năm 57 SC). Phân đoạn Rô-ma 8:28-30 là đỉnh cao an ủi cho các tín hữu đang chịu hoạn nạn, bảo đảm rằng lịch sử và số phận của người thuộc về Chúa được neo chặt trong ý định đời đời của Ba Ngôi Đức Chúa Trời.

### 2. Phân Tích Căn Từ Hy Lạp
- Panta synergei eis agathon: "Vạn sự hiệp lại làm ích". Động từ synergei ở thì hiện tại chủ động, chỉ sự phối hợp nhịp nhàng, tối thượng của Thần Linh trên mọi biến cố.
- Proegno (biết trước) -> Proorisen (định sẵn) -> Ekalesen (kêu gọi) -> Edikaiosen (xưng công bình) -> Edoxasen (làm cho vinh hiển).

### 3. Năm Mắt Xích Thần Học (Golden Chain of Redemption)
1. Biết trước (Foreknowledge): Tình yêu chủ động, tiền định từ trước buổi sáng thế.
2. Định sẵn (Predestination): Được hoạch định nên giống hình ảnh Con Ngài (Đấng Christ).
3. Kêu gọi hiệu quả (Effectual Calling): Tiếng gọi của Thánh Linh qua Phúc Âm.
4. Xưng công bình (Justification): Được tha tội và mặc lấy sự công bình của Đấng Christ nhờ đức tin.
5. Vinh hiển hóa (Glorification): Thì quá khứ edoxasen nhấn mạnh tính chắc chắn tuyệt đối của sự cứu rỗi tương lai.

### 4. Ứng Dụng Mục Vụ
- Đứng vững giữa nghịch cảnh: Mọi đau thương hiện tại đều nằm trong bàn tay tể trị của Đấng quyền năng.`,
    tags: ['exegesis', 'romans8', 'ordo_salutis', 'giai_kinh', 'than_hoc']
  },
  {
    title: 'Ghi Chú Bài Giảng: Bước Đi Trên Mặt Nước Trong Cơn Bão',
    scripture_ref: 'Ma-thi-ơ 14:22-33',
    content: `### Thông Tin Buổi Thờ Phượng
- Diễn giả: Mục sư Quản nhiệm
- Chủ đề: Đức Tin Vượt Sóng Gió
- Phân đoạn nền tảng: Ma-thi-ơ 14:22-33

### Luận Đề Trung Tâm (Big Idea)
> Khi mắt chúng ta chăm chú nhìn xem Chúa Giê-xu, chúng ta có thể bước đi trên những điều vốn dĩ có thể nhận chìm mình; nhưng khi dời mắt nhìn vào ngọn sóng, chúng ta sẽ bắt đầu chìm.

### 3 Điểm Triển Khai Chính
1. Chúa truyền lệnh giữa cơn bão (c. 22-27): Ngài không ngăn cơn gió trước, nhưng Ngài đến với môn đồ ngay giữa canh tư đêm tối.
2. Lời mời gọi của đức tin (c. 28-29): Phi-e-rơ dám bước ra khỏi mạn thuyền an toàn vì ông nghe tiếng phán: "Hãy lại đây!".
3. Bàn tay cứu vớt tức thì (c. 30-33): Chúa Giê-xu không quở phạt trước khi cứu; Ngài lập tức giơ tay nắm lấy Phi-e-rơ rồi mới phục hồi đức tin của ông.

### Cam Kết Hành Động Thuộc Linh
- Nhận diện "chiếc thuyền an toàn giả tạo" mà mình đang bám víu.
- Dám bước ra trong sứ mạng mới Chúa giao, không để tiếng gầm của hoàn cảnh lấn át Lời Chúa.`,
    tags: ['sermon_notes', 'matthew14', 'bai_giang', 'duc_tin', 'phero']
  },
  {
    title: 'Nhật Ký Cầu Nguyện: Bình An Vượt Quá Mọi Sự Hiểu Biết',
    scripture_ref: 'Phi-líp 4:6-7',
    content: `### Lời Hứa Kinh Thánh Nương Cậy
> "Chớ lo phiền chi hết, nhưng trong mọi sự hãy dùng lời cầu nguyện, nài xin, và sự tạ ơn mà bày tỏ các điều cầu xin của mình cho Đức Chúa Trời. Sự bình an của Đức Chúa Trời vượt quá mọi sự hiểu biết, sẽ giữ gìn lòng và ý tưởng anh em trong Đức Chúa Giê-xu Christ." (Phi-líp 4:6-7)

### Các Vấn Đề Cầu Thay Hiện Tại
- Gia đình: Cầu nguyện cho sức khỏe của cha mẹ và lòng kính sợ Chúa của thế hệ trẻ.
- Công việc & Sứ mạng: Cầu xin sự khôn ngoan thiên thượng khi ra các quyết định quan trọng trong tuần này.
- Hội Thánh: Cầu thay cho Ban Thanh Niên được hiệp một và dấy lên thế hệ môn đồ trung tín.

### Lời Tạ Ơn Vì Lời Cầu Xin Được Nhậm
- Tạ ơn Chúa vì kỳ thi vừa qua đã được bình an và kết quả tốt lành hơn con mong ước.
- Tạ ơn Chúa vì sự chữa lành kỳ diệu trên người bạn thân sau đợt điều trị.
- Tạ ơn Chúa vì Ngài ban sự bình an lạ lùng trong lòng dù hoàn cảnh xung quanh còn nhiều thách thức.`,
    tags: ['prayer_journal', 'philippians4', 'cau_nguyen', 'ta_on', 'binh_an']
  }
];

async function seed() {
  console.log('Seeding 4 structured study notes & spiritual journals...');
  for (const n of notes) {
    const res = await fetch('http://localhost:8000/api/study/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n)
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`[OK] Seeded note "${data.title}" (ID: ${data.id})`);
    } else {
      console.error(`[FAIL] Failed to seed note "${n.title}":`, await res.text());
    }
  }
  console.log('Finished seeding study notes!');
}

seed();
