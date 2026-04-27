"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  const [authMode, setAuthMode]       = useState<"login" | "register" | null>(null);
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]     = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "/login" : "/register";
      const response = await fetch(`http://127.0.0.1:8001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || data.detail || "Authentication failed");
      }

      sessionStorage.setItem("veritas_user_id", String(data.user_id));
      router.push("/dashboard");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Network error");
    } finally {
      setAuthLoading(false);
    }
  };

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthError("");
    setEmail("");
    setPassword("");
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden font-sans"
      style={{ backgroundColor: "#1f2122" }}
    >

      {/* ── Subtle dot-grid background texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #3a3a3a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.25,
        }}
      />

      {/* ── Radial glow — burnt-orange tint from center ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 52%, rgba(195,82,0,0.09) 0%, transparent 70%)",
        }}
      />

      {/* ════════════ NAV BAR ════════════ */}
      <nav
        className="relative z-20 flex items-center justify-between px-8 md:px-16 py-5"
        style={{ borderBottom: "1px solid #2a2a2a" }}
      >
        {/* FIX 1 — Image logo replaces text logotype */}
        <Image
          src="/logo_veritas.png"
          alt="VeriTas"
          width={140}
          height={40}
          className="object-contain"
          priority
        />

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it works", "About"].map((item) => (
            <span
              key={item}
              className="text-xs font-medium tracking-widest uppercase cursor-pointer transition-colors duration-200"
              style={{ color: "#6b7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Nav CTA */}
        <button
          onClick={() => openAuth("register")}
          className="text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-sm transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: "#C35200", color: "#ffffff" }}
        >
          Get Started
        </button>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">

        {/* Eyebrow badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10 text-[10px] font-bold tracking-widest uppercase"
          style={{
            border: "1px solid #2e2e2e",
            backgroundColor: "#272727",
            color: "#9ca3af",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "#C35200" }}
          />
          Powered by fine-tuned RoBERTa
        </div>

        {/* ── Headline ── */}
        <h1 className="flex flex-col items-center gap-3 mb-8">

          {/* "VeriTas" — large, white, dominant */}
          <span className="flex items-center gap-4">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#C35200" }}
            />
            <span
              className="text-6xl md:text-8xl font-black tracking-tight leading-none"
              style={{ color: "#ffffff", letterSpacing: "-0.03em" }}
            >
              VeriTas
            </span>
          </span>

          {/* FIX 2 — Single-line sub-headline, whitespace-nowrap + responsive scale */}
          <span
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight whitespace-nowrap"
            style={{ color: "#f3f4f6", letterSpacing: "-0.02em" }}
          >
            One-Stop Mis-Information Detector
          </span>

        </h1>

        {/* FIX 3 — Paragraph: max-w-4xl + mx-auto for clean two-line wrap on desktop */}
        <p
          className="max-w-4xl mx-auto text-sm md:text-base leading-relaxed mb-10"
          style={{ color: "#d1d5db" }}
        >
          A fine-tuned RoBERTa language model analyzes linguistic patterns,
          semantic consistency, and credibility signals to classify news
          articles in real-time — across text, URLs, and images.
        </p>

        {/* ── Tags ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {["TEXT ANALYSIS", "URL EXTRACTION", "OCR / IMAGE", "HISTORY TRACKING"].map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-sm"
              style={{
                border: "1px solid #333333",
                color: "#9ca3af",
                backgroundColor: "transparent",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ── Buttons ── */}
        <div className="flex flex-row items-center justify-center gap-6">

          {/* Primary — solid orange */}
          <button
            onClick={() => openAuth("register")}
            className="px-8 py-3.5 text-xs font-bold tracking-widest uppercase rounded-sm flex items-center gap-3 transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#C35200", color: "#ffffff" }}
          >
            GET STARTED <span className="text-base leading-none">→</span>
          </button>

          {/* FIX 4 — Secondary: outlined, matching visual weight to primary */}
          <button
            onClick={() => openAuth("login")}
            className="px-8 py-3.5 text-xs font-bold tracking-widest uppercase rounded-sm transition-all duration-200"
            style={{
              border: "1px solid #3a3a3a",
              color: "#9ca3af",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#6b7280";
              (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3a";
              (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
            }}
          >
            ALREADY HAVE AN ACCOUNT?
          </button>

        </div>
      </main>

      {/* ════════════ AUTH MODAL ════════════ */}
      {authMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          style={{ animation: "fadeUp 0.2s ease" }}
        >
          <div
            className="w-full max-w-sm p-8 rounded-sm shadow-2xl relative"
            style={{ backgroundColor: "#1e1e1e", border: "1px solid #3a3a3a" }}
          >
            <button
              onClick={() => { setAuthMode(null); setAuthError(""); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#C35200" }}
              />
              <h2
                className="text-sm font-bold tracking-widest uppercase"
                style={{ color: "#f3f4f6" }}
              >
                {authMode === "login" ? "System Login" : "Register User"}
              </h2>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-[10px] uppercase tracking-widest mb-1.5"
                  style={{ color: "#9ca3af" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-transparent outline-none rounded-sm transition-colors"
                  style={{ border: "1px solid #3a3a3a", color: "#f3f4f6" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C35200")}
                  onBlur={(e) => (e.target.style.borderColor = "#3a3a3a")}
                />
              </div>

              <div>
                <label
                  className="block text-[10px] uppercase tracking-widest mb-1.5"
                  style={{ color: "#9ca3af" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-transparent outline-none rounded-sm transition-colors"
                  style={{ border: "1px solid #3a3a3a", color: "#f3f4f6" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C35200")}
                  onBlur={(e) => (e.target.style.borderColor = "#3a3a3a")}
                />
              </div>

              {authError && (
                <p className="text-xs font-medium" style={{ color: "#ef4444" }}>
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 mt-2 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm"
                style={{
                  backgroundColor: authLoading ? "#2a2a2a" : "#C35200",
                  color: authLoading ? "#9ca3af" : "#ffffff",
                }}
              >
                {authLoading
                  ? "Authenticating..."
                  : authMode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                }}
                className="text-[10px] uppercase tracking-wider hover:underline"
                style={{ color: "#9ca3af" }}
              >
                {authMode === "login"
                  ? "No account? Register here"
                  : "Already registered? Log in"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Global styles ─── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1f2122; }
        ::-webkit-scrollbar-thumb { background: #4a4a4a; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #5a5a5a; }
        input::placeholder { color: #6b7280; }
      `}</style>
    </div>
  );
}