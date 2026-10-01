"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ArrowRight,
  HelpCircle,
  Layers,
  GitBranch,
  ShieldAlert,
  Columns,
  GitCompare
} from "lucide-react";

interface HarmonyVerse {
  verse: number;
  text_vi: string;
  text_kjv?: string;
  section_title?: string;
}

interface HarmonyPassageItem {
  book_code: string;
  book_name: string;
  ref: string;
  chapter: number;
  start_verse: number;
  end_verse: number;
  theological_focus: string;
  total_verses?: number;
  verses?: HarmonyVerse[];
}

interface HarmonyEventItem {
  id: string;
  title_vi: string;
  title_en: string;
  category: string;
  period_date: string;
  location: string;
  summary: string;
  passages: Record<string, HarmonyPassageItem>;
  synoptic_distinctives: {
    shared_elements: string[];
    unique_details: Record<string, string>;
    theological_significance: string;
    key_themes: string[];
  };
}

interface CrossBibleConnection {
  id: string;
  connection_type: string;
  title: string;
  typology_theme: string;
  ot_anchor_ref: string;
  ot_anchor_text: string;
  nt_fulfillment_ref: string;
  nt_fulfillment_text: string;
  revelation_chain: string[];
  theological_synthesis: string;
  confidence_score: number;
  scholarly_source?: string;
}

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
  people?: string[];
  places?: string[];
  theological_significance?: string;
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

interface MilestoneEvent {
  title: string;
  period: string;
  description: string;
}

interface RelationshipItem {
  target_name: string;
  relation: string;
}

interface CharacterStudyData {
  slug: string;
  name_vi: string;
  name_en: string;
  original_name?: string;
  title_or_role: string;
  timeline_period: string;
  summary: string;
  key_verses: string[];
  milestone_events: MilestoneEvent[];
  relationships: RelationshipItem[];
  ai_theological_portrait: string;
  spiritual_lessons: string[];
  reflection_questions: string[];
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"graph" | "timeline" | "map" | "entities" | "typology" | "harmony">("graph");

  // Gospel Harmony & Parallel Passages State (§8, §18)
  const [harmonyEvents, setHarmonyEvents] = useState<HarmonyEventItem[]>([]);
  const [harmonyCategories, setHarmonyCategories] = useState<string[]>([]);
  const [selectedHarmonyCat, setSelectedHarmonyCat] = useState<string>("Tất cả");
  const [harmonySearch, setHarmonySearch] = useState<string>("");
  const [selectedHarmonyEvent, setSelectedHarmonyEvent] = useState<HarmonyEventItem | null>(null);
  const [loadingHarmonyList, setLoadingHarmonyList] = useState<boolean>(false);
  const [loadingHarmonyDetail, setLoadingHarmonyDetail] = useState<boolean>(false);
  const [speakingPassage, setSpeakingPassage] = useState<string | null>(null);

