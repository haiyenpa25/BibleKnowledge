-- 06_lexicon_enrichment.sql: Enrich Strong's Greek and Hebrew Lexicon entries

INSERT INTO strong_lexicon (
    id, strong_number, language, lemma, transliteration, pronunciation, part_of_speech, 
    definition, theological_significance, occurrences_count, key_verses
) VALUES
(
    'G1343', 'G1343', 'greek', 'δικαιοσύνη', 'dikaiosyne', 'dik-ah-yos-oo-nay', 'Danh từ, giống cái',
    'Sự công bình, tình trạng đúng đắn trước mặt Đức Chúa Trời; sự xưng công bình dựa trên đức tin.',
    'Chủ đề trọng tâm trong thư tín Rô-ma và Ga-la-ti. Không phải sự công bình tự thân của việc làm theo luật pháp, mà là sự công bình của Đức Chúa Trời ban cho bởi đức tin nơi Đức Chúa Giê-xu Christ.',
    92,
    '["Rô-ma 1:17", "Rô-ma 3:21-22", "Rô-ma 4:3", "Phi-líp 3:9", "2 Cô-rinh-tô 5:21"]'::jsonb
),
(
    'G0225', 'G0225', 'greek', 'ἀλήθεια', 'aletheia', 'al-ay-thi-ah', 'Danh từ, giống cái',
    'Chân lý, lẽ thật, sự thật thực tế không che đậy; sự thành tín và hiện thực thiêng liêng của Đức Chúa Trời.',
    'Chúa Giê-xu tuyên bố Ngài chính là Con Đường, Lẽ Thật và Sự Sống (Giăng 14:6). Lẽ thật giải phóng con người khỏi quyền lực tội lỗi và sự dối trá.',
    109,
    '["Giăng 8:32", "Giăng 14:6", "Giăng 17:17", "Ê-phê-sô 4:15", "1 Giăng 3:18"]'::jsonb
),
(
    'G1577', 'G1577', 'greek', 'ἐκκλησία', 'ekklesia', 'ek-klay-see-ah', 'Danh từ, giống cái',
    'Hội thánh, cộng đồng những người được kêu gọi ra khỏi thế gian để thuộc về Chúa; đại hội dân sự của Đức Chúa Trời.',
    'Chúa Giê-xu xây dựng Hội Thánh Ngài trên vầng đá đức tin, các cửa âm phủ không thắng được. Hội Thánh là Thân Thể Đấng Christ và Đền Thờ Đức Thánh Linh.',
    114,
    '["Ma-thi-ơ 16:18", "Công-vụ 2:47", "Ê-phê-sô 1:22-23", "Ê-phê-sô 5:25", "Cô-lô-se 1:18"]'::jsonb
),
(
    'G5207', 'G5207', 'greek', 'υἱός', 'huios', 'hwee-os', 'Danh từ, giống đực',
    'Con trai, người thừa kế hợp pháp, Đấng mang trọn bản tính của Cha; danh hiệu Con Đức Chúa Trời.',
    'Nhấn mạnh thần tính và mối tương giao đời đời giữa Chúa Con và Đức Chúa Cha; đồng thời là vinh dự của tín hữu được nhận làm con nuôi trong gia đình Đức Chúa Trời.',
    377,
    '["Ma-thi-ơ 3:17", "Giăng 3:16", "Rô-ma 8:14-17", "Ga-la-ti 4:4-6", "Hê-bơ-rơ 1:2"]'::jsonb
),
(
    'G1380', 'G1380', 'greek', 'δόξα', 'doxa', 'dox-ah', 'Danh từ, giống cái',
    'Sự vinh hiển, vinh quang, uy nghi rực rỡ, vẻ đẹp tuyệt đối và uy quyền tối cao của Đức Chúa Trời.',
    'Bày tỏ bản tính rạng ngời của Đức Chúa Trời. Mọi người đều đã phạm tội hụt mất sự vinh hiển của Ngài, nhưng được cứu để dự phần vào vinh hiển đời đời của Đấng Christ.',
    166,
    '["Giăng 1:14", "Rô-ma 3:23", "1 Cô-rinh-tô 10:31", "2 Cô-rinh-tô 3:18", "Khải-huyền 21:23"]'::jsonb
),
(
    'G1680', 'G1680', 'greek', 'ἐλπίς', 'elpis', 'el-pece', 'Danh từ, giống cái',
    'Sự trông cậy, hy vọng chắc chắn, niềm tin kiên định vào tương lai tốt lành Chúa đã hứa.',
    'Khác với hy vọng phàm trần mơ hồ, hy vọng Cơ Đốc là chiếc neo vững chắc và bền đỗ cho linh hồn cắm vào nơi chí thánh qua Đấng Christ.',
    53,
    '["Rô-ma 5:5", "Rô-ma 8:24-25", "Cô-lô-se 1:27", "Hê-bơ-rơ 6:19", "1 Phi-e-rơ 1:3"]'::jsonb
),
(
    'G1515', 'G1515', 'greek', 'εἰρήνη', 'eirene', 'ee-ray-nay', 'Danh từ, giống cái',
    'Sự bình an, hòa thuận, an ninh tâm linh, sự hòa giải trọn vẹn với Đức Chúa Trời và anh em (tương đương Shalom trong tiếng Hê-bơ-rơ).',
    'Sự bình an vượt quá mọi sự hiểu biết, được thiết lập qua huyết thập tự giá của Đấng Christ dẹp tan mọi thù nghịch giữa Đức Chúa Trời và nhân loại.',
    92,
    '["Giăng 14:27", "Rô-ma 5:1", "Ê-phê-sô 2:14", "Phi-líp 4:7", "Cô-lô-se 3:15"]'::jsonb
),
(
    'H6664', 'H6664', 'hebrew', 'צֶדֶק', 'tsedeq', 'tseh-dek', 'Danh từ, giống đực',
    'Sự công bình, lẽ phải, sự ngay thẳng đạo đức, sự chuẩn mực tuyệt đối theo luật pháp và bản tính của Đức Chúa Trời.',
    'Nền tảng của ngôi Đức Chúa Trời (Thi-thiên 89:14). Đức Chúa Trời công bình đòi hỏi sự ngay thẳng trong xã hội, sự bảo vệ kẻ yếu thế và lòng công chính.',
    119,
    '["Lê-vi Ký 19:15", "Thi-thiên 23:3", "Thi-thiên 85:10", "Ê-sai 11:4-5", "Ê-sai 45:8"]'::jsonb
),
(
    'H0539', 'H0539', 'hebrew', 'אָמַן', 'aman', 'aw-man', 'Động từ',
    'Tin cậy, xác lập vững bền, trung tín, nâng đỡ, kiên cố; căn nguyên của từ A-men.',
    'Áp-ra-ham tin Đức Giê-hô-va, thì Ngài kể sự đó là công bình cho người (Sáng-thế Ký 15:6). Đức tin trong Kinh Thánh là sự phó thác và neo mình trọn vẹn nơi Chúa.',
    108,
    '["Sáng-thế Ký 15:6", "Xuất Ê-díp-tô Ký 14:31", "Phục-truyền 7:9", "Ê-sai 7:9", "Ha-ba-cúc 2:4"]'::jsonb
),
(
    'H3722', 'H3722', 'hebrew', 'כָּפַר', 'kaphar', 'kaw-far', 'Động từ',
    'Chuộc tội, che phủ lỗi lầm, thanh tẩy, làm hòa giải, xá tội qua của tế lễ.',
    'Ý niệm then chốt trong ngày Đại Lễ Chuộc Tội (Yom Kippur - Lê-vi Ký 16). Huyết của sinh tế che phủ tội nhân trước cơn thạnh nộ thánh khiết của Chúa, báo trước huyết Đấng Christ.',
    102,
    '["Sáng-thế Ký 6:14", "Xuất Ê-díp-tô Ký 30:15", "Lê-vi Ký 16:30", "Lê-vi Ký 17:11", "Thi-thiên 79:9"]'::jsonb
),
(
    'H1350', 'H1350', 'hebrew', 'גָּאַל', 'gaal', 'gaw-al', 'Động từ',
    'Chuộc lại, mua lại thân tộc, đóng vai người chuộc mạng (Goel); giải cứu khỏi nô lệ và áp bức.',
    'Ý niệm người thân tộc chuộc sản nghiệp (như Bô-ô chuộc Ru-tơ). Đức Giê-hô-va là Đấng Chuộc Đổi dân Y-sơ-ra-ên khỏi nhà nô lệ Ai Cập; Đấng Christ là Đấng Cứu Chuộc đời đời.',
    104,
    '["Xuất Ê-díp-tô Ký 6:6", "Lê-vi Ký 25:25", "Ru-tơ 3:12", "Gióp 19:25", "Ê-sai 43:1"]'::jsonb
),
(
    'H8451', 'H8451', 'hebrew', 'תּוֹרָה', 'torah', 'to-raw', 'Danh từ, giống cái',
    'Luật pháp, sự dạy dỗ, hướng dẫn thiêng liêng, huấn lệnh giao ước; Ngũ kinh Môi-se.',
    'Không chỉ là quy tắc pháp lý cứng nhắc, Torah là lời chỉ dẫn yêu thương của người Cha dành cho dân giao ước để họ bước đi trong sự sống, công bình và phước hạnh.',
    220,
    '["Sáng-thế Ký 26:5", "Xuất Ê-díp-tô Ký 24:12", "Thi-thiên 1:2", "Thi-thiên 119:1", "Ê-sai 2:3"]'::jsonb
),
(
    'H3045', 'H3045', 'hebrew', 'יָדַע', 'yada', 'yaw-dah', 'Động từ',
    'Biết, nhận biết sâu sắc, kinh nghiệm mật thiết; mối liên kết hiểu biết cá nhân và giao ước.',
    'Trong Kinh Thánh Hê-bơ-rơ, "biết" không chỉ là tri thức lý trí trừu tượng, mà là sự gắn kết mật thiết yêu thương, kinh nghiệm hiện diện của Đức Chúa Trời trong đời sống.',
    950,
    '["Sáng-thế Ký 4:1", "Xuất Ê-díp-tô Ký 3:7", "Thi-thiên 139:1-4", "Châm-ngôn 3:6", "Giê-rê-mi 31:34"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    theological_significance = EXCLUDED.theological_significance,
    occurrences_count = EXCLUDED.occurrences_count,
    key_verses = EXCLUDED.key_verses;
