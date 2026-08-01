import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function HomePage() {
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Background Grid Accent */}
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.6 }} />

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
          {/* Brand Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div className="bg-forge-gradient" style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,0.4)" }}>
              <span style={{ color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15 }}>M</span>
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 19, color: "var(--text)" }}>
              Mock<span style={{ color: "var(--forge)" }}>Forge</span>
            </span>
          </Link>

          {/* Quick Links */}
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
              Start Free Trial 🚀
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ position: "relative", zIndex: 1, paddingTop: 120 }}>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px", textAlign: "center" }}>
          
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--forge)", fontFamily: "monospace" }}>
              ⚡ NEXT-GEN ENTERPRISE AI INTERVIEW & PROCTORING PLATFORM
            </span>
          </div>

          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: "0 0 20px",
            }}
          >
            Ace Technical Interviews with <br />
            <span className="gradient-text">AI Voice Interviews, Coding Arena & Proctoring</span>
          </h1>

          <p style={{ fontSize: 17, color: "var(--text2)", maxWidth: 680, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Practice real-time technical interviews with AI Voice dictation, solve dynamic coding challenges with secured hidden test cases, and compete in 1v1 live code battles with enterprise AI proctoring.
          </p>

          {/* Action CTAs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
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
              🚀 Start AI Mock Interview
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
              💻 Practice Coding Arena
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
              ⚔️ 1v1 Code Clash Arena
            </Link>
          </div>

          {/* Feature Showcase Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 80, textAlign: "left" }}>
            
            {/* Feature 1 */}
            <div className="glass glow-blue-sm" style={{ borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📢</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
                AI Voice Interviewer & Dictation
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: 0 }}>
                Listen to questions spoken aloud by natural AI voices and dictate your answers hands-free using real-time Web Speech dictation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass glow-blue-sm" style={{ borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🛡️</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
                Forge Guard AI Proctoring
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: 0 }}>
                Real-time MediaPipe Iris eye-gaze tracking, shutter cover detection, background noise auto-pausing, and strict 3-strike tab switch disqualification.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass glow-blue-sm" style={{ borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>💻</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
                AI Coding Arena & Test Runner
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: 0 }}>
                Generate coding challenges for ANY custom topic with sample test cases and secured hidden test case verification across JS, Python, C++, and Java.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass glow-blue-sm" style={{ borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
                Speech & Executive Delivery Analytics
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: 0 }}>
                Analyze your Words Per Minute (WPM), filler word count (*"um"*, *"like"*), sentence structure clarity, and executive confidence rating.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass glow-blue-sm" style={{ borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
                AI Resume Weakness Matcher
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: 0 }}>
                Paste your resume to let AI analyze your technical stack and weak domain spots, generating customized interview questions tailored to your profile.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass glow-blue-sm" style={{ borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>⚔️</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
                1v1 Head-to-Head Code Clash
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: 0 }}>
                Challenge friends or global peers to real-time 1v1 live coding battles with synchronized progress tracking and AI match scoring.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "24px", textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
        © {new Date().getFullYear()} MockForge Platform. Enterprise AI Technical Interviews & Coding Arena.
      </footer>
    </div>
  );
}
