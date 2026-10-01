"""
seed_entities_graph.py: Seed People, Places, Events and Knowledge Graph into PostgreSQL
Reference: ROADMAP1.md Sections 6, 7, 8, 9, 10, 11
"""

import json
from sqlalchemy import text
from app.db.session import engine

PEOPLE_SEEDS = [
    {
        "slug": "chua-gie-xu",
        "name_vi": "Chúa Giê-xu",
        "name_en": "Jesus Christ",
        "original_name": "Yeshua / Ἰησοῦς",
        "gender": "male",
        "title_or_role": "Đấng Mê-si-a, Con Đức Chúa Trời, Đấng Cứu Thế",
        "summary": "Tâm điểm của toàn bộ Kinh Thánh. Giáng sinh làm người, chịu đóng đinh đền tội cho nhân loại trên thập tự giá, sống lại ngày thứ ba và thăng thiên vinh hiển.",
        "timeline_period": "Life of Christ (khoảng 4 TCN - 30/33 SCN)",
        "metadata": {"key_verse": "Giăng 14:6", "testament": "NT"}
    },
    {
        "slug": "si-mon-phi-e-ro",
        "name_vi": "Si-môn Phi-e-rơ",
        "name_en": "Simon Peter",
        "original_name": "Shim'on / Cephas",
        "gender": "male",
        "title_or_role": "Sứ đồ của Chúa Giê-xu, Trụ cột Hội Thánh ban đầu",
        "summary": "Từng là ngư phủ tại Ga-li-lê, môn đồ đầu tiên tuyên xưng đức tin nơi Đấng Christ. Được phục hồi sau 3 lần chối Chúa và lãnh đạo bài giảng Ngũ Tuần.",
        "timeline_period": "Early Church (khoảng 1 TCN - 67 SCN)",
        "metadata": {"key_verse": "Ma-thi-ơ 16:16", "testament": "NT"}
    },
    {
        "slug": "su-do-phao-lo",
        "name_vi": "Sứ đồ Phao-lô",
        "name_en": "Paul the Apostle",
        "original_name": "Saul of Tarsus / Παῦλος",
        "gender": "male",
        "title_or_role": "Sứ đồ cho Dân Ngoại, Học giả & Tác giả 13 Thư tín",
        "summary": "Người Pha-ri-si từng bắt bớ Đạo Chúa, gặp Chúa Giê-xu trên đường Đa-mách, thực hiện 3 chuyến truyền giáo vĩ đại khắp Đế quốc La Mã.",
        "timeline_period": "Early Church (khoảng 5 SCN - 67 SCN)",
        "metadata": {"key_verse": "Rô-ma 1:16", "testament": "NT"}
    },
    {
        "slug": "vua-da-vit",
        "name_vi": "Vua Đa-vít",
        "name_en": "King David",
        "original_name": "Dawid / דָּוִד",
        "gender": "male",
        "title_or_role": "Vua thứ hai của Y-sơ-ra-ên, Người vừa lòng Đức Chúa Trời",
        "summary": "Người chăn chiên đánh bại Gô-li-át, hiệp nhất các chi phái, lập Giê-ru-sa-lem làm thủ đô, nhận giao ước vĩnh hằng về dòng dõi Đấng Mê-si-a.",
        "timeline_period": "United Kingdom (khoảng 1040 - 970 TCN)",
        "metadata": {"key_verse": "Thi-thiên 23:1", "testament": "OT"}
    },
    {
        "slug": "moi-se",
        "name_vi": "Môi-se",
        "name_en": "Moses",
        "original_name": "Mosheh / מֹשֶׁה",
        "gender": "male",
        "title_or_role": "Tiên tri, Người giải phóng & Người ban Luật pháp",
        "summary": "Được Chúa kêu gọi nơi bụi gai cháy, dẫn dân Y-sơ-ra-ên ra khỏi Ai Cập, rẽ Biển Đỏ, nhận Mười Điều Răn tại núi Si-na-i và viết Ngũ Kinh.",
        "timeline_period": "Exodus & Wilderness (khoảng 1526 - 1406 TCN)",
        "metadata": {"key_verse": "Xuất Ê-díp-tô Ký 3:14", "testament": "OT"}
    },
    {
        "slug": "ap-ra-ham",
        "name_vi": "Áp-ra-ham",
        "name_en": "Abraham",
        "original_name": "Avraham / אַבְרָהָם",
        "gender": "male",
        "title_or_role": "Tổ phụ của đức tin, Bạn của Đức Chúa Trời",
        "summary": "Vâng lời rời bỏ xứ U-rơ đến Đất Hứa. Đức Chúa Trời lập Giao Ước Áp-ra-ham hứa ban dòng dõi vô số và qua dòng dõi người mọi dân tộc được phước.",
        "timeline_period": "Patriarchs (khoảng 2166 - 1991 TCN)",
        "metadata": {"key_verse": "Sáng-thế Ký 15:6", "testament": "OT"}
    },
    {
        "slug": "gio-sep",
        "name_vi": "Giô-sép",
        "name_en": "Joseph",
        "original_name": "Yosef / יוֹסֵף",
        "gender": "male",
        "title_or_role": "Tể tướng xứ Ai Cập, Con trai Gia-cốp",
        "summary": "Bị các anh bán sang Ai Cập, giữ lòng trung trinh nơi thử thách, giải mộng cho Pha-ra-ôn và cứu cả gia tộc khỏi nạn đói khốc liệt.",
        "timeline_period": "Patriarchs (khoảng 1915 - 1805 TCN)",
        "metadata": {"key_verse": "Sáng-thế Ký 50:20", "testament": "OT"}
    },
    {
        "slug": "ma-ri",
        "name_vi": "Ma-ri",
        "name_en": "Mary, mother of Jesus",
        "original_name": "Miryam / Μαρία",
        "gender": "female",
        "title_or_role": "Mẹ phần xác của Chúa Giê-xu",
        "summary": "Trinh nữ khiêm nhường tại Na-xa-rét, chịu thai bởi Đức Thánh Linh và sinh ra Đấng Cứu Thế Giê-xu.",
        "timeline_period": "Life of Christ (khoảng 20 TCN - 50 SCN)",
        "metadata": {"key_verse": "Lu-ca 1:38", "testament": "NT"}
    },
    {
        "slug": "su-do-giang",
        "name_vi": "Sứ đồ Giăng",
        "name_en": "John the Apostle",
        "original_name": "Yochanan / Ἰωάννης",
        "gender": "male",
        "title_or_role": "Sứ đồ được Chúa yêu, Tác giả Phúc Âm Giăng & Khải Huyền",
        "summary": "Em ruột của Gia-cơ, môn đồ thân cận đứng bên chân thập tự giá, được khải tượng tại đảo Bát-mô viết nên sách Khải Huyền.",
        "timeline_period": "Early Church (khoảng 6 SCN - 100 SCN)",
        "metadata": {"key_verse": "Giăng 3:16", "testament": "NT"}
    },
    {
        "slug": "vua-sa-lo-mon",
        "name_vi": "Vua Sa-lô-môn",
        "name_en": "King Solomon",
        "original_name": "Shelomoh / שְׁלֹמֹה",
        "gender": "male",
        "title_or_role": "Vua thứ ba của Y-sơ-ra-ên, Người xây Đền Thờ",
        "summary": "Con của vua Đa-vít, được ban sự khôn ngoan tột bực, xây dựng Đền Thờ Giê-ru-sa-lem nguy nga tráng lệ, tác giả sách Châm Ngôn và Truyền Đạo.",
        "timeline_period": "United Kingdom (khoảng 990 - 931 TCN)",
        "metadata": {"key_verse": "1 Các Vua 3:9", "testament": "OT"}
    }
]

