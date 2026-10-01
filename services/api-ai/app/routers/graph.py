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
