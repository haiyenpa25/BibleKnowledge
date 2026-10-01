-- ==============================================================================
-- 07_theological_books.sql — Full Seed of 275 Theological References
-- Generated on 2026-10-01T14:29:04.082Z
-- ==============================================================================

BEGIN;

INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '001_40-questions-about-interpreting-the-bible-robert-l-plummer',
    '40 Questions about Interpreting the Bible – Robert L. Plummer',
    'Robert L. Plummer',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":1,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":714124,"filename":"001_40-questions-about-interpreting-the-bible-robert-l-plummer.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '002_50-most-important-bible-questions-michael-rydelnik',
    '50 Most Important Bible Questions – Michael Rydelnik',
    'Michael Rydelnik',
    'Độc lập / Tuyển tập chuyên khảo',
    6,
    '{"index":2,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":467908,"filename":"002_50-most-important-bible-questions-michael-rydelnik.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Notes"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"NOTES"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '003_a-message-to-the-seven-churches-morris-cerullo',
    'A Message to the Seven Churches – Morris Cerullo',
    'Morris Cerullo',
    'Độc lập / Tuyển tập chuyên khảo',
    15,
    '{"index":3,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":59906,"filename":"003_a-message-to-the-seven-churches-morris-cerullo.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Chapter 10"},{"index":3,"title":"Introduction"},{"index":4,"title":"Applying the Messages to the"},{"index":5,"title":"The Seven Churches of Asia"},{"index":6,"title":"Ephesus: The Danger of"},{"index":7,"title":"Smyrna: The Danger of Fearing"},{"index":8,"title":"Pergamos: The Danger of"},{"index":9,"title":"Thyatira: The Danger of Moral"},{"index":10,"title":"Sardis: The Danger of Spiritual"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '004_a-survey-of-the-new-testament-robert-h-gundry',
    'A Survey of the New Testament – Robert H. Gundry',
    'Robert H. Gundry',
    'Độc lập / Tuyển tập chuyên khảo',
    29,
    '{"index":4,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1146727,"filename":"004_a-survey-of-the-new-testament-robert-h-gundry.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTERTESTAMENTAL AND NEW TESTAMENT"},{"index":5,"title":"THE MUNDANE SETTINGS OF THE NEW"},{"index":6,"title":"THE RELIGIOUS AND PHILOSOPHICAL SETTINGS"},{"index":7,"title":"THE CANON AND TEXT OF THE NEW TESTAMENT"},{"index":8,"title":"THE STUDY OF JESUS’ LIFE"},{"index":9,"title":"AN INTRODUCTORY OVERVIEW OF JESUS’"},{"index":10,"title":"MARK: AN APOLOGY FOR THE CRUCIFIXION OF"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '005_a-survey-of-the-old-testament-andrew-e-hill-john-h-walton',
    'A Survey of the Old Testament – Andrew E. Hill, John H. Walton',
    'Andrew E. Hill, John H. Walton',
    'Độc lập / Tuyển tập chuyên khảo',
    9,
    '{"index":5,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1345962,"filename":"005_a-survey-of-the-old-testament-andrew-e-hill-john-h-walton.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"In Joshua 9 the Gibeonites use a ruse to make a"},{"index":5,"title":"Chapter 9 introduces both Saul and a literary device into the text. The format of the text regarding the united monarchy (Saul, David, and Solomon) is to relate the appointment of a king, describe his potential and successes, and finally recount his failures and the results of those failures (fig. 14.1)."},{"index":6,"title":"Introduction"},{"index":7,"title":"Chapter 6 could be seen as a conclusion to this introduction, for it suggests that the people were not going to pay any attention to Isaiah’s message. Isaiah’s unheeded preaching would stand as a confirmation of the guilt of Israel established by the indictments in 1–5 and would lead to their eventual destruction."},{"index":8,"title":"Chapter 3 provides the main event of the book, with chapter 4 bringing the lesson of the book into focus."},{"index":9,"title":"EPILOGUE"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '006_adventuring-through-the-bible-ray-c-stedman',
    'Adventuring through the Bible – Ray C. Stedman',
    'Ray C. Stedman',
    'Độc lập / Tuyển tập chuyên khảo',
    28,
    '{"index":6,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1689703,"filename":"006_adventuring-through-the-bible-ray-c-stedman.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Chapter two finds Adam walking in the garden in communion with God, functioning as a spirit living within a physical body and manifesting the personality characteristics of the soul. At this point, God gives Adam a research project, to investigate the animal world in search of a possible counterpart to himself. God knew that Adam would not find what he was looking for, but in the process, Adam discovered at least three marvelous truths."},{"index":3,"title":"against the tempter in the Judean wilderness ."},{"index":4,"title":"Chapter 14 presents the story of Egypt’s invasion and defeat of Rehoboam and the southern kingdom of Judah—the very nation out of which God delivered Israel under moses (14:25–26). Again, Egypt is a picture of the world and its ways—its wickedness,"},{"index":5,"title":"Enter the Villain Chapter 3 introduces us to the villain—a"},{"index":6,"title":"Ecclesiastes The word Ecclesiastes means “The"},{"index":7,"title":"Chapter 25 begins the second collection of proverbs of Solomon—the proverbs copied"},{"index":8,"title":"Chapter 31 contains the words of King Lemuel concerning what his mother taught him about how to be a king. The epilogue, verses 10 to 31, closes the book of Proverbs on a beautiful note with a description of a virtuous, godly wife. many feel this is King Lemuel’s description of his own mother— and what a woman she was! If you are a young woman looking for a godly example, I recommend this passage to you. If you are a young man looking for a model wife, I suggest you read it often as a reminder throughout your dating life."},{"index":9,"title":"Chapter 6 reiterates Solomon’s theme of the meaninglessness of riches and possessions. We spend all our efforts trying to feed ourselves, yet our hunger is never satisfied. The rich have everything they want and need, yet they still have cravings that can’t be satisfied. What can you get for the person who has everything?"},{"index":10,"title":"Chapter 62 proclaims a new name and a new peace and prosperity for Zion, the redeemed and holy people of the Lord. Chapters 63 through 66 announce God’s day of vengeance and redemption, His gift of salvation, judgment, and hope. Also in chapter 65, we see an image of the new heaven and new earth that is also envisioned by John in the book of Revelation. Then this prophecy of Isaiah will be fulfilled:"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '007_all-that-jesus-commanded-john-piper',
    'All That Jesus Commanded – John Piper',
    'John Piper',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":7,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":750260,"filename":"007_all-that-jesus-commanded-john-piper.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Appendix"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '008_all-the-miracles-of-the-bible-herbert-lockyer',
    'All The Miracles of the Bible – Herbert Lockyer',
    'Herbert Lockyer',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":8,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1298987,"filename":"008_all-the-miracles-of-the-bible-herbert-lockyer.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '009_an-introduction-to-the-new-testament-d-a-carson-douglas-j-moo',
    'An Introduction to the New Testament – D. A. Carson, Douglas J. Moo',
    'D. A. Carson, Douglas J. Moo',
    'Độc lập / Tuyển tập chuyên khảo',
    25,
    '{"index":9,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1642038,"filename":"009_an-introduction-to-the-new-testament-d-a-carson-douglas-j-moo.json","outline_sample":[{"index":1,"title":"CONTENTS"},{"index":2,"title":"SCRIPTURE INDEX"},{"index":3,"title":"CHAPTER ONE THINKING ABOUT THE STUDY OF THE NEW TESTAMENT"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"CONTENTS"},{"index":6,"title":"CONTENTS"},{"index":7,"title":"Conclusion"},{"index":8,"title":"CONTENTS"},{"index":9,"title":"CONTENTS"},{"index":10,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '010_an-introduction-to-the-new-testament-raymond-e-brown',
    'An Introduction to the New Testament – Raymond E. Brown',
    'Raymond E. Brown',
    'Độc lập / Tuyển tập chuyên khảo',
    45,
    '{"index":10,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":2566235,"filename":"010_an-introduction-to-the-new-testament-raymond-e-brown.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Chapter 5. The Religious and Philosophical World of New Testament Times"},{"index":3,"title":"Chapter 9. The Gospel According to Luke General Analysis of the Message Sources and Compositional Features Authorship"},{"index":4,"title":"Chapter 11. The Gospel According to John Stylistic Features General Analysis of the Message Is John a Genuine Gospel? Combined Sources or Development of"},{"index":5,"title":"Chapter 14. Third Letter of John"},{"index":6,"title":"Chapter 15. Classifications and Format of New Testament Letters (A) Classifications (B) Format"},{"index":7,"title":"Chapter 24. Letter to the Romans"},{"index":8,"title":"Issues and Problems for Reflection Bibliography"},{"index":9,"title":"THE NATURE AND ORIGIN OF THE NEW TESTAMENT"},{"index":10,"title":"HOW TO READ THE NEW TESTAMENT"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '011_an-introduction-to-the-old-testament-tremper-longman-iii-raymond-b-dillard',
    'An Introduction to the Old Testament – Tremper Longman III, Raymond B. Dillard',
    'Tremper Longman III, Raymond B. Dillard',
    'Độc lập / Tuyển tập chuyên khảo',
    18,
    '{"index":11,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1419803,"filename":"011_an-introduction-to-the-old-testament-tremper-longman-iii-raymond-b-dillard.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"Exodus"},{"index":5,"title":"Leviticus"},{"index":6,"title":"Judges"},{"index":7,"title":"Samuel"},{"index":8,"title":"Kings"},{"index":9,"title":"Esther"},{"index":10,"title":"Proverbs"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '012_ancient-hebrew-dictionary-jeff-a-benner',
    'Ancient Hebrew Dictionary – Jeff A. Benner',
    'Jeff A. Benner',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":12,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":251462,"filename":"012_ancient-hebrew-dictionary-jeff-a-benner.json","outline_sample":[{"index":1,"title":"Introduction"},{"index":2,"title":"Introduction"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '013_answers-to-your-bible-questions-ed-strauss',
    'Answers to Your Bible Questions – Ed Strauss',
    'Ed Strauss',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":13,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":151684,"filename":"013_answers-to-your-bible-questions-ed-strauss.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '014_asbury-bible-commentary-eugene-e-carpenter',
    'Asbury Bible Commentary – Eugene E. Carpenter',
    'Eugene E. Carpenter',
    'Độc lập / Tuyển tập chuyên khảo',
    37,
    '{"index":14,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1438756,"filename":"014_asbury-bible-commentary-eugene-e-carpenter.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Chapter 2 Chapter 3 Chapter 4 Chapter 5 Chapter 6 Chapter 7 Chapter 8 Chapter 9"},{"index":3,"title":"VII. The Sayings of Agur  Chapter 30"},{"index":4,"title":"Notes"},{"index":5,"title":"Introduction"},{"index":6,"title":"Introduction"},{"index":7,"title":"Conclusion"},{"index":8,"title":"Notes"},{"index":9,"title":"Introduction"},{"index":10,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '015_bk-commentary-1-law-john-f-walvoord-roy-b-zuck',
    'BK Commentary - 1. Law – John F. Walvoord, Roy B. Zuck',
    'John F. Walvoord, Roy B. Zuck',
    'Bible Knowledge Commentary',
    8,
    '{"index":15,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1237138,"filename":"015_bk-commentary-1-law-john-f-walvoord-roy-b-zuck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"Chapter 13 shows how faith solves strife. One might say that generosity is a sign of faith in God’s promises, for faith does not selfishly seek one’s own desires, but is generous, magnanimous, and selfdenying."},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"a. Introduction to covenant morality"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '016_bk-commentary-2-history-john-f-walvoord-roy-b-zuck',
    'BK Commentary - 2. History – John F. Walvoord, Roy B. Zuck',
    'John F. Walvoord, Roy B. Zuck',
    'Bible Knowledge Commentary',
    15,
    '{"index":16,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1502232,"filename":"016_bk-commentary-2-history-john-f-walvoord-roy-b-zuck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"Chapter 12, in concluding the story begun in chapter 1, gives a detailed catalog of the kings defeated by Israel. The preceding chapters obviously then list only the major battles. Only here is the complete list of conquered kings found. It is not claimed that Israel occupied all these cities. Certainly Joshua did not have sufficient manpower to leave a controlling garrison in each place. Joshua no doubt expected the respective tribes to occupy those towns."},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"Chapter 19. After an initial and successful attempt by Jonathan to soothe his father’s feelings toward David (vv. 1-7), Saul set in motion further steps to destroy David. First he tried to slay him once more with his own hand (vv. 9-10); then he hired conspirators to murder him in his bed, a plot foiled by Michal (vv. 11-17). Next Saul sent men to Naioth at Ramah where David had taken refuge with Samuel (vv. 18-24). (Ramah was Samuel’s hometown.) Their efforts were also unsuccessful for they, and later Saul, were overwhelmed by the Spirit of God who came on them and caused them to “act like prophets” (NIV, prophesied, vv. 20-21, 23-24). This means that they fell into a trance or an ecstatic state, a condition which immobilized them and made them incapable of accomplishing their evil intentions."},{"index":8,"title":"Chapter 24. Saul caught up with David at En Gedi and nearly found him. The LORD had other plans, however, and Saul’s life was in David’s hands as the king went to relieve himself (lit., “cover his feet,” a euphemism, v. 3) in the same cave where David was hiding. So close was David that he cut off a piece of the king’s robe as evidence of his opportunity to kill him. But even this act convicted David, who would not think of harming Saul bodily (vv. 5-7). David would not hurt the king, for he regarded Saul as the LORD’s anointed (vv. 6, 10; cf. 26:9, 11, 23). Yet, as David said, the king had no just cause for hunting him down (24:14-15). In repentance, Saul acknowledged David’s righteousness (vv. 17-19) and the fact that David would indeed be king (v. 20)."},{"index":9,"title":"Chapter 27. Though Saul at long last had decided that further pursuit of David was fruitless because the Lord had ordained him for the throne, David did not know this. So he reluctantly"},{"index":10,"title":"Chapter 29. On the eve of the battle the Philistines had rendezvoused at Aphek, precisely where they had defeated Israel and captured the ark about 90 years earlier (4:10-11). Israel took up positions by the spring in Jezreel, on the flank of Mount Gilboa, some 40 miles northeast of Aphek. Among the troops of Achish, lord of Gath, were David and his men. Though Achish had implicit confidence in David (29:3) and argued with the other leaders that he should be allowed to fight against Saul, he was outvoted (vv. 6-7, 9). Understandably the other commanders feared that in the heat of battle David would defect to Israel (v. 4). David, offering a feeble protest (v. 8) but obviously greatly relieved, was discharged and returned to Ziklag."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '017_bk-commentary-3-wisdom-john-f-walvoord-roy-b-zuck',
    'BK Commentary - 3. Wisdom – John F. Walvoord, Roy B. Zuck',
    'John F. Walvoord, Roy B. Zuck',
    'Bible Knowledge Commentary',
    7,
    '{"index":17,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1275509,"filename":"017_bk-commentary-3-wisdom-john-f-walvoord-roy-b-zuck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"chapter 7 he stated dramatically how a simple, naive youth can be subtly trapped by a seductive woman . Solomon exhorted his son to heed the father’s teaching (vv. 1-5), depicted the tactics of the adulteress (vv. 6-23), and concluded with a warning to beware of her trap (vv. 24-27)."},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '018_bk-commentary-4-major-prophets-john-f-walvoord-roy-b-zuck',
    'BK Commentary - 4. Major Prophets – John F. Walvoord, Roy B. Zuck',
    'John F. Walvoord, Roy B. Zuck',
    'Bible Knowledge Commentary',
    9,
    '{"index":18,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1413715,"filename":"018_bk-commentary-4-major-prophets-john-f-walvoord-roy-b-zuck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"chapter 37. It would have seemed impossible to hope that the Assyrians would not take the city. Only by God’s sovereign"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"chapter 32. By the time of the purchase in chapter 32 Jeremiah had already been arrested and confined to the courtyard of the guard (cf. 32:2). When he started toward Anathoth (chap. 37) he had not yet been arrested (cf. 37:4, 21; 38:13, 28). Therefore the events of chapter 37 took place before the events of chapter 32."},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"Chapter 24 climaxes these prophecies with two additional messages that show the inevitability of judgment."},{"index":9,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '019_bk-commentary-5-minor-prophets-john-f-walvoord-roy-b-zuck',
    'BK Commentary - 5. Minor Prophets – John F. Walvoord, Roy B. Zuck',
    'John F. Walvoord, Roy B. Zuck',
    'Bible Knowledge Commentary',
    14,
    '{"index":19,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":844695,"filename":"019_bk-commentary-5-minor-prophets-john-f-walvoord-roy-b-zuck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"INTRODUCTION"},{"index":9,"title":"INTRODUCTION"},{"index":10,"title":"Chapter 3 is the culmination and climax of Habakkuk’s book, contrary to the contentions of some scholars who would make this chapter a separate entity that he wrote much later. Others consider this chapter a document written by some other author, a second person also named Habakkuk or a second person who assumed Habakkuk’s name."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '020_bk-commentary-6-gospels-john-f-walvoord-roy-b-zuck',
    'BK Commentary - 6. Gospels – John F. Walvoord, Roy B. Zuck',
    'John F. Walvoord, Roy B. Zuck',
    'Bible Knowledge Commentary',
    5,
    '{"index":20,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1367725,"filename":"020_bk-commentary-6-gospels-john-f-walvoord-roy-b-zuck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"APPENDIX"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '021_bk-commentary-7-acts-epistles-john-f-walvoord-roy-b-zuck',
    'BK Commentary - 7. Acts & Epistles – John F. Walvoord, Roy B. Zuck',
    'John F. Walvoord, Roy B. Zuck',
    'Bible Knowledge Commentary',
    17,
    '{"index":21,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1731891,"filename":"021_bk-commentary-7-acts-epistles-john-f-walvoord-roy-b-zuck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"Chapter 8 is closely linked with chapters 6 and 7. The subject of persecution begun in 6 is continued in 8. Furthermore, the personality of Saul, introduced in 7, is also found in 8. There is a close connection between Philip (chap. 8) and Stephen (chaps. 6-7) because both belonged to the Seven (6:5). Even the order of their two names in 6:5 is followed in the sequence of the narrative in 6:8-8:40."},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"chapter 10 Paul’s subject matter and the intensity of his appeal were amplified. Paul believed that the danger of people defecting from him and his gospel were decidedly real. By appealing for obedience, he tested the confidence that Titus said the Corinthians had in him (7:16)."},{"index":8,"title":"INTRODUCTION"},{"index":9,"title":"INTRODUCTION"},{"index":10,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '022_bk-commentary-8-epistles-prophecy-john-f-walvoord-roy-b-zuck',
    'BK Commentary - 8. Epistles & Prophecy – John F. Walvoord, Roy B. Zuck',
    'John F. Walvoord, Roy B. Zuck',
    'Bible Knowledge Commentary',
    13,
    '{"index":22,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":859766,"filename":"022_bk-commentary-8-epistles-prophecy-john-f-walvoord-roy-b-zuck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"INTRODUCTION"},{"index":9,"title":"INTRODUCTION"},{"index":10,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '023_because-the-time-is-near-john-macarthur',
    'Because the Time Is Near – John MacArthur',
    'John MacArthur',
    'Độc lập / Tuyển tập chuyên khảo',
    12,
    '{"index":23,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":628181,"filename":"023_because-the-time-is-near-john-macarthur.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Chapter 10 describes the opening events of this interlude preparing for the nal trumpet blast by highlighting ve unusual occurrences: an unusual angel, an unusual act, an unusual answer, an unusual announcement, and an unusual assignment."},{"index":4,"title":"Chapter 12 records the beginning of Satan’s long war against God and His people. Chapter 13 records that war’s culmination. Satan will try to prevent Jesus Christ from setting up His earthly kingdom by setting up his own under Antichrist."},{"index":5,"title":"Chapter 15, the shortest in Revelation, forms a preview of these rapid-re judgments. As this chapter unfolds, three motives for the nal outpouring of God’s wrath become evident."},{"index":6,"title":"Chapter 2: The Preview of Christ’s Return 1. Cited in Henry Bettenson, ed., Documents of the Christian Church (London: Oxford Univ. Press, 1967), 4."},{"index":7,"title":"13; 18:6, 12–13; 19:9; 20:3; 21:27.; 23:12."},{"index":8,"title":"Chapter 5: The Letters to the Believers at Thyatira and Sardis 1. William Ramsay, The Letters to the Seven Churches of Asia (Albany, Oreg.: AGES Software; reprint of the 1904 edition),"},{"index":9,"title":"Chapter 10: The Tribulation Saints 1. Robert L. Thomas, Revelation 1–7: An Exegetical Commentary (Chicago: Moody, 1992), 476."},{"index":10,"title":"Chapter 16: Tribulation Announcements 1. Why the text does not use the denite article and read “the son of man” is not clear. Yet the phrase also appears without a"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '024_believer-s-bible-commentary-william-macdonald',
    'Believer''s Bible Commentary – William MacDonald',
    'William MacDonald',
    'Độc lập / Tuyển tập chuyên khảo',
    33,
    '{"index":24,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2601502,"filename":"024_believer-s-bible-commentary-william-macdonald.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Chapter 5 has been called “The Tolling of the Death Bells” because of the oft-repeated expression “and he died.” It records the bloodline of the Messiah from Adam to Noah’s son, Shem (compare Luke 3:36–38)."},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"Chapter 1 deals with the burnt sacrifice (Heb. ʾ ōlāh1). There were three grades, depending on what the offerer could afford: a bull from the herd (v. 3; cf. v. 5), a male without blemish; a sheep or a goat from the flock (v. 10), a male without"},{"index":8,"title":"IV. THE CLEAN AND THE UNCLEAN"},{"index":9,"title":"Chapter 13 has to do with the diagnosis of leprosy, and chapter 14 with its cleansing. Opinion is divided as to the nature of biblical leprosy. Bible lepers were usually mobile, were not deformed, were harmless when completely leprous, and were sometimes cured."},{"index":10,"title":"Chapter 13 is admittedly difficult, dealing as it does with technical descriptions of leprous and non-leprous diseases and with “leprosy” in houses and garments. Dr. R. K. Harrison, who has medical training as well as being a Hebrew scholar, points out that there is “no translation that is satisfactory for all the conditions covered by the Hebrew word, but that it should be broad enough to include the disease we call Hansen’s disease.”15"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '025_bible-dictionary-collection-matthew-g-easton-william-smith',
    'Bible Dictionary Collection – Matthew G. Easton, William Smith',
    'Matthew G. Easton, William Smith',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":25,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2859295,"filename":"025_bible-dictionary-collection-matthew-g-easton-william-smith.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"APPENDIX"},{"index":3,"title":"APPENDIX"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '026_bible-personalities-warren-w-wiersbe',
    'Bible Personalities – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Độc lập / Tuyển tập chuyên khảo',
    7,
    '{"index":26,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":314519,"filename":"026_bible-personalities-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Chapter 1 1. Clarence Edward Macartney, The Wisest Fool, and Other Men of the Bible"},{"index":4,"title":"Chapter 2 1. Alan Redpath, The Making of a Man of God (Westwood, NJ: Revell, 1962), 5. I"},{"index":5,"title":"Chapter 3 1. Phillips Brooks, The Influence of Jesus (London: H. R. Alklenson, 1879), 191. 2. Ralph G. Turnbull, ed., The Treasury of Alexander Whyte (Westwood, NJ:"},{"index":6,"title":"Chapter 4 1. For additional suggestions on biographical preaching, see chapter 19 of my"},{"index":7,"title":"Chapter 5 1. Warren W. Wiersbe, Your Next Miracle (Grand Rapids: Baker, 2001). 2. See Charles Haddon Spurgeon, “Confession of Sin—A Sermon with Seven"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '027_bridgeway-bible-commentary-don-fleming',
    'Bridgeway Bible Commentary – Don Fleming',
    'Don Fleming',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":27,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2619821,"filename":"027_bridgeway-bible-commentary-don-fleming.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"APPENDIX"},{"index":4,"title":"APPENDIX"},{"index":5,"title":"Chapter 7 gives a colourful picture of how an immoral woman can trap a weak, easily led young man. The section opens with a renewed emphasis on the importance of a young man’s getting wisdom and holding on to it firmly. Then he will know best how to resist the temptations he meets (7:1-5)."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '028_bridgeway-bible-dictionary-don-fleming',
    'Bridgeway Bible Dictionary – Don Fleming',
    'Don Fleming',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":28,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2105391,"filename":"028_bridgeway-bible-dictionary-don-fleming.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '029_christ-s-call-to-reform-the-church-john-macarthur',
    'Christ''s Call to Reform the Church – John MacArthur',
    'John MacArthur',
    'Độc lập / Tuyển tập chuyên khảo',
    11,
    '{"index":29,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":391178,"filename":"029_christ-s-call-to-reform-the-church-john-macarthur.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Notes"},{"index":4,"title":"Introduction"},{"index":5,"title":"Chapter 1: Calling the Church to Repent"},{"index":6,"title":"Chapter 3: The Loveless Church—Ephesus"},{"index":7,"title":"Chapter 4: The Persecuted Church—Smyrna"},{"index":8,"title":"Chapter 5: The Compromising Church—Pergamum"},{"index":9,"title":"Chapter 8: The Faithful Church—Philadelphia"},{"index":10,"title":"Chapter 9: The Lukewarm Church—Laodicea"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '030_dangerous-affirmation-m-d-perkins-stephen-h-black',
    'Dangerous Affirmation – M. D. Perkins, Stephen H. Black',
    'M. D. Perkins, Stephen H. Black',
    'Độc lập / Tuyển tập chuyên khảo',
    11,
    '{"index":30,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":379004,"filename":"030_dangerous-affirmation-m-d-perkins-stephen-h-black.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"What Is Affirming Theology?"},{"index":3,"title":"The Foundation of Biblical Sexuality"},{"index":4,"title":"LGBT Representation and Visibility"},{"index":5,"title":"A Brief History of Sexual Orientation"},{"index":6,"title":"Moving the Marriage Debate"},{"index":7,"title":"CHAPTER 1: RETHINKING THEOLOGY"},{"index":8,"title":"CHAPTER 2: RETHINKING THE BIBLE"},{"index":9,"title":"CHAPTER 3: RETHINKING THE CHURCH"},{"index":10,"title":"CHAPTER 4: RETHINKING IDENTITY"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '031_dictionary-for-theological-interpretation-of-the-bible-kevin-j-vanhoozer-al-et',
    'Dictionary for Theological Interpretation of the Bible – Kevin J. Vanhoozer al et.',
    'Kevin J. Vanhoozer al et.',
    'Độc lập / Tuyển tập chuyên khảo',
    16,
    '{"index":31,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2354995,"filename":"031_dictionary-for-theological-interpretation-of-the-bible-kevin-j-vanhoozer-al-et.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Conclusion"},{"index":5,"title":"Conclusion"},{"index":6,"title":"Conclusion"},{"index":7,"title":"Conclusion"},{"index":8,"title":"Conclusion"},{"index":9,"title":"Chapter 33 picks up motifs from chapter 18 to remind readers that the proper response to the warning is repentance. The arrival of a refugee from Jerusalem informing the exiles that the city has been destroyed (33:21) changes the rhetorical situation but not the message. Ezekiel reaffirms that physical descent from Abraham is insufficient (p 220)for reestablishment in the land. At the same time, the chapter gives a discouraging picture of Ezekiel’s post-586"},{"index":10,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '032_dictionary-of-bible-themes-martin-h-manser',
    'Dictionary of Bible Themes – Martin H. Manser',
    'Martin H. Manser',
    'Độc lập / Tuyển tập chuyên khảo',
    26,
    '{"index":32,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1175741,"filename":"032_dictionary-of-bible-themes-martin-h-manser.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Chapter 38 Chapter 39 Chapter 40 Chapter 41 Chapter 42 Chapter 43 Chapter 44 Chapter 45 Chapter 46 Chapter 47 Chapter 48 Chapter 49 Chapter 50"},{"index":4,"title":"Chapter 26 Chapter 27 Chapter 28 Chapter 29 Chapter 30 Chapter 31 Chapter 32 Chapter 33 Chapter 34 Chapter 35 Chapter 36 Chapter 37 Chapter 38 Chapter 39 Chapter 40"},{"index":5,"title":"Chapter 24 Chapter 25 Chapter 26 Chapter 27"},{"index":6,"title":"Chapter 35 Chapter 36"},{"index":7,"title":"Chapter 2 Chapter 3 Chapter 4 Chapter 5 Chapter 6 Chapter 7 Chapter 8 Chapter 9 Chapter 10 Chapter 11 Chapter 12 Chapter 13 Chapter 14 Chapter 15 Chapter 16 Chapter 17 Chapter 18 Chapter 19 Chapter 20 Chapter 21 Chapter 22 Chapter 23 Chapter 24"},{"index":8,"title":"Ruth Chapter 1 Chapter 2 Chapter 3 Chapter 4"},{"index":9,"title":"Chapter 28 Chapter 29 Chapter 30 Chapter 31"},{"index":10,"title":"Chapter 10 Chapter 11 Chapter 12 Chapter 13 Chapter 14 Chapter 15 Chapter 16 Chapter 17 Chapter 18 Chapter 19 Chapter 20 Chapter 21 Chapter 22"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '033_dictionary-of-daily-life-in-biblical-and-post-biblical-antiquity-edwin-m-yamauch',
    'Dictionary of Daily Life in Biblical and Post-Biblical Antiquity – Edwin M. Yamauchi, Marvin R. Wilson',
    'Edwin M. Yamauchi, Marvin R. Wilson',
    'Độc lập / Tuyển tập chuyên khảo',
    4,
    '{"index":33,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1778401,"filename":"033_dictionary-of-daily-life-in-biblical-and-post-biblical-antiquity-edwin-m-yamauch.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '034_dictionary-of-jesus-and-the-gospels-joel-b-green-al-et',
    'Dictionary of Jesus and the Gospels – Joel B. Green al et.',
    'Joel B. Green al et.',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":34,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2767281,"filename":"034_dictionary-of-jesus-and-the-gospels-joel-b-green-al-et.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '035_easton-s-bible-dictionary-m-g-easton',
    'Easton''s Bible Dictionary – M.G. Easton',
    'M.G. Easton',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":35,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2203788,"filename":"035_easton-s-bible-dictionary-m-g-easton.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '036_eerdmans-dictionary-of-the-bible-david-noel-freedman',
    'Eerdmans Dictionary of the Bible – David Noel Freedman',
    'David Noel Freedman',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":36,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2385115,"filename":"036_eerdmans-dictionary-of-the-bible-david-noel-freedman.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '037_encyclopedia-of-second-temple-judaism-loren-t-stuckenbruck-daniel-m-gurtner',
    'Encyclopedia of Second Temple Judaism – Loren T. Stuckenbruck, Daniel M. Gurtner',
    'Loren T. Stuckenbruck, Daniel M. Gurtner',
    'Độc lập / Tuyển tập chuyên khảo',
    10,
    '{"index":37,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2578627,"filename":"037_encyclopedia-of-second-temple-judaism-loren-t-stuckenbruck-daniel-m-gurtner.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"Conclusion"},{"index":5,"title":"NOTES"},{"index":6,"title":"Introduction"},{"index":7,"title":"NOTES"},{"index":8,"title":"Chapter 80 is an apocalyptic admonition describing the corruption of the world in the days of the sinners, and 81:1–82:4a is a first-person narrative about Enoch’s temporary return from  to earth in order to transmit his experience to his son Methuselah."},{"index":9,"title":"Chapter 18 shows signs of being a later addition. In any event,  Jews with a Greek  are presumed to be the core hearers or readers of this blend of Greek thought and Torah. At the same time, cross-influence with “pagan” Greeks can be envisaged, as well as with Christians, whose own first martyr narratives, written during the same period, seem to reflect 4 Maccabees (esp. the role of the mother in the Martyrdom of Lyons and Vienne may be noted; Rajak 2015: 121–22, 147)."},{"index":10,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '038_english-vietnamese-translation-and-transliteration-of-biblical-names',
    'English-Vietnamese Translation and Transliteration of Biblical Names',
    '',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":38,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":17817,"filename":"038_english-vietnamese-translation-and-transliteration-of-biblical-names.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '039_exalting-jesus-in-the-sermon-on-the-mount-danny-akin-holman-reference-staff',
    'Exalting Jesus in the Sermon on the Mount – Danny Akin, Holman Reference Staff',
    'Danny Akin, Holman Reference Staff',
    'Holman Reference Guides',
    17,
    '{"index":39,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":346101,"filename":"039_exalting-jesus-in-the-sermon-on-the-mount-danny-akin-holman-reference-staff.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Conclusion"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Conclusion"},{"index":5,"title":"Conclusion"},{"index":6,"title":"Conclusion"},{"index":7,"title":"Conclusion"},{"index":8,"title":"Conclusion"},{"index":9,"title":"Conclusion"},{"index":10,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '040_exploring-the-new-testament-world-albert-bell',
    'Exploring the New Testament World – Albert Bell',
    'Albert Bell',
    'Độc lập / Tuyển tập chuyên khảo',
    19,
    '{"index":40,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":825022,"filename":"040_exploring-the-new-testament-world-albert-bell.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Why This Book?"},{"index":4,"title":"Conclusion"},{"index":5,"title":"Conclusion"},{"index":6,"title":"The Judaic Background of the New Testament"},{"index":7,"title":"Introduction"},{"index":8,"title":"Conclusion"},{"index":9,"title":"Introduction"},{"index":10,"title":"Roman Law and the New Testament"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '041_exploring-the-new-testament-ivp-academic',
    'Exploring the New Testament – IVP Academic',
    'IVP Academic',
    'IVP Reference & Academic',
    50,
    '{"index":41,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1618315,"filename":"041_exploring-the-new-testament-ivp-academic.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"From the Persian period to the Jewish War"},{"index":4,"title":"Five key marks of second temple Judaism"},{"index":5,"title":"What does ‘gospel’ mean?"},{"index":6,"title":"Luke 1:1-4"},{"index":7,"title":"Tools for interpreting the Gospels"},{"index":8,"title":"Individuals and movements"},{"index":9,"title":"Birth and beginnings"},{"index":10,"title":"Why did Jesus die?"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '042_exploring-the-old-testament-ivp-academic',
    'Exploring the Old Testament – IVP Academic',
    'IVP Academic',
    'IVP Reference & Academic',
    44,
    '{"index":42,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1739779,"filename":"042_exploring-the-old-testament-ivp-academic.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"2:4—3:24 The Garden of Eden 4:1–26 Cain and his descendants"},{"index":6,"title":"Chapter 8 describes Moses clothing Aaron in his splendid vestments, which befitted his status as supreme mediator between God and Israel (8:6–13). But as yet he does not fulfil that role, for he brings a sin offering, a burnt offering and a peace offering and carries out all the actions (hand-laying, killing, etc) that the lay worshipper normally did. It is Moses who carries out the priestly duties (handling the blood, burning the animal on the altar), for as yet Aaron and his sons are not qualified to act as priests (8:14–21). But some of the blood from the peace offering is treated in an extraordinary way: some of it is"},{"index":7,"title":"7:1–5, 11–18, 21, 24 7: 20, 23–24"},{"index":8,"title":"EPILOGUE"},{"index":9,"title":"CONTENTS"},{"index":10,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '043_exploring-the-origins-of-the-bible-craig-a-evans-emanuel-tov',
    'Exploring the Origins of the Bible – Craig A. Evans, Emanuel Tov',
    'Craig A. Evans, Emanuel Tov',
    'Độc lập / Tuyển tập chuyên khảo',
    9,
    '{"index":43,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":565503,"filename":"043_exploring-the-origins-of-the-bible-craig-a-evans-emanuel-tov.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"Chapter 27 tells of Jeremiah prophesying to a group of kings meeting in Jerusalem with King Zedekiah. The prophet calls for the complete submission to Nebuchadnezzar in accordance with God’s plans. At the end of this episode, Jeremiah speaks out against the false prophets who prophesy optimistically to the Israelites, telling them that they need not surrender to Nebuchadnezzar. Among other things, he opposes the claim of these prophets that the exiled temple vessels will be returned. Jeremiah says that this will not happen, and that these prophets should implore God that the temple vessels remaining in Jerusalem not be exiled. Most of the expansions by the MT to the short LXX text are based on ideas or details in the context, or reflect stylistic and theological concerns. The MT shows a great interest in the fate of the temple vessels, adding details from the context in Jeremiah and 2 Kings."},{"index":5,"title":"Conclusion"},{"index":6,"title":"Introduction"},{"index":7,"title":"Introduction"},{"index":8,"title":"Conclusion"},{"index":9,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '044_face-to-face-with-god-t-desmond-alexander',
    'Face to Face with God – T. Desmond Alexander',
    'T. Desmond Alexander',
    'Độc lập / Tuyển tập chuyên khảo',
    28,
    '{"index":44,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":353783,"filename":"044_face-to-face-with-god-t-desmond-alexander.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Conclusion"},{"index":5,"title":"Notes"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"CONCLUSION"},{"index":8,"title":"WHERE HEAVEN AND EARTH MEET"},{"index":9,"title":"CONCLUSION"},{"index":10,"title":"THE PORTABLE SANCTUARY"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '045_from-eden-to-the-new-jerusalem-t-desmond-alexander',
    'From Eden to the New Jerusalem – T. Desmond Alexander',
    'T. Desmond Alexander',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":45,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":402649,"filename":"045_from-eden-to-the-new-jerusalem-t-desmond-alexander.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '046_from-paradise-to-the-promised-land-t-desmond-alexander',
    'From Paradise to the Promised Land – T. Desmond Alexander',
    'T. Desmond Alexander',
    'Độc lập / Tuyển tập chuyên khảo',
    40,
    '{"index":46,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":995648,"filename":"046_from-paradise-to-the-promised-land-t-desmond-alexander.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Conclusion"},{"index":5,"title":"Conclusion"},{"index":6,"title":"Conclusion"},{"index":7,"title":"Introduction"},{"index":8,"title":"Introduction"},{"index":9,"title":"Introduction"},{"index":10,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '047_god-and-the-transgender-debate-andrew-t-walker',
    'God and the Transgender Debate – Andrew T. Walker',
    'Andrew T. Walker',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":47,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":292564,"filename":"047_god-and-the-transgender-debate-andrew-t-walker.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '048_got-questions-s-michael-houdmann',
    'Got Questions – S. Michael Houdmann',
    'S. Michael Houdmann',
    'Độc lập / Tuyển tập chuyên khảo',
    26,
    '{"index":48,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1436842,"filename":"048_got-questions-s-michael-houdmann.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"CONTENTS"},{"index":4,"title":"CONTENTS"},{"index":5,"title":"CONTENTS"},{"index":6,"title":"CONTENTS"},{"index":7,"title":"CONTENTS"},{"index":8,"title":"CONTENTS"},{"index":9,"title":"CONTENTS"},{"index":10,"title":"Chapter 19 describes Christ’s return with the church, the bride of Christ. He defeats the beast and the false prophet and casts them into the lake of fire. In Chapter 20, Christ has Satan bound and cast in the Abyss. Then Christ sets up His kingdom on earth that will last 1000 years. At the end of the 1000 years, Satan is released and he leads a rebellion against God. He is quickly defeated and also cast into the lake of fire. Then the final judgment occurs, the judgment for all unbelievers, when they too are cast into the lake of fire."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '049_halley-s-bible-handbook-henry-h-halley',
    'Halley''s Bible Handbook – Henry H. Halley',
    'Henry H. Halley',
    'Độc lập / Tuyển tập chuyên khảo',
    26,
    '{"index":49,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1466981,"filename":"049_halley-s-bible-handbook-henry-h-halley.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Deut. 29–30 THE COVENANT AND FINAL WARNINGS"},{"index":3,"title":"Chapter 8. Bildad speaks. He insists that God is just and that Job’s troubles must be evidence of his wickedness—if he will only turn to God, all will be well again."},{"index":4,"title":"Chapter 11. Zophar speaks. He brutally and arrogantly tells Job that his punishment is less than he deserves (v. 6), and he insists that if Job will put away his"},{"index":5,"title":"Chapter 15. Eliphaz’s second speech. The argument becomes heated. His sarcasm becomes bitter (vv. 2–13). Job’s eyes flash (v. 12)."},{"index":6,"title":"Chapter 19. Job’s reply. His friends abhor him (v. 19); his wife is a stranger to him (v. 17); children despise him (v. 18); he begs for some compassion from his friends: “Have pity on me, my friends, have pity, for the hand of God has struck me. Why do you pursue me as God does? Will you never get enough of my flesh?” (v. 21)."},{"index":7,"title":"“But he knows the way that I take; when he has tested me, I will come forth as gold.”"},{"index":8,"title":"Chapter 22. Eliphaz’s third speech. He bears down harder and harder on Job’s wickedness, claiming especially that Job has mistreated the poor."},{"index":9,"title":"Job 29–31 JOB’S CALL FOR VINDICATION"},{"index":10,"title":"Chapter 1. The Object of the Book. To promote wisdom, discipline, understanding, righteousness, justice, equity, prudence, knowledge, discretion, learning, guidance (vv. 2–7). What splendid words! Wisdom (found 41 times in the book) is more than knowledge and insight; it includes skill in living a morally sound life. It can also include skill at a craft (in Exodus 31:3, for example, “skill” is the same word as “wisdom”)."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '050_handbook-of-bible-manners-and-customs-james-m-freeman',
    'Handbook of Bible Manners and Customs – James M. Freeman',
    'James M. Freeman',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":50,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1113319,"filename":"050_handbook-of-bible-manners-and-customs-james-m-freeman.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '051_harpercollins-bible-dictionary-mark-allan-powell',
    'HarperCollins Bible Dictionary – Mark Allan Powell',
    'Mark Allan Powell',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":51,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1933863,"filename":"051_harpercollins-bible-dictionary-mark-allan-powell.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '052_hearing-the-old-testament-in-the-new-testament-stanley-e-porter',
    'Hearing the Old Testament in the New Testament – Stanley E. Porter',
    'Stanley E. Porter',
    'Độc lập / Tuyển tập chuyên khảo',
    12,
    '{"index":52,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":720141,"filename":"052_hearing-the-old-testament-in-the-new-testament-stanley-e-porter.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Introduction"},{"index":5,"title":"Conclusion"},{"index":6,"title":"Introduction"},{"index":7,"title":"Conclusion"},{"index":8,"title":"Introduction"},{"index":9,"title":"Conclusion"},{"index":10,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '053_henrietta-mears-bible-survey-series-dr-henrietta-c-mears',
    'Henrietta Mears'' Bible Survey Series – Dr. Henrietta C. Mears',
    'Dr. Henrietta C. Mears',
    'Độc lập / Tuyển tập chuyên khảo',
    41,
    '{"index":53,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1262682,"filename":"053_henrietta-mears-bible-survey-series-dr-henrietta-c-mears.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"chapter 1. Mears, Scripture Panorama Series Teacher''s Book, “Panorama of Genesis” (Hollywood, CA: The Gospel"},{"index":4,"title":"chapter 1. Mears, Scripture Panorama Series Teacher''s Book, “Panorama of Genesis” (Hollywood, CA: The Gospel"},{"index":5,"title":"chapter 1. Mears, Scripture Panorama Series Teacher''s Book, “Panorama of Genesis” (Hollywood, CA: The Gospel"},{"index":6,"title":"chapter 1. Mears, Scripture Panorama Series Teacher''s Book, “Panorama of Genesis” (Hollywood, CA: The Gospel"},{"index":7,"title":", pp. 31-59."},{"index":8,"title":"chapter 2. Mears, Highlights of Scripture, “Call of Abraham to Coming Out of Egypt” and “Coming Out of Egypt to"},{"index":9,"title":"chapter 3. Mears, Highlights of Scripture, “Call of Abraham to Coming Out of Egypt” and “Coming Out of Egypt to"},{"index":10,"title":"chapter 4. Mears, Scripture Panorama Series, “Panorama of Numbers” (Hollywood, CA: The Gospel Light Press,"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '054_hidden-christmas-timothy-keller',
    'Hidden Christmas – Timothy Keller',
    'Timothy Keller',
    'Độc lập / Tuyển tập chuyên khảo',
    20,
    '{"index":54,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":188684,"filename":"054_hidden-christmas-timothy-keller.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"O"},{"index":5,"title":"M"},{"index":6,"title":"W"},{"index":7,"title":"T"},{"index":8,"title":"U"},{"index":9,"title":"A"},{"index":10,"title":"T"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '055_holman-concise-bible-dictionary-holman-bible-editorial-staff',
    'Holman Concise Bible Dictionary – Holman Bible Editorial Staff',
    'Holman Bible Editorial Staff',
    'Holman Reference Guides',
    12,
    '{"index":55,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2263086,"filename":"055_holman-concise-bible-dictionary-holman-bible-editorial-staff.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"and Syntyche , were exhorted to end their conflict, for personal disagreements may"},{"index":3,"title":"the first. e sealing of the 144,000  employs Jewish symbols to describe those"},{"index":4,"title":"e faithful 144,000 will be rescued and taken to heaven''s throne . An angel"},{"index":5,"title":"moving lament for the great city."},{"index":6,"title":"Chapter 21 is often thought to refer to the period following the 1,000-year reign, but"},{"index":7,"title":"the New Jerusalem, to live in the presence of God and the Lamb, and to experience"},{"index":8,"title":"Chapter 3 mentions 15 moral and ethical requirements for church leaders. Paul"},{"index":9,"title":"duty was to appoint elders . False teachers threatened the"},{"index":10,"title":"was to be an example to all . His teaching was to be characterized by\"uncorruptness,"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '056_holman-illustrated-bible-dictionary-chad-brand-eric-mitchell',
    'Holman Illustrated Bible Dictionary – Chad Brand, Eric Mitchell',
    'Chad Brand, Eric Mitchell',
    'Holman Reference Guides',
    1,
    '{"index":56,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1695942,"filename":"056_holman-illustrated-bible-dictionary-chad-brand-eric-mitchell.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '057_holman-illustrated-bible-handbook-b-h-editorial-staff',
    'Holman Illustrated Bible Handbook – B&H Editorial Staff',
    'B&H Editorial Staff',
    'Holman Reference Guides',
    11,
    '{"index":57,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":867166,"filename":"057_holman-illustrated-bible-handbook-b-h-editorial-staff.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Conclusion"},{"index":5,"title":"Introduction"},{"index":6,"title":"Conclusion"},{"index":7,"title":"Conclusion"},{"index":8,"title":"Introduction"},{"index":9,"title":"Introduction"},{"index":10,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '058_holman-illustrated-guide-to-biblical-geography-paul-h-wright',
    'Holman Illustrated Guide to Biblical Geography – Paul H. Wright',
    'Paul H. Wright',
    'Holman Reference Guides',
    1,
    '{"index":58,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1276845,"filename":"058_holman-illustrated-guide-to-biblical-geography-paul-h-wright.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '059_holman-quicksource-bible-atlas-holman-bible-editorial-staff',
    'Holman QuickSource Bible Atlas – Holman Bible Editorial Staff',
    'Holman Bible Editorial Staff',
    'Holman Reference Guides',
    2,
    '{"index":59,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":584454,"filename":"059_holman-quicksource-bible-atlas-holman-bible-editorial-staff.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '060_how-to-understand-and-apply-the-old-testament-jason-s-derouchie',
    'How to Understand and Apply the Old Testament – Jason S. DeRouchie',
    'Jason S. DeRouchie',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":60,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1459765,"filename":"060_how-to-understand-and-apply-the-old-testament-jason-s-derouchie.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"CONCLUSION"},{"index":5,"title":"APPENDIX"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '061_into-the-world-of-the-new-testament-daniel-l-smith',
    'Into the World of the New Testament – Daniel L. Smith',
    'Daniel L. Smith',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":61,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":492148,"filename":"061_into-the-world-of-the-new-testament-daniel-l-smith.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Epilogue"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '062_introduction-to-the-old-testament-c-hassell-bullock-david-m-howard-jr-herbert-wo',
    'Introduction to the Old Testament – C. Hassell Bullock, David M. Howard Jr., Herbert Wolf',
    'C. Hassell Bullock, David M. Howard Jr., Herbert Wolf',
    'Độc lập / Tuyển tập chuyên khảo',
    11,
    '{"index":62,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1704171,"filename":"062_introduction-to-the-old-testament-c-hassell-bullock-david-m-howard-jr-herbert-wo.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Conclusion"},{"index":4,"title":"chapter 2 begins at the outset of the barley harvest and ends at its and the"},{"index":5,"title":"chapter 5. On the first occasion, various internal problems threatened the unity of the people. These problems revolved around various inequities among those who had become impoverished (5:1–13). An outcry arose among the people against other Jews (5:1). (This is reminiscent of the outcry that arose in Acts 6:1–6 concerning the inequities of treatment between the widows of the Grecian Jews and Hebraic Jews.) Three groups were represented, each with slightly different complaints, but all suffering from inequities that caused people to fall into a debt that they could not manage."},{"index":6,"title":"chapter 10.A few months after the first set of reforms, Nehemiah participated with Ezra in reading the law and in a “covenant commitment” ceremony (chaps. 8–10). In this ceremony, the people committed themselves to various stipulations in the law. Some are found in the Pentateuch, whereas others are not, but the overall mood was one of a strong willingness to obey both the letter and spirit of the law.75"},{"index":7,"title":"Chapter 13. A final set of reforms is conveniently collected here, and a common thread in all of these is cleansing or purification."},{"index":8,"title":"CONTENTS"},{"index":9,"title":"INTRODUCTION"},{"index":10,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '063_jensen-s-survey-of-the-old-and-new-testament-irving-l-jensen',
    'Jensen''s Survey of the Old and New Testament – Irving L. Jensen',
    'Irving L. Jensen',
    'Độc lập / Tuyển tập chuyên khảo',
    9,
    '{"index":63,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1073028,"filename":"063_jensen-s-survey-of-the-old-and-new-testament-irving-l-jensen.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Appendix"},{"index":4,"title":"Chapter 34, which records Moses’ death, was written by another person. Of this, Gleason Archer writes, “The closing chapter furnishes only that type of obituary which is often appended to the final work of great men of letters.”² Joshua, Moses’ friend and successor, may have written the obituary."},{"index":5,"title":"Chapter 12 of 1 Kings is a key chapter in the Old Testament, because it records the event which steered the course of God’s people through the remainder of the Old Testament days. Study the chapter carefully."},{"index":6,"title":"Reflect on these truths, especially as they apply to Christian living."},{"index":7,"title":"Appendix"},{"index":8,"title":"Contents"},{"index":9,"title":"MAP N"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '064_jesus-in-the-present-tense-warren-w-wiersbe',
    'Jesus in the Present Tense – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Độc lập / Tuyển tập chuyên khảo',
    8,
    '{"index":64,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":269220,"filename":"064_jesus-in-the-present-tense-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Chapter 1"},{"index":4,"title":"Chapter 4"},{"index":5,"title":"Chapter 5"},{"index":6,"title":"Chapter 8"},{"index":7,"title":"Chapter 11"},{"index":8,"title":"Chapter 12"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '065_jesus-the-king-timothy-keller',
    'Jesus the King – Timothy Keller',
    'Timothy Keller',
    'Độc lập / Tuyển tập chuyên khảo',
    4,
    '{"index":65,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":409757,"filename":"065_jesus-the-king-timothy-keller.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Notes"},{"index":4,"title":"NOTES"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '066_jon-courson-s-application-commentary-jon-courson',
    'Jon Courson''s Application Commentary – Jon Courson',
    'Jon Courson',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":66,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1527972,"filename":"066_jon-courson-s-application-commentary-jon-courson.json","outline_sample":[{"index":1,"title":"CONTENTS"},{"index":2,"title":"Genesis 36:1"},{"index":3,"title":"Leviticus 1:3"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '067_key-themes-of-the-old-testament-david-e-graves',
    'Key Themes of the Old Testament – David E. Graves',
    'David E. Graves',
    'Độc lập / Tuyển tập chuyên khảo',
    34,
    '{"index":67,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":958705,"filename":"067_key-themes-of-the-old-testament-david-e-graves.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"Languages of the Bible"},{"index":4,"title":"Presuppositions"},{"index":5,"title":"Unique Book"},{"index":6,"title":"Oral Tradition"},{"index":7,"title":"Trinitarian Creator"},{"index":8,"title":"Fall of Adam and Eve"},{"index":9,"title":"Is This Verse Messianic?"},{"index":10,"title":"The Structure of Genesis"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '068_key-words-of-the-christian-life-warren-w-wiersbe',
    'Key Words of the Christian Life – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":68,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":168331,"filename":"068_key-words-of-the-christian-life-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '069_know-your-bible-from-a-to-z-jim-george',
    'Know Your Bible from A to Z – Jim George',
    'Jim George',
    'Độc lập / Tuyển tập chuyên khảo',
    7,
    '{"index":69,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":281047,"filename":"069_know-your-bible-from-a-to-z-jim-george.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"Notes"},{"index":5,"title":"Introduction"},{"index":6,"title":"Introduction"},{"index":7,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '070_mounce-s-complete-expository-dictionary-of-old-and-new-testament-words-william-d',
    'Mounce''s Complete Expository Dictionary of Old and New Testament Words – William D. Mounce',
    'William D. Mounce',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":70,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2113134,"filename":"070_mounce-s-complete-expository-dictionary-of-old-and-new-testament-words-william-d.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '071_nivac-bundle-1-pentateuch',
    'NIVAC Bundle 1 – Pentateuch',
    'Pentateuch',
    'NIV Application Commentary',
    13,
    '{"index":71,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2466011,"filename":"071_nivac-bundle-1-pentateuch.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Contents"},{"index":4,"title":"Introduction"},{"index":5,"title":"Notes"},{"index":6,"title":"Introduction"},{"index":7,"title":"CHAPTER 10 IS referred to as the “table of nations.” It provides the detail of the statement in 9:19, reiterated in 10:32, that the nations of the world descended from the three sons of Noah. In chapter 11, the narrator moves backward in time to tell the story of how these nations initially became separate from the unified people who developed subsequent to the time of Noah."},{"index":8,"title":"Chapter 14 is linked to chapter 13; God is going to give Abram the land, but how? It is important to follow the itinerary of the kings of the east to see that they establish their dominion over the whole land both east and west of Jordan. The land currently belongs to them. Theoretically, then, if Abram conquers them, dominion reverts to him. When Abram pursues the kings, he is not on a campaign of conquest; he is simply trying to rescue Lot and his family. Nonetheless, the upshot of his victory is that he is in a position to seize power to some extent. Is this the way God is going to give him the land?"},{"index":9,"title":"Notes"},{"index":10,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '072_nivac-bundle-2-historical-books',
    'NIVAC Bundle 2 –  Historical Books',
    'Historical Books',
    'NIV Application Commentary',
    13,
    '{"index":72,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2524855,"filename":"072_nivac-bundle-2-historical-books.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Contents"},{"index":4,"title":"Introduction"},{"index":5,"title":"Notes"},{"index":6,"title":"Introduction"},{"index":7,"title":"Chapter 6 requires special introductory comment.1 As with the Jordan crossing (Josh. 3–4), a command-execution schema structures the passage literarily.2 Orders flow down the chain of command from Yahweh to Joshua (6:2–5) and from him to the priests (v. 6) and the people (vv. 7, 16–19), who execute them (vv. 8–15, 20– 21).3 Thematically, the schema underscores the intimate connection between divine directives and promises, human obedience, and successful outcomes.4"},{"index":8,"title":"Chapter 23 also continues the theme of Joshua’s growth in stature as the worthy successor to Moses (cf. 3:7–8; 4:14; 6:27; 11:15, 23). At the end of his life, Moses had convened Israel to prepare them for their future (Deut. 5:1; 29:1; 31:7), and Joshua follows his example."},{"index":9,"title":"Notes"},{"index":10,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '073_nivac-bundle-3-wisdom-books',
    'NIVAC Bundle 3 – Wisdom Books',
    'Wisdom Books',
    'NIV Application Commentary',
    14,
    '{"index":73,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2451877,"filename":"073_nivac-bundle-3-wisdom-books.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Contents"},{"index":4,"title":"Introduction"},{"index":5,"title":"Notes"},{"index":6,"title":"Chapter 10 shows us that Job continues to think the world ought to operate according to the RP (cf. 10:3). God as judge does not need to gather information like a human judge. Job questions God’s omniscience as part of his defense. The psalmist presents this same sort of argument in Psalm 139:1–6, but an omniscient God cannot be lacking in the information needed to judge a case rightly."},{"index":7,"title":"Chapter 17 also affirms Job’s tenaciously held and accurate view of righteousness. In light of all of the abuse that he has suffered at the hands of friends and strangers, his declaration is 17:9 makes his position clear: “Nevertheless, the righteous will hold to their ways, and those with clean hands will grow stronger.” Not one whisper comes from Job about the righteous getting all their prosperity back. Truly righteous people are concerned about their integrity, not the rewards they receive."},{"index":8,"title":"Introduction"},{"index":9,"title":"Chapter 31 seeks to regain coherence not by revising Job’s expectations"},{"index":10,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '074_nivac-bundle-4-major-prophets',
    'NIVAC Bundle 4 – Major Prophets',
    'Major Prophets',
    'NIV Application Commentary',
    17,
    '{"index":74,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2206261,"filename":"074_nivac-bundle-4-major-prophets.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Contents"},{"index":4,"title":"Notes"},{"index":5,"title":"chapter 2, where it is said that to worship such things is like worshiping bats and moles. It reduces a person to the rocks and holes of the earth. This would have been especially poignant since the gods were typically worshiped on the mountaintops and other high places. But as was said on the previous theme, the Lord is the only One high and lifted up."},{"index":6,"title":"Chapter 12 is a reflection on what all this means about the trustworthiness of God. Surely the God who will not give his people up to final destruction but will deliver them and set them up in a kingdom of the true Davidic monarch can be trusted. More than that, surely his glorious exploits should be told to all the earth."},{"index":7,"title":"Chapter 28 has four subunits: verses 1–6, 7–13, 14–22, and 23–29. There is a question whether verses 7–13 relate more closely to verses 1–6, as I tend to read it, or to verses 14–22, as Motyer does.1 It is a question of whether the pronouncement against Ephraim is continuing in these verses or whether it has already shifted to Judah and Jerusalem."},{"index":8,"title":"Chapter 31 has two sections. Verses 1–3 include the fifth of the woes in this subdivision of the book. As such, it brings the sequence to a kind of a climax. The woe in 28:1 was against the drunken leaders in Ephraim; in 29:1 it was against those in Jerusalem who depended on cultic righteousness; in 29:15 it was against those who tried to hide their counsel from the Lord; in 30:1 it was against “obstinate children” who would not bring to the Lord their plans to make an alliance with Egypt. The present “woe” is specifically against “those who go down to Egypt for help.” Thus, the climax (or the nadir) has been reached. Drunken leaders who focus on the wrong things have given ungodly advice that rebellious people have adopted without consulting God."},{"index":9,"title":"Chapter 34 is composed of two parts. The first (vv. 1–4) is a general announcement of judgment on the nations of the earth. Then this announcement is particularized by applying it to the nation of Edom (vv. 5–17). In this case, the graphic illustration is three times as long as the general statement it illustrates."},{"index":10,"title":"CHAPTER 40 INTRODUCES the third major division of Isaiah: chapters 40–55. The question of the Lord’s trustworthiness has been thoroughly answered. But the question remains: What will motivate the people of God to actually trust him and become the servants that they are called to be? Furthermore, how will it be possible for sinful Israel to become God’s servants at all? What is to be done about the sin that has alienated them from God?"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '075_nivac-bundle-5-minor-prophets',
    'NIVAC Bundle 5 – Minor Prophets',
    'Minor Prophets',
    'NIV Application Commentary',
    12,
    '{"index":75,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2365188,"filename":"075_nivac-bundle-5-minor-prophets.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Contents"},{"index":4,"title":"Notes"},{"index":5,"title":"Chapter 2 centers on reflections concerning the problems described in chapter 1, though they focus more on the relationship between God and Israel rather than on Hosea and Gomer. The references to the prosperous production of grain, wine, oil, and wool indicate that this message comes during the last few years of Jeroboam II.1 Unfortunately, many in the nation interpreted these good times not as the result of God’s grace but as the blessing of Baal, the Canaanite god of fertility."},{"index":6,"title":"Notes"},{"index":7,"title":"Contents"},{"index":8,"title":"Notes"},{"index":9,"title":"Notes"},{"index":10,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '076_nivac-bundle-6-gospels-acts',
    'NIVAC Bundle 6 – Gospels, Acts',
    'Gospels, Acts',
    'NIV Application Commentary',
    10,
    '{"index":76,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2555781,"filename":"076_nivac-bundle-6-gospels-acts.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Contents"},{"index":4,"title":"Introduction"},{"index":5,"title":"Notes"},{"index":6,"title":"Introduction"},{"index":7,"title":"CHAPTER 16 IS a pivotal chapter in Matthew. After the increasing opposition of the Jewish religious leaders to his messianic ministry (12:9–14, 22–37) and the increasing threat of the local political machine (14:1–13), Jesus has been turning to his disciples to help them to understand more clearly his unique identity and mission. He is a prophet, even though he is without honor among his own people (13:53–58). He is the compassionate healer and supplier of Israel’s needs, even"},{"index":8,"title":"CHAPTER 21 CONCLUDED with Jesus in direct confrontation with the religious leaders in the temple in Jerusalem (see comments on 21:23). At the center of the confrontation was the religious leaders’ challenge to Jesus’ authority. He had cleared the temple the prior day (Monday of Holy Week), which was an enacted, symbolic pronouncement of judgment on the temple establishment. It was also a precursor of the end of the temple as an institution, because his impending crucifixion would provide direct access to God’s forgiveness and salvation."},{"index":9,"title":"CHAPTER 22 BEGINS with the third of three parables that confront the religious leadership because they did not repent and seek to enter the kingdom of God (21:28–32). As a result, God will take away the kingdom from Israel and give it to another nation that will produce fruit (21:33–46). In the parable of the wedding banquet, Jesus declares that God judges all responses in Israel to the invitation to the kingdom of heaven, including the nation generally, the religious leaders especially, and individuals personally (22:1–14). Matthew’s narrative takes a significant turn at the conclusion of the parables. One by one he enters into theological debate with the various leadership groups in Jerusalem, each of which has tried to undercut Jesus’ messianic claims. Matthew specifies in a unique way that although they try to debate Jesus, they are all deficient in understanding the Old Testament’s witness to his messianic claims."},{"index":10,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '077_nivac-bundle-7-pauline-epistles',
    'NIVAC Bundle 7 – Pauline Epistles',
    'Pauline Epistles',
    'NIV Application Commentary',
    17,
    '{"index":77,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2528066,"filename":"077_nivac-bundle-7-pauline-epistles.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Contents"},{"index":4,"title":"Introduction"},{"index":5,"title":"Notes"},{"index":6,"title":"Introduction"},{"index":7,"title":"Notes"},{"index":8,"title":"Contents"},{"index":9,"title":"Introduction"},{"index":10,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '078_nivac-bundle-8-general-epistles-revelation',
    'NIVAC Bundle 8 – General Epistles, Revelation',
    'General Epistles, Revelation',
    'NIV Application Commentary',
    16,
    '{"index":78,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2546175,"filename":"078_nivac-bundle-8-general-epistles-revelation.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Contents"},{"index":4,"title":"Introduction"},{"index":5,"title":"Notes"},{"index":6,"title":"Introduction"},{"index":7,"title":"Notes"},{"index":8,"title":"Contents"},{"index":9,"title":"Introduction"},{"index":10,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '079_names-of-god-jesus-christ-holy-spirit-nathan-stone-et-al',
    'Names of God, Jesus Christ, Holy Spirit – Nathan Stone et al.',
    'Nathan Stone et al.',
    'Độc lập / Tuyển tập chuyên khảo',
    7,
    '{"index":79,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":773751,"filename":"079_names-of-god-jesus-christ-holy-spirit-nathan-stone-et-al.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Notes"},{"index":4,"title":"Notes"},{"index":5,"title":"Notes"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '080_nelson-s-new-illustrated-bible-commentary-earl-d-radmacher',
    'Nelson''s New Illustrated Bible Commentary – Earl D. Radmacher',
    'Earl D. Radmacher',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":80,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1463047,"filename":"080_nelson-s-new-illustrated-bible-commentary-earl-d-radmacher.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"List of In-text Features"},{"index":3,"title":"Chapter 2, on the other hand, presents a more personal picture of creation. It focuses on the creation of man and woman, the only beings in creation who reflect the very image of God. In this section, God’s personal name (Yahweh, or LORD) is used rather than His title, “God.” This is because God personally shaped Adam from the dust of the earth, breathing life into him, and forming Eve from Adam’s flesh and bone. Moreover, the section depicts God placing Adam and Eve in a beautiful garden and interacting with them."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '081_nelson-s-new-illustrated-bible-dictionary-ronald-f-youngblood',
    'Nelson''s New Illustrated Bible Dictionary – Ronald F. Youngblood',
    'Ronald F. Youngblood',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":81,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":415927,"filename":"081_nelson-s-new-illustrated-bible-dictionary-ronald-f-youngblood.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Chapter 9 of the Book of Revelation presents a nightmarish prospect: locusts with special powers will be unleashed upon mankind for five months."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '082_nelson-s-new-illustrated-bible-manners-and-customs-howard-f-vos',
    'Nelson''s New Illustrated Bible Manners and Customs – Howard F. Vos',
    'Howard F. Vos',
    'Độc lập / Tuyển tập chuyên khảo',
    4,
    '{"index":82,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1388318,"filename":"082_nelson-s-new-illustrated-bible-manners-and-customs-howard-f-vos.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"General Bibliography"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Dress"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '083_new-bible-commentary-21st-century-edition',
    'New Bible Commentary - 21st Century Edition',
    '',
    'Độc lập / Tuyển tập chuyên khảo',
    18,
    '{"index":83,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2394426,"filename":"083_new-bible-commentary-21st-century-edition.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"Introduction"},{"index":6,"title":"Introduction"},{"index":7,"title":"Introduction"},{"index":8,"title":"Introduction"},{"index":9,"title":"Introduction"},{"index":10,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '084_new-dictionary-of-biblical-theology-t-desmond-alexander-brian-s-rosner',
    'New Dictionary of Biblical Theology – T. Desmond Alexander, Brian S. Rosner',
    'T. Desmond Alexander, Brian S. Rosner',
    'Độc lập / Tuyển tập chuyên khảo',
    71,
    '{"index":84,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2058845,"filename":"084_new-dictionary-of-biblical-theology-t-desmond-alexander-brian-s-rosner.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Introduction"},{"index":5,"title":"Introduction"},{"index":6,"title":"Conclusion"},{"index":7,"title":"Introduction"},{"index":8,"title":"Introduction"},{"index":9,"title":"Conclusion"},{"index":10,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '085_new-international-dictionary-of-new-testament-theology-verlyn-d-verbrugge',
    'New International Dictionary of New Testament Theology – Verlyn D. Verbrugge',
    'Verlyn D. Verbrugge',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":85,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2596912,"filename":"085_new-international-dictionary-of-new-testament-theology-verlyn-d-verbrugge.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '086_new-international-encyclopedia-of-bible-difficulties-gleason-l-archer-jr',
    'New International Encyclopedia of Bible Difficulties – Gleason L. Archer Jr',
    'Gleason L. Archer Jr',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":86,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1405923,"filename":"086_new-international-encyclopedia-of-bible-difficulties-gleason-l-archer-jr.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '087_new-international-encyclopedia-of-bible-words-lawrence-o-richards',
    'New International Encyclopedia of Bible Words – Lawrence O. Richards',
    'Lawrence O. Richards',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":87,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2469955,"filename":"087_new-international-encyclopedia-of-bible-words-lawrence-o-richards.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Chapter 9 affirms that the elements of the earthly tabernacle and its worship regulations served as illustrations for the present time. They applied only until Christ established the new order, for \"the gifts and sacrifices being offered were not able to clear the conscience of the worshiper\" (9:9). They were only \"external regulations\" that could not touch the inner person (v. 10)."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '088_new-international-encyclopedia-of-bible-paul-d-gardner',
    'New International Encyclopedia of Bible – Paul D. Gardner',
    'Paul D. Gardner',
    'Độc lập / Tuyển tập chuyên khảo',
    8,
    '{"index":88,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2338593,"filename":"088_new-international-encyclopedia-of-bible-paul-d-gardner.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Introduction"},{"index":5,"title":"Conclusion"},{"index":6,"title":"Conclusion"},{"index":7,"title":"Conclusion"},{"index":8,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '089_new-testament-greek-to-hebrew-dictionary-jeff-a-benner',
    'New Testament Greek to Hebrew Dictionary – Jeff A. Benner',
    'Jeff A. Benner',
    'Độc lập / Tuyển tập chuyên khảo',
    6,
    '{"index":89,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":153941,"filename":"089_new-testament-greek-to-hebrew-dictionary-jeff-a-benner.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Chapter 2 1&My(G3450) brethren,G80 have(G2192) not(G3361) the(G3588) faithG4102 of our(G2257) LordG2962 JesusG2424 Christ,G5547 the Lord of glory,G1391 with(G1722) respect of persons.(G4382)  2&For(G1063) if(G1437) there comeG1525 unto(G1519) your(G5216) assemblyG4864 a manG435 with a gold ring,(G5554) in(G1722) goodly(G2986) apparel,(G2066) and(G1161) there come inG1525"},{"index":4,"title":"Chapter 3 1&My(G3450) brethren,G80 be(G1096) not(G3361) many(G4183) masters,G1320 knowing(G1492) that(G3754) we shall receiveG2983"},{"index":5,"title":"Chapter 4 1&From whence(G4159) come wars(G4171) and(G2532) fightings(G3163) among(G1722) you?(G5213) come they not(G3756) hence,(G1782) even of(G1537) your(G5216) lusts(G2237) that war(G4754) in(G1722) your(G5216) members?G3196  2&Ye lust,(G1937) and(G2532) have(G2192) not:(G3756) ye kill,(G5407) and(G2532) desire to have,(G2206) and(G2532) cannotG1410 (G3756) obtain:(G2013) ye fight(G3164) and(G2532) war,(G4170) yet(G1161) ye have(G2192) not,(G3756) because ye(G5209) askG154 not.(G3361)  3&Ye ask,G154 and(G2532) receiveG2983 not,(G3756) because(G1360) ye askG154 amiss,(G2560) that(G2443) ye may consume(G1159) it upon(G1722) your(G5216) lusts.(G2237)  4&Ye adulterers(G3432) and(G2532) adulteresses,(G3428) know(G1492) ye not(G3756) that(G3754) the(G3588) friendship(G5373) of the(G3588) worldG2889 is(G2076) enmity(G2189) with God?G2316"},{"index":6,"title":"Chapter 5 1&Go to(G33) now,(G3568) ye rich men,G4145 weepG2799 and howl(G3649) for(G1909) your(G5216) miseries(G5004) that shall come upon(G1904) you.  2&Your(G5216) richesG4149 are corrupted,(G4595) and(G2532) your(G5216) garmentsG2440"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '090_now-you-know-the-bible-doug-lennox',
    'Now You Know The Bible – Doug Lennox',
    'Doug Lennox',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":90,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":289736,"filename":"090_now-you-know-the-bible-doug-lennox.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '091_old-testament-essentials-tremper-longman-iii',
    'Old Testament Essentials – Tremper Longman III',
    'Tremper Longman III',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":91,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":412965,"filename":"091_old-testament-essentials-tremper-longman-iii.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '092_old-testament-survey-william-s-lasor-david-a-hubbard-frederic-w-bush',
    'Old Testament Survey – William S. LaSor, David A. Hubbard, Frederic W. Bush',
    'William S. LaSor, David A. Hubbard, Frederic W. Bush',
    'Độc lập / Tuyển tập chuyên khảo',
    161,
    '{"index":92,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":1995092,"filename":"092_old-testament-survey-william-s-lasor-david-a-hubbard-frederic-w-bush.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"The Pentateuch"},{"index":4,"title":"Genesis: Primeval Prologue"},{"index":5,"title":"Contents"},{"index":6,"title":"Genesis: Patriarchal History"},{"index":7,"title":"Exodus: Historical Background"},{"index":8,"title":"Exodus: Message"},{"index":9,"title":"Leviticus"},{"index":10,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '093_old-testament-words-for-today-warren-w-wiersbe',
    'Old Testament Words for Today – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":93,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":356208,"filename":"093_old-testament-words-for-today-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '094_oxford-dictionary-of-the-bible-w-r-f-browning',
    'Oxford Dictionary of the Bible – W. R. F. Browning',
    'W. R. F. Browning',
    'Oxford Reference Collection',
    3,
    '{"index":94,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1650288,"filename":"094_oxford-dictionary-of-the-bible-w-r-f-browning.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '095_parables-john-macarthur',
    'Parables – John MacArthur',
    'John MacArthur',
    'Độc lập / Tuyển tập chuyên khảo',
    8,
    '{"index":95,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":453750,"filename":"095_parables-john-macarthur.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Notes"},{"index":4,"title":"Appendix"},{"index":5,"title":"Introduction"},{"index":6,"title":"History,” Chicago Tribune, February 26, 2014, sec. A."},{"index":7,"title":"Cultural Approach to the Parables in Luke , 394."},{"index":8,"title":"Chapter 10: A Lesson About Persistence in Prayer 1. Luke 15 is surveyed in chapter 2 of John MacArthur, A Tale of Two Sons"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '096_quicknotes-bible-handbook-george-w-knight',
    'Quicknotes Bible Handbook – George W. Knight',
    'George W. Knight',
    'Độc lập / Tuyển tập chuyên khảo',
    20,
    '{"index":96,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":621620,"filename":"096_quicknotes-bible-handbook-george-w-knight.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"GENESIS"},{"index":4,"title":"JOSHUA"},{"index":5,"title":"JOB"},{"index":6,"title":"ISAIAH"},{"index":7,"title":"HOSEA"},{"index":8,"title":"MATTHEW"},{"index":9,"title":"ROMANS"},{"index":10,"title":"HEBREWS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '097_rediscovering-jonah-timothy-keller',
    'Rediscovering Jonah – Timothy Keller',
    'Timothy Keller',
    'Độc lập / Tuyển tập chuyên khảo',
    32,
    '{"index":97,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":282658,"filename":"097_rediscovering-jonah-timothy-keller.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"EPILOGUE"},{"index":5,"title":"NOTES"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"RUNNING FROM GOD"},{"index":8,"title":"THE WORLD’S STORMS"},{"index":9,"title":"WHO IS MY NEIGHBOR?"},{"index":10,"title":"EMBRACING THE OTHER"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '098_salvation-to-the-ends-of-the-earth-andreas-j-kostenberger-t-desmond-alexander',
    'Salvation to the Ends of the Earth – Andreas J. Köstenberger, T. Desmond Alexander',
    'Andreas J. Köstenberger, T. Desmond Alexander',
    'Độc lập / Tuyển tập chuyên khảo',
    19,
    '{"index":98,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":909288,"filename":"098_salvation-to-the-ends-of-the-earth-andreas-j-kostenberger-t-desmond-alexander.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Part 1"},{"index":4,"title":"Conclusion"},{"index":5,"title":"Conclusion"},{"index":6,"title":"Conclusion"},{"index":7,"title":"Conclusion"},{"index":8,"title":"Conclusion"},{"index":9,"title":"Conclusion"},{"index":10,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '099_seven-letters-to-seven-churches-douglas-connelly',
    'Seven Letters to Seven Churches – Douglas Connelly',
    'Douglas Connelly',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":99,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":88753,"filename":"099_seven-letters-to-seven-churches-douglas-connelly.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '100_song-of-solomon-douglas-sean-o-donnell',
    'Song of Solomon – Douglas Sean O''Donnell',
    'Douglas Sean O''Donnell',
    'Độc lập / Tuyển tập chuyên khảo',
    12,
    '{"index":100,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":398561,"filename":"100_song-of-solomon-douglas-sean-o-donnell.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Chapter One: Understandest Thou What Thou Readest?"},{"index":4,"title":"Chapter Two: Better Than Wine 1. Richard S. Hess, Song of Songs, Baker Commentary on the Old Testament Wisdom and"},{"index":5,"title":"Chapter Three: The Metaphors and Metamorphosis of Loving Words 1. The New English Bible (NEB) gives the sense, “Do not look down on me.” 2. Duane Garrett comments, “She never hints that she is of non-Israelite extraction. The"},{"index":6,"title":"Chapter Four: The Voices of Spring 1. Robert Gordis suggests “this may be the most beautiful expression of love in the spring"},{"index":7,"title":"Poets, ed. John Hollander , p. 35."},{"index":8,"title":"Chapter Six: A Love Feast in the Beautiful Garden 1. Malcolm Muggeridge, quoted in Ian Hunter, Malcolm Muggeridge: A Life (New York:"},{"index":9,"title":"Chapter Seven: A Reprieve and Return to Eden 1. David A. Hubbard, Ecclesiastes, Song of Solomon, The Communicator’s Commentary"},{"index":10,"title":"Chapter Eight: How Beautiful! 1. Calvin did not “touch” in the sense of writing any detailed commentary. In the Institutes,"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '101_song-of-solomon-the-navigators',
    'Song of Solomon – The Navigators',
    'The Navigators',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":101,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":136499,"filename":"101_song-of-solomon-the-navigators.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Notes"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"NOTES"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '102_strong-s-greek-dictionary-of-the-new-testament-strong-james',
    'Strong''s Greek Dictionary of the New Testament – Strong James',
    'Strong James',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":102,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":835879,"filename":"102_strong-s-greek-dictionary-of-the-new-testament-strong-james.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '103_tntc-01-matthew-r-t-france',
    'TNTC - 01. Matthew – R. T. France',
    'R. T. France',
    'Tyndale New Testament Commentaries (TNTC)',
    12,
    '{"index":103,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":951898,"filename":"103_tntc-01-matthew-r-t-france.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 18 Jesus’ teaching about relationships among disciples"},{"index":6,"title":"Chapter 24 poses great problems for the interpreter. It begins by talking about the coming destruction of the temple (which was to take place in AD 70 as a result of the Roman repression of the rebellion of AD 66), but by the end of the chapter it seems clear that the scene has moved to the parousia, the final ‘coming’ of the Son of man. Both events are combined in v. 3 in the question of the disciples which sparks off the discourse, and which further specifies that the parousia will mark ‘the close of the age’. What, then, is the connection between these two events, and how may we decide which parts of the chapter deal with the one and which with the other? How far is this a prediction of events within ‘this generation’ (v. 34), and how far is it concerned with the end of all things? Or are the two so closely connected that we must conclude that Jesus mistakenly expected his parousia and the ‘close of the age’ to take place within ‘this generation’? These questions will necessarily underlie the detailed commentary that follows, but a few general remarks at this point may help to indicate the overall perspective of this commentary. 59"},{"index":7,"title":"Introduction"},{"index":8,"title":"Chapter 1"},{"index":9,"title":"Chapter 2"},{"index":10,"title":"Chapter 3"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '104_tntc-02-mark-r-alan-cole',
    'TNTC - 02. Mark – R. Alan Cole',
    'R. Alan Cole',
    'Tyndale New Testament Commentaries (TNTC)',
    12,
    '{"index":104,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":766863,"filename":"104_tntc-02-mark-r-alan-cole.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 3 contains the story of the healing of the man with a withered hand, but again it is not merely a healing miracle, but a ‘sign’ to illustrate the right use of the Sabbath (3:4), a fact which the Pharisees fully realized (3:5)—hence their violent reaction (3:6)."},{"index":6,"title":"Chapter 1"},{"index":7,"title":"Chapter 2"},{"index":8,"title":"Chapter 3"},{"index":9,"title":"Chapter 4"},{"index":10,"title":"Chapter 5"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '105_tntc-03-luke-nicholas-perrin',
    'TNTC - 03. Luke – Nicholas Perrin',
    'Nicholas Perrin',
    'Tyndale New Testament Commentaries (TNTC)',
    4,
    '{"index":105,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1115792,"filename":"105_tntc-03-luke-nicholas-perrin.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '106_tntc-04-john-colin-g-kruse',
    'TNTC - 04. John – Colin G. Kruse',
    'Colin G. Kruse',
    'Tyndale New Testament Commentaries (TNTC)',
    11,
    '{"index":106,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":877890,"filename":"106_tntc-04-john-colin-g-kruse.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"i. The parable of the sheepfold"},{"index":6,"title":"A. The Last Supper"},{"index":7,"title":"Introduction"},{"index":8,"title":"Chapter 1"},{"index":9,"title":"Chapter 2"},{"index":10,"title":"Chapter 3"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '107_tntc-05-acts-i-howard-marshall',
    'TNTC - 05. Acts – I. Howard Marshall',
    'I. Howard Marshall',
    'Tyndale New Testament Commentaries (TNTC)',
    5,
    '{"index":107,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1013575,"filename":"107_tntc-05-acts-i-howard-marshall.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '108_tntc-06-romans-f-f-bruce',
    'TNTC - 06. Romans – F. F. Bruce',
    'F. F. Bruce',
    'Tyndale New Testament Commentaries (TNTC)',
    6,
    '{"index":108,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":579061,"filename":"108_tntc-06-romans-f-f-bruce.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Epilogue"},{"index":6,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '109_tntc-07-1-corinthians-leon-morris',
    'TNTC - 07. 1 Corinthians – Leon Morris',
    'Leon Morris',
    'Tyndale New Testament Commentaries (TNTC)',
    5,
    '{"index":109,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":516370,"filename":"109_tntc-07-1-corinthians-leon-morris.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '110_tntc-08-2-corinthians-colin-g-kruse',
    'TNTC - 08. 2 Corinthians – Colin G. Kruse',
    'Colin G. Kruse',
    'Tyndale New Testament Commentaries (TNTC)',
    5,
    '{"index":110,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":631204,"filename":"110_tntc-08-2-corinthians-colin-g-kruse.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Chapter 11 and the account of Paul’s ministry in Acts (cf. 13:50; 14:19; 17:5; 18:12; 19:29) provide the best commentary on these verses. Three of the factors call for explanation. By riots Paul means ‘civil disorders’ (cf. Acts 13:50; 14:19; 16:19; 19:29), his sleepless nights (cf. 11:27) were probably due to the pressures of travel, ministry and his concern for the churches, and hunger could refer either to fasting or lack of food."},{"index":5,"title":"NOTES"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '111_tntc-09-galatians-r-alan-cole',
    'TNTC - 09. Galatians – R. Alan Cole',
    'R. Alan Cole',
    'Tyndale New Testament Commentaries (TNTC)',
    4,
    '{"index":111,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":541356,"filename":"111_tntc-09-galatians-r-alan-cole.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"NOTES"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '112_tntc-10-ephesians-francis-foulkes',
    'TNTC - 10. Ephesians – Francis Foulkes',
    'Francis Foulkes',
    'Tyndale New Testament Commentaries (TNTC)',
    4,
    '{"index":112,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":409131,"filename":"112_tntc-10-ephesians-francis-foulkes.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '113_tntc-11-philippians-ralph-p-martin',
    'TNTC - 11. Philippians – Ralph P. Martin',
    'Ralph P. Martin',
    'Tyndale New Testament Commentaries (TNTC)',
    6,
    '{"index":113,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":396544,"filename":"113_tntc-11-philippians-ralph-p-martin.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Chapter 4:6 offers the injunction, ‘Do not be anxious’, and we may be sure that the apostle availed himself of his own secret of inward peace and tranquillity by the resources of ‘prayer and petition’. By these means he knew the peace of God in his heart and the joy of the Lord as his perpetual strength."},{"index":5,"title":"NOTES"},{"index":6,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '114_tntc-12-colossians-and-philemon-n-t-wright',
    'TNTC - 12. Colossians and Philemon – N. T. Wright',
    'N. T. Wright',
    'Tyndale New Testament Commentaries (TNTC)',
    2,
    '{"index":114,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":413243,"filename":"114_tntc-12-colossians-and-philemon-n-t-wright.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '115_tntc-13-1-and-2-thessalonians-leon-morris',
    'TNTC - 13. 1 and 2 Thessalonians – Leon Morris',
    'Leon Morris',
    'Tyndale New Testament Commentaries (TNTC)',
    4,
    '{"index":115,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":314230,"filename":"115_tntc-13-1-and-2-thessalonians-leon-morris.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '116_tntc-14-the-pastoral-epistles-donald-guthrie',
    'TNTC - 14. The Pastoral Epistles – Donald Guthrie',
    'Donald Guthrie',
    'Tyndale New Testament Commentaries (TNTC)',
    9,
    '{"index":116,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":501097,"filename":"116_tntc-14-the-pastoral-epistles-donald-guthrie.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"Appendix"},{"index":5,"title":"Notes"},{"index":6,"title":"Introduction"},{"index":7,"title":"Appendix"},{"index":8,"title":"Introduction"},{"index":9,"title":"Appendix"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '117_tntc-15-hebrews-donald-guthrie',
    'TNTC - 15. Hebrews – Donald Guthrie',
    'Donald Guthrie',
    'Tyndale New Testament Commentaries (TNTC)',
    6,
    '{"index":117,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":637181,"filename":"117_tntc-15-hebrews-donald-guthrie.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Conclusion"},{"index":6,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '118_tntc-16-james-douglas-j-moo',
    'TNTC - 16. James – Douglas J. Moo',
    'Douglas J. Moo',
    'Tyndale New Testament Commentaries (TNTC)',
    4,
    '{"index":118,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":500061,"filename":"118_tntc-16-james-douglas-j-moo.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"NOTES"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '119_tntc-17-1-peter-wayne-a-grudem',
    'TNTC - 17. 1 Peter – Wayne A. Grudem',
    'Wayne A. Grudem',
    'Tyndale New Testament Commentaries (TNTC)',
    8,
    '{"index":119,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":526764,"filename":"119_tntc-17-1-peter-wayne-a-grudem.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Appendix"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"APPENDIX"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"APPENDIX"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '120_tntc-18-2-peter-and-jude-michael-green',
    'TNTC - 18. 2 Peter and Jude – Michael Green',
    'Michael Green',
    'Tyndale New Testament Commentaries (TNTC)',
    13,
    '{"index":120,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":470732,"filename":"120_tntc-18-2-peter-and-jude-michael-green.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Jude: Analysis"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"CHAPTER ONE"},{"index":7,"title":"CHAPTER TWO"},{"index":8,"title":"CHAPTER THREE"},{"index":9,"title":"a. Introduction and greeting"},{"index":10,"title":"a. Beware of false teachers"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '121_tntc-19-letters-of-john-john-stott',
    'TNTC - 19. Letters of John – John Stott',
    'John Stott',
    'Tyndale New Testament Commentaries (TNTC)',
    5,
    '{"index":121,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":513547,"filename":"121_tntc-19-letters-of-john-john-stott.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '122_tntc-20-revelation-leon-morris',
    'TNTC - 20. Revelation – Leon Morris',
    'Leon Morris',
    'Tyndale New Testament Commentaries (TNTC)',
    6,
    '{"index":122,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":543691,"filename":"122_tntc-20-revelation-leon-morris.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 4 recorded a vision of God the Creator. Now comes a vision of God the Redeemer, the Lamb who has conquered through his death. The last chapter ended with the worship of the Creator and this will end with the worship of the Redeemer. These two chapters are very important for an understanding of the message of the book. There are mysteries in life. We feel ourselves caught up in the world’s evil and misery and we cannot break free. Some of us become rigid determinists and we all, at times, feel a sense of hopelessness and helplessness in the grip of forces stronger than we. The world’s agony is real. And the world’s inability to break free from the consequences of its guilt is real. This chapter with its seals that no-one can break stresses human inability. But it does not stop there. More important is the fact that through the Lamb the victory is won. The seals are opened and God’s purpose is worked out."},{"index":6,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '123_totc-01-genesis-derek-kidner',
    'TOTC - 01. Genesis – Derek Kidner',
    'Derek Kidner',
    'Tyndale Old Testament Commentaries (TOTC)',
    5,
    '{"index":123,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":458656,"filename":"123_totc-01-genesis-derek-kidner.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"13:1–18. The parting from Lot"},{"index":5,"title":"Chapter 34 shows the cost of it, paid in rape, treachery and massacre, a chain of evil that proceeded logically enough from the unequal partnership with the Canaanite community. There would still be echoes of it in the days of the Judges (cf. Judg. 9:28). Its very fierceness, as it turned out, saved Jacob, in his mood of appeasement (5, 30), from re-enacting the story of Lot: only fear for his life opened his ears again to God’s call to Beth-el."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '124_totc-02-exodus-r-alan-cole',
    'TOTC - 02. Exodus – R. Alan Cole',
    'R. Alan Cole',
    'Tyndale Old Testament Commentaries (TOTC)',
    3,
    '{"index":124,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":555298,"filename":"124_totc-02-exodus-r-alan-cole.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '125_totc-03-leviticus-jay-sklar',
    'TOTC - 03. Leviticus – Jay Sklar',
    'Jay Sklar',
    'Tyndale Old Testament Commentaries (TOTC)',
    4,
    '{"index":125,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":693585,"filename":"125_totc-03-leviticus-jay-sklar.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '126_totc-04-numbers-gordon-j-wenham',
    'TOTC - 04. Numbers – Gordon J. Wenham',
    'Gordon J. Wenham',
    'Tyndale Old Testament Commentaries (TOTC)',
    9,
    '{"index":126,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":552761,"filename":"126_totc-04-numbers-gordon-j-wenham.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 15 contains laws about cereal offerings, libations, high-handed sins, and tassels on garments. Chapters 16–17 relate several rebellions against the prerogatives of the priests and Levites. Chapter 18 sets out the offerings they are to receive and chapter 19 the rules about purification after death."},{"index":6,"title":"Chapter 18 was concerned with the appointment of the priests and Levites as custodians of the tabernacle to prevent such divine judgment falling on the nation. This chapter deals with the provision of a means to cure the uncleanness of death. Leviticus prescribes two methods of dealing with uncleanness: either washing in water and waiting till evening (11:28, 39–40; 15:16–18), or in more serious cases waiting seven days and then offering a sacrifice (14:10ff.; 15:13ff., 28ff.). Offering a sacrifice"},{"index":7,"title":"Introduction"},{"index":8,"title":"Introduction"},{"index":9,"title":"chapter 30, but Moses protests that in this case they are most to blame for Israel’s sin54"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '127_totc-05-deuteronomy-edward-j-woods',
    'TOTC - 05. Deuteronomy – Edward J. Woods',
    'Edward J. Woods',
    'Tyndale Old Testament Commentaries (TOTC)',
    18,
    '{"index":127,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":724274,"filename":"127_totc-05-deuteronomy-edward-j-woods.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Notes"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"Chapter 4 forms a ‘bridge’ between the historical review of chapters 1 – 3 and the beginning of Moses’ exposition of the law in 5:1. As such, it also concludes Moses’ first address (chs. 1 – 4), while also serving as ‘reading instructions’ for the rest of the book (Nelson 2002: 60). This includes a summary of past, present and future history, especially as this will relate to future idolatry within the land, eventual exile and return, made possible by God’s grace (vv. 25–31). 26  This passage anticipates 30:1–10, especially with the language of return with all your heart and with all your soul (4:29; cf. 30:2, 6, 10). Christensen (see b. Concentric literary patterns, above) has already drawn attention to the concentric ‘inner frames’ of chapters 4 – 11 and 27 – 30, in which the theological ideas of these chapters match each other in reverse order (e.g. 4 matches 30, and 11 matches 27). Further, appeal is made in chapter 4 to the covenant made with Israel at Horeb in terms of the Decalogue or ‘ten words’ (vv. 10–14), which form the basis of the ‘statutes and ordinances’ for the rest of the book. Chapter 5 then links back to chapter 4, but also looks forward by providing the specific details or ‘blueprint’ for the Decalogue (5:6–21). These become the basis for all the subsequent commands, decrees and laws (5:31; 12:1 – 26:15)."},{"index":7,"title":"Chapter 5 then presents the core text (Decalogue) of the law ‘so righteous’ (4:8) as a written text (5:22). But it also develops the idea of the Lord ‘so near’ (4:7), in terms of speaking to each successive generation of Israel (5:2) from out of the fire of Horeb (5:4, 22, 23–27; cf. 10:4). This is achieved by now turning the Lord’s question at 4:33 into a response by the people (5:26), leading to their commitment to obey all of God’s commands (5:27). Following this, 5:29 offers an important key to Israel’s ability to keep the law. Heart inclination to fear the Lord and keep all of his commands always (see fn. 13, p. 37) is rhetorically linked in Deuteronomy to Israel’s ability continually to encounter Horeb and the voice of God speaking to them from out of the fire (i.e. what is ‘seen and heard’). Chapter 4 shows this revelatory provision to be crucial in resisting the temptation to draw near to idolatrous images (4:28). Chapter 5 indicates that this provision is vital in resisting the tendency for Israel to draw away from God’s word, reducing it to past inscriptions which have no further relevance for Israel’s present or future (5:22, 23–31). Thus Israel is saved from a subjective understanding of the law (e.g. 29:19–21), and also an approach that viewed the law as of no relevance for present or future generations (5:2–3; 10:4; 17:18–20; 29:29; 30:11–14; 31:9–13, 24–26). 27"},{"index":8,"title":"Chapter 5 as ‘blueprint’ for the rest of the book continues the theme of God speaking from out of the fire by his voice, 31  but now makes contemporary the Horeb experience and covenant for each and every generation as though each were there (5:2–3). It also makes specific the Ten Commandments of which the first, You shall have no other gods before [or beside] me (5:7), is especially developed in the general stipulations of chapters 6 – 11. This section begins with the Shema at 6:4: Hear, O Israel: The LORD our God, the LORD is one (see commentary). 32  However, 6:5 also requires an exclusive relationship of love to be expressed to Yahweh ‘alone’ as Israel’s ‘one and only’ object of affection (adverbial use), supported by 6:13–15. This can be seen as reciprocating the Lord’s prior redemptive love towards Israel at 4:37–38, framed by 4:35, 39. The conclusion to chapters 6 – 11 is reached at 10:12–22. Within this passage, Yahweh’s cosmic sovereignty as God of gods and Lord of lords (v. 17) is linked to his nature as a Judge who shows no partiality and accepts no bribes. He defends the cause of the fatherless and the widow, and loves the alien, giving them food and clothing (v. 18). Israel is called to love the alien as Yahweh loves them, remembering that they too were aliens in Egypt (v. 20). Thus the doctrine of God in Deuteronomy has both a vertical and a horizontal dimension to it in terms of what it means to love God."},{"index":9,"title":"Comment"},{"index":10,"title":"Comment"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '128_totc-06-joshua-richard-s-hess',
    'TOTC - 06. Joshua – Richard S. Hess',
    'Richard S. Hess',
    'Tyndale Old Testament Commentaries (TOTC)',
    6,
    '{"index":128,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":737696,"filename":"128_totc-06-joshua-richard-s-hess.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 10 develops four theological areas. Firstly, God fights for Israel and gives them the Promised Land, as part of the divine covenant. Without God they cannot succeed. With God’s miracles they cannot fail. Secondly, only here are miracles performed, not in the north. The south, which will become the allotment of Judah and the Southern Kingdom, is specially blessed by God’s presence. Thirdly, Israel remains faithful to the Gibeonite treaty, whatever the cost. This treaty was not God’s will, yet God honours Israel’s faithfulness and incorporates their response to the Gibeonite peril into the conquest of the south. Finally, the text suggests the important role that God played in all the political activities of Israel. They keep their vow before God to help Gibeon. Joshua receives divine aid in the midst of the battle, requests more help and receives that as well. Each battle and the capture of each town include the repeated refrain that God gave it into their hands. The account begins and ends in the sanctuary at Gilgal before the presence of the LORD. Joshua 11 shows God as ruler of the north as well as of the south and of the lowlands as well as of the hill country (contrast the Arameans’ view in 1 Kgs 20:23). It demonstrates that not even the strongest of the fortified towns in Canaan can withstand the God of the Israelites."},{"index":6,"title":"Chapter 10 serves four literary purposes: firstly, it moves Israel out of the central hill country; secondly, it surveys the conquest of the south in the same way that the preceding chapters had focused on the central hill country; thirdly, the panels enable the author to shift back and forth between the work of God and that of Israel; and finally, the structure of the account increases the speed of the action. Fewer verses than before are devoted to the conquest of a whole region with many towns. This more highly paced action will continue in chapter 11 and reach a climax in chapter 12, where it will move so quickly that only the place names will be given."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '129_totc-07-judges-and-ruth-arthur-e-cundall',
    'TOTC - 07. Judges and Ruth – Arthur E. Cundall',
    'Arthur E. Cundall',
    'Tyndale Old Testament Commentaries (TOTC)',
    5,
    '{"index":129,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":646471,"filename":"129_totc-07-judges-and-ruth-arthur-e-cundall.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Chapter 2:6–3:6 may be regarded as an introduction to the stories of the judges, setting out the general principles operative throughout the period. The historian sees a pattern of events which forms a recurring cycle containing four elements: the children of Israel do that which is evil in the sight of the Lord; the Lord delivers them into the hand of an oppressor; in their distress they cry to the Lord; the Lord raises them up a deliverer. Thus there is a cycle of apostasy, servitude, supplication and salvation. It is this process which is followed closely in the succeeding chapters."},{"index":5,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '130_totc-08-1-and-2-samuel-joyce-g-baldwin',
    'TOTC - 08. 1 and 2 Samuel – Joyce G. Baldwin',
    'Joyce G. Baldwin',
    'Tyndale Old Testament Commentaries (TOTC)',
    3,
    '{"index":130,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":685089,"filename":"130_totc-08-1-and-2-samuel-joyce-g-baldwin.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '131_totc-09-1-and-2-kings-donald-j-wiseman',
    'TOTC - 09. 1 and 2 Kings – Donald J. Wiseman',
    'Donald J. Wiseman',
    'Tyndale Old Testament Commentaries (TOTC)',
    4,
    '{"index":131,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":706826,"filename":"131_totc-09-1-and-2-kings-donald-j-wiseman.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '132_totc-10-1-chronicles-martin-j-selman',
    'TOTC - 10. 1 Chronicles – Martin J. Selman',
    'Martin J. Selman',
    'Tyndale Old Testament Commentaries (TOTC)',
    8,
    '{"index":132,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":597838,"filename":"132_totc-10-1-chronicles-martin-j-selman.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Chapter 10 itself, however, contains two pointers of its own concerning its meaning. First, the structure emphasizes the unusual significance of the battle of Mount Gilboa. Although the battle itself is summarized in one verse (v. 1), the rest of the chapter is devoted to the effects of Saul’s defeat. Details of the king’s death (vv. 2–5), the desecration of his corpse (vv. 8–10), and his burial by the loyal inhabitants of Jabesh-Gilead (vv. 11–12) are interspersed with summaries of the military, political (vv. 5–6), and theological consequences (vv. 13–14). The entire account is characterized by key phrases such as the fact that Israel’s army fled (vv. 1, 7), and especially the death of the Saulide house (vv. 5, 6, 7, 13, 14)."},{"index":5,"title":"Chapter 12 continues the theme of all-Israelite support for David’s kingship with material that has no parallel in the Old Testament. Two aspects are emphasized: the increasing defections to David during the period of his persecution by Saul (vv. 1–22, and the gathering of the militia from all the tribes at Hebron (vv. 23–40). Chapters 11– 12 are arranged in an over-all chiastic structure, viz.,"},{"index":6,"title":"Chapter 18 appears to have originated from official lists, probably from the court rather than the temple. Verses 1–13 may be a summary of originally longer narratives of the kind now preserved in 19:1–20:3. Apart from variants concerning several proper names, the main changes from 2 Samuel are in verses 2, 8 and 17."},{"index":7,"title":"Chapter 19 seems to cover much the same ground as 18:3–8, except in more detail. However, the four battles described in 18:3–8 and 19:1–20:3 are not identical, and they are probably not in exact chronological order. For example, the implied confrontation in the Euphrates area (18:3–4) and the intervention of Damascus (18:5– 6) cannot be easily harmonized with the geographical data of chapter 19. Equally, it"},{"index":8,"title":"Chapter 23 introduces David’s organization of the Levites. The emphasis on preparation for the temple continues from chapter 22, but attention now turns from the building to the temple personnel, especially the Levites. The Levites are organized in advance by David so that when the building work is completed, they will be ready to take over the dual functions of assisting the priests (vv. 28, 32) and supervising the activities of God’s house (v. 4). This might include anything from the position of fabric steward to that of the worship leader (vv. 4–5, 28b–32). The key term in the chapter is service (Heb. ‘ăbōdâ, vv. 24, 26, 28, 32), a word which has a strong religious flavour in Chronicles. It summarizes the task of priests and Levites (e.g. 1 Chr. 6:32; 2 Chr. 31:16, Levites; 1 Chr. 9:13; 2 Chr. 8:14, priests; 1 Chr. 28:21; 2 Chr. 35:10, both), and is linked especially with their activity in the Tent (1 Chr. 6:48; 9:19) and the temple (1 Chr. 28:21; 2 Chr. 29:35). The Levites therefore find their true value in ‘the service of the house of the LORD (vv. 24, 28, 32, NRSV, RSV), which incorporates both ‘work’ (v. 24, GNB) and ‘worship’ (vv. 26, 28, 32, GNB)."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '133_totc-11-2-chronicles-martin-j-selman',
    'TOTC - 11. 2 Chronicles – Martin J. Selman',
    'Martin J. Selman',
    'Tyndale Old Testament Commentaries (TOTC)',
    8,
    '{"index":133,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":669105,"filename":"133_totc-11-2-chronicles-martin-j-selman.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Chapter 5 sets the scene by concentrating on the final act of furnishing the temple, i.e. the ark’s installation in the Most Holy Place (vv. 4–10). Like the cloud which subsequently fills the temple (vv. 13c–14), the ark symbolizes God’s presence, so that the chapter describes God taking up residence at the centre of his people’s life. The ark also speaks of the covenant God made with Israel at the exodus (vv. 7–10)—in fact, ‘ark of the covenant’ is a specially favoured phrase in Chronicles.38 In this context, it refers particularly to God’s commitment to Israel, an emphasis which would have been especially appreciated by Chronicles’ original readers. Even though, in their time, the ark had long since disappeared and their own temple was but a shadow of Solomon’s glory, this was a reminder that the God represented by these symbols had certainly not abandoned them. Indeed, they could be equally aware of his presence by engaging in praise and worship led by the Levites’ musical ministry (vv. 11–14)."},{"index":4,"title":"Chapter 14 introduces the main themes of Asa’s reign, combining the emphases of seeking God (vv. 4, 7) and relying on him (v. 11). In reality, these are different sides of the same coin, namely, an attitude of faith and trust, though the former is more general and the latter more specific. This trust is worked out practically, through a religious reformation (vv. 3–5), a strengthening of fortifications (vv. 6–7), and a victory over a superior invading army (vv. 8–15). Such a practical emphasis is a good illustration of the inner relationship between faith and works (cf. Jas 2:14–26; Rev. 3:1–6). It also underlines that faith is most effective in a time of crisis when it arises out of a more general attitude towards God, a theme that occurs regularly in the Old Testament (e.g. Dan. 1–6; Gen. 12–22) as well as the New Testament (e.g. Heb. 10:32–12:3; Rev. 3:7– 13)."},{"index":5,"title":"Chapter 16 is based on 1 Kings 15, but, though the changes are less extensive than in chapters 14–15, they lead to a significantly different interpretation. Whereas 1 Kings 15:16–24 is a matter-of-fact report of Asa’s Israelite war and his illness, here Asa is criticized for lack of faith in a way that has no explicit analogy in Kings. Another element without parallel in Kings is the dating scheme used throughout the chapter. What sources the Chronicler may have used in presenting his material in this way cannot be discovered, though one source is named (v. 11) and the prophecy is doubtless connected with the Chronicler’s frequent citation of prophetic authorities (e.g. 2 Chr. 9:29; 12:15)."},{"index":6,"title":"Chapter 17 is a kind of overture to chapters 18–20, briefly introducing many subjects that are dealt with more fully later on. This is particularly true of the opening section (vv. 1–6), but also applies to the subjects of teaching God’s law and the fear of the LORD (vv. 7–11; cf. 19:1–11; 20:29–30) and to the armed forces (vv. 12–19; cf. chs. 18 and 20)."},{"index":7,"title":"Chapter 29’s special emphases are expressed in three different patterns. In the first, Hezekiah’s reign revives the combined era of David and Solomon. David’s reign is recalled by two specific references (vv. 25–27, 30) as well as by the parallels between the Levites’ role in verses 3–19 and 1 Chronicles 15. Solomon is reflected in the parallel between his dedication of the temple (2 Chr. 7) and Hezekiah’s worship at the rededicated altar (vv. 20–35) and in the Passover (ch. 30). The link with David, which is especially strong in this chapter, shows that Hezekiah is much more than a second Solomon (against Williamson), a view which is based too much on 30:1–12. The second pattern contrasts Hezekiah with two other kings, namely Jeroboam I (as described by Abijah in 2 Chr. 13:8–12) and Ahaz (2 Chr. 28:22–24; 2 Kgs 16:10–18). Not only does this make Hezekiah’s reign the start of a new era, it confirms the message of Ezekiel 18 that Israel was not inevitably bound by its past (cf. chs. 27–28). The third pattern has been called a ‘festival schema’, and is based on the dedication of the temple (2 Chr. 7:8–10). This includes four components, a date (cf. vv. 1, 17), identification (and purification) of the participants (cf. vv. 4–20), details of the ceremonies (cf. vv. 21–35), and a joyful celebration (cf. v. 36).104 It is repeated in the reigns of Asa (2 Chr. 15:9–15) and Josiah (2 Chr. 35:1–19) as well as occurring twice in Hezekiah’s (cf. also 30:13–27), all of which confirms Hezekiah’s desire to participate in a living tradition of temple worship."},{"index":8,"title":"Chapter 30 does, however, contribute two emphases of its own. The first is that of a new potential for unity between south and north. The congregation included people"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '134_totc-12-ezra-and-nehemiah-derek-kidner',
    'TOTC - 12. Ezra and Nehemiah – Derek Kidner',
    'Derek Kidner',
    'Tyndale Old Testament Commentaries (TOTC)',
    4,
    '{"index":134,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":389358,"filename":"134_totc-12-ezra-and-nehemiah-derek-kidner.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '135_totc-13-esther-debra-reid',
    'TOTC - 13. Esther – Debra Reid',
    'Debra Reid',
    'Tyndale Old Testament Commentaries (TOTC)',
    6,
    '{"index":135,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":308962,"filename":"135_totc-13-esther-debra-reid.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Comment"},{"index":6,"title":"Chapter 6 contains the second of two episodes that intervene between the first and second banquets of Esther. It therefore prolongs suspense but it also resolves previous elements and anticipates future elements in the story. In particular, it resolves the incongruity that Mordecai was not rewarded for his earlier act of loyalty to the king (2:19–23) and deals with the recently raised tension between Haman and Mordecai (5:9–14). It anticipates coming events because this chapter is the turning point of the narrative: from these events onwards the fortunes of the Jewish people as a whole will change for the better, and Mordecai’s honour here prefigures that corporate experience."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '136_totc-14-job-francis-i-andersen',
    'TOTC - 14. Job – Francis I. Andersen',
    'Francis I. Andersen',
    'Tyndale Old Testament Commentaries (TOTC)',
    5,
    '{"index":136,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":682458,"filename":"136_totc-14-job-francis-i-andersen.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 26 is one of the grandest recitals in the whole book. It is excelled only by the Lord’s speeches, as is fitting. It sounds well in Job’s mouth, and ends the dialogue, like the first movement of a symphony, with great crashing chords."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '137_totc-15-16-psalms-tremper-longman-iii',
    'TOTC - 15-16. Psalms – Tremper Longman III',
    'Tremper Longman III',
    'Tyndale Old Testament Commentaries (TOTC)',
    4,
    '{"index":137,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":958060,"filename":"137_totc-15-16-psalms-tremper-longman-iii.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '138_totc-17-proverbs-lindsay-wilson',
    'TOTC - 17. Proverbs – Lindsay Wilson',
    'Lindsay Wilson',
    'Tyndale Old Testament Commentaries (TOTC)',
    12,
    '{"index":138,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":743089,"filename":"138_totc-17-proverbs-lindsay-wilson.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Notes"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 26 warns us that a proverb is not automatically effective, as it can be misused. Thus a proverb in the mouth of a fool can be as useless as a lame man’s legs (26:7) or as dangerous as a thorny branch in the hand of a drunk (26:9). The key here is the phrase in the mouth of fools. Within chapters 1 – 9, fools are those who reject the starting point of the fear of the Lord (1:7), who keep on choosing the path of folly not the way of wisdom (9:1–6, 13–18), and who refuse to allow their character to be shaped by wisdom (2:1–11). In other words, a proverb is not fully useful unless its hearer or reader has made the fundamental and ongoing choices called for in chapters 1 – 9."},{"index":6,"title":"Introduction"},{"index":7,"title":"Chapter 1"},{"index":8,"title":"Chapter 2"},{"index":9,"title":"Chapter 3"},{"index":10,"title":"Chapter 4"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '139_totc-18-ecclesiastes-michael-a-eaton',
    'TOTC - 18. Ecclesiastes – Michael A. Eaton',
    'Michael A. Eaton',
    'Tyndale Old Testament Commentaries (TOTC)',
    4,
    '{"index":139,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":363007,"filename":"139_totc-18-ecclesiastes-michael-a-eaton.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '140_totc-19-the-song-of-songs-iain-m-duguid',
    'TOTC - 19. The Song of Songs – Iain M. Duguid',
    'Iain M. Duguid',
    'Tyndale Old Testament Commentaries (TOTC)',
    3,
    '{"index":140,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":307929,"filename":"140_totc-19-the-song-of-songs-iain-m-duguid.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '141_totc-20-isaiah-j-alec-motyer',
    'TOTC - 20. Isaiah – J. Alec Motyer',
    'J. Alec Motyer',
    'Tyndale Old Testament Commentaries (TOTC)',
    7,
    '{"index":141,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1050176,"filename":"141_totc-20-isaiah-j-alec-motyer.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"NOTES"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"chapter 5 and provided 10:5–15 as a new climax for the remainder. There are many suggestions regarding the original shape of the poem, none of which can claim certainty, but a very coherent piece of literature is achieved by making 5:22–25 the fifth stanza of the poem, with 5:27–30 as its original conclusion. What we must not do, of course, is reassemble the poem, for this would upset the careful structuring Isaiah has achieved by using it in two different places, each part fitting perfectly into its new context."},{"index":7,"title":"Chapter 66 is best understood by looking first at the shape of the whole. It begins (1–4) and ends (18–24) with the theme of the house of the Lord. In the opening section, Isaiah moves quickly from the house itself (1–2) to contrasting worshippers— those who ‘tremble at my word’ (2), and those who, though they engage in the ritual (3), do not answer when the Lord calls (4). In the closing passage, Isaiah starts with a worldwide pilgrimage bringing a pure offering to the Lord’s house (18–21), and ‘all mankind’ keeping Sabbath (22–23). But, by contrast, there are those upon whom the final judgment of God has fallen (24). The two internal sections of the chapter deal respectively with these two groups of people: a message of assurance and hope for ‘those who tremble’ at the Lord’s word (5–14), and the Lord’s fiery judgment on the false worshippers (15–17). The Lord’s ‘house’ is, of course, the ‘place’ where he comes to live at the centre of his people’s life. This is his ‘tabernacle’, his tent-"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '142_totc-21-jeremiah-and-lamentations-hetty-lalleman',
    'TOTC - 21. Jeremiah and Lamentations – Hetty Lalleman',
    'Hetty Lalleman',
    'Tyndale Old Testament Commentaries (TOTC)',
    17,
    '{"index":142,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":778509,"filename":"142_totc-21-jeremiah-and-lamentations-hetty-lalleman.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"Chapter 36 suggests a number of conclusions. To begin with, a first scroll with prophecies of Jeremiah was written in 605 BC, containing words of warning and impending judgment. At that time, there was still the opportunity to listen and repent. The scroll contained words intended for Israel and Judah and all the other nations (v. 2). It cannot have been very long, since throughout Jeremiah 36 it was read aloud and heard several times (vv. 10, 13, 15, 21). Furthermore, Baruch obviously acted as Jeremiah’s scribe. The text suggests that he was very precise in writing down exactly"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"NOTES"},{"index":9,"title":"Introduction"},{"index":10,"title":"Chapter 2"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '143_totc-22-ezekiel-john-b-taylor',
    'TOTC - 22. Ezekiel – John B. Taylor',
    'John B. Taylor',
    'Tyndale Old Testament Commentaries (TOTC)',
    4,
    '{"index":143,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":595432,"filename":"143_totc-22-ezekiel-john-b-taylor.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '144_totc-23-daniel-joyce-baldwin',
    'TOTC - 23. Daniel – Joyce Baldwin',
    'Joyce Baldwin',
    'Tyndale Old Testament Commentaries (TOTC)',
    10,
    '{"index":144,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":484196,"filename":"144_totc-23-daniel-joyce-baldwin.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 7 has been the subject of special study because, though it belongs among the visionary chapters and on that account to the second part of the book, it is the last of the Aramaic chapters, and it has affinities with chapter 2. It has been argued that chapter 7 belongs to part one of the book, and that, at least in its original form, it belongs to its pre-Maccabean stage.78 Only so can justice be done to the differences between chapters 1–7 and 8–12. M. Delcor takes up the argument for Canaanite influence behind the imagery of chapter 7, which suggests an earlier rather than a later date for this chapter. ‘The influence of the religion and literature of Canaan on Israel … must have continued to be exercised after the exile.’79"},{"index":6,"title":"d. Evidence from Qumran"},{"index":7,"title":"b. There is progressive parallelism"},{"index":8,"title":"Chapter 1 raises a cultural problem: how far should a loyal Jew accept the alien culture of a conqueror? The second century Maccabees rejected the language, literature and customs of the Greeks, whereas Daniel and his friends accepted and adapted to all three, taking a stand only on the matter of gifts from the royal table. In the Nebuchadrezzar stories the addition of Qumran evidence to the cycle of Daniel literature has tended to convince scholars that Daniel 4 was formulated before the second century and should perhaps be seen in connection with Isaiah 2:9ff.116 The gradual capitulation of Nebuchadrezzar before the God of his captives, and the favour shown by Darius toward Daniel, make it hard to see that they easily pointed to the tyrant Antiochus. Belshazzar might seem to symbolize him, and yet chapter 5 is considered by Montgomery to be far more ancient than the second century BC.117"},{"index":9,"title":"Chapter 2, with its image in four metals, spanned history from the period of the Babylonian exile to the setting up of God’s kingdom, when all nations and peoples would acknowledge and serve him. Elsewhere in the book only in chapter 7 is so broad a canvas presented, and there is much to be said for looking upon the six chapters in Aramaic (2–7) as the nucleus of the book,1 of which chapter 7 is the climax. In chapter 8 the narrower scope is indicated by the fact that only two animals appear in the vision, which is located in Susa, the ancient capital of Elam, destined to become one of the great cities of the Persian empire (Neh. 1:1). Though the vision is dated in the Babylonian period, Babylon is no longer taken into account."},{"index":10,"title":"Interpretation"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '145_totc-24-hosea-david-allan-hubbard',
    'TOTC - 24. Hosea – David Allan Hubbard',
    'David Allan Hubbard',
    'Tyndale Old Testament Commentaries (TOTC)',
    5,
    '{"index":145,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":540455,"filename":"145_totc-24-hosea-david-allan-hubbard.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 13 is a series of short judgment speeches, each of which is reinforced by literary devices that intensify the indictments or sharpen the threats. If Hosea deliberately restates a number of his major themes, so he seems to display again an array of his literary techniques."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '146_totc-25-joel-and-amos-david-allan-hubbard',
    'TOTC - 25. Joel and Amos – David Allan Hubbard',
    'David Allan Hubbard',
    'Tyndale Old Testament Commentaries (TOTC)',
    6,
    '{"index":146,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":538781,"filename":"146_totc-25-joel-and-amos-david-allan-hubbard.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '147_totc-26-obadiah-jonah-and-micah-david-w-baker-t-desmond-alexander-bruce-k-waltke',
    'TOTC - 26. Obadiah, Jonah and Micah – David W. Baker, T. Desmond Alexander, Bruce K. Waltke',
    'David W. Baker, T. Desmond Alexander, Bruce K. Waltke',
    'Tyndale Old Testament Commentaries (TOTC)',
    9,
    '{"index":147,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":421162,"filename":"147_totc-26-obadiah-jonah-and-micah-david-w-baker-t-desmond-alexander-bruce-k-waltke.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"Introduction"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"Conclusion"},{"index":9,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '148_totc-27-nahum-habakkuk-and-zephaniah-david-w-baker',
    'TOTC - 27. Nahum, Habakkuk and Zephaniah – David W Baker',
    'David W Baker',
    'Tyndale Old Testament Commentaries (TOTC)',
    8,
    '{"index":148,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":220948,"filename":"148_totc-27-nahum-habakkuk-and-zephaniah-david-w-baker.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"Introduction"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '149_totc-28-haggai-zechariah-and-malachi-andrew-e-hill',
    'TOTC - 28. Haggai, Zechariah and Malachi – Andrew E. Hill',
    'Andrew E. Hill',
    'Tyndale Old Testament Commentaries (TOTC)',
    9,
    '{"index":149,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":674648,"filename":"149_totc-28-haggai-zechariah-and-malachi-andrew-e-hill.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"Introduction"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"INTRODUCTION"},{"index":9,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '150_the-400-silent-years-h-a-ironside',
    'The 400 Silent Years – H. A. Ironside',
    'H. A. Ironside',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":150,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":150442,"filename":"150_the-400-silent-years-h-a-ironside.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '151_the-be-series-commentary-warren-w-wiersbe',
    'The BE Series Commentary – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Độc lập / Tuyển tập chuyên khảo',
    128,
    '{"index":151,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1601909,"filename":"151_the-be-series-commentary-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"The Big Idea"},{"index":4,"title":"A Word from the Author"},{"index":5,"title":"BC: Before Creation"},{"index":6,"title":"When God Speaks, Something Happens"},{"index":7,"title":"First Things First"},{"index":8,"title":"This Is My Father’s World—or Is It?"},{"index":9,"title":"Perils in Paradise"},{"index":10,"title":"In Center Stage—Cain"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '152_the-basic-bible-atlas-john-a-beck',
    'The Basic Bible Atlas – John A. Beck',
    'John A. Beck',
    'Độc lập / Tuyển tập chuyên khảo',
    9,
    '{"index":152,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":245376,"filename":"152_the-basic-bible-atlas-john-a-beck.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Chapter 3  Creation, Fall, and Rescue Plan Stories 1. Anson F. Rainey and R. Steven Notley, The Sacred Bridge: Carta’s Atlas of the Biblical World (Jerusalem:"},{"index":4,"title":"Chapter 4  Exodus, Wilderness, and Transjordan Stories 1. Residents of the Levant would typically flee to Egypt when famine struck their homeland. James K. Hoffmeier,"},{"index":5,"title":"Chapter 5  Conquest, Division, and Crisis Stories 1. Iain Provan, V. Philips Long, and Tremper Longman III, A Biblical History of Israel (Louisville: Westminster"},{"index":6,"title":"Chapter 6  United Kingdom Stories 1. For a longer introduction to the ark of the covenant, see J. Daniel Hays, The Temple and the Tabernacle: A"},{"index":7,"title":"Chapter 8  Exile and Return Stories 1. For a chart depicting these exiles, see Beck, Charts, Maps, and Time Lines, 124. 2. Bright, History of Israel, 344. 3. Walter C. Kaiser Jr., A History of Israel: From the Bronze Age through the Jewish Wars (Nashville: Broadman"},{"index":8,"title":"Chapter 9  Jesus Stories 1. For a list of all the events and lessons from Jesus’s life that occurred in various Galilee locations, see Beck,"},{"index":9,"title":"Chapter 10  Church Stories 1. Carey C. Newman, “Acts,” in A Complete Literary Guide to the Bible, ed. Leland Ryken and Tremper"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '153_the-bible-dictionary-william-w-rand',
    'The Bible Dictionary – William W. Rand',
    'William W. Rand',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":153,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1683889,"filename":"153_the-bible-dictionary-william-w-rand.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '154_the-bible-story-handbook-john-h-walton-kim-e-walton',
    'The Bible Story Handbook – John H. Walton & Kim E. Walton',
    'John H. Walton & Kim E. Walton',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":154,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":800943,"filename":"154_the-bible-story-handbook-john-h-walton-kim-e-walton.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '155_the-bible-study-handbook-lindsay-olesberg',
    'The Bible Study Handbook – Lindsay Olesberg',
    'Lindsay Olesberg',
    'Độc lập / Tuyển tập chuyên khảo',
    24,
    '{"index":155,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":434323,"filename":"155_the-bible-study-handbook-lindsay-olesberg.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Notes"},{"index":4,"title":"Notes"},{"index":5,"title":"Chapter 1: Centrality of the Word 1See chapter nineteen for instruction on selecting and using commentaries. 2The medieval church’s assumption of geocentrism had more to do with the biases"},{"index":6,"title":"p. 86. 2Ibid., p. 74."},{"index":7,"title":"2006), p. 162. 2Eugene H. Peterson, Eat This Book: A Conversation in the Art of Spiritual"},{"index":8,"title":"Chapter 5: Community Around the Word 1Dan Siewert, “Building a House,” unpublished paper, 1992."},{"index":9,"title":"Chapter 6: Honor the Author 1A. J. Jacobs, The Know-It-All: One Man’s Humble Attempt to Become the"},{"index":10,"title":"Chapter 7: Respect for the Story 1Donald Bloesch, Holy Scripture: Revelation, Inspiration & Interpretation"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '156_the-bible-and-homosexual-practice-robert-a-j-gagnon',
    'The Bible and Homosexual Practice – Robert A.J. Gagnon',
    'Robert A.J. Gagnon',
    'Độc lập / Tuyển tập chuyên khảo',
    11,
    '{"index":156,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1250596,"filename":"156_the-bible-and-homosexual-practice-robert-a-j-gagnon.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"I. The Ancient Near Eastern Background"},{"index":5,"title":"I. Procreation"},{"index":6,"title":"I. The Context of Ancient Judaism and Jesus'' View of Torah"},{"index":7,"title":"I. Romans 1:24-27"},{"index":8,"title":"I. The Bible condemns only exyploitative, pederastic forms of homosexuality."},{"index":9,"title":"Conclusion"},{"index":10,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '157_the-bible-s-answers-to-100-of-life-s-biggest-questions-norman-l-geisler-jason-ji',
    'The Bible''s Answers to 100 of Life''s Biggest Questions – Norman L. Geisler, Jason Jimenez',
    'Norman L. Geisler, Jason Jimenez',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":157,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":459992,"filename":"157_the-bible-s-answers-to-100-of-life-s-biggest-questions-norman-l-geisler-jason-ji.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '158_the-book-of-revelation-clarence-larkin',
    'The Book of Revelation – Clarence Larkin',
    'Clarence Larkin',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":158,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":508714,"filename":"158_the-book-of-revelation-clarence-larkin.json","outline_sample":[{"index":1,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '159_the-complete-people-and-places-of-the-bible-pamela-l-mcquade',
    'The Complete People and Places of the Bible – Pamela L. McQuade',
    'Pamela L. McQuade',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":159,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":266713,"filename":"159_the-complete-people-and-places-of-the-bible-pamela-l-mcquade.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"NOTES"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '160_the-concise-a-to-z-guide-to-finding-it-in-the-bible',
    'The Concise A to Z Guide to Finding It in the Bible',
    '',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":160,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":843090,"filename":"160_the-concise-a-to-z-guide-to-finding-it-in-the-bible.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '161_the-cradle-cross-and-crown-billy-graham',
    'The Cradle, Cross, and Crown – Billy Graham',
    'Billy Graham',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":161,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":32586,"filename":"161_the-cradle-cross-and-crown-billy-graham.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '162_the-eerdmans-companion-to-the-bible-gordon-d-fee-robert-l-hubbard',
    'The Eerdmans Companion to the Bible – Gordon D. Fee, Robert L. Hubbard',
    'Gordon D. Fee, Robert L. Hubbard',
    'Độc lập / Tuyển tập chuyên khảo',
    32,
    '{"index":162,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1808876,"filename":"162_the-eerdmans-companion-to-the-bible-gordon-d-fee-robert-l-hubbard.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Conclusion"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Chapter 5 traces the beginnings of the genealogical line through which God will redeem fallen humanity. It mentions io fathers from Adam to Noah and gives similar information for each: his age at the birth of his first son, his life span thereafter, a mention that he had other children, and his age when he died. Only the verses about Enoch depart from this formula. Presumably because Enoch \"walked with God,\" he did not die as the others did. Rather, God \"took him\" (cf. Elijah, 2 Kgs. 2:11)."},{"index":5,"title":"Chapter 22 straightforwardly portrays both God''s shocking command that Abraham sacrifice his beloved \"only son\" (the only son through whom God will fulfill his"},{"index":6,"title":"3:1-4:17 God''s Charge to Moses"},{"index":7,"title":"18 Sexual Purity"},{"index":8,"title":"Chapter 25 anticipates Israel''s future occupation of Canaan. God''s command to allow the land a sabbatical every seventh year expands the instruction in Exod. 23:10-11 to sow for six years and let the land lie fallow during the seventh. The Israelites must afford the land an additional sabbatical every 5oth year - the Year of jubilee, during which property sold over the previous five decades reverts back to its original owner. The Year of jubilee, which begins on the Day of Atonement, also occasions the forgiving of unpaid debts and the freeing of impoverished Israelites forced to sell themselves into bondage. Thus restoration and regained liberty emerge as the central themes of the Sabbatical and jubilee years."},{"index":9,"title":"Chapter 5 presents still more parallels with the account of Moses and the previous generation of Israelites. All males must undergo circumcision - a practice not applied to males born during the 40 years of wilderness wandering. God''s command of a \"second\" circumcision applies to males over 40, whose initial, partial circumcision took place in Egypt. The abundance of flint in Canaan provided a ready tool for the task. The nation''s vulnerability, caused by its fighting force''s temporary disablement, does not prove a cause for concern, because the Israelites'' miraculous crossing of the Jordan has struck fear of them in the hearts of Canaan''s inhabitants (v. 1). The circumcision of Israel''s males serves to mark the nation as a whole with the sign of the covenant (v. 8; cf. Gen. 17:10-11)."},{"index":10,"title":"6-8 Gideon vs. the Midianites and Amalekites"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '163_the-essential-bible-companion-to-the-psalms-brian-webster-david-r-beach',
    'The Essential Bible Companion to the Psalms – Brian Webster, David R. Beach',
    'Brian Webster, David R. Beach',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":163,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":363037,"filename":"163_the-essential-bible-companion-to-the-psalms-brian-webster-david-r-beach.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '164_the-essential-bible-companion-john-h-walton-mark-l-strauss',
    'The Essential Bible Companion – John H. Walton, Mark L. Strauss',
    'John H. Walton, Mark L. Strauss',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":164,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":335440,"filename":"164_the-essential-bible-companion-john-h-walton-mark-l-strauss.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '165_the-essential-bible-dictionary-moises-silva',
    'The Essential Bible Dictionary – Moisés Silva',
    'Moisés Silva',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":165,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":565257,"filename":"165_the-essential-bible-dictionary-moises-silva.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '166_the-essential-companion-to-life-in-bible-times-moises-silva',
    'The Essential Companion to Life in Bible Times – Moisés Silva',
    'Moisés Silva',
    'Độc lập / Tuyển tập chuyên khảo',
    8,
    '{"index":166,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":311965,"filename":"166_the-essential-companion-to-life-in-bible-times-moises-silva.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"As the fundamental unit of human society, the family played a central role in Israelite"},{"index":4,"title":"The previous chapter examined the roles of individuals in family life. Here we look"},{"index":5,"title":"God’s original purpose for human beings is expressed in the Bible under the divine"},{"index":6,"title":"Individuals relate to one another not only in a family setting and in connection with"},{"index":7,"title":"The term government refers to the control and administration of public policy. The"},{"index":8,"title":"As the material covered in previous chapters suggests, every aspect of Hebrew"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '167_the-expositor-s-bible-commentary-kenneth-l-barker-john-r-kohlenberger-iii',
    'The Expositor''s Bible Commentary – Kenneth L. Barker, John R. Kohlenberger III',
    'Kenneth L. Barker, John R. Kohlenberger III',
    'Độc lập / Tuyển tập chuyên khảo',
    8,
    '{"index":167,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1312593,"filename":"167_the-expositor-s-bible-commentary-kenneth-l-barker-john-r-kohlenberger-iii.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '168_the-ivp-bible-background-commentary-new-testament-craig-s-keener',
    'The IVP Bible Background Commentary - New Testament – Craig S. Keener',
    'Craig S. Keener',
    'IVP Reference & Academic',
    4,
    '{"index":168,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1947867,"filename":"168_the-ivp-bible-background-commentary-new-testament-craig-s-keener.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Chapter 23 began Jesus’ warning of God’s judgment against certain elements of the religious establishment; this chapter extends that judgment to the temple itself. After it was destroyed in A.D. 70, many of the Jewish people saw God’s hand of judgment in the destruction."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '169_the-ivp-bible-background-commentary-old-testament-craig-s-keener',
    'The IVP Bible Background Commentary - Old Testament – Craig S. Keener',
    'Craig S. Keener',
    'IVP Reference & Academic',
    6,
    '{"index":169,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1715624,"filename":"169_the-ivp-bible-background-commentary-old-testament-craig-s-keener.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"Introduction"},{"index":6,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '170_the-ivp-bible-dictionaries-new-testament',
    'The IVP Bible Dictionaries - New Testament',
    '',
    'IVP Reference & Academic',
    2,
    '{"index":170,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":2344791,"filename":"170_the-ivp-bible-dictionaries-new-testament.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '171_the-ivp-bible-dictionaries-old-testament',
    'The IVP Bible Dictionaries - Old Testament',
    '',
    'IVP Reference & Academic',
    1,
    '{"index":171,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":2563460,"filename":"171_the-ivp-bible-dictionaries-old-testament.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '172_the-illustrated-dictionary-of-bible-manners-customs-a-van-deursen',
    'The Illustrated Dictionary of Bible Manners & Customs – A. Van Deursen',
    'A. Van Deursen',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":172,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":176337,"filename":"172_the-illustrated-dictionary-of-bible-manners-customs-a-van-deursen.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '173_the-intercessory-prayer-of-jesus-warren-w-wiersbe',
    'The Intercessory Prayer of Jesus – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":173,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":249034,"filename":"173_the-intercessory-prayer-of-jesus-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '174_the-jps-bible-commentary-song-of-songs-michael-fishbane',
    'The JPS Bible Commentary: Song of Songs – Michael Fishbane',
    'Michael Fishbane',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":174,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1267848,"filename":"174_the-jps-bible-commentary-song-of-songs-michael-fishbane.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '175_the-key-ideas-bible-handbook-ron-rhodes',
    'The Key Ideas Bible Handbook – Ron Rhodes',
    'Ron Rhodes',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":175,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":816369,"filename":"175_the-key-ideas-bible-handbook-ron-rhodes.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '176_the-late-great-planet-earth-hal-lindsey-carole-c-carlson',
    'The Late Great Planet Earth – Hal Lindsey, Carole C. Carlson',
    'Hal Lindsey, Carole C. Carlson',
    'Độc lập / Tuyển tập chuyên khảo',
    13,
    '{"index":176,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":331205,"filename":"176_the-late-great-planet-earth-hal-lindsey-carole-c-carlson.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"Notes"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"CHAPTER 1"},{"index":7,"title":"CHAPTER 4"},{"index":8,"title":"CHAPTER 5"},{"index":9,"title":"CHAPTER 6"},{"index":10,"title":"CHAPTER 7"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '177_the-little-book-of-where-to-find-it-in-the-bible-ken-anderson',
    'The Little Book of Where to Find It in the Bible – Ken Anderson',
    'Ken Anderson',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":177,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":456335,"filename":"177_the-little-book-of-where-to-find-it-in-the-bible-ken-anderson.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '178_the-macarthur-bible-commentary-john-macarthur',
    'The MacArthur Bible Commentary – John MacArthur',
    'John MacArthur',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":178,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2261291,"filename":"178_the-macarthur-bible-commentary-john-macarthur.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '179_the-meaning-of-marriage-timothy-kathy-keller',
    'The Meaning of Marriage – Timothy & Kathy Keller',
    'Timothy & Kathy Keller',
    'Độc lập / Tuyển tập chuyên khảo',
    6,
    '{"index":179,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":491403,"filename":"179_the-meaning-of-marriage-timothy-kathy-keller.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"EPILOGUE"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Chapter 6 discusses the Christian teaching that marriage is a place where the two sexes accept each other as differently gendered and learn and grow through it. Chapter 7 helps single people use the material in this book to live the single life well and to think wisely about seeking"},{"index":6,"title":"EPILOGUE"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '180_the-message-of-the-kingdom-of-god-t-desmond-alexander',
    'The Message of the Kingdom of God – T. Desmond Alexander',
    'T. Desmond Alexander',
    'Độc lập / Tuyển tập chuyên khảo',
    28,
    '{"index":180,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":629672,"filename":"180_the-message-of-the-kingdom-of-god-t-desmond-alexander.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"Notes"},{"index":5,"title":"Introduction"},{"index":6,"title":"Conclusion"},{"index":7,"title":"Introduction"},{"index":8,"title":"Chapter 1"},{"index":9,"title":"Chapter 2"},{"index":10,"title":"Chapter 3"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '181_the-message-of-the-sermon-on-the-mount-john-stott',
    'The Message of the Sermon on the Mount – John Stott',
    'John Stott',
    'Độc lập / Tuyển tập chuyên khảo',
    16,
    '{"index":181,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":468816,"filename":"181_the-message-of-the-sermon-on-the-mount-john-stott.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Notes"},{"index":4,"title":"Chapter 1"},{"index":5,"title":"Chapter 2"},{"index":6,"title":"Chapter 3"},{"index":7,"title":"Chapter 4"},{"index":8,"title":"Chapter 5"},{"index":9,"title":"Chapter 6"},{"index":10,"title":"Chapter 7"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '182_the-misery-of-job-and-the-mercy-of-god-john-piper',
    'The Misery of Job and the Mercy of God – John Piper',
    'John Piper',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":182,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":33756,"filename":"182_the-misery-of-job-and-the-mercy-of-god-john-piper.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '183_the-moody-bible-commentary-michael-rydelnik-michael-vanlaningham',
    'The Moody Bible Commentary – Michael Rydelnik, Michael Vanlaningham',
    'Michael Rydelnik, Michael Vanlaningham',
    'Độc lập / Tuyển tập chuyên khảo',
    19,
    '{"index":183,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2808263,"filename":"183_the-moody-bible-commentary-michael-rydelnik-michael-vanlaningham.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"Chapter 27 will specify the transactions that occur when holy things or persons (as defined in chaps. 25–26) are redeemed from the Lord."},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"Chapter 15 is related in several ways to the immediate context. For one thing, since many of their previous complaints were related to the lack of food and ingratitude for what the Lord provided (i.e., manna), in the future whenever they offered animal sacrifices they would have to bring a grain offering (15:4) perhaps reminiscent or symbolic of the manna the Lord had graciously provided for them in the wilderness. Another connection is that along with the addition of the grain offering they were also to include a wine drink offering (15:5). One of the items the spies brought back was a huge cluster of grapes (13:23). Having seen from Eshcol (the fertile region close to Hebron where they found the large grapes) what the land could produce agriculturally, the nation still refused to take possession of the land. Perhaps as a future visual reminder of rejecting that “fruit,” the Lord imposed additional legislation on all future sacrifices to include a wine offering (made from grapes) along with the designated animal. These additional legislations were given less than two years after the original giving of the law at Sinai, and so perhaps something contextually triggered the giving of more restrictive laws than what they had already received at Sinai."},{"index":9,"title":"INTRODUCTION"},{"index":10,"title":"Chapter 22 seems like disparate material, but subtle clues indicate that it is a unit. Repeated words (such as ox [vv. 1, 4, 10], donkey [vv. 3, 10], garment/clothing [vv. 3, 5, 12], and house [vv. 2, 8]) stitch these laws together. This section also transitions from the taking of life (21:18–22:8) to purity, including sexual purity (22:9-30)."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '184_the-new-manners-and-customs-of-the-bible-james-m-freeman',
    'The New Manners and Customs of the Bible – James M. Freeman',
    'James M. Freeman',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":184,"category":"survey","category_vi":"Khảo Lược & Dẫn Nhập","chars":916293,"filename":"184_the-new-manners-and-customs-of-the-bible-james-m-freeman.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '185_the-new-moody-atlas-of-the-bible-barry-j-beitzel',
    'The New Moody Atlas of the Bible – Barry J. Beitzel',
    'Barry J. Beitzel',
    'Độc lập / Tuyển tập chuyên khảo',
    7,
    '{"index":185,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":667761,"filename":"185_the-new-moody-atlas-of-the-bible-barry-j-beitzel.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Role of Geography in Understanding History / 14"},{"index":4,"title":"Garden of Eden / 88"},{"index":5,"title":"Map Citation Index / 292"},{"index":6,"title":"The Physical Geography of the Land"},{"index":7,"title":"The Historical Geography of the Land"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '186_the-new-strong-s-exhaustive-concordance-of-the-bible-james-strong',
    'The New Strong''s Exhaustive Concordance of the Bible – James Strong',
    'James Strong',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":186,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1779604,"filename":"186_the-new-strong-s-exhaustive-concordance-of-the-bible-james-strong.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '187_the-new-testament-in-its-world-n-t-wright-michael-f-bird',
    'The New Testament in Its World – N. T. Wright, Michael F. Bird',
    'N. T. Wright, Michael F. Bird',
    'Độc lập / Tuyển tập chuyên khảo',
    42,
    '{"index":187,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1387406,"filename":"187_the-new-testament-in-its-world-n-t-wright-michael-f-bird.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Notes"},{"index":4,"title":"Notes"},{"index":5,"title":"Notes"},{"index":6,"title":"Notes"},{"index":7,"title":"Notes"},{"index":8,"title":"Notes"},{"index":9,"title":"Notes"},{"index":10,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '188_the-new-unger-s-bible-handbook-merrill-f-unger',
    'The New Unger''s Bible Handbook – Merrill F. Unger',
    'Merrill F. Unger',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":188,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1429009,"filename":"188_the-new-unger-s-bible-handbook-merrill-f-unger.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Introduction"},{"index":4,"title":"Chapter 3. The coming of the Lord and practical Christian living"},{"index":5,"title":"Chapter 4-6 The discipline of the local pastor"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '189_the-old-testament-in-seven-sentences-christopher-j-h-wrigh',
    'The Old Testament in Seven Sentences – Christopher J. H. Wrigh',
    'Christopher J. H. Wrigh',
    'Độc lập / Tuyển tập chuyên khảo',
    11,
    '{"index":189,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":295267,"filename":"189_the-old-testament-in-seven-sentences-christopher-j-h-wrigh.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Notes"},{"index":4,"title":"CHAPTER 1: CREATION"},{"index":5,"title":"CHAPTER 2: ABRAHAM"},{"index":6,"title":"CHAPTER 3: EXODUS"},{"index":7,"title":"CHAPTER 4: DAVID"},{"index":8,"title":"CHAPTER 5: PROPHETS"},{"index":9,"title":"CHAPTER 6: GOSPEL"},{"index":10,"title":"CHAPTER 7: PSALMS AND WISDOM"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '190_the-oxford-bible-commentary-the-gospels',
    'The Oxford Bible Commentary - The Gospels',
    '',
    'Oxford Reference Collection',
    5,
    '{"index":190,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1425559,"filename":"190_the-oxford-bible-commentary-the-gospels.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '191_the-oxford-bible-commentary-the-pauline-epistles',
    'The Oxford Bible Commentary - The Pauline Epistles',
    '',
    'Oxford Reference Collection',
    12,
    '{"index":191,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1401881,"filename":"191_the-oxford-bible-commentary-the-pauline-epistles.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"INTRODUCTION"},{"index":9,"title":"INTRODUCTION"},{"index":10,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '192_the-oxford-bible-commentary-the-pentateuch',
    'The Oxford Bible Commentary - The Pentateuch',
    '',
    'Oxford Reference Collection',
    6,
    '{"index":192,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1140314,"filename":"192_the-oxford-bible-commentary-the-pentateuch.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '193_the-oxford-guide-to-people-places-of-the-bible-bruce-m-metzger-michael-d-coogan',
    'The Oxford Guide to People & Places of the Bible – Bruce M. Metzger, Michael D. Coogan',
    'Bruce M. Metzger, Michael D. Coogan',
    'Oxford Reference Collection',
    3,
    '{"index":193,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1142779,"filename":"193_the-oxford-guide-to-people-places-of-the-bible-bruce-m-metzger-michael-d-coogan.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '194_the-popular-dictionary-of-bible-prophecy-ron-rhodes',
    'The Popular Dictionary of Bible Prophecy – Ron Rhodes',
    'Ron Rhodes',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":194,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":597738,"filename":"194_the-popular-dictionary-of-bible-prophecy-ron-rhodes.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '195_the-popular-encyclopedia-of-bible-prophecy-tim-lahaye-ed-hindson',
    'The Popular Encyclopedia of Bible Prophecy – Tim LaHaye, Ed Hindson',
    'Tim LaHaye, Ed Hindson',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":195,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1543020,"filename":"195_the-popular-encyclopedia-of-bible-prophecy-tim-lahaye-ed-hindson.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"Chapter 12 shows the Lord Jesus would be manifest in weakness until He comes to establish His kingdom (verse 20). This passage also anticipates Gentile salvation (verse 21)."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '196_the-prodigal-god-timothy-keller',
    'The Prodigal God – Timothy Keller',
    'Timothy Keller',
    'Độc lập / Tuyển tập chuyên khảo',
    2,
    '{"index":196,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":145139,"filename":"196_the-prodigal-god-timothy-keller.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '197_the-quicknotes-dictionary-of-bible-names-pamela-l-mcquade',
    'The QuickNotes Dictionary of Bible Names – Pamela L. McQuade',
    'Pamela L. McQuade',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":197,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":404786,"filename":"197_the-quicknotes-dictionary-of-bible-names-pamela-l-mcquade.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '198_the-quicknotes-dictionary-of-bible-places-pamela-l-mcquade',
    'The QuickNotes Dictionary of Bible Places – Pamela L. McQuade',
    'Pamela L. McQuade',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":198,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":443593,"filename":"198_the-quicknotes-dictionary-of-bible-places-pamela-l-mcquade.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '199_the-quicknotes-bible-dictionary-george-w-knight-rayburn-w-ray',
    'The Quicknotes Bible Dictionary – George W. Knight, Rayburn W. Ray',
    'George W. Knight, Rayburn W. Ray',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":199,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":632526,"filename":"199_the-quicknotes-bible-dictionary-george-w-knight-rayburn-w-ray.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '200_the-second-coming-john-macarthur-arthur-w-pink',
    'The Second Coming – John MacArthur, Arthur W. Pink',
    'John MacArthur, Arthur W. Pink',
    'Độc lập / Tuyển tập chuyên khảo',
    13,
    '{"index":200,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":443674,"filename":"200_the-second-coming-john-macarthur-arthur-w-pink.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"EPILOGUE"},{"index":5,"title":"APPENDIX"},{"index":6,"title":"Introduction"},{"index":7,"title":"Chapter 1: Why Christ Must Return"},{"index":8,"title":"Chapter 3: Christ’s Greatest Prophetic Discourse"},{"index":9,"title":"Chapter 4: Birth Pangs"},{"index":10,"title":"Chapter 6: Signs in the Sky"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '201_the-seven-churches-of-asia-minor-dr-orville-sr-r-beckford',
    'The Seven Churches of Asia Minor – Dr. Orville Sr. R Beckford',
    'Dr. Orville Sr. R Beckford',
    'Độc lập / Tuyển tập chuyên khảo',
    17,
    '{"index":201,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":360159,"filename":"201_the-seven-churches-of-asia-minor-dr-orville-sr-r-beckford.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Conclusion"},{"index":4,"title":"Introduction"},{"index":5,"title":"The Seven Churches’ Geographical Location"},{"index":6,"title":"The Revelation of Jesus Christ"},{"index":7,"title":"Ephesus"},{"index":8,"title":"Chapter 1:4ff makes clear that God had chosen the people before the foundation of the world, and made known the mystery of his will. After they believed, they were sealed with the Holy Spirit of promise. In chapter 2, they were reminded that God had"},{"index":9,"title":"The Church of Ephesus"},{"index":10,"title":"The Church of Smyrna"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '202_the-seven-churches-of-revelation-david-cloud',
    'The Seven Churches of Revelation – David Cloud',
    'David Cloud',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":202,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":236755,"filename":"202_the-seven-churches-of-revelation-david-cloud.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '203_the-seven-churches-of-revelation-larry-b-patton-th-d',
    'The Seven Churches of Revelation – Larry B. Patton TH.D',
    'Larry B. Patton TH.D',
    'Độc lập / Tuyển tập chuyên khảo',
    15,
    '{"index":203,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":171071,"filename":"203_the-seven-churches-of-revelation-larry-b-patton-th-d.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"EPILOGUE"},{"index":3,"title":"NOTES"},{"index":4,"title":"Prologue"},{"index":5,"title":"John’s Salutation to the Seven Churches"},{"index":6,"title":"John: Banished—Seeing—Commissioned"},{"index":7,"title":"Ephesus: The Loveless Church"},{"index":8,"title":"Smyrna: The Poor, Rich Church"},{"index":9,"title":"Pergamum: The Worldly Church"},{"index":10,"title":"Thyatira: Jezebel’s Church"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '204_the-tabernacle-of-moses-dr-brian-j-bailey',
    'The Tabernacle of Moses – Dr. Brian J. Bailey',
    'Dr. Brian J. Bailey',
    'Độc lập / Tuyển tập chuyên khảo',
    8,
    '{"index":204,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":149620,"filename":"204_the-tabernacle-of-moses-dr-brian-j-bailey.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"CONCLUSION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"CONCLUSION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"EPILOGUE"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '205_the-time-between-the-old-and-new-testament-henry-h-halley',
    'The Time Between the Old and New Testament – Henry H. Halley',
    'Henry H. Halley',
    'Độc lập / Tuyển tập chuyên khảo',
    1,
    '{"index":205,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":36708,"filename":"205_the-time-between-the-old-and-new-testament-henry-h-halley.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '206_the-tony-evans-bible-commentary-tony-evans',
    'The Tony Evans Bible Commentary – Tony Evans',
    'Tony Evans',
    'Độc lập / Tuyển tập chuyên khảo',
    34,
    '{"index":206,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2667479,"filename":"206_the-tony-evans-bible-commentary-tony-evans.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"INTRODUCTION"},{"index":8,"title":"Lord, refused to take the promised land, and were banished to the wilderness for forty"},{"index":9,"title":"INTRODUCTION"},{"index":10,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '207_the-wycliffe-bible-commentary-charles-f-pfeiffer-everett-f-harrison',
    'The Wycliffe Bible Commentary – Charles F. Pfeiffer, Everett F. Harrison',
    'Charles F. Pfeiffer, Everett F. Harrison',
    'Độc lập / Tuyển tập chuyên khảo',
    19,
    '{"index":207,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2423707,"filename":"207_the-wycliffe-bible-commentary-charles-f-pfeiffer-everett-f-harrison.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"Chapter 34 is a description of the ideal borders of the future homeland. Israel did not attain these borders until the time of David and Solomon. Even then they made some of their gains by means of treaty rather than by conquest. The actual dividing of the land into inheritances was to be done, God said, under the supervision of Joshua and Eleazar the priest, with the help of one prince from each tribe."},{"index":8,"title":"INTRODUCTION"},{"index":9,"title":"INTRODUCTION"},{"index":10,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '208_theological-bible-commentary-gail-r-o-day-david-l-petersen',
    'Theological Bible Commentary – Gail R. O''Day, David L. Petersen',
    'Gail R. O''Day, David L. Petersen',
    'Độc lập / Tuyển tập chuyên khảo',
    87,
    '{"index":208,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1613051,"filename":"208_theological-bible-commentary-gail-r-o-day-david-l-petersen.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"INTRODUCTION"},{"index":6,"title":"INTRODUCTION"},{"index":7,"title":"The Priestly Ministry"},{"index":8,"title":"Chapter 11 addresses two primary issues: What is considered a clean and edible animal and what is the nature of the impurity generated through contact with an unclean animal corpse? Edible land animals must chew the cud and have true hoofs, characteristics of the domestic animals suitable for sacrifice (cattle, sheep, and goats). Fish, the water animals, must have fins and scales to be edible. Inedible birds, the flying air animals, are identified in a list (probably carrion birds). These three sets of animals reflect the categories of creation identified in Gen. 1:1–2:4a: land, water, and air. Creation theology provides the context for the purity/impurity rulings on edible and inedible foods. Finally, winged swarming things that walk on all fours are forbidden unless they have jointed legs above the feet and leap on the ground, and animals that swarm on the earth are prohibited."},{"index":9,"title":"Conflict, Conversation, and the Divine Will"},{"index":10,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '209_theology-of-work-bible-commentary-theology-of-work-project',
    'Theology of Work Bible Commentary – Theology of Work Project',
    'Theology of Work Project',
    'Độc lập / Tuyển tập chuyên khảo',
    9,
    '{"index":209,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":2117576,"filename":"209_theology-of-work-bible-commentary-theology-of-work-project.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Chapter 30 of Numbers gives an elaborate system for determining the validity of"},{"index":4,"title":"Chapter 6 contains a well-known list of seven things God hates. Two of the seven"},{"index":5,"title":"Chapter 2 of Daniel introduces the vision that God will overthrow pagan kingdoms"},{"index":6,"title":"of the Babylonian empire. Babylon’s extravagance had few parallels in the ancient"},{"index":7,"title":"Chapter 6 revisits a theme first introduced in chapter 3—that faithful witnesses to God experience both suffering and reward even while the pagan kingdom persists. Chapter 6 narrates a conspiratorial threat to Daniel’s life, set in the reign of the Persian monarch Darius the Great (522–486 BC). Daniel’s competence merited his promotion to ruler over all the new empire, subservient only to the king himself (Dan. 6:3). But his rivals contrived a plan that exploited the only vulnerability the man had—Daniel’s daily habit of prayer to his God. Darius was duped by the conspirators into decreeing a ban for thirty days on all religious expression except for prayer directed to the king. The penalty was death in the lions’ den. To his great distress, Darius could not rescind the order since, according to tradition, “the law of the Medes and the Persians . . . cannot be revoked” (Dan. 6:8). Darius, although the most powerful man of his day, tied his own hands, making it impossible to rescue his favored administrator. The king conceded to Daniel, “May your God, whom you faithfully serve, deliver you!” (Dan. 6:16). And the Lord’s angel performed what the king asked but could not perform. Daniel was thrown in the lions’ den overnight but emerged in the morning unwounded (Dan. 6:17–23). This led the king to issue an edict of reverence for Daniel’s God and to remove the threat of annihilation for the Jews as they continued to worship God (Dan. 6:26–27). Not even the implacable laws of the Medes and Persians could ensure the end of God’s people. God’s power overcame human deceit and royal dictate."},{"index":8,"title":"Chapter 7 brings us back to the first theme in the book of Daniel—that God will"},{"index":9,"title":"Chapter 16 of Romans belies many people’s common assumptions about the nature"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '210_understanding-and-applying-the-bible-robertson-mcquilkin',
    'Understanding and Applying the Bible – Robertson McQuilkin',
    'Robertson McQuilkin',
    'Độc lập / Tuyển tập chuyên khảo',
    18,
    '{"index":210,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":577338,"filename":"210_understanding-and-applying-the-bible-robertson-mcquilkin.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"PART TWO Guidelines  and Skills"},{"index":4,"title":"Notes"},{"index":5,"title":"Introduction"},{"index":6,"title":"Introduction"},{"index":7,"title":"Chapter 1: Presuppositions of Biblical Interpretation"},{"index":8,"title":"Chapter 2: Supernaturalistic Approaches of Premoderns"},{"index":9,"title":"Chapter 4: The Naturalistic Approaches of Postmoderns"},{"index":10,"title":"Chapter 6: Basic Principles for Understanding the Bible"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '211_understanding-the-seven-churches-of-revelation-jonathan-welton',
    'Understanding the Seven Churches of Revelation – Jonathan Welton',
    'Jonathan Welton',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":211,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":275665,"filename":"211_understanding-the-seven-churches-of-revelation-jonathan-welton.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '212_vine-s-complete-expository-dictionary-of-old-and-new-testament-words-w-e-vine-me',
    'Vine''s Complete Expository Dictionary of Old and New Testament Words – W. E. Vine, Merrill F. Unger',
    'W. E. Vine, Merrill F. Unger',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":212,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":1576521,"filename":"212_vine-s-complete-expository-dictionary-of-old-and-new-testament-words-w-e-vine-me.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '213_walking-wisely-charles-f-stanley',
    'Walking Wisely – Charles F. Stanley',
    'Charles F. Stanley',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":213,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":316656,"filename":"213_walking-wisely-charles-f-stanley.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"CONCLUSION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '214_what-christ-thinks-of-the-church-john-stott',
    'What Christ Thinks of the Church – John Stott',
    'John Stott',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":214,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":238256,"filename":"214_what-christ-thinks-of-the-church-john-stott.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"Introduction"},{"index":5,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '215_what-does-the-bible-really-teach-about-homosexuality-kevin-deyoung',
    'What Does the Bible Really Teach about Homosexuality – Kevin DeYoung',
    'Kevin DeYoung',
    'Độc lập / Tuyển tập chuyên khảo',
    4,
    '{"index":215,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":244888,"filename":"215_what-does-the-bible-really-teach-about-homosexuality-kevin-deyoung.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"Introduction"},{"index":4,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '216_what-the-bible-is-all-about-dr-henrietta-c-mears',
    'What the Bible Is All About – Dr. Henrietta C. Mears',
    'Dr. Henrietta C. Mears',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":216,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":1252210,"filename":"216_what-the-bible-is-all-about-dr-henrietta-c-mears.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Chapter 12 gives us the prophecy of the siege of Jerusalem by the Antichrist and his armies in the last days. Then we see the repentance of the Jews when they see “the one they have pierced” (Zechariah 12:10). “A fountain will be opened to the house of David and the inhabitants of Jerusalem, to cleanse them from sin and impurity”"},{"index":5,"title":"Chapter 3 opens at the Beautiful Gate of the Temple. Peter healed a cripple considered incurable, a man who was lame from birth and who had been carried daily to this place to beg for his living. The miracle attracted the notice of the Jewish leaders and resulted in the first real opposition to the Church."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '217_what-s-next-ai-the-antichrist-jimmy-evans-mark-hitchcock',
    'What’s Next, AI & The Antichrist – Jimmy Evans, Mark Hitchcock',
    'Jimmy Evans, Mark Hitchcock',
    'Độc lập / Tuyển tập chuyên khảo',
    3,
    '{"index":217,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":232364,"filename":"217_what-s-next-ai-the-antichrist-jimmy-evans-mark-hitchcock.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '218_why-believe-the-bible-john-macarthur',
    'Why Believe the Bible – John MacArthur',
    'John MacArthur',
    'Độc lập / Tuyển tập chuyên khảo',
    30,
    '{"index":218,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":299057,"filename":"218_why-believe-the-bible-john-macarthur.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Can We Add to God’s Word?"},{"index":4,"title":"God’s Word: The Ultimate Weapon"},{"index":5,"title":"What Does God’s Word Mean ?"},{"index":6,"title":"WHAT DOES GOD’S WORD MEAN TO US?"},{"index":7,"title":"WHO CAN PROVE GOD’S WORD IS TRUE?"},{"index":8,"title":"HOW DID GOD INSPIRE HIS WORD?"},{"index":9,"title":"WHAT DID JESUS THINK OF GOD’S WORD?"},{"index":10,"title":"CAN WE ADD TO GOD’S WORD?"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '219_wiersbe-s-be-series-01-be-basic-genesis-1-11-warren-w-wiersbe',
    'Wiersbe’s BE Series - 01. BE Basic (Genesis 1-11) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":219,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":293717,"filename":"219_wiersbe-s-be-series-01-be-basic-genesis-1-11-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"BC: Before Creation"},{"index":5,"title":"When God Speaks, Something Happens"},{"index":6,"title":"First Things First"},{"index":7,"title":"This Is My Father’s World—or Is It?"},{"index":8,"title":"Perils in Paradise"},{"index":9,"title":"In Center Stage—Cain"},{"index":10,"title":"When the Outlook Is Bleak, Try the Uplook"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '220_wiersbe-s-be-series-02-be-obedient-genesis-12-24-warren-w-wiersbe',
    'Wiersbe’s BE Series - 02. BE Obedient (Genesis 12-24) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":220,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":242583,"filename":"220_wiersbe-s-be-series-02-be-obedient-genesis-12-24-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"A New Beginning"},{"index":5,"title":"Famines, Flocks, and Fights"},{"index":6,"title":"Faith Is the Victory"},{"index":7,"title":"The Dark Night of the Soul"},{"index":8,"title":"Beware of Detours!"},{"index":9,"title":"What’s in a Name?"},{"index":10,"title":"So As by Fire"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '221_wiersbe-s-be-series-03-be-authentic-genesis-25-50-warren-w-wiersbe',
    'Wiersbe’s BE Series - 03. BE Authentic (Genesis 25-50) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    28,
    '{"index":221,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":322882,"filename":"221_wiersbe-s-be-series-03-be-authentic-genesis-25-50-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"A Word From the Author"},{"index":3,"title":"Like Father, Like Son—Almost"},{"index":4,"title":"A Masterpiece in Pieces"},{"index":5,"title":"Disciplines and Decisions"},{"index":6,"title":"Catching Up with Yesterday"},{"index":7,"title":"You Can Go Home Again"},{"index":8,"title":"Enter the Hero"},{"index":9,"title":"The Lord Makes the Difference"},{"index":10,"title":"When Dreams Come True"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '222_wiersbe-s-be-series-04-be-delivered-exodus-warren-w-wiersbe',
    'Wiersbe’s BE Series - 04. BE Delivered (Exodus) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":222,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":362852,"filename":"222_wiersbe-s-be-series-04-be-delivered-exodus-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Wanted: A Deliverer"},{"index":5,"title":"War Is Declared"},{"index":6,"title":"“The Lord, Mighty in Battle”"},{"index":7,"title":"One More Plague"},{"index":8,"title":"Redeemed and Rejoicing"},{"index":9,"title":"The School of Life"},{"index":10,"title":"“The Lord of Hosts Is with Us”"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '223_wiersbe-s-be-series-05-be-holy-leviticus-warren-w-wiersbe',
    'Wiersbe’s BE Series - 05. BE Holy (Leviticus) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":223,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":296847,"filename":"223_wiersbe-s-be-series-05-be-holy-leviticus-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"The Most Important Thing in the World"},{"index":5,"title":"The Sacrifices and the Savior"},{"index":6,"title":"A Kingdom of Priests"},{"index":7,"title":"Cleanliness and Godliness"},{"index":8,"title":"The Great Physician"},{"index":9,"title":"Israel’s High and Holy Day"},{"index":10,"title":"Holiness Is a Practical Thing"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '224_wiersbe-s-be-series-06-be-counted-numbers-warren-w-wiersbe',
    'Wiersbe’s BE Series - 06. BE Counted (Numbers) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    28,
    '{"index":224,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":315136,"filename":"224_wiersbe-s-be-series-06-be-counted-numbers-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Order in the Camp"},{"index":5,"title":"Dedication and Celebration—Part I"},{"index":6,"title":"Dedication and Celebration—Part II"},{"index":7,"title":"Marching to Moab"},{"index":8,"title":"Crisis at Kadesh"},{"index":9,"title":"A Question of Authority"},{"index":10,"title":"Another Crisis at Kadesh"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '225_wiersbe-s-be-series-07-be-equipped-deuteronomy-warren-w-wiersbe',
    'Wiersbe’s BE Series - 07. BE Equipped (Deuteronomy) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":225,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":441296,"filename":"225_wiersbe-s-be-series-07-be-equipped-deuteronomy-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Catching Up on the Past"},{"index":5,"title":"The God We Worship"},{"index":6,"title":"The Secrets of Obedience"},{"index":7,"title":"See What You Are"},{"index":8,"title":"Worship Him in Truth"},{"index":9,"title":"Food and Festivals"},{"index":10,"title":"Judges, Kings, Priests, and Ordinary People"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '226_wiersbe-s-be-series-08-be-strong-joshua-warren-w-wiersbe',
    'Wiersbe’s BE Series - 08. BE Strong (Joshua) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    20,
    '{"index":226,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":305545,"filename":"226_wiersbe-s-be-series-08-be-strong-joshua-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"A New Beginning Introduction to the Book of Joshua"},{"index":5,"title":"Follow the Leader"},{"index":6,"title":"A Convert in Canaan"},{"index":7,"title":"Forward by Faith"},{"index":8,"title":"Preparing for Victory"},{"index":9,"title":"The Conquest Begins!"},{"index":10,"title":"Defeat in the Land of Victory"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '227_wiersbe-s-be-series-09-be-available-judges-warren-w-wiersbe',
    'Wiersbe’s BE Series - 09. BE Available (Judges) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":227,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":305722,"filename":"227_wiersbe-s-be-series-09-be-available-judges-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"It Was the Worst of Times"},{"index":5,"title":"The Weapons of Our Warfare"},{"index":6,"title":"“Two Are Better Than One, and Three Are Better Still”"},{"index":7,"title":"God’s Man in Manasseh"},{"index":8,"title":"Faith Is the Victory"},{"index":9,"title":"Win the War, Lose the Victory"},{"index":10,"title":"My Kingdom Come"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '228_wiersbe-s-be-series-10-be-committed-ruth-esther-warren-w-wiersbe',
    'Wiersbe’s BE Series - 10. BE Committed (Ruth, Esther) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    1,
    '{"index":228,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":271272,"filename":"228_wiersbe-s-be-series-10-be-committed-ruth-esther-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '229_wiersbe-s-be-series-11-be-successful-1-samuel-warren-w-wiersbe',
    'Wiersbe’s BE Series - 11. BE Successful (1 Samuel) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":229,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":357931,"filename":"229_wiersbe-s-be-series-11-be-successful-1-samuel-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"“The Lord of Hosts Is with Us”"},{"index":5,"title":"Israel’s Defeat—God’s Victory"},{"index":6,"title":"The Call for a King"},{"index":7,"title":"Reviewing and Rebuking"},{"index":8,"title":"A Foolish Vow and a Lame Excuse"},{"index":9,"title":"God Chooses a King"},{"index":10,"title":"A Jealous King"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '230_wiersbe-s-be-series-12-be-restored-2-samuel-warren-w-wiersbe',
    'Wiersbe’s BE Series - 12. BE Restored (2 Samuel) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":230,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":367786,"filename":"230_wiersbe-s-be-series-12-be-restored-2-samuel-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"David, King of Judah"},{"index":5,"title":"David Watches and Waits"},{"index":6,"title":"David, King of Israel"},{"index":7,"title":"David’s Dynasty, Kindness, and Conquests"},{"index":8,"title":"David’s Disobedience, Deception, and Discipline"},{"index":9,"title":"David’s Unruly Sons"},{"index":10,"title":"David’s Escape to the Wilderness"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '231_wiersbe-s-be-series-13-be-responsible-1-kings-warren-w-wiersbe',
    'Wiersbe’s BE Series - 13. BE Responsible (1 Kings) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    28,
    '{"index":231,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":381711,"filename":"231_wiersbe-s-be-series-13-be-responsible-1-kings-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Sunset and Sunrise"},{"index":5,"title":"Wisdom from Above"},{"index":6,"title":"Fulfilling David’s Dream"},{"index":7,"title":"God’s House and Solomon’s Heart"},{"index":8,"title":"The Kingdom, Power, and Glory"},{"index":9,"title":"The Foolish Wise Man"},{"index":10,"title":"He Would Not Listen"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '232_wiersbe-s-be-series-14-be-distinct-2-kings-2-chronicles-warren-w-wiersbe',
    'Wiersbe’s BE Series - 14. BE Distinct (2 Kings, 2 Chronicles) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    30,
    '{"index":232,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":367499,"filename":"232_wiersbe-s-be-series-14-be-distinct-2-kings-2-chronicles-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"The Parting of the Ways"},{"index":5,"title":"Amazing Grace"},{"index":6,"title":"Three Men—Three Miracles"},{"index":7,"title":"The Battle Is the Lord’s"},{"index":8,"title":"Reaping the Harvest of Sin"},{"index":9,"title":"The Sword and the Crown"},{"index":10,"title":"Focusing on Faith"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '233_wiersbe-s-be-series-15-be-determined-nehemiah-warren-w-wiersbe',
    'Wiersbe’s BE Series - 15. BE Determined (Nehemiah) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":233,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":269978,"filename":"233_wiersbe-s-be-series-15-be-determined-nehemiah-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"D A R C?"},{"index":4,"title":"T M S  M"},{"index":5,"title":"W--W W"},{"index":6,"title":"W  W"},{"index":7,"title":"S! T!"},{"index":8,"title":"W H H  E,  H I  L"},{"index":9,"title":"“V” I  V"},{"index":10,"title":"T P   B"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '234_wiersbe-s-be-series-16-be-patient-job-warren-w-wiersb',
    'Wiersbe’s BE Series - 16. BE Patient (Job) – Warren W. Wiersb',
    'Warren W. Wiersb',
    'Warren Wiersbe''s Be Series',
    16,
    '{"index":234,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":274131,"filename":"234_wiersbe-s-be-series-16-be-patient-job-warren-w-wiersb.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"The Drama Begins"},{"index":5,"title":"Discussion Begins"},{"index":6,"title":"The Discussion Continues"},{"index":7,"title":"An Angry “Younger” Man"},{"index":8,"title":"Discussion Turns into Dispute"},{"index":9,"title":"Will the Real Enemy Please Stand Up?"},{"index":10,"title":"It All Depends on Your Point of View"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '235_wiersbe-s-be-series-17-be-worshipful-psalm-1-89-warren-w-wiersbe',
    'Wiersbe’s BE Series - 17. BE Worshipful (Psalm 1-89) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    7,
    '{"index":235,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":621404,"filename":"235_wiersbe-s-be-series-17-be-worshipful-psalm-1-89-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Book I"},{"index":5,"title":"Book II"},{"index":6,"title":"Book III"},{"index":7,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '236_wiersbe-s-be-series-18-be-exultant-psalm-90-150-warren-w-wiersbe',
    'Wiersbe’s BE Series - 18. BE Exultant (Psalm 90-150) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    6,
    '{"index":236,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":490675,"filename":"236_wiersbe-s-be-series-18-be-exultant-psalm-90-150-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Book IV"},{"index":5,"title":"Book V"},{"index":6,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '237_wiersbe-s-be-series-19-be-skillful-proverbs-warren-w-wiersbe',
    'Wiersbe’s BE Series - 19. BE Skillful (Proverbs) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":237,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":328842,"filename":"237_wiersbe-s-be-series-19-be-skillful-proverbs-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Don’t Just Make a Living, Make a Life!"},{"index":5,"title":"Is Anybody Listening?"},{"index":6,"title":"The Path of Wisdom and Life"},{"index":7,"title":"The Path of Folly and Death"},{"index":8,"title":"People, Wise and Otherwise—Part I"},{"index":9,"title":"People, Wise and Otherwise—Part II"},{"index":10,"title":"“Rich Man, Poor Man, Beggar Man, Thief” ."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '238_wiersbe-s-be-series-20-be-satisfied-ecclesiastes-warren-w-wiersbe',
    'Wiersbe’s BE Series - 20. BE Satisfied (Ecclesiastes) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":238,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":233167,"filename":"238_wiersbe-s-be-series-20-be-satisfied-ecclesiastes-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Is Life Worth Living?"},{"index":5,"title":"Living in Circles"},{"index":6,"title":"Disgusted with Life?"},{"index":7,"title":"Time and Toil"},{"index":8,"title":"Life Just Isn’t Fair"},{"index":9,"title":"Stop, Thief!"},{"index":10,"title":"Is Life a Dead-End Street?"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '239_wiersbe-s-be-series-21-be-comforted-isaiah-warren-w-wiersbe',
    'Wiersbe’s BE Series - 21. BE Comforted (Isaiah) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    16,
    '{"index":239,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":303695,"filename":"239_wiersbe-s-be-series-21-be-comforted-isaiah-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"The Lord Is Salvation"},{"index":5,"title":"Wanted: A Prophet"},{"index":6,"title":"God Is with Us!"},{"index":7,"title":"The Burdened Prophet"},{"index":8,"title":"A Refuge from the Storm"},{"index":9,"title":"Storm Clouds Over Jerusalem"},{"index":10,"title":"Future Shock and Future Glory"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '240_wiersbe-s-be-series-22-be-decisive-jeremiah-warren-w-wiersbe',
    'Wiersbe’s BE Series - 22. BE Decisive (Jeremiah) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":240,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":370466,"filename":"240_wiersbe-s-be-series-22-be-decisive-jeremiah-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"The Reluctant Prophet"},{"index":5,"title":"The Prophet Preaches"},{"index":6,"title":"The Voice in the Temple"},{"index":7,"title":"Voting with God"},{"index":8,"title":"Sermons, Supplications, and Sobs"},{"index":9,"title":"The Prophet, the Potter, and the Policeman"},{"index":10,"title":"Kings on Parade"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '241_wiersbe-s-be-series-23-be-reverent-ezekiel-warren-w-wiersbe',
    'Wiersbe’s BE Series - 23. BE Reverent (Ezekiel) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    29,
    '{"index":241,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":427818,"filename":"241_wiersbe-s-be-series-23-be-reverent-ezekiel-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"From Priest to Prophet"},{"index":5,"title":"The Death of a Great City"},{"index":6,"title":"The Glory Has Departed"},{"index":7,"title":"The Truth about the False"},{"index":8,"title":"Pictures of Failure"},{"index":9,"title":"God Is Just!"},{"index":10,"title":"See the Sinful City!"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '242_wiersbe-s-be-series-24-be-resolute-daniel-warren-w-wiersbe',
    'Wiersbe’s BE Series - 24. BE Resolute (Daniel) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    28,
    '{"index":242,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":314705,"filename":"242_wiersbe-s-be-series-24-be-resolute-daniel-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Chapter 6 Daniel in the lions’ den."},{"index":3,"title":"G R  O"},{"index":4,"title":"T G  D  D"},{"index":5,"title":"F   F T"},{"index":6,"title":"L  H W"},{"index":7,"title":"N, W,  R"},{"index":8,"title":"L, L,  L"},{"index":9,"title":"“T K C”"},{"index":10,"title":"B, A,   E T"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '243_wiersbe-s-be-series-25-be-concerned-amos-obadiah-micah-zephaniah-warren-w-wiersb',
    'Wiersbe’s BE Series - 25. BE Concerned (Amos, Obadiah, Micah, Zephaniah) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    18,
    '{"index":243,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":270661,"filename":"243_wiersbe-s-be-series-25-be-concerned-amos-obadiah-micah-zephaniah-warren-w-wiersb.json","outline_sample":[{"index":1,"title":"CONTENTS"},{"index":2,"title":"A WORD FROM THE AUTHOR"},{"index":3,"title":"NOTES"},{"index":4,"title":"NOTES"},{"index":5,"title":"S  G S"},{"index":6,"title":"NOTES"},{"index":7,"title":"NOTES"},{"index":8,"title":"NOTES"},{"index":9,"title":"NOTES"},{"index":10,"title":"NOTES"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '244_wiersbe-s-be-series-26-be-heroic-ezra-haggai-zechariah-warren-w-wiersbe',
    'Wiersbe’s BE Series - 26. BE Heroic (Ezra, Haggai, Zechariah) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    30,
    '{"index":244,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":308706,"filename":"244_wiersbe-s-be-series-26-be-heroic-ezra-haggai-zechariah-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"The Providence of God"},{"index":5,"title":"The Faithfulness of God"},{"index":6,"title":"The Good Hand of God"},{"index":7,"title":"The Grace of God"},{"index":8,"title":"Stirring Up God’s People"},{"index":9,"title":"Keeping the Work Alive"},{"index":10,"title":"God and His People"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '245_wiersbe-s-be-series-28-be-loyal-matthew-warren-w-wiersbe',
    'Wiersbe’s BE Series - 28. BE Loyal (Matthew) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    2,
    '{"index":245,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":473977,"filename":"245_wiersbe-s-be-series-28-be-loyal-matthew-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"T K’ P: T R"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '246_wiersbe-s-be-series-29-be-diligent-mark-warren-w-wiersbe',
    'Wiersbe’s BE Series - 29. BE Diligent (Mark) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":246,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":294356,"filename":"246_wiersbe-s-be-series-29-be-diligent-mark-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"God’s Servant Is Here!"},{"index":5,"title":"What the Servant Offers You"},{"index":6,"title":"The Servant, the Crowds, and the Kingdom"},{"index":7,"title":"The Servant Conquers!"},{"index":8,"title":"Will Anyone Trust God’s Servant?"},{"index":9,"title":"The Servant-Teacher"},{"index":10,"title":"The Servant’s Secrets"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '247_wiersbe-s-be-series-30-be-compassionate-luke-1-13-warren-w-wiersbe',
    'Wiersbe’s BE Series - 30. BE Compassionate (Luke 1-13) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":247,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":288368,"filename":"247_wiersbe-s-be-series-30-be-compassionate-luke-1-13-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Hear the Good News!"},{"index":5,"title":"The Lord Is Come!"},{"index":6,"title":"This Is the Son of God!"},{"index":7,"title":"The Difference Jesus Makes"},{"index":8,"title":"So What’s New? Everything!"},{"index":9,"title":"Compassion in Action"},{"index":10,"title":"Lessons about Faith"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '248_wiersbe-s-be-series-31-be-courageous-luke-14-24-warren-w-wiersbe',
    'Wiersbe’s BE Series - 31. BE Courageous (Luke 14-24) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":248,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":262715,"filename":"248_wiersbe-s-be-series-31-be-courageous-luke-14-24-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"The Man Who Came to Dinner"},{"index":5,"title":"The Joys of Salvation"},{"index":6,"title":"The Right and Wrong of Riches"},{"index":7,"title":"Things That Really Matter"},{"index":8,"title":"People to Meet, Lessons to Learn"},{"index":9,"title":"Jerusalem at Last!"},{"index":10,"title":"Issues and Answers"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '249_wiersbe-s-be-series-32-be-alive-john-1-12-warren-w-wiersbe',
    'Wiersbe’s BE Series - 32. BE Alive (John 1-12) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":249,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":297681,"filename":"249_wiersbe-s-be-series-32-be-alive-john-1-12-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"God Is Here!"},{"index":5,"title":"Learning about Jesus"},{"index":6,"title":"A Matter of Life and Death"},{"index":7,"title":"The Bad Samaritan"},{"index":8,"title":"The Man Who Was Equal with God"},{"index":9,"title":"Jesus Loses His Crowd"},{"index":10,"title":"Feast Fight"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '250_wiersbe-s-be-series-33-be-transformed-john-13-21-warren-w-wiersbe',
    'Wiersbe’s BE Series - 33. BE Transformed (John 13-21) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":250,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":278467,"filename":"250_wiersbe-s-be-series-33-be-transformed-john-13-21-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"The Sovereign Servant"},{"index":5,"title":"Heart Trouble"},{"index":6,"title":"Relationships and Responsibilities"},{"index":7,"title":"What in the World Is the Spirit Doing?"},{"index":8,"title":"Let There Be Joy!"},{"index":9,"title":"The Prayer of the Overcomer"},{"index":10,"title":"Guilt and Grace in the Garden"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '251_wiersbe-s-be-series-34-be-dynamic-acts-1-12-warren-w-wiersbe',
    'Wiersbe’s BE Series - 34. BE Dynamic (Acts 1-12) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    5,
    '{"index":251,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":269619,"filename":"251_wiersbe-s-be-series-34-be-dynamic-acts-1-12-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"T F   F C"},{"index":4,"title":"T  C"},{"index":5,"title":"Chapter 10 is pivotal in the book of Acts, for it records the salvation of the Gentiles. We see Peter using “the keys of the kingdom” for the third and last time. He had opened the door of faith for the Jews (Acts 2) and also for the Samaritans (Acts 8), and now he would be used of God to bring the Gentiles into the church (see Gal. 3:27–28; Eph. 2:11–22)."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '252_wiersbe-s-be-series-35-be-daring-acts-13-28-warren-w-wiersbe',
    'Wiersbe’s BE Series - 35. BE Daring (Acts 13-28) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    14,
    '{"index":252,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":281988,"filename":"252_wiersbe-s-be-series-35-be-daring-acts-13-28-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"G O  D"},{"index":4,"title":"D’ C  D!"},{"index":5,"title":"M O D"},{"index":6,"title":"R  G’ W"},{"index":7,"title":"I’ A T S  Q"},{"index":8,"title":"E  E"},{"index":9,"title":"A M’ F"},{"index":10,"title":"T M M"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '253_wiersbe-s-be-series-36-be-right-romans-warren-w-wiersbe',
    'Wiersbe’s BE Series - 36. BE Right (Romans) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    16,
    '{"index":253,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":263298,"filename":"253_wiersbe-s-be-series-36-be-right-romans-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Ready for Rome"},{"index":5,"title":"When God Gives Up"},{"index":6,"title":"Father Abraham"},{"index":7,"title":"Live Like a King!"},{"index":8,"title":"Dying to Live"},{"index":9,"title":"Christians and the Law"},{"index":10,"title":"Freedom and Fulfillment"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '254_wiersbe-s-be-series-37-be-wise-1-corinthians-warren-w-wiersbe',
    'Wiersbe’s BE Series - 37. BE Wise (1 Corinthians) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    16,
    '{"index":254,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":287568,"filename":"254_wiersbe-s-be-series-37-be-wise-1-corinthians-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Be Wise about the Christian’s Calling"},{"index":5,"title":"Be Wise about the Christian Message"},{"index":6,"title":"Be Wise about the Local Church"},{"index":7,"title":"Be Wise about the Christian Ministry"},{"index":8,"title":"Be Wise about Church Discipline"},{"index":9,"title":"Be Wise about Christian Marriage"},{"index":10,"title":"Be Wise about Christian Liberty"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '255_wiersbe-s-be-series-38-be-encouraged-2-corinthians-warren-w-wiersbe',
    'Wiersbe’s BE Series - 38. BE Encouraged (2 Corinthians) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":255,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":262679,"filename":"255_wiersbe-s-be-series-38-be-encouraged-2-corinthians-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Down—but Not Out!"},{"index":5,"title":"You Don’t Have to Fail!"},{"index":6,"title":"From Glory to Glory"},{"index":7,"title":"Courage for the Conflict"},{"index":8,"title":"Motives for Ministry"},{"index":9,"title":"Heart to Heart"},{"index":10,"title":"The Grace of Giving—Part 1"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '256_wiersbe-s-be-series-39-be-free-galatians-warren-w-wiersbe',
    'Wiersbe’s BE Series - 39. BE Free (Galatians) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":256,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":233419,"filename":"256_wiersbe-s-be-series-39-be-free-galatians-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Bad News about the Good News"},{"index":5,"title":"Born Free!"},{"index":6,"title":"The Freedom Fighter—Part 1"},{"index":7,"title":"The Freedom Fighter—Part 2"},{"index":8,"title":"Bewitched and Bothered"},{"index":9,"title":"The Logic of Law"},{"index":10,"title":"It’s Time to Grow Up!"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '257_wiersbe-s-be-series-40-be-rich-ephesians-warren-w-wiersbe',
    'Wiersbe’s BE Series - 40. BE Rich (Ephesians) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    16,
    '{"index":257,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":269293,"filename":"257_wiersbe-s-be-series-40-be-rich-ephesians-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Saints Alive!"},{"index":5,"title":"How Rich You Are!"},{"index":6,"title":"Read the Bankbook"},{"index":7,"title":"Get Out of the Graveyard"},{"index":8,"title":"The Great Peace Mission"},{"index":9,"title":"I Know a Secret"},{"index":10,"title":"Get Your Hands on Your Wealth"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '258_wiersbe-s-be-series-41-be-joyful-philippians-warren-w-wiersbe',
    'Wiersbe’s BE Series - 41. BE Joyful (Philippians) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    3,
    '{"index":258,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":205762,"filename":"258_wiersbe-s-be-series-41-be-joyful-philippians-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"WHAT SHOULD WE DO?"},{"index":3,"title":"A P P"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '259_wiersbe-s-be-series-42-be-complete-colossians-warren-w-wiersbe',
    'Wiersbe’s BE Series - 42. BE Complete (Colossians) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    13,
    '{"index":259,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":260986,"filename":"259_wiersbe-s-be-series-42-be-complete-colossians-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"F P,  L"},{"index":3,"title":"M  C"},{"index":4,"title":"A P’ P"},{"index":5,"title":"C H L  A!"},{"index":6,"title":"O M’ M"},{"index":7,"title":"S A—  A"},{"index":8,"title":"B, B!"},{"index":9,"title":"H  E"},{"index":10,"title":"A D U  S  G"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '260_wiersbe-s-be-series-43-be-ready-1-2-thessalonians-warren-w-wiersbe',
    'Wiersbe’s BE Series - 43. BE Ready (1 & 2 Thessalonians) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    16,
    '{"index":260,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":258816,"filename":"260_wiersbe-s-be-series-43-be-ready-1-2-thessalonians-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"A Church Is Born"},{"index":5,"title":"What Every Church Should Be"},{"index":6,"title":"Chapter 1 of 1 Thessalonians introduced us to Paul the evangelist. This chapter introduces us to Paul the pastor, for it explains how the great apostle cared for the new believers in the churches he founded. Paul considered “the care of all the churches” (2 Cor. 11:28) a greater burden than all the sufferings and difficulties he experienced in his ministry (2 Cor. 11:23ff.)."},{"index":7,"title":"Growing Pains"},{"index":8,"title":"Take a Stand!"},{"index":9,"title":"How to Please Your Father"},{"index":10,"title":"The Comfort of His Coming"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '261_wiersbe-s-be-series-44-be-faithful-1-2-timothy-titus-philemon-warren-w-wiersbe',
    'Wiersbe’s BE Series - 44. BE Faithful (1 & 2 Timothy, Titus, Philemon) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    16,
    '{"index":261,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":301804,"filename":"261_wiersbe-s-be-series-44-be-faithful-1-2-timothy-titus-philemon-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Stay on the Job"},{"index":5,"title":"Service—or Circus?"},{"index":6,"title":"Follow the Leaders"},{"index":7,"title":"How to Be a Man of God"},{"index":8,"title":"Order in the Church!"},{"index":9,"title":"Orders from Headquarters"},{"index":10,"title":"Our Man in Crete"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '262_wiersbe-s-be-series-45-be-confident-hebrews-warren-w-wiersbe',
    'Wiersbe’s BE Series - 45. BE Confident (Hebrews) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    16,
    '{"index":262,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":275724,"filename":"262_wiersbe-s-be-series-45-be-confident-hebrews-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Is Anybody Listening?"},{"index":5,"title":"Greater Than Angels"},{"index":6,"title":"Greater Than Moses"},{"index":7,"title":"Greater Than Aaron the High Priest"},{"index":8,"title":"Pilgrims Should Make Progress"},{"index":9,"title":"Mysterious Melchizedek"},{"index":10,"title":"Chapter 7 of Hebrews introduces the second main section, as we have outlined it: A Superior Priesthood (Heb. 7—10). In Hebrews 7, the writer argued that Christ’s priesthood, like Melchizedek’s, is superior in its order. In Hebrews 8, the emphasis is on Christ’s better covenant; in Hebrews 9, it is His better sanctuary; and Hebrews 10 concludes the section by arguing for Christ’s better sacrifice."}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '263_wiersbe-s-be-series-46-be-mature-james-warren-w-wiersbe',
    'Wiersbe’s BE Series - 46. BE Mature (James) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    14,
    '{"index":263,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":259653,"filename":"263_wiersbe-s-be-series-46-be-mature-james-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"T  G U"},{"index":3,"title":"T T  T"},{"index":4,"title":"H  H T"},{"index":5,"title":"Q K Y"},{"index":6,"title":"R M, P M"},{"index":7,"title":"F F"},{"index":8,"title":"T W’ S  L T"},{"index":9,"title":"W  G W"},{"index":10,"title":"H  E W"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '264_wiersbe-s-be-series-47-be-hopeful-1-peter-warren-w-wiersbe',
    'Wiersbe’s BE Series - 47. BE Hopeful (1 Peter) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":264,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":237021,"filename":"264_wiersbe-s-be-series-47-be-hopeful-1-peter-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Where There’s Christ, There’s Hope"},{"index":5,"title":"It’s Glory All the Way!"},{"index":6,"title":"Staying Clean in a Polluted World"},{"index":7,"title":"Christian Togetherness"},{"index":8,"title":"Somebody’s Watching You!"},{"index":9,"title":"Wedlock or Deadlock?"},{"index":10,"title":"Preparing for the Best!"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '265_wiersbe-s-be-series-48-be-alert-2-peter-2-3-john-jude-warren-w-wiersbe',
    'Wiersbe’s BE Series - 48. BE Alert (2 Peter, 2 & 3 John, Jude) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    15,
    '{"index":265,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":303069,"filename":"265_wiersbe-s-be-series-48-be-alert-2-peter-2-3-john-jude-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"A Word from the Author"},{"index":4,"title":"Knowing and Growing"},{"index":5,"title":"Wake Up and Remember!"},{"index":6,"title":"Beware of Counterfeits"},{"index":7,"title":"Marked Men"},{"index":8,"title":"False Freedom"},{"index":9,"title":"Scoffing at the Scoffers"},{"index":10,"title":"Be Diligent!"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '266_wiersbe-s-be-series-49-be-real-1-john-warren-w-wiersbe',
    'Wiersbe’s BE Series - 49. BE Real (1 John) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    12,
    '{"index":266,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":288464,"filename":"266_wiersbe-s-be-series-49-be-real-1-john-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"It’s Real!"},{"index":4,"title":"Walking and Talking"},{"index":5,"title":"Something Old, Something New"},{"index":6,"title":"The Love God Hates"},{"index":7,"title":"Truth or Consequences"},{"index":8,"title":"The Pretenders"},{"index":9,"title":"Love or Death"},{"index":10,"title":"Getting to the Bottom of Love"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '267_wiersbe-s-be-series-50-be-victorious-revelation-warren-w-wiersbe',
    'Wiersbe’s BE Series - 50. BE Victorious (Revelation) – Warren W. Wiersbe',
    'Warren W. Wiersbe',
    'Warren Wiersbe''s Be Series',
    14,
    '{"index":267,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":301305,"filename":"267_wiersbe-s-be-series-50-be-victorious-revelation-warren-w-wiersbe.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"A Word from the Author"},{"index":3,"title":"A V S B"},{"index":4,"title":"C   C—P I"},{"index":5,"title":"C   C—P II"},{"index":6,"title":"C, L U A H!"},{"index":7,"title":"T S   S"},{"index":8,"title":"B  T!"},{"index":9,"title":"A T  T"},{"index":10,"title":"T T T"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '268_your-bible-questions-answered-douglas-a-jacoby',
    'Your Bible Questions Answered – Douglas A. Jacoby',
    'Douglas A. Jacoby',
    'Độc lập / Tuyển tập chuyên khảo',
    5,
    '{"index":268,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":410323,"filename":"268_your-bible-questions-answered-douglas-a-jacoby.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Introduction"},{"index":3,"title":"Notes"},{"index":4,"title":"Introduction"},{"index":5,"title":"Notes"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '269_zondervan-atlas-of-the-bible-carl-g-rasmussen',
    'Zondervan Atlas of the Bible – Carl G. Rasmussen',
    'Carl G. Rasmussen',
    'Zondervan Reference Collection',
    5,
    '{"index":269,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1048634,"filename":"269_zondervan-atlas-of-the-bible-carl-g-rasmussen.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"INTRODUCTION"},{"index":5,"title":"Conclusion"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '270_zondervan-dictionary-of-bible-and-theology-words-matthew-s-demoss-j-edward-mille',
    'Zondervan Dictionary of Bible and Theology Words – Matthew S. DeMoss, J. Edward Miller',
    'Matthew S. DeMoss, J. Edward Miller',
    'Zondervan Reference Collection',
    4,
    '{"index":270,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":356123,"filename":"270_zondervan-dictionary-of-bible-and-theology-words-matthew-s-demoss-j-edward-mille.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"INTRODUCTION"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '271_zondervan-encyclopedia-of-the-bible-merrill-c-tenney',
    'Zondervan Encyclopedia of the Bible – Merrill C. Tenney',
    'Merrill C. Tenney',
    'Zondervan Reference Collection',
    3,
    '{"index":271,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":2398868,"filename":"271_zondervan-encyclopedia-of-the-bible-merrill-c-tenney.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"INTRODUCTION"},{"index":3,"title":"Chapter 3 recounts the FALL through the subtle insinuations of the serpent, who cast doubts upon the integrity of God and appealed to human pride (Gen. 3:1–5). First Eve and then Adam were involved (vv. 1–7), and it is perhaps significant that they judged themselves by hiding from God (v. 8) before they were excluded from the garden (vv. 22, 24). Other aspects of the punishment included (1) a perpetuation of the enmity between the seed of the woman and the serpent; (2) the cursing of the soil upon which mankind was dependent (vv. 11–19), and (3) the pains of childbirth (v. 16). After this, Adam became the father of CAIN and ABEL (4:2). Following the murder of Abel, Eve gave birth to SETH when Adam was 130 (LXX 230) years old (4:25; 5:3). Adam died at the age of 930 years (5:5). It is perhaps of significance that the only other unequivocal reference to Adam in the OT is in the genealogy of 1 Chr. 1:1; in other references"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '272_zondervan-illustrated-bible-dictionary-j-d-douglas-merrill-c-tenney',
    'Zondervan Illustrated Bible Dictionary – J. D. Douglas, Merrill C. Tenney',
    'J. D. Douglas, Merrill C. Tenney',
    'Zondervan Reference Collection',
    4,
    '{"index":272,"category":"dictionary","category_vi":"Từ Điển & Bách Khoa Toàn Thư","chars":1951575,"filename":"272_zondervan-illustrated-bible-dictionary-j-d-douglas-merrill-c-tenney.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"Contents"},{"index":3,"title":"INTRODUCTION"},{"index":4,"title":"Contents"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '273_zondervan-niv-bible-study-commentary-john-h-sailhamer',
    'Zondervan NIV Bible Study Commentary – John H. Sailhamer',
    'John H. Sailhamer',
    'Zondervan Reference Collection',
    47,
    '{"index":273,"category":"commentary","category_vi":"Bộ Chú Giải Kinh Thánh","chars":642400,"filename":"273_zondervan-niv-bible-study-commentary-john-h-sailhamer.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"},{"index":2,"title":"CONTENTS"},{"index":3,"title":"Introduction"},{"index":4,"title":"G. Joseph’s Interpretation of Pharaoh’s Dreams"},{"index":5,"title":"Chapter 46 ends with Joseph’s plan to secure the land of Goshen as a dwelling place for the sons of Israel. The plan was simply to tell the pharaoh that they were shepherds. Since the Egyptians hated shepherds, this would allow the Israelites to live by themselves in Goshen. That plan succeeded. In fact, Pharaoh’s response in ch. 47 was even more generous than the previous narrative would have suggested. Pharaoh also put them in charge of his own livestock."},{"index":6,"title":"Introduction"},{"index":7,"title":"Chapter 14 deals with provisions for cleansing from the diseases enumerated in the preceding passage. This “cleansing” was a procedure for pronouncing that one had been healed. First, the provisions for cleansing diseases on the flesh are given (vv.1 – 32) and then those for cleansing diseases from the house (vv.33 – 53)."},{"index":8,"title":"Introduction"},{"index":9,"title":"Chapter 19 is about preparation of the “water of cleansing” (vv.1 – 10). Then follow two examples of the use of this water: purification from contact with a dead body (vv.11 – 13), and purification after being in the same tent with a dead body (vv.14 – 22)."},{"index":10,"title":"Introduction"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '274_zondervan-starting-place-study-bible',
    'Zondervan Starting Place Study Bible',
    '',
    'Zondervan Reference Collection',
    1,
    '{"index":274,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":2008163,"filename":"274_zondervan-starting-place-study-bible.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;
INSERT INTO documents (source_key, title, author, series, total_chapters, metadata)
VALUES (
    '275_zondervan-top-100-q-a-of-the-bible',
    'Zondervan Top 100 Q & A of the Bible',
    '',
    'Zondervan Reference Collection',
    1,
    '{"index":275,"category":"monograph","category_vi":"Thần Học Chuyên Đề & Đời Sống","chars":221490,"filename":"275_zondervan-top-100-q-a-of-the-bible.json","outline_sample":[{"index":1,"title":"Introduction & Front Matter"}]}'::jsonb
)
ON CONFLICT (source_key) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    series = EXCLUDED.series,
    total_chapters = EXCLUDED.total_chapters,
    metadata = EXCLUDED.metadata;

COMMIT;