PLACES_SEEDS = [
    {
        "slug": "gie-ru-sa-lem",
        "name_vi": "Giê-ru-sa-lem",
        "name_en": "Jerusalem",
        "modern_name": "Jerusalem, Israel",
        "latitude": 31.7683,
        "longitude": 35.2137,
        "description": "Thành phố Thánh, trung tâm thờ phượng của tuyển dân Do Thái, nơi xây Đền Thờ Đức Chúa Trời, và nơi Chúa Giê-xu chịu chết và sống lại."
    },
    {
        "slug": "bet-le-hem",
        "name_vi": "Bết-lê-hem",
        "name_en": "Bethlehem",
        "modern_name": "Bethlehem, West Bank",
        "latitude": 31.7054,
        "longitude": 35.2024,
        "description": "Thành của Đa-vít, nơi Chúa Giê-xu giáng sinh ứng nghiệm lời tiên tri Mi-chê 5:2."
    },
    {
        "slug": "ca-na",
        "name_vi": "Ca-na",
        "name_en": "Cana of Galilee",
        "modern_name": "Kafr Kanna, Israel",
        "latitude": 32.7472,
        "longitude": 35.3389,
        "description": "Ngôi làng tại Ga-li-lê nơi Chúa Giê-xu thực hiện phép lạ đầu tiên hóa nước thành rượu trong đám cưới."
    },
    {
        "slug": "bien-ga-li-le",
        "name_vi": "Biển Ga-li-lê",
        "name_en": "Sea of Galilee",
        "modern_name": "Lake Kinneret, Israel",
        "latitude": 32.8228,
        "longitude": 35.5869,
        "description": "Hồ nước ngọt trung tâm chức vụ của Chúa Giê-xu, nơi Ngài kêu gọi 4 môn đồ ngư phủ, đi bộ trên mặt nước và dẹp yên bão tố."
    },
    {
        "slug": "nui-si-na-i",
        "name_vi": "Núi Si-na-i",
        "name_en": "Mount Sinai",
        "modern_name": "Jabal Musa, Egypt",
        "latitude": 28.5394,
        "longitude": 33.9753,
        "description": "Núi Thánh nơi Đức Chúa Trời ngự xuống trong đám mây lửa và ban bố Mười Điều Răn cùng Luật Pháp cho Môi-se."
    },
    {
        "slug": "ai-cap",
        "name_vi": "Ai Cập",
        "name_en": "Egypt",
        "modern_name": "Arab Republic of Egypt",
        "latitude": 26.8206,
        "longitude": 30.8025,
        "description": "Đế quốc cổ đại nơi con cái Y-sơ-ra-ên sinh sống hơn 400 năm và làm nô lệ cho đến khi được Đức Chúa Trời dùng Môi-se giải phóng."
    },
    {
        "slug": "ba-by-lon",
        "name_vi": "Ba-by-lôn",
        "name_en": "Babylon",
        "modern_name": "Al-Hillah, Iraq",
        "latitude": 32.5364,
        "longitude": 44.4208,
        "description": "Kinh đô đế quốc Ba-by-lôn, nơi vua Nê-bu-cát-nết-xa phá hủy Đền Thờ Giê-ru-sa-lem và lưu đày dân Do Thái suốt 70 năm."
    },
    {
        "slug": "da-mach",
        "name_vi": "Đa-mách",
        "name_en": "Damascus",
        "modern_name": "Damascus, Syria",
        "latitude": 33.5138,
        "longitude": 36.2765,
        "description": "Thành phố cổ nơi Sau-lơ trên đường đi bắt bớ các tín hữu đã gặp luồng ánh sáng từ trời và được biến đổi thành Sứ đồ Phao-lô."
    },
    {
        "slug": "na-xa-ret",
        "name_vi": "Na-xa-rét",
        "name_en": "Nazareth",
        "modern_name": "Nazareth, Israel",
        "latitude": 32.7019,
        "longitude": 35.3033,
        "description": "Thị trấn nhỏ tại Ga-li-lê nơi Chúa Giê-xu trải qua thời niên thiếu và lớn lên bên cạnh Giô-sép và Ma-ri."
    }
]

