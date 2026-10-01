"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Network, 
  Clock, 
  Users, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Search, 
  Sparkles, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Info,
  Loader2,
  X,
  Compass,
  Filter,
  Map as MapIcon,
  Navigation,
  Milestone,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  ArrowRight
} from "lucide-react";

interface GraphNode {
  id: string;
  node_type: string;
  node_key: string;
  label: string;
  metadata: Record<string, any>;
  x?: number;
  y?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  source_key: string;
  target_key: string;
  relation: string;
  confidence: string;
  metadata: Record<string, any>;
}

interface TimelineEvent {
  id: string;
  slug: string;
  title: string;
  approximate_date?: string;
  date_type?: string;
  period?: string;
  description?: string;
  scripture?: string;
  era_order: number;
}

interface BiblicalPlace {
  id: string;
  slug: string;
  name_vi: string;
  name_en?: string;
  modern_name?: string;
  latitude: number;
  longitude: number;
  description?: string;
  metadata?: Record<string, any>;
}

interface Waypoint {
  order: number;
  name: string;
  modern: string;
  lat: number;
  lng: number;
  scripture: string;
  notes: string;
}

interface BiblicalJourney {
  id: string;
  title: string;
  period: string;
  description: string;
  color: string;
  waypoints: Waypoint[];
}

interface EntityDetail {
  type: string;
  slug: string;
  name_vi: string;
  name_en?: string;
  original_name?: string;
  gender?: string;
  title_or_role?: string;
  summary?: string;
  timeline_period?: string;
  modern_name?: string;
  description?: string;
  metadata?: Record<string, any>;
  connections: Array<{
    relation: string;
    connected_type: string;
    connected_slug: string;
    connected_label: string;
  }>;
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"graph" | "timeline" | "map" | "entities">("graph");

