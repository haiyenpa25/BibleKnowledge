"""
seed_learning.py: Seed biblical quiz questions and flashcards into PostgreSQL
Reference: ROADMAP1.md Sections 3, 4, 46
"""

import json
from sqlalchemy import text
from app.db.session import engine

QUIZ_SEEDS = [
    # Multiple Choice (ABCD)
    {
        "question_type": "multiple_choice",
        "question_text": "Theo Sáng-thế Ký chương 1, Đức Chúa Trời sáng tạo nên loài người vào ngày thứ mấy?",
        "options": ["Ngày thứ ba", "Ngày thứ tư", "Ngày thứ năm", "Ngày thứ sáu"],
        "correct_option": 3,
        "explanation": "Đức Chúa Trời tạo dựng muông thú và loài người vào ngày thứ sáu của tuần lễ sáng tạo.",
        "scripture_reference": "Sáng-thế Ký 1:26-31",
        "difficulty": 1
    },
    {
        "question_type": "multiple_choice",
        "question_text": "Chúa Giê-xu đã thực hiện phép lạ đầu tiên của Ngài tại đâu?",
        "options": ["Tại Bết-lê-hem", "Tại đám cưới ở Ca-na xứ Ga-li-lê", "Tại bờ hồ Ti-bê-ri-át", "Tại đền thờ Giê-ru-sa-lem"],
        "correct_option": 1,
        "explanation": "Phép lạ hóa nước thành rượu tại đám cưới Ca-na là phép lạ đầu tiên của Chúa Giê-xu để tỏ bày vinh quang Ngài.",
        "scripture_reference": "Giăng 2:1-11",
        "difficulty": 1
    },
    {
        "question_type": "multiple_choice",
        "question_text": "Ai là vị vua khôn ngoan nhất của Y-sơ-ra-ên, người đã xây dựng Đền Thờ đầu tiên tại Giê-ru-sa-lem?",
        "options": ["Sau-lơ", "Đa-vít", "Sa-lô-môn", "Rô-bô-am"],
        "correct_option": 2,
        "explanation": "Vua Sa-lô-môn được ban cho sự khôn ngoan vô song và đã hoàn tất việc xây cất Đền Thờ cho Đức Giê-hô-va.",
        "scripture_reference": "1 Các Vua 4:29-34; 6:1",
        "difficulty": 1
    },
    {
        "question_type": "multiple_choice",
        "question_text": "Sứ đồ nào được mệnh danh là 'môn đồ được Đức Chúa Giê-xu yêu'?",
        "options": ["Phi-e-rơ", "Gia-cơ", "Giăng", "Anh-rê"],
        "correct_option": 2,
        "explanation": "Sứ đồ Giăng tự gọi mình trong sách Phúc Âm thứ tư là 'môn đồ mà Đức Chúa Giê-xu yêu'.",
        "scripture_reference": "Giăng 13:23; 21:20",
        "difficulty": 2
    },
    {
        "question_type": "multiple_choice",
        "question_text": "Trong sách Khải Huyền, Hội Thánh nào bị Chúa quở trách là 'hâm hẩm, không nóng cũng không lạnh'?",
        "options": ["Ê-phê-sô", "Sạt-đe", "La-o-đi-xê", "Phi-la-đen-phi"],
        "correct_option": 2,
        "explanation": "Hội Thánh La-o-đi-xê bị quở trách vì sự tự mãn thuộc linh và thái độ hâm hẩm trước mặt Chúa.",
        "scripture_reference": "Khải Huyền 3:14-16",
        "difficulty": 2
    },
    {
        "question_type": "multiple_choice",
        "question_text": "Ai là người đã dẫn dân Y-sơ-ra-ên vượt qua sông Giô-đanh để vào chiếm xứ Đất Hứa Ca-na-an?",
        "options": ["Môi-se", "Giô-suê", "Ca-lép", "A-rôn"],
        "correct_option": 1,
        "explanation": "Sau khi Môi-se qua đời trên núi Nê-bô, Giô-suê nối quyền lãnh đạo và dẫn dân sự vượt sông Giô-đanh.",
        "scripture_reference": "Giô-suê 1:1-6; 3:14-17",
        "difficulty": 1
    },
    {
        "question_type": "multiple_choice",
        "question_text": "Trái của Thánh Linh được liệt kê trong sách Ga-la-ti bao gồm bao nhiêu mỹ đức?",
        "options": ["7 mỹ đức", "8 mỹ đức", "9 mỹ đức", "12 mỹ đức"],
        "correct_option": 2,
        "explanation": "Trái của Thánh Linh gồm 9 mỹ đức: yêu thương, vui mừng, bình an, nhịn nhục, nhân từ, hiền lành, trung tín, mềm mại, tiết độ.",
        "scripture_reference": "Ga-la-ti 5:22-23",
        "difficulty": 2
    },
    # Who Am I? (Đố nhân vật theo ROADMAP1.md mục 3)
    {
        "question_type": "who_am_i",
        "question_text": "Tôi từng là một ngư phủ trên biển Ga-li-lê. Tôi từng đi bộ trên mặt nước với Chúa. Dù đã từng chối Chúa ba lần trước khi gà gáy, tôi đã được Chúa phục hồi và trở thành người giảng đạo ngày Lễ Ngũ Tuần khiến 3.000 người tin Chúa. Tôi là ai?",
        "options": ["Gia-cơ", "Si-môn Phi-e-rơ", "Anh-rê", "Thô-ma"],
        "correct_option": 1,
        "explanation": "Si-môn Phi-e-rơ là sứ đồ nổi tiếng với tính cách nhiệt thành, bước đi trên biển và giảng bài giảng lịch sử tại Công vụ 2.",
        "scripture_reference": "Ma-thi-ơ 14:28-31; Công vụ 2:14-41",
        "difficulty": 1
    },
    {
        "question_type": "who_am_i",
        "question_text": "Tôi là một người chăn chiên nhỏ tuổi. Tôi đã dùng một trành ném đá và năm hòn sỏi bóng láng đánh bại gã khổng lồ Gô-li-át. Sau này tôi trở thành vị vua vĩ đại nhất của Y-sơ-ra-ên, được Chúa gọi là 'người vừa lòng Ta'. Tôi là ai?",
        "options": ["Sau-lơ", "Đa-vít", "Sa-lô-môn", "Ghi-đê-ôn"],
        "correct_option": 1,
        "explanation": "Đa-vít là vị vua lập nên triều đại huy hoàng và viết phần lớn các bài Thi Thiên ngợi khen Chúa.",
        "scripture_reference": "1 Sa-mu-ên 17:40-50; Công vụ 13:22",
        "difficulty": 1
    },
    {
        "question_type": "who_am_i",
        "question_text": "Tôi từng bắt bớ dữ dội các tín hữu theo Đạo Chúa. Nhưng một luồng ánh sáng chói lòa từ trời trên đường đến Đa-mách đã biến đổi hoàn toàn cuộc đời tôi. Tôi trở thành sứ đồ truyền giáo vĩ đại cho Dân Ngoại và viết nên 13 thư tín Tân Ước. Tôi là ai?",
        "options": ["Phi-líp", "Ba-na-ba", "Phao-lô (Sau-lơ)", "Tích"],
        "correct_option": 2,
        "explanation": "Sứ đồ Phao-lô là nhà thần học và giáo sĩ tiên phong vĩ đại nhất thời Tân Ước.",
        "scripture_reference": "Công vụ 9:1-19; 2 Ti-mô-thê 4:7-8",
        "difficulty": 1
    },
    {
        "question_type": "who_am_i",
        "question_text": "Tôi bị các anh mình ghen ghét bán sang xứ Ai Cập làm nô lệ. Sau nhiều năm bị cầm tù oan uổng, tôi đã giải thích giấc mộng của Pha-ra-ôn và được thăng làm tể tướng của cả đế quốc Ai Cập, giải cứu cả gia đình thoát khỏi nạn đói. Tôi là ai?",
        "options": ["Gia-cốp", "Giô-sép", "Bên-gia-min", "Môi-se"],
        "correct_option": 1,
        "explanation": "Giô-sép là minh chứng tuyệt vời cho sự quan phòng của Chúa: 'Các anh định hại tôi, nhưng Đức Chúa Trời lại định cho nó thành lành'.",
        "scripture_reference": "Sáng-thế Ký 41:39-44; 50:20",
        "difficulty": 1
    },
    {
        "question_type": "who_am_i",
        "question_text": "Tôi đã được Đức Chúa Trời kêu gọi lúc 80 tuổi bên bụi gai cháy không rụi tại núi Hô-rếp. Ngài dùng cây gậy của tôi làm mười tai vạ kinh khiếp trên Ai Cập và rẽ đôi Biển Đỏ để giải phóng tuyển dân. Tôi là ai?",
        "options": ["A-rôn", "Môi-se", "Giô-suê", "I-sơ-ma-ên"],
        "correct_option": 1,
        "explanation": "Môi-se là người lãnh đạo tiên tri đã ban truyền Luật pháp của Đức Chúa Trời tại núi Si-na-i.",
        "scripture_reference": "Xuất Ê-díp-tô Ký 3:1-10; 14:21-22",
        "difficulty": 1
    },
    # True / False
    {
        "question_type": "true_false",
        "question_text": "Môi-se đã được bước chân vào Đất Hứa Ca-na-an cùng toàn thể con cái Y-sơ-ra-ên.",
        "options": ["Đúng", "Sai"],
        "correct_option": 1,
        "explanation": "Sai. Môi-se chỉ được đứng trên đỉnh núi Nê-bô nhìn ngắm Đất Hứa từ xa, không được vào xứ vì đã đập tảng đá hai lần thay vì truyền lệnh.",
        "scripture_reference": "Phục-truyền Luật-lệ Ký 34:1-5",
        "difficulty": 1
    },
    {
        "question_type": "true_false",
        "question_text": "Theo Tân Ước, sự cứu rỗi là bởi ân điển nhờ đức tin, chứ không phải bởi việc làm của con người.",
        "options": ["Đúng", "Sai"],
        "correct_option": 0,
        "explanation": "Đúng. Ê-phê-sô 2:8-9 khẳng định: 'Ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu, điều đó không phải đến từ anh em, bèn là sự ban cho của Đức Chúa Trời'.",
        "scripture_reference": "Ê-phê-sô 2:8-9",
        "difficulty": 1
    },
    # Verse Challenge
    {
        "question_type": "verse_challenge",
        "question_text": "Hãy điền từ còn thiếu vào câu gốc nổi tiếng: 'Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được...'",
        "options": ["sự giàu sang đời này", "sự sống đời đời", "quyền năng lạ lùng", "sự khôn ngoan vô tận"],
        "correct_option": 1,
        "explanation": "Giăng 3:16 hứa ban 'sự sống đời đời' cho bất kỳ ai đặt đức tin nơi Chúa Cứu Thế Giê-xu.",
        "scripture_reference": "Giăng 3:16",
        "difficulty": 1
    },
    {
        "question_type": "verse_challenge",
        "question_text": "Trong Thi-thiên 23:1, Đa-vít đã tuyên xưng điều gì: 'Đức Giê-hô-va là Đấng chăn giữ tôi; tôi sẽ...'",
        "options": ["không sợ kẻ nghịch", "chẳng thiếu thốn gì", "luôn luôn chiến thắng", "được nhiều phước lành"],
        "correct_option": 1,
        "explanation": "Thi-thiên 23:1: 'Đức Giê-hô-va là Đấng chăn giữ tôi; tôi sẽ chẳng thiếu thốn gì.'",
        "scripture_reference": "Thi-thiên 23:1",
        "difficulty": 1
    }
]

