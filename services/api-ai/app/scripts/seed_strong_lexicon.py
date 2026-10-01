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
