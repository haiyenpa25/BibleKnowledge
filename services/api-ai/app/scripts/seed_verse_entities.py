"""
seed_verse_entities.py: Link key biblical verses with People, Places, and Events in verse_entities table.
Reference: ROADMAP1.md Sections 2.1, 7, 8, 9, 10
"""

import json
from sqlalchemy import text
from app.db.session import engine

# Definition of verse mappings: (entity_type, slug, book_name_vi, chapter, start_v, end_v, mention_type)
ENTITY_VERSE_MAPPINGS = [
    # --- PEOPLE ---
    ("person", "chua-gie-xu", "Ma-thi-ơ", 14, 22, 33, "direct"),
    ("person", "chua-gie-xu", "Giăng", 1, 1, 18, "direct"),
    ("person", "chua-gie-xu", "Giăng", 2, 1, 11, "direct"),
    ("person", "chua-gie-xu", "Giăng", 3, 16, 17, "direct"),
    ("person", "chua-gie-xu", "Lu-ca", 2, 1, 20, "direct"),
    ("person", "chua-gie-xu", "Ma-thi-ơ", 28, 1, 10, "direct"),
    ("person", "si-mon-phi-e-ro", "Ma-thi-ơ", 14, 28, 31, "direct"),
    ("person", "si-mon-phi-e-ro", "Ma-thi-ơ", 16, 13, 20, "direct"),
    ("person", "si-mon-phi-e-ro", "Công-vụ các Sứ-đồ", 2, 14, 40, "direct"),
    ("person", "su-do-phao-lo", "Công-vụ các Sứ-đồ", 9, 1, 19, "direct"),
    ("person", "su-do-phao-lo", "Rô-ma", 1, 16, 17, "direct"),
    ("person", "su-do-phao-lo", "I Cô-rinh-tô", 13, 1, 13, "direct"),
    ("person", "vua-da-vit", "Thi-thiên", 23, 1, 6, "direct"),
    ("person", "moi-se", "Sáng-thế Ký", 1, 1, 31, "author"),
    ("person", "moi-se", "Xuất Ê-díp-tô Ký", 14, 1, 31, "direct"),
    ("person", "moi-se", "Xuất Ê-díp-tô Ký", 20, 1, 17, "direct"),
    ("person", "ap-ra-ham", "Sáng-thế Ký", 12, 1, 7, "direct"),
    ("person", "ap-ra-ham", "Sáng-thế Ký", 15, 1, 6, "direct"),
    ("person", "gio-sep", "Sáng-thế Ký", 37, 1, 36, "direct"),
    ("person", "ma-ri", "Lu-ca", 1, 26, 38, "direct"),
    ("person", "ma-ri", "Lu-ca", 2, 1, 20, "direct"),
    ("person", "ma-ri", "Giăng", 2, 1, 5, "direct"),
    ("person", "su-do-giang", "Giăng", 1, 1, 14, "direct"),
    ("person", "vua-sa-lo-mon", "Châm-ngôn", 1, 1, 7, "direct"),

    # --- PLACES ---
    ("place", "bien-ga-li-le", "Ma-thi-ơ", 14, 22, 33, "direct"),
    ("place", "ca-na", "Giăng", 2, 1, 11, "direct"),
    ("place", "bet-le-hem", "Lu-ca", 2, 1, 7, "direct"),
    ("place", "na-xa-ret", "Lu-ca", 2, 51, 52, "direct"),
    ("place", "gie-ru-sa-lem", "Công-vụ các Sứ-đồ", 2, 1, 13, "direct"),
    ("place", "gie-ru-sa-lem", "Lu-ca", 19, 28, 48, "direct"),
    ("place", "da-mach", "Công-vụ các Sứ-đồ", 9, 1, 19, "direct"),
    ("place", "nui-si-na-i", "Xuất Ê-díp-tô Ký", 19, 1, 25, "direct"),
    ("place", "nui-si-na-i", "Xuất Ê-díp-tô Ký", 20, 1, 17, "direct"),
    ("place", "ai-cap", "Xuất Ê-díp-tô Ký", 14, 1, 31, "direct"),
    ("place", "ai-cap", "Sáng-thế Ký", 12, 10, 20, "direct"),

    # --- EVENTS ---
    ("event", "su-sang-tao", "Sáng-thế Ký", 1, 1, 31, "direct"),
    ("event", "su-sang-tao", "Sáng-thế Ký", 2, 1, 25, "direct"),
    ("event", "giao-uoc-ap-ra-ham", "Sáng-thế Ký", 12, 1, 7, "direct"),
    ("event", "giao-uoc-ap-ra-ham", "Sáng-thế Ký", 15, 1, 18, "direct"),
    ("event", "xuat-ai-cap-vuot-bien-do", "Xuất Ê-díp-tô Ký", 14, 1, 31, "direct"),
    ("event", "su-giang-sinh-chua-gie-xu", "Lu-ca", 2, 1, 20, "direct"),
    ("event", "phep-la-ca-na", "Giăng", 2, 1, 11, "direct"),
    ("event", "di-bo-tren-mat-bien", "Ma-thi-ơ", 14, 22, 33, "direct"),
    ("event", "su-dong-dinh-thap-tu-gia", "Ma-thi-ơ", 27, 32, 56, "direct"),
    ("event", "su-phuc-sinh-vinh-hien", "Ma-thi-ơ", 28, 1, 10, "direct"),
    ("event", "bien-co-le-ngu-tuan", "Công-vụ các Sứ-đồ", 2, 1, 13, "direct"),
    ("event", "su-bien-cai-cua-phao-lo", "Công-vụ các Sứ-đồ", 9, 1, 19, "direct")
]

