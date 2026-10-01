from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import logging
import math
import re

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
    approximate_date: Optional[str] = None
    date_type: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    scripture: Optional[str] = None
    era_order: int
    people: Optional[List[str]] = []
    places: Optional[List[str]] = []
    theological_significance: Optional[str] = None


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
            era_order=int(meta.get("era_order", 99)),
            people=meta.get("people", []),
            places=meta.get("places", []),
            theological_significance=meta.get("theological_significance")
        ))
    return timeline


@router.get("/entities")
def get_all_entities(
    entity_type: Optional[str] = Query(None, description="person, place, event, or all"),
    search: Optional[str] = Query(None, description="Search keyword in label"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List all indexed theological entities (People, Places, Events, Covenants).
    """
    query = "SELECT id, node_type, node_key, label, metadata FROM knowledge_nodes"
    conditions = []
    params: dict = {"limit": limit, "offset": offset}

    if entity_type and entity_type != "all":
        conditions.append("node_type = :entity_type")
        params["entity_type"] = entity_type

    if search:
        conditions.append("label ILIKE :search")
        params["search"] = f"%{search}%"

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY label ASC LIMIT :limit OFFSET :offset"

    rows = db.execute(text(query), params).fetchall()
    results = []
    for r in rows:
        results.append({
            "id": str(r.id),
            "node_type": r.node_type,
            "node_key": r.node_key,
            "label": r.label,
            "metadata": r.metadata if isinstance(r.metadata, dict) else {}
        })
    return results


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
            "id": "journey-paul-3",
            "title": "Chuyến Truyền Giáo Thứ Ba Của Phao-lô (Ê-phê-sô & Tiểu Á)",
            "period": "Early Church (khoảng 53 - 57 SCN)",
            "description": "Chức vụ quyền năng 3 năm tại thành phố Ê-phê-sô, củng cố các Hội Thánh Hy Lạp, viết 1 & 2 Cô-rinh-tô, Ga-la-ti, La-mã và lời từ biệt đẫm lệ tại Mi-lê.",
            "color": "#06b6d4",
            "waypoints": [
                {"order": 1, "name": "An-ti-ốt xứ Sy-ri (Antioch in Syria)", "modern": "Antakya, Thổ Nhĩ Kỳ", "lat": 36.2021, "lng": 36.1606, "scripture": "Công vụ 18:23", "notes": "Khởi hành chuyến truyền giáo thứ ba; đi khắp xứ Ga-la-ti và Phi-ri-ghi làm vững lòng môn đồ."},
                {"order": 2, "name": "Ê-phê-sô (Ephesus)", "modern": "Selcuk, Thổ Nhĩ Kỳ", "lat": 37.9483, "lng": 27.3681, "scripture": "Công vụ 19:1-41", "notes": "Giảng dạy 3 năm tại trường Ti-ra-nu; ma quỷ bị trục xuất; cuộc náo loạn của phường thợ bạc đền nữ thần Đi-anh."},
                {"order": 3, "name": "Phi-líp & Ma-xê-đoan (Philippi & Macedonia)", "modern": "Kavala, Hy Lạp", "lat": 41.0131, "lng": 24.2864, "scripture": "Công vụ 20:1-3", "notes": "Qua Ma-xê-đoan khuyên bảo môn đồ; lưu lại Hy Lạp 3 tháng quyên góp tiền giúp tín hữu nghèo tại Giê-ru-sa-lem."},
                {"order": 4, "name": "Trô-ách (Troas)", "modern": "Canakkale, Thổ Nhĩ Kỳ", "lat": 39.7525, "lng": 26.1611, "scripture": "Công vụ 20:6-12", "notes": "Phao-lô giảng giải đến nửa đêm; chàng trai Ơ-tích ngủ gục ngã từ tầng ba tử vong, được Phao-lô ôm lấy và phục sinh."},
                {"order": 5, "name": "Mi-lê (Miletus)", "modern": "Balat, Thổ Nhĩ Kỳ", "lat": 37.5308, "lng": 27.2783, "scripture": "Công vụ 20:17-38", "notes": "Gặp gỡ và giã từ cảm động các trưởng lão Ê-phê-sô: 'Tôi chẳng quí tính mạng mình, miễn chạy cho xong cuộc đua'."},
                {"order": 6, "name": "Ty-rơ (Tyre)", "modern": "Sour, Li-băng", "lat": 33.2708, "lng": 35.1961, "scripture": "Công vụ 21:3-6", "notes": "Cập bến xứ Phe-ni-xi; các môn đồ cùng vợ con tiễn đoàn ra bờ biển quỳ gối cầu nguyện thiết tha."},
                {"order": 7, "name": "Sê-sa-rê (Caesarea)", "modern": "Caesarea, Israel", "lat": 32.5000, "lng": 34.8900, "scripture": "Công vụ 21:8-14", "notes": "Ở nhà người giảng Tin Lành Phi-líp; tiên tri A-ga-bút lấy dây thắt lưng trói tay chân báo trước Phao-lô sẽ bị nộp cho La-mã."},
                {"order": 8, "name": "Giê-ru-sa-lem (Jerusalem)", "modern": "Jerusalem, Israel", "lat": 31.7683, "lng": 35.2137, "scripture": "Công vụ 21:15-36", "notes": "Về thăm Gia-cơ và các trưởng lão; bị người Do Thái kích động bắt giữ nơi Đền Thờ; quan cơ binh La-mã can thiệp giải cứu."}
            ]
        },
        {
            "id": "journey-david-fugitive",
            "title": "Hành Trình Lưu Lạc & Rèn Luyện Của Vua Đa-vít",
            "period": "United Monarchy (khoảng 1020 - 1010 TCN)",
            "description": "Những năm tháng trốn chạy sự ghen ghét của vua Sau-lơ trong các hang đá đồng vắng, nơi Đa-vít viết nhiều bài Thi Thiên bất hủ và tôi luyện tấm lòng kính sợ Chúa.",
            "color": "#eab308",
            "waypoints": [
                {"order": 1, "name": "Ghi-bê-a (Gibeah)", "modern": "Tell el-Ful, Israel", "lat": 31.8236, "lng": 35.2308, "scripture": "1 Sa-mu-ên 19:9-10", "notes": "Cung điện Sau-lơ; Đa-vít gảy đàn xua ác thần và né mũi giáo ám sát của Sau-lơ."},
                {"order": 2, "name": "Nốp (Nob)", "modern": "Gần Jerusalem", "lat": 31.7850, "lng": 35.2450, "scripture": "1 Sa-mu-ên 21:1-9", "notes": "Nơi thầy tế lễ A-hi-mê-léc ban bánh thánh trần thiết và thanh gươm của Gô-li-át cho Đa-vít."},
                {"order": 3, "name": "Gát (Gath)", "modern": "Tell es-Safi, Israel", "lat": 31.6997, "lng": 34.8475, "scripture": "1 Sa-mu-ên 21:10-15", "notes": "Xứ người Phi-li-tin; Đa-vít giả điên cào cửa thành và nhỏ dãi để thoát khỏi tay vua A-kích."},
                {"order": 4, "name": "Hang A-đu-lam (Cave of Adullam)", "modern": "Khirbet 'Id el-Minya", "lat": 31.6500, "lng": 34.9700, "scripture": "1 Sa-mu-ên 22:1-2", "notes": "Nơi ẩn náu đầu tiên; 400 người khốn cùng, mắc nợ và cay đắng linh hồn tụ họp tôn Đa-vít làm thủ lĩnh."},
                {"order": 5, "name": "Kê-y-la (Keilah)", "modern": "Khirbet Qila, Bờ Tây", "lat": 31.6111, "lng": 34.9722, "scripture": "1 Sa-mu-ên 23:1-5", "notes": "Đa-vít cầu hỏi Chúa đem quân giải cứu dân thành Kê-y-la khỏi quân Phi-li-tin cướp bóc sân đạp lúa."},
                {"order": 6, "name": "Hang En-ghê-đi (En-gedi)", "modern": "Ein Gedi, Biển Chết", "lat": 31.4650, "lng": 35.3900, "scripture": "1 Sa-mu-ên 24:1-22", "notes": "Đa-vít lén cắt vạt áo Sau-lơ nhưng không giết vua: 'Đức Giê-hô-va cấm tôi tra tay vào Đấng Được Xức Dầu'."},
                {"order": 7, "name": "Đồng Vắng Xíp & Đồi Hác-ki-la (Ziph)", "modern": "Tell Zif, Bờ Tây", "lat": 31.4800, "lng": 35.1500, "scripture": "1 Sa-mu-ên 26:7-12", "notes": "Lần thứ hai tha mạng Sau-lơ khi vua ngủ say giữa đạo binh; chỉ lấy ngọn giáo và bình nước đầu giường."},
                {"order": 8, "name": "Xiếc-lác (Ziklag)", "modern": "Tel Sera, Israel", "lat": 31.3850, "lng": 34.6200, "scripture": "1 Sa-mu-ên 27:6; 30:1-26", "notes": "Căn cứ của Đa-vít; đánh bại quân A-ma-léc giải cứu thân quyến trước khi được xức dầu làm vua tại Hếp-rôn."}
            ]
        },
        {
            "id": "journey-elijah",
            "title": "Hành Trình Lửa Của Tiên Tri Ê-li",
            "period": "Divided Kingdom (khoảng 875 - 848 TCN)",
            "description": "Cuộc đối đầu lịch sử với thần Ba-anh, ngọn lửa từ trời thiêu rụi của tế lễ, tiếng êm dịu nhỏ nhẹ nơi Núi Hô-rếp và sự phục hưng đức tin độc thần.",
            "color": "#f97316",
            "waypoints": [
                {"order": 1, "name": "Khe Kê-rít (Brook Cherith)", "modern": "Wadi al-Yabis / Qelt", "lat": 31.8400, "lng": 35.4300, "scripture": "1 Các Vua 17:1-6", "notes": "Chúa sai quạ tha bánh và thịt nuôi Ê-li sáng chiều; uống nước khe trong suốt nạn hạn hán."},
                {"order": 2, "name": "Sa-rép-ta (Zarephath)", "modern": "Sarafand, Li-băng", "lat": 33.3989, "lng": 35.2978, "scripture": "1 Các Vua 17:8-24", "notes": "Hũ bột không vơi, vò dầu không cạn; Đức Chúa Trời qua lời cầu xin của Ê-li khiến con trai người góa phụ sống lại."},
                {"order": 3, "name": "Núi Cạt-mên (Mount Carmel)", "modern": "Mount Carmel, Haifa", "lat": 32.7300, "lng": 35.0500, "scripture": "1 Các Vua 18:20-40", "notes": "Trận chiến đức tin với 450 tiên tri Ba-anh; lửa giáng từ trời; dân chúng sấp mặt tung hô 'Giê-hô-va là Đức Chúa Trời!'."},
                {"order": 4, "name": "Gie-xơ-rê-ên (Jezreel)", "modern": "Zir'in, Thung lũng Jezreel", "lat": 32.5594, "lng": 35.3289, "scripture": "1 Các Vua 18:45-46", "notes": "Tay Chúa đặt trên Ê-li, ông thắt lưng chạy bộ vượt trước xe ngựa chiến của vua A-háp dưới cơn mưa dông lớn."},
                {"order": 5, "name": "Bê-e-sê-ba (Beersheba)", "modern": "Be'er Sheva, Israel", "lat": 31.2500, "lng": 34.7900, "scripture": "1 Các Vua 19:3-8", "notes": "Ngồi dưới cây kim tước xin chết vì sợ Giê-sa-bên; thiên sứ ban bánh nướng và bình nước bổ sức cho chặng đường dài."},
                {"order": 6, "name": "Núi Hô-rếp (Mount Horeb / Sinai)", "modern": "Jabal Musa, Ai Cập", "lat": 28.5394, "lng": 33.9753, "scripture": "1 Các Vua 19:8-18", "notes": "Đi 40 ngày 40 đêm đến núi Chúa; nghe tiếng êm dịu nhỏ nhẹ của Đấng Tự Hữu; nhận lệnh xức dầu cho Ê-li-sê kế vị."}
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


# ==============================================================================
# Cross-Bible Connections & Typology (§18)
# ==============================================================================

class CrossBibleConnection(BaseModel):
    id: str
    connection_type: str  # explicit | quotation | allusion | parallel | scholarly_interpretation | AI_suggested
    title: str
    typology_theme: str
    ot_anchor_ref: str
    ot_anchor_text: str
    nt_fulfillment_ref: str
    nt_fulfillment_text: str
    revelation_chain: List[str]
    theological_synthesis: str
    confidence_score: float
    scholarly_source: Optional[str]


CONNECTIONS_DATA = [
    {
        "id": "typology-passover-lamb",
        "connection_type": "explicit",
        "title": "Chiên Con Lễ Vượt Qua → Chiên Con Của Đức Chúa Trời",
        "typology_theme": "Đấng Cứu Thế / Chiên Con Đền Tội",
        "ot_anchor_ref": "Xuất Ê-díp-tô Ký 12:5-7, 13",
        "ot_anchor_text": "Các ngươi hãy bắt một con chiên đực, không tì vít, được một tuổi... Huyết bôi nơi nhà các ngươi ở sẽ dùng làm dấu hiệu; khi ta hành hại xứ Ê-díp-tô, thấy huyết đó, thì sẽ vượt qua.",
        "nt_fulfillment_ref": "1 Cô-rinh-tô 5:7; Giăng 1:29; 1 Phi-e-rơ 1:18-19",
        "nt_fulfillment_text": "Vì Đấng Christ là con sinh Lễ Vượt Qua của chúng ta, đã chịu sát tế... Kìa, Chiên Con của Đức Chúa Trời, là Đấng cất tội lỗi thế gian đi!",
        "revelation_chain": [
            "Sáng-thế Ký 22:8 (Đức Chúa Trời Tự Sắm Sẵn Chiên Con)",
            "Xuất Ê-díp-tô Ký 12:5 (Chiên Vượt Qua Không Tì Vết)",
            "Ê-sai 53:7 (Chiên Câm Trước Kẻ Hớt Lông)",
            "Giăng 1:29 (Kìa, Chiên Con Của Đức Chúa Trời)",
            "1 Cô-rinh-tô 5:7 (Đấng Christ Là Chiên Lễ Vượt Qua)",
            "Khải-huyền 5:6-12 (Chiên Con Đã Chịu Giết Nay Nhận Lấy Vinh Hiển)"
        ],
        "theological_synthesis": "Huyết chiên con không tì vết bôi trên mày cửa bảo vệ dân Y-sơ-ra-ên khỏi thiên sứ hủy diệt là hình bóng tiên tri trực tiếp về sự chết chuộc tội của Chúa Cứu Thế Giê-xu trên thập tự giá. Không một xương nào của Ngài bị gãy (Xuất 12:46; Giăng 19:36).",
        "confidence_score": 1.0,
        "scholarly_source": "Thần Học Giao Ước Cựu & Tân Ước (Covenant Theology) & Luận văn Cứu Chuộc Luận"
    },
    {
        "id": "typology-protoevangelium",
        "connection_type": "explicit",
        "title": "Dòng Dõi Người Nữ → Đấng Đạp Dập Đầu Con Rắn",
        "typology_theme": "Tin Lành Ban Đầu (Protoevangelium)",
        "ot_anchor_ref": "Sáng-thế Ký 3:15",
        "ot_anchor_text": "Ta sẽ làm cho mầy cùng người nữ, dòng dõi mầy cùng dòng dõi người nghịch thù nhau. Người sẽ giày đạp đầu mầy, còn mầy sẽ cắn gót chân người.",
        "nt_fulfillment_ref": "Ga-la-ti 4:4; Rô-ma 16:20; Khải-huyền 12:9-10",
        "nt_fulfillment_text": "Nhưng khi kỳ hạn đã được trọn, Đức Chúa Trời bèn sai Con Ngài bởi một người nữ sanh ra... Đức Chúa Trời bình an sẽ kíp giày đạp quỷ Sa-tan dưới chân anh em.",
        "revelation_chain": [
            "Sáng-thế Ký 3:15 (Lời Hứa Dòng Dõi Đạp Đầu Rắn)",
            "Ê-sai 7:14 (Nữ Đồng Trinh Sẽ Chịu Thai Sanh Con Trai)",
            "Ma-thi-ơ 1:20-23 (Ứng Nghiệm Sự Sinh Ra Bởi Trinh Nữ Ma-ri)",
            "Ga-la-ti 4:4 (Sai Con Ngài Sinh Bởi Người Nữ)",
            "Rô-ma 16:20 (Chúa Giày Đạp Sa-tan Dưới Chân)",
            "Khải-huyền 20:2, 10 (Con Rắn Xưa Bị Quăng Vào Hồ Lửa Đời Đời)"
        ],
        "theological_synthesis": "Tin Lành đầu tiên (Protoevangelium) được công bố ngay sau khi loài người sa ngã. Đấng Christ chịu thương tổn nơi gót chân (chịu thương khó thập tự) nhưng đã giáng đòn hủy diệt đạp dập đầu ma quỷ qua sự sống lại vinh hiển.",
        "confidence_score": 1.0,
        "scholarly_source": "Khảo Cứu Sáng Thế Ký & Lời Tiên Tri Về Đấng Mê-si"
    },
    {
        "id": "typology-melchizedek",
        "connection_type": "explicit",
        "title": "Mên-chi-xê-đéc → Thầy Tế Lễ Thượng Phẩm Đời Đời",
        "typology_theme": "Chức Vụ Thầy Tế Lễ Thượng Phẩm Vượt Trội",
        "ot_anchor_ref": "Sáng-thế Ký 14:18-20; Thi-thiên 110:4",
        "ot_anchor_text": "Mên-chi-xê-đéc, vua Sa-lem, sai đem bánh và rượu ra. Vua nầy là thầy tế lễ của Đức Chúa Trời Chí Cao... Đức Giê-hô-va đã thề: Ngươi là thầy tế lễ đời đời, tùy theo ban Mên-chi-xê-đéc.",
        "nt_fulfillment_ref": "Hê-bơ-rơ 5:6, 10; 7:1-17, 24-28",
        "nt_fulfillment_text": "Đức Chúa Trời đã xưng Ngài là thầy tế lễ thượng phẩm theo ban Mên-chi-xê-đéc... Ngài vì hằng sống đời đời, nên chức tế lễ của Ngài không hề đổi thay.",
        "revelation_chain": [
            "Sáng-thế Ký 14:18 (Vua Sa-lem Kiêm Thầy Tế Lễ Đem Bánh Và Rượu)",
            "Thi-thiên 110:4 (Lời Thề Đời Đời Theo Ban Mên-chi-xê-đéc)",
            "Hê-bơ-rơ 5:6-10 (Chúa Giê-xu Chịu Khổ Để Trở Nên Thầy Tế Lễ Đời Đời)",
            "Hê-bơ-rơ 7:1-28 (Chức Tế Lễ Vượt Trội Hơn Dòng Lê-vi & A-rôn)"
        ],
        "theological_synthesis": "Mên-chi-xê-đéc kết hợp cả hai vương quyền (Vua Công Bình, Vua Bình An) và thần quyền (Thầy Tế Lễ Chí Cao) không lệ thuộc vào dòng dõi gia phổ Lê-vi. Đây là hình ảnh tiên tri hoàn hảo về chức vụ Thầy Tế Lễ Thượng Phẩm đời đời của Chúa Cứu Thế Giê-xu.",
        "confidence_score": 1.0,
        "scholarly_source": "Giải Kinh Thư Hê-bơ-rơ & Luận đề Thần Học Giao Ước"
    },
    {
        "id": "typology-bronze-serpent",
        "connection_type": "quotation",
        "title": "Con Rắn Đồng Trong Đồng Vắng → Chúa Bị Treo Lên Thập Tự",
        "typology_theme": "Sự Cứu Rỗi Bởi Đức Tin & Nhìn Xem Đấng Chịu Treo",
        "ot_anchor_ref": "Dân-số Ký 21:8-9",
        "ot_anchor_text": "Đức Giê-hô-va phán cùng Môi-se rằng: Hãy làm một con rắn lửa, rồi treo nó trên một cây sào. Hễ ai bị cắn ngó nó, thì sẽ được sống. Môi-se bèn đúc một con rắn bằng đồng.",
        "nt_fulfillment_ref": "Giăng 3:14-15; 8:28; 12:32",
        "nt_fulfillment_text": "Xưa Môi-se treo con rắn lên nơi đồng vắng thể nào, thì Con người cũng phải bị treo lên dường ấy, hầu cho hễ ai tin đến Ngài đều được sự sống đời đời.",
        "revelation_chain": [
            "Dân-số Ký 21:8-9 (Con Rắn Đồng Treo Nơi Cây Sào)",
            "2 Các Vua 18:4 (Dân Chúng Làm Biến Chất Thành Thần Tượng Nê-húc-than)",
            "Giăng 3:14-15 (Chính Chúa Giê-xu Tự Dẫn Ứng Nghiệm Về Mình)",
            "Giăng 12:32 (Khi Ta Được Nhấc Lên Khỏi Đất Sẽ Kéo Mọi Người Đến Cùng Ta)"
        ],
        "theological_synthesis": "Chính Chúa Giê-xu đối chiếu cái chết của Ngài với con rắn đồng: phương thuốc cứu mạng mang hình dáng của nguyên nhân gây chết chóc (rắn độc mang hình tội lỗi), nhưng hoàn toàn không mang nọc độc (Đấng vô tội trở nên tội lỗi thế cho chúng ta - 2 Cô 5:21).",
        "confidence_score": 0.95,
        "scholarly_source": "Phúc Âm Giăng & Các Biểu Tượng Tiên Tri Phúc Âm"
    },
    {
        "id": "typology-manna-bread-of-life",
        "connection_type": "allusion",
        "title": "Ma-na Từ Trời → Bánh Hằng Sống Cho Thế Gian",
        "typology_theme": "Bánh Sự Sống Nuôi Dưỡng Tâm Linh Đời Đời",
        "ot_anchor_ref": "Xuất Ê-díp-tô Ký 16:4, 14-15; Thi-thiên 78:24-25",
        "ot_anchor_text": "Nầy, ta sẽ từ trên trời mưa bánh xuống cho các ngươi... Dân Y-sơ-ra-ên thấy, bèn hỏi nhau rằng: Ma-na? Vì chẳng biết là vật chi. Môi-se bèn nói rằng: Ấy là bánh mà Đức Giê-hô-va ban cho các ngươi làm lương thực.",
        "nt_fulfillment_ref": "Giăng 6:31-35, 48-51",
        "nt_fulfillment_text": "Tổ phụ các ngươi đã ăn ma-na trong đồng vắng, rồi cũng chết. Đây là bánh từ trời xuống, hầu cho ai ăn không hề chết. Ta là bánh hằng sống từ trên trời xuống.",
        "revelation_chain": [
            "Xuất Ê-díp-tô Ký 16:4 (Mưa Bánh Từ Trên Trời Nuôi Dân Tộc)",
            "Thi-thiên 78:24 (Bánh Kẻ Sang Trọng - Bánh Thiên Sứ)",
            "Giăng 6:31-35 (Chúa Giê-xu Tuyên Bố: Ta Là Bánh Hằng Sống)",
            "1 Cô-rinh-tô 10:3 (Đều Đã Ăn Một Thứ Lương Thực Thiêng Liêng)",
            "Khải-huyền 2:17 (Kẻ Nào Thắng Ta Sẽ Ban Cho Ma-na Đang Giấu Kín)"
        ],
        "theological_synthesis": "Ma-na nuôi sống thể xác tạm thời trong đồng vắng trần gian, nhưng Đấng Christ là Ma-na thật từ Đức Chúa Cha ban xuống để ban sự sống tâm linh đời đời cho bất kỳ ai tiếp nhận Ngài qua đức tin.",
        "confidence_score": 0.90,
        "scholarly_source": "Khảo Luận Phúc Âm Giăng Đoạn 6 & Thần Học Bánh Sự Sống"
    },
    {
        "id": "typology-sign-of-jonah",
        "connection_type": "quotation",
        "title": "Giô-na Trong Bụng Cá Ba Ngày Ba Đêm → Sự Chết & Sống Lại Vinh Hiển",
        "typology_theme": "Dấu Lạ Sự Phục Sinh Của Đấng Christ",
        "ot_anchor_ref": "Giô-na 1:17; 2:1-10",
        "ot_anchor_text": "Đức Giê-hô-va sắm sẵn một con cá lớn đặng nuốt Giô-na; Giô-na ở trong bụng cá ba ngày và ba đêm... Đức Giê-hô-va bèn phán cùng con cá, và nó mửa Giô-na ra trên đất khô.",
        "nt_fulfillment_ref": "Ma-thi-ơ 12:39-40; 16:4; Lu-ca 11:29-30",
        "nt_fulfillment_text": "Dòng dõi dữ tợn và gian dâm nầy xin một dấu lạ; nhưng sẽ chẳng cho dấu lạ nào khác ngoài dấu lạ của đấng tiên tri Giô-na. Vì Giô-na đã ở trong bụng cá lớn ba ngày ba đêm, thì Con người cũng sẽ ở trong lòng đất ba ngày ba đêm thể ấy.",
        "revelation_chain": [
            "Giô-na 1:17 (Giô-na Trong Bụng Cá Ba Ngày Ba Đêm)",
            "Giô-na 2:1-10 (Lời Cầu Nguyện Từ Chốn Âm Phủ & Được Cứu Ra Đất Khô)",
            "Ma-thi-ơ 12:39-40 (Chúa Giê-xu Dẫn Dấu Lạ Giô-na Ứng Vào Sự Phục Sinh)",
            "1 Cô-rinh-tô 15:3-4 (Đấng Christ Chịu Chết, Chôn Và Đến Ngày Thứ Ba Sống Lại)"
        ],
        "theological_synthesis": "Sự cứu rỗi kỳ diệu của Giô-na sau ba ngày ba đêm như từ cõi chết sống lại là bằng cớ lịch sử tiên tri mà Chúa Giê-xu ấn chứng cho sự kiện chôn cất và sống lại khải hoàn của chính mình vào ngày thứ ba.",
        "confidence_score": 0.95,
        "scholarly_source": "Khảo Cứu Tiên Tri Nhỏ & Tin Lành Ma-thi-ơ"
    },
    {
        "id": "typology-tabernacle-incarnation",
        "connection_type": "parallel",
        "title": "Đền Tạm Nơi Đồng Vắng → Ngôi Lời Hóa Thân Thành Nhục Thể",
        "typology_theme": "Đức Chúa Trời Cư Ngụ Giữa Tuyển Dân (Shekinah)",
        "ot_anchor_ref": "Xuất Ê-díp-tô Ký 25:8; 40:34-35",
        "ot_anchor_text": "Họ sẽ làm cho ta một đền thánh và ta sẽ ở giữa họ... Áng mây bao phủ hội mạc, và sự vinh hiển của Đức Giê-hô-va đầy dẫy đền tạm.",
        "nt_fulfillment_ref": "Giăng 1:14; Hê-bơ-rơ 9:11; Khải-huyền 21:3",
        "nt_fulfillment_text": "Ngôi Lời đã trở nên xác thịt, ở giữa chúng ta, đầy ơn và lẽ thật; chúng ta đã ngắm xem sự vinh hiển của Ngài, thật như vinh hiển của Con một đến từ Nơi Cha.",
        "revelation_chain": [
            "Xuất Ê-díp-tô Ký 25:8 (Lập Đền Tạm Để Chúa Ngự Giữa Dân Sự)",
            "1 Các Vua 8:10-11 (Vinh Quang Chúa Đầy Dẫy Đền Thờ Sa-lô-môn)",
            "Giăng 1:14 (Ngôi Lời Cắm Trại [eskēnōsen] Giữa Loài Người)",
            "Hê-bơ-rơ 9:11 (Đấng Christ Đi Qua Đền Tạm Lớn Hơn & Trọn Vẹn Hơn)",
            "Khải-huyền 21:3 (Đền Tạm Đức Chúa Trời Ở Cùng Loài Người)"
        ],
        "theological_synthesis": "Trong tiếng Hy Lạp, từ 'ở giữa chúng ta' tại Giăng 1:14 mang nghĩa đen là 'cắm trại/dựng đền tạm' (eskēnōsen). Toàn bộ cấu trúc Đền Tạm, Bàn Thờ Khảo Của Lễ, Thùng Rửa, Chân Đèn Vàng, Bàn Bánh Trưng Bày, Bàn Thờ Xông Hương và Hòm Giao Ước đều là bức tranh sống động mô tả các phương diện cứu rỗi của Đấng Christ.",
        "confidence_score": 0.85,
        "scholarly_source": "Khảo Luận Đền Tạm Môi-se & Ý Nghĩa Thuộc Linh Tân Ước"
    },
    {
        "id": "typology-suffering-servant",
        "connection_type": "explicit",
        "title": "Người Đầy Tớ Chịu Khổ Trong Ê-sai → Đấng Chịu Đóng Đinh Đền Tội",
        "typology_theme": "Sự Đền Tội Thay Thế Của Đấng Cứu Thế (Penal Substitution)",
        "ot_anchor_ref": "Ê-sai 53:4-7, 11-12",
        "ot_anchor_text": "Thật người đã mang sự tật nguyền của chúng ta, đã gánh sự đau ốm của chúng ta... Nhưng người đã vì tội phạm chúng ta mà bị vết, vì sự gian ác chúng ta mà bị thương. Bởi sự sửa phạt người chịu chúng ta được bình an, bởi lằn đòn người chúng ta được lành bịnh.",
        "nt_fulfillment_ref": "Công-vụ 8:32-35; 1 Phi-e-rơ 2:22-25; Ma-thi-ơ 8:17",
        "nt_fulfillment_text": "Phi-líp bèn mở miệng, khởi từ chỗ Kinh Thánh đó, mà giảng dạy Đức Chúa Giê-xu cho người... Ngài gánh tội lỗi chúng ta trong thân thể Ngài trên cây gỗ, hầu cho chúng ta là kẻ đã chết về tội lỗi, được sống cho sự công bình.",
        "revelation_chain": [
            "Ê-sai 53:4-7 (Bị Vết Vì Tội Lỗi Chúng Ta, Như Chiên Câm Lặng)",
            "Ma-thi-ơ 8:17 (Gánh Lấy Sự Tật Nguyền Yếu Đuối Của Chúng Ta)",
            "Công-vụ 8:32-35 (Quan Hoạn Ê-thi-ô-bi Nhận Biết Đấng Christ Qua Ê-sai 53)",
            "Rô-ma 4:25 (Ngài Đã Bị Nộp Vì Tội Lỗi Chúng Ta)",
            "1 Phi-e-rơ 2:24 (Bởi Lằn Đòn Của Ngài Mà Anh Em Được Lành Bệnh)"
        ],
        "theological_synthesis": "Ê-sai 53 là 'Chương Tin Lành thứ năm' chép trước hơn 700 năm, mô tả tường tận sự thương khó, im lặng trước kẻ kết án, chôn cùng người giàu (Giô-sép người A-ri-ma-thê) và sự tôn cao đắc thắng của Chúa Giê-xu.",
        "confidence_score": 1.0,
        "scholarly_source": "Bài Hát Về Người Đầy Tớ (Servant Songs) & Luận đề Chuộc Tội"
    },
    {
        "id": "prophecy-virgin-birth",
        "connection_type": "explicit",
        "title": "Sinh Bởi Nữ Đồng Trinh (Em-ma-nu-ên) → Giáng Sinh Siêu Nhiên Của Đấng Christ",
        "typology_theme": "Sự Giáng Sinh Siêu Nhiên Của Đấng Cứu Thế",
        "ot_anchor_ref": "Ê-sai 7:14",
        "ot_anchor_text": "Vậy nên, chính Chúa sẽ ban một điềm cho các ngươi: Nầy, một gái đồng trinh sẽ chịu thai, sanh một con trai, và đặt tên là Em-ma-nu-ên.",
        "nt_fulfillment_ref": "Ma-thi-ơ 1:22-23; Lu-ca 1:31-35",
        "nt_fulfillment_text": "Mọi việc nầy đã xảy ra để cho ứng nghiệm lời Chúa đã phán bởi đấng tiên tri rằng: Nầy, một gái đồng trinh sẽ chịu thai, sanh một con trai, rồi người ta sẽ đặt tên con trai đó là Em-ma-nu-ên, nghĩa là: Đức Chúa Trời ở cùng chúng ta.",
        "revelation_chain": [
            "Sáng-thế Ký 3:15 (Lời hứa dòng dõi người nữ)",
            "Ê-sai 7:14 (Nữ đồng trinh chịu thai sinh con trai Em-ma-nu-ên)",
            "Ma-thi-ơ 1:18-25 (Ma-ri chịu thai bởi Đức Thánh Linh)",
            "Lu-ca 1:34-35 (Thánh Linh sẽ ngự trên ngươi và quyền phép Đấng Rất Cao che phủ)"
        ],
        "theological_synthesis": "Đấng Cứu Thế phải hoàn toàn vô tội và siêu việt khỏi di truyền tội tổ tông A-đam, đồng thời là Đức Chúa Trời đích thân ngự giữa loài người để cứu rỗi nhân loại.",
        "confidence_score": 1.0,
        "scholarly_source": "Khảo Luận Tiên Tri Ê-sai & Thần Học Nhục Thể Incarnation"
    },
    {
        "id": "prophecy-birthplace-bethlehem",
        "connection_type": "explicit",
        "title": "Nơi Giáng Sinh Tại Bết-lê-hem Ép-ra-ta → Chúa Sinh Tại Thành Đa-vít",
        "typology_theme": "Địa Điểm Giáng Sinh Theo Biên Niên Tiên Tri",
        "ot_anchor_ref": "Mi-chê 5:2",
        "ot_anchor_text": "Hỡi Bết-lê-hem Ép-ra-ta, ngươi ở trong hàng ngàn Giu-đa là nhỏ lắm, song từ nơi ngươi sẽ ra cho ta một Đấng cai trị trong Y-sơ-ra-ên, gốc tích của Ngài bởi từ đời xưa, từ trước vô cùng.",
        "nt_fulfillment_ref": "Ma-thi-ơ 2:1-6; Lu-ca 2:4-7",
        "nt_fulfillment_text": "Khi Đức Chúa Giê-xu đã sanh tại thành Bết-lê-hem, xứ Giu-đê... Vì có lời của đấng tiên tri chép rằng: Hỡi Bết-lê-hem, đất Giu-đa, thật ngươi chẳng kém gì các thành lớn của xứ Giu-đa đâu; vì từ nơi ngươi sẽ ra một tướng, là Đấng chăn dân Y-sơ-ra-ên của ta.",
        "revelation_chain": [
            "Sáng-thế Ký 35:19 (Ê-phơ-rát tức là Bết-lê-hem)",
            "Ru-tơ 4:11 (Nổi danh tại Bết-lê-hem)",
            "Mi-chê 5:2 (Đấng cai trị đời xưa xuất thân từ Bết-lê-hem)",
            "Lu-ca 2:4-7 (Giô-sép và Ma-ri từ Na-xa-rét về thành Bết-lê-hem làm kiểm tra dân số)",
            "Ma-thi-ơ 2:5-6 (Các thầy thông giáo trích dẫn Mi-chê 5:2 ứng nghiệm)"
        ],
        "theological_synthesis": "Đấng Cai Trị Đời Đời giáng sinh tại 'Nhà Bánh' (Beth-lehem), một ngôi làng nhỏ bé khiêm nhường, làm trọn lời hứa quân vương đời đời dòng dõi Đa-vít.",
        "confidence_score": 1.0,
        "scholarly_source": "Tiên Tri Nhỏ Mi-chê & Khảo Cứu Lịch Sử Giáng Sinh Tân Ước"
    },
    {
        "id": "prophecy-triumphal-entry",
        "connection_type": "explicit",
        "title": "Vua Nhu Mì Cỡi Lừa Con Vào Giê-ru-sa-lem → Chúa Nhật Lễ Lá Khải Hoàn",
        "typology_theme": "Vua Khiêm Nhường Của Sự Bình An",
        "ot_anchor_ref": "Xa-cha-ri 9:9",
        "ot_anchor_text": "Hỡi con gái Si-ôn, hãy mừng rỡ cả thể! Hỡi con gái Giê-ru-sa-lem, hãy trỗi tiếng reo vui! Nầy, Vua ngươi đến cùng ngươi. Ngài là công bình và ban sự cứu rỗi, nhu mì và cỡi lừa, tức là lừa con của lừa cái.",
        "nt_fulfillment_ref": "Ma-thi-ơ 21:4-9; Giăng 12:12-16",
        "nt_fulfillment_text": "Mọi việc nầy xảy ra để ứng nghiệm lời đấng tiên tri: Hãy nói với con gái Si-ôn rằng: Nầy, Vua ngươi đến cùng ngươi, nhu mì, cỡi lừa, và lừa con của một con vật mang ách... Đoàn dân hô lớn: Hô-sa-na Con vua Đa-vít!",
        "revelation_chain": [
            "Sáng-thế Ký 49:11 (Buộc lừa con mình vào gốc nho)",
            "Xa-cha-ri 9:9 (Vua công bình, nhu mì cỡi lừa con)",
            "Thi-thiên 118:25-26 (Chúc tụng Đấng nhân danh Đức Giê-hô-va mà đến)",
            "Ma-thi-ơ 21:4-9 (Chúa Giê-xu vào Giê-ru-sa-lem giữa tiếng reo Hô-sa-na)"
        ],
        "theological_synthesis": "Không như các hoàng đế trần gian cỡi chiến mã đại diện cho gươm giáo và áp bức, Đấng Mê-si-a vào đô thành thánh trên lưng lừa con hiền hòa, mang lại hòa bình và sự cứu chuộc cho toàn nhân loại.",
        "confidence_score": 1.0,
        "scholarly_source": "Tiên Tri Xa-cha-ri & Tuần Lễ Thương Khó"
    },
    {
        "id": "prophecy-pierced-crucifixion",
        "connection_type": "explicit",
        "title": "Bị Đâm Thủng Tay Chân & Bắt Thăm Áo → Thập Tự Giá Gô-gô-tha",
        "typology_theme": "Chi Tiết Sự Đóng Đinh Được Báo Trước Hơn 1000 Năm",
        "ot_anchor_ref": "Thi-thiên 22:1, 16-18; Xa-cha-ri 12:10",
        "ot_anchor_text": "Đức Chúa Trời tôi ôi! Đức Chúa Trời tôi ôi! sao Ngài lìa bỏ tôi?... Chúng nó đã đâm lủng tay và chân tôi. Tôi có thể đếm các xương tôi. Chúng nó chia nhau áo xống tôi, và bắt thăm lấy áo dài tôi.",
        "nt_fulfillment_ref": "Ma-thi-ơ 27:35, 46; Giăng 19:23-24, 34-37",
        "nt_fulfillment_text": "Đến giờ thứ chín, Đức Chúa Giê-xu kêu tiếng lớn rằng: Ê-li, Ê-li, lam-ma sa-bách-tha-ni? nghĩa là: Đức Chúa Trời tôi ôi, Đức Chúa Trời tôi ôi, sao Ngài lìa bỏ tôi?... Quân lính bắt thăm lấy áo Ngài để ứng nghiệm lời Kinh Thánh.",
        "revelation_chain": [
            "Thi-thiên 22:1-18 (Lời tiên tri tường tận về cái chết đóng đinh)",
            "Xa-cha-ri 12:10 (Họ sẽ nhìn xem Ta là Đấng họ đã đâm)",
            "Ma-thi-ơ 27:35-46 (Lời kêu trên thập tự và lính la-mã bắt thăm áo)",
            "Giăng 19:34-37 (Lính lấy giáo đâm sườn Ngài chảy huyết và nước)"
        ],
        "theological_synthesis": "Thi Thiên 22 được Đa-vít viết khi hình phạt đóng đinh trên thập tự giá thậm chí chưa hề xuất hiện trong lịch sử nhân loại, là bằng chứng tiên tri chấn động về cái chết cứu chuộc của Đấng Christ.",
        "confidence_score": 1.0,
        "scholarly_source": "Thi Thiên Đấng Mê-si & Khảo Chứng Thập Tự Giá"
    },
    {
        "id": "prophecy-resurrection-incorruptible",
        "connection_type": "explicit",
        "title": "Thân Thể Không Thấy Sự Hư Nát → Sự Phục Sinh Ngày Thứ Ba",
        "typology_theme": "Đắc Thắng Tử Thần & Sự Phục Sinh Thân Thể",
        "ot_anchor_ref": "Thi-thiên 16:9-10; Hô-sê 6:2",
        "ot_anchor_text": "Vì Chúa sẽ chẳng bỏ linh hồn tôi nơi âm phủ, cũng không để cho người thánh Chúa thấy sự hư nát.",
        "nt_fulfillment_ref": "Công-vụ 2:25-32; 13:34-37; 1 Cô-rinh-tô 15:3-4",
        "nt_fulfillment_text": "Đa-vít đã thấy trước và nói về sự sống lại của Đấng Christ rằng: Ngài không bị bỏ nơi âm phủ, và xác thịt Ngài chẳng thấy sự hư nát. Đức Chúa Giê-xu nầy, Đức Chúa Trời đã khiến sống lại, và chúng tôi thảy đều làm chứng về điều đó.",
        "revelation_chain": [
            "Thi-thiên 16:10 (Chẳng để người thánh thấy sự hư nát)",
            "Hô-sê 6:2 (Đến ngày thứ ba Ngài sẽ dựng chúng ta dậy)",
            "Ma-thi-ơ 28:5-6 (Ngài sống lại rồi như lời Ngài đã phán)",
            "Công-vụ 2:27-31 (Bài giảng Ngũ Tuần của Phi-e-rơ luận chứng sự phục sinh)"
        ],
        "theological_synthesis": "Sự phục sinh không phải là một ý tưởng biểu tượng mà là biến cố lịch sử có bằng cớ không thể chối cãi. Đa-vít đã qua đời, chôn và mả ông còn lại, nhưng Chúa Giê-xu đã phục sinh thân thể khải hoàn để ban sự sống đời đời cho nhân loại.",
        "confidence_score": 1.0,
        "scholarly_source": "Luận Chứng Phục Sinh & Bài Giảng Ngũ Tuần Công Vụ 2"
    },
    {
        "id": "prophecy-betrayal-thirty-silver",
        "connection_type": "explicit",
        "title": "Bị Bán Với Giá Ba Mươi Miếng Bạc → Sự Phản Bội & Ruộng Thợ Gốm",
        "typology_theme": "Giá Bán Của Nô Lệ & Ruộng Huyết",
        "ot_anchor_ref": "Xa-cha-ri 11:12-13; Thi-thiên 41:9",
        "ot_anchor_text": "Họ bèn cân ba mươi miếng bạc làm tiền công cho ta. Đức Giê-hô-va phán cùng ta rằng: Hãy ném giá sang trọng ấy... cho thợ gốm. Ta bèn lấy ba mươi miếng bạc ném vào nhà Đức Giê-hô-va cho thợ gốm.",
        "nt_fulfillment_ref": "Ma-thi-ơ 26:14-16; 27:3-10",
        "nt_fulfillment_text": "Giu-đa hỏi: Các thầy bằng lòng trả cho tôi bao nhiêu để tôi nộp người?... Họ cân cho ba mươi miếng bạc... Khi ăn năn, Giu-đa ném bạc vào đền thờ rồi đi thắt cổ. Các thầy tế lễ bèn dùng bạc ấy mua Ruộng Thợ Gốm làm nơi chôn người ngụ cư.",
        "revelation_chain": [
            "Thi-thiên 41:9 (Người bạn quen thân cùng ăn bánh giở gót nghịch cùng tôi)",
            "Xa-cha-ri 11:12-13 (Giá ba mươi miếng bạc ném cho thợ gốm trong nhà Đức Chúa Trời)",
            "Ma-thi-ơ 26:14-15 (Giu-đa ngã giá 30 miếng bạc)",
            "Ma-thi-ơ 27:3-10 (Ứng nghiệm sự mua ruộng thợ gốm)"
        ],
        "theological_synthesis": "30 miếng bạc là giá tiền bồi thường cho một người nô lệ bị bò húc theo luật Môi-se (Xuất 21:32). Sự ứng nghiệm kinh ngạc từ số lượng tiền bạc, việc ném vào đền thờ đến việc dùng tiền mua ruộng người thợ gốm chứng minh quyền tể trị tuyệt đối của Đức Chúa Trời trên lịch sử.",
        "confidence_score": 1.0,
        "scholarly_source": "Khảo Cứu Tiên Tri Xa-cha-ri & Bi Kịch Giu-đa"
    }
]


@router.get("/connections", response_model=List[CrossBibleConnection])
def get_cross_bible_connections(
    connection_type: Optional[str] = Query(None, description="explicit, quotation, allusion, parallel, scholarly_interpretation, AI_suggested"),
    search: Optional[str] = Query(None, description="Search keyword in title, theme or references"),
    limit: int = Query(20, ge=1, le=50)
):
    """
    Fetch canonical Typological and Prophetic Cross-Bible Connections (§18).
    Distinguishes strictly between explicit, quotation, allusion, parallel,
    scholarly interpretation and AI suggestions.
    """
    results = CONNECTIONS_DATA

    if connection_type and connection_type != "all":
        results = [c for c in results if c["connection_type"] == connection_type]

    if search:
        s = search.lower()
        results = [
            c for c in results
            if s in c["title"].lower()
            or s in c["typology_theme"].lower()
            or s in c["ot_anchor_ref"].lower()
            or s in c["nt_fulfillment_ref"].lower()
            or s in c["theological_synthesis"].lower()
        ]

    return results[:limit]


@router.get("/prophecies")
def get_messianic_prophecies_matrix(
    theme: Optional[str] = Query(None, description="Theme filter keyword, e.g. 'Giáng Sinh', 'Thương Khó', 'Phục Sinh'"),
    search: Optional[str] = Query(None, description="Search keyword"),
    limit: int = Query(30, ge=1, le=100)
):
    """
    §18, §45 — Returns the comprehensive Old Testament Prophecy ↔ New Testament Fulfillment Matrix.
    Provides structured comparative data between prophetic foretelling and historical apostolic fulfillment.
    """
    results = CONNECTIONS_DATA

    if theme and theme != "all":
        t = theme.lower()
        results = [c for c in results if t in c["typology_theme"].lower() or t in c["title"].lower()]

    if search:
        s = search.lower()
        results = [
            c for c in results
            if s in c["title"].lower()
            or s in c["typology_theme"].lower()
            or s in c["ot_anchor_ref"].lower()
            or s in c["nt_fulfillment_ref"].lower()
            or s in c["ot_anchor_text"].lower()
            or s in c["nt_fulfillment_text"].lower()
            or s in c["theological_synthesis"].lower()
        ]

    return {
        "total_connections": len(results),
        "categories": [
            "Tất Cả",
            "Giáng Sinh & Nhập Thể",
            "Chức Vụ & Đấng Chăn Chiên",
            "Thương Khó & Thập Tự Giá",
            "Phục Sinh & Vinh Hiển",
            "Giao Ước & Thầy Tế Lễ"
        ],
        "prophecies": results[:limit]
    }


# ==============================================================================
# Topical Thematic Map Visualizer & Covenant Trajectories (§17, §18)
# ==============================================================================

THEMATIC_CATALOG: Dict[str, Dict[str, Any]] = {
    "covenant_redemption": {
        "id": "covenant_redemption",
        "title_vi": "Giao Ước Cứu Chuộc & Tiến Trình Cứu Rỗi",
        "title_en": "Covenant of Redemption & Historical Unfolding",
        "category": "Thần Học Giao Ước (Covenant Theology)",
        "color": "#f59e0b",
        "badge_class": "amber",
        "golden_verse": "Sáng-thế Ký 3:15 / Giê-rê-mi 31:31 / Hê-bơ-rơ 8:6",
        "summary": "Tiến trình giao ước đời đời bất biến của Ba Ngôi Đức Chúa Trời từ Giao ước Sơ Khởi (Protoevangelium) đến Giao Ước Mới trong Huyết Đấng Christ.",
        "redemptive_thesis": "Mọi giao ước lịch sử trong Cựu Ước (Áp-ra-ham, Xi-na-i, Đa-vít) đều là những bóng mờ sư phạm tiệm tiến hướng đến sự ứng nghiệm trọn vẹn và tối hậu trong Giao Ước Mới được đóng ấn bằng chính Thập Tự Giá của Chúa Cứu Thế Giê-xu.",
        "scriptures": [
            {"ref": "Sáng-thế Ký 3:15", "testament": "OT", "role": "Giao Ước Sơ Khởi (Protoevangelium)", "key_phrase": "Dòng dõi người nữ sẽ giày đạp đầu con rắn"},
            {"ref": "Sáng-thế Ký 12:1-3", "testament": "OT", "role": "Giao Ước Áp-ra-ham", "key_phrase": "Các chi tộc nơi thế gian sẽ nhờ ngươi mà được phước"},
            {"ref": "Xuất Ê-díp-tô Ký 24:7-8", "testament": "OT", "role": "Giao Ước Xi-na-i (Luật Pháp)", "key_phrase": "Nầy là huyết của sự giao ước mà Đức Giê-hô-va đã lập"},
            {"ref": "II Sa-mu-ên 7:12-16", "testament": "OT", "role": "Giao Ước Đa-vít (Vương Quyền)", "key_phrase": "Ta sẽ lập ngôi nước người vững bền đời đời"},
            {"ref": "Giê-rê-mi 31:31-34", "testament": "OT", "role": "Lời Tiên Tri Giao Ước Mới", "key_phrase": "Ta sẽ ghi tạc luật pháp Ta vào lòng chúng nó"},
            {"ref": "Lu-ca 22:20", "testament": "NT", "role": "Thiết Lập Giao Ước Mới", "key_phrase": "Chén nầy là giao ước mới trong huyết Ta vì các ngươi"},
            {"ref": "Hê-bơ-rơ 8:6-13", "testament": "NT", "role": "Đấng Trung Bảo Giao Ước Tốt Hơn", "key_phrase": "Ngài là Đấng trung bảo của giao ước tốt hơn"},
            {"ref": "Khải-huyền 21:1-4", "testament": "NT", "role": "Sự Hoàn Thành Tối Hậu Của Giao Ước", "key_phrase": "Đức Chúa Trời sẽ ở với họ và họ sẽ làm dân Ngài"}
        ],
        "characters": [
            {"name": "Áp-ra-ham", "role": "Tổ phụ của giao ước đức tin", "testament": "OT", "era": "Tổ Phụ", "significance": "Nhận lời hứa về đất hứa, dòng dõi và nguồn phước cho muôn dân tộc."},
            {"name": "Môi-se", "role": "Người trung bảo giao ước luật pháp", "testament": "OT", "era": "Xuất Hành", "significance": "Đưa dân sự ra khỏi Ai Cập, nhận bảng chứng giao ước tại núi Si-na-i."},
            {"name": "Đa-vít", "role": "Vua theo lòng Chúa", "testament": "OT", "era": "Vương Quốc Thống Nhất", "significance": "Nhận giao ước vương quyền đời đời dẫn đến Đấng Mê-si."},
            {"name": "Chúa Giê-xu", "role": "Đấng Trung Bảo Tối Thượng", "testament": "NT", "era": "Cuộc Đời Chúa Giê-xu", "significance": "Đổ huyết chuộc tội trên Thập Tự Giá để đóng ấn Giao Ước Mới vĩnh cửu."}
        ],
        "events": [
            {"name": "Lời Hứa Tại Vườn Ê-đen", "period": "Thuở Ban Đầu", "significance": "Tuyên bố đầu tiên về sự đắc thắng của Đấng Mê-si trên Sa-tan."},
            {"name": "Giao Ước Cắt Bì Áp-ra-ham", "period": "Tổ Phụ", "significance": "Dấu hiệu thánh thể hiện sự biệt riêng thuộc về Đức Chúa Trời."},
            {"name": "Lễ Vượt Qua Tại Ai Cập", "period": "Xuất Hành", "significance": "Huyết chiên con bôi trên mày cửa bảo toàn mạng sống tuyển dân."},
            {"name": "Bữa Tiệc Ly & Lễ Tiệc Thánh", "period": "Cuộc Đời Chúa Giê-xu", "significance": "Chúa Giê-xu công bố Chén Giao Ước Mới trước khi chịu thương khó."}
        ],
        "doctrines": [
            {"name": "Giao Ước Ân Điển (Covenant of Grace)", "summary": "Chương trình cứu chuộc đời đời đặt trên công đức duy nhất của Đấng Christ thay vì việc lành luật pháp."},
            {"name": "Mặc Khải Tiệm Tiến (Progressive Revelation)", "summary": "Chân lý cứu rỗi mở ra từng bước trong lịch sử từ mờ ảo đến sáng tỏ trọn vẹn."},
            {"name": "Sự Trung Bảo Duy Nhất (Sole Mediation)", "summary": "Chỉ có một Đức Chúa Trời và chỉ có một Đấng Trung Bảo duy nhất giữa Đức Chúa Trời và loài người: Đức Chúa Giê-xu Christ."}
        ],
        "eras_progression": [
            {"era_name": "Sáng Tạo & Sa Ngã", "revelation_step": "Giao ước việc làm bị phá vỡ; Lời hứa cứu rỗi đầu tiên (Sáng 3:15).", "scripture": "Sáng-thế Ký 3:15", "focus": "Hạt giống khởi đầu"},
            {"era_name": "Tổ Phụ", "revelation_step": "Giao ước vô điều kiện với Áp-ra-ham qua đức tin và lời hứa ban phước muôn dân.", "scripture": "Sáng-thế Ký 12:1-3", "focus": "Dòng dõi và Đất Hứa"},
            {"era_name": "Xuất Hành & Đồng Vắng", "revelation_step": "Giao ước luật pháp Xi-na-i: chức tế lễ, đền tạm và hệ thống hiến tế làm bóng.", "scripture": "Xuất Ê-díp-tô Ký 24:7-8", "focus": "Thánh khiết và Luật pháp"},
            {"era_name": "Vương Quốc Thống Nhất", "revelation_step": "Giao ước vương triều Đa-vít: Ngôi vua Đấng Mê-si trị vì muôn đời.", "scripture": "II Sa-mu-ên 7:12-16", "focus": "Vương quyền Đấng Mê-si"},
            {"era_name": "Lưu Đày & Tiên Tri", "revelation_step": "Các tiên tri loan báo giao ước cũ bị vi phạm và hứa ban Giao Ước Mới đổi mới lòng dạ.", "scripture": "Giê-rê-mi 31:31-34", "focus": "Tấm lòng tái sinh"},
            {"era_name": "Cuộc Đời Chúa Giê-xu", "revelation_step": "Đấng Christ hoàn thành luật pháp và đóng ấn Giao Ước Mới bằng Huyết báu trên Thập tự.", "scripture": "Lu-ca 22:20", "focus": "Sự chuộc tội trọn vẹn"},
            {"era_name": "Hội Thánh Ban Đầu", "revelation_step": "Phúc Âm giao ước được rao truyền cho muôn dân; dân ngoại cùng dự phần giao ước đức tin.", "scripture": "Ê-phê-sô 2:12-13", "focus": "Hiệp nhất trong Thân Thể"},
            {"era_name": "Khải Huyền & Vinh Hiển", "revelation_step": "Lời hứa giao ước tối hậu: Đức Chúa Trời ngự giữa dân Ngài trong Thành Thánh Giê-ru-sa-lem Mới.", "scripture": "Khải-huyền 21:3", "focus": "Sự sống đời đời trọn vẹn"}
        ],
        "citations": [
            {"author": "J.I. Packer", "work": "Knowing God", "quote": "Giao ước ân điển không phải là kế hoạch cứu vãn dự phòng của Đức Chúa Trời, mà là mục đích đời đời của Ngài để đem một dân tộc được chuộc vào sự tương giao hiệp một mật thiết với chính Ba Ngôi.", "tradition": "Reformed Evangelical"},
            {"author": "F.F. Bruce", "work": "The Epistle to the Hebrews (NICNT)", "quote": "Chúa Giê-xu không chỉ là Đấng thiết lập Giao Ước Mới, chính Ngài là sự bảo đảm sống động cho giao ước ấy — một giao ước vượt trội hơn mọi giao ước cũ về cả phẩm chất, hiệu lực và tính vĩnh cửu.", "tradition": "New Testament Exegesis"}
        ],
        "homiletical_outline": {
            "title": "Giao Ước Đời Đời: Từ Lời Hứa Sa Ngã Đến Vinh Quang Thập Tự",
            "scripture_main": "Giê-rê-mi 31:31-34 & Hê-bơ-rơ 8:6-13",
            "points": [
                {
                    "point_number": 1,
                    "title": "Sự Bất Toàn Của Giao Ước Cũ và Sự Bất Thành Tín Của Con Người",
                    "scripture": "Xuất 24:7; Hê-bơ-rơ 8:7-9",
                    "exposition": "Luật pháp là thánh khiết và công bình, nhưng không thể ban năng lực cho bản tính xác thịt tội lỗi. Con người luôn thất bại trong việc gìn giữ giao ước việc làm.",
                    "application": "Nhận thức sự bất lực hoàn toàn của công đức cá nhân để từ bỏ sự tự công bình và chạy đến nơi ẩn náu của ân điển."
                },
                {
                    "point_number": 2,
                    "title": "Sự Thiết Lập Giao Ước Mới Đóng Ấn Bằng Huyết Đấng Christ",
                    "scripture": "Lu-ca 22:20; Hê-bơ-rơ 9:11-15",
                    "exposition": "Đấng Christ đứng làm Người Đại Diện và Đấng Bảo Đảm cho chúng ta. Ngài đổ huyết thanh tẩy lương tâm khỏi các công việc chết để phụng sự Đức Chúa Trời hằng sống.",
                    "application": "Duyệt xét lòng biết ơn sâu sắc mỗi khi dự Tiệc Thánh: chúng ta thuộc về Giao Ước Mới của tình yêu và sự tha thứ trọn vẹn."
                },
                {
                    "point_number": 3,
                    "title": "Đời Sống Mới Dưới Luật Pháp Tình Yêu Ghi Tạc Trong Lòng",
                    "scripture": "Giê-rê-mi 31:33-34; II Cô-rinh-tô 3:3-6",
                    "exposition": "Đức Thánh Linh ngự vào lòng người tin, ban bản tính mới và sự khao khát vâng phục Lời Chúa từ động cơ tình yêu biết ơn chứ không bởi nỗi sợ hãi hình phạt.",
                    "application": "Bước đi theo Thánh Linh mỗi ngày, thể hiện lòng trung tín của một dân tộc giao ước giữa thế gian hư hoại."
                }
            ],
            "reflection_questions": [
                "Làm thế nào để phân biệt sự vâng lời dưới Luật pháp (sợ hãi) và sự vâng lời dưới Giao Ước Ân Điển (yêu thương)?",
                "Ý nghĩa việc Chúa Giê-xu là 'Đấng Bảo Đảm' (Surety) của Giao Ước đem lại sự an ninh cứu rỗi cho bạn như thế nào?"
            ]
        }
    },
    "grace_faith": {
        "id": "grace_faith",
        "title_vi": "Ân Điển & Đức Tin Cứu Rỗi",
        "title_en": "Grace, Faith & Justification (Sola Gratia, Sola Fide)",
        "category": "Cứu Rỗi Học (Soteriology)",
        "color": "#3b82f6",
        "badge_class": "blue",
        "golden_verse": "Sáng-thế Ký 15:6 / Ê-phê-sô 2:8-9 / Rô-ma 5:1",
        "summary": "Nền tảng của sự xưng công bình duy bởi đức tin và ân điển nhưng không, từ chiếc áo da thú của A-đam đến thần học Phao-lô.",
        "redemptive_thesis": "Đức tin không phải là một công đức hay tác phẩm của con người để đổi lấy sự cứu chuộc, mà là bàn tay không trống rỗng tiếp nhận món quà ân điển vô điều kiện mà Đức Chúa Trời đã hoàn tất trọn vẹn trong Đấng Christ.",
        "scriptures": [
            {"ref": "Sáng-thế Ký 15:6", "testament": "OT", "role": "Nền Tảng Đức Tin Xưng Công Bình", "key_phrase": "Áp-ram tin Đức Giê-hô-va, thì Ngài kể sự đó là công bình cho người"},
            {"ref": "Ha-ba-cúc 2:4", "testament": "OT", "role": "Khẩu Hiệu Tiên Tri Đức Tin", "key_phrase": "Người công bình sẽ sống bởi đức tin mình"},
            {"ref": "Rô-ma 3:23-26", "testament": "NT", "role": "Ân Điển Nhưng Không Qua Sự Cứu Chuộc", "key_phrase": "Được xưng công bình nhưng không bởi ân điển Ngài"},
            {"ref": "Rô-ma 5:1-2", "testament": "NT", "role": "Hòa Thuận Lại Với Đức Chúa Trời", "key_phrase": "Đã được xưng công bình bởi đức tin, chúng ta được hòa thuận với Đức Chúa Trời"},
            {"ref": "Ga-la-ti 2:16", "testament": "NT", "role": "Không Bởi Việc Làm Của Luật Pháp", "key_phrase": "Chẳng phải bởi việc làm của luật pháp, bèn là bởi đức tin trong Đức Chúa Giê-xu"},
            {"ref": "Ê-phê-sô 2:8-10", "testament": "NT", "role": "Ân Điển Nhờ Đức Tin Để Làm Việc Lành", "key_phrase": "Nhờ ân điển, bởi đức tin, mà anh em được cứu; điều đó không phải đến từ anh em"},
            {"ref": "Hê-bơ-rơ 11:1-6", "testament": "NT", "role": "Bản Chất Của Đức Tin Thật", "key_phrase": "Đức tin là sự biết chắc vững vàng của những điều mình đang trông mong"}
        ],
        "characters": [
            {"name": "Áp-ra-ham", "role": "Gương mẫu đức tin xưng công bình", "testament": "OT", "era": "Tổ Phụ", "significance": "Tin vào lời hứa của Đức Chúa Trời trước khi chịu phép cắt bì."},
            {"name": "Đa-vít", "role": "Người kinh nghiệm phước hạnh tha thứ", "testament": "OT", "era": "Vương Quốc Thống Nhất", "significance": "Được xưng công bình khi xưng tội trong Thi thiên 32."},
            {"name": "Sứ đồ Phao-lô", "role": "Nhà thần học của Ân điển", "testament": "NT", "era": "Hội Thánh Ban Đầu", "significance": "Biện minh giáo lý Sola Gratia chống lại chủ nghĩa luật pháp hẹp hòi."}
        ],
        "events": [
            {"name": "Chiếc Áo Da Thú Cứu Chuộc", "period": "Thuở Ban Đầu", "significance": "Đức Chúa Trời lấy da thú làm áo che sự lõa lồ hổ thẹn của con người sa ngã."},
            {"name": "Áp-ram Tin Lời Hứa Đêm Sao", "period": "Tổ Phụ", "significance": "Nhìn lên bầu trời đầy sao và tin cậy tuyệt đối vào quyền năng Chúa."},
            {"name": "Sự Đổi Mới Của Phao-lô Trên Đường Đa-mách", "period": "Hội Thánh Ban Đầu", "significance": "Từ kẻ nhiệt thành luật pháp bắt bớ đạo trở thành sứ đồ của ân điển."}
        ],
        "doctrines": [
            {"name": "Xưng Công Bình (Justification)", "summary": "Hành vi pháp lý tối cao của Đức Chúa Trời tuyên bố tội nhân là vô tội và công chính nhờ công đức gán ghép của Đấng Christ."},
            {"name": "Ân Điển Bất Khả Kháng (Irresistible Grace)", "summary": "Tình yêu chủ động của Đức Thánh Linh đánh thức và tái sinh tấm lòng chai đá để tự do quay về tin nhận Chúa."},
            {"name": "Đức Tin Sống Động (Living Faith)", "summary": "Đức tin thật không đứng đơn độc; đức tin cứu rỗi tự nhiên sinh ra bông trái việc lành yêu thương."}
        ],
        "eras_progression": [
            {"era_name": "Sáng Tạo & Sa Ngã", "revelation_step": "Ân điển che chở chiếc áo da thú khi con người thất bại trong giao ước việc làm.", "scripture": "Sáng-thế Ký 3:21", "focus": "Bóng mờ ân điển"},
            {"era_name": "Tổ Phụ", "revelation_step": "Áp-ra-ham được xưng công bình bởi đức tin đặt nơi Lời Hứa chứ không qua cắt bì hay việc làm.", "scripture": "Sáng-thế Ký 15:6", "focus": "Mẫu mực đức tin"},
            {"era_name": "Xuất Hành & Quan Xét", "revelation_step": "Luật pháp được ban ra như thầy giáo dẫn dắt người ta nhận biết tội lỗi để khao khát ân điển.", "scripture": "Ga-la-ti 3:24", "focus": "Mục đích sư phạm của Luật"},
            {"era_name": "Lưu Đày & Tiên Tri", "revelation_step": "Tiên tri Ha-ba-cúc công bố: Người công bình sẽ sống bởi đức tin giữa nghịch cảnh.", "scripture": "Ha-ba-cúc 2:4", "focus": "Niềm tin kiên định"},
            {"era_name": "Cuộc Đời Chúa Giê-xu", "revelation_step": "Đấng Christ mang lấy án phạt tội lỗi thay cho con người; sự cứu rỗi hoàn tất trọn vẹn.", "scripture": "Giăng 19:30", "focus": "Công giá đã trả xong"},
            {"era_name": "Hội Thánh & Thư Tín", "revelation_step": "Công thức cứu rỗi vĩ đại: 'Nhờ ân điển, bởi đức tin... ấy là sự ban cho của Đức Chúa Trời'.", "scripture": "Ê-phê-sô 2:8-9", "focus": "Xưng công bình bởi đức tin"},
            {"era_name": "Khải Huyền", "revelation_step": "Đoàn dân mặc áo trắng sạch được giặt trong Huyết Chiên Con ca tụng ân điển đời đời.", "scripture": "Khải-huyền 7:14", "focus": "Vinh hiển vĩnh hằng"}
        ],
        "citations": [
            {"author": "Martin Luther", "work": "Commentary on Galatians", "quote": "Giáo lý xưng công bình duy bởi đức tin là trụ cột mà trên đó Hội Thánh đứng vững hay sụp đổ. Nếu đánh mất giáo lý này, ta đánh mất chính Phúc Âm.", "tradition": "Reformation"},
            {"author": "John Calvin", "work": "Institutes of the Christian Religion", "quote": "Đức tin ví như chiếc bình rỗng được đưa ra để tiếp nhận sự sung mãn vô tận của Đấng Christ; ta không được xưng công bình vì giá trị của chiếc bình, mà vì sự phong phú của Đấng ngự vào trong đó.", "tradition": "Reformed Theology"}
        ],
        "homiletical_outline": {
            "title": "Món Quà Vô Giá: Sự Cứu Rỗi Bởi Ân Điển Qua Đức Tin",
            "scripture_main": "Ê-phê-sô 2:8-10 & Rô-ma 3:21-26",
            "points": [
                {
                    "point_number": 1,
                    "title": "Tình Trạng Bất Lực Tuyệt Đối Của Con Người Ngoài Đấng Christ",
                    "scripture": "Rô-ma 3:23; Ê-phê-sô 2:1-3",
                    "exposition": "Trước khi gặp Chúa, mọi người đều chết vì lầm lỗi và tội ác của mình, không một ai có thể tự cứu bằng đạo đức, tri thức hay việc làm luật pháp.",
                    "application": "Dẹp bỏ mọi kiêu ngạo thuộc linh; hạ mình thừa nhận sự thiếu thốn và khốn cùng thuộc linh trước mặt Đức Chúa Trời."
                },
                {
                    "point_number": 2,
                    "title": "Bản Chất Của Ân Điển Nhưng Không: Ban Cho Bất Kỳ Đòi Hỏi Nào",
                    "scripture": "Rô-ma 3:24; Ê-phê-sô 2:8-9",
                    "exposition": "Ân điển (Charis) là ân huệ dư dật dành cho kẻ hoàn toàn không xứng đáng. Đức tin là khí cụ tiếp nhận quà tặng cứu chuộc mà Đức Chúa Trời đã trả giá bằng Con Ngài.",
                    "application": "Vui mừng tiếp nhận sự tha thứ trọn vẹn, không sống trong mặc cảm tội lỗi hay cố gắng tự lập công tích."
                },
                {
                    "point_number": 3,
                    "title": "Mục Đích Của Ân Điển: Tạo Dựng Tác Phẩm Mới Để Làm Việc Lành",
                    "scripture": "Ê-phê-sô 2:10; Tít 2:11-14",
                    "exposition": "Chúng ta không được cứu BỞI việc lành, nhưng được cứu ĐỂ LÀM việc lành mà Đức Chúa Trời đã sắm sẵn trước. Đời sống biến đổi là bằng chứng của đức tin thật.",
                    "application": "Bày tỏ đức tin qua tình yêu thương cụ thể, phục vụ cộng đồng và tỏa sáng sự công chính của Nước Trời giữa đời sống hằng ngày."
                }
            ],
            "reflection_questions": [
                "Tại sao con người tự nhiên luôn có xu hướng muốn thêm 'việc lành' vào công thức cứu rỗi của ân điển?",
                "Việc biết chắc mình được cứu duy bởi ân điển đem lại sự giải phóng tâm linh như thế nào cho đời sống bạn?"
            ]
        }
    },
    "kingdom_god": {
        "id": "kingdom_god",
        "title_vi": "Nước Đức Chúa Trời (The Kingdom of God)",
        "title_en": "The Sovereignty & Kingdom of God (Basileia tou Theou)",
        "category": "Vương Quốc & Cánh Chung (Kingdom & Eschatology)",
        "color": "#a855f7",
        "badge_class": "purple",
        "golden_verse": "Đa-ni-ên 7:14 / Ma-thi-ơ 6:33 / Khải-huyền 11:15",
        "summary": "Quyền tể trị tối cao của Đức Chúa Trời trong lịch sử, sự hiện diện của Nước Trời qua Đấng Mê-si ('Đã đến nhưng Chưa hoàn tất'), và sự trị vì vinh hiển muôn đời.",
        "redemptive_thesis": "Nước Đức Chúa Trời không phải là một địa giới chính trị trần thế, mà là sự cai trị của Vua Muôn Vua trên tấm lòng, dân tộc và toàn bộ tạo vật, được khai mạc bởi chức vụ của Chúa Giê-xu và hoàn tất khi Ngài tái lâm.",
        "scriptures": [
            {"ref": "Đa-ni-ên 2:44", "testament": "OT", "role": "Tiên Tri Vương Quốc Không Hề Bị Phá Hủy", "key_phrase": "Đức Chúa Trời của các từng trời sẽ dựng nên một nước không hề bị hủy diệt"},
            {"ref": "Đa-ni-ên 7:13-14", "testament": "OT", "role": "Con Người Được Ban Quyền Trị Vì", "key_phrase": "Người được ban cho quyền thế, vinh hiển và nước"},
            {"ref": "Ma-thi-ơ 4:17", "testament": "NT", "role": "Lời Loan Báo Khởi Đầu Chức Vụ", "key_phrase": "Hãy ăn năn, vì nước thiên đàng đã đến gần"},
            {"ref": "Ma-thi-ơ 6:33", "testament": "NT", "role": "Ưu Tiên Tối Cao Của Môn Đồ", "key_phrase": "Nhưng trước hết, hãy tìm kiếm nước Đức Chúa Trời và sự công bình của Ngài"},
            {"ref": "Ma-thi-ơ 13:44-46", "testament": "NT", "role": "Giá Trị Tuyệt Đối Của Nước Trời", "key_phrase": "Nước thiên đàng giống như của báu giấu trong ruộng"},
            {"ref": "Lu-ca 17:20-21", "testament": "NT", "role": "Bản Chất Thuộc Linh Của Nước Chúa", "key_phrase": "Vì nầy, nước Đức Chúa Trời ở trong lòng các ngươi"},
            {"ref": "Khải-huyền 11:15", "testament": "NT", "role": "Vương Quốc Hoàn Tất Muôn Đời", "key_phrase": "Nước của thế gian thuộc về Chúa chúng ta và Đấng Christ của Ngài"}
        ],
        "characters": [
            {"name": "Đa-ni-ên", "role": "Tiên tri của các vương quốc", "testament": "OT", "era": "Lưu Đày Ba-by-lôn", "significance": "Thấy khải tượng về sự sụp đổ của các đế quốc loài người trước Vương quốc đời đời của Đức Chúa Trời."},
            {"name": "Giăng Báp-tít", "role": "Người dọn đường cho Vua", "testament": "NT", "era": "Chúa Giê-xu", "significance": "Kêu gọi toàn dân ăn năn tiếp đón Vua Nước Trời."},
            {"name": "Chúa Giê-xu", "role": "Vua Muôn Vua & Chúa Muôn Chúa", "testament": "NT", "era": "Chúa Giê-xu", "significance": "Đem Nước Trời vào thế giới loài người qua lời giảng, phép lạ và sự phục sinh."},
            {"name": "Sứ đồ Giăng", "role": "Người thấy khải tượng vinh quang tối hậu", "testament": "NT", "era": "Khải Huyền", "significance": "Ghi chép sự trị vì muôn đời của Đấng Christ trên trời mới đất mới."}
        ],
        "events": [
            {"name": "Giấc Mơ Về Pho Tượng & Hòn Đá", "period": "Lưu Đày Ba-by-lôn", "significance": "Hòn đá đục không bởi tay người đánh tan pho tượng và trở nên hòn núi lớn đầy dẫy khắp đất."},
            {"name": "Bài Giảng Trên Núi (Hiến Chương Nước Trời)", "period": "Cuộc Đời Chúa Giê-xu", "significance": "Thiết lập chuẩn mực đạo đức thánh khiết và lối sống của công dân Nước Trời."},
            {"name": "Sự Tái Lâm & Khải Hoàn Toàn Thể", "period": "Khải Huyền", "significance": "Vua Đấng Christ trở lại tiêu diệt mọi kẻ thù và thiết lập nền hòa bình vĩnh cửu."}
        ],
        "doctrines": [
            {"name": "Hiện Diện Nhưng Chưa Hoàn Tất (Already, But Not Yet)", "summary": "Nước Trời đã hiện diện quyền năng trong chức vụ Đấng Christ và Hội Thánh, nhưng chỉ hoàn tất trọn vẹn trong ngày Chúa tái lâm."},
            {"name": "Chủ Quyền Tối Thượng (Divine Sovereignty)", "summary": "Đức Chúa Trời cai quản trên mọi biến chuyển lịch sử, quyền thế và đế quốc thế gian."},
            {"name": "Đổi Mới Toàn Bộ Tạo Vật (Cosmic Restoration)", "summary": "Nước Chúa không chỉ cứu chuộc linh hồn cá nhân mà còn chuộc lại và đổi mới toàn thể vũ trụ trời mới đất mới."}
        ],
        "eras_progression": [
            {"era_name": "Sáng Tạo", "revelation_step": "Đức Chúa Trời ban quyền cai quản thế giới cho loài người dưới quyền tể trị tối cao của Ngài.", "scripture": "Sáng-thế Ký 1:28", "focus": "Ủy thác quyền quản trị"},
            {"era_name": "Vương Quốc Thống Nhất", "revelation_step": "Vương quyền Đa-vít làm hình bóng tiên trưng cho ngôi nước Đấng Mê-si không hề dời đổi.", "scripture": "II Sa-mu-ên 7:16", "focus": "Ngôi nước Đa-vít"},
            {"era_name": "Lưu Đày", "revelation_step": "Đa-ni-ên thấy Con Người bước đến trước Đấng Thượng Cổ để nhận lấy vương quốc bất diệt muôn đời.", "scripture": "Đa-ni-ên 7:14", "focus": "Khải tượng Khải huyền"},
            {"era_name": "Cuộc Đời Chúa Giê-xu", "revelation_step": "Chúa Giê-xu trừ quỷ, chữa lành và tuyên bố: Nước Đức Chúa Trời đã đến giữa các ngươi.", "scripture": "Ma-thi-ơ 12:28", "focus": "Quyền năng khai mạc"},
            {"era_name": "Hội Thánh", "revelation_step": "Hội Thánh là cộng đồng công dân Nước Trời, làm đại sứ giảng đạo Nước Trời cho muôn dân.", "scripture": "Công-vụ 28:31", "focus": "Đại Mạng Lệnh vương quốc"},
            {"era_name": "Khải Huyền", "revelation_step": "Tiếng loa thứ bảy vang lên: Các vương quốc thế gian thuộc về Đấng Christ đời đời vô cùng.", "scripture": "Khải-huyền 11:15", "focus": "Hoàn tất vinh quang"}
        ],
        "citations": [
            {"author": "George Eldon Ladd", "work": "The Presence of the Future", "quote": "Nước Đức Chúa Trời vừa là một thực tại hiện diện trong thời đại này, vừa là một trật tự tương lai của thời đại sau; Đấng Christ đã đem sức mạnh của thế giới tương lai xâm nhập vào dòng lịch sử hiện tại.", "tradition": "Biblical Theology"},
            {"author": "C.H. Spurgeon", "work": "Sermons on the Kingdom", "quote": "Đấng Christ phải là Vua tuyệt đối trên mọi ngóc ngách của tấm lòng bạn; nếu Ngài không phải là Chúa của tất cả, Ngài không phải là Chúa của bạn chút nào.", "tradition": "Baptist Heritage"}
        ],
        "homiletical_outline": {
            "title": "Tìm Kiếm Vương Quốc: Ưu Tiên Tuyệt Đối Giữa Đời Tạm",
            "scripture_main": "Ma-thi-ơ 6:25-34 & Đa-ni-ên 2:44",
            "points": [
                {
                    "point_number": 1,
                    "title": "Bản Chất Bền Vững Của Nước Trời So Với Sự Hư Hoại Của Thế Gian",
                    "scripture": "Đa-ni-ên 2:44; I Giăng 2:17",
                    "exposition": "Mọi đế chế quyền lực, danh vọng và của cải trần gian rồi sẽ qua đi như rơm rác; chỉ có Vương quốc của Đức Chúa Trời tồn tại đời đời.",
                    "application": "Dừng việc đặt nền tảng đời sống trên những điều tạm bợ; chuyển dời trung tâm đầu tư cuộc đời vào cõi vĩnh hằng."
                },
                {
                    "point_number": 2,
                    "title": "Mệnh Lệnh Tìm Kiếm: Đặt Nước Chúa Lên Trên Mọi Lo Lắng Cơm Áo",
                    "scripture": "Ma-thi-ơ 6:31-33",
                    "exposition": "Chúa Giê-xu thấu hiểu nhu cầu của con cái Ngài. Mệnh lệnh 'Hãy tìm kiếm trước hết' là một lời cam kết thần thượng: Chúa sẽ chu cấp mọi nhu cầu thuộc thể khi ta ưu tiên ý chỉ Ngài.",
                    "application": "Chữa lành căn bệnh lo âu bằng sự tin cậy Đấng Cha nuôi chim trời và mặc đẹp cho hoa huệ ngoài đồng."
                },
                {
                    "point_number": 3,
                    "title": "Lối Sống Công Dân Nước Trời: Thể Hiện Quyền Cai Trị Của Vua Giê-xu",
                    "scripture": "Ma-thi-ơ 5:13-16; Rô-ma 14:17",
                    "exposition": "Nước Đức Chúa Trời không phải là ăn uống, mà là sự công bình, bình an và vui mừng trong Đức Thánh Linh. Chúng ta là muối của đất và ánh sáng soi rọi tình yêu Chúa.",
                    "application": "Thực thi công lý, lòng thương xót và sự khiêm nhường trong gia đình, nơi làm việc và xã hội."
                }
            ],
            "reflection_questions": [
                "Lĩnh vực nào trong đời sống bạn (tài chính, thời gian, tham vọng) đang cạnh tranh với quyền làm Vua của Chúa Giê-xu?",
                "Quan niệm 'Nước Trời đã đến nhưng chưa hoàn tất' giúp bạn giữ sự vững lòng như thế nào khi đối diện với đau khổ và bất công?"
            ]
        }
    },
    "paschal_atonement": {
        "id": "paschal_atonement",
        "title_vi": "Chiên Con Lễ Vượt Qua & Sự Chuộc Tội Thay Thế",
        "title_en": "The Paschal Lamb & Substitutionary Atonement",
        "category": "Kitô Học & Tế Tự (Christology & Typology)",
        "color": "#f43f5e",
        "badge_class": "rose",
        "golden_verse": "Xuất Ê-díp-tô Ký 12:13 / Ê-sai 53:5 / Giăng 1:29 / I Cô-rinh-tô 5:7",
        "summary": "Dòng chảy huyết chuộc tội xuyên suốt Kinh Thánh: Chiên con A-bên, chiên con núi Mô-ri-a, Lễ Vượt Qua, Chiên Con câm nín Ê-sai 53, và Chiên Con trên ngai Khải Huyền.",
        "redemptive_thesis": "Đức Chúa Trời là Đấng công bình tuyệt đối không thể bỏ qua tội lỗi; Ngài đã tự mình chu cấp Chiên Con trọn vẹn là chính Con Độc Sanh của Ngài để gánh chịu cơn thịnh nộ thay thế cho nhân loại tội lỗi.",
        "scriptures": [
            {"ref": "Sáng-thế Ký 22:7-8", "testament": "OT", "role": "Lời Tiên Tri Đức Chúa Trời Tự Sắm Sẵn", "key_phrase": "Đức Chúa Trời sẽ tự sắm sẵn chiên con cho của lễ thiêu"},
            {"ref": "Xuất Ê-díp-tô Ký 12:3-13", "testament": "OT", "role": "Huyết Chiên Con Lễ Vượt Qua", "key_phrase": "Khi Ta thấy huyết đó, thì sẽ vượt qua các ngươi"},
            {"ref": "Lê-vi Ký 16:21-22", "testament": "OT", "role": "Con Dê Gánh Tội Ngày Đại Lễ Chuộc Tội", "key_phrase": "Con dê đực nầy sẽ mang trên mình mọi tội ác của họ"},
            {"ref": "Ê-sai 53:4-7", "testament": "OT", "role": "Đầy Tớ Chịu Khổ Như Chiên Con", "key_phrase": "Ngài vì tội lỗi chúng ta mà bị vết, người như chiên con bị dắt đến hàng làm thịt"},
            {"ref": "Giăng 1:29", "testament": "NT", "role": "Lời Nhận Diện Của Giăng Báp-tít", "key_phrase": "Kìa, Chiên Con của Đức Chúa Trời, là Đấng cất tội lỗi thế gian đi"},
            {"ref": "I Cô-rinh-tô 5:7", "testament": "NT", "role": "Đấng Christ Là Chiên Con Lễ Vượt Qua", "key_phrase": "Vì Đấng Christ là con sinh Lễ Vượt Qua của chúng ta, đã bị hi sinh rồi"},
            {"ref": "I Phi-e-rơ 1:18-19", "testament": "NT", "role": "Giá Chuộc Bằng Huyết Báu", "key_phrase": "Bằng huyết báu Đấng Christ, dường như huyết chiên con không lỗi không vít"},
            {"ref": "Khải-huyền 5:6-12", "testament": "NT", "role": "Chiên Con Đã Bị Giết Trên Ngai", "key_phrase": "Chiên Con đã chịu chết là xứng đáng nhận lấy quyền thế, giàu có và khôn ngoan"}
        ],
        "characters": [
            {"name": "A-bên", "role": "Người dâng sinh tế chiên đầu lòng", "testament": "OT", "era": "Thuở Ban Đầu", "significance": "Dâng sinh tế đức tin được Chúa nhậm lời."},
            {"name": "Áp-ra-ham & Y-sác", "role": "Hình bóng phụ tử trên núi Mô-ri-a", "testament": "OT", "era": "Tổ Phụ", "significance": "Đức Chúa Trời chu cấp con chiên đực mắc sừng trong bụi cây thay thế cho Y-sác."},
            {"name": "Môi-se", "role": "Người truyền lệnh bôi huyết chiên con", "testament": "OT", "era": "Xuất Hành", "significance": "Thiết lập Lễ Vượt Qua cho toàn dân tộc Y-sơ-ra-ên."},
            {"name": "Chúa Giê-xu", "role": "Chiên Con Thật Của Đức Chúa Trời", "testament": "NT", "era": "Chúa Giê-xu", "significance": "Chết trên thập tự giá đúng vào giờ dâng chiên tế lễ Vượt Qua."}
        ],
        "events": [
            {"name": "Lễ Vượt Qua Đêm Thoát Khỏi Ai Cập", "period": "Xuất Hành", "significance": "Huyết chiên con cứu sống các con đầu lòng của tuyển dân khỏi thiên sứ hủy diệt."},
            {"name": "Ngày Đại Lễ Chuộc Tội (Yom Kippur)", "period": "Xuất Hành", "significance": "Thầy tế lễ thượng phẩm đem huyết vào nơi Chí Thánh rưới lên nắp thi ân."},
            {"name": "Sự Đóng Đinh Trên Đồi Gô-gô-tha", "period": "Cuộc Đời Chúa Giê-xu", "significance": "Bức màn đền thờ xé đôi từ trên xuống dưới; con đường vào nơi Chí Thánh được mở ra."}
        ],
        "doctrines": [
            {"name": "Sự Chuộc Tội Thay Thế Hình Phạt (Penal Substitutionary Atonement)", "summary": "Chúa Giê-xu chịu chết thay cho kẻ có tội, gánh chịu cơn thạnh nộ công chính của Đức Chúa Trời đối với tội nhân."},
            {"name": "Nắp Thi Ân & Sự Nguôi Giận (Propitiation)", "summary": "Huyết Đấng Christ làm thỏa mãn trọn vẹn đức thánh khiết và biến cơn thạnh nộ thành ân điển thương xót."},
            {"name": "Sự Cứu Chuộc Đời Đời (Eternal Redemption)", "summary": "Chỉ một lần dâng chính mình làm của lễ trọn vẹn, Ngài đã sắm sẵn sự cứu rỗi đời đời không bao giờ phải lặp lại."}
        ],
        "eras_progression": [
            {"era_name": "Sáng Tạo", "revelation_step": "A-bên dâng chiên đầu lòng; sự đổ huyết của sinh tế vô tội làm đẹp lòng Chúa.", "scripture": "Sáng-thế Ký 4:4", "focus": "Bình minh tế tự"},
            {"era_name": "Tổ Phụ", "revelation_step": "Trên núi Mô-ri-a, Đức Chúa Trời chu cấp chiên đực thay thế cho Y-sác: 'Đức Giê-hô-va Di-rê'.", "scripture": "Sáng-thế Ký 22:13-14", "focus": "Đấng Chu Cấp sinh tế"},
            {"era_name": "Xuất Hành", "revelation_step": "Chiên con không tì vít bị giết, huyết bôi trên mày cửa để che chở khỏi sự chết.", "scripture": "Xuất Ê-díp-tô Ký 12:5-7", "focus": "Huyết bảo toàn"},
            {"era_name": "Tiên Tri", "revelation_step": "Ê-sai mặc khải Đầy tớ chịu khổ như chiên con bị dắt đến hàng làm thịt vì tội ác chúng ta.", "scripture": "Ê-sai 53:7", "focus": "Chiên Con cam chịu"},
            {"era_name": "Cuộc Đời Chúa Giê-xu", "revelation_step": "Chúa Giê-xu bị đóng đinh đúng kỳ Lễ Vượt Qua: 'Mọi sự đã trọn!'.", "scripture": "Giăng 19:30", "focus": "Sự hy sinh tối thượng"},
            {"era_name": "Hội Thánh", "revelation_step": "Sứ đồ công bố Huyết Chiên Con không tì vít cứu chuộc người tin khỏi nếp sống hư không.", "scripture": "I Phi-e-rơ 1:19", "focus": "Nền tảng niềm tin"},
            {"era_name": "Khải Huyền", "revelation_step": "Toàn thể thiên sứ và thánh đồ sấp mình thờ lạy Chiên Con đã bị giết nay ngự trên ngôi vinh hiển muôn đời.", "scripture": "Khải-huyền 5:12", "focus": "Sự tôn vinh vĩnh cửu"}
        ],
        "citations": [
            {"author": "Leon Morris", "work": "The Apostolic Preaching of the Cross", "quote": "Nếu tước bỏ ý niệm về sự thay thế hình phạt ra khỏi cái chết của Đấng Christ, thập tự giá sẽ biến thành một bi kịch vô nghĩa thay vì là chiến thắng vĩ đại cứu chuộc thế gian.", "tradition": "Biblical Theology"},
            {"author": "John Stott", "work": "The Cross of Christ", "quote": "Tại thập tự giá, Đức Chúa Trời trong sự thánh khiết không khoan nhượng tội lỗi, nhưng trong tình yêu vô bờ bến, chính Ngài đã mang lấy án phạt ấy thay cho chúng ta.", "tradition": "Anglican Evangelical"}
        ],
        "homiletical_outline": {
            "title": "Huyết Chiên Con: Con Đường Duy Nhất Thoát Khỏi Sự Phán Xét",
            "scripture_main": "Xuất Ê-díp-tô Ký 12:1-13 & I Phi-e-rơ 1:18-21",
            "points": [
                {
                    "point_number": 1,
                    "title": "Mọi Người Đều Ở Dưới Cơn Thịnh Nộ Của Sự Phán Xét Công Bình",
                    "scripture": "Xuất 12:12; Rô-ma 1:18",
                    "exposition": "Đêm Lễ Vượt Qua, cơn phán xét của Đức Chúa Trời đi qua toàn xứ Ai Cập. Không một gia đình nào an toàn nhờ đạo đức hay vị thế xã hội; sự phán xét không chừa một ai nếu không có huyết.",
                    "application": "Nhận biết tính chất nghiêm trọng của sự phán xét đời đời và nhu cầu cấp thiết phải có sự che chở của Huyết Chúa."
                },
                {
                    "point_number": 2,
                    "title": "Chiên Con Vô Tội Chịu Chết Thay Cho Kẻ Có Tội",
                    "scripture": "Xuất 12:5; Ê-sai 53:5-6",
                    "exposition": "Chiên con phải hoàn toàn không tật nguyền, chịu chết để con đầu lòng được sống. Chúa Giê-xu là Đấng vô tội tuyệt đối đã mang lấy hình phạt thay cho chúng ta.",
                    "application": "Chiêm ngưỡng tình yêu hy sinh vô điều kiện của Chúa Cứu Thế; sống với lòng biết ơn và sự kính sợ thánh khiết."
                },
                {
                    "point_number": 3,
                    "title": "Sự An Nghỉ Đời Đời Dưới Lời Hứa: 'Khi Ta Thấy Huyết, Ta Sẽ Vượt Qua'",
                    "scripture": "Xuất 12:13; Rô-ma 8:1",
                    "exposition": "Sự an toàn của người Y-sơ-ra-ên không nằm ở cảm xúc hay mức độ tự tin của họ bên trong ngôi nhà, mà nằm ở Huyết Chiên Con đã bôi ngoài cửa trước mắt Đức Chúa Trời.",
                    "application": "Đặt sự tin quyết救rỗi vào Lời Hứa bất biến của Chúa chứ không nương dựa vào cảm xúc lên xuống thất thường của bản thân."
                }
            ],
            "reflection_questions": [
                "Tại sao chỉ có Huyết Chiên Con mới có thể làm dịu cơn thạnh nộ thánh khiết của Đức Chúa Trời đối với tội lỗi?",
                "Sự chiêm ngưỡng Chiên Con bị giết trên ngai trong Khải Huyền 5 khích lệ tinh thần thờ phượng của bạn ra sao?"
            ]
        }
    },
    "holy_spirit": {
        "id": "holy_spirit",
        "title_vi": "Đức Thánh Linh: Sự Hiện Diện, Quyền Năng & Tái Sinh",
        "title_en": "The Holy Spirit: Presence, Power & Regeneration",
        "category": "Thánh Linh Học (Pneumatology)",
        "color": "#10b981",
        "badge_class": "emerald",
        "golden_verse": "Ê-xê-chi-ên 36:26-27 / Giăng 14:16-17 / Công-vụ 1:8 / Ga-la-ti 5:22-23",
        "summary": "Thần khí Đức Chúa Trời từ sự sáng tạo ban đầu, xức dầu cho các quan xét và tiên tri, ngự xuống ngày Lễ Ngũ Tuần, ấn chứng và sinh bông trái trong đời sống môn đồ.",
        "redemptive_thesis": "Đức Thánh Linh là Đấng Thần Hựu hiện thực hóa công trình cứu chuộc của Đấng Christ trong lòng người tin, ban quyền năng làm chứng, tái sinh tấm lòng và gìn giữ Hội Thánh đến ngày vinh quang.",
        "scriptures": [
            {"ref": "Sáng-thế Ký 1:2", "testament": "OT", "role": "Thần Linh Sáng Tạo Ban Đầu", "key_phrase": "Thần Đức Chúa Trời vận hành trên mặt nước"},
            {"ref": "Giô-ên 2:28-29", "testament": "OT", "role": "Lời Hứa Tuôn Đổ Thần Linh", "key_phrase": "Ta sẽ đổ Thần Ta trên các loài xác thịt"},
            {"ref": "Ê-xê-chi-ên 36:26-27", "testament": "OT", "role": "Tấm Lòng Mới Và Thần Mới", "key_phrase": "Ta sẽ ban lòng mới và đặt Thần mới trong các ngươi"},
            {"ref": "Giăng 14:16-17", "testament": "NT", "role": "Đấng An Ủi & Chân Lý Đời Đời", "key_phrase": "Ngài sẽ ban cho các ngươi một Đấng Yên ủi khác, để ở với các ngươi đời đời"},
            {"ref": "Công-vụ 1:8", "testament": "NT", "role": "Quyền Phép Để Làm Chứng Nhân", "key_phrase": "Các ngươi sẽ nhận lấy quyền phép, và làm chứng về Ta"},
            {"ref": "Công-vụ 2:1-4", "testament": "NT", "role": "Sự Tuôn Đổ Ngày Ngũ Tuần", "key_phrase": "Hết thảy đều được đầy dẫy Đức Thánh Linh"},
            {"ref": "Rô-ma 8:14-16", "testament": "NT", "role": "Thần Linh Nhận Làm Con (Abba, Cha)", "key_phrase": "Thần Linh làm chứng cho lòng chúng ta rằng chúng ta là con cái Đức Chúa Trời"},
            {"ref": "Ga-la-ti 5:22-23", "testament": "NT", "role": "Bông Trái Thánh Linh Trong Nếp Sống", "key_phrase": "Trái của Thánh Linh là lòng yêu thương, vui mừng, bình an, nhịn nhục..."}
        ],
        "characters": [
            {"name": "Bết-sa-lê-ên", "role": "Thợ thủ công được Thần Chúa ban sự khôn ngoan", "testament": "OT", "era": "Xuất Hành", "significance": "Được đầy dẫy Thần Đức Chúa Trời để xây dựng Đền Tạm."},
            {"name": "Đa-vít", "role": "Vua được Thần Chúa cảm động", "testament": "OT", "era": "Vương Quốc Thống Nhất", "significance": "Cầu xin Chúa đừng cất Thánh Linh khỏi người sau khi vấp ngã (Thi thiên 51)."},
            {"name": "Sứ đồ Phi-e-rơ", "role": "Nhân chứng ngày Ngũ Tuần", "testament": "NT", "era": "Hội Thánh Ban Đầu", "significance": "Được đầy dẫy Thánh Linh dạn dĩ giảng đạo dẫn dắt 3.000 người tin Chúa."},
            {"name": "Sứ đồ Phao-lô", "role": "Giảng giải thần học về Thánh Linh", "testament": "NT", "era": "Hội Thánh Ban Đầu", "significance": "Viết về ân tứ, ấn chứng và nếp sống bước đi theo Thánh Linh."}
        ],
        "events": [
            {"name": "Lễ Ngũ Tuần Tại Phòng Cao Giê-ru-sa-lem", "period": "Hội Thánh Ban Đầu", "significance": "Thánh Linh ngự xuống như gió thổi ào ào và lưỡi như lửa; Hội Thánh Đấng Christ khai sinh."},
            {"name": "Thánh Linh Ngự Xuống Trên Nhà Cọt-nây", "period": "Hội Thánh Ban Đầu", "significance": "Ân điển Thánh Linh tuôn đổ trên người ngoại bang, phá vỡ mọi rào cản phân biệt."}
        ],
        "doctrines": [
            {"name": "Sự Thân Vị Của Thánh Linh (Personality of the Spirit)", "summary": "Đức Thánh Linh là Thân Vị thứ ba của Ba Ngôi Đức Chúa Trời, có lý trí, cảm xúc và ý chí, không phải là một lực lượng vô tri."},
            {"name": "Sự Tái Sinh (Regeneration)", "summary": "Công tác siêu nhiên của Thánh Linh ban sự sống mới từ cõi chết thuộc linh cho người tin Chúa."},
            {"name": "Ấn Chứng & Bảo Chứng (Sealing & Guarantee)", "summary": "Thánh Linh ngự vào lòng người tin như chiếc ấn sở hữu của Chúa và là tiền cọc bảo chứng cho cơ nghiệp vinh quang."}
        ],
        "eras_progression": [
            {"era_name": "Sáng Tạo", "revelation_step": "Thần Đức Chúa Trời vận hành đem lại trật tự và sự sống cho cõi vũ trụ hỗn mang.", "scripture": "Sáng-thế Ký 1:2", "focus": "Sáng tạo ban đầu"},
            {"era_name": "Quan Xét & Vương Quốc", "revelation_step": "Thánh Linh ngự trên từng cá nhân (Ghi-đê-ôn, Sam-sôn, Đa-vít) để hoàn thành sứ mạng đặc biệt.", "scripture": "Quan Xét 6:34", "focus": "Xức dầu quyền năng"},
            {"era_name": "Tiên Tri", "revelation_step": "Lời hứa về một ngày Thần Chúa sẽ ngự vào trong lòng mọi con cái Chúa và thay đổi bản tính.", "scripture": "Ê-xê-chi-ên 36:27", "focus": "Lời hứa nội trú"},
            {"era_name": "Cuộc Đời Chúa Giê-xu", "revelation_step": "Chúa Giê-xu chịu phép báp-tem bởi Thánh Linh, thi hành chức vụ trong Thánh Linh và hứa ban Đấng Yên Ủi.", "scripture": "Giăng 14:16", "focus": "Gương mẫu trọn vẹn"},
            {"era_name": "Ngũ Tuần & Hội Thánh", "revelation_step": "Thánh Linh ngự xuống nội trú vĩnh viễn trong mọi tín hữu, hiệp nhất thành một Thân Thể.", "scripture": "Công-vụ 2:4", "focus": "Tuôn đổ dồi dào"},
            {"era_name": "Khải Huyền", "revelation_step": "Thánh Linh và Vợ Mới (Hội Thánh) cùng cất tiếng kêu mời: 'Hãy đến!'.", "scripture": "Khải-huyền 22:17", "focus": "Mời gọi cứu rỗi cuối cùng"}
        ],
        "citations": [
            {"author": "Sinclair Ferguson", "work": "The Holy Spirit", "quote": "Đức Thánh Linh không bao giờ hướng sự chú ý về chính Ngài; mục đích tối thượng của Ngài trong cõi đời đời và trong lịch sử là làm sáng danh Chúa Giê-xu Christ và biến đổi chúng ta nên giống hình ảnh Ngài.", "tradition": "Reformed Pneumatology"},
            {"author": "A.W. Tozer", "work": "The Counselor", "quote": "Hội Thánh không thể tồn tại bằng tổ chức hay tài khéo của con người; nếu Đức Thánh Linh rút đi, Hội Thánh sẽ chết ngay tức khắc cho dù mọi bộ máy vẫn quay đều.", "tradition": "Evangelical Devotional"}
        ],
        "homiletical_outline": {
            "title": "Đầy Dẫy Đức Thánh Linh: Đời Sống Năng Quyền và Bông Trái Thuộc Linh",
            "scripture_main": "Ga-la-ti 5:16-26 & Công-vụ 1:8",
            "points": [
                {
                    "point_number": 1,
                    "title": "Mệnh Lệnh Bước Đi Theo Thánh Linh Thay Vì Chiều Theo Xác Thịt",
                    "scripture": "Ga-la-ti 5:16-18; Rô-ma 8:5-8",
                    "exposition": "Có một trận chiến thuộc linh thường trực giữa bản tính xác thịt cũ và sự hướng dẫn của Thánh Linh. Sức mạnh để chiến thắng không đến từ ý chí con người mà từ sự đầu phục Thánh Linh.",
                    "application": "Từ bỏ những ham muốn bất khiết; nuôi dưỡng tâm linh bằng Lời Chúa và lời cầu nguyện hằng ngày."
                },
                {
                    "point_number": 2,
                    "title": "Bông Trái Của Thánh Linh: Bản Tính Đấng Christ Nở Hoa Trong Môn Đồ",
                    "scripture": "Ga-la-ti 5:22-23; Giăng 15:4-5",
                    "exposition": "Bông trái Thánh Linh là một thể thống nhất (danh từ số ít) phản chiếu trọn vẹn mỹ đức của Chúa Giê-xu: yêu thương, vui mừng, bình an, nhẫn nhục, nhân từ, hiền lành, trung tín, nhu mì, tiết độ.",
                    "application": "Duyệt xét các mối quan hệ trong gia đình và Hội Thánh: bông trái nào đang cần được Thánh Linh vun trồng thêm?"
                },
                {
                    "point_number": 3,
                    "title": "Quyền Phép Để Làm Chứng Nhân Sống Động Cho Nước Trời",
                    "scripture": "Công-vụ 1:8; 4:31",
                    "exposition": "Thánh Linh không được ban cho để chúng ta thỏa mãn cảm xúc cá nhân, mà để ban thẩm quyền và lòng dạn dĩ rao truyền Phúc Âm của Đấng Christ cho đến cùng trái đất.",
                    "application": "Cầu xin Chúa ban lòng can đảm để chia sẻ tình yêu và sự cứu rỗi của Chúa cho những người xung quanh ngay trong tuần này."
                }
            ],
            "reflection_questions": [
                "Làm thế nào để nhận biết bạn đang 'bước đi theo Thánh Linh' thay vì nương cậy sức riêng?",
                "Sự hiện diện của Thánh Linh an ủi bạn thế nào trong những giai đoạn cô đơn hay thử thách đức tin?"
            ]
        }
    },
    "resurrection_hope": {
        "id": "resurrection_hope",
        "title_vi": "Sự Phục Sinh & Hy Vọng Sống Đời Đời",
        "title_en": "The Resurrection & Living Hope",
        "category": "Cánh Chung Học (Eschatology & Hope)",
        "color": "#06b6d4",
        "badge_class": "cyan",
        "golden_verse": "Gióp 19:25 / Giăng 11:25 / I Cô-rinh-tô 15:20 / I Phi-e-rơ 1:3",
        "summary": "Chiến thắng lịch sử của Đấng Christ trên sự chết và mộ mả, nền tảng cho sự phục sinh thân thể của tín hữu và sự vinh hiển trong trời mới đất mới.",
        "redemptive_thesis": "Sự sống lại của Chúa Giê-xu là sự kiện lịch sử làm đảo lộn trật tự thế giới, bảo chứng cho sự xưng công bình của chúng ta và là bằng chứng không thể chối cãi rằng sự chết đã bị nuốt mất trong sự đắc thắng.",
        "scriptures": [
            {"ref": "Gióp 19:25-27", "testament": "OT", "role": "Lời Tuyên Xưng Niềm Tin Phục Sinh Sớm Nhất", "key_phrase": "Tôi biết rằng Đấng Cứu Chuộc tôi hằng sống"},
            {"ref": "Thi-thiên 16:9-11", "testament": "OT", "role": "Lời Tiên Tri Thân Thể Không Hư Nát", "key_phrase": "Chúa sẽ chẳng để người thánh Chúa thấy sự hư nát"},
            {"ref": "Đa-ni-ên 12:2-3", "testament": "OT", "role": "Sự Sống Lại Cuối Cùng", "key_phrase": "Nhiều kẻ ngủ trong bụi đất sẽ thức dậy, kẻ nầy để được sự sống đời đời"},
            {"ref": "Giăng 11:25-26", "testament": "NT", "role": "Lời Tuyên Bố Thần Thượng Của Chúa Cứu Thế", "key_phrase": "Ta là sự sống lại và sự sống; kẻ nào tin Ta sẽ sống, dẫu đã chết rồi"},
            {"ref": "Ma-thi-ơ 28:1-7", "testament": "NT", "role": "Ngôi Mộ Trống Buổi Sáng Phục Sinh", "key_phrase": "Ngài không ở đây đâu; Ngài đã sống lại rồi"},
            {"ref": "I Cô-rinh-tô 15:20-26", "testament": "NT", "role": "Trái Đầu Mùa Của Kẻ Ngủ", "key_phrase": "Nhưng bây giờ, Đấng Christ đã từ kẻ chết sống lại, là trái đầu mùa của những kẻ ngủ"},
            {"ref": "I Phi-e-rơ 1:3-4", "testament": "NT", "role": "Hy Vọng Sống Bởi Sự Sống Lại", "key_phrase": "Ngài đã tái sanh chúng ta vào một hy vọng sống, bởi sự sống lại của Đức Chúa Giê-xu"},
            {"ref": "Khải-huyền 20:4-6", "testament": "NT", "role": "Sự Sống Lại Đầu Tiên", "key_phrase": "Phước thay và thánh thay cho những kẻ có phần trong sự sống lại thứ nhất"}
        ],
        "characters": [
            {"name": "Gióp", "role": "Gương kiên trì giữa đau khổ", "testament": "OT", "era": "Tổ Phụ", "significance": "Tuyên bố đức tin thấy Đấng Cứu Chuộc trong xác thịt sau khi da thịt bị tiêu hủy."},
            {"name": "Ma-ri Ma-đơ-len", "role": "Sứ giả đầu tiên của buổi sáng phục sinh", "testament": "NT", "era": "Chúa Giê-xu", "significance": "Người đầu tiên gặp Chúa phục sinh tại ngôi mộ vườn."},
            {"name": "Thô-ma", "role": "Môn đồ được cất bỏ nghi ngờ", "testament": "NT", "era": "Chúa Giê-xu", "significance": "Chạm vào vết thương phục sinh và kêu lên: 'Lạy Chúa tôi và Đức Chúa Trời tôi!'."},
            {"name": "Sứ đồ Phao-lô", "role": "Người luận chứng chương 15 I Cô-rinh-tô", "testament": "NT", "era": "Hội Thánh Ban Đầu", "significance": "Chứng minh nếu Đấng Christ không sống lại thì đức tin chúng ta là vô ích."}
        ],
        "events": [
            {"name": "Ngôi Mộ Trống Ngày Thứ Nhất Trong Tuần", "period": "Cuộc Đời Chúa Giê-xu", "significance": "Hòn đá lấp mộ bị lăn ra, thiên sứ loan báo Đấng Christ đã sống lại."},
            {"name": "Chúa Phục Sinh Hiện Ra Cho Hơn 500 Anh Em", "period": "Cuộc Đời Chúa Giê-xu", "significance": "Bằng chứng lịch sử xác thực với vô số nhân chứng sống thời bấy giờ."}
        ],
        "doctrines": [
            {"name": "Sự Phục Sinh Thân Thể (Bodily Resurrection)", "summary": "Chúa Giê-xu sống lại trong một thân thể thực hữu bằng thịt và xương, không phải một bóng ma hay ảo ảnh."},
            {"name": "Bảo Chứng Xưng Công Bình", "summary": "Sự sống lại chứng minh của lễ của Chúa Giê-xu đã được Đức Chúa Cha nhậm lời hoàn toàn (Rô-ma 4:25)."},
            {"name": "Thân Thể Hóa Hình Vinh Hiển", "summary": "Thân thể yếu đuối hèn mạt của người tin sẽ được biến hóa nên giống thân thể vinh quang của Đấng Christ."}
        ],
        "eras_progression": [
            {"era_name": "Tổ Phụ & Gióp", "revelation_step": "Niềm tin mãnh liệt vào Đấng Cứu Chuộc hằng sống giữa tro bụi hoạn nạn.", "scripture": "Gióp 19:25", "focus": "Niềm hy vọng sơ khởi"},
            {"era_name": "Vương Quốc & Thi Ca", "revelation_step": "Đa-vít tiên tri Đấng Thánh của Chúa sẽ không bao giờ thấy sự hư nát.", "scripture": "Thi-thiên 16:10", "focus": "Lời hứa thi ca"},
            {"era_name": "Lưu Đày & Tiên Tri", "revelation_step": "Đa-ni-ên thấy ngày phục sinh toàn thể: Kẻ thức dậy hưởng sự sống đời đời, kẻ bị sỉ nhục muôn đời.", "scripture": "Đa-ni-ên 12:2", "focus": "Sự công lý tối hậu"},
            {"era_name": "Cuộc Đời Chúa Giê-xu", "revelation_step": "Ngôi mộ trống sáng Chúa Nhật; Đấng Christ đánh tan quyền lực âm phủ và sự chết.", "scripture": "Ma-thi-ơ 28:6", "focus": "Đắc thắng lịch sử"},
            {"era_name": "Hội Thánh Ban Đầu", "revelation_step": "Trọng tâm bài giảng của các sứ đồ là Đấng Christ đã sống lại từ cõi chết.", "scripture": "Công-vụ 2:32", "focus": "Lõi của Kerygma"},
            {"era_name": "Khải Huyền", "revelation_step": "Đấng Phục Sinh tuyên bố: 'Ta là Đấng Hằng Sống, Ta đã chết, kìa nay Ta sống đời đời, cầm chìa khóa của sự chết và âm phủ'.", "scripture": "Khải-huyền 1:18", "focus": "Chủ tể sự sống"}
        ],
        "citations": [
            {"author": "N.T. Wright", "work": "The Resurrection of the Son of God", "quote": "Sự phục sinh không phải là một cách nói ẩn dụ cho sự tiếp nối tư tưởng của Chúa Giê-xu; nó là sự tái sáng tạo vật lý cụ thể, khởi đầu cho trời mới đất mới của Đức Chúa Trời ngay trong lòng thế giới cũ.", "tradition": "Biblical Studies"},
            {"author": "C.S. Lewis", "work": "Miracles", "quote": "Người Cơ Đốc không rao giảng về một triết lý luân lý đạo đức; họ loan báo một biến cố lịch sử: Đấng Christ đã đội mồ sống lại và cánh cửa nhà tù của tử thần đã bị đạp đổ từ bên trong.", "tradition": "Christian Apologetics"}
        ],
        "homiletical_outline": {
            "title": "Ngôi Mộ Trống và Hy Vọng Bất Diệt: Chiến Thắng Của Đấng Phục Sinh",
            "scripture_main": "I Cô-rinh-tô 15:12-26 & I Phi-e-rơ 1:3-5",
            "points": [
                {
                    "point_number": 1,
                    "title": "Tầm Quan Trọng Tuyệt Đối Của Sự Kiện Phục Sinh Trong Đức Tin",
                    "scripture": "I Cô-rinh-tô 15:14-19",
                    "exposition": "Nếu Đấng Christ không sống lại, việc giảng dạy là vô ích, đức tin là hão huyền và chúng ta vẫn còn nguyên trong tội lỗi mình. Sự phục sinh là trụ cột xác thực toàn bộ Cơ Đốc giáo.",
                    "application": "Xây dựng đức tin trên thực tế lịch sử vững chắc chứ không phải trên những huyền thoại hay cảm xúc chủ quan."
                },
                {
                    "point_number": 2,
                    "title": "Đấng Christ Là Trái Đầu Mùa Bảo Chứng Cho Sự Phục Sinh Của Kẻ Tin",
                    "scripture": "I Cô-rinh-tô 15:20-23",
                    "exposition": "Trái đầu mùa bảo đảm rằng cả mùa gặt chắc chắn sẽ đến. Sự sống lại của Chúa Giê-xu là lời hứa chắc chắn rằng mọi kẻ an giấc trong Ngài sẽ được phục sinh với thân thể vinh quang.",
                    "application": "Xua tan nỗi sợ hãi sự chết; nhìn nhận cái chết của người tin Chúa chỉ là một giấc ngủ tạm chờ ngày kèn thổi vinh quang."
                },
                {
                    "point_number": 3,
                    "title": "Đời Sống Mới Ngay Hôm Nay Dưới Năng Quyền Của Sự Phục Sinh",
                    "scripture": "Rô-ma 6:4; Phi-líp 3:10",
                    "exposition": "Năng quyền đã khiến Chúa Giê-xu sống lại từ cõi chết đang hành động trong lòng người tin để đắc thắng tội lỗi, vượt qua nghịch cảnh và kiên trì phục vụ Chúa.",
                    "application": "Sống can đảm, dấn thân hầu việc Chúa với sự biết chắc rằng mọi công khó của chúng ta trong Chúa không bao giờ là vô ích."
                }
            ],
            "reflection_questions": [
                "Lẽ thật về sự sống lại của Chúa Giê-xu thay đổi cách bạn đối diện với mất mát và tang chế như thế nào?",
                "Bạn đang kinh nghiệm 'năng quyền phục sinh' của Chúa thế nào trong việc đắc thắng những cám dỗ thường ngày?"
            ]
        }
    },
    "prayer_communion": {
        "id": "prayer_communion",
        "title_vi": "Sự Cầu Nguyện, Cầu Thay & Tương Giao Mật Thiết",
        "title_en": "Prayer, Intercession & Intimate Communion",
        "category": "Linh Đạo (Spiritual Life & Intercession)",
        "color": "#14b8a6",
        "badge_class": "teal",
        "golden_verse": "Sáng-thế Ký 18:23 / Thi-thiên 51:10 / Ma-thi-ơ 6:9-13 / Hê-bơ-rơ 4:16",
        "summary": "Mạch suối cầu nguyện xuyên suốt lịch sử cứu rỗi: Lời cầu thay của Áp-ra-ham cho Sô-đôm, Môi-se trên đỉnh núi, Bài Cầu Nguyện Chung của Chúa Giê-xu và ngai ân điển.",
        "redemptive_thesis": "Cầu nguyện không phải là cố gắng bẻ cong ý muốn của Đức Chúa Trời theo ý con người, mà là sự tương giao thân mật của người con thảo với Cha Thiên Thượng, bước vào quyền cầu thay trong danh Đấng Christ.",
        "scriptures": [
            {"ref": "Sáng-thế Ký 18:22-33", "testament": "OT", "role": "Mẫu Mực Cầu Thay Của Áp-ra-ham", "key_phrase": "Đấng đoán xét toàn thế gian, há lại không làm sự công bình sao?"},
            {"ref": "Xuất Ê-díp-tô Ký 32:30-32", "testament": "OT", "role": "Lời Cầu Thay Quên Mình Của Môi-se", "key_phrase": "Xin Chúa tha tội cho họ; bằng không, xin xóa tên tôi khỏi sách Chúa"},
            {"ref": "I Các Vua 18:36-39", "testament": "OT", "role": "Lời Cầu Nguyện Lửa Giáng Trên Núi Cạt-mên", "key_phrase": "Hỡi Đức Giê-hô-va, xin nhậm lời tôi, để dân nầy biết rằng Ngài là Đức Chúa Trời"},
            {"ref": "Thi-thiên 51:1-12", "testament": "OT", "role": "Bài Ca Ăn Năn Thống Hối Của Đa-vít", "key_phrase": "Đức Chúa Trời ôi! xin dựng nên trong tôi một lòng trong sạch"},
            {"ref": "Đa-ni-ên 9:3-19", "testament": "OT", "role": "Cầu Thay Theo Lời Hứa Kinh Thánh", "key_phrase": "Lạy Chúa, xin nghe! Lạy Chúa, xin tha thứ! Lạy Chúa, xin đoái xem và hành động!"},
            {"ref": "Ma-thi-ơ 6:9-13", "testament": "NT", "role": "Bài Cầu Nguyện Kiểu Mẫu Của Chúa Giê-xu", "key_phrase": "Lạy Cha chúng tôi ở trên trời, Danh Cha được thánh, Nước Cha được đến"},
            {"ref": "Giăng 17:1-26", "testament": "NT", "role": "Lời Cầu Nguyện Thầy Tế Lễ Thượng Phẩm", "key_phrase": "Con cầu nguyện cho họ, để họ hiệp làm một như Cha ở trong Con và Con ở trong Cha"},
            {"ref": "Hê-bơ-rơ 4:14-16", "testament": "NT", "role": "Vững Vàng Đến Gần Ngai Ân Điển", "key_phrase": "Hãy vững lòng đến gần ngai ân điển, để nhận được sự thương xót và tìm được ơn giúp đỡ"}
        ],
        "characters": [
            {"name": "Áp-ra-ham", "role": "Bạn của Đức Chúa Trời", "testament": "OT", "era": "Tổ Phụ", "significance": "Đứng trước mặt Chúa cầu thay kiên trì cho thành Sô-đôm."},
            {"name": "Môi-se", "role": "Người nói chuyện với Chúa mặt đối mặt", "testament": "OT", "era": "Xuất Hành", "significance": "Đứng vào chỗ sứt mẻ cầu thay để cơn thạnh nộ Chúa lìa khỏi dân sự."},
            {"name": "An-ne", "role": "Người mẹ cầu nguyện dốc đổ tâm hồn", "testament": "OT", "era": "Quan Xét & Sa-mu-ên", "significance": "Cầu xin một người con trong nước mắt và dâng Sa-mu-ên trọn đời cho Chúa."},
            {"name": "Chúa Giê-xu", "role": "Đấng Cầu Thay Đời Đời", "testament": "NT", "era": "Chúa Giê-xu", "significance": "Dành nhiều đêm cầu nguyện trên núi và hiện đang cầu thay cho chúng ta bên hữu Cha."}
        ],
        "events": [
            {"name": "Tiên Tri Ê-li Cầu Nguyện Tại Núi Cạt-mên", "period": "Vương Quốc Phân Chia", "significance": "Lửa từ trời giáng xuống thiêu rụi của lễ chứng minh Giê-hô-va là Chân Thần duy nhất."},
            {"name": "Chúa Giê-xu Cầu Nguyện Tại Vườn Ghết-sê-ma-nê", "period": "Cuộc Đời Chúa Giê-xu", "significance": "Mồ hôi trở nên như giọt máu lớn: 'Xin ý Cha được nên, chớ không theo ý Con'."}
        ],
        "doctrines": [
            {"name": "Tương Giao Với Ba Ngôi (Trinitarian Communion)", "summary": "Cầu nguyện hướng lên Đức Chúa Cha, nhân danh Đức Con Giê-xu, trong quyền năng soi dẫn của Đức Thánh Linh."},
            {"name": "Quyền Cầu Thay (Ministry of Intercession)", "summary": "Đặc ân đứng vào chỗ sứt mẻ vì tha nhân, Hội Thánh và các dân tộc chưa được cứu rỗi."},
            {"name": "Sự Dạn Dĩ Nơi Ngai Ân Điển", "summary": "Nhờ Huyết báu Chúa Giê-xu xé bức màn ngăn cách, con cái Chúa được quyền bước thẳng vào nơi Chí Thánh tương giao với Cha."}
        ],
        "eras_progression": [
            {"era_name": "Tổ Phụ", "revelation_step": "Áp-ra-ham bước đi và đàm đạo thân mật với Chúa như một người bạn tri kỷ.", "scripture": "Sáng-thế Ký 18:23", "focus": "Tương giao bạn hữu"},
            {"era_name": "Xuất Hành", "revelation_step": "Môi-se lên núi nói chuyện với Chúa mặt đối mặt như người ta nói chuyện với bạn mình.", "scripture": "Xuất Ê-díp-tô Ký 33:11", "focus": "Mặt đối mặt"},
            {"era_name": "Vương Quốc & Thi Ca", "revelation_step": "Các bài Thi Thiên trở thành sách cầu nguyện muôn đời với mọi cung bậc cảm xúc chân thật.", "scripture": "Thi-thiên 62:8", "focus": "Dốc đổ tâm hồn"},
            {"era_name": "Lưu Đày", "revelation_step": "Đa-ni-ên mở cửa sổ hướng về Giê-ru-sa-lem mỗi ngày ba lần quỳ gối tạ ơn Chúa bất chấp hầm sư tử.", "scripture": "Đa-ni-ên 6:10", "focus": "Kỷ luật trung kiên"},
            {"era_name": "Cuộc Đời Chúa Giê-xu", "revelation_step": "Chúa Giê-xu dạy môn đồ gọi Đấng Tối Cao là 'A-ba, Cha' và ban Bài Cầu Nguyện Kiểu Mẫu.", "scripture": "Ma-thi-ơ 6:9", "focus": "Mối liên hệ phụ tử"},
            {"era_name": "Hội Thánh", "revelation_step": "Hội Thánh ban đầu dốc lòng cầu nguyện chung; nơi họ nhóm lại rúng động và đầy dẫy Thánh Linh.", "scripture": "Công-vụ 4:31", "focus": "Quyền năng hiệp nhất"},
            {"era_name": "Khải Huyền", "revelation_step": "Lời cầu nguyện của các thánh đồ như hương thơm dâng lên trước ngai Đức Chúa Trời từ tay thiên sứ.", "scripture": "Khải-huyền 8:3-4", "focus": "Hương thơm thánh khiết"}
        ],
        "citations": [
            {"author": "E.M. Bounds", "work": "Power Through Prayer", "quote": "Đức Chúa Trời không tìm kiếm những phương pháp tốt hơn, Ngài đang tìm kiếm những con người cầu nguyện tốt hơn — những người mà qua họ Thánh Linh có thể vận hành quyền năng.", "tradition": "Spiritual Classic"},
            {"author": "Timothy Keller", "work": "Prayer: Experiencing Awe and Intimacy with God", "quote": "Cầu nguyện vừa là cuộc trò chuyện thân mật vừa là cuộc gặp gỡ quyền năng với Đấng Tạo Hóa; trong cầu nguyện, ta khám phá sự vĩ đại của Chúa và sự bình an sâu sắc nhất của linh hồn.", "tradition": "Contemporary Expository"}
        ],
        "homiletical_outline": {
            "title": "Bước Vào Nơi Chí Thánh: Quyền Năng Của Đời Sống Cầu Nguyện Chân Thật",
            "scripture_main": "Hê-bơ-rơ 4:14-16 & Ma-thi-ơ 6:5-13",
            "points": [
                {
                    "point_number": 1,
                    "title": "Đặc Ân Tiếp Cận Ngai Ân Điển Nhờ Đấng Trung Bảo Giê-xu",
                    "scripture": "Hê-bơ-rơ 4:14-16; 10:19-22",
                    "exposition": "Chúng ta không đến trước một vị quan tòa xa cách hay một vị thần vô cảm, mà đến trước 'Ngai Ân Điển' qua Thầy Tế Lễ Thượng Phẩm vĩ đại là Đấng đã cảm thông mọi nỗi yếu đuối của chúng ta.",
                    "application": "Dẹp bỏ sự tự ti hay nghi ngờ; dạn dĩ thưa chuyện với Chúa mỗi ngày trong sự nhận biết địa vị con cái yêu dấu."
                },
                {
                    "point_number": 2,
                    "title": "Cầu Nguyện Trong Sự Chân Thật: Không Hình Thức Giả Hình",
                    "scripture": "Ma-thi-ơ 6:5-8; Thi-thiên 51:6",
                    "exposition": "Chúa Giê-xu cảnh báo thói cầu nguyện khoe khoang nơi góc phố để người ta khen ngợi. Cầu nguyện thật diễn ra nơi 'phòng riêng kín nhiệm', nơi tấm lòng trần trụi trước mắt Cha.",
                    "application": "Thiết lập một góc cầu nguyện tĩnh lặng hằng ngày; thành thật dãi bày mọi nỗi niềm, thất vọng và tội lỗi trước mặt Chúa."
                },
                {
                    "point_number": 3,
                    "title": "Lời Cầu Thay Hiệu Nghiệm: Đồng Lao Cùng Mục Đích Của Nước Chúa",
                    "scripture": "Ma-thi-ơ 6:9-10; I Ti-mô-thê 2:1-4",
                    "exposition": "Cầu nguyện đạt đến đỉnh cao khi ta hướng về Danh Cha được thánh, Nước Cha được đến và Ý Cha được nên. Chúng ta được mời gọi đứng vào vị trí cầu thay cho người khác và cho thế giới.",
                    "application": "Lập danh sách cầu thay cho gia đình, bạn hữu chưa tin Chúa, Hội Thánh và những người đang chịu hoạn nạn."
                }
            ],
            "reflection_questions": [
                "Điều gì đang cản trở đời sống cầu nguyện cá nhân của bạn nhiều nhất: sự bận rộn, nỗi nghi ngờ hay tính hình thức?",
                "Kinh nghiệm nào đã giúp bạn nhận thấy rõ nhất lời hứa 'tìm được ơn giúp đỡ trong lúc cần dùng' của Chúa?"
            ]
        }
    }
}


def _extract_verse_from_db(db: Session, ref: str) -> str:
    """
    Helper to fetch verse text from bible_verses table by reference.
    """
    try:
        parts = re.findall(r'(\d+)', ref)
        if len(parts) >= 2:
            ch_num, v_num = int(parts[0]), int(parts[1])
            b_name = re.sub(r'[\d:\.\-\s]+$', '', ref).strip()
            sql = text("""
                SELECT v.text
                FROM bible_verses v
                JOIN bible_books b ON v.book_id = b.id
                WHERE b.name_vi ILIKE :b_name AND v.chapter = :ch AND v.verse = :v
                LIMIT 1
            """)
            row = db.execute(sql, {"b_name": f"%{b_name}%", "ch": ch_num, "v": v_num}).fetchone()
            if row and row[0]:
                return row[0].strip()
    except Exception as e:
        logger.warning(f"Error fetching verse for ref '{ref}': {e}")
    return ""


@router.get("/themes")
def get_thematic_catalog():
    """
    §17, §18 — Get catalogue of foundational Biblical & Covenantal Themes.
    """
    summaries = []
    for tid, t in THEMATIC_CATALOG.items():
        summaries.append({
            "id": t["id"],
            "title_vi": t["title_vi"],
            "title_en": t["title_en"],
            "category": t["category"],
            "color": t["color"],
            "badge_class": t.get("badge_class", "amber"),
            "golden_verse": t["golden_verse"],
            "summary": t["summary"],
            "scriptures_count": len(t.get("scriptures", [])),
            "characters_count": len(t.get("characters", [])),
            "events_count": len(t.get("events", [])),
            "doctrines_count": len(t.get("doctrines", []))
        })
    return {
        "total_themes": len(summaries),
        "themes": summaries
    }


@router.get("/theme-map")
def get_thematic_map(
    theme_id: str = Query("covenant_redemption", description="Theme ID"),
    db: Session = Depends(get_db)
):
    """
    §17, §18 — Generates an interactive Thematic Knowledge Graph for a chosen theme.
    Returns SVG/Cytoscape coordinates, nodes, typed links, era progression, commentary citations, and sermon outline.
    """
    if theme_id not in THEMATIC_CATALOG:
        theme_id = "covenant_redemption"

    t = THEMATIC_CATALOG[theme_id]

    # Center coordinates
    center_x = 460
    center_y = 320

    nodes = []
    edges = []

    # 1. Central Theme Hub Node
    hub_id = f"hub-{t['id']}"
    nodes.append({
        "id": hub_id,
        "type": "central_theme",
        "label": t["title_vi"],
        "color": t["color"],
        "x": center_x,
        "y": center_y,
        "radius": 36,
        "metadata": {
            "title_en": t["title_en"],
            "category": t["category"],
            "golden_verse": t["golden_verse"],
            "summary": t["summary"],
            "redemptive_thesis": t["redemptive_thesis"]
        }
    })

    # 2. Doctrinal Pillars (Inner Orbit: radius 150)
    doctrines = t.get("doctrines", [])
    doc_count = len(doctrines)
    doc_nodes = []
    for idx, doc in enumerate(doctrines):
        angle = (2 * math.pi * idx) / max(1, doc_count) - (math.pi / 2)
        r = 150
        nx = round(center_x + r * math.cos(angle))
        ny = round(center_y + r * math.sin(angle))
        nid = f"doc-{idx+1}"
        doc_node = {
            "id": nid,
            "type": "doctrine_pillar",
            "label": doc["name"],
            "color": "#a855f7",
            "x": nx,
            "y": ny,
            "radius": 20,
            "metadata": {
                "name": doc["name"],
                "summary": doc["summary"],
                "role": "Trụ cột tín lý thần học"
            }
        }
        nodes.append(doc_node)
        doc_nodes.append(nid)

        # Edge from central hub to doctrine
        edges.append({
            "id": f"e-hub-{nid}",
            "source": hub_id,
            "target": nid,
            "relation": "theological_foundation",
            "label": "Trụ cột"
        })

    # 3. Scripture Anchors (Middle Orbit: radius 265)
    scriptures = t.get("scriptures", [])
    sc_count = len(scriptures)
    sc_nodes = []
    ot_nodes = []
    nt_nodes = []

    for idx, sc in enumerate(scriptures):
        angle = (2 * math.pi * idx) / max(1, sc_count) - (math.pi / 4)
        r = 265
        nx = round(center_x + r * math.cos(angle))
        ny = round(center_y + r * math.sin(angle))
        nid = f"sc-{idx+1}"

        verse_text = _extract_verse_from_db(db, sc["ref"])
        if not verse_text:
            verse_text = sc.get("key_phrase", "")

        is_ot = sc["testament"] == "OT"
        sc_node = {
            "id": nid,
            "type": "scripture_anchor",
            "label": sc["ref"],
            "color": "#38bdf8" if is_ot else "#34d399",
            "x": nx,
            "y": ny,
            "radius": 22,
            "metadata": {
                "reference": sc["ref"],
                "testament": sc["testament"],
                "role": sc["role"],
                "key_phrase": sc["key_phrase"],
                "verse_text": verse_text
            }
        }
        nodes.append(sc_node)
        sc_nodes.append(nid)
        if is_ot:
            ot_nodes.append(nid)
        else:
            nt_nodes.append(nid)

        # Edge from central hub to scripture
        edges.append({
            "id": f"e-hub-{nid}",
            "source": hub_id,
            "target": nid,
            "relation": "covenant_scripture",
            "label": "Bản văn chính kinh"
        })

    # Inter-testament links (OT Shadow -> NT Fulfillment)
    for i in range(min(len(ot_nodes), len(nt_nodes))):
        edges.append({
            "id": f"e-fulfill-{ot_nodes[i]}-{nt_nodes[i]}",
            "source": ot_nodes[i],
            "target": nt_nodes[i],
            "relation": "typological_fulfillment",
            "label": "Ứng nghiệm"
        })

    # 4. Key Characters & Events (Outer Orbit: radius 370)
    characters = t.get("characters", [])
    events = t.get("events", [])
    outer_items = []
    for c in characters:
        outer_items.append({"item": c, "item_type": "character", "label": c["name"], "color": "#60a5fa"})
    for ev in events:
        outer_items.append({"item": ev, "item_type": "event", "label": ev["name"], "color": "#fbbf24"})

    out_count = len(outer_items)
    for idx, out in enumerate(outer_items):
        angle = (2 * math.pi * idx) / max(1, out_count)
        r = 370
        nx = round(center_x + r * math.cos(angle))
        ny = round(center_y + r * math.sin(angle))
        nid = f"out-{idx+1}"

        nodes.append({
            "id": nid,
            "type": out["item_type"],
            "label": out["label"],
            "color": out["color"],
            "x": nx,
            "y": ny,
            "radius": 18,
            "metadata": out["item"]
        })

        # Link outer item to closest scripture or central hub
        target_sc = sc_nodes[idx % len(sc_nodes)] if sc_nodes else hub_id
        edges.append({
            "id": f"e-out-{nid}-{target_sc}",
            "source": target_sc,
            "target": nid,
            "relation": "historical_manifestation",
            "label": "Bối cảnh"
        })

    return {
        "theme": {
            "id": t["id"],
            "title_vi": t["title_vi"],
            "title_en": t["title_en"],
            "category": t["category"],
            "color": t["color"],
            "golden_verse": t["golden_verse"],
            "summary": t["summary"],
            "redemptive_thesis": t["redemptive_thesis"]
        },
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "scriptures_count": len(scriptures),
            "characters_count": len(characters),
            "events_count": len(events),
            "doctrines_count": len(doctrines)
        },
        "nodes": nodes,
        "edges": edges,
        "eras_trajectory": t.get("eras_progression", []),
        "commentary_citations": t.get("citations", []),
        "homiletical_outline": t.get("homiletical_outline", {})
    }