  // Character Dossier Modal State (§7)
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierData, setDossierData] = useState<CharacterStudyData | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [dossierError, setDossierError] = useState<string | null>(null);
  const [isDossierSpeaking, setIsDossierSpeaking] = useState(false);

  // Cross-Bible Connections & Typology State (§18)
  const [connections, setConnections] = useState<CrossBibleConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connectionTypeFilter, setConnectionTypeFilter] = useState<string>("all");
  const [connectionSearch, setConnectionSearch] = useState<string>("");
  const [selectedConnection, setSelectedConnection] = useState<CrossBibleConnection | null>(null);

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
  const [selectedTimelineEra, setSelectedTimelineEra] = useState<string>("all");
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<TimelineEvent | null>(null);
  const [timelineSearch, setTimelineSearch] = useState<string>("");

  const filteredTimeline = useMemo(() => {
    return timeline.filter((ev) => {
      // Era filter
      if (selectedTimelineEra === "primeval_patriarch") {
        if (!["Creation & Primeval", "Patriarchs"].includes(ev.period || "")) return false;
      } else if (selectedTimelineEra === "exodus_conquest") {
        if (!["Exodus & Wilderness", "Conquest & Settlement", "Judges"].includes(ev.period || "")) return false;
      } else if (selectedTimelineEra === "monarchy") {
        if (!["United Kingdom", "Divided Kingdom"].includes(ev.period || "")) return false;
      } else if (selectedTimelineEra === "exile_restoration") {
        if (!["Exile", "Return & Restoration", "Intertestamental"].includes(ev.period || "")) return false;
      } else if (selectedTimelineEra === "christ") {
        if (!["Life of Christ"].includes(ev.period || "")) return false;
      } else if (selectedTimelineEra === "church") {
        if (!["Early Church", "Apostolic & Revelation"].includes(ev.period || "")) return false;
      }

      // Search keyword filter
      if (timelineSearch.trim()) {
        const q = timelineSearch.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = (ev.description || "").toLowerCase().includes(q);
        const matchesRef = (ev.scripture || "").toLowerCase().includes(q);
        const matchesPeople = (ev.people || []).some(p => p.toLowerCase().includes(q));
        const matchesPlaces = (ev.places || []).some(p => p.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesRef && !matchesPeople && !matchesPlaces) {
          return false;
        }
      }

      return true;
    });
  }, [timeline, selectedTimelineEra, timelineSearch]);

  // Map & Journeys State
  const [places, setPlaces] = useState<BiblicalPlace[]>([]);
  const [journeys, setJourneys] = useState<BiblicalJourney[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>("journey-jesus");
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const [tourSpeed, setTourSpeed] = useState<number>(1.0);
  const [journeyEraFilter, setJourneyEraFilter] = useState<string>("all");
  const [waypointVersesText, setWaypointVersesText] = useState<{ ref: string; text: string } | null>(null);
  const [loadingWaypointVerses, setLoadingWaypointVerses] = useState(false);
  const [isWaypointModalOpen, setIsWaypointModalOpen] = useState(false);
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

  // Open Character Dossier Modal (§7)
  const openCharacterDossier = async (slugOrName: string) => {
    setIsDossierOpen(true);
    setLoadingDossier(true);
    setDossierData(null);
    setDossierError(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsDossierSpeaking(false);
    }
    try {
      const res = await fetch(`${apiUrl}/api/rag/character-study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_or_slug: slugOrName })
      });
      if (res.ok) {
        const data = await res.json();
        setDossierData(data);
      } else {
        const err = await res.json();
        setDossierError(err.detail || "Không thể tải hồ sơ nhân vật.");
      }
    } catch (e) {
      setDossierError("Lỗi kết nối khi tải hồ sơ nhân vật.");
    } finally {
      setLoadingDossier(false);
    }
  };

  const toggleDossierSpeech = (textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isDossierSpeaking) {
      window.speechSynthesis.cancel();
      setIsDossierSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(textToSpeak);
      utt.lang = "vi-VN";
      utt.rate = 1.0;
      utt.onend = () => setIsDossierSpeaking(false);
      utt.onerror = () => setIsDossierSpeaking(false);
      window.speechSynthesis.speak(utt);
      setIsDossierSpeaking(true);
    }
  };

  const closeDossier = () => {
    setIsDossierOpen(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsDossierSpeaking(false);
    }
  };

  // Fetch Typology Connections (§18)
  const fetchConnections = async (typeFilter?: string, query?: string) => {
    setLoadingConnections(true);
    try {
      let url = `${apiUrl}/api/graph/connections?`;
      const curType = typeFilter !== undefined ? typeFilter : connectionTypeFilter;
      const curQuery = query !== undefined ? query : connectionSearch;
      if (curType && curType !== "all") url += `connection_type=${encodeURIComponent(curType)}&`;
      if (curQuery) url += `search=${encodeURIComponent(curQuery)}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setConnections(data);
        if (data.length > 0) {
          setSelectedConnection((prev) => {
            if (!prev) return data[0];
            const found = data.find((d: CrossBibleConnection) => d.id === prev.id);
            return found || data[0];
          });
        }
      }
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Fetch Gospel Harmony & Cross-Passage Parallels (§8, §18)
  const fetchHarmonyEvents = async (cat?: string, search?: string) => {
    setLoadingHarmonyList(true);
    try {
      let url = `${apiUrl}/api/bible/harmony-events?`;
      const curCat = cat !== undefined ? cat : selectedHarmonyCat;
      const curSearch = search !== undefined ? search : harmonySearch;
      if (curCat && curCat !== "Tất cả") url += `category=${encodeURIComponent(curCat)}&`;
      if (curSearch) url += `search=${encodeURIComponent(curSearch)}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const evs = data.events || [];
        setHarmonyEvents(evs);
        if (data.categories) setHarmonyCategories(data.categories);
        if (evs.length > 0 && !selectedHarmonyEvent) {
          loadHarmonyDetail(evs[0].id);
        }
      }
    } catch (e) {
      console.error("Error fetching harmony events:", e);
    } finally {
      setLoadingHarmonyList(false);
    }
  };

  const loadHarmonyDetail = async (eventId: string) => {
    setLoadingHarmonyDetail(true);
    try {
      const res = await fetch(`${apiUrl}/api/bible/harmony-detail?event_id=${encodeURIComponent(eventId)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedHarmonyEvent(data);
      }
    } catch (e) {
      console.error("Error loading harmony detail:", e);
    } finally {
      setLoadingHarmonyDetail(false);
    }
  };

  const speakPassageText = (passageKey: string, textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingPassage === passageKey) {
      window.speechSynthesis.cancel();
      setSpeakingPassage(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "vi-VN";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingPassage(null);
    utterance.onerror = () => setSpeakingPassage(null);
    setSpeakingPassage(passageKey);
    window.speechSynthesis.speak(utterance);
  };

  const getHarmonyBookStyle = (bookCode: string) => {
    switch (bookCode.toLowerCase()) {
      case "mat":
        return { label: "Ma-thi-ơ", badge: "MT", bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-300", accent: "Vua Đấng Mê-si & Luật Pháp" };
      case "mac":
        return { label: "Mác", badge: "MK", bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300", accent: "Đầy Tớ Đau Thương & Hành Động" };
      case "lu":
        return { label: "Lu-ca", badge: "LK", bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-300", accent: "Con Người Nhân Từ & Cứu Chuộc" };
      case "gi":
        return { label: "Giăng", badge: "JN", bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-300", accent: "Con Đức Chúa Trời & Thần Tính" };
      case "2sa":
        return { label: "II Sa-mu-ên", badge: "2SA", bg: "bg-sky-500/20", border: "border-sky-500/40", text: "text-sky-300", accent: "Lịch Sử & Tiên Tri Cựu Ước" };
      case "1su":
        return { label: "I Sử-ký", badge: "1SU", bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-300", accent: "Góc Nhìn Thuộc Linh & Đền Thờ" };
      case "1vua":
        return { label: "I Các Vua", badge: "1VUA", bg: "bg-sky-500/20", border: "border-sky-500/40", text: "text-sky-300", accent: "Vương Triều Sa-lô-môn" };
      case "2su":
        return { label: "II Sử-ký", badge: "2SU", bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-300", accent: "Phục Hưng Thờ Phượng" };
      case "cong":
        return { label: "Công-vụ", badge: "CV", bg: "bg-teal-500/20", border: "border-teal-500/40", text: "text-teal-300", accent: "Thánh Linh & Hội Thánh Đầu Tiên" };
      default:
        return { label: bookCode.toUpperCase(), badge: bookCode.toUpperCase(), bg: "bg-slate-500/20", border: "border-slate-500/40", text: "text-slate-300", accent: "Tài Liệu Song Hành" };
    }
  };

  useEffect(() => {
    fetchGraph();
    fetchTimeline();
    fetchMapData();
    fetchConnections();
    fetchHarmonyEvents();
  }, [apiUrl]);

  useEffect(() => {
    if (activeTab === "typology" && connections.length === 0) {
      fetchConnections();
    }
    if (activeTab === "harmony" && harmonyEvents.length === 0) {
      fetchHarmonyEvents();
    }
  }, [activeTab]);

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

    const intervalMs = Math.round(6500 / tourSpeed);
    tourTimerRef.current = setInterval(() => {
      currentIndex++;
      if (!currentJourney || currentIndex >= currentJourney.waypoints.length) {
        stopTour();
      } else {
        const nextWp = currentJourney.waypoints[currentIndex];
        setActiveWaypoint(nextWp);
        speakWaypoint(nextWp);
      }
    }, intervalMs);
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

  // Open Scripture Modal for Waypoint
  const openWaypointScripture = async (scriptureRef: string) => {
    setIsWaypointModalOpen(true);
    setLoadingWaypointVerses(true);
    setWaypointVersesText(null);
    try {
      const res = await fetch(`${apiUrl}/api/bible/verse-range?reference=${encodeURIComponent(scriptureRef)}`);
      if (res.ok) {
        const data = await res.json();
        const fullText = (data.verses || []).map((v: any) => `${v.verse}. ${v.text}`).join("\n\n");
        setWaypointVersesText({ ref: data.reference, text: fullText || "Không tìm thấy văn bản câu gốc." });
      } else {
        setWaypointVersesText({ ref: scriptureRef, text: `Phân đoạn Kinh Thánh: ${scriptureRef}` });
      }
    } catch (e) {
      setWaypointVersesText({ ref: scriptureRef, text: "Lỗi kết nối khi tải văn bản Kinh Thánh." });
    } finally {
      setLoadingWaypointVerses(false);
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

  // Typology connection styling helper (§18)
  const getConnectionTypeInfo = (type: string) => {
    switch (type) {
      case "explicit":
        return { label: "Trích dẫn minh định", bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40" };
      case "quotation":
        return { label: "Dẫn chiếu Tân Ước", bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/40" };
      case "allusion":
        return { label: "Ám chỉ / Hình tượng", bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40" };
      case "parallel":
        return { label: "Tương đồng kết cấu", bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/40" };
      case "scholarly_interpretation":
        return { label: "Giải nghĩa học giả", bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40" };
      case "AI_suggested":
        return { label: "Gợi ý phân tích AI", bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/40" };
      default:
        return { label: "Mối liên hệ", bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/40" };
    }
  };

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
          <button
            onClick={() => setActiveTab("typology")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "typology"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Hình Bóng & Tiên Tri (§18)
          </button>
          <button
            onClick={() => {
              setActiveTab("harmony");
              if (harmonyEvents.length === 0) fetchHarmonyEvents();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "harmony"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Columns className="w-4 h-4 text-purple-300" /> Hòa Hợp Phúc Âm & Song Hành (§8, §18)
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

                    {selectedEntityDetail.type === "person" && (
                      <button
                        type="button"
                        onClick={() => openCharacterDossier(selectedEntityDetail.slug)}
                        className="mt-1 p-3 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-purple-950/40"
                      >
                        <Sparkles className="w-4 h-4 text-purple-300" />
                        <span>Hồ Sơ Nhân Vật &amp; Chân Dung Thần Học →</span>
                      </button>
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
          {/* Header & Description */}
          <div className="text-center flex flex-col gap-2">
            <div className="inline-flex items-center justify-center gap-2 self-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Dòng Chảy Lịch Sử Cứu Chuộc • 22 Mốc Biến Cố Trọng Đại (§6, §44)</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Dòng Thời Gian Lịch Sử Kinh Thánh (Biblical Timeline)</h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Trình tự niên biểu các biến cố cứu rỗi từ thuở Sáng tạo, thời kỳ Tổ phụ, Vương triều, Lưu đày đến Đấng Christ và Trời Mới Đất Mới
            </p>
          </div>

          {/* Era Filter Bar & Search */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  placeholder="Tìm biến cố, nhân vật, địa danh, câu gốc..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                {timelineSearch && (
                  <button
                    onClick={() => setTimelineSearch("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Hiển thị <span className="font-bold text-white">{filteredTimeline.length}</span> / {timeline.length} biến cố
              </div>
            </div>

            {/* Era Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", label: `Tất Cả (${timeline.length})` },
                { id: "primeval_patriarch", label: "Sáng Tạo & Tổ Phụ" },
                { id: "exodus_conquest", label: "Xuất Hành & Quan Xét" },
                { id: "monarchy", label: "Vương Triều & Tiên Tri" },
                { id: "exile_restoration", label: "Lưu Đày & Hồi Hương" },
                { id: "christ", label: "Chúa Giê-xu Giáng Thế" },
                { id: "church", label: "Hội Thánh & Khải Huyền" }
              ].map((era) => (
                <button
                  key={era.id}
                  onClick={() => setSelectedTimelineEra(era.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs font-medium ${
                    selectedTimelineEra === era.id
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                      : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40"
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>
          </div>

          {loadingTimeline ? (
            <div className="p-16 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-xs">Đang tải dòng thời gian...</p>
            </div>
          ) : filteredTimeline.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel text-center text-slate-400 text-xs">
              Không tìm thấy biến cố phù hợp với từ khóa &ldquo;{timelineSearch}&rdquo;.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 md:ml-36 flex flex-col gap-8 py-4">
              {filteredTimeline.map((ev) => (
                <div key={ev.id} className="relative pl-6 md:pl-8 group">
                  {/* Timeline Node Point */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 group-hover:border-amber-400 group-hover:scale-125 transition-all"></div>
                  
                  {/* Date Label on Left Side */}
                  <div className="md:absolute md:-left-40 md:top-1 flex flex-col md:items-end">
                    <span className="text-xs font-mono font-bold text-amber-400 whitespace-nowrap">
                      {ev.approximate_date}
                    </span>
                    {ev.date_type && (
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-sans">
                        {ev.date_type === "exact" ? "Chính xác" : ev.date_type === "range" ? "Thời kỳ" : ev.date_type === "disputed" ? "Tranh luận" : "Ước tính"}
                      </span>
                    )}
                  </div>

                  {/* Card Container */}
                  <div 
                    onClick={() => setSelectedTimelineEvent(ev)}
                    className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/60 transition-all flex flex-col gap-3 cursor-pointer group shadow-sm hover:shadow-lg hover:shadow-blue-950/30"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {ev.period}
                      </span>
                      {ev.scripture && (
                        <Link 
                          href={`/bible?ref=${encodeURIComponent(ev.scripture)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 hover:underline"
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

                    {/* Metadata Tags: People & Places */}
                    {((ev.people && ev.people.length > 0) || (ev.places && ev.places.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {ev.people?.map((p, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            <span>{p}</span>
                          </span>
                        ))}
                        {ev.places?.map((pl, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{pl}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-blue-400/80 font-medium pt-1 flex items-center justify-between border-t border-slate-800/60 mt-1">
                      <span>Xem ý nghĩa cứu chuộc &amp; khảo cứu sâu →</span>
                      <span className="text-[10px] text-slate-500">#{ev.era_order}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Event Detail Modal */}
          {selectedTimelineEvent && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
              onClick={() => setSelectedTimelineEvent(null)}
            >
              <div 
                className="max-w-xl w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start pb-2 border-b border-slate-800">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {selectedTimelineEvent.period}
                      </span>
                      <span className="text-xs font-mono font-semibold text-amber-400">
                        {selectedTimelineEvent.approximate_date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedTimelineEvent.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedTimelineEvent(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="text-xs text-slate-300 leading-relaxed font-serif">
                    {selectedTimelineEvent.description}
                  </div>

                  {/* Theological Significance Block */}
                  {selectedTimelineEvent.theological_significance && (
                    <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Ý Nghĩa Thần Học &amp; Mặc Khải Cứu Chuộc:
                      </span>
                      <p className="text-xs text-amber-100/90 leading-relaxed font-serif">
                        {selectedTimelineEvent.theological_significance}
                      </p>
                    </div>
                  )}

                  {/* Key People */}
                  {selectedTimelineEvent.people && selectedTimelineEvent.people.length > 0 && (
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Nhân vật then chốt:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTimelineEvent.people.map((p, idx) => (
                          <Link
                            key={idx}
                            href={`/explore?tab=graph&search=${encodeURIComponent(p)}`}
                            onClick={() => setSelectedTimelineEvent(null)}
                            className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>{p}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-purple-400" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Places */}
                  {selectedTimelineEvent.places && selectedTimelineEvent.places.length > 0 && (
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Địa danh &amp; Bối cảnh:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTimelineEvent.places.map((pl, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium"
                          >
                            {pl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scripture Link Button */}
                  {selectedTimelineEvent.scripture && (
                    <Link
                      href={`/bible?ref=${encodeURIComponent(selectedTimelineEvent.scripture)}`}
                      className="mt-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Đọc Phân Đoạn Kinh Thánh ({selectedTimelineEvent.scripture}) →</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. BIBLE MAP & SPATIAL JOURNEYS (NEW PHASE 6) */}
      {/* ===================================================================== */}
      {activeTab === "map" && (
        <div className="flex flex-col gap-6">
          {/* Era Filter & Journeys Selector Bar */}
          <div className="flex flex-col gap-3">
            {/* Era Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 whitespace-nowrap font-medium">Thời kỳ lịch sử:</span>
              {[
                { id: "all", label: "Tất Cả (9 hành trình)" },
                { id: "ot_patriarch", label: "Tổ Phụ & Xuất Hành" },
                { id: "ot_monarchy", label: "Vương Triều & Tiên Tri" },
                { id: "nt_apostolic", label: "Chúa Giê-xu & Sứ Đồ" }
              ].map((era) => (
                <button
                  key={era.id}
                  onClick={() => setJourneyEraFilter(era.id)}
                  className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                    journeyEraFilter === era.id
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>

            {/* Journeys List & Tour Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {journeys
                  .filter((j) => {
                    if (journeyEraFilter === "all") return true;
                    if (journeyEraFilter === "ot_patriarch") return j.id === "journey-abraham" || j.id === "journey-exodus";
                    if (journeyEraFilter === "ot_monarchy") return j.id === "journey-david-fugitive" || j.id === "journey-elijah";
                    if (journeyEraFilter === "nt_apostolic") return j.id.startsWith("journey-jesus") || j.id.startsWith("journey-paul");
                    return true;
                  })
                  .map((j) => (
                    <button
                      key={j.id}
                      onClick={() => handleSelectJourney(j.id)}
                      className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        selectedJourneyId === j.id
                          ? "bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/30"
                          : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/40"
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{j.title}</span>
                    </button>
                  ))}
              </div>

              {/* Guided Tour Play/Pause & Speed Controller */}
              {currentJourney && (
                <div className="flex items-center gap-2 shrink-0">
                  {/* Speed Controller */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                    {[1.0, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setTourSpeed(spd)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                          tourSpeed === spd
                            ? "bg-rose-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

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
                </div>
              )}
            </div>
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
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openWaypointScripture(activeWaypoint.scripture)}
                            className="px-2 py-0.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-[11px] flex items-center gap-1 transition-colors"
                            title="Đọc trực tiếp phân đoạn Kinh Thánh trạm dừng này"
                          >
                            <BookOpen className="w-3 h-3 text-amber-400" />
                            <span>Đọc Phân Đoạn</span>
                          </button>
                          <Link
                            href={`/bible?ref=${encodeURIComponent(activeWaypoint.scripture)}`}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                            title="Mở trong Bible Reader đầy đủ"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{activeWaypoint.scripture}</span>
                          </Link>
                        </div>
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
                  <div className="text-[11px] pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-blue-400/80 font-medium group-hover:text-blue-300 transition-colors">
                      Mạng lưới đồ thị →
                    </span>
                    {n.node_type === "person" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCharacterDossier(n.node_key);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-[10px] font-semibold flex items-center gap-1 transition-all shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-purple-300" />
                        <span>Hồ sơ chi tiết</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. CROSS-BIBLE CONNECTIONS & TYPOLOGY EXPLORER (§18) */}
      {/* ===================================================================== */}
      {activeTab === "typology" && (
        <div className="flex flex-col gap-6">
          {/* Header & Notice */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Thần Học Hình Bóng & Mặc Khải Cứu Chuộc • §18
                </span>
                <span className="text-xs text-slate-400">8 Mối liên kết quy chiếu chuẩn mực</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Mối Liên Hệ Xuyên Suốt & Hình Bóng Tiên Tri (Typology & Prophecy)
              </h2>
              <p className="text-xs text-slate-400">
                Khảo cứu những khuôn mẫu Cựu Ước (Type) ứng nghiệm trọn vẹn trong Đấng Christ & Tân Ước (Antitype)
              </p>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={connectionSearch}
                  onChange={(e) => {
                    setConnectionSearch(e.target.value);
                    fetchConnections(connectionTypeFilter, e.target.value);
                  }}
                  placeholder="Tìm chủ đề, câu gốc, từ khóa..."
                  className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64"
                />
              </div>
            </div>
          </div>

          {/* Section 18 Canonical Disclaimer Alert */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-amber-300">Nguyên tắc Thần học & Kiểm chứng §18</span>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Hệ thống phân định rạch ròi giữa <strong>trích dẫn Kinh Thánh minh định</strong> (Canonical Scripture citations) và các giả thuyết học giả hoặc gợi ý phân tích AI. Các liên kết được đánh dấu mức độ xác thực và nguồn tra cứu tương ứng để bảo toàn sự trung thực đối với Lời Chúa.
              </p>
            </div>
          </div>

          {/* Connection Type Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 whitespace-nowrap">Phân loại liên kết:</span>
            {[
              { id: "all", label: "Tất cả kiểu" },
              { id: "explicit", label: "Trích dẫn minh định" },
              { id: "quotation", label: "Dẫn chiếu Tân Ước" },
              { id: "allusion", label: "Ám chỉ / Hình tượng" },
              { id: "parallel", label: "Tương đồng kết cấu" },
              { id: "scholarly_interpretation", label: "Giải nghĩa học giả" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setConnectionTypeFilter(f.id);
                  fetchConnections(f.id, connectionSearch);
                }}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs font-semibold ${
                  connectionTypeFilter === f.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                    : "bg-slate-800/70 text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Main Grid: Left List + Right Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Connections List (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {loadingConnections ? (
                <div className="p-12 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <p className="text-xs">Đang tải danh mục hình bóng tiên tri...</p>
                </div>
              ) : connections.length === 0 ? (
                <div className="p-8 rounded-2xl glass-panel border border-slate-800 text-center text-xs text-slate-400">
                  Không tìm thấy mối liên kết nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                connections.map((c) => {
                  const typeInfo = getConnectionTypeInfo(c.connection_type);
                  const isSelected = selectedConnection?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConnection(c)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2.5 relative group ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
                          : "glass-card border-slate-800 hover:border-slate-700 bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}>
                          {typeInfo.label}
                        </span>
                        <span className="text-[10px] text-amber-400/90 font-mono font-bold">
                          Độ chuẩn xác: {Math.round(c.confidence_score * 100)}%
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                        {c.title}
                      </h3>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {c.theological_synthesis}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="text-amber-300/90 truncate max-w-[45%] font-medium">
                          📜 {c.ot_anchor_ref}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-emerald-300/90 truncate max-w-[45%] font-medium text-right">
                          ✨ {c.nt_fulfillment_ref}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Deep Typological Inspector (7 cols) */}
            <div className="lg:col-span-7">
              {selectedConnection ? (
                <div className="rounded-3xl glass-panel border border-slate-700 p-6 flex flex-col gap-6 shadow-xl">
                  {/* Top Card Header */}
                  <div className="flex flex-col gap-2 pb-5 border-b border-slate-800">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const t = getConnectionTypeInfo(selectedConnection.connection_type);
                          return (
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${t.bg} ${t.text} ${t.border}`}>
                              {t.label}
                            </span>
                          );
                        })()}
                        <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                          {selectedConnection.typology_theme}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-800/50">
                        Độ xác thực: {Math.round(selectedConnection.confidence_score * 100)}%
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                      {selectedConnection.title}
                    </h2>
                    {selectedConnection.scholarly_source && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Nguồn đối chiếu học thuật: <strong className="text-slate-300">{selectedConnection.scholarly_source}</strong></span>
                      </p>
                    )}
                  </div>

                  {/* Dual Anchor Comparison (Cựu Ước & Tân Ước) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Old Testament Anchor */}
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            📜 Cựu Ước Làm Hình Bóng (Type)
                          </span>
                          <Link
                            href={`/bible?ref=${encodeURIComponent(selectedConnection.ot_anchor_ref.split(';')[0])}`}
                            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                            target="_blank"
                          >
                            Đọc câu gốc <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                        <span className="text-xs font-bold text-amber-200">
                          {selectedConnection.ot_anchor_ref}
                        </span>
                        <blockquote className="text-xs text-slate-300 italic border-l-2 border-amber-500/60 pl-2.5 my-1 leading-relaxed">
                          "{selectedConnection.ot_anchor_text}"
                        </blockquote>
                      </div>
                    </div>

                    {/* New Testament Fulfillment */}
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            ✨ Tân Ước Ứng Nghiệm (Antitype)
                          </span>
                          <Link
                            href={`/bible?ref=${encodeURIComponent(selectedConnection.nt_fulfillment_ref.split(';')[0])}`}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                            target="_blank"
                          >
                            Đọc câu gốc <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                        <span className="text-xs font-bold text-emerald-200">
                          {selectedConnection.nt_fulfillment_ref}
                        </span>
                        <blockquote className="text-xs text-slate-300 italic border-l-2 border-emerald-500/60 pl-2.5 my-1 leading-relaxed">
                          "{selectedConnection.nt_fulfillment_text}"
                        </blockquote>
                      </div>
                    </div>
                  </div>

                  {/* Revelation Chain (Tiến trình Mặc khải Cứu chuộc) */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                      Tiến Trình Mặc Khải Tiệm Tiến Xuyên Suốt Lịch Sử (Chain of Revelation)
                    </h3>
                    <div className="flex flex-col gap-2 mt-1">
                      {selectedConnection.revelation_chain.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-sans leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Theological Synthesis */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Tổng Hợp Thần Học & Trọng Tâm Cơ Đốc (Christocentric Synthesis)
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {selectedConnection.theological_synthesis}
                    </p>
                  </div>

                  {/* Deep Navigation Links */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                      href="/bible"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Tra Xem Toàn Bộ Kinh Thánh
                    </Link>
                    <Link
                      href="/study"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-600/20"
                    >
                      <Layers className="w-3.5 h-3.5" /> Phân Tích & Chú Giải Ngữ Cảnh
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-16 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <BookOpen className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">Chọn một cặp liên kết bên trái để mở rộng phân tích chi tiết.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. GOSPEL HARMONY & CROSS-PASSAGE PARALLELS (§8, §18) */}
      {/* ===================================================================== */}
      {activeTab === "harmony" && (
        <div className="flex flex-col gap-6">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900/60 border border-purple-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Columns className="w-3 h-3" /> Nghiên Cứu Đối Chiếu Đa Chiều (§8, §18)
                </span>
                <span className="text-xs text-slate-400 font-mono">16+ Biến Cố Song Hành</span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-purple-400" />
                Hòa Hợp Phúc Âm & Các Bản Song Hành Lịch Sử
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Đối chiếu văn bản Kinh Thánh nguyên ngữ và tiếng Việt 1925 song song giữa 4 sách Phúc Âm (Ma-thi-ơ, Mác, Lu-ca, Giăng) cùng các cặp ký thuật song hành Cựu Ước (Các Vua vs Sử Ký) với phân tích sắc thái thần học riêng biệt.
              </p>
            </div>
            
            <Link
              href="/research?tab=agent"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-purple-200" /> AI Nghiên Cứu Chuyên Sâu
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-slate-400 whitespace-nowrap">Chủ đề:</span>
              {(harmonyCategories.length > 0 ? harmonyCategories : ["Tất cả", "Khởi Đầu Chức Vụ", "Phép Lạ Quyền Năng", "Dụ Ngôn Nước Trời", "Tuần Lễ Khổ Nạn", "Phục Sinh & Thăng Thiên", "Song Hành Cựu Ước"]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedHarmonyCat(cat);
                    fetchHarmonyEvents(cat, harmonySearch);
                  }}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedHarmonyCat === cat
                      ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30"
                      : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm sự kiện, địa danh, câu gốc..."
                value={harmonySearch}
                onChange={(e) => {
                  setHarmonySearch(e.target.value);
                  fetchHarmonyEvents(selectedHarmonyCat, e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:border-purple-500"
              />
              {harmonySearch && (
                <button
                  onClick={() => {
                    setHarmonySearch("");
                    fetchHarmonyEvents(selectedHarmonyCat, "");
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Events Navigation List (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-2.5 max-h-[820px] overflow-y-auto pr-1">
              {loadingHarmonyList && harmonyEvents.length === 0 ? (
                <div className="p-8 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-xs">Đang tải danh mục song hành...</span>
                </div>
              ) : harmonyEvents.length === 0 ? (
                <div className="p-8 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400 text-center">
                  <Info className="w-6 h-6 text-slate-500" />
                  <p className="text-xs">Không tìm thấy sự kiện nào khớp với từ khóa tìm kiếm.</p>
                </div>
              ) : (
                harmonyEvents.map((ev) => {
                  const isSelected = selectedHarmonyEvent?.id === ev.id;
                  const passageKeys = Object.keys(ev.passages || {});
                  return (
                    <button
                      key={ev.id}
                      onClick={() => loadHarmonyDetail(ev.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        isSelected
                          ? "bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-900/20"
                          : "bg-slate-900/50 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {ev.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {ev.period_date}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <h3 className={`text-xs font-bold leading-snug ${isSelected ? "text-purple-200" : "text-slate-200"}`}>
                          {ev.title_vi}
                        </h3>
                        <p className="text-[10px] text-slate-400 italic">
                          {ev.title_en}
                        </p>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {ev.summary}
                      </p>

                      {/* Book Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60">
                        {passageKeys.map((k) => {
                          const pInfo = ev.passages[k];
                          const style = getHarmonyBookStyle(pInfo.book_code);
                          return (
                            <span
                              key={k}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                              title={`${pInfo.book_name} (${pInfo.ref})`}
                            >
                              {style.badge}
                            </span>
                          );
                        })}
                        <span className="text-[10px] text-slate-500 ml-auto font-sans">
                          {ev.location}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Column: Comparative Side-by-Side Synoptic Stage (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {loadingHarmonyDetail ? (
                <div className="p-16 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  <p className="text-xs">Đang tải đối chiếu câu Kinh Thánh song hành...</p>
                </div>
              ) : selectedHarmonyEvent ? (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  {/* Event Detail Header */}
                  <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col gap-3 shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                          {selectedHarmonyEvent.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {selectedHarmonyEvent.period_date}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {selectedHarmonyEvent.location}
                        </span>
                      </div>

                      <Link
                        href={`/research?q=${encodeURIComponent(`Phân tích đối chiếu Phúc Âm sự kiện: ${selectedHarmonyEvent.title_vi}`)}`}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Hỏi AI Về Sự Kiện Này
                      </Link>
                    </div>

                    <h2 className="text-lg font-bold text-white leading-tight">
                      {selectedHarmonyEvent.title_vi}
                    </h2>
                    <p className="text-xs text-slate-400 italic">
                      {selectedHarmonyEvent.title_en}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
                      {selectedHarmonyEvent.summary}
                    </p>
                  </div>

                  {/* Synchronized Side-by-Side Columns */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                        <Columns className="w-4 h-4 text-purple-400" /> Đối Chiếu Văn Bản Song Hành (Parallel Columns)
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {Object.keys(selectedHarmonyEvent.passages || {}).length} nguồn chứng ngôn
                      </span>
                    </div>

                    <div className={`grid grid-cols-1 ${
                      Object.keys(selectedHarmonyEvent.passages || {}).length >= 4
                        ? "md:grid-cols-2 xl:grid-cols-4"
                        : Object.keys(selectedHarmonyEvent.passages || {}).length === 3
                        ? "md:grid-cols-3"
                        : "md:grid-cols-2"
                    } gap-4`}>
                      {Object.entries(selectedHarmonyEvent.passages || {}).map(([key, passage]) => {
                        const style = getHarmonyBookStyle(passage.book_code);
                        const isSpeakingThis = speakingPassage === key;
                        const allPassageText = (passage.verses || []).map(v => `${v.verse}. ${v.text_vi}`).join(" ");

                        return (
                          <div
                            key={key}
                            className={`rounded-2xl border flex flex-col justify-between overflow-hidden bg-slate-900/70 border-slate-800 transition-all hover:border-slate-700 shadow-lg`}
                          >
                            {/* Column Header */}
                            <div className={`p-4 border-b ${style.border} bg-slate-950/80 flex flex-col gap-2`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`w-6 h-6 rounded-lg ${style.bg} ${style.text} ${style.border} border text-[11px] font-bold flex items-center justify-center`}>
                                    {style.badge}
                                  </span>
                                  <span className="text-xs font-bold text-white">
                                    {passage.book_name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => speakPassageText(key, allPassageText)}
                                    title="Nghe đọc đoạn văn bản này bằng TTS"
                                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                      isSpeakingThis
                                        ? "bg-purple-600 text-white border-purple-500 animate-pulse"
                                        : "bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700"
                                    }`}
                                  >
                                    {isSpeakingThis ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                  </button>
                                  <Link
                                    href={`/bible?book=${passage.book_code}&chapter=${passage.chapter}`}
                                    target="_blank"
                                    title="Mở toàn bộ chương trong Bible Reader"
                                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className={`font-semibold ${style.text}`}>
                                  {passage.ref}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                  {passage.total_verses || (passage.verses?.length || 0)} câu
                                </span>
                              </div>

                              {/* Author Focus */}
                              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[10px] text-slate-300 leading-snug">
                                <span className="text-purple-300 font-semibold block mb-0.5">Sắc thái thần học:</span>
                                {passage.theological_focus}
                              </div>
                            </div>

                            {/* Verses Text Body */}
                            <div className="p-4 flex flex-col gap-3 max-h-[460px] overflow-y-auto">
                              {(passage.verses || []).map((v) => (
                                <div key={v.verse} className="flex flex-col gap-1 text-xs">
                                  {v.section_title && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400/90 mt-1">
                                      {v.section_title}
                                    </span>
                                  )}
                                  <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-700 mt-0.5">
                                      {v.verse}
                                    </span>
                                    <p className="text-slate-200 leading-relaxed font-sans">
                                      {v.text_vi}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scholarly Harmony Synthesis Card */}
                  {selectedHarmonyEvent.synoptic_distinctives && (
                    <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col gap-5 shadow-xl">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Tổng Hợp Học Thuật & Ý Nghĩa Thần Học Hiệp Nhất (Synoptic Synthesis)
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Consensus */}
                        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col gap-2.5">
                          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Điểm Đồng Thuận Cốt Lõi (Shared Elements)
                          </h4>
                          <ul className="flex flex-col gap-2 mt-1">
                            {selectedHarmonyEvent.synoptic_distinctives.shared_elements?.map((item, idx) => (
                              <li key={idx} className="text-xs text-slate-200 leading-relaxed flex items-start gap-2">
                                <span className="text-emerald-400 font-bold shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Unique Variations */}
                        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 flex flex-col gap-2.5">
                          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5 text-indigo-400" /> Sắc Thái Riêng Biệt Từng Tác Giả (Unique Details)
                          </h4>
                          <div className="flex flex-col gap-2 mt-1">
                            {Object.entries(selectedHarmonyEvent.synoptic_distinctives.unique_details || {}).map(([bKey, note]) => {
                              const style = getHarmonyBookStyle(bKey);
                              return (
                                <div key={bKey} className="text-xs text-slate-200 leading-relaxed flex items-start gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${style.bg} ${style.text} ${style.border}`}>
                                    {style.badge}
                                  </span>
                                  <span>{note}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Theological Significance & Key Themes */}
                      <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-800/40 flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Ý Nghĩa Thần Học Hiệp Nhất (Theological Significance)
                          </h4>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">
                            {selectedHarmonyEvent.synoptic_distinctives.theological_significance}
                          </p>
                        </div>

                        {/* Key Themes Pills */}
                        {selectedHarmonyEvent.synoptic_distinctives.key_themes && (
                          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-purple-800/30">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Chủ đề then chốt:</span>
                            {selectedHarmonyEvent.synoptic_distinctives.key_themes.map((theme, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 text-[10px] font-medium"
                              >
                                #{theme}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Navigation Actions */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                          href="/bible"
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Tra Xem Toàn Bộ Kinh Thánh
                        </Link>
                        <Link
                          href={`/study?event=${encodeURIComponent(selectedHarmonyEvent.id)}`}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-600/20"
                        >
                          <Layers className="w-3.5 h-3.5" /> Mở Trong Study Projects Workspace
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-16 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Columns className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">Chọn một sự kiện song hành bên trái để mở rộng đối chiếu chi tiết.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. BIBLICAL CHARACTER DOSSIER MODAL (§7) */}
      {/* ===================================================================== */}
      {isDossierOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#0b101d] border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-600/30 shrink-0">
                  {dossierData ? dossierData.name_vi.charAt(0) : "👤"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Hồ Sơ Nhân Vật • Kinh Thánh
                    </span>
                    {dossierData?.original_name && (
                      <span className="text-xs text-slate-400 font-serif italic">
                        ({dossierData.original_name})
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {dossierData?.name_vi || "Đang tải hồ sơ..."}
                  </h2>
                  {dossierData?.name_en && (
                    <p className="text-xs text-slate-400 font-medium">
                      {dossierData.name_en} • <span className="text-indigo-300">{dossierData.title_or_role}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {dossierData?.ai_theological_portrait && (
                  <button
                    type="button"
                    onClick={() => toggleDossierSpeech(dossierData.ai_theological_portrait)}
                    className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                      isDossierSpeaking
                        ? "bg-rose-600/30 text-rose-300 border-rose-500/50 animate-pulse"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                    }`}
                    title={isDossierSpeaking ? "Dừng đọc" : "Đọc thành tiếng chân dung nhân vật"}
                  >
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span className="hidden sm:inline">{isDossierSpeaking ? "Đang đọc" : "Nghe"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeDossier}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-300">
              {loadingDossier ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm font-semibold text-white">Đang tải chân dung thần học &amp; dữ kiện nhân vật...</p>
                  <p className="text-xs text-slate-500">Khai phá sự kiện, phân đoạn Kinh Thánh và mạng lưới quan hệ.</p>
                </div>
              ) : dossierError ? (
                <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/50 text-red-200">
                  {dossierError}
                </div>
              ) : dossierData ? (
                <>
                  {/* Timeline Period Banner */}
                  <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-slate-200">Thời kỳ lịch sử:</span>
                      <span className="text-indigo-300">{dossierData.timeline_period}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/explore?tab=graph&search=${encodeURIComponent(dossierData.name_vi)}`}
                        onClick={closeDossier}
                        className="px-3 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Network className="w-3.5 h-3.5" /> Xem Graph Thực Thể
                      </Link>
                    </div>
                  </div>

                  {/* AI Theological Portrait */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 shadow-lg">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" /> Chân Dung Thần Học &amp; Hành Trình Đức Tin
                    </h3>
                    <p className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                      {dossierData.ai_theological_portrait}
                    </p>
                  </div>

                  {/* Grid 1: Key Verses & Relationships */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Scripture Verses */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Các Phân Đoạn Kinh Thánh Cốt Lõi
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {dossierData.key_verses?.map((ref, idx) => (
                          <Link
                            key={idx}
                            href={`/bible?ref=${encodeURIComponent(ref)}`}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-blue-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-all"
                          >
                            ⚓ {ref} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Relationships */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Mối Quan Hệ &amp; Nhân Vật Liên Hệ
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        {dossierData.relationships && dossierData.relationships.length > 0 ? (
                          dossierData.relationships.map((rel, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                              <span className="font-semibold text-white">{rel.target_name}</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                                {rel.relation}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 text-xs italic">Chưa có liên kết quan hệ cụ thể.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Milestone Events */}
                  {dossierData.milestone_events && dossierData.milestone_events.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Các Cột Mốc Sự Kiện Lịch Sử
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {dossierData.milestone_events.map((ev, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{ev.title}</span>
                              <span className="text-[10px] text-purple-300 font-mono">{ev.period}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{ev.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spiritual Lessons & Reflection Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                      <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 3 Bài Học Thuộc Linh Cho Đời Sống
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {dossierData.spiritual_lessons?.map((les, idx) => (
                          <li key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-2">
                            <span className="text-teal-400 font-bold shrink-0">•</span>
                            <span>{les}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-400" /> Câu Hỏi Tự Vấn Suy Ngẫm
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {dossierData.reflection_questions?.map((q, idx) => (
                          <li key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-amber-500/30">
                              {idx + 1}
                            </span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Waypoint Scripture Preview Modal (§9) */}
      {isWaypointModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {waypointVersesText?.ref || "Văn Bản Kinh Thánh"}
                </h3>
              </div>
              <button
                onClick={() => setIsWaypointModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingWaypointVerses ? (
              <div className="p-10 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span>Đang tải nguyên văn câu Kinh Thánh...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed font-serif whitespace-pre-line max-h-96 overflow-y-auto">
                  {waypointVersesText?.text}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="italic">Bản dịch truyền thống 1925</span>
                  <Link
                    href={`/bible?ref=${encodeURIComponent(waypointVersesText?.ref || "")}`}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>Mở Trong Trình Đọc Toàn Diện</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