def seed_verse_entities():
    with engine.begin() as conn:
        print("[*] 1. Indexing entity UUIDs...")
        people_map = {r.slug: r.id for r in conn.execute(text("SELECT id, slug FROM people")).fetchall()}
        places_map = {r.slug: r.id for r in conn.execute(text("SELECT id, slug FROM places")).fetchall()}
        events_map = {r.slug: r.id for r in conn.execute(text("SELECT id, slug FROM events")).fetchall()}

        print("[*] 2. Clearing previous verse_entities...")
        conn.execute(text("DELETE FROM verse_entities"))

        total_linked = 0
        print("[*] 3. Linking verses to entities...")

        for etype, slug, book_name, chapter, start_v, end_v, mtype in ENTITY_VERSE_MAPPINGS:
            entity_id = None
            if etype == "person":
                entity_id = people_map.get(slug)
            elif etype == "place":
                entity_id = places_map.get(slug)
            elif etype == "event":
                entity_id = events_map.get(slug)

            if not entity_id:
                print(f"[!] Warning: Entity '{slug}' of type '{etype}' not found in DB.")
                continue

            # Find matching verse IDs
            verses = conn.execute(
                text("""
                SELECT v.id
                FROM bible_verses v
                JOIN bible_books b ON v.book_id = b.id
                WHERE (LOWER(b.name_vi) = LOWER(:bname) OR LOWER(b.code) = LOWER(:bname))
                  AND v.chapter = :chapter
                  AND v.verse >= :start_v
                  AND v.verse <= :end_v
                """),
                {
                    "bname": book_name,
                    "chapter": chapter,
                    "start_v": start_v,
                    "end_v": end_v
                }
            ).fetchall()

            for (vid,) in verses:
                conn.execute(
                    text("""
                    INSERT INTO verse_entities (verse_id, entity_type, entity_id, mention_type)
                    VALUES (:vid, :etype, :eid, :mtype)
                    """),
                    {
                        "vid": vid,
                        "etype": etype,
                        "eid": entity_id,
                        "mtype": mtype
                    }
                )
                total_linked += 1

        print(f"[+] Successfully linked {total_linked} verse-entity associations in verse_entities table!")

if __name__ == "__main__":
    seed_verse_entities()
