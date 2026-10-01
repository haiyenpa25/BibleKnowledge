"""
seed_strong_lexicon.py: Seed Greek and Hebrew theological keywords into strong_lexicon table.
Reference: ROADMAP1.md Sections 14, 37
"""

import json
from sqlalchemy import text
from app.db.session import engine

STRONG_SEEDS = [
    # GREEK NEW TESTAMENT
    {
        "id": "G26",
        "strong_number": "G0026",
        "language": "greek",
        "lemma": "ἀγάπη",
        "transliteration": "agapē",
        "pronunciation": "ag-ah'-pay",
        "part_of_speech": "Danh từ, Giống cái",
        "definition": "Tình yêu hy sinh, tự nguyện vô điều kiện; tình yêu thần thượng xuất phát từ bản tính của Đức Chúa Trời.",
        "theological_significance": "Không giống như philia (tình bạn hữu) hay eros (tình cảm lãng mạn), agapē là tình yêu hướng đến lợi ích tối cao của người khác bất chấp phẩm chất của đối tượng. Đỉnh cao của agapē là thập tự giá (Giăng 3:16; 1 Giăng 4:8; 1 Cô-rinh-tô 13).",
        "occurrences_count": 116,
        "key_verses": ["Giăng 3:16", "1 Giăng 4:8", "1 Cô-rinh-tô 13:4-8", "Rô-ma 5:8"]
    },
    {
        "id": "G5485",
        "strong_number": "G5485",
        "language": "greek",
        "lemma": "χάρις",
        "transliteration": "charis",
        "pronunciation": "khar'-ece",
        "part_of_speech": "Danh từ, Giống cái",
        "definition": "Ân điển, sự ban ơn huệ hoàn toàn nhưng không, ơn lành nhưng không mà con người không xứng đáng nhận.",
        "theological_significance": "Trọng tâm thần học cứu rỗi của Phao-lô: con người được cứu rỗi bởi ân điển nhờ đức tin, không phải bởi việc làm của luật pháp (Ê-phê-sô 2:8-9; Rô-ma 3:24).",
        "occurrences_count": 155,
        "key_verses": ["Ê-phê-sô 2:8-9", "Rô-ma 3:24", "2 Cô-rinh-tô 12:9", "Giăng 1:16"]
    },
    {
        "id": "G4102",
        "strong_number": "G4102",
        "language": "greek",
        "lemma": "πίστις",
        "transliteration": "pistis",
        "pronunciation": "pis'-tis",
        "part_of_speech": "Danh từ, Giống cái",
        "definition": "Đức tin, lòng tin cậy vững chắc, sự trung tín và phó thác hoàn toàn nơi Đức Chúa Trời.",
        "theological_significance": "Đức tin là phương tiện để con người tiếp nhận sự công bình của Đấng Christ. 'Đức tin là sự biết chắc vững vàng của những điều mình đang trông mong' (Hê-bơ-rơ 11:1; Rô-ma 1:17).",
        "occurrences_count": 243,
        "key_verses": ["Hê-bơ-rơ 11:1", "Rô-ma 1:17", "Ga-la-ti 2:20", "Ma-mác 11:22"]
    },
    {
        "id": "G3056",
        "strong_number": "G3056",
        "language": "greek",
        "lemma": "λόγος",
        "transliteration": "logos",
        "pronunciation": "log'-os",
        "part_of_speech": "Danh từ, Giống đực",
        "definition": "Lời, Đạo, sự bày tỏ thiên thượng, ý niệm sống động của Đức Chúa Trời.",
        "theological_significance": "Trong Phúc Âm Giăng 1:1-14, Logos là Ngôi Lời tiền hiện hữu từ ban đầu, chính là Đức Chúa Trời, và đã trở nên xác thịt cư ngụ giữa nhân loại nơi Chúa Cứu Thế Giê-xu.",
        "occurrences_count": 330,
        "key_verses": ["Giăng 1:1", "Giăng 1:14", "Hê-bơ-rơ 4:12", "1 Phi-e-rơ 1:23"]
    },
    {
        "id": "G4151",
        "strong_number": "G4151",
        "language": "greek",
        "lemma": "πνεῦμα",
        "transliteration": "pneuma",
        "pronunciation": "pnyoo'-mah",
        "part_of_speech": "Danh từ, Giống trung",
        "definition": "Gió, hơi thở, tâm linh con người, hoặc Đức Thánh Linh của Đức Chúa Trời.",
        "theological_significance": "Chỉ về Ngôi Ba Thiên Chúa (Pneuma Hagion - Đức Thánh Linh), Đấng ngự vào lòng tín hữu, ban quyền năng, đổi mới và cáo trách thế gian (Giăng 14:26; Công vụ 1:8).",
        "occurrences_count": 379,
        "key_verses": ["Giăng 4:24", "Rô-ma 8:16", "Ga-la-ti 5:22", "Công vụ 1:8"]
    },
    {
        "id": "G2842",
        "strong_number": "G2842",
        "language": "greek",
        "lemma": "κοινωνία",
        "transliteration": "koinōnia",
        "pronunciation": "koy-nohn-ee'-ah",
        "part_of_speech": "Danh từ, Giống cái",
        "definition": "Sự thông công, chia sẻ sâu sắc, hiệp thông tâm linh, cùng dự phần trách nhiệm.",
        "theological_significance": "Mô tả mối tương giao mật thiết giữa các tín đồ với Chúa và với nhau trong thân thể Đấng Christ (Công vụ 2:42; 1 Giăng 1:3).",
        "occurrences_count": 19,
        "key_verses": ["Công vụ 2:42", "1 Giăng 1:3", "Phi-líp 2:1", "1 Cô-rinh-tô 10:16"]
    },

    # HEBREW OLD TESTAMENT
    {
        "id": "H7225",
        "strong_number": "H7225",
        "language": "hebrew",
        "lemma": "רֵאשִׁית",
        "transliteration": "rê'shîyth (reshit)",
        "pronunciation": "ray-sheeth'",
        "part_of_speech": "Danh từ, Giống cái",
        "definition": "Ban đầu, khởi nguyên, điểm xuất phát, hoa quả đầu mùa.",
        "theological_significance": "Từ mở đầu cho toàn bộ Kinh Thánh: 'Bereshit' (Ban đầu). Thiết lập vũ trụ quan Cơ Đốc rằng thời gian và vật chất có điểm khởi đầu do Đấng Tạo Hóa phán tạo dựng.",
        "occurrences_count": 51,
        "key_verses": ["Sáng-thế Ký 1:1", "Châm-ngôn 1:7", "Châm-ngôn 8:22", "Giê-rê-mi 2:3"]
    },
    {
        "id": "H1254",
        "strong_number": "H1254",
        "language": "hebrew",
        "lemma": "בָּרָא",
        "transliteration": "bârâ' (bara)",
        "pronunciation": "baw-raw'",
        "part_of_speech": "Động từ",
        "definition": "Sáng tạo, làm nên một điều hoàn toàn mới chưa từng có trước đó.",
        "theological_significance": "Trong Cựu Ước, chủ ngữ của động từ 'bara' LUÔN LUÔN và DUY NHẤT là Đức Chúa Trời (Elohim). Nó chỉ về sự sáng tạo từ hư vô (Creatio ex nihilo) bằng quyền năng tuyệt đối.",
        "occurrences_count": 54,
        "key_verses": ["Sáng-thế Ký 1:1", "Sáng-thế Ký 1:27", "Thi-thiên 51:10", "Ê-sai 40:28"]
    },
    {
        "id": "H2617",
        "strong_number": "H2617",
        "language": "hebrew",
        "lemma": "חֶסֶד",
        "transliteration": "cheçed (chesed)",
        "pronunciation": "kheh'-sed",
        "part_of_speech": "Danh từ, Giống đực",
        "definition": "Lòng nhân từ, sự thương xót giao ước, tình yêu trung thành kiên định không hề lay chuyển.",
        "theological_significance": "Một trong những danh xưng và thuộc tính vinh hiển nhất của Đức Giê-hô-va trong Cựu Ước: tình yêu dựa trên lời thề hứa giao ước dù con người bất trung (Thi-thiên 136:1 - 'Vì sự nhân từ Ngài còn đến đời đời').",
        "occurrences_count": 248,
        "key_verses": ["Thi-thiên 136:1", "Xuất Ê-díp-tô Ký 34:6", "Ca-thương 3:22-23", "Thi-thiên 23:6"]
    },
    {
        "id": "H7965",
        "strong_number": "H7965",
        "language": "hebrew",
        "lemma": "שָׁלוֹם",
        "transliteration": "shâlôwm (shalom)",
        "pronunciation": "shaw-lome'",
        "part_of_speech": "Danh từ, Giống đực",
        "definition": "Bình an, trọn vẹn, thịnh vượng tâm linh, không sứt mẻ, an hòa trong mối liên hệ với Chúa.",
        "theological_significance": "Không chỉ là sự vắng bóng chiến tranh, mà là trạng thái tròn đầy phước hạnh khi con người hòa thuận lại với Đấng Tạo Hóa (Ê-sai 9:6; Dân-số Ký 6:24-26).",
        "occurrences_count": 236,
        "key_verses": ["Dân-số Ký 6:26", "Ê-sai 9:6", "Thi-thiên 29:11", "Giê-rê-mi 29:11"]
    },
    {
        "id": "H1285",
        "strong_number": "H1285",
        "language": "hebrew",
        "lemma": "בְּרִית",
        "transliteration": "bᵉrîyth (berith)",
        "pronunciation": "ber-eeth'",
        "part_of_speech": "Danh từ, Giống cái",
        "definition": "Giao ước, hiệp ước thiêng liêng có hiệu lực ràng buộc kèm theo lời thề và sự đổ huyết.",
        "theological_significance": "Xương sống của lịch sử cứu chuộc: Giao ước Nô-ê, Giao ước Áp-ra-ham, Giao ước Si-na-i, Giao ước Đa-vít, và đỉnh cao là Giao Ước Mới (Bᵉrîyth Chădâshâh) trong huyết Chúa Giê-xu.",
        "occurrences_count": 284,
        "key_verses": ["Sáng-thế Ký 15:18", "Giê-rê-mi 31:31", "Xuất Ê-díp-tô Ký 19:5", "Thi-thiên 89:3"]
    },
    {
        "id": "H0430",
        "strong_number": "H0430",
        "language": "hebrew",
        "lemma": "אֱלֹהִים",
        "transliteration": "'ĕlôhîym (Elohim)",
        "pronunciation": "el-o-heem'",
        "part_of_speech": "Danh từ, Giống đực số nhiều",
        "definition": "Đức Chúa Trời Tối Cao, Đấng Sáng Tạo vũ trụ muôn loài, Đấng Phán xét toàn năng.",
        "theological_significance": "Dạng số nhiều uy nghi (plural of majesty) biểu thị sự phong phú khôn lường của Thần tính, mở đường cho mạc khải trọn vẹn về Ba Ngôi Đức Chúa Trời ngay từ Sáng-thế Ký 1:1.",
        "occurrences_count": 2606,
        "key_verses": ["Sáng-thế Ký 1:1", "Sáng-thế Ký 1:26", "Thi-thiên 19:1", "Phục-truyền 6:4"]
    },
    {
        "id": "H3068",
        "strong_number": "H3068",
        "language": "hebrew",
        "lemma": "יְהוָה",
        "transliteration": "Yᵉhôvâh (Yahweh)",
        "pronunciation": "yeh-ho-vaw'",
        "part_of_speech": "Danh từ riêng",
        "definition": "Đức Giê-hô-va, Danh Giao Ước bất biến, Đấng Tự Hữu Hằng Hữu ('Ta là Đấng Tự Hữu Hằng Hữu').",
        "theological_significance": "Danh xưng thiêng liêng nhất của Đức Chúa Trời bày tỏ cho Môi-se bên bụi gai cháy (Xuất 3:14), tượng trưng cho sự thành tín tuyệt đối, hiện diện cứu chuộc tuyển dân của Ngài.",
        "occurrences_count": 6828,
        "key_verses": ["Xuất Ê-díp-tô Ký 3:14-15", "Thi-thiên 23:1", "Ê-sai 40:28", "Xuất Ê-díp-tô Ký 34:6"]
    },
    {
        "id": "H7307",
        "strong_number": "H7307",
        "language": "hebrew",
        "lemma": "רוּחַ",
        "transliteration": "rûach (Ruach)",
        "pronunciation": "roo'-akh",
        "part_of_speech": "Danh từ, Giống cái/đực",
        "definition": "Gió, hơi thở, tâm thần, hoặc Đức Thánh Linh của Đức Chúa Trời.",
        "theological_significance": "Thần của Đức Chúa Trời vận hành trên mặt nước trong sự sáng tạo (Sáng 1:2), ban hơi thở sự sống cho con người (Sáng 2:7), và xức dầu cho các quan xét, vua và tiên tri.",
        "occurrences_count": 378,
        "key_verses": ["Sáng-thế Ký 1:2", "Thi-thiên 51:11", "Ê-xê-chi-ên 37:9", "Xa-cha-ri 4:6"]
    },
    {
        "id": "H6944",
        "strong_number": "H6944",
        "language": "hebrew",
        "lemma": "קֹדֶשׁ",
        "transliteration": "qôdesh (Qodesh)",
        "pronunciation": "ko'-desh",
        "part_of_speech": "Danh từ, Giống đực",
        "definition": "Sự thánh khiết, biệt riêng ra khỏi sự phàm tục, dành riêng trọn vẹn cho Đức Chúa Trời.",
        "theological_significance": "Thuộc tính cốt lõi của Đức Giê-hô-va ('Ngài là Thánh'). Tuyển dân được kêu gọi nên thánh vì Ngài là thánh (Lê-vi Ký 19:2; Ê-sai 6:3).",
        "occurrences_count": 469,
        "key_verses": ["Xuất Ê-díp-tô Ký 15:11", "Ê-sai 6:3", "Lê-vi Ký 19:2", "Thi-thiên 99:9"]
    },
    {
        "id": "G2316",
        "strong_number": "G2316",
        "language": "greek",
        "lemma": "θεός",
        "transliteration": "theos",
        "pronunciation": "theh'-os",
        "part_of_speech": "Danh từ, Giống đực",
        "definition": "Đức Chúa Trời, Đấng Thần Thượng duy nhất, Chân Thần Tạo Hóa và Cứu Chuộc.",
        "theological_significance": "Trong Tân Ước, Theos chỉ Đức Chúa Trời độc nhất vô nhị, Cha của Chúa Cứu Thế Giê-xu, Đấng yêu thương thế gian đến nỗi ban Con Độc Sanh của Ngài.",
        "occurrences_count": 1317,
        "key_verses": ["Giăng 1:1", "Giăng 3:16", "Rô-ma 8:31", "1 Ti-mô-thê 2:5"]
    },
    {
        "id": "G2962",
        "strong_number": "G2962",
        "language": "greek",
        "lemma": "κύριος",
        "transliteration": "kurios",
        "pronunciation": "koo'-ree-os",
        "part_of_speech": "Danh từ, Giống đực",
        "definition": "Chúa, Chủ, Đấng có quyền tối thượng và quyền sở hữu tuyệt đối.",
        "theological_significance": "Bản Bảy Mươi (LXX) dùng Kurios dịch danh Yahweh (YHWH). Tân Ước xưng nhận Chúa Giê-xu là Kurios để khẳng định Thần tính tuyệt đối của Ngài ('Đức Chúa Giê-xu là Chúa', Rô-ma 10:9; Phi-líp 2:11).",
        "occurrences_count": 717,
        "key_verses": ["Phi-líp 2:11", "Rô-ma 10:9", "1 Cô-rinh-tô 12:3", "Khải Huyền 19:16"]
    },
    {
        "id": "G5547",
        "strong_number": "G5547",
        "language": "greek",
        "lemma": "Χριστός",
        "transliteration": "Christos",
        "pronunciation": "khris-tos'",
        "part_of_speech": "Danh từ riêng / Tính từ",
        "definition": "Đấng Christ, Đấng Được Xức Dầu (tương đương với Mashiach / Mê-si-a trong tiếng Hê-bơ-rơ).",
        "theological_significance": "Danh hiệu vinh hiển của Chúa Giê-xu, Đấng hoàn tất ba chức vụ xức dầu trọn hảo: Tiên Tri, Thầy Tế Lễ Thượng Phẩm và Vua vinh hiển muôn đời.",
        "occurrences_count": 529,
        "key_verses": ["Ma-thi-ơ 16:16", "Rô-ma 5:8", "Cô-lô-se 1:15-20", "2 Cô-rinh-tô 5:17"]
    },
    {
        "id": "G2098",
        "strong_number": "G2098",
        "language": "greek",
        "lemma": "εὐαγγέλιον",
        "transliteration": "euangelion",
        "pronunciation": "yoo-ang-ghel'-ee-on",
        "part_of_speech": "Danh từ, Giống trung",
        "definition": "Tin Lành, Phúc Âm, tin tức tốt lành mừng vui về ơn cứu rỗi và Nước Trời.",
        "theological_significance": "Tin lành cứu chuộc qua sự chết đền tội và sự phục sinh của Đấng Christ. Quyền phép của Đức Chúa Trời để cứu mọi kẻ tin (Rô-ma 1:16; 1 Cô-rinh-tô 15:1-4).",
        "occurrences_count": 76,
        "key_verses": ["Rô-ma 1:16", "1 Cô-rinh-tô 15:1-4", "Mác 1:1", "Mác 1:15"]
    },
    {
        "id": "G3341",
        "strong_number": "G3341",
        "language": "greek",
        "lemma": "μετάνοια",
        "transliteration": "metanoia",
        "pronunciation": "met-an'-oy-ah",
        "part_of_speech": "Danh từ, Giống cái",
        "definition": "Sự ăn năn, thay đổi toàn diện tâm trí, nhận thức và hướng đi quay về cùng Đức Chúa Trời.",
        "theological_significance": "Không chỉ là cảm giác ân hận hay hối tiếc cảm xúc, mà là sự quay lưng 180 độ khỏi tội lỗi để hướng trọn lòng về Đấng Christ (Công vụ 2:38; 26:20; 2 Cô-rinh-tô 7:10).",
        "occurrences_count": 22,
        "key_verses": ["Công vụ 2:38", "Mác 1:15", "Lu-ca 15:7", "2 Phi-e-rơ 3:9"]
    },
    {
        "id": "G4991",
        "strong_number": "G4991",
        "language": "greek",
        "lemma": "σωτηρία",
        "transliteration": "sōtēria",
        "pronunciation": "so-tay-ree'-ah",
        "part_of_speech": "Danh từ, Giống cái",
        "definition": "Sự cứu rỗi, sự giải cứu toàn diện khỏi tội lỗi, sự chết, án phạt và ban cho sự sống đời đời.",
        "theological_significance": "Ơn cứu rỗi trọn vẹn gồm 3 thì: đã được xưng công bình (quá khứ), đang được nên thánh (hiện tại), và sẽ được vinh hiển hóa (tương lai) trong ngày Đấng Christ tái lâm (Rô-ma 1:16; Ê-phê-sô 2:8-9).",
        "occurrences_count": 46,
        "key_verses": ["Công vụ 4:12", "Ê-phê-sô 2:8", "Rô-ma 1:16", "Phi-líp 2:12"]
    }
]

