import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "../components/BrandLogo";

/* ── Smooth Scroll Reveal Hook ── */
function useReveal() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const els = document.querySelectorAll(
        ".reveal,.reveal-left,.reveal-right,.reveal-scale"
      );
      if (!els.length) return;

      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );

      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }, 120);

    return () => clearTimeout(timer);
  }, []);
}

export default function HomePage() {
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  useReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Background Grid Accent */}
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.5 }} />

      {/* Navbar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? "var(--surface)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Brand Logo Emblem */}
          <BrandLogo size={34} />

          {/* Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="hidden-mobile">
            {["Features", "Proctoring", "Coding-Arena", "1v1-Clash"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  color: "var(--text2)",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--forge)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--text2)")}
              >
                {item.replace("-", " ")}
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
              Start Practice 🚀
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ position: "relative", zIndex: 1, paddingTop: 120 }}>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px", textAlign: "center" }}>
          
          {/* Badge */}
          <div className="reveal-scale" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 999, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--forge)", fontFamily: "monospace" }}>
              ⚡ ENTERPRISE AI INTERVIEWS, PROCTORING & LIVE CODING ARENA
            </span>
          </div>

          <h1
            className="reveal"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: "0 0 20px",
            }}
          >
            Master Technical Interviews with <br />
            <span className="gradient-text">AI Voice Dictation, Coding Arena & Proctoring</span>
          </h1>

          <p className="reveal d1" style={{ fontSize: 17, color: "var(--text2)", maxWidth: 720, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Practice realistic AI mock interviews with voice dictation, solve topic-based coding challenges with secured hidden test cases, and evaluate candidate integrity with browser AI computer vision.
          </p>

          {/* Action CTAs */}
          <div className="reveal d2" style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 60 }}>
            <Link
              to="/login"
              className="bg-forge-gradient btn-press"
              style={{
                padding: "14px 32px",
                borderRadius: 14,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(99,102,241,0.35)",
              }}
            >
              🚀 Launch AI Mock Interview
            </Link>

            <Link
              to="/login"
              className="btn-press"
              style={{
                padding: "14px 28px",
                borderRadius: 14,
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.3)",
                color: "var(--accent-cyan)",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              💻 Enter Coding Arena
            </Link>

            <Link
              to="/login"
              className="btn-press"
              style={{
                padding: "14px 28px",
                borderRadius: 14,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--red)",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ⚔️ 1v1 Code Clash
            </Link>
          </div>

          {/* Interactive Feature Cards Grid */}
          <div id="features" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, textAlign: "left" }}>
            
            {/* Feature 1: AI Voice Interviewer */}
            <div className="glass glow-blue-sm reveal-left d1" style={{ borderRadius: 24, padding: 32, border: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                🎙️
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 10px", color: "var(--text)" }}>
                AI Voice Interviewer & Dictation
              </h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Experience hands-free technical interviews. Natural AI voices read questions aloud while real-time Web Speech Recognition transcribes your spoken answers directly into your response box.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text3)", lineHeight: 1.7 }}>
                <li>Natural Text-to-Speech (TTS) with voice selector</li>
                <li>Real-time Speech-to-Text (STT) mic dictation</li>
                <li>Dynamic multi-domain technical question bank</li>
              </ul>
            </div>

            {/* Feature 2: Forge Guard AI Proctoring */}
            <div id="proctoring" className="glass glow-blue-sm reveal-scale d2" style={{ borderRadius: 24, padding: 32, border: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                🛡️
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 10px", color: "var(--text)" }}>
                Forge Guard Pro AI Proctoring
              </h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Ensure maximum candidate integrity with zero server overhead. Google MediaPipe Iris tracking monitors eye gaze, while canvas pixel analysis detects camera obstruction and light bleaching.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text3)", lineHeight: 1.7 }}>
                <li>MediaPipe 3D Iris & Eye Gaze drift detection</li>
                <li>Hand/Shutter camera cover & bleaching auto-pause</li>
                <li>Strict 3-strike tab switch auto-disqualification</li>
              </ul>
            </div>

            {/* Feature 3: Coding Arena */}
            <div id="coding-arena" className="glass glow-blue-sm reveal-right d3" style={{ borderRadius: 24, padding: 32, border: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                💻
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 10px", color: "var(--text)" }}>
                AI Coding Arena & Test Case Runner
              </h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Type ANY custom coding topic. AI generates problem statements with sample test cases and secured hidden test cases verified across JS, Python, C++, and Java.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text3)", lineHeight: 1.7 }}>
                <li>Supports custom user-defined coding subjects</li>
                <li>Secured hidden test case execution (Inputs kept hidden)</li>
                <li>In-browser multi-language execution sandbox</li>
              </ul>
            </div>

            {/* Feature 4: 1v1 Clash Arena */}
            <div id="1v1-clash" className="glass glow-blue-sm reveal-left d4" style={{ borderRadius: 24, padding: 32, border: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                ⚔️
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 10px", color: "var(--text)" }}>
                1v1 Head-to-Head Code Clash Arena
              </h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Challenge friends or peers to real-time 1v1 live coding battles with WebSocket synchronization, live opponent progress meters, and AI match scoring.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text3)", lineHeight: 1.7 }}>
                <li>Real-time WebSocket room matchmaking</li>
                <li>Synchronized opponent progress tracking</li>
                <li>Proctored & unproctored clash room modes</li>
              </ul>
            </div>

            {/* Feature 5: Speech & Executive Delivery Analytics */}
            <div className="glass glow-blue-sm reveal-scale d5" style={{ borderRadius: 24, padding: 32, border: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                📊
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 10px", color: "var(--text)" }}>
                Speech & Executive Delivery Analytics
              </h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Analyze your speaking pacing (Words Per Minute), filler word density (*"um"*, *"like"*, *"you know"*), sentence structure index, and executive confidence rating.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text3)", lineHeight: 1.7 }}>
                <li>Words Per Minute (WPM) & pacing evaluation</li>
                <li>Filler word frequency & density breakdown</li>
                <li>Actionable vocal delivery recommendations</li>
              </ul>
            </div>

            {/* Feature 6: Resume Weakness Matcher */}
            <div className="glass glow-blue-sm reveal-right d6" style={{ borderRadius: 24, padding: 32, border: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                📄
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 10px", color: "var(--text)" }}>
                AI Resume & Portfolio Weakness Matcher
              </h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Paste your resume to let AI analyze your technical stack and identify weak domain spots, automatically crafting customized interview questions to test your gaps.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text3)", lineHeight: 1.7 }}>
                <li>Instant resume tech stack parsing</li>
                <li>Identification of target weakness areas</li>
                <li>Tailored question generation matching resume profile</li>
              </ul>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "28px 24px", textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
        © {new Date().getFullYear()} MockForge Platform. Enterprise AI Technical Interviews, Proctoring & Coding Arena.
      </footer>
    </div>
  );
}
