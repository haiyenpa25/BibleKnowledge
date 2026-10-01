/**
 * Seed initial community sermons & peer reviews into PostgreSQL bible_knowledge database.
 * Run with: node scripts/seed_community_sermons.js
 */
const { execSync } = require('child_process');

const sermons = [
  {
    id: "sermon-roma-8-victory",
    title: "Đắc Thắng Vượt Trội Nhờ Đấng Yêu Thương Chúng Ta",
    passage_ref: "Rô-ma 8:31-39",
    theme: "Sự Bảo Đảm Cứu Chuộc & Đắc Thắng Tâm Linh",
    author_name: "Mục sư Nguyễn Văn Bình",
    homiletical_style: "expository",
    big_idea: "Bởi vì Đức Chúa Trời đã không tiếc chính Con Một Ngài vì chúng ta, không một nghịch cảnh hay thế lực nào trong cả vũ trụ có thể phân rẽ chúng ta khỏi tình yêu đời đời của Ngài.",
    points: [
      {
        point_number: 1,
        title: "Sự Bênh Vực Tuyệt Đối Từ Đức Chúa Trời (câu 31-32)",
        scripture_ref: "Rô-ma 8:31-32",
        verse_text: "Nếu Đức Chúa Trời vùa giúp chúng ta, thì còn ai nghịch với chúng ta? Ngài đã không tiếc chính Con mình, nhưng vì chúng ta hết thảy mà phó Con ấy cho, thì Ngài há chẳng cũng sẽ ban mọi sự luôn với Con ấy cho chúng ta sao?",
        original_language_key: "huper hemon (ὑπὲρ ἡμῶν - vì cớ chúng ta, đứng về phía chúng ta)",
        exposition: "Nếu Đấng Tạo Hóa toàn năng đứng về phía chúng ta và đã hy sinh điều quý báu nhất là Con Ngài, Ngài há chẳng ban mọi sự luôn với Con ấy cho chúng ta sao? Sự quan phòng của Cha là tuyệt đối.",
        illustration: "Người cha liều mình cứu con khỏi hỏa hoạn sẽ không bao giờ bỏ rơi con mình trong cơn đói lạnh sau đó."
      },
      {
        point_number: 2,
        title: "Sự Vô Tội Trước Tòa Án Tối Cao (câu 33-34)",
        scripture_ref: "Rô-ma 8:33-34",
        verse_text: "Ai sẽ kiện kẻ lựa chọn của Đức Chúa Trời? Đức Chúa Trời là Đấng xưng công bình những kẻ ấy. Ai sẽ lên án họ ư? Đức Chúa Jêsus-Christ là Đấng đã chết, và cũng đã sống lại nữa, Ngài đang ngự bên hữu Đức Chúa Trời, cầu nguyện thế cho chúng ta.",
        original_language_key: "entunchanei (ἐντυγχάνει - liên tục cầu thay, biện hộ)",
        exposition: "Kẻ thù cáo buộc, nhưng Đấng Phán Xét tối cao đã tuyên xưng công bình. Hơn thế, Đấng Christ phục sinh đang ngự bên hữu Cha để liên lỉ cầu thay cho từng tín nhân.",
        illustration: "Khi Thẩm phán Tối cao đã đóng dấu tha bổng, không một trát lệnh bắt bớ nào từ cấp dưới còn giá trị."
      },
      {
        point_number: 3,
        title: "Chiến Thắng Vượt Trội Giữa Gian Truân (câu 35-37)",
        scripture_ref: "Rô-ma 8:35-37",
        verse_text: "Ai sẽ phân rẽ chúng ta khỏi sự yêu thương của Đấng Christ? Có phải hoạn nạn, khốn cùng, bắt bớ, đói khát, trần truồng, nguy hiểm, hay là gươm giáo chăng?... Trái lại, trong mọi sự đó, chúng ta nhờ Đấng yêu thương mình mà thắng hơn bội phần.",
        original_language_key: "hupernikomen (ὑπερνικῶμεν - siêu đắc thắng, khải hoàn áp đảo)",
        exposition: "Phao-lô liệt kê 7 tai họa khốc liệt nhất. Nhưng chúng ta không chỉ vượt qua mà còn nhờ Đấng yêu thương mình biến nghịch cảnh thành bệ phóng vinh hiển.",
        illustration: "Lửa luyện không thiêu rụi vàng mà làm tinh ròng giá trị của vàng đức tin."
      }
    ],
    practical_applications: [
      "Đối diện với nỗi sợ hãi hoặc cảm giác bị kết án bằng cách công bố lời tuyên bố công bình của Đức Chúa Trời trong Rô-ma 8:33.",
      "Khi gặp thử thách trong công việc và gia đình, hãy nhớ rằng thử thách không phải là dấu hiệu Chúa từ bỏ, mà là trường huấn luyện để kinh nghiệm năng quyền hupernikomen.",
      "Dành 15 phút mỗi sáng ngợi khen Chúa vì sự bảo chứng đời đời không gì phân rẽ nổi."
    ],
    theological_citations: [
      {
        source_title: "Thư Rô-ma Chú Giải Toàn Tập",
        author: "John Stott",
        quote: "Đoạn 8 của thư Rô-ma bắt đầu bằng 'không có sự đoán phạt nào' và kết thúc bằng 'không có sự phân rẽ nào'."
      },
      {
        source_title: "Viện Thần Học Cơ Đốc (Institutes)",
        author: "John Calvin",
        quote: "Đức tin chân chính không lung lay trước giông bão thế gian vì nền tảng của nó đặt trên tình yêu bất biến của Đấng Tự Hữu Hằng Hữu."
      }
    ],
    markdown_manuscript: `# ĐỀ CƯƠNG GIẢNG LUẬN: ĐẮC THẮNG VƯỢT TRỘI NHỜ ĐẤNG YÊU THƯƠNG CHÚNG TA

> **Kinh Văn**: Rô-ma 8:31-39  
> **Chủ Đề**: Sự Bảo Đảm Cứu Chuộc & Đắc Thắng Tâm Linh  
> **Diễn Giả**: Mục sư Nguyễn Văn Bình  

---

## Ý TƯỞNG CỐT LÕI (BIG IDEA)
Bởi vì Đức Chúa Trời đã không tiếc chính Con Một Ngài vì chúng ta, không một nghịch cảnh hay thế lực nào trong cả vũ trụ có thể phân rẽ chúng ta khỏi tình yêu đời đời của Ngài.

## I. SỰ BÊNH VỰC TUYỆT ĐỐI TỪ ĐỨC CHÚA TRỜI (câu 31-32)
- Đức Chúa Trời đứng về phía chúng ta: *huper hemon* (ὑπὲρ ἡμῶν).
- Ngài đã ban Con Một thì không lý do gì tiếc giữ ơn lành cần thiết cho đời sống đức tin.

## II. SỰ VÔ TỘI TRƯỚC TÒA ÁN TỐI CAO (câu 33-34)
- Ai dám kiện kẻ được chọn? Đức Chúa Trời đã xưng công bình.
- Đấng Christ chết, sống lại và đang cầu thay liên lỉ (*entunchanei*).

## III. CHIẾN THẮNG VƯỢT TRỘI GIỮA GIAN TRUÂN (câu 35-37)
- 7 tai họa khốc liệt nhất không thể phân rẽ tình yêu Chúa.
- Thắng hơn bội phần: *hupernikomen* (ὑπερνικῶμεν).

## ÁP DỤNG THỰC TẾ
1. Công bố lời xưng công bình mỗi khi ma quỷ gieo rắc sự tự ti và cáo trách.
2. Neo chắc đức tin nơi sự tể trị của Chúa giữa giông bão tài chính hoặc bệnh tật.
3. Sống với tư thế của người chiến thắng, chia sẻ niềm an ủi cho tha nhân.`,
    tags: ["Đức Tin", "Đắc Thắng", "Rô-ma", "Tình Yêu Chúa", "Sự Cứu Chuộc"],
    likes_count: 24,
    reviews: [
      {
        id: "rev-roma-1",
        reviewer_name: "TS. Lê Hoàng Ân",
        reviewer_title: "Giáo sư Tân Ước & Homiletics",
        hermeneutical_fidelity_rating: 5,
        homiletical_clarity_rating: 5,
        pastoral_application_rating: 5,
        review_comment: "Cấu trúc đề cương bám sát từng mạch văn của Phao-lô trong Rô-ma 8. Việc phân tích từ ngữ Hy-lạp hupernikomen và entunchanei mang lại sức nặng thần học sâu sắc, kết hợp minh họa cha con rất gần gũi với bối cảnh mục vụ Việt Nam."
      },
      {
        id: "rev-roma-2",
        reviewer_name: "Mục sư Trần Văn Khánh",
        reviewer_title: "Trưởng ban Mục vụ Giới trẻ",
        hermeneutical_fidelity_rating: 5,
        homiletical_clarity_rating: 4,
        pastoral_application_rating: 5,
        review_comment: "Bài giảng rất truyền cảm hứng. Phần áp dụng thực tế giải quyết trúng tâm lý lo âu của các tín hữu đang đối diện khó khăn kinh tế. Rất khuyến khích sử dụng cho các buổi bồi linh."
      }
    ]
  },
  {
    id: "sermon-psalm-23-shepherd",
    title: "Đấng Chăn Chiên Đời Đời & Chén Phước Hạnh Đầy Tràn",
    passage_ref: "Thi Thiên 23:1-6",
    theme: "Sự Quan Phòng & Bình An Thuộc Linh",
    author_name: "Truyền đạo Trần Thanh Thảo",
    homiletical_style: "expository",
    big_idea: "Khi Đức Giê-hô-va là Đấng Chăn giữ linh hồn, chúng ta không chỉ không thiếu thốn gì, mà còn bước qua trũng bóng chết với sự an ninh và được đãi tiệc vinh hiển trước mặt kẻ thù nghịch.",
    points: [
      {
        point_number: 1,
        title: "Sự Thỏa Lòng Nơi Đồng Cỏ Xanh Tươi (câu 1-3)",
        scripture_ref: "Thi Thiên 23:1-3",
        verse_text: "Đức Giê-hô-va là Đấng chăn giữ tôi; tôi sẽ chẳng thiếu thốn gì. Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh.",
        original_language_key: "Yahweh Rohi (יְהוָה רֹעִי - Đức Giê-hô-va là Đấng Chăn Chiên của tôi)",
        exposition: "Mối liên hệ cá nhân sâu nhiệm giữa Đấng Tự Hữu và con chiên. Đấng Chăn biết rõ nhu cầu nghỉ ngơi tâm linh và bổ lại linh hồn mỏi mệt.",
        illustration: "Con chiên chỉ có thể nằm nghỉ khi nó cảm thấy hoàn toàn không còn sợ hãi, đói khát hay bị ruồi bọ quấy nhiễu."
      },
      {
        point_number: 2,
        title: "Sự Vững Vàng Giữa Trũng Bóng Chết (câu 4)",
        scripture_ref: "Thi Thiên 23:4",
        verse_text: "Dầu khi tôi đi trong trũng bóng chết, tôi sẽ chẳng sợ tai họa nào; vì Chúa ở cùng tôi; cây trượng và cây gậy của Chúa an ủi tôi.",
        original_language_key: "Tzalmaveth (צַלְמָוֶת - bóng râm dày đặc, hiểm nguy chết chóc)",
        exposition: "Đa-vít đổi ngôi xưng từ 'Ngài' sang 'Chúa ở cùng tôi'. Trong đêm tối của thử thách, khoảng cách giữa tín nhân và Chúa trở nên gần gũi nhất.",
        illustration: "Gậy để đánh đuổi sói rừng, trượng có móc để khều con chiên trượt chân nơi mé vực."
      },
      {
        point_number: 3,
        title: "Bàn Tiệc Đắc Thắng & Nhà Đời Đời Của Cha (câu 5-6)",
        scripture_ref: "Thi Thiên 23:5-6",
        verse_text: "Chúa dọn bàn cho tôi trước mặt kẻ thù nghịch tôi; Chúa xức dầu cho đầu tôi, chén tôi đầy tràn. Quả thật, trọn đời tôi phước hạnh và sự thương xót sẽ theo tôi; tôi sẽ ở trong nhà Đức Giê-hô-va cho đến lâu dài.",
        original_language_key: "Hesed (חֶסֶד - tình yêu giao ước thành tín đời đời)",
        exposition: "Từ hình ảnh Đấng Chăn Chiên chuyển sang Đấng Chủ Nhà Hoàng Gia. Phước hạnh và ân sủng trung tín như hai thị vệ trung thành theo sau bước chân tín hữu.",
        illustration: "Chiếc chén đầy tràn không chỉ đủ uống mà còn dư dật để ban phát phước lành cho người xung quanh."
      }
    ],
    practical_applications: [
      "Học cách an nghỉ thực sự trong Chúa mỗi ngày thay vì để sự bận rộn thiêu đốt tâm linh.",
      "Đối diện với thời kỳ đen tối (bệnh tật, mất mát) bằng sự xác tín Chúa đang đồng hành bên cạnh.",
      "Tạ ơn Chúa vì bàn tiệc ân điển mỗi ngày và mở lòng tiếp đãi tha nhân."
    ],
    theological_citations: [
      {
        source_title: "Kho Tàng Đa-vít (Treasury of David)",
        author: "Charles Spurgeon",
        quote: "Dù thế gian có lấy đi mọi thứ, kẻ có Đức Giê-hô-va làm Đấng Chăn giữ sẽ không bao giờ thiếu điều gì thật sự tốt lành cho linh hồn."
      }
    ],
    markdown_manuscript: `# ĐỀ CƯƠNG GIẢNG LUẬN: ĐẤNG CHĂN CHIÊN ĐỜI ĐỜI & CHÉN PHƯỚC HẠNH ĐẦY TRÀN

> **Kinh Văn**: Thi Thiên 23:1-6  
> **Chủ Đề**: Sự Quan Phòng & Bình An Thuộc Linh  
> **Diễn Giả**: Truyền đạo Trần Thanh Thảo  

---

## Ý TƯỞNG CỐT LÕI (BIG IDEA)
Khi Đức Giê-hô-va là Đấng Chăn giữ linh hồn, chúng ta không chỉ không thiếu thốn gì, mà còn bước qua trũng bóng chết với sự an ninh và được đãi tiệc vinh hiển trước mặt kẻ thù nghịch.

## I. SỰ THỎA LÒNG NƠI ĐỒNG CỎ XANH TƯƠI (câu 1-3)
- Danh xưng *Yahweh Rohi* (יְהוָה רֹעִי): Đấng Chăn Chiên riêng của tôi.
- Sự bổ lại linh hồn (*Nephesh*): Phục hồi sau những kiệt quệ đời thường.

## II. SỰ VỮNG VÀNG GIỮA TRŨNG BÓNG CHẾT (câu 4)
- Trũng tăm tối (*Tzalmaveth*): Không phải là điểm đến, mà là con đường đi qua.
- Sự hiện diện sống động: "Chúa ở cùng tôi" — Cây gậy và cây trượng bảo vệ và định hướng.

## III. BÀN TIỆC ĐẮC THẮNG & NHÀ ĐỜI ĐỜI (câu 5-6)
- Chúa dọn bàn tiệc trước mặt quân thù: Tư thế tôn quý của người được Chúa bảo bọc.
- Ân sủng và lòng nhân từ (*Hesed*) đồng hành suốt đời.

## BÀI HỌC ÁP DỤNG
1. Tập thói quen 'an nghỉ nơi đồng cỏ' qua việc cầu nguyện tĩnh tâm mỗi sáng.
2. Vững lòng trước nghịch cảnh vì Chúa đang đồng hành ở ngôi thứ hai ("Chúa ở cùng tôi").
3. Nhìn đời sống như một chén phước hạnh để chia sẻ tình thương cho người khốn cùng.`,
    tags: ["Thi Thiên", "Đấng Chăn Chiên", "Bình An", "Đa-vít", "Quan Phòng"],
    likes_count: 31,
    reviews: [
      {
        id: "rev-psalm-1",
        reviewer_name: "Mục sư Phạm Quốc Cường",
        reviewer_title: "Quản nhiệm Hội Thánh",
        hermeneutical_fidelity_rating: 5,
        homiletical_clarity_rating: 5,
        pastoral_application_rating: 5,
        review_comment: "Cách phân tích sự chuyển ngôi từ ngôi thứ ba ('Ngài') sang ngôi thứ hai ('Chúa ở cùng tôi') ở câu 4 rất tinh tế và giàu ý nghĩa dưỡng linh. Đề cương súc tích, dễ nhớ cho hội chúng."
      }
    ]
  },
  {
    id: "sermon-john-3-regeneration",
    title: "Sự Tái Sinh Từ Thiên Thượng & Tình Yêu Cứu Rỗi Vô Điều Kiện",
    passage_ref: "Giăng 3:1-17",
    theme: "Sự Tái Sinh & Ân Điển Cứu Rỗi",
    author_name: "Mục sư Đỗ Hoàng Nam",
    homiletical_style: "expository",
    big_idea: "Con người dù có đạo đức hay địa vị tôn giáo cao trọng như Ni-cô-đem cũng bất lực bước vào Nước Trời nếu không được tái sinh bởi Thánh Linh nhờ tin nơi Con Đức Chúa Trời bị treo lên.",
    points: [
      {
        point_number: 1,
        title: "Nhu Cầu Bắt Buộc Của Sự Tái Sinh (câu 1-5)",
        scripture_ref: "Giăng 3:3-5",
        verse_text: "Quả thật, quả thật, ta nói cùng ngươi, nếu một người chẳng sanh lại, thì không thể thấy nước Đức Chúa Trời... nếu một người chẳng nhờ nước và Thánh Linh mà sanh, thì không được vào nước Đức Chúa Trời.",
        original_language_key: "Anothen (ἄνωθεν - sanh lại từ trên cao, từ thiên thượng)",
        exposition: "Ni-cô-đem là người Pha-ri-si mẫu mực, nhưng tôn giáo truyền thống không thể tạo nên sự sống mới. Phải có sự can thiệp siêu nhiên của Thánh Linh từ thiên thượng.",
        illustration: "Một bức tượng sáp dù chạm trổ tinh vi đến đâu cũng không thể tự thở nếu không có sự sống thổi vào."
      },
      {
        point_number: 2,
        title: "Hình Bóng Con Rắn Đồng Được Giương Lên (câu 14-15)",
        scripture_ref: "Giăng 3:14-15",
        verse_text: "Xưa Môi-se treo con rắn lên nơi đồng vắng thể nào, thì Con người cũng phải bị treo lên dường ấy, hầu cho hễ ai tin đến Ngài đều được sự sống đời đời.",
        original_language_key: "Hupsothenai (ὑψωθῆναι - được nhấc bổng lên trên thập tự giá)",
        exposition: "Chúa Giê-xu liên kết trực tiếp với Dân số ký 21. Kẻ bị rắn lửa cắn chỉ cần nhìn lên con rắn đồng là được sống. Cũng vậy, tội nhân chỉ cần ngước mắt đức tin nhìn lên Thập tự giá.",
        illustration: "Phương thuốc cứu rỗi không đòi hỏi nỗ lực leo lên trời, mà đòi hỏi cái nhìn đầu phục vào Đấng đã gánh tội thay."
      },
      {
        point_number: 3,
        title: "Đỉnh Cao Tình Yêu Vĩ Đại Nhất Lịch Sử (câu 16-17)",
        scripture_ref: "Giăng 3:16-17",
        verse_text: "Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.",
        original_language_key: "Agapao (ἠγάπησεν - tình yêu hy sinh vô điều kiện)",
        exposition: "Động cơ của ơn cứu rỗi là tình yêu; hành động là hy sinh ban tặng Con Một; điều kiện là đức tin; kết quả là sự sống đời đời.",
        illustration: "Món quà vô giá của Vua trao tặng kẻ ăn xin khốn cùng không thể mua bằng tiền, chỉ có thể mở tay nhận lãnh với lòng biết ơn."
      }
    ],
    practical_applications: [
      "Kiểm tra lại nền tảng đức tin cá nhân: bạn đang cậy vào đạo đức tôn giáo hay đã thực sự nhận sự sống mới từ Thánh Linh?",
      "Công bố sứ điệp Tin Lành Giăng 3:16 cho ít nhất một thân hữu trong tuần này.",
      "Cảm tạ Chúa vì Ngài không đến để đoán phạt mà đến để cứu chuộc thế gian."
    ],
    theological_citations: [
      {
        source_title: "Chú Giải Phúc Âm Giăng",
        author: "D.A. Carson",
        quote: "Giăng 3:16 tóm lược toàn bộ thần học giao ước: Đấng Tối Cao yêu thương thế gian tội lỗi đến mức tự nguyện hiến dâng điều quý báu nhất của Ngài."
      }
    ],
    markdown_manuscript: `# ĐỀ CƯƠNG GIẢNG LUẬN: SỰ TÁI SINH TỪ THIÊN THƯỢNG & TÌNH YÊU CỨU RỖI VÔ ĐIỀU KIỆ

> **Kinh Văn**: Giăng 3:1-17  
> **Chủ Đề**: Sự Tái Sinh & Ân Điển Cứu Rỗi  
> **Diễn Giả**: Mục sư Đỗ Hoàng Nam  

---

## Ý TƯỞNG CỐT LÕI (BIG IDEA)
Con người dù có đạo đức hay địa vị tôn giáo cao trọng như Ni-cô-đem cũng bất lực bước vào Nước Trời nếu không được tái sinh bởi Thánh Linh nhờ tin nơi Con Đức Chúa Trời bị treo lên.

## I. NHU CẦU BẮT BUỘC CỦA SỰ TÁI SINH (câu 1-5)
- Thầy dạy giáo luật Ni-cô-đem và câu hỏi ban đêm.
- Khái niệm *Anothen* (ἄνωθεν): Tái sinh từ trên cao, bởi Thánh Linh tái tạo tấm lòng.

## II. HÌNH BÓNG CON RẮN ĐỒNG ĐƯỢC GIƯƠNG LÊN (câu 14-15)
- Liên kết với Dân số ký 21: Rắn đồng gánh lấy hình bóng phán xét.
- Đấng Christ bị treo lên (*Hupsothenai*): Thập tự giá là phương thức cứu chuộc duy nhất.

## III. ĐỈNH CAO TÌNH YÊU CỨU THẾ (câu 16-17)
- Bốn trụ cột của Giăng 3:16:
  1. Chủ thể: Đức Chúa Trời yêu thương.
  2. Hành động: Ban Con Một.
  3. Điều kiện: Hễ ai tin.
  4. Lời hứa: Được sự sống đời đời.

## HÀNH ĐỘNG THỰC TIỄN
1. Xem xét trải nghiệm tái sinh cá nhân thay vì chỉ dựa vào hình thức tôn giáo truyền thống.
2. Sử dụng hình ảnh con rắn đồng để giải thích sự cứu chuộc cho người mới tìm hiểu đạo.
3. Sống cuộc đời tràn ngập niềm vui cứu rỗi và chia sẻ Tin Lành cho tha nhân.`,
    tags: ["Giăng", "Tái Sinh", "Tin Lành", "Ân Điển", "Thập Tự Giá"],
    likes_count: 42,
    reviews: [
      {
        id: "rev-john-1",
        reviewer_name: "ThS. Hoàng Thị Mai",
        reviewer_title: "Giảng viên Cơ Đốc Giáo Dục",
        hermeneutical_fidelity_rating: 5,
        homiletical_clarity_rating: 5,
        pastoral_application_rating: 5,
        review_comment: "Một bài giảng giải kinh mẫu mực về Giăng 3. Việc kết nối hình bóng Cựu Ước (Dân số ký 21) với thập tự giá Tân Ước giúp người nghe thấu hiểu trọn vẹn mạch nguồn cứu chuộc của toàn bộ Kinh Thánh."
      }
    ]
  },
  {
    id: "sermon-james-1-trials",
    title: "Vui Mừng Giữa Thử Thách & Sự Trưởng Thành Của Đức Tin",
    passage_ref: "Gia-cơ 1:2-12",
    theme: "Thử Thách & Trưởng Thành Thuộc Linh",
    author_name: "Mục sư Lê Văn Thịnh",
    homiletical_style: "expository",
    big_idea: "Thử thách trăm bề không phải là ngõ cụt mà là lò luyện kim của Đức Chúa Trời để tôi luyện sự nhịn nhục và dẫn dắt đức tin đến sự trọn vẹn không thiếu thốn gì.",
    points: [
      {
        point_number: 1,
        title: "Thái Độ Bất Ngờ Đối Với Thử Thách (câu 2-4)",
        scripture_ref: "Gia-cơ 1:2-4",
        verse_text: "Hỡi anh em, hãy coi sự thử thách trăm bề thoạt đến cho anh em như là điều vui mừng trọn vẹn, vì biết rằng sự thử đức tin anh em sanh ra sự nhịn nhục.",
        original_language_key: "Hupomone (ὑπομονή - sự nhẫn nại kiên cường đứng vững dưới sức nặng)",
        exposition: "Gia-cơ không bảo vui vì nỗi đau, mà vui vì biết mục đích thánh của Đức Chúa Trời đằng sau thử thách. Sự kiên trì tôi luyện nhân cách thuộc linh.",
        illustration: "Vận động viên không vui vì cơ bắp đau nhức, nhưng vui vì biết cường độ tập luyện đang tạo nên sức bền vô địch."
      },
      {
        point_number: 2,
        title: "Cầu Xin Sự Khôn Ngoan Không Nghi Ngại (câu 5-8)",
        scripture_ref: "Gia-cơ 1:5-8",
        verse_text: "Ví bằng trong anh em có kẻ thiếu sự khôn ngoan, hãy cầu xin Đức Chúa Trời, là Đấng ban cho mọi người cách rộng rãi, không trách móc ai, thì kẻ ấy sẽ được ban cho.",
        original_language_key: "Sophia (σοφία - khôn ngoan thuộc linh để nhìn đời bằng lăng kính của Chúa)",
        exposition: "Khi gặp bế tắc, con người cần sự khôn ngoan thiên thượng để thấu suốt ý muốn Chúa thay vì chao đảo như sóng biển.",
        illustration: "Chiếc la bàn vững chãi trên tàu giữa biển động giúp thuyền trưởng định hướng bất chấp gió bão."
      },
      {
        point_number: 3,
        title: "Mão Triều Thiên Của Sự Sống Cho Kẻ Bền Lòng (câu 12)",
        scripture_ref: "Gia-cơ 1:12",
        verse_text: "Phước cho người bị cám dỗ; vì lúc đã chịu nổi sự thử thách rồi, thì sẽ lãnh mão triều thiên của sự sống mà Đức Chúa Trời đã hứa cho kẻ kính mến Ngài.",
        original_language_key: "Stephanos (στέφανος - vòng nguyệt quế chiến thắng của người về đích)",
        exposition: "Phần thưởng đời đời dành cho người kiên trung. Động cơ tối hậu giúp tín nhân chịu nổi thử thách chính là lòng 'kính mến Ngài'.",
        illustration: "Người lính bền lòng qua trận chiến khốc liệt hướng về ngày khải hoàn nhận huy chương danh dự từ Quốc vương."
      }
    ],
    practical_applications: [
      "Thay đổi câu hỏi từ 'Tại sao điều này xảy ra với tôi?' thành 'Chúa muốn dạy tôi điều gì qua hoàn cảnh này?'.",
      "Cầu xin sự khôn ngoan thiên thượng trước khi đưa ra các quyết định quan trọng.",
      "Khích lệ một tín hữu đang gặp thử thách bằng Lời Chúa trong Gia-cơ 1:12."
    ],
    theological_citations: [
      {
        source_title: "Chú Giải Thư Gia-cơ",
        author: "Alec Motyer",
        quote: "Đức tin không được thử thách là một đức tin không thể tin cậy. Thử thách là cách Chúa chứng thực và mài giũa vàng ròng của ân điển."
      }
    ],
    markdown_manuscript: `# ĐỀ CƯƠNG GIẢNG LUẬN: VUI MỪNG GIỮA THỬ THÁCH & SỰ TRƯỞNG THÀNH CỦA ĐỨC TIN

> **Kinh Văn**: Gia-cơ 1:2-12  
> **Chủ Đề**: Thử Thách & Trưởng Thành Thuộc Linh  
> **Diễn Giả**: Mục sư Lê Văn Thịnh  

---

## Ý TƯỞNG CỐT LÕI (BIG IDEA)
Thử thách trăm bề không phải là ngõ cụt mà là lò luyện kim của Đức Chúa Trời để tôi luyện sự nhịn nhục và dẫn dắt đức tin đến sự trọn vẹn không thiếu thốn gì.

## I. THÁI ĐỘ BẤT NGỜ TRƯỚC THỬ THÁCH (câu 2-4)
- Coi là sự vui mừng trọn vẹn (*Chara*).
- Giá trị của sự kiên cường nhịn nhục (*Hupomone*).

## II. CẦU XIN SỰ KHÔN NGOAN THIÊN THƯỢNG (câu 5-8)
- Sự khôn ngoan (*Sophia*) để nhìn xuyên qua hoàn cảnh.
- Cầu nguyện trong đức tin vững vàng, không chao đảo như sóng biển.

## III. MÃO TRIỀU THIÊN CỦA SỰ SỐNG (câu 12)
- Phước cho người chịu nổi thử thách.
- Mão triều thiên vinh hiển (*Stephanos*) cho kẻ hết lòng kính mến Chúa.

## LỜI KÊU GỌI & ÁP DỤNG
1. Tiếp nhận thử thách với lòng biết ơn và đức tin tích cực.
2. Neo mình vào sự khôn ngoan trong Lời Chúa mỗi ngày.
3. Hướng lòng về phần thưởng vinh quang đời đời.`,
    tags: ["Gia-cơ", "Thử Thách", "Khôn Ngoan", "Kiên Nhẫn", "Đức Tin"],
    likes_count: 19,
    reviews: [
      {
        id: "rev-james-1",
        reviewer_name: "Mục sư Đinh Quang Hiệp",
        reviewer_title: "Giám đốc Viện Kinh Thánh Thần Học",
        hermeneutical_fidelity_rating: 5,
        homiletical_clarity_rating: 5,
        pastoral_application_rating: 5,
        review_comment: "Cách phân biệt giữa 'vui vì nỗi đau' và 'vui vì mục đích của Chúa' rất sắc sảo và giải tỏa được khúc mắc lớn của nhiều tín đồ khi đọc Gia-cơ 1. Một bài giảng vừa có tính học thuật vừa có lửa linh nghiệm."
      }
    ]
  }
];