EVENTS_SEEDS = [
    {
        "slug": "su-sang-tao",
        "title": "Sự Sáng Tạo Vũ Trụ & Loài Người",
        "approximate_date": "Khởi đầu thời gian",
        "date_type": "unknown",
        "period": "Creation & Primeval",
        "description": "Đức Chúa Trời phán lời tạo dựng trời đất, muôn loài vạn vật và sáng tạo loài người theo hình ảnh và tượng Ngài trong 6 ngày.",
        "metadata": {"scripture": "Sáng-thế Ký 1-2", "era_order": 1}
    },
    {
        "slug": "giao-uoc-ap-ra-ham",
        "title": "Đức Chúa Trời Lập Giao Ước Áp-ra-ham",
        "approximate_date": "khoảng 2091 TCN",
        "date_type": "approximate",
        "period": "Patriarchs",
        "description": "Đức Chúa Trời kêu gọi Áp-ra-ham ra khỏi U-rơ và hứa ban xứ Ca-na-an cùng dòng dõi vô số cho người.",
        "metadata": {"scripture": "Sáng-thế Ký 12:1-3; 15:1-6", "era_order": 2}
    },
    {
        "slug": "xuat-ai-cap-vuot-bien-do",
        "title": "Xuất Ai Cập & Vượt Qua Biển Đỏ",
        "approximate_date": "khoảng 1446 TCN",
        "date_type": "approximate",
        "period": "Exodus & Wilderness",
        "description": "Đức Chúa Trời rẽ đôi nước Biển Đỏ qua bàn tay Môi-se, giải cứu tuyển dân Y-sơ-ra-ên khỏi đạo quân Pha-ra-ôn.",
        "metadata": {"scripture": "Xuất Ê-díp-tô Ký 14", "era_order": 3}
    },
    {
        "slug": "xay-den-tho-sa-lo-mon",
        "title": "Xây Cất Đền Thờ Giê-ru-sa-lem Đầu Tiên",
        "approximate_date": "khoảng 966 - 959 TCN",
        "date_type": "approximate",
        "period": "United Kingdom",
        "description": "Vua Sa-lô-môn xây dựng Đền Thờ bằng gỗ bá hương Li-ban và vàng ròng; sự vinh hiển của Chúa ngự xuống đầy dẫy.",
        "metadata": {"scripture": "1 Các Vua 6; 8", "era_order": 4}
    },
    {
        "slug": "su-giang-sinh-chua-gie-xu",
        "title": "Sự Giáng Sinh của Chúa Cứu Thế Giê-xu",
        "approximate_date": "khoảng 5 - 4 TCN",
        "date_type": "approximate",
        "period": "Life of Christ",
        "description": "Đức Chúa Trời trở nên xác thịt, giáng sinh nơi máng cỏ chuồng chiên tại Bết-lê-hem từ trinh nữ Ma-ri.",
        "metadata": {"scripture": "Lu-ca 2:1-20; Ma-thi-ơ 1:18-25", "era_order": 5}
    },
    {
        "slug": "phep-la-ca-na",
        "title": "Phép Lạ Hóa Nước Thành Rượu Tại Ca-na",
        "approximate_date": "khoảng 27 SCN",
        "date_type": "approximate",
        "period": "Life of Christ",
        "description": "Phép lạ đầu tiên của Chúa Giê-xu tỏ bày quyền năng siêu nhiên trên vật chất và khích lệ đức tin các môn đồ.",
        "metadata": {"scripture": "Giăng 2:1-11", "era_order": 6}
    },
    {
        "slug": "di-bo-tren-mat-bien",
        "title": "Chúa Giê-xu & Phi-e-rơ Đi Bộ Trên Biển",
        "approximate_date": "khoảng 29 SCN",
        "date_type": "approximate",
        "period": "Life of Christ",
        "description": "Chúa Giê-xu đi trên mặt sóng gió đến với thuyền môn đồ; Phi-e-rơ bước xuống biển đi cùng Ngài bởi đức tin.",
        "metadata": {"scripture": "Ma-thi-ơ 14:22-33", "era_order": 7}
    },
    {
        "slug": "su-dong-dinh-thap-tu-gia",
        "title": "Chúa Giê-xu Chịu Đóng Đinh Trên Thập Tự Giá",
        "approximate_date": "khoảng 30 hoặc 33 SCN",
        "date_type": "approximate",
        "period": "Life of Christ",
        "description": "Đấng Christ chịu đóng đinh tại đồi Gô-gô-tha ngoài thành Giê-ru-sa-lem làm sinh tế chuộc tội đời đời cho nhân loại.",
        "metadata": {"scripture": "Lu-ca 23; Giăng 19", "era_order": 8}
    },
    {
        "slug": "su-phuc-sinh-vinh-hien",
        "title": "Sự Phục Sinh Vinh Hiển Của Đấng Christ",
        "approximate_date": "khoảng 30 hoặc 33 SCN",
        "date_type": "approximate",
        "period": "Life of Christ",
        "description": "Chúa Giê-xu sống lại từ cõi chết vào sáng sớm ngày thứ nhất trong tuần, đắc thắng sự chết và ban quyền năng cứu rỗi.",
        "metadata": {"scripture": "Ma-thi-ơ 28; 1 Cô-rinh-tô 15", "era_order": 9}
    },
    {
        "slug": "bien-co-le-ngu-tuan",
        "title": "Đức Thánh Linh Giáng Lâm Trong Lễ Ngũ Tuần",
        "approximate_date": "khoảng 30 hoặc 33 SCN",
        "date_type": "approximate",
        "period": "Early Church",
        "description": "Đức Thánh Linh giáng lâm đầy dẫy trên các môn đồ tại Giê-ru-sa-lem, khai sinh Hội Thánh Cơ Đốc toàn cầu.",
        "metadata": {"scripture": "Công vụ các Sứ đồ 2", "era_order": 10}
    },
    {
        "slug": "su-bien-cai-cua-phao-lo",
        "title": "Sự Biến Cải Của Sau-lơ Trên Đường Đa-mách",
        "approximate_date": "khoảng 34 - 35 SCN",
        "date_type": "approximate",
        "period": "Early Church",
        "description": "Ánh sáng vinh quang từ trời khiến Sau-lơ ngã ngựa, ăn năn nhận biết Đấng Christ và được kêu gọi làm sứ đồ Dân Ngoại.",
        "metadata": {"scripture": "Công vụ các Sứ đồ 9:1-19", "era_order": 11}
    }
]

