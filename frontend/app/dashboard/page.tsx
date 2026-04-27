"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "text" | "url" | "image";

interface BackendResult {
  verdict: string;
  confidence: string;
  raw_score: number;
  extracted_text: string;
}

interface AnalysisResult {
  articleText: string;
  analysisId: string;
  result: BackendResult;
}

interface HistoryItem {
  id: number;
  content: string;
  verdict: string;
  confidence: number;
  input_type: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_ARTICLE =
  `Breaking: Scientists Confirm That Drinking Coffee Reverses Aging by 15 Years

A groundbreaking study published yesterday by the Global Institute of Nutritional Sciences has definitively proven that consuming three cups of coffee daily can reverse the biological aging process by up to fifteen years. The research, conducted over just two weeks with 12 participants, has been hailed as "the most important discovery in human history" by lead researcher Dr. James Holloway.

Experts universally agree that this miracle cure will render all other anti-aging treatments obsolete. Government health agencies are expected to mandate coffee consumption in schools as early as next month. Those who refuse to adopt this lifestyle change are reportedly putting their families at serious risk.`;

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-2 px-5 py-4 rounded-sm"
      style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a", animation: "fadeUp 0.25s ease both" }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "#C35200", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <span className="text-xs font-medium ml-1" style={{ color: "#9ca3af" }}>Analyzing…</span>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ data }: { data: AnalysisResult }) {
  const { result, articleText, analysisId } = data;
  const isFake = result.verdict.toUpperCase().includes("FAKE");
  const accentColor = isFake ? "#C35200" : "#4ade80";
  const confidencePct = parseFloat(result.confidence.replace("%", ""));

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a", animation: "fadeUp 0.4s ease both" }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "#3a3a3a", backgroundColor: "#252525" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#d1d5db" }}>
              Verdict
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {isFake ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              <p className="text-lg font-bold tracking-wider" style={{ color: accentColor }}>
                {result.verdict}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#d1d5db" }}>
            Confidence
          </p>
          <div className="flex items-center gap-3 justify-end">
            <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#3a3a3a" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${confidencePct}%`,
                  backgroundColor: accentColor,
                  transition: "width 1.2s ease 0.4s",
                }}
              />
            </div>
            <span className="text-base font-bold tabular-nums" style={{ color: "#f9fafb" }}>
              {result.confidence}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-5">
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#d1d5db" }}>
          Analyzed Article
        </p>
        <div
          className="leading-7 p-4 rounded-sm whitespace-pre-wrap"
          style={{
            backgroundColor: "#1e1e1e",
            color: "#f3f4f6",
            fontFamily: "Georgia, serif",
            fontSize: "12.5px",
            border: "1px solid #3a3a3a",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          {articleText}
        </div>
      </div>

      <div
        className="px-5 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "#3a3a3a", backgroundColor: "#252525" }}
      >
        <p className="text-[10px] font-medium" style={{ color: "#d1d5db" }}>
          Analysis ID: {analysisId}
        </p>
        <button
          className="text-[10px] font-medium tracking-wider uppercase transition-colors"
          style={{ color: "#d1d5db" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
        >
          Export report →
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const API_BASE_URL = "https://aditya31tiwari-veritas-backend.hf.space";
  const router = useRouter();

  // State Management
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [userId, setUserId]           = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab]     = useState<Tab>("text");
  const [articleText, setArticleText] = useState("");
  const [urlInput, setUrlInput]       = useState("");
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [analyzing, setAnalyzing]     = useState(false);
  const [result, setResult]           = useState<AnalysisResult | null>(null);

  const [historyItems, setHistoryItems]     = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("veritas_user_id");
    if (!stored) {
      router.replace("/");
      return;
    }
    const id = parseInt(stored, 10);
    setUserId(id);
    fetchHistory(id);
  }, []);

  const fetchHistory = async (id: number) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/history/${id}`);
      if (res.ok) {
        const data: HistoryItem[] = await res.json();
        setHistoryItems(data);
      }
    } catch {
      // silent fail
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("veritas_user_id");
    router.replace("/");
  };

  const handleClearAll = async () => {
    if (!userId || !confirm("Delete all verification history? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/history/clear/${userId}`, { method: 'DELETE' });
      if (res.ok) fetchHistory(userId);
    } catch (err) {
      alert("Failed to clear history.");
    }
  };

  const handleDeleteSpecific = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/history/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedHistory(null);
        if (userId) fetchHistory(userId);
      }
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setArticleText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 320) + "px";
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (analyzing || !userId) return;

    setAnalyzing(true);
    setResult(null);

    try {
      let backendResult: BackendResult;
      let displayText = "";

      if (activeTab === "text") {
        const text = articleText.trim();
        if (!text) return;
        displayText = text;

        const response = await fetch("${API_BASE_URL}/analyze-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, user_id: userId }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Server error: ${response.status} ${response.statusText}`);
        }
        backendResult = await response.json();

      } else if (activeTab === "url") {
        const url = urlInput.trim();
        if (!url) return;
        displayText = url;

        const response = await fetch("${API_BASE_URL}/analyze-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, user_id: userId }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Server error: ${response.status} ${response.statusText}`);
        }
        backendResult = await response.json();

      } else {
        if (!imageFile) return;
        displayText = `[Image: ${imageFile.name}]`;

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("user_id", String(userId));

        const response = await fetch("${API_BASE_URL}/analyze-image", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Server error: ${response.status} ${response.statusText}`);
        }
        backendResult = await response.json();
      }

      setResult({
        articleText: backendResult.extracted_text || displayText,
        analysisId: `VRX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        result: backendResult,
      });

      fetchHistory(userId);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      alert(`Could not reach the analysis server.\n\n${errorMsg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const isDisabled = analyzing || (activeTab === "text" && !articleText.trim()) || (activeTab === "url" && !urlInput.trim()) || (activeTab === "image" && !imageFile);

  if (userId === null) return null;

  return (
    <div className="flex h-screen overflow-hidden font-mono" style={{ backgroundColor: "#222222", color: "#f3f4f6" }}>
      
      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden border-r"
        style={{ width: sidebarOpen ? "260px" : "0px", borderColor: "#3a3a3a", backgroundColor: "#1e1e1e" }}
      >
        <div className="flex flex-col h-full min-w-[260px]">
          {/* Sidebar Header with Clear All */}
          <div className="px-5 py-4 border-b flex justify-between items-center" style={{ borderColor: "#3a3a3a" }}>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#d1d5db" }}>
              Analysis History
            </p>
            {historyItems.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-[9px] uppercase font-bold text-gray-500 hover:text-[#C35200] transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {historyLoading ? (
              <div className="px-5 py-4"><p className="text-xs" style={{ color: "#6b7280" }}>Loading history…</p></div>
            ) : historyItems.length === 0 ? (
              <div className="px-5 py-4"><p className="text-xs" style={{ color: "#6b7280" }}>No analyses yet.</p></div>
            ) : (
              [...historyItems].reverse().map((item) => {
                const isFake = item.verdict.toUpperCase().includes("FAKE");
                const snippet = (item.content || "").slice(0, 60) + (item.content?.length > 60 ? "…" : "");
                const pct = item.confidence != null ? `${(item.confidence * 100).toFixed(0)}%` : "";
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedHistory(item)}
                    className="w-full text-left px-5 py-4 transition-colors duration-100 border-b border-white/5 group"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium leading-snug truncate flex-1 group-hover:text-[#C35200] transition-colors" style={{ color: "#f3f4f6" }}>
                        {snippet}
                      </p>
                      <span className="text-[10px] font-bold tracking-wider flex-shrink-0 mt-0.5" style={{ color: isFake ? "#C35200" : "#4ade80" }}>
                        {isFake ? "FAKE" : "REAL"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
                        {item.input_type || "text"} 
                      </span>
                      {pct && <p className="text-[10px] font-medium opacity-60" style={{ color: "#f3f4f6" }}>Score: {pct}</p>}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t p-4" style={{ borderColor: "#3a3a3a" }}>
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#C35200" }}>
                  <span className="text-xs font-bold text-white">ID</span>
                </div>
                <p className="text-xs font-medium" style={{ color: "#f3f4f6" }}>User #{userId}</p>
              </div>
              <button onClick={handleLogout} className="text-[10px] uppercase tracking-wider transition-colors" style={{ color: "#9ca3af" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C35200")} onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════ MAIN COLUMN ══════════════ */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center gap-4 px-5 py-3 border-b flex-shrink-0" style={{ borderColor: "#3a3a3a", backgroundColor: "#222222" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex flex-col gap-1.5 p-1.5 rounded transition-colors flex-shrink-0" style={{ color: "#d1d5db" }}>
            <span className="block transition-all duration-300" style={{ width: "18px", height: "1.5px", backgroundColor: "currentColor", transform: sidebarOpen ? "rotate(45deg) translate(3px, 3px)" : "none" }} />
            <span className="block transition-all duration-300" style={{ width: "18px", height: "1.5px", backgroundColor: "currentColor", opacity: sidebarOpen ? 0 : 1 }} />
            <span className="block transition-all duration-300" style={{ width: "18px", height: "1.5px", backgroundColor: "currentColor", transform: sidebarOpen ? "rotate(-45deg) translate(3px, -3px)" : "none" }} />
          </button>
          <div className="opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <Image src="/logo_veritas.png" alt="VeriTas logo" width={140} height={50} className="object-contain" style={{ width: "auto", height: "auto" }} priority />
          </div>
          <div className="flex-1" />
          <span className="text-[11px] font-medium tracking-widest uppercase px-2 py-1 rounded" style={{ color: "#d1d5db", border: "1px solid #3a3a3a", letterSpacing: "0.12em" }}>
            v0.1.0 — Beta
          </span>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex gap-1">
              {(["text", "url", "image"] as Tab[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => handleTabChange(tab)} className="px-4 py-2 text-xs font-medium tracking-widest uppercase transition-all duration-150" style={{ cursor: "pointer", backgroundColor: isActive ? "#2a2a2a" : "transparent", color: isActive ? "#C35200" : "#d1d5db", borderBottom: isActive ? "1px solid #C35200" : "1px solid transparent", letterSpacing: "0.12em" }}>
                    {tab === "url" ? "URL" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
            </div>

            <div className="rounded-sm" style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}>
              {activeTab === "text" && (
                <>
                  <textarea ref={textareaRef} value={articleText} onChange={handleTextChange} placeholder={`Paste article text here…`} className="w-full bg-transparent resize-none outline-none p-5 text-sm leading-relaxed" style={{ color: "#f3f4f6", minHeight: "160px", maxHeight: "320px", overflowY: "auto", fontFamily: "inherit", caretColor: "#C35200" }} />
                  <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "#3a3a3a" }}>
                    <button onClick={() => { setArticleText(SAMPLE_ARTICLE); setTimeout(() => { if (textareaRef.current) { textareaRef.current.style.height = "auto"; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 320) + "px"; } }, 0); }} className="text-xs font-medium transition-colors" style={{ color: "#d1d5db" }}>Load sample article →</button>
                    <span className="text-xs font-medium" style={{ color: "#d1d5db" }}>{articleText.trim() ? `${articleText.trim().split(/\s+/).filter(Boolean).length} words` : ""}</span>
                  </div>
                </>
              )}
              {activeTab === "url" && (
                <>
                  <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/article…" className="w-full bg-transparent outline-none p-5 text-sm" style={{ color: "#f3f4f6", minHeight: "160px", fontFamily: "inherit", caretColor: "#C35200", display: "flex", alignItems: "flex-start" }} />
                  <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "#3a3a3a" }}><span className="text-xs font-medium" style={{ color: "#6b7280" }}>Enter a full article URL to analyze its content</span></div>
                </>
              )}
              {activeTab === "image" && (
                <>
                  <div className="p-5 flex flex-col items-center justify-center gap-4 cursor-pointer" style={{ minHeight: "160px" }} onClick={() => fileInputRef.current?.click()}>
                    {imageFile ? (<><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg><p className="text-sm font-medium" style={{ color: "#f3f4f6" }}>{imageFile.name}</p></>) : (<><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg><p className="text-sm font-medium" style={{ color: "#d1d5db" }}>Click to upload an image</p></>)}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0] ?? null; setImageFile(file); setResult(null); }} />
                  </div>
                </>
              )}
            </div>

            <button onClick={handleAnalyze} disabled={isDisabled} className="w-full py-3 text-sm font-semibold tracking-widest uppercase transition-all duration-200" style={{ backgroundColor: isDisabled ? "#2a2a2a" : "#C35200", color: isDisabled ? "#9ca3af" : "#ffffff", cursor: isDisabled ? "not-allowed" : "pointer", letterSpacing: "0.2em", border: isDisabled ? "1px solid #3a3a3a" : "none", borderRadius: "2px" }}>
              {analyzing ? (<span className="flex items-center justify-center gap-3"><span className="inline-block w-3 h-3 rounded-full" style={{ border: "2px solid #6b7280", borderTopColor: "#C35200", animation: "spin 0.7s linear infinite" }} /><span style={{ color: "#d1d5db" }}>Analyzing…</span></span>) : ("Analyze")}
            </button>

            {analyzing && <TypingIndicator />}
            {result && !analyzing && <ResultCard data={result} />}
          </div>
        </main>
      </div>

      {/* ══════════════ HISTORY DIALOG MODAL ══════════════ */}
      {selectedHistory && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelectedHistory(null)}
        >
          <div 
            className="w-full max-w-2xl rounded-sm overflow-hidden shadow-2xl"
            style={{ backgroundColor: "#222222", border: "1px solid #3a3a3a", animation: "fadeUp 0.3s ease both" }}
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header */}
            <div className="px-6 py-4 flex justify-between items-center border-b" style={{ borderColor: "#3a3a3a", backgroundColor: "#1e1e1e" }}>
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-[#C35200]">Analysis Details</h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono tracking-tighter">REF: VRX-{selectedHistory.id}</p>
              </div>
              <button onClick={() => setSelectedHistory(null)} className="text-gray-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1">Source</p>
                  <span className="text-xs font-mono px-2 py-1 rounded-sm bg-[#2a2a2a] border border-[#3a3a3a] text-gray-300 uppercase">
                    {selectedHistory.input_type || "text"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1">Verdict</p>
                  <span className="text-lg font-bold tracking-widest" style={{ color: selectedHistory.verdict.includes("FAKE") ? "#C35200" : "#4ade80" }}>
                    {selectedHistory.verdict}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Analyzed Text</p>
                <div className="p-4 rounded-sm text-sm leading-relaxed max-h-60 overflow-y-auto font-serif" style={{ backgroundColor: "#1a1a1a", border: "1px solid #3a3a3a", color: "#d1d5db" }}>
                  {selectedHistory.content}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500">Model Confidence</p>
                  <span className="text-sm font-bold text-white">{(selectedHistory.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-1000" style={{ width: `${selectedHistory.confidence * 100}%`, backgroundColor: selectedHistory.verdict.includes("FAKE") ? "#C35200" : "#4ade80" }} />
                </div>
              </div>
            </div>

            {/* Footer with Delete and Close */}
            <div className="px-6 py-4 bg-[#1e1e1e] border-t flex justify-between items-center" style={{ borderColor: "#3a3a3a" }}>
              <button 
                onClick={() => handleDeleteSpecific(selectedHistory.id)}
                className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest"
              >
                Delete Record
              </button>
              <button 
                onClick={() => setSelectedHistory(null)} 
                className="px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-all" 
                style={{ backgroundColor: "#C35200", color: "white" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1e1e1e; }
        ::-webkit-scrollbar-thumb { background: #4a4a4a; border-radius: 2px; }
      `}</style>
    </div>
  );
}