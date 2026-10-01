from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import logging

from app.db.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/graph", tags=["graph"])


# ==============================================================================
# Schemas
# ==============================================================================

class GraphNode(BaseModel):
    id: str
    node_type: str
    node_key: str
    label: str
    metadata: Dict[str, Any]


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    source_key: str
    target_key: str
    relation: str
    confidence: str
    metadata: Dict[str, Any]


class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class TimelineEventItem(BaseModel):
    id: str
    slug: str
    title: str
    approximate_date: Optional[str]
    date_type: Optional[str]
    period: Optional[str]
    description: Optional[str]
    scripture: Optional[str]
    era_order: int


# ==============================================================================
# Endpoints
# ==============================================================================

@router.get("/data", response_model=GraphDataResponse)
def get_graph_data(
    node_type: Optional[str] = Query(None, description="person, place, or event"),
    search: Optional[str] = Query(None, description="Search keyword in labels"),
    db: Session = Depends(get_db)
):
    """
    Fetch nodes and edges for Cytoscape.js or Interactive Graph viewer.
    """
    node_query = "SELECT id, node_type, node_key, label, metadata FROM knowledge_nodes"
    conditions = []
    params: dict = {}

    if node_type and node_type != "all":
        conditions.append("node_type = :n_type")
        params["n_type"] = node_type

    if search:
        conditions.append("label ILIKE :search")
        params["search"] = f"%{search}%"

    if conditions:
        node_query += " WHERE " + " AND ".join(conditions)

    node_rows = db.execute(text(node_query), params).fetchall()

    nodes_list = []
    node_ids = set()
    node_id_to_key = {}

    for r in node_rows:
        meta = r.metadata if isinstance(r.metadata, dict) else {}
        node_id_str = str(r.id)
        node_ids.add(node_id_str)
        node_id_to_key[node_id_str] = r.node_key

        nodes_list.append(GraphNode(
            id=node_id_str,
            node_type=r.node_type,
            node_key=r.node_key,
            label=r.label,
            metadata=meta
        ))

    # Fetch relevant edges
    edge_query = """
    SELECT e.id, e.source_node_id, e.target_node_id, e.relation, e.confidence, e.metadata,
           s.node_key as src_key, t.node_key as tgt_key
    FROM knowledge_edges e
    JOIN knowledge_nodes s ON s.id = e.source_node_id
    JOIN knowledge_nodes t ON t.id = e.target_node_id
    """
    edge_rows = db.execute(text(edge_query)).fetchall()

    edges_list = []
    for er in edge_rows:
        src_id = str(er.source_node_id)
        tgt_id = str(er.target_node_id)
        
        # If filtered by node_type or search, only include edges between existing nodes
        if conditions and (src_id not in node_ids or tgt_id not in node_ids):
            continue

        meta = er.metadata if isinstance(er.metadata, dict) else {}
        edges_list.append(GraphEdge(
            id=str(er.id),
            source=src_id,
            target=tgt_id,
            source_key=er.src_key,
            target_key=er.tgt_key,
            relation=er.relation,
            confidence=er.confidence or "canonical",
            metadata=meta
        ))

    return GraphDataResponse(nodes=nodes_list, edges=edges_list)


@router.get("/timeline", response_model=List[TimelineEventItem])
def get_biblical_timeline(db: Session = Depends(get_db)):
    """
    Get chronological Biblical timeline events.
    """
    rows = db.execute(
        text("""
        SELECT id, slug, title, approximate_date, date_type, period, description, metadata
        FROM events
        ORDER BY (metadata->>'era_order')::int ASC, id ASC
        """)
    ).fetchall()

    timeline = []
    for r in rows:
        meta = r.metadata if isinstance(r.metadata, dict) else {}
        timeline.append(TimelineEventItem(
            id=str(r.id),
            slug=r.slug,
            title=r.title,
            approximate_date=r.approximate_date,
            date_type=r.date_type,
            period=r.period,
            description=r.description,
            scripture=meta.get("scripture"),
            era_order=int(meta.get("era_order", 99))
        ))
    return timeline


@router.get("/entities/{entity_type}/{slug}")
def get_entity_detail(entity_type: str, slug: str, db: Session = Depends(get_db)):
    """
    Get deep entity profile and linked relationships.
    """
    if entity_type == "person":
        row = db.execute(
            text("SELECT id, slug, name_vi, name_en, original_name, gender, title_or_role, summary, timeline_period, metadata FROM people WHERE slug = :slug"),
            {"slug": slug}
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật.")
        
        data = {
            "type": "person",
            "slug": row.slug,
            "name_vi": row.name_vi,
            "name_en": row.name_en,
            "original_name": row.original_name,
            "gender": row.gender,
            "title_or_role": row.title_or_role,
            "summary": row.summary,
            "timeline_period": row.timeline_period,
            "metadata": row.metadata
        }
    elif entity_type == "place":
        row = db.execute(
            text("SELECT id, slug, name_vi, name_en, modern_name, latitude, longitude, description, metadata FROM places WHERE slug = :slug"),
            {"slug": slug}
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy địa danh.")
        data = {
            "type": "place",
            "slug": row.slug,
            "name_vi": row.name_vi,
            "name_en": row.name_en,
            "modern_name": row.modern_name,
            "latitude": float(row.latitude) if row.latitude else None,
            "longitude": float(row.longitude) if row.longitude else None,
            "description": row.description,
            "metadata": row.metadata
        }
    elif entity_type == "event":
        row = db.execute(
            text("SELECT id, slug, title, approximate_date, date_type, period, description, metadata FROM events WHERE slug = :slug"),
            {"slug": slug}
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy sự kiện.")
        data = {
            "type": "event",
            "slug": row.slug,
            "name_vi": row.title,
            "approximate_date": row.approximate_date,
            "date_type": row.date_type,
            "period": row.period,
            "description": row.description,
            "metadata": row.metadata
        }
    else:
        raise HTTPException(status_code=400, detail="Loại thực thể không hợp lệ.")

    # Fetch connected relationships from knowledge_edges
    edges_rows = db.execute(
        text("""
        SELECT e.relation, n.node_type, n.node_key, n.label
        FROM knowledge_edges e
        JOIN knowledge_nodes n ON n.id = e.target_node_id
        JOIN knowledge_nodes curr ON curr.id = e.source_node_id
        WHERE curr.node_key = :slug
        UNION ALL
        SELECT e.relation, n.node_type, n.node_key, n.label
        FROM knowledge_edges e
        JOIN knowledge_nodes n ON n.id = e.source_node_id
        JOIN knowledge_nodes curr ON curr.id = e.target_node_id
        WHERE curr.node_key = :slug
        """),
        {"slug": slug}
    ).fetchall()

    connections = []
    for er in edges_rows:
        connections.append({
            "relation": er.relation,
            "connected_type": er.node_type,
            "connected_slug": er.node_key,
            "connected_label": er.label
        })

    data["connections"] = connections
    return data


# ==============================================================================
# Biblical Geospatial Places & Journeys
# ==============================================================================

@router.get("/places")
def list_biblical_places(db: Session = Depends(get_db)):
    """
    Get all biblical places with geographic coordinates and linked events.
    """
    rows = db.execute(
        text("SELECT id, slug, name_vi, name_en, modern_name, latitude, longitude, description, metadata FROM places ORDER BY name_vi ASC")
    ).fetchall()

    places = []
    for r in rows:
        places.append({
            "id": str(r.id),
            "slug": r.slug,
            "name_vi": r.name_vi,
            "name_en": r.name_en,
            "modern_name": r.modern_name,
            "latitude": float(r.latitude) if r.latitude else None,
            "longitude": float(r.longitude) if r.longitude else None,
            "description": r.description,
            "metadata": r.metadata or {}
        })
    return places


@router.get("/journeys")
def list_biblical_journeys():
    """
    Get key biblical spatial journeys with ordered stops, scriptures and narratives.
    """
    journeys = [
        {
            "id": "journey-abraham",
            "title": "Hành Trình Đức Tin Của Áp-ra-ham",
            "period": "Patriarchs (khoảng 2091 TCN)",
            "description": "Lời kêu gọi vâng phục của Áp-ra-ham rời bỏ quê hương U-rơ Canh-đê băng qua Ha-ran đến xứ Ca-na-an và lập bàn thờ cho Đức Chúa Trời.",
            "color": "#f59e0b",
            "waypoints": [
                {"order": 1, "name": "U-rơ (Ur)", "modern": "Tell el-Muqayyar, Iraq", "lat": 30.9628, "lng": 46.1031, "scripture": "Sáng-thế Ký 11:31", "notes": "Nơi Áp-ram sinh ra và được Chúa kêu gọi ra đi."},
                {"order": 2, "name": "Ha-ran (Haran)", "modern": "Harran, Thổ Nhĩ Kỳ", "lat": 36.8667, "lng": 39.0333, "scripture": "Sáng-thế Ký 12:1-4", "notes": "Nơi Tha-rê qua đời và Áp-ram 75 tuổi tiếp tục lên đường đến Ca-na-an."},
                {"order": 3, "name": "Si-chem (Shechem)", "modern": "Nablus, Bờ Tây", "lat": 32.2138, "lng": 35.2858, "scripture": "Sáng-thế Ký 12:6-7", "notes": "Chúa hiện ra hứa ban đất Ca-na-an; Áp-ram lập bàn thờ đầu tiên."},
                {"order": 4, "name": "Bê-tên (Bethel)", "modern": "Beitin, Bờ Tây", "lat": 31.9303, "lng": 35.2394, "scripture": "Sáng-thế Ký 12:8", "notes": "Dựng trại giữa Bê-tên và A-hi, cầu khẩn danh Đức Giê-hô-va."},
                {"order": 5, "name": "Ai Cập (Egypt)", "modern": "Cairo, Ai Cập", "lat": 30.0444, "lng": 31.2357, "scripture": "Sáng-thế Ký 12:10-20", "notes": "Tạm lánh nạn đói khốc liệt tại Ca-na-an."},
                {"order": 6, "name": "Hếp-rôn (Hebron)", "modern": "Hebron, Bờ Tây", "lat": 31.5326, "lng": 35.0998, "scripture": "Sáng-thế Ký 13:18; 23:19", "notes": "Định cư bên lùm cây dẻ bộp Mam-rê; nơi chôn cất Sa-ra và Áp-ra-ham."}
            ]
        },
        {
            "id": "journey-exodus",
            "title": "Cuộc Xuất Ai Cập & 40 Năm Đồng Vắng",
            "period": "Exodus & Wilderness (khoảng 1446 TCN)",
            "description": "Tuyển dân Y-sơ-ra-ên do Môi-se lãnh đạo thoát khỏi ách nô lệ Ai Cập, rẽ đôi Biển Đỏ, nhận Luật pháp tại Núi Si-na-i và tiến về Đất Hứa.",
            "color": "#ef4444",
            "waypoints": [
                {"order": 1, "name": "Ram-se (Ramses)", "modern": "Qantir, Ai Cập", "lat": 30.7900, "lng": 31.8300, "scripture": "Xuất Ê-díp-tô Ký 12:37", "notes": "Điểm khởi hành sau đêm Lễ Vượt Qua đầu tiên."},
                {"order": 2, "name": "Biển Đỏ (Red Sea / Yam Suph)", "modern": "Vịnh Suez, Ai Cập", "lat": 29.8500, "lng": 32.5500, "scripture": "Xuất Ê-díp-tô Ký 14:21-31", "notes": "Phép lạ rẽ đôi dòng nước; đạo quân Pha-ra-ôn bị vùi lấp."},
                {"order": 3, "name": "Ma-ra (Marah)", "modern": "Ai Cập", "lat": 29.5800, "lng": 32.7800, "scripture": "Xuất Ê-díp-tô Ký 15:23-25", "notes": "Chúa biến nước đắng thành nước ngọt qua khúc gỗ."},
                {"order": 4, "name": "Núi Si-na-i (Mount Sinai)", "modern": "Jabal Musa, Ai Cập", "lat": 28.5394, "lng": 33.9753, "scripture": "Xuất Ê-díp-tô Ký 19-20", "notes": "Đức Chúa Trời ban bố Mười Điều Răn và Giao Ước Luật Pháp."},
                {"order": 5, "name": "Ca-đe-bạt-nê-a (Kadesh-barnea)", "modern": "Biên giới Israel-Ai Cập", "lat": 30.6500, "lng": 34.4200, "scripture": "Dân-số Ký 13-14", "notes": "Sai 12 thám tử do thám Đất Hứa; dân sự mất đức tin bị lưu lạc 40 năm."},
                {"order": 6, "name": "Núi Nê-bô (Mount Nebo)", "modern": "Madaba, Jordan", "lat": 31.7680, "lng": 35.7250, "scripture": "Phục-truyền 34:1-5", "notes": "Môi-se ngắm nhìn Đất Hứa từ xa trước khi về cùng Chúa."}
            ]
        },
        {
            "id": "journey-jesus",
            "title": "Chức Vụ Của Chúa Cứu Thế Giê-xu",
            "period": "Life of Christ (khoảng 26 - 30/33 SCN)",
            "description": "Các chặng đường giảng đạo, thi thố phép lạ và hoàn tất công cuộc cứu chuộc nhân loại của Chúa Giê-xu từ Ga-li-lê đến Giê-ru-sa-lem.",
            "color": "#3b82f6",
            "waypoints": [
                {"order": 1, "name": "Bết-lê-hem (Bethlehem)", "modern": "Bethlehem, Bờ Tây", "lat": 31.7054, "lng": 35.2024, "scripture": "Lu-ca 2:1-7", "notes": "Chúa Giê-xu giáng sinh nơi máng cỏ chuồng chiên."},
                {"order": 2, "name": "Na-xa-rét (Nazareth)", "modern": "Nazareth, Israel", "lat": 32.7019, "lng": 35.3033, "scripture": "Lu-ca 2:51-52; 4:16", "notes": "Nơi Chúa lớn lên và bắt đầu công bố chức vụ tiên tri."},
                {"order": 3, "name": "Sông Giô-đanh (Jordan River)", "modern": "Qasr al-Yahud, Jordan/Israel", "lat": 31.8383, "lng": 35.5467, "scripture": "Ma-thi-ơ 3:13-17", "notes": "Chịu phép báp-tem bởi Giăng Báp-tít; Thánh Linh giáng lâm như chim bồ câu."},
                {"order": 4, "name": "Ca-na (Cana)", "modern": "Kafr Kanna, Israel", "lat": 32.7472, "lng": 35.3389, "scripture": "Giăng 2:1-11", "notes": "Phép lạ đầu tiên: hóa nước thành rượu ngon tại đám cưới."},
                {"order": 5, "name": "Ca-bê-na-um & Biển Ga-li-lê (Capernaum)", "modern": "Kfar Nahum, Israel", "lat": 32.8804, "lng": 35.5750, "scripture": "Ma-thi-ơ 4:13; 14:22-33", "notes": "Trung tâm chức vụ phương bắc; đi bộ trên mặt biển; dẹp yên sóng gió."},
                {"order": 6, "name": "Sa-ma-ri (Samaria / Sychar)", "modern": "Sebastia / Askar, Bờ Tây", "lat": 32.2130, "lng": 35.2800, "scripture": "Giăng 4:1-42", "notes": "Trò chuyện cùng người đàn bà Sa-ma-ri bên giếng Gia-cốp về nước hằng sống."},
                {"order": 7, "name": "Giê-ru-sa-lem (Jerusalem)", "modern": "Jerusalem, Israel", "lat": 31.7683, "lng": 35.2137, "scripture": "Lu-ca 19:28-48; 23-24", "notes": "Vào thành khải hoàn, Tiệc Thánh, chịu đóng đinh trên đồi Gô-gô-tha và sống lại vinh hiển."}
            ]
        },
        {
            "id": "journey-paul-1",
            "title": "Chuyến Truyền Giáo Thứ Nhất Của Sứ Đồ Phao-lô",
            "period": "Early Church (khoảng 46 - 48 SCN)",
            "description": "Chuyến hành trình tiên phong mở mang Hội Thánh cho Dân Ngoại cùng Ba-na-ba và Mác qua Đảo Chíp và các thành bang vùng Tiểu Á.",
            "color": "#10b981",
            "waypoints": [
                {"order": 1, "name": "An-ti-ốt xứ Sy-ri (Antioch in Syria)", "modern": "Antakya, Thổ Nhĩ Kỳ", "lat": 36.2021, "lng": 36.1606, "scripture": "Công vụ 13:1-3", "notes": "Hội Thánh kiêng ăn cầu nguyện và sai phái Phao-lô và Ba-na-ba lên đường."},
                {"order": 2, "name": "Đảo Chíp (Cyprus / Salamis & Paphos)", "modern": "Cyprus", "lat": 34.9167, "lng": 32.4167, "scripture": "Công vụ 13:4-12", "notes": "Giảng đạo cho quan trấn thủ Sê-ghi-út Phao-lút; thầy phù thủy Ba-giê-xu bị mù."},
                {"order": 3, "name": "Bẹt-giê xứ Bam-phi-ly (Perga in Pamphylia)", "modern": "Aksu, Thổ Nhĩ Kỳ", "lat": 36.9606, "lng": 30.8522, "scripture": "Công vụ 13:13", "notes": "Đổ bộ vào Tiểu Á; Giăng Mác rời đoàn trở về Giê-ru-sa-lem."},
                {"order": 4, "name": "An-ti-ốt xứ Bi-si-đi (Pisidian Antioch)", "modern": "Yalvac, Thổ Nhĩ Kỳ", "lat": 38.3050, "lng": 31.1890, "scripture": "Công vụ 13:14-52", "notes": "Bài giảng hùng hồn trong nhà hội Do Thái; Dân Ngoại nức lòng tin đạo."},
                {"order": 5, "name": "Y-cô-ni (Iconium)", "modern": "Konya, Thổ Nhĩ Kỳ", "lat": 37.8746, "lng": 32.4932, "scripture": "Công vụ 14:1-7", "notes": "Nhiều người tin Chúa; kẻ nghịch mưu toan ném đá nên phải lánh đi."},
                {"order": 6, "name": "Lít-trơ (Lystra)", "modern": "Hatunsaray, Thổ Nhĩ Kỳ", "lat": 37.5683, "lng": 32.2283, "scripture": "Công vụ 14:8-20", "notes": "Chữa lành người què bẩm sinh; dân chúng tưởng là thần; sau đó Phao-lô bị ném đá tưởng chết."},
                {"order": 7, "name": "Đẹt-bơ (Derbe)", "modern": "Kerti Huyuk, Thổ Nhĩ Kỳ", "lat": 37.3486, "lng": 33.3614, "scripture": "Công vụ 14:20-21", "notes": "Giảng Tin Lành và môn đệ hóa nhiều người trước khi quay lại thăm các Hội Thánh."}
            ]
        },
        {
            "id": "journey-paul-2",
            "title": "Chuyến Truyền Giáo Thứ Hai Của Phao-lô (Tiếng Gọi Ma-xê-đoan)",
            "period": "Early Church (khoảng 49 - 52 SCN)",
            "description": "Tiếng gọi Ma-xê-đoan đưa Phúc Âm từ Á Châu sang Âu Châu; thành lập các Hội Thánh Phi-líp, Tê-sa-lô-ni-ca, Bê-rê và Cô-rinh-tô.",
            "color": "#8b5cf6",
            "waypoints": [
                {"order": 1, "name": "An-ti-ốt xứ Sy-ri (Antioch)", "modern": "Antakya, Thổ Nhĩ Kỳ", "lat": 36.2021, "lng": 36.1606, "scripture": "Công vụ 15:36-41", "notes": "Phao-lô cùng Si-la lên đường củng cố các Hội Thánh xứ Sy-ri và Si-li-si."},
                {"order": 2, "name": "Trô-ách (Troas)", "modern": "Canakkale, Thổ Nhĩ Kỳ", "lat": 39.7525, "lng": 26.1611, "scripture": "Công vụ 16:8-10", "notes": "Khải tượng người Ma-xê-đoan: 'Hãy qua xứ Ma-xê-đoan mà giúp chúng tôi!' Bác sĩ Lu-ca gia nhập đoàn."},
                {"order": 3, "name": "Phi-líp (Philippi)", "modern": "Kavala, Hy Lạp", "lat": 41.0131, "lng": 24.2864, "scripture": "Công vụ 16:11-40", "notes": "Bà Ly-đi tin Chúa; Phao-lô và Si-la ca ngợi Chúa trong ngục lúc nửa đêm; người cai ngục tin nhận Đấng Christ."},
                {"order": 4, "name": "Tê-sa-lô-ni-ca (Thessalonica)", "modern": "Thessaloniki, Hy Lạp", "lat": 40.6401, "lng": 22.9444, "scripture": "Công vụ 17:1-9", "notes": "Giảng giải Kinh Thánh 3 ngày Sa-bát chứng minh Đấng Christ phải chịu chết và sống lại."},
                {"order": 5, "name": "Bê-rê (Berea)", "modern": "Veria, Hy Lạp", "lat": 40.5217, "lng": 22.2033, "scripture": "Công vụ 17:10-15", "notes": "Các tín hữu Bê-rê có tâm tình cao quý, ngày nào cũng tra xem Kinh Thánh xem lời giảng có thật chăng."},
                {"order": 6, "name": "A-thên (Athens)", "modern": "Athens, Hy Lạp", "lat": 37.9838, "lng": 23.7275, "scripture": "Công vụ 17:16-34", "notes": "Biện giáo trên đồi A-rê-ô-ba về 'ĐỨC CHÚA TRỜI KHÔNG BIẾT', kêu gọi mọi người ăn năn."},
                {"order": 7, "name": "Cô-rinh-tô (Corinth)", "modern": "Korinthos, Hy Lạp", "lat": 37.9386, "lng": 22.9322, "scripture": "Công vụ 18:1-18", "notes": "Ở lại 18 tháng dạy dỗ đạo Đức Chúa Trời; dệt trại cùng A-qui-la và Bê-rít-sin; viết thư 1 & 2 Tê-sa-lô-ni-ca."},
                {"order": 8, "name": "Giê-ru-sa-lem (Jerusalem)", "modern": "Jerusalem, Israel", "lat": 31.7683, "lng": 35.2137, "scripture": "Công vụ 18:19-22", "notes": "Ghé thăm Ê-phê-sô rồi trở về chào thăm Hội Thánh Giê-ru-sa-lem và An-ti-ốt."}
            ]
        },
        {
            "id": "journey-paul-rome",
            "title": "Chuyến Đi La-mã & Chìm Tàu Tại Đảo Man-tơ",
            "period": "Early Church (khoảng 59 - 62 SCN)",
            "description": "Phao-lô bị giải đi La-mã vì kháng cáo lên Sê-sa, trải qua bão biển kinh hoàng Ê-ra-cơ-líp, đắm tàu tại Man-tơ và giảng Tin Lành trong sự giam lỏng tại thủ đô Đế quốc.",
            "color": "#ec4899",
            "waypoints": [
                {"order": 1, "name": "Sê-sa-rê (Caesarea)", "modern": "Caesarea, Israel", "lat": 32.5000, "lng": 34.8900, "scripture": "Công vụ 25:11-12; 27:1", "notes": "Phao-lô công bố: 'Tôi kháng án lên Sê-sa!' và được giao cho quan đội trưởng Giu-li-út giải đi bằng đường biển."},
                {"order": 2, "name": "Si-đôn (Sidon)", "modern": "Saida, Li-băng", "lat": 33.5631, "lng": 35.3689, "scripture": "Công vụ 27:3", "notes": "Ghé cảng Si-đôn; Phao-lô được phép thăm bạn bè và nhận sự chăm sóc."},
                {"order": 3, "name": "Mỹ Cảng & Bão Biển (Fair Havens / Crete)", "modern": "Kaloi Limenes, Đảo Crete", "lat": 34.9333, "lng": 24.8000, "scripture": "Công vụ 27:8-20", "notes": "Thuyền gặp bão bấc dữ dội trôi dạt 14 đêm ngày; thiên sứ hiện đến hứa cứu mạng tất cả 276 người trên tàu."},
                {"order": 4, "name": "Chìm Tàu Tại Đảo Man-tơ (Malta)", "modern": "St. Paul's Bay, Malta", "lat": 35.9483, "lng": 14.4000, "scripture": "Công vụ 28:1-10", "notes": "Tàu vỡ tan; toàn bộ 276 người bơi vào bờ an toàn; rắn độc cắn Phao-lô không hề hấn gì; chữa lành cha quan Búp-li-út."},
                {"order": 5, "name": "Si-ra-cu-sơ (Syracuse, Sicily)", "modern": "Siracusa, Ý", "lat": 37.0755, "lng": 15.2866, "scripture": "Công vụ 28:12", "notes": "Đổi thuyền A-léc-xăng-tri có hiệu Song Thần; lưu lại 3 ngày."},
                {"order": 6, "name": "Bô-xô-lơ (Pozzuoli / Puteoli)", "modern": "Pozzuoli, Ý", "lat": 40.8267, "lng": 14.1206, "scripture": "Công vụ 28:13-14", "notes": "Cập bến nước Ý; các anh em Cơ Đốc đón tiếp nồng hậu suốt 7 ngày."},
                {"order": 7, "name": "La-mã (Rome)", "modern": "Rome, Ý", "lat": 41.9028, "lng": 12.4964, "scripture": "Công vụ 28:16-31", "notes": "Phao-lô ở nhà thuê riêng có lính canh trong 2 năm trọn; dạn dĩ rao truyền Nước Đức Chúa Trời và viết các Thư Tín Ngục Tù."}
            ]
        }
    ]
    return journeys