function runSql(sql) {
  return execSync(`docker exec -i bibleknowledge-postgres psql -U postgres -d bible_knowledge`, {
    input: sql,
    encoding: 'utf-8'
  });
}

function escapeSql(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

console.log("Seeding Community Sermons & Peer Reviews...");

for (const s of sermons) {
  const insertSermonSql = `
    INSERT INTO community_sermons (
      id, title, passage_ref, theme, author_name, homiletical_style,
      big_idea, points, practical_applications, theological_citations,
      markdown_manuscript, tags, likes_count, created_at, updated_at
    ) VALUES (
      ${escapeSql(s.id)},
      ${escapeSql(s.title)},
      ${escapeSql(s.passage_ref)},
      ${escapeSql(s.theme)},
      ${escapeSql(s.author_name)},
      ${escapeSql(s.homiletical_style)},
      ${escapeSql(s.big_idea)},
      ${escapeSql(JSON.stringify(s.points))}::jsonb,
      ${escapeSql(JSON.stringify(s.practical_applications))}::jsonb,
      ${escapeSql(JSON.stringify(s.theological_citations))}::jsonb,
      ${escapeSql(s.markdown_manuscript)},
      ${escapeSql(JSON.stringify(s.tags))}::jsonb,
      ${s.likes_count || 0},
      NOW() - INTERVAL '${Math.floor(Math.random() * 5 + 1)} days',
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      passage_ref = EXCLUDED.passage_ref,
      theme = EXCLUDED.theme,
      author_name = EXCLUDED.author_name,
      big_idea = EXCLUDED.big_idea,
      points = EXCLUDED.points,
      practical_applications = EXCLUDED.practical_applications,
      theological_citations = EXCLUDED.theological_citations,
      markdown_manuscript = EXCLUDED.markdown_manuscript,
      tags = EXCLUDED.tags,
      likes_count = EXCLUDED.likes_count,
      updated_at = NOW();
  `;
  runSql(insertSermonSql);

  if (s.reviews && s.reviews.length > 0) {
    for (const r of s.reviews) {
      const insertRevSql = `
        INSERT INTO sermon_peer_reviews (
          id, sermon_id, reviewer_name, reviewer_title,
          hermeneutical_fidelity_rating, homiletical_clarity_rating,
          pastoral_application_rating, review_comment, created_at
        ) VALUES (
          ${escapeSql(r.id)},
          ${escapeSql(s.id)},
          ${escapeSql(r.reviewer_name)},
          ${escapeSql(r.reviewer_title)},
          ${r.hermeneutical_fidelity_rating},
          ${r.homiletical_clarity_rating},
          ${r.pastoral_application_rating},
          ${escapeSql(r.review_comment)},
          NOW() - INTERVAL '${Math.floor(Math.random() * 3 + 1)} days'
        ) ON CONFLICT (id) DO UPDATE SET
          reviewer_name = EXCLUDED.reviewer_name,
          reviewer_title = EXCLUDED.reviewer_title,
          hermeneutical_fidelity_rating = EXCLUDED.hermeneutical_fidelity_rating,
          homiletical_clarity_rating = EXCLUDED.homiletical_clarity_rating,
          pastoral_application_rating = EXCLUDED.pastoral_application_rating,
          review_comment = EXCLUDED.review_comment;
      `;
      runSql(insertRevSql);
    }
  }
  console.log(`✓ Seeded sermon & reviews: ${s.title}`);
}

console.log("Seeding completed successfully!");