  // Graph State
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEntityDetail, setSelectedEntityDetail] = useState<EntityDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [graphFilter, setGraphFilter] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loadingGraph, setLoadingGraph] = useState(true);

  // Timeline State
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);

  // Map & Journeys State
  const [places, setPlaces] = useState<BiblicalPlace[]>([]);
  const [journeys, setJourneys] = useState<BiblicalJourney[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>("journey-jesus");
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch Graph Data
  const fetchGraph = async (type?: string, search?: string) => {
    setLoadingGraph(true);
    try {
      let url = `${apiUrl}/api/graph/data?`;
      if (type && type !== "all") url += `node_type=${encodeURIComponent(type)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        const total = data.nodes.length;
        const radius = Math.min(340, Math.max(220, total * 10));
        const centerX = 450;
        const centerY = 320;

        const positionedNodes = data.nodes.map((n: GraphNode, i: number) => {
          const angle = (i / total) * 2 * Math.PI;
          const r = n.node_type === "person" && n.node_key === "chua-gie-xu" ? 0 : radius + (i % 3 === 0 ? -30 : i % 2 === 0 ? 20 : 0);
          return {
            ...n,
            x: n.node_key === "chua-gie-xu" ? centerX : centerX + r * Math.cos(angle),
            y: n.node_key === "chua-gie-xu" ? centerY : centerY + r * Math.sin(angle)
          };
        });

        setNodes(positionedNodes);
        setEdges(data.edges);
      }
    } catch (err) {
      console.error("Failed to load graph data:", err);
    } finally {
      setLoadingGraph(false);
    }
  };

  // Fetch Timeline Data
  const fetchTimeline = async () => {
    setLoadingTimeline(true);
    try {
      const res = await fetch(`${apiUrl}/api/graph/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data);
      }
    } catch (err) {
      console.error("Failed to load timeline:", err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Fetch Map Places & Journeys
  const fetchMapData = async () => {
    setLoadingMap(true);
    try {
      const [pRes, jRes] = await Promise.all([
        fetch(`${apiUrl}/api/graph/places`),
        fetch(`${apiUrl}/api/graph/journeys`)
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setPlaces(pData);
      }
      if (jRes.ok) {
        const jData = await jRes.json();
        setJourneys(jData);
        if (jData.length > 0) {
          const defaultJ = jData.find((j: BiblicalJourney) => j.id === "journey-jesus") || jData[0];
          setSelectedJourneyId(defaultJ.id);
          setActiveWaypoint(defaultJ.waypoints[0] || null);
        }
      }
    } catch (err) {
      console.error("Failed to load map data:", err);
    } finally {
      setLoadingMap(false);
    }
  };

  // Fetch Entity Detail when Node is Selected
  const fetchEntityDetail = async (type: string, slug: string) => {
    setLoadingDetail(true);
    setSelectedEntityDetail(null);
    try {
      const res = await fetch(`${apiUrl}/api/graph/entities/${type}/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEntityDetail(data);
      }
    } catch (err) {
      console.error("Failed to fetch entity detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchGraph();
    fetchTimeline();
    fetchMapData();
  }, [apiUrl]);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    fetchEntityDetail(node.node_type, node.node_key);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGraph(graphFilter, searchKeyword);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "person":
        return { fill: "#3b82f6", stroke: "#60a5fa", text: "text-blue-400", bg: "bg-blue-500/20" };
      case "place":
        return { fill: "#10b981", stroke: "#34d399", text: "text-emerald-400", bg: "bg-emerald-500/20" };
      case "event":
        return { fill: "#f59e0b", stroke: "#fbbf24", text: "text-amber-400", bg: "bg-amber-500/20" };
      default:
        return { fill: "#8b5cf6", stroke: "#a78bfa", text: "text-indigo-400", bg: "bg-indigo-500/20" };
    }
  };

  // Project Geographic coordinates (lat, lng) to SVG space (900x600)
  // Region bounds: Lat 26..43.5, Lng 11..48 (covers Rome, Greece, Asia Minor, Canaan, Egypt, Mesopotamia)
  const projectCoordinates = (lat: number, lng: number) => {
    const minLat = 26.0;
    const maxLat = 43.5;
    const minLng = 11.0;
    const maxLng = 48.0;

    const x = ((lng - minLng) / (maxLng - minLng)) * 820 + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520 + 40;
    return { x: Math.max(30, Math.min(870, x)), y: Math.max(30, Math.min(570, y)) };
  };

  const currentJourney = journeys.find((j) => j.id === selectedJourneyId);

  // Guided Journey Tour Controllers
  const speakWaypoint = (wp: Waypoint) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Trạm ${wp.order}: ${wp.name}. Vị trí hiện đại: ${wp.modern}. Kinh Thánh: ${wp.scripture}. ${wp.notes}`
      );
      utterance.lang = "vi-VN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopTour = () => {
    if (tourTimerRef.current) {
      clearInterval(tourTimerRef.current);
      tourTimerRef.current = null;
    }
    setIsPlayingTour(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const startTour = () => {
    if (!currentJourney || currentJourney.waypoints.length === 0) return;
    setIsPlayingTour(true);
    let currentIndex = 0;
    if (activeWaypoint) {
      const idx = currentJourney.waypoints.findIndex((w) => w.order === activeWaypoint.order);
      if (idx !== -1 && idx < currentJourney.waypoints.length - 1) {
        currentIndex = idx + 1;
      }
    }
    const wp = currentJourney.waypoints[currentIndex];
    setActiveWaypoint(wp);
    speakWaypoint(wp);

    if (tourTimerRef.current) clearInterval(tourTimerRef.current);

    tourTimerRef.current = setInterval(() => {
      currentIndex++;
      if (!currentJourney || currentIndex >= currentJourney.waypoints.length) {
        stopTour();
      } else {
        const nextWp = currentJourney.waypoints[currentIndex];
        setActiveWaypoint(nextWp);
        speakWaypoint(nextWp);
      }
    }, 6500);
  };

  const toggleTour = () => {
    if (isPlayingTour) {
      stopTour();
    } else {
      startTour();
    }
  };

  const handleSelectJourney = (journeyId: string) => {
    stopTour();
    setSelectedJourneyId(journeyId);
    const j = journeys.find((item) => item.id === journeyId);
    if (j && j.waypoints.length > 0) {
      setActiveWaypoint(j.waypoints[0]);
    }
  };

  // Cleanup speech/tour timer on unmount
  useEffect(() => {
    return () => {
      if (tourTimerRef.current) {
        clearInterval(tourTimerRef.current);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Network className="w-6 h-6 text-indigo-400" />
              Khám Phá & Đồ Thị Tri Thức (Explore & Connect)
            </h1>
            <p className="text-xs text-slate-400">
              Đồ thị quan hệ thực thể • Dòng thời gian lịch sử • Bản đồ không gian Thánh địa & Các hành trình
            </p>
          </div>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("graph")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "graph"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Network className="w-4 h-4" /> Đồ Thị Tri Thức
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "timeline"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Clock className="w-4 h-4" /> Dòng Thời Gian
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "map"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <MapIcon className="w-4 h-4" /> Bản Đồ & Hành Trình
          </button>
          <button
            onClick={() => setActiveTab("entities")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "entities"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" /> Thư Mục Thực Thể
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 1. KNOWLEDGE GRAPH VIEW */}
      {/* ===================================================================== */}
      {activeTab === "graph" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 whitespace-nowrap">Lọc:</span>
              {[
                { id: "all", label: "Tất cả node" },
                { id: "person", label: "Nhân vật (Person)", color: "text-blue-400" },
                { id: "place", label: "Địa danh (Place)", color: "text-emerald-400" },
                { id: "event", label: "Biến cố (Event)", color: "text-amber-400" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setGraphFilter(f.id);
                    fetchGraph(f.id, searchKeyword);
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    graphFilter === f.id
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                      : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm nhân vật, địa danh..."
                  className="bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                Tìm
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl glass-panel border border-slate-700/60 p-4 h-[640px] relative overflow-hidden flex flex-col justify-between">
              {loadingGraph ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-xs">Đang dựng đồ thị liên kết thực thể...</p>
                </div>
              ) : (
                <svg className="w-full h-full select-none cursor-grab active:cursor-grabbing" viewBox="0 0 900 640">
                  <defs>
                    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Edges */}
                  {edges.map((e) => {
                    const src = nodes.find((n) => n.id === e.source);
                    const tgt = nodes.find((n) => n.id === e.target);
                    if (!src || !tgt || src.x === undefined || src.y === undefined || tgt.x === undefined || tgt.y === undefined) return null;

                    const isHighlight = selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);

                    return (
                      <g key={e.id}>
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke={isHighlight ? "#60a5fa" : "rgba(148, 163, 184, 0.2)"}
                          strokeWidth={isHighlight ? 2.5 : 1}
                          strokeDasharray={e.relation.includes("PROPHECY") ? "4,4" : undefined}
                        />
                        {isHighlight && (
                          <text
                            x={(src.x + tgt.x) / 2}
                            y={(src.y + tgt.y) / 2 - 4}
                            fill="#93c5fd"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="bg-slate-900 px-1"
                          >
                            {e.relation}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((n) => {
                    if (n.x === undefined || n.y === undefined) return null;
                    const isSelected = selectedNode?.id === n.id;
                    const colors = getNodeColor(n.node_type);
                    const isCentral = n.node_key === "chua-gie-xu";
                    const radius = isCentral ? 30 : isSelected ? 24 : 18;

                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        onClick={() => handleNodeClick(n)}
                        className="cursor-pointer group"
                      >
                        {(isSelected || isCentral) && (
                          <circle
                            r={radius + 8}
                            fill={colors.fill}
                            opacity={0.25}
                            filter="url(#glow)"
                            className="animate-pulse"
                          />
                        )}
                        <circle
                          r={radius}
                          fill={isCentral ? "#1e3a8a" : "#0f172a"}
                          stroke={isSelected ? "#ffffff" : colors.stroke}
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-all duration-200 group-hover:scale-110"
                        />
                        <circle
                          r={4}
                          fill={colors.stroke}
                        />
                        <text
                          y={radius + 14}
                          fill={isSelected ? "#ffffff" : "#e2e8f0"}
                          fontSize={isCentral ? "12" : "10"}
                          fontWeight={isSelected || isCentral ? "bold" : "normal"}
                          textAnchor="middle"
                          className="select-none pointer-events-none drop-shadow-md"
                        >
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Nhân vật
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Địa danh
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Biến cố
                </span>
                <span className="text-[11px] text-slate-500">Nhấp vào node để mở chi tiết</span>
              </div>
            </div>

            {/* Entity Inspector Side Panel */}
            <div className="rounded-3xl glass-panel border border-slate-700/60 p-6 flex flex-col gap-4 overflow-y-auto max-h-[640px]">
              {selectedNode ? (
                loadingDetail ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    <p className="text-xs">Đang tải hồ sơ thực thể...</p>
                  </div>
                ) : selectedEntityDetail ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${getNodeColor(selectedEntityDetail.type).bg} ${getNodeColor(selectedEntityDetail.type).text}`}>
                            {selectedEntityDetail.type}
                          </span>
                          {selectedEntityDetail.original_name && (
                            <span className="text-xs text-slate-400 font-serif italic">
                              {selectedEntityDetail.original_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-extrabold text-white mt-1">
                          {selectedEntityDetail.name_vi}
                        </h3>
                        {selectedEntityDetail.name_en && (
                          <div className="text-xs text-slate-400">{selectedEntityDetail.name_en}</div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {selectedEntityDetail.title_or_role && (
                      <div className="text-xs text-indigo-300 font-medium bg-indigo-950/40 border border-indigo-800/40 p-2.5 rounded-xl">
                        👑 {selectedEntityDetail.title_or_role}
                      </div>
                    )}
                    {selectedEntityDetail.timeline_period && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{selectedEntityDetail.timeline_period}</span>
                      </div>
                    )}
                    {selectedEntityDetail.modern_name && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Hiện đại: {selectedEntityDetail.modern_name}</span>
                      </div>
                    )}

                    <div className="text-xs text-slate-300 leading-relaxed pt-1">
                      {selectedEntityDetail.summary || selectedEntityDetail.description}
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-indigo-400" /> Các mối liên kết trực tiếp ({selectedEntityDetail.connections.length})
                      </h4>
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {selectedEntityDetail.connections.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const found = nodes.find((n) => n.node_key === c.connected_slug);
                              if (found) handleNodeClick(found);
                            }}
                            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left text-xs transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${c.connected_type === "person" ? "bg-blue-400" : c.connected_type === "place" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                              <span className="text-slate-300 group-hover:text-white font-medium">{c.connected_label}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono group-hover:text-indigo-400">
                              {c.relation}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedEntityDetail.metadata?.key_verse && (
                      <Link
                        href={`/bible?ref=${encodeURIComponent(selectedEntityDetail.metadata.key_verse)}`}
                        className="mt-2 p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Đọc câu Kinh Thánh cốt lõi ({selectedEntityDetail.metadata.key_verse}) →</span>
                      </Link>
                    )}
                  </div>
                ) : null
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-slate-500 py-16">
                  <Compass className="w-12 h-12 text-slate-700 stroke-[1.5]" />
                  <p className="text-xs max-w-xs leading-relaxed">
                    Chọn một điểm trên đồ thị (Chúa Giê-xu, Phi-e-rơ, Giê-ru-sa-lem...) để xem mạng lưới quan hệ và hồ sơ Kinh Thánh chi tiết.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. BIBLICAL TIMELINE VIEW */}
      {/* ===================================================================== */}
      {activeTab === "timeline" && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-white">Dòng Thời Gian Lịch Sử Kinh Thánh (Biblical Timeline)</h2>
            <p className="text-xs text-slate-400">
              Trình tự các biến cố cứu chuộc từ thuở Sáng tạo đến Hội Thánh thời kỳ các Sứ Đồ
            </p>
          </div>

          {loadingTimeline ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-xs">Đang tải dòng thời gian...</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 md:ml-32 flex flex-col gap-8 py-4">
              {timeline.map((ev) => (
                <div key={ev.id} className="relative pl-6 md:pl-8 group">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 group-hover:border-amber-400 group-hover:scale-125 transition-all"></div>
                  <div className="md:absolute md:-left-36 md:top-1 text-xs font-mono font-bold text-amber-400/90 whitespace-nowrap">
                    {ev.approximate_date}
                  </div>
                  <div className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {ev.period}
                      </span>
                      {ev.scripture && (
                        <Link 
                          href={`/bible?ref=${encodeURIComponent(ev.scripture)}`}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{ev.scripture}</span>
                        </Link>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-serif">
                      {ev.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. BIBLE MAP & SPATIAL JOURNEYS (NEW PHASE 6) */}
      {/* ===================================================================== */}
      {activeTab === "map" && (
        <div className="flex flex-col gap-6">
          {/* Journeys Selector Bar & Tour Action */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 whitespace-nowrap">Chọn hành trình:</span>
              {journeys.map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleSelectJourney(j.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedJourneyId === j.id
                      ? "bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/30"
                      : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{j.title}</span>
                </button>
              ))}
            </div>

            {/* Guided Tour Play/Pause button */}
            {currentJourney && (
              <button
                onClick={toggleTour}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isPlayingTour
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/40 animate-pulse"
                    : "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md shadow-rose-600/20"
                }`}
              >
                {isPlayingTour ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Tạm Dừng Mô Phỏng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mô Phỏng Tự Động (Guided Tour)</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Vector Map Canvas */}
            <div className="lg:col-span-2 rounded-3xl glass-panel border border-slate-700/60 p-4 h-[620px] relative overflow-hidden flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              {loadingMap ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                  <p className="text-xs">Đang tải bản đồ không gian Thánh địa...</p>
                </div>
              ) : (
                <svg className="w-full h-full select-none" viewBox="0 0 900 600">
                  <defs>
                    <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="mapGlow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Water bodies & regions hints */}
                  <rect width="900" height="600" fill="#090d16" />

                  {/* Decorative Ancient Geography Lines & Names */}
                  <text x="70" y="110" fill="rgba(168, 85, 247, 0.2)" fontSize="13" fontWeight="bold" fontFamily="serif" letterSpacing="2">
                    Ý & LA-MÃ (ITALY / ROME)
                  </text>
                  <text x="270" y="140" fill="rgba(59, 130, 246, 0.2)" fontSize="13" fontWeight="bold" fontFamily="serif" letterSpacing="2">
                    HY LẠP & MA-XÊ-ĐOAN
                  </text>
                  <text x="250" y="270" fill="rgba(59, 130, 246, 0.2)" fontSize="16" fontWeight="bold" fontFamily="serif" letterSpacing="4">
                    ĐỊA TRUNG HẢI (MEDITERRANEAN SEA)
                  </text>
                  <text x="540" y="370" fill="rgba(16, 185, 129, 0.25)" fontSize="13" fontWeight="bold" fontFamily="serif">
                    CA-NA-AN (ĐẤT HỨA)
                  </text>
                  <text x="480" y="520" fill="rgba(239, 68, 68, 0.2)" fontSize="13" fontWeight="bold" fontFamily="serif" letterSpacing="2">
                    BIỂN ĐỎ (RED SEA)
                  </text>
                  <text x="700" y="340" fill="rgba(245, 158, 11, 0.15)" fontSize="15" fontWeight="bold" fontFamily="serif" letterSpacing="3">
                    LƯỠNG HÀ (MESOPOTAMIA)
                  </text>

                  {/* Grid latitude lines */}
                  {[100, 200, 300, 400, 500].map((y) => (
                    <line key={y} x1="0" y1={y} x2="900" y2={y} stroke="rgba(148, 163, 184, 0.05)" strokeDasharray="3,3" />
                  ))}

                  {/* Journey Route Polyline */}
                  {currentJourney && currentJourney.waypoints.length > 1 && (
                    <g>
                      {currentJourney.waypoints.slice(0, -1).map((wp, idx) => {
                        const nextWp = currentJourney.waypoints[idx + 1];
                        const p1 = projectCoordinates(wp.lat, wp.lng);
                        const p2 = projectCoordinates(nextWp.lat, nextWp.lng);
                        return (
                          <line
                            key={idx}
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke={currentJourney.color}
                            strokeWidth="2.5"
                            strokeDasharray="6,4"
                            className="animate-pulse"
                            opacity="0.8"
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* All Places Pins */}
                  {places.map((pl) => {
                    if (!pl.latitude || !pl.longitude) return null;
                    const pt = projectCoordinates(pl.latitude, pl.longitude);
                    const isWaypoint = currentJourney?.waypoints.some((w) => w.name.includes(pl.name_vi));

                    return (
                      <g key={pl.id} transform={`translate(${pt.x}, ${pt.y})`} className="cursor-pointer group">
                        <circle
                          r={isWaypoint ? 6 : 4}
                          fill={isWaypoint ? "#ffffff" : "#10b981"}
                          opacity={isWaypoint ? 0.9 : 0.5}
                          stroke="#0f172a"
                          strokeWidth="1.5"
                        />
                        <text
                          y="-8"
                          fill={isWaypoint ? "#ffffff" : "rgba(148, 163, 184, 0.6)"}
                          fontSize={isWaypoint ? "10" : "8"}
                          fontWeight={isWaypoint ? "bold" : "normal"}
                          textAnchor="middle"
                          className="pointer-events-none drop-shadow"
                        >
                          {pl.name_vi}
                        </text>
                      </g>
                    );
                  })}

                  {/* Journey Waypoints Pins */}
                  {currentJourney?.waypoints.map((wp) => {
                    const pt = projectCoordinates(wp.lat, wp.lng);
                    const isActive = activeWaypoint?.order === wp.order;

                    return (
                      <g
                        key={wp.order}
                        transform={`translate(${pt.x}, ${pt.y})`}
                        onClick={() => setActiveWaypoint(wp)}
                        className="cursor-pointer group"
                      >
                        {isActive && (
                          <circle
                            r="16"
                            fill={currentJourney.color}
                            opacity="0.3"
                            filter="url(#mapGlow)"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          r={isActive ? 12 : 9}
                          fill={currentJourney.color}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-transform group-hover:scale-125"
                        />
                        <text
                          y="3"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                        >
                          {wp.order}
                        </text>
                        <text
                          y="22"
                          fill={isActive ? "#ffffff" : "#cbd5e1"}
                          fontSize="10"
                          fontWeight={isActive ? "bold" : "medium"}
                          textAnchor="middle"
                          className="pointer-events-none drop-shadow"
                        >
                          {wp.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Map Footer Note */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-rose-400" />
                  <span>Khu vực Cận Đông Cổ Đại & Địa Trung Hải • Nhấp vào trạm dừng (1, 2, 3...) để xem chi tiết</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">Tọa độ WGS84</span>
              </div>
            </div>

            {/* Journey Stepper & Waypoint Inspector Panel */}
            <div className="rounded-3xl glass-panel border border-slate-700/60 p-6 flex flex-col justify-between gap-4 overflow-y-auto max-h-[620px]">
              {currentJourney && (
                <div className="flex flex-col gap-4">
                  <div className="pb-3 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {currentJourney.period}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1.5">
                      {currentJourney.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-serif mt-1">
                      {currentJourney.description}
                    </p>
                  </div>

                  {/* Waypoint Detail Highlight */}
                  {activeWaypoint && (
                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow">
                            {activeWaypoint.order}
                          </span>
                          <button
                            onClick={() => speakWaypoint(activeWaypoint)}
                            title="Nghe thuyết minh âm thanh trạm này"
                            className="px-2 py-0.5 rounded-lg bg-rose-900/50 hover:bg-rose-800 border border-rose-700/60 text-rose-200 text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Volume2 className="w-3 h-3 text-rose-300" />
                            <span>Đọc Thuyết Minh</span>
                          </button>
                        </div>
                        <Link
                          href={`/bible?ref=${encodeURIComponent(activeWaypoint.scripture)}`}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{activeWaypoint.scripture}</span>
                        </Link>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white">
                          {activeWaypoint.name}
                        </h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>Vị trí hiện đại: {activeWaypoint.modern}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-serif pt-1">
                        {activeWaypoint.notes}
                      </p>

                      {/* Previous / Next Stepper Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-rose-900/40 text-xs">
                        <button
                          disabled={activeWaypoint.order <= 1}
                          onClick={() => {
                            const prev = currentJourney.waypoints.find(w => w.order === activeWaypoint.order - 1);
                            if (prev) {
                              setActiveWaypoint(prev);
                              if (isPlayingTour) speakWaypoint(prev);
                            }
                          }}
                          className="text-[11px] text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          ← Chặng trước
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {activeWaypoint.order} / {currentJourney.waypoints.length}
                        </span>
                        <button
                          disabled={activeWaypoint.order >= currentJourney.waypoints.length}
                          onClick={() => {
                            const next = currentJourney.waypoints.find(w => w.order === activeWaypoint.order + 1);
                            if (next) {
                              setActiveWaypoint(next);
                              if (isPlayingTour) speakWaypoint(next);
                            }
                          }}
                          className="text-[11px] text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          Chặng sau →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* All Steps in Journey */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Milestone className="w-3.5 h-3.5 text-rose-400" />
                      Các Chặng Dừng Chân ({currentJourney.waypoints.length})
                    </h4>
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {currentJourney.waypoints.map((wp) => (
                        <button
                          key={wp.order}
                          onClick={() => setActiveWaypoint(wp)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                            activeWaypoint?.order === wp.order
                              ? "bg-rose-950/40 border-rose-600 text-white font-semibold"
                              : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                              {wp.order}
                            </span>
                            <span>{wp.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {wp.scripture}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. ENTITIES DIRECTORY VIEW */}
      {/* ===================================================================== */}
      {activeTab === "entities" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Thư Mục Nhân Vật & Địa Danh Cốt Lõi</h2>
              <p className="text-xs text-slate-400">Khám phá các nhân vật đức tin và những vùng đất diễn ra lịch sử cứu rỗi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((n) => {
              const colors = getNodeColor(n.node_type);
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    setActiveTab("graph");
                    handleNodeClick(n);
                  }}
                  className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 cursor-pointer flex flex-col justify-between gap-3 group transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                        {n.node_type}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-base font-bold text-white mt-2 group-hover:text-blue-300 transition-colors">
                      {n.label}
                    </h3>
                    {n.metadata?.role && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {n.metadata.role}
                      </p>
                    )}
                    {n.metadata?.period && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        {n.metadata.period}
                      </p>
                    )}
                  </div>
                  <div className="text-[11px] text-blue-400/80 font-medium pt-2 border-t border-slate-800 flex items-center gap-1">
                    <span>Xem mạng lưới liên kết →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