# Knowledge Edges definition: (source_key, target_key, relation, metadata)
EDGE_RELATIONS = [
    # People -> People
    ("si-mon-phi-e-ro", "chua-gie-xu", "DISCIPLE_OF", {"description": "Phi-e-rơ là môn đồ thân cận của Chúa Giê-xu"}),
    ("su-do-giang", "chua-gie-xu", "DISCIPLE_OF", {"description": "Giăng là môn đồ được Chúa Giê-xu yêu mến"}),
    ("su-do-phao-lo", "chua-gie-xu", "APOSTLE_OF", {"description": "Phao-lô được kêu gọi làm sứ đồ cho Dân Ngoại"}),
    ("ma-ri", "chua-gie-xu", "MOTHER_OF", {"description": "Ma-ri là mẹ phần xác của Chúa Giê-xu"}),
    ("vua-sa-lo-mon", "vua-da-vit", "SON_OF", {"description": "Sa-lô-môn là con trai vua Đa-vít"}),
    ("vua-da-vit", "ap-ra-ham", "DESCENDANT_OF", {"description": "Đa-vít thuộc dòng dõi của Áp-ra-ham"}),
    ("gio-sep", "ap-ra-ham", "GREAT_GRANDSON_OF", {"description": "Giô-sép là chắt của tổ phụ Áp-ra-ham"}),
    
    # People -> Events
    ("chua-gie-xu", "su-giang-sinh-chua-gie-xu", "CENTRAL_FIGURE_OF", {}),
    ("ma-ri", "su-giang-sinh-chua-gie-xu", "PARTICIPATED_IN", {}),
    ("chua-gie-xu", "phep-la-ca-na", "PERFORMED", {}),
    ("ma-ri", "phep-la-ca-na", "ATTENDED", {}),
    ("chua-gie-xu", "di-bo-tren-mat-bien", "WALKED_ON_WATER", {}),
    ("si-mon-phi-e-ro", "di-bo-tren-mat-bien", "PARTICIPATED_IN", {}),
    ("chua-gie-xu", "su-dong-dinh-thap-tu-gia", "CRUCIFIED_AT", {}),
    ("su-do-giang", "su-dong-dinh-thap-tu-gia", "WITNESSED", {}),
    ("chua-gie-xu", "su-phuc-sinh-vinh-hien", "RESURRECTED", {}),
    ("si-mon-phi-e-ro", "bien-co-le-ngu-tuan", "PREACHED_AT", {}),
    ("su-do-phao-lo", "su-bien-cai-cua-phao-lo", "CONVERTED_AT", {}),
    ("moi-se", "xuat-ai-cap-vuot-bien-do", "LED", {}),
    ("vua-sa-lo-mon", "xay-den-tho-sa-lo-mon", "BUILT", {}),
    ("ap-ra-ham", "giao-uoc-ap-ra-ham", "RECEIVED_COVENANT", {}),

    # Events -> Places
    ("su-giang-sinh-chua-gie-xu", "bet-le-hem", "OCCURRED_AT", {}),
    ("phep-la-ca-na", "ca-na", "OCCURRED_AT", {}),
    ("di-bo-tren-mat-bien", "bien-ga-li-le", "OCCURRED_AT", {}),
    ("su-dong-dinh-thap-tu-gia", "gie-ru-sa-lem", "OCCURRED_AT", {}),
    ("su-phuc-sinh-vinh-hien", "gie-ru-sa-lem", "OCCURRED_AT", {}),
    ("bien-co-le-ngu-tuan", "gie-ru-sa-lem", "OCCURRED_AT", {}),
    ("xay-den-tho-sa-lo-mon", "gie-ru-sa-lem", "OCCURRED_AT", {}),
    ("su-bien-cai-cua-phao-lo", "da-mach", "OCCURRED_AT", {}),
    ("xuat-ai-cap-vuot-bien-do", "ai-cap", "DEPARTED_FROM", {}),

    # People -> Places
    ("chua-gie-xu", "na-xa-ret", "GREW_UP_IN", {}),
    ("chua-gie-xu", "bien-ga-li-le", "MINISTERED_AROUND", {}),
    ("vua-da-vit", "gie-ru-sa-lem", "RULED_IN", {}),
    ("gio-sep", "ai-cap", "GOVERNED_IN", {}),
    ("moi-se", "nui-si-na-i", "MET_GOD_AT", {})
]

