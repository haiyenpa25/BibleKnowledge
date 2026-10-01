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