FLASHCARD_SEEDS = [
    # Person Cards
    {
        "card_type": "person",
        "front_text": "Sứ đồ Phi-e-rơ là ai và có vai trò gì trong Hội Thánh ban đầu?",
        "back_text": "Tên gốc: Si-môn (Cephas)\nNghề nghiệp: Ngư phủ tại Biển Ga-li-lê\nAnh em: Anh-rê\nVai trò: Trụ cột của 12 môn đồ, người tuyên xưng 'Chúa là Đấng Christ, Con Đức Chúa Trời hằng sống'\nSự kiện then chốt: Đi bộ trên biển, chối Chúa 3 lần rồi ăn năn, được Chúa phục hồi bên hồ Ti-bê-ri-át, giảng bài giảng lịch sử trong Lễ Ngũ Tuần (Công vụ 2) mở ra kỷ nguyên Hội Thánh Tân Ước.",
        "difficulty_level": 1
    },
    {
        "card_type": "person",
        "front_text": "Áp-ra-ham là ai và vì sao được gọi là 'tổ phụ của đức tin'?",
        "back_text": "Tên gốc: Áp-ram\nQuê quán: U-rơ của xứ Canh-đê\nGiao ước: Đức Chúa Trời lập Giao Ước Áp-ra-ham hứa ban đất Ca-na-an và dòng dõi như sao trên trời\nĐức tin đỉnh cao: Vâng lời dâng con một là Y-sác trên núi Mô-ri-a, tin chắc Đức Chúa Trời có quyền khiến người chết sống lại (Hê-bơ-rơ 11:19).",
        "difficulty_level": 1
    },
    {
        "card_type": "person",
        "front_text": "Đa-vít là ai trong lịch sử tuyển dân Y-sơ-ra-ên?",
        "back_text": "Xuất thân: Con trai út của Y-sai tại Bết-lê-hem, làm nghề chăn chiên\nChiến tích: Đánh bại Gô-li-át bằng niềm tin tuyệt đối nơi Đức Chúa Trời\nChức vụ: Vua thứ hai của Y-sơ-ra-ên, hiệp nhất các chi phái, lập Giê-ru-sa-lem làm thủ đô\nGiao ước Đa-vít: 2 Sa-mu-ên 7 - Lời hứa về một ngai vàng còn lại đời đời (được làm trọn vẹn nơi Chúa Giê-xu).",
        "difficulty_level": 1
    },
    # Verse Cards
    {
        "card_type": "verse",
        "front_text": "Giăng 3:16 — Câu gốc cốt lõi của Tin Lành",
        "back_text": "\"Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.\"\n\nÝ nghĩa: Tình yêu vô điều kiện của Đức Chúa Trời, cái giá tối thượng là Con Độc Sanh, và điều kiện duy nhất là đức tin để nhận lấy sự sống đời đời.",
        "difficulty_level": 1
    },
    {
        "card_type": "verse",
        "front_text": "Rô-ma 8:28 — Lời hứa về sự hiệp lực mọi sự vì điều lành",
        "back_text": "\"Vả, chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời, tức là cho kẻ được gọi theo ý muốn Ngài đã định.\"\n\nÝ nghĩa: Mọi nghịch cảnh, thử thách trong đời sống tín hữu đều nằm trong quyền tể trị thánh khiết của Chúa để biến đổi con cái Ngài giống như Đấng Christ.",
        "difficulty_level": 2
    },
    {
        "card_type": "verse",
        "front_text": "Phi-líp 4:13 — Sức mạnh nội tại trong Đấng Christ",
        "back_text": "\"Tôi làm được mọi sự nhờ Đấng ban thêm sức cho tôi.\"\n\nÝ nghĩa: Trong bối cảnh Phao-lô chia sẻ về việc học cách no đủ cũng như thiếu thốn; sự thỏa lòng và năng quyền vượt qua mọi cảnh ngộ đến từ nguồn ân sủng của Đấng Christ.",
        "difficulty_level": 1
    },
    {
        "card_type": "verse",
        "front_text": "Châm-ngôn 3:5-6 — Tận tâm tin cậy Đức Chúa Trời",
        "back_text": "\"Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con; phàm trong các việc làm của con, khá nhận biết Ngài, thì Ngài sẽ chỉ dẫn các nẻo của con.\"\n\nÝ nghĩa: Từ bỏ sự tự kiêu trí tuệ loài người và đặt trọn vẹn sự dẫn dắt đời sống vào tay Đấng Tạo Hóa.",
        "difficulty_level": 1
    },
    # Event Cards
    {
        "card_type": "event",
        "front_text": "Biến cố Lễ Ngũ Tuần (Pentecost) xảy ra khi nào và có ý nghĩa gì?",
        "back_text": "Địa điểm: Phòng cao tại Giê-ru-sa-lem (Công vụ 2)\nHiện tượng: Gió thổi ào ạt, lưỡi như lửa đậu trên từng người, các môn đồ nói các thứ tiếng khác nhau ca ngợi Đức Chúa Trời\nÝ nghĩa: Đức Thánh Linh giáng lâm ngự vào lòng các tín đồ như lời Chúa Giê-xu đã hứa; ngày khai sinh Hội Thánh Cơ Đốc trên toàn thế giới.",
        "difficulty_level": 2
    },
    {
        "card_type": "event",
        "front_text": "Biến cố Vượt Biển Đỏ (Exodus 14)",
        "back_text": "Bối cảnh: Quân Ai Cập đuổi gấp phía sau, Biển Đỏ chắn phía trước\nPhép lạ: Môi-se giơ gậy, Đức Chúa Trời thổi ngọn gió đông suốt đêm rẽ đôi mặt biển, đất khô hiện ra cho dân sự băng qua; sau đó nước ập lại chôn vùi toàn bộ chiến xa quân thù\nÝ nghĩa: Biểu tượng vĩ đại của sự giải cứu siêu nhiên khỏi xiềng xích tội lỗi.",
        "difficulty_level": 1
    },
    # Word / Doctrine Cards
    {
        "card_type": "word",
        "front_text": "Agape (ἀγάπη) trong Tân Ước nghĩa là gì?",
        "back_text": "Từ gốc: Hy Lạp ἀγάπη (Agápē)\nĐặc tính: Tình yêu hy sinh, tự nguyện vô điều kiện, không phụ thuộc vào phẩm chất của đối tượng được yêu\nBản chất: Chính Đức Chúa Trời là tình yêu (1 Giăng 4:8); tình yêu này thể hiện tột bực khi Đấng Christ chịu chết vì kẻ có tội trên thập tự giá.",
        "difficulty_level": 2
    },
    {
        "card_type": "word",
        "front_text": "Sự Xưng Công Bình (Justification) là gì?",
        "back_text": "Khái niệm pháp lý trong thần học Phao-lô (Rô-ma 3:24-26, 5:1)\nĐịnh nghĩa: Hành động của Đức Chúa Trời tuyên bố một tội nhân là công bình trước mặt Ngài không phải vì công đức bản thân, mà vì sự công chính trọn vẹn của Chúa Giê-xu được gán cho người ấy thông qua đức tin.",
        "difficulty_level": 3
    }
]