def seed_graph_and_entities():
    with engine.begin() as conn:
        print("[*] 1. Seeding People...")
        for p in PEOPLE_SEEDS:
            conn.execute(
                text("""
                INSERT INTO people (slug, name_vi, name_en, original_name, gender, title_or_role, summary, timeline_period, metadata)
                VALUES (:slug, :name_vi, :name_en, :original_name, :gender, :title, :summary, :period, :meta)
                ON CONFLICT (slug) DO UPDATE SET
                    name_vi = EXCLUDED.name_vi,
                    summary = EXCLUDED.summary,
                    metadata = EXCLUDED.metadata
                """),
                {
                    "slug": p["slug"],
                    "name_vi": p["name_vi"],
                    "name_en": p["name_en"],
                    "original_name": p["original_name"],
                    "gender": p["gender"],
                    "title": p["title_or_role"],
                    "summary": p["summary"],
                    "period": p["timeline_period"],
                    "meta": json.dumps(p["metadata"])
                }
            )

        print("[*] 2. Seeding Places...")
        for pl in PLACES_SEEDS:
            conn.execute(
                text("""
                INSERT INTO places (slug, name_vi, name_en, modern_name, latitude, longitude, description, metadata)
                VALUES (:slug, :name_vi, :name_en, :modern_name, :lat, :lng, :description, '{}'::jsonb)
                ON CONFLICT (slug) DO UPDATE SET
                    name_vi = EXCLUDED.name_vi,
                    description = EXCLUDED.description
                """),
                {
                    "slug": pl["slug"],
                    "name_vi": pl["name_vi"],
                    "name_en": pl["name_en"],
                    "modern_name": pl["modern_name"],
                    "lat": pl["latitude"],
                    "lng": pl["longitude"],
                    "description": pl["description"]
                }
            )

        print("[*] 3. Seeding Events...")
        for ev in EVENTS_SEEDS:
            conn.execute(
                text("""
                INSERT INTO events (slug, title, approximate_date, date_type, period, description, metadata)
                VALUES (:slug, :title, :approx_date, :date_type, :period, :description, :meta)
                ON CONFLICT (slug) DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    metadata = EXCLUDED.metadata
                """),
                {
                    "slug": ev["slug"],
                    "title": ev["title"],
                    "approx_date": ev["approximate_date"],
                    "date_type": ev["date_type"],
                    "period": ev["period"],
                    "description": ev["description"],
                    "meta": json.dumps(ev["metadata"])
                }
            )

        print("[*] 4. Synchronizing knowledge_nodes...")
        # People nodes
        for p in PEOPLE_SEEDS:
            conn.execute(
                text("""
                INSERT INTO knowledge_nodes (node_type, node_key, label, metadata)
                VALUES ('person', :key, :label, :meta)
                ON CONFLICT (node_key) DO UPDATE SET label = EXCLUDED.label, metadata = EXCLUDED.metadata
                """),
                {
                    "key": p["slug"],
                    "label": p["name_vi"],
                    "meta": json.dumps({"role": p["title_or_role"], "period": p["timeline_period"]})
                }
            )
        # Places nodes
        for pl in PLACES_SEEDS:
            conn.execute(
                text("""
                INSERT INTO knowledge_nodes (node_type, node_key, label, metadata)
                VALUES ('place', :key, :label, :meta)
                ON CONFLICT (node_key) DO UPDATE SET label = EXCLUDED.label, metadata = EXCLUDED.metadata
                """),
                {
                    "key": pl["slug"],
                    "label": pl["name_vi"],
                    "meta": json.dumps({"modern": pl["modern_name"], "lat": pl["latitude"], "lng": pl["longitude"]})
                }
            )
        # Events nodes
        for ev in EVENTS_SEEDS:
            conn.execute(
                text("""
                INSERT INTO knowledge_nodes (node_type, node_key, label, metadata)
                VALUES ('event', :key, :label, :meta)
                ON CONFLICT (node_key) DO UPDATE SET label = EXCLUDED.label, metadata = EXCLUDED.metadata
                """),
                {
                    "key": ev["slug"],
                    "label": ev["title"],
                    "meta": json.dumps({"period": ev["period"], "date": ev["approximate_date"]})
                }
            )

        print("[*] 5. Creating knowledge_edges...")
        # Clear existing seeded edges to avoid duplicate accumulation
        conn.execute(text("DELETE FROM knowledge_edges"))
        
        node_map = {}
        for r in conn.execute(text("SELECT id, node_key FROM knowledge_nodes")).fetchall():
            node_map[r.node_key] = r.id

        created_edges = 0
        for src_key, tgt_key, rel, meta in EDGE_RELATIONS:
            src_id = node_map.get(src_key)
            tgt_id = node_map.get(tgt_key)
            if src_id and tgt_id:
                conn.execute(
                    text("""
                    INSERT INTO knowledge_edges (source_node_id, target_node_id, relation, confidence, metadata)
                    VALUES (:src, :tgt, :rel, 'canonical', :meta)
                    """),
                    {
                        "src": src_id,
                        "tgt": tgt_id,
                        "rel": rel,
                        "meta": json.dumps(meta)
                    }
                )
                created_edges += 1

        print(f"[+] Successfully seeded {len(PEOPLE_SEEDS)} people, {len(PLACES_SEEDS)} places, {len(EVENTS_SEEDS)} events, and {created_edges} knowledge edges!")

if __name__ == "__main__":
    seed_graph_and_entities()
