import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "../components/BrandLogo";

/* ── Smooth Scroll Reveal Hook ── */
function useReveal() {
  useEffect(() => {
    let io;
    const timer = setTimeout(() => {
      const els = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale"
      );
      if (!els.length) return;

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
      );

      els.forEach((el) => io.observe(el));
    }, 60);

    return () => {
      clearTimeout(timer);
      if (io) io.disconnect();
    };
  }, []);
}

export default function HomePage() {
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState("interview");
  const [activeFaq, setActiveFaq] = useState(null);

  useReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleNavClick = (e, targetId, tabKey) => {
    e.preventDefault();
    if (tabKey) {
      setActiveDemoTab(tabKey);
    }
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflowX: "hidden" }}>
      {/* Background Grid & Gradient Orbs */}
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.5 }} />
      <div style={{ position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Navbar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? "var(--surface)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "none",
          transition: "all 0.35s ease",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <BrandLogo size={34} />

          {/* Nav Items */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden-mobile">
            {[
              { label: "Features", targetId: "features", tabKey: "interview" },
              { label: "Proctoring", targetId: "features", tabKey: "proctoring" },
              { label: "Coding Arena", targetId: "features", tabKey: "coding" },
              { label: "1v1 Clash", targetId: "features", tabKey: "clash" },
              { label: "How It Works", targetId: "how-it-works" },
              { label: "FAQ", targetId: "faq" },
            ].map(({ label, targetId, tabKey }) => (
              <a
                key={label}
                href={`#${targetId}`}
                onClick={(e) => handleNavClick(e, targetId, tabKey)}
                style={{ color: "var(--text2)", fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={(e) => (e.target.style.color = "var(--forge)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--text2)")}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={toggle}
              className="theme-btn btn-press"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <Link
              to="/login"
              className="btn-press"
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>

            <Link
              to="/login"
              className="bg-forge-gradient btn-press"
              style={{
                padding: "8px 20px",
                borderRadius: 10,
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
              }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main style={{ position: "relative", zIndex: 1, paddingTop: 120 }}>

        {/* ── HERO SECTION ── */}
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 80px", textAlign: "center" }}>
          {/* Badge */}
          <div className="reveal-scale" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 999, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--forge)", fontFamily: "monospace" }}>
              ENTERPRISE AI INTERVIEW, PROCTORING & LIVE CODING PLATFORM
            </span>
          </div>

          {/* Headline */}
          <h1
            className="reveal"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4.2vw, 3.2rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: "0 0 20px",
            }}
          >
            Ace Technical Interviews with <br />
            <span className="gradient-text">AI Voice Dictation, Coding Arena & Proctoring</span>
          </h1>

          {/* Subtitle */}
          <p className="reveal d1" style={{ fontSize: 18, color: "var(--text2)", maxWidth: 740, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Practice hands-free AI mock interviews, solve dynamic coding challenges with secured hidden test cases, and evaluate candidate integrity with browser AI computer vision.
          </p>

          {/* Hero CTAs */}
          <div className="reveal d2" style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 60 }}>
            <Link
              to="/adaptive"
              className="bg-forge-gradient btn-press"
              style={{
                padding: "15px 34px",
                borderRadius: 14,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 12px 36px rgba(99,102,241,0.4)",
              }}
            >
              Adaptive Practice & SWOT
            </Link>

            <Link
              to="/login"
              className="btn-press"
              style={{
                padding: "15px 28px",
                borderRadius: 14,
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.3)",
                color: "var(--accent-cyan)",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Practice Coding Arena
            </Link>

            <Link
              to="/login"
              className="btn-press"
              style={{
                padding: "15px 28px",
                borderRadius: 14,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--red)",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              1v1 Code Clash
            </Link>
          </div>

          {/* Interactive Mockup Preview Card */}
          <div className="glass glow-blue reveal-scale d3" style={{ borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden", textAlign: "left", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "12px 20px", background: "var(--bg2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
              </div>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text3)" }}>
                MockForge Session Terminal — Live AI Voice & Proctoring Engine
              </span>
              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, fontFamily: "monospace" }}>
                FORGE GUARD ACTIVE
              </span>
            </div>

            <div style={{ padding: 28, display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--forge)", fontFamily: "monospace" }}>QUESTION 1 OF 10</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(16,185,129,0.12)", color: "#10b981" }}>Senior Full Stack</span>
                </div>
                <h3 style={{ margin: "0 0 14px", fontSize: 17, color: "var(--text)", fontWeight: 700 }}>
                  "How does the browser Event Loop prioritize microtasks vs macrotasks during hydration?"
                </h3>
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--bg2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: "var(--forge)", fontWeight: 600 }}>Read Question Aloud (AI Voice)</span>
                  <span style={{ fontSize: 13, color: "var(--red)", fontWeight: 700 }}>Listening... (Voice Answer Active)</span>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 13, color: "var(--text2)", minHeight: 80 }}>
                  "Microtasks like Promises and queueMicrotask execute immediately after the current task..."
                </div>
              </div>

              {/* Floating Camera & Proctoring Widget Preview */}
              <div style={{ borderRadius: 16, background: "var(--bg2)", border: "1px solid var(--border)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--forge)", fontFamily: "monospace" }}>
                    PROCTORING FEED
                  </span>
                  <span style={{ fontSize: 10, color: "#10b981", fontWeight: 800, fontFamily: "monospace" }}>
                    10/10 WARN
                  </span>
                </div>
                <div style={{ height: 110, borderRadius: 12, background: "var(--bg3)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--forge)", fontFamily: "monospace" }}>CAMERA FEED</span>
                  <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, padding: "2px 6px", borderRadius: 999, background: "rgba(239,68,68,0.9)", color: "#fff", fontWeight: 800, fontFamily: "monospace" }}>
                    LIVE IRIS
                  </span>
                  <span style={{ position: "absolute", bottom: 8, right: 8, fontSize: 9, padding: "2px 6px", borderRadius: 999, background: "rgba(16,185,129,0.9)", color: "#fff", fontWeight: 800, fontFamily: "monospace" }}>
                    GAZE: CENTER
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "monospace" }}>
                  • Iris Gaze Tracking: OK <br />
                  • Camera Shutter: CLEAR <br />
                  • Tab Switches: 0 / 2
                </div>
              </div>
            </div>
          </div>

        </section>


        {/* ── INTERACTIVE FEATURE DEMO TABS ── */}
        <section id="features" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>
              PLATFORM DEEP DIVE
            </span>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4vw,3rem)", margin: "8px 0 0" }}>
              Built for Modern Technical Excellence
            </h2>
          </div>

          {/* Tab Controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
            {[
              ["adaptive", "Adaptive Practice"],
              ["swot", "SWOT & Role Rubrics"],
              ["interview", "AI Voice Interviews"],
              ["proctoring", "Forge Guard Proctoring"],
              ["coding", "AI Coding Arena"],
              ["clash", "1v1 Code Clash"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveDemoTab(id)}
                className="btn-press"
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: activeDemoTab === id ? "none" : "1px solid var(--border)",
                  background: activeDemoTab === id ? "var(--forge)" : "var(--surface)",
                  color: activeDemoTab === id ? "#fff" : "var(--text2)",
                  boxShadow: activeDemoTab === id ? "0 8px 24px rgba(99,102,241,0.3)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Active Tab Content Card */}
          <div className="glass reveal-scale" style={{ borderRadius: 24, padding: 36, border: "1px solid var(--border)" }}>
            {activeDemoTab === "adaptive" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--forge)", fontFamily: "monospace" }}>01. ADAPTIVE AI PRACTICE</span>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, margin: "8px 0 14px", color: "var(--text)" }}>
                    Dynamic Difficulty Adaptation
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 20px" }}>
                    Enter ANY custom topic. As you answer, the AI analyzes your response depth. Superficial answers trigger clarifying foundational questions, while detailed answers escalate difficulty to Advanced or Mastery.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(99,102,241,0.12)", color: "var(--forge)", fontWeight: 700 }}>
                      ✓ Any Custom Subject
                    </span>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 700 }}>
                      ✓ Real-Time Question Scaling
                    </span>
                  </div>
                </div>
                <div style={{ padding: 24, borderRadius: 18, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--forge)", fontFamily: "monospace" }}>PRACTICE MODE</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(99,102,241,0.12)", color: "var(--forge)", fontWeight: 700 }}>
                      DIFFICULTY: ADVANCED
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 700, margin: "0 0 12px" }}>
                    "How do you handle distributed deadlock detection and race conditions in high-throughput database clusters?"
                  </p>
                  <span style={{ fontSize: 11, color: "var(--accent-cyan)", fontFamily: "monospace" }}>
                    AI Adaptation: Escalated based on strong answer to Q1.
                  </span>
                </div>
              </div>
            )}

            {activeDemoTab === "swot" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>02. SWOT & ROLE RUBRICS</span>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, margin: "8px 0 14px", color: "var(--text)" }}>
                    SWOT Analysis & Role-Specific Rubrics
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 20px" }}>
                    Evaluates your performance against specific role rubrics (Frontend, Backend, Data Science, DevOps). Generates a complete SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) at session end.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 700 }}>
                      ✓ Strengths & Weaknesses
                    </span>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(6,182,212,0.12)", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      ✓ Production Risks (Threats)
                    </span>
                  </div>
                </div>
                <div style={{ padding: 20, borderRadius: 18, background: "var(--bg2)", border: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ padding: 12, borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <strong style={{ fontSize: 11, color: "#10b981", display: "block" }}>STRENGTHS</strong>
                    <span style={{ fontSize: 12, color: "var(--text)" }}>Clear architecture rationale</span>
                  </div>
                  <div style={{ padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <strong style={{ fontSize: 11, color: "var(--red)", display: "block" }}>WEAKNESSES</strong>
                    <span style={{ fontSize: 12, color: "var(--text)" }}>Memory leak edge cases</span>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "interview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--forge)", fontFamily: "monospace" }}>01. AI VOICE INTERVIEWS</span>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, margin: "8px 0 14px", color: "var(--text)" }}>
                    Natural Text-to-Speech & Hands-Free Dictation
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 20px" }}>
                    MockForge simulates real interview conditions. Natural AI voices read questions aloud with selectable voices and speech rates, while Web Speech Recognition dictates your voice answers hands-free directly into the response box.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(99,102,241,0.12)", color: "var(--forge)", fontWeight: 700 }}>
                      ✓ Web Speech API TTS
                    </span>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 700 }}>
                      ✓ Hands-Free Voice Answer
                    </span>
                  </div>
                </div>
                <div style={{ padding: 24, borderRadius: 18, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 16 }}>📢</span>
                    <strong style={{ fontSize: 13, color: "var(--text)" }}>AI Voice Question Reader</strong>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text2)", fontStyle: "italic", margin: "0 0 16px" }}>
                    "Explain the difference between Optimistic vs Pessimistic concurrency control in relational databases."
                  </p>
                  <div style={{ padding: 12, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)", fontSize: 12, color: "#10b981", fontWeight: 700 }}>
                    🎙️ Voice Dictation: "Optimistic concurrency control assumes no conflicts will occur..."
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "proctoring" && (
              <div id="proctoring" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", fontFamily: "monospace" }}>02. FORGE GUARD PROCTORING</span>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, margin: "8px 0 14px", color: "var(--text)" }}>
                    Google MediaPipe Iris & Computer Vision
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 20px" }}>
                    Forge Guard runs 100% in your browser using Google MediaPipe Tasks Vision. It tracks 478 3D facial landmarks and iris centers to detect eye gaze drift, hand/shutter camera cover, and background speech.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(239,68,68,0.12)", color: "var(--red)", fontWeight: 700 }}>
                      ✓ 3D Iris Gaze Tracking
                    </span>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontWeight: 700 }}>
                      ✓ Camera Cover Auto-Pause
                    </span>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 700 }}>
                      ✓ 3-Strike Tab Switch Disqualify
                    </span>
                  </div>
                </div>
                <div style={{ padding: 24, borderRadius: 18, background: "var(--bg2)", border: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontSize: 42, marginBottom: 8 }}>🖐️</div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 16, color: "var(--red)", fontWeight: 800 }}>CAMERA OBSTRUCTED</h4>
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--text2)" }}>
                    Test automatically paused. Uncover camera to resume timer.
                  </p>
                  <span style={{ fontSize: 11, fontFamily: "monospace", padding: "4px 12px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "var(--red)", fontWeight: 800 }}>
                    PAUSED BY FORGE GUARD
                  </span>
                </div>
              </div>
            )}

            {activeDemoTab === "coding" && (
              <div id="coding-arena" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-cyan)", fontFamily: "monospace" }}>03. AI CODING ARENA</span>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, margin: "8px 0 14px", color: "var(--text)" }}>
                    Custom Topics & Secured Hidden Test Cases
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 20px" }}>
                    Type ANY custom coding subject. AI generates problem statements with sample test cases and secured hidden test cases across JS, Python, C++, and Java.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(6,182,212,0.12)", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      ✓ Any Custom Subject
                    </span>
                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 700 }}>
                      🔒 Secured Hidden Test Cases
                    </span>
                  </div>
                </div>
                <div style={{ padding: 20, borderRadius: 18, background: "#0f172a", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 12 }}>
                  <div style={{ color: "#94a3b8", marginBottom: 8 }}>// JS / Python / C++ / Java Compiler</div>
                  <div style={{ color: "#38bdf8" }}>function twoSum(nums, target) &#123;</div>
                  <div style={{ color: "#e2e8f0", paddingLeft: 16 }}>const map = new Map();</div>
                  <div style={{ color: "#34d399", paddingLeft: 16 }}>// Run Verification...</div>
                  <div style={{ color: "#38bdf8" }}>&#125;</div>
                  <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#34d399", fontWeight: 700 }}>
                    ✓ Sample Test #1: PASSED (0.02s)<br />
                    🔒 Hidden Test #1: PASSED (0.01s)
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "clash" && (
              <div id="clash" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", fontFamily: "monospace" }}>04. 1V1 LIVE CODE CLASH</span>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, margin: "8px 0 14px", color: "var(--text)" }}>
                    Real-Time Head-to-Head Battle Arena
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 20px" }}>
                    Challenge peers in real-time 1v1 live coding battles. WebSocket connection syncs opponent progress meters, remaining match timer, and AI evaluation.
                  </p>
                </div>
                <div style={{ padding: 24, borderRadius: 18, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>⚔️ 1v1 Clash Match</span>
                    <span style={{ fontSize: 13, fontFamily: "monospace", color: "#f59e0b", fontWeight: 800 }}>⏳ 08:45</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 8 }}>
                    Opponent Progress: Currently on Q2/3
                  </div>
                  <div style={{ height: 8, background: "var(--bg3)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: "66%", height: "100%", background: "#f59e0b" }} />
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "analytics" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>05. SPEECH ANALYTICS</span>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, margin: "8px 0 14px", color: "var(--text)" }}>
                    WPM, Filler Words & Executive Confidence
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 20px" }}>
                    Receive comprehensive voice delivery metrics after every interview: Words Per Minute (WPM), filler word breakdown (*"um"*, *"like"*), and clarity score.
                  </p>
                </div>
                <div style={{ padding: 20, borderRadius: 18, background: "var(--bg2)", border: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "center" }}>
                  <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)" }}>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>Speech Pacing</span>
                    <strong style={{ fontSize: 16, color: "var(--forge)", display: "block" }}>135 WPM</strong>
                  </div>
                  <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)" }}>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>Filler Count</span>
                    <strong style={{ fontSize: 16, color: "#10b981", display: "block" }}>2 Fillers</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>


        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>
              SIMPLE STEP-BY-STEP PROCESS
            </span>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4vw,3rem)", margin: "8px 0 0" }}>
              How MockForge Works
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { num: "01", title: "Configure Session", desc: "Select target role, stack, or paste your resume to tailor interview questions to your gaps." },
              { num: "02", title: "Enable Voice & Guard", desc: "Turn on AI Voice dictation & Forge Guard Iris proctoring for hands-free practice." },
              { num: "03", title: "Complete Interview", desc: "Answer technical questions or solve coding problems in the multi-language compiler." },
              { num: "04", title: "Get AI Evaluation", desc: "Receive immediate per-question AI feedback, speech analytics, and proctoring timeline." },
            ].map((step, idx) => (
              <div key={idx} className={`glass reveal-scale d${idx + 1}`} style={{ borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "var(--forge)", fontFamily: "Syne, sans-serif", display: "block", marginBottom: 12 }}>
                  {step.num}
                </span>
                <h4 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
                  {step.title}
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* ── FAQ ACCORDION ── */}
        <section id="faq" style={{ maxWidth: 840, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4vw,2.8rem)", margin: "8px 0 0" }}>
              Got Questions? We Have Answers.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { q: "How does the AI Voice Interviewer work?", a: "The AI Voice Interviewer uses the browser's Web Speech API. Natural AI text-to-speech reads questions aloud, and Speech-to-Text dictation transcribes your spoken answers directly into your response box in real-time." },
              { q: "How does Forge Guard Proctoring detect violations?", a: "Forge Guard runs client-side using Google MediaPipe Tasks Vision. It tracks 478 3D facial landmarks and iris centers to detect eye gaze drift, camera shutter obstruction, light bleaching, and tab switches." },
              { q: "Are hidden test cases visible in the Coding Arena?", a: "No. Hidden test cases are 100% secured and never rendered in the UI. Code is verified in memory, displaying only Pass/Fail status." },
              { q: "Can I practice 1v1 Code Clashes with friends?", a: "Yes! Create a 1v1 Clash room code and send it to your friend to start a real-time head-to-head coding battle." },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="glass reveal"
                style={{ borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="btn-press"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 22px",
                    border: "none",
                    background: "transparent",
                    color: "var(--text)",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 18, color: "var(--forge)", transform: activeFaq === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>
                    ▾
                  </span>
                </button>
                {activeFaq === idx && (
                  <div style={{ padding: "0 22px 20px", fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>


        {/* ── FINAL CTA ── */}
        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 24px 100px" }}>
          <div className="glass glow-blue reveal-scale" style={{ borderRadius: 28, padding: "60px 36px", border: "1px solid rgba(99,102,241,0.3)", textAlign: "center", background: "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(99,102,241,0.12))" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4vw,3rem)", margin: "0 0 16px", color: "var(--text)" }}>
              Ready to Ace Your Next Technical Interview?
            </h2>
            <p style={{ fontSize: 16, color: "var(--text2)", maxWidth: 580, margin: "0 auto 32px", lineHeight: 1.6 }}>
              Join thousands of developers using MockForge for AI Voice interviews, MediaPipe proctoring, and coding arena practice.
            </p>
            <Link
              to="/login"
              className="bg-forge-gradient btn-press"
              style={{
                padding: "16px 36px",
                borderRadius: 14,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(99,102,241,0.4)",
                display: "inline-block",
              }}
            >
              Create Account Free 🚀
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "32px 24px", textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <BrandLogo size={28} />
          <span>© {new Date().getFullYear()} MockForge Platform. Enterprise AI Technical Interviews & Coding Arena.</span>
        </div>
      </footer>
    </div>
  );
}