def seed_strong_lexicon():
    with engine.begin() as conn:
        print("[*] Seeding Strong Lexicon entries...")
        for s in STRONG_SEEDS:
            conn.execute(
                text("""
                INSERT INTO strong_lexicon (
                    id, strong_number, language, lemma, transliteration, pronunciation,
                    part_of_speech, definition, theological_significance, occurrences_count, key_verses
                ) VALUES (
                    :id, :strong_number, :lang, :lemma, :trans, :pron,
                    :pos, :definition, :theo, :occ, :key_verses
                )
                ON CONFLICT (id) DO UPDATE SET
                    lemma = EXCLUDED.lemma,
                    definition = EXCLUDED.definition,
                    theological_significance = EXCLUDED.theological_significance,
                    key_verses = EXCLUDED.key_verses
                """),
                {
                    "id": s["id"],
                    "strong_number": s["strong_number"],
                    "lang": s["language"],
                    "lemma": s["lemma"],
                    "trans": s["transliteration"],
                    "pron": s["pronunciation"],
                    "pos": s["part_of_speech"],
                    "definition": s["definition"],
                    "theo": s["theological_significance"],
                    "occ": s["occurrences_count"],
                    "key_verses": json.dumps(s["key_verses"], ensure_ascii=False)
                }
            )
        print(f"[+] Successfully seeded {len(STRONG_SEEDS)} Strong Lexicon theological keywords!")

if __name__ == "__main__":
    seed_strong_lexicon()