def seed_learning_data():
    with engine.begin() as conn:
        print("[*] Checking existing quiz questions...")
        existing_q = conn.execute(text("SELECT count(*) FROM quiz_questions")).scalar()
        if existing_q == 0:
            print(f"[*] Seeding {len(QUIZ_SEEDS)} quiz questions...")
            for q in QUIZ_SEEDS:
                conn.execute(
                    text("""
                    INSERT INTO quiz_questions (
                        question_type, question_text, options, correct_option, explanation, scripture_reference, difficulty
                    ) VALUES (
                        :q_type, :q_text, :options, :correct_opt, :explanation, :ref, :diff
                    )
                    """),
                    {
                        "q_type": q["question_type"],
                        "q_text": q["question_text"],
                        "options": json.dumps(q["options"], ensure_ascii=False),
                        "correct_opt": q["correct_option"],
                        "explanation": q["explanation"],
                        "ref": q["scripture_reference"],
                        "diff": q["difficulty"]
                    }
                )
            print(f"[+] Successfully seeded {len(QUIZ_SEEDS)} quiz questions!")
        else:
            print(f"[!] Database already has {existing_q} quiz questions, skipping seed.")

        print("[*] Checking existing flashcards...")
        existing_f = conn.execute(text("SELECT count(*) FROM flashcards")).scalar()
        if existing_f == 0:
            print(f"[*] Seeding {len(FLASHCARD_SEEDS)} flashcards...")
            for f in FLASHCARD_SEEDS:
                conn.execute(
                    text("""
                    INSERT INTO flashcards (
                        card_type, front_text, back_text, difficulty_level, repetition_count, interval_days, next_review_at
                    ) VALUES (
                        :c_type, :front, :back, :diff, 0, 1, CURRENT_TIMESTAMP
                    )
                    """),
                    {
                        "c_type": f["card_type"],
                        "front": f["front_text"],
                        "back": f["back_text"],
                        "diff": f["difficulty_level"]
                    }
                )
            print(f"[+] Successfully seeded {len(FLASHCARD_SEEDS)} flashcards!")
        else:
            print(f"[!] Database already has {existing_f} flashcards, skipping seed.")

if __name__ == "__main__":
    seed_learning_data()
