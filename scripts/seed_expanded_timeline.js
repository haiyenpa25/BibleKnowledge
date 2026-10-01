/**
 * BibleKnowledge - Seed Expanded Biblical Timeline (22 Canonical Milestones)
 * Covers the entire redemptive history from Creation to Revelation (§6, §44).
 */

const { execSync } = require('child_process');

const TIMELINE_EVENTS = [
  {
    slug: 'su-sang-tao',
    title: 'Sự Sáng Tạo Vũ Trụ & Loài Người',
    approximate_date: 'Khởi đầu thời gian',
    date_type: 'unknown',
    period: 'Creation & Primeval',
    era_order: 1,
    scripture: 'Sáng-thế Ký 1-2',
    description: 'Đức Chúa Trời phán lời tạo dựng trời đất, muôn loài vạn vật và sáng tạo loài người theo hình ảnh và tượng Ngài trong 6 ngày.',
    people: ['A-đam', 'Ê-va'],
    places: ['Vườn Ê-đen'],
    theological_significance: 'Thiết lập quyền tể trị tuyệt đối của Đức Chúa Trời, phẩm giá loài người mang hình ảnh Đức Chúa Trời (Imago Dei) và giao ước sáng tạo ban đầu.'
  },
  {
    slug: 'giao-uoc-ap-ra-ham',
    title: 'Đức Chúa Trời Lập Giao Ước Áp-ra-ham',
    approximate_date: 'khoảng 2091 TCN',
    date_type: 'approximate',
    period: 'Patriarchs',
    era_order: 2,
    scripture: 'Sáng-thế Ký 12:1-3; 15:1-6; 17:1-8',
    description: 'Đức Chúa Trời kêu gọi Áp-ra-ham ra khỏi U-rơ và hứa ban xứ Ca-na-an cùng dòng dõi vô số cho người.',
    people: ['Áp-ra-ham', 'Sa-ra'],
    places: ['U-rơ', 'Cha-ran', 'Ca-na-an'],
    theological_significance: 'Nền tảng của kế hoạch cứu chuộc: Lời hứa về đất hứa, dòng dõi như sao trên trời, và muôn dân nhờ dòng dõi người mà được phước (Đấng Mê-si).'
  },
  {
    slug: 'xuat-ai-cap-vuot-bien-do',
    title: 'Xuất Ai Cập & Vượt Qua Biển Đỏ',
    approximate_date: 'khoảng 1446 TCN',
    date_type: 'approximate',
    period: 'Exodus & Wilderness',
    era_order: 3,
    scripture: 'Xuất Ê-díp-tô Ký 12-14',
    description: 'Đức Chúa Trời rẽ đôi nước Biển Đỏ qua bàn tay Môi-se, giải cứu tuyển dân Y-sơ-ra-ên khỏi đạo quân Pha-ra-ôn.',
    people: ['Môi-se', 'A-rôn', 'Pha-ra-ôn'],
    places: ['Ai Cập', 'Biển Đỏ', 'Đồng vắng Si-na-i'],
    theological_significance: 'Biến cố cứu chuộc khuôn mẫu trong Cựu Ước: Huyết chiên con lễ Vượt Qua cứu khỏi sự chết, và quyền năng giải phóng khỏi ách nô lệ dự trưng ơn cứu rỗi qua Đấng Christ.'
  },
  {
    slug: 'chinh-phuc-ca-na-an-va-gie-ri-co',
    title: 'Chinh Phục Ca-na-an & Sự Sụp Đổ Của Thành Giê-ri-cô',
    approximate_date: 'khoảng 1406 TCN',
    date_type: 'approximate',
    period: 'Conquest & Settlement',
    era_order: 4,
    scripture: 'Giô-suê 1-6',
    description: 'Giô-suê vâng mạng lệnh Đức Chúa Trời dẫn dắt dân Y-sơ-ra-ên vượt sông Giô-đanh và đánh sập tường thành Giê-ri-cô bằng tiếng reo hò đức tin.',
    people: ['Giô-suê', 'Ra-háp', 'Ca-lép'],
    places: ['Sông Giô-đanh', 'Thành Giê-ri-cô', 'Ca-na-an'],
    theological_significance: 'Sự thành tín của Đức Chúa Trời khi làm ứng nghiệm lời hứa ban đất cho Áp-ra-ham, chiến trận thuộc về Đức Giê-hô-va qua đức tin vâng phục.'
  },
  {
    slug: 'thoi-ky-cac-quan-xet-va-ru-to',
    title: 'Thời Kỳ Các Quan Xét & Ân Điển Cứu Chuộc Qua Ru-tơ',
    approximate_date: 'khoảng 1375 - 1050 TCN',
    date_type: 'range',
    period: 'Judges',
    era_order: 5,
    scripture: 'Các Quan Xét 2:11-19; Ru-tơ 4',
    description: 'Thời kỳ chuyển tiếp đầy biến động khi Y-sơ-ra-ên chưa có vua, Đức Chúa Trời dấy lên các quan xét giải cứu dân sự và dẫn dắt nàng Ru-tơ bước vào gia phả Đấng Mê-si.',
    people: ['Ghi-đê-ôn', 'Đê-bô-ra', 'Sam-sôn', 'Ru-tơ', 'Bô-ô'],
    places: ['Si-lô', 'Bết-lê-hem', 'Mô-áp'],
    theological_significance: 'Chu kỳ sa ngã - bị trừng phạt - kêu cầu - được giải cứu nhắc nhở nhu cầu về một vị Vua công chính; Bô-ô đóng vai người chuộc sản nghiệp (Goel) dự trưng Đấng Cứu Chuộc.'
  },
  {
    slug: 'vua-da-vit-thong-nhat-va-lap-thu-do',
    title: 'Vua Đa-vít Thống Nhất Vương Quốc & Lập Giê-ru-sa-lem Làm Thủ Đô',
    approximate_date: 'khoảng 1000 TCN',
    date_type: 'approximate',
    period: 'United Kingdom',
    era_order: 6,
    scripture: '2 Sa-mu-ên 5:1-10; 7:8-16',
    description: 'Đa-vít được xức dầu làm vua toàn cõi Y-sơ-ra-ên, chiếm đồn Si-ôn, lập Giê-ru-sa-lem làm kinh đô và tiếp nhận Giao ước đời đời từ Đức Chúa Trời.',
    people: ['Đa-vít', 'Sa-mu-ên', 'Na-than'],
    places: ['Hếp-rôn', 'Giê-ru-sa-lem', 'Núi Si-ôn'],
    theological_significance: 'Giao ước Đa-vít bảo chứng ngai vàng và vương quốc đời đời, đặt nền tảng cho danh xưng Con Vua Đa-vít của Đấng Mê-si.'
  },
  {
    slug: 'xay-den-tho-sa-lo-mon',
    title: 'Xây Cất Đền Thờ Giê-ru-sa-lem Đầu Tiên',
    approximate_date: 'khoảng 966 - 959 TCN',
    date_type: 'range',
    period: 'United Kingdom',
    era_order: 7,
    scripture: '1 Các Vua 6; 8:1-30',
    description: 'Vua Sa-lô-môn hoàn thành công trình đền thờ nguy nga trên núi Mô-ri-a để rước Hòm Giao Ước về an vị trong sự giáng lâm vinh hiển của Đức Chúa Trời.',
    people: ['Sa-lô-môn', 'Hi-ram'],
    places: ['Núi Mô-ri-a', 'Giê-ru-sa-lem'],
    theological_significance: 'Sự hiện diện hữu hình và vinh quang Shekinah của Đức Chúa Trời ngự giữa dân sự Ngài, là trung tâm thờ phượng và cầu thay cho muôn dân.'
  },
  {
    slug: 'vuong-quoc-phan-chia-va-tien-tri-e-li',
    title: 'Vương Quốc Phân Chia & Tiên Tri Ê-li Chiến Thắng Tại Núi Cạt-mên',
    approximate_date: 'khoảng 870 TCN',
    date_type: 'approximate',
    period: 'Divided Kingdom',
    era_order: 8,
    scripture: '1 Các Vua 12:1-24; 18:20-40',
    description: 'Vương quốc Y-sơ-ra-ên phân liệt thành hai phần Bắc - Nam; Tiên tri Ê-li cầu khẩn lửa từ trời giáng xuống thiêu của lễ tại núi Cạt-mên, phục hưng danh Đức Giê-hô-va.',
    people: ['Rô-bô-am', 'Giê-rô-bô-am', 'Ê-li', 'A-háp'],
    places: ['Si-chem', 'Sam-ma-ri', 'Núi Cạt-mên'],
    theological_significance: 'Sự phân chia vương triều do tội lỗi bất tuân; chức vụ tiên tri bảo vệ sự thờ phượng Đấng Chân Thần độc tôn trước sự xâm thực của thần Ba-anh.'
  },
  {
    slug: 'sa-ma-ri-sup-do-a-si-ri-xam-luoc',
    title: 'Sự Sụp Đổ Của Sa-ma-ri & Vương Quốc Phía Bắc Bị Lưu Đày Sang A-si-ri',
    approximate_date: 'năm 722 TCN',
    date_type: 'exact',
    period: 'Divided Kingdom',
    era_order: 9,
    scripture: '2 Các Vua 17:1-23',
    description: 'Sau 3 năm bị vây hãm, thủ đô Sa-ma-ri thất thủ trước đế quốc A-si-ri, vương quốc phía Bắc bị tiêu diệt và dân chúng bị phát lưu tản lạc.',
    people: ['Ô-sê', 'Sanh-ma-na-se', 'Sạt-gôn II'],
    places: ['Sa-ma-ri', 'A-si-ri', 'Hê-la'],
    theological_significance: 'Sự phán xét công minh của Đức Chúa Trời trên mười chi phái phía bắc vì sự bội giáo thờ hình tượng, ứng nghiệm lời cảnh báo của Môi-se và các tiên tri.'
  },
  {
    slug: 'gie-ru-sa-lem-sup-do-ba-by-lon-luu-day',
    title: 'Thành Giê-ru-sa-lem Bị Phá Hủy & Cuộc Lưu Đày Sang Ba-by-lôn',
    approximate_date: 'năm 586 TCN',
    date_type: 'exact',
    period: 'Exile',
    era_order: 10,
    scripture: '2 Các Vua 25:1-21; Giê-rê-mi 39; 52',
    description: 'Đạo quân Nê-bu-cát-nết-xa phá sập tường thành, thiêu rụi đền thờ Sa-lô-môn và bắt dân Giu-đa sang Ba-by-lôn lưu đày đúng theo lời tiên báo của Giê-rê-mi.',
    people: ['Nê-bu-cát-nết-xa', 'Sê-đê-kia', 'Giê-rê-mi', 'Đa-ni-ên', 'Ê-xê-chi-ên'],
    places: ['Giê-ru-sa-lem', 'Đền thờ', 'Ba-by-lôn'],
    theological_significance: 'Đền thờ bị thiêu hủy nhưng lời hứa phục hưng vẫn được gìn giữ qua 70 năm lưu đày; Đức Chúa Trời công bố Giao Ước Mới ghi khắc trong lòng (Giê-rê-mi 31).'
  },
  {
    slug: 'chieu-chi-si-ru-va-hoi-huong-tai-thiet',
    title: 'Chiếu Chỉ Si-ru & Tuyển Dân Hồi Hương Tái Thiết Đền Thờ',
    approximate_date: 'năm 538 - 516 TCN',
    date_type: 'range',
    period: 'Return & Restoration',
    era_order: 11,
    scripture: 'E-xơ-ra 1-3; 6:14-22; A-ghê 2',
    description: 'Vua Si-ru hạ chiếu cho phép người Do Thái hồi hương xây lại Đền thờ; dưới sự lãnh đạo của Xô-rô-ba-bên và lời khích lệ của A-ghê, Đền thờ thứ hai được khánh thành.',
    people: ['Si-ru Đại Đế', 'Xô-rô-ba-bên', 'Giê-su-a', 'A-ghê', 'Xa-cha-ri'],
    places: ['Ba-tư', 'Giê-ru-sa-lem'],
    theological_significance: 'Đức Chúa Trời điều khiển các hoàng đế ngoại bang thực thi ý chỉ cứu rỗi của Ngài, bảo tồn dòng dõi thánh để chuẩn bị cho Đấng Mê-si giáng trần.'
  },
  {
    slug: 'ne-he-mi-tai-thiet-tuong-thanh',
    title: 'Nê-hê-mi Lãnh Đạo Tái Thiết Tường Thành & E-xơ-ra Phục Hưng Lời Chúa',
    approximate_date: 'khoảng 445 - 430 TCN',
    date_type: 'range',
    period: 'Return & Restoration',
    era_order: 12,
    scripture: 'Nê-hê-mi 1-6; 8:1-12; Ma-la-chi 3-4',
    description: 'Nê-hê-mi thần kỳ hoàn tất việc xây dựng lại tường thành Giê-ru-sa-lem chỉ trong 52 ngày giữa muôn vàn áp lực, còn Thầy tế lễ E-xơ-ra đọc và giảng giải Luật pháp cho toàn thể cộng đồng.',
    people: ['Nê-hê-mi', 'E-xơ-ra', 'Aït-ta-xét-xe', 'Ma-la-chi'],
    places: ['Su-sơ', 'Giê-ru-sa-lem'],
    theological_significance: 'Tái lập sự bảo vệ thể lý và tinh sạch thuộc linh cho cộng đồng giao ước, kết thúc quy điển Cựu Ước với lời tiên tri về Ê-li dọn đường cho Chúa.'
  },
  {
    slug: 'bon-tram-nam-im-lang-giua-hai-uoc',
    title: '400 Năm Im Lặng Giữa Hai Ước (Intertestamental Period)',
    approximate_date: 'khoảng 430 - 5 TCN',
    date_type: 'range',
    period: 'Intertestamental',
    era_order: 13,
    scripture: 'Đa-ni-ên 8; 11; Ma-thi-ơ 1',
    description: 'Khoảng thời gian 4 thế kỷ không có tiếng nói tiên tri chính thức, chuyển giao qua các đế quốc Ba-tư, Hy Lạp, cuộc nổi dậy Mác-ca-bê và sự cai trị của Đế quốc La Mã.',
    people: ['A-lịch-sơn Đại Đế', 'Giu-đa Mác-ca-bê', 'Hê-rốt Đại Đế'],
    places: ['Hi Lạp', 'Ai Cập', 'La Mã', 'Giu-đê'],
    theological_significance: 'Thời kỳ Đức Chúa Trời chuẩn bị thế giới: tiếng Hy Lạp phổ quát (Koine), mạng lưới đường sá La Mã (Pax Romana) để Phúc Âm sẵn sàng lan rộng khi kỳ đã trọn (Ga-la-ti 4:4).'
  },
  {
    slug: 'su-giang-sinh-chua-gie-xu',
    title: 'Sự Giáng Sinh của Chúa Cứu Thế Giê-xu',
    approximate_date: 'khoảng 5 - 4 TCN',
    date_type: 'approximate',
    period: 'Life of Christ',
    era_order: 14,
    scripture: 'Lu-ca 2:1-20; Ma-thi-ơ 1:18-25',
    description: 'Con Đức Chúa Trời nhập thể sinh ra nơi máng cỏ thành Bết-lê-hem theo đúng lời tiên tri, đem ơn cứu rỗi và sự bình an dưới thế cho loài người được ơn.',
    people: ['Chúa Giê-xu', 'Ma-ri', 'Giô-sép', 'Các kẻ chăn chiên', 'Các bác sĩ'],
    places: ['Bết-lê-hem', 'Na-xa-rét'],
    theological_significance: 'Sự Nhập Thể mầu nhiệm (Incarnation): Ngôi Lời trở nên xác thịt, Emmanuel - Đức Chúa Trời ở cùng chúng ta, ứng nghiệm trọn vẹn lời tiên tri Ê-sai 7:14; 9:6.'
  },
  {
    slug: 'phep-la-ca-na',
    title: 'Phép Lạ Hóa Nước Thành Rượu Tại Ca-na',
    approximate_date: 'khoảng 27 SCN',
    date_type: 'approximate',
    period: 'Life of Christ',
    era_order: 15,
    scripture: 'Giăng 2:1-11',
    description: 'Chúa Giê-xu thi thố phép lạ đầu tiên tại tiệc cưới xứ Ca-na, hóa sáu chóe nước thành rượu ngon tuyệt hảo, bày tỏ vinh hiển Ngài và khiến các môn đồ tin phục.',
    people: ['Chúa Giê-xu', 'Ma-ri', 'Các môn đồ'],
    places: ['Ca-na xứ Ga-li-lê'],
    theological_significance: 'Dấu lạ đầu tiên bày tỏ vinh hiển của Chúa Cứu Thế, đánh dấu sự khởi đầu của thời đại ân điển vượt trổi luật pháp lễ nghi thanh tẩy cũ.'
  },
  {
    slug: 'di-bo-tren-mat-bien',
    title: 'Chúa Giê-xu & Phi-e-rơ Đi Bộ Trên Biển',
    approximate_date: 'khoảng 29 SCN',
    date_type: 'approximate',
    period: 'Life of Christ',
    era_order: 16,
    scripture: 'Ma-thi-ơ 14:22-33; Mác 6:45-52',
    description: 'Chúa Giê-xu đi trên mặt sóng biển giữa đêm tối để đến với các môn đồ; Phi-e-rơ bước xuống thuyền cùng đi trên nước trước khi được Chúa đưa tay giải cứu.',
    people: ['Chúa Giê-xu', 'Phi-e-rơ', 'Mười hai môn đồ'],
    places: ['Biển Ga-li-lê', 'Gê-nê-xa-rết'],
    theological_significance: 'Bày tỏ thần tính tuyệt đối tể trị thiên nhiên và bão tố; bài học đức tin ký thác trọn vẹn nơi Đấng Christ giữa nghịch cảnh đời sống.'
  },
  {
    slug: 'su-dong-dinh-thap-tu-gia',
    title: 'Chúa Giê-xu Chịu Đóng Đinh Trên Thập Tự Giá',
    approximate_date: 'khoảng 30 hoặc 33 SCN',
    date_type: 'disputed',
    period: 'Life of Christ',
    era_order: 17,
    scripture: 'Lu-ca 23:26-49; Giăng 19:16-37; Rô-ma 5:8',
    description: 'Đấng Christ gánh thay tội lỗi của cả nhân loại trên đồi Gô-gô-tha, thốt lên Mọi việc đã trọn rồi tắt hơi, bức màn đền thờ xé đôi từ trên chí dưới.',
    people: ['Chúa Giê-xu', 'Phi-lát', 'Giăng', 'Ma-ri Ma-đơ-len'],
    places: ['Đồi Gô-gô-tha', 'Giê-ru-sa-lem'],
    theological_significance: 'Tâm điểm của toàn bộ Kinh Thánh: Sự chuộc tội thay (Penal Substitutionary Atonement), Chiên Con Đức Chúa Trời cất tội lỗi thế gian đi, bức màn đền thờ xé đôi mở đường vào nơi chí thánh.'
  },
  {
    slug: 'su-phuc-sinh-vinh-hien',
    title: 'Sự Phục Sinh Vinh Hiển Của Đấng Christ',
    approximate_date: 'khoảng 30 hoặc 33 SCN',
    date_type: 'disputed',
    period: 'Life of Christ',
    era_order: 18,
    scripture: 'Ma-thi-ơ 28:1-10; Giăng 20; 1 Cô-rinh-tô 15:1-20',
    description: 'Sáng sớm ngày thứ nhất trong tuần, Chúa Giê-xu phục sinh khải hoàn ra khỏi mồ mả, hiện ra cho Ma-ri và các sứ đồ suốt 40 ngày trước khi thăng thiên.',
    people: ['Chúa Giê-xu phục sinh', 'Ma-ri Ma-đơ-len', 'Phi-e-rơ', 'Thô-ma'],
    places: ['Ngôi mộ trống', 'Phòng cao Giê-ru-sa-lem', 'Ga-li-lê'],
    theological_significance: 'Đắc thắng sự chết, ma quỷ và ngôi mộ; bảo chứng quyền năng xưng công bình và sự sống lại đời đời cho mọi kẻ tin.'
  },
  {
    slug: 'bien-co-le-ngu-tuan',
    title: 'Đức Thánh Linh Giáng Lâm Trong Lễ Ngũ Tuần',
    approximate_date: 'khoảng 30 hoặc 33 SCN',
    date_type: 'disputed',
    period: 'Early Church',
    era_order: 19,
    scripture: 'Công vụ các Sứ đồ 2:1-47',
    description: 'Đức Thánh Linh giáng lâm như tiếng gió thổi ào ào và lưỡi rời rạc như lửa đậu trên các môn đồ, bài giảng của Phi-e-rơ đem 3.000 linh hồn quy phục Chúa.',
    people: ['Đức Thánh Linh', 'Phi-e-rơ', '120 môn đồ', '3.000 tân tín hữu'],
    places: ['Phòng cao', 'Đền thờ Giê-ru-sa-lem'],
    theological_significance: 'Khai sinh Hội Thánh của Đức Chúa Trời, báp-tem trong Thánh Linh ban quyền năng làm chứng đạo cho muôn dân, đảo ngược biến cố tháp Ba-bên.'
  },
  {
    slug: 'su-bien-cai-cua-phao-lo',
    title: 'Sự Biến Cải Của Sau-lơ Trên Đường Đa-mách',
    approximate_date: 'khoảng 34 - 35 SCN',
    date_type: 'approximate',
    period: 'Early Church',
    era_order: 20,
    scripture: 'Công vụ các Sứ đồ 9:1-22; Ga-la-ti 1:11-17',
    description: 'Ánh sáng thiên thượng chiếu lòa khiến Sau-lơ ngã ngựa trên đường lùng bắt tín đồ, Chúa phục sinh kêu gọi ông trở nên Sứ đồ cho Dân Ngoại.',
    people: ['Chúa Giê-xu phục sinh', 'Phao-lô (Sau-lơ)', 'A-na-nia'],
    places: ['Đường đi Đa-mách', 'Nhà Giu-đa ở phố Ngay Thẳng'],
    theological_significance: 'Quyền năng biến đổi vĩ đại của ân điển Chúa trên kẻ bắt bớ đạo, chuẩn bị Sứ đồ của Dân Ngoại và tác giả của 13 thư tín Tân Ước.'
  },
  {
    slug: 'dai-hoi-dong-gie-ru-sa-lem',
    title: 'Đại Hội Đồng Giê-ru-sa-lem Xác Lập Sự Cứu Rỗi Bởi Ân Điển',
    approximate_date: 'khoảng 49 - 50 SCN',
    date_type: 'approximate',
    period: 'Early Church',
    era_order: 21,
    scripture: 'Công vụ các Sứ đồ 15:1-35; Ga-la-ti 2:1-10',
    description: 'Các sứ đồ và trưởng lão nhóm họp tại Giê-ru-sa-lem, chính thức tuyên bố tín hữu Dân Ngoại được cứu rỗi thuần túy bởi đức tin và ân điển Chúa Giê-xu chứ không bởi nghi thức cắt bì.',
    people: ['Phao-lô', 'Ba-na-ba', 'Phi-e-rơ', 'Gia-cơ'],
    places: ['Hội Thánh An-ti-ốt', 'Giê-ru-sa-lem'],
    theological_significance: 'Đóng dấu chân lý nền tảng: Con người được cứu rỗi thuần túy bởi đức tin và ân điển trong Đấng Christ chứ không nhờ nghi thức cắt bì hay luật pháp Môi-se.'
  },
  {
    slug: 'khai-huyen-tren-dao-bat-mo',
    title: 'Khải Huyền Về Vương Quốc Vinh Hiển Trên Đảo Bát-mô',
    approximate_date: 'khoảng 95 - 96 SCN',
    date_type: 'approximate',
    period: 'Apostolic & Revelation',
    era_order: 22,
    scripture: 'Khải Huyền 1:9-20; 21:1-7; 22:1-5',
    description: 'Sứ đồ Giăng bị lưu đày trên đảo Bát-mô được chiêm ngưỡng vinh quang của Đấng Tối Cao, toàn cảnh cuộc chiến thuộc linh, sự phán xét tối hậu và Trời Mới Đất Mới.',
    people: ['Chúa Giê-xu vinh hiển', 'Sứ đồ Giăng'],
    places: ['Đảo Bát-mô', 'Trời Mới & Đất Mới', 'Giê-ru-sa-lem Mới'],
    theological_significance: 'Đỉnh cao tột bậc của dòng lịch sử cứu chuộc: Sự chiến thắng tối hậu của Chiên Con, muôn vật được đổi mới, sự chết bị tiêu diệt và dân sự được ở cùng Đức Chúa Trời đời đời.'
  }
];

function seedTimeline() {
  console.log('Seeding 22 Expanded Canonical Timeline Milestones into Postgres...');
  
  let sql = 'BEGIN;\n';
  
  for (const ev of TIMELINE_EVENTS) {
    const meta = JSON.stringify({
      era_order: ev.era_order,
      scripture: ev.scripture,
      people: ev.people,
      places: ev.places,
      theological_significance: ev.theological_significance
    });
    
    // Upsert on slug
    const safeTitle = ev.title.replace(/'/g, "''");
    const safeDesc = ev.description.replace(/'/g, "''");
    const safeDate = ev.approximate_date.replace(/'/g, "''");
    const safePeriod = ev.period.replace(/'/g, "''");
    const safeMeta = meta.replace(/'/g, "''");
    
    sql += `
      INSERT INTO events (slug, title, approximate_date, date_type, period, description, metadata)
      VALUES ('${ev.slug}', '${safeTitle}', '${safeDate}', '${ev.date_type}', '${safePeriod}', '${safeDesc}', '${safeMeta}'::jsonb)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        approximate_date = EXCLUDED.approximate_date,
        date_type = EXCLUDED.date_type,
        period = EXCLUDED.period,
        description = EXCLUDED.description,
        metadata = EXCLUDED.metadata;
    `;
  }
  
  sql += 'COMMIT;\n';
  
  const cmd = 'docker exec -i bibleknowledge-postgres psql -U postgres -d bible_knowledge';
  execSync(cmd, { input: sql, stdio: ['pipe', 'inherit', 'inherit'] });
  console.log(`Successfully upserted all ${TIMELINE_EVENTS.length} timeline events!`);
}

seedTimeline();
