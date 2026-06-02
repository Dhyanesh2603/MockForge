import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

/* ── Scroll reveal — observes AFTER paint ─── */
function useReveal() {
  useEffect(() => {
    // Small delay so all sections are mounted before observing
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
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );

      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }, 120);

    return () => clearTimeout(timer);
  }, []);
}

/* ── Icons ──────────────────────────────────── */
const SunIco = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIco = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const ArrR = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const ChkIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

/* ── Navbar ─────────────────────────────────── */
function Navbar({ dark, toggle }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? "var(--surface)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "none",
      transition: "background 0.35s ease, border-color 0.35s ease",
    }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div className="bg-forge-gradient" style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(11,165,236,0.35)" }}>
            <span style={{ color: "#fff", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14 }}>M</span>
          </div>
          <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
            Mock<span style={{ color: "var(--forge)" }}>Forge</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Features", "How It Works", "Why Us"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ color: "var(--text2)", textDecoration: "none", fontSize: 14, transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = "var(--text)"}
              onMouseLeave={e => e.target.style.color = "var(--text2)"}>
              {item}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={toggle} className="theme-btn btn-press"
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="theme-icon">{dark ? <SunIco /> : <MoonIco />}</span>
          </button>
          <Link to="/login" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 14, padding: "6px 12px" }}>Sign in</Link>
          <Link to="/login" className="bg-forge-gradient btn-press glow-blue-sm"
            style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "8px 18px", borderRadius: 10 }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", paddingTop: 80 }}>
      <div className="bg-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 640, height: 640, borderRadius: "50%", background: "radial-gradient(circle,rgba(var(--forge-rgb),.13),transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", maxWidth: 920, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        {/* Badge */}
        <div className="afu" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 16px", marginBottom: 32 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--forge)" }} className="aps" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--forge)", letterSpacing: ".08em", textTransform: "uppercase" }}>AI-Powered Interview Prep</span>
        </div>

        {/* Headline */}
        <h1 className="afu d1a" style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "clamp(2.8rem,7vw,5.2rem)", lineHeight: 1.05, marginBottom: 24, color: "var(--text)", opacity: 0 }}>
          Forge Your<br />
          <span className="gradient-text">Interview Edge</span>
        </h1>

        <p className="afu d2a" style={{ fontSize: 18, color: "var(--text2)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7, opacity: 0 }}>
          Practice with AI-generated mock interviews tailored to your role, tech stack, and difficulty. Get scored, get feedback, get hired.
        </p>

        <div className="afu d3a" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 64, opacity: 0 }}>
          <Link to="/login" className="bg-forge-gradient glow-blue btn-press"
            style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 16, padding: "14px 28px", borderRadius: 12 }}>
            Start Practicing Free <ArrR />
          </Link>
          <a href="#how-it-works" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>See how it works →</a>
        </div>

        {/* Mock terminal card */}
        <div className="afu d4a" style={{ maxWidth: 640, margin: "0 auto", opacity: 0 }}>
          <div className="glass glow-blue" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.28)" }}>
            {/* bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.04)" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f87171" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#34d399" }} />
              <span style={{ marginLeft: 12, fontSize: 12, color: "var(--text3)", fontFamily: "monospace" }}>MockForge Interview Session</span>
              <span style={{ marginLeft: "auto", fontSize: 11, background: "rgba(52,211,153,.12)", color: "#34d399", padding: "2px 10px", borderRadius: 999, border: "1px solid rgba(52,211,153,.25)" }}>● Live</span>
            </div>
            {/* body */}
            <div style={{ padding: 24, textAlign: "left" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div className="bg-forge-gradient" style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>AI</span>
                </div>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "0 12px 12px 12px", padding: "10px 14px", fontSize: 13, color: "var(--text)", lineHeight: 1.6, maxWidth: 380 }}>
                  Explain the difference between{" "}
                  <code style={{ background: "var(--bg3)", padding: "1px 6px", borderRadius: 4, color: "var(--forge)", fontFamily: "monospace", fontSize: 12 }}>useEffect</code>{" "}
                  and{" "}
                  <code style={{ background: "var(--bg3)", padding: "1px 6px", borderRadius: 4, color: "var(--forge)", fontFamily: "monospace", fontSize: 12 }}>useLayoutEffect</code> in React.
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginBottom: 20 }}>
                <div style={{ background: "rgba(var(--forge-rgb),.08)", border: "1px solid rgba(var(--forge-rgb),.2)", borderRadius: "12px 0 12px 12px", padding: "10px 14px", fontSize: 13, color: "var(--text)", lineHeight: 1.6, maxWidth: 340 }}>
                  <span style={{ color: "var(--forge)" }}>useEffect</span> runs after paint while <span style={{ color: "var(--forge)" }}>useLayoutEffect</span> fires synchronously before the browser paints...
                </div>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--text2)", flexShrink: 0 }}>U</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text3)", display: "flex", justifyContent: "space-between" }}>
                  <span>Type your answer…</span>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--forge)" }}>28:42</span>
                </div>
                <button className="bg-forge-gradient" style={{ color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Next →</button>
              </div>
            </div>
          </div>
          {/* score pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            {[["92", "Technical"], ["88", "Communication"], ["95", "Clarity"]].map(([s, l]) => (
              <div key={l} className="glass" style={{ borderRadius: 999, padding: "5px 14px", display: "flex", alignItems: "center", gap: 7 }}>
                <span className="gradient-text" style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14 }}>{s}</span>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Logos ──────────────────────────────────── */
function LogosStrip() {
  return (
    <section style={{ padding: "52px 24px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <p className="reveal" style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 24 }}>
        Trusted by engineers interviewing at
      </p>
      <div className="reveal" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 36px" }}>
        {["Google", "Meta", "Amazon", "Apple", "Microsoft", "Stripe", "Vercel", "Figma"].map(c => (
          <span key={c} style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 14, color: "var(--text3)", letterSpacing: ".05em" }}>{c}</span>
        ))}
      </div>
    </section>
  );
}

/* ── What Is ────────────────────────────────── */
function WhatIs() {
  return (
    <section style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div className="reveal-left">
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>What is MockForge</span>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "var(--text)", margin: "12px 0 18px", lineHeight: 1.15 }}>
            Your personal AI<br /><span className="gradient-text">interview coach</span>
          </h2>
          <p style={{ color: "var(--text2)", fontSize: 16, lineHeight: 1.75, marginBottom: 24 }}>
            MockForge generates role-specific interview questions powered by AI, evaluates your answers, and delivers actionable feedback — so you walk into every interview prepared.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Personalised questions for your exact role & tech stack",
              "Timed sessions that simulate real interview pressure",
              "AI scoring with strengths & weakness breakdown",
              "Track progress across multiple sessions",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(var(--forge-rgb),.15)", border: "1px solid rgba(var(--forge-rgb),.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, color: "var(--forge)" }}>
                  <ChkIco />
                </div>
                <span style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal-right" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { v: "10K+", l: "Mock interviews", s: "completed" },
            { v: "94%", l: "Users report", s: "improved confidence" },
            { v: "50+", l: "Roles supported", s: "and growing" },
            { v: "3x", l: "Higher success", s: "rate reported" },
          ].map(({ v, l, s }) => (
            <div key={v} className="glass" style={{ borderRadius: 18, padding: 22, border: "1px solid var(--border)", transition: "all .3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(var(--forge-rgb),.3)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}>
              <p className="gradient-text" style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 30, margin: "0 0 4px" }}>{v}</p>
              <p style={{ color: "var(--text)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{l}</p>
              <p style={{ color: "var(--text3)", fontSize: 12, margin: 0 }}>{s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ───────────────────────────────── */
const features = [
  { icon: "🧠", title: "AI Question Generation", desc: "Tailored questions for your exact role, stack, and experience level — never the same twice.", grad: "135deg,#3b82f6,#06b6d4" },
  { icon: "🎯", title: "Real-Time Scoring", desc: "Every answer evaluated by AI. Get a score out of 100 with clear reasoning behind it.", grad: "135deg,#8b5cf6,#a855f7" },
  { icon: "📈", title: "Progress Tracking", desc: "See improvement across sessions with a dashboard that highlights your growth.", grad: "135deg,#10b981,#14b8a6" },
  { icon: "💬", title: "Deep Feedback", desc: "Strengths and weaknesses broken down — actionable insights, not just a number.", grad: "135deg,#f59e0b,#ef4444" },
  { icon: "⚡", title: "Multi-Stack Support", desc: "React, Python, System Design, DevOps — MockForge handles any technology.", grad: "135deg,#ec4899,#f43f5e" },
  { icon: "⏱️", title: "Exam-Grade Pressure", desc: "Timed sessions with auto-submit simulate real interview conditions.", grad: "135deg,#64748b,#475569" },
];

function Features() {
  return (
    <section id="features" style={{ padding: "96px 24px", background: "var(--bg2)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>Features</span>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "clamp(2rem,4vw,3rem)", color: "var(--text)", margin: "12px 0 12px", lineHeight: 1.15 }}>
            Everything you need to <span className="gradient-text">nail it</span>
          </h2>
          <p style={{ color: "var(--text2)", maxWidth: 480, margin: "0 auto", fontSize: 15 }}>A complete interview prep system, not just a Q&A generator.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
          {features.map((f, i) => (
            <div key={f.title} className={`reveal glass d${(i % 6) + 1}`}
              style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)", transition: "transform .3s, box-shadow .3s, border-color .3s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,.18)"; e.currentTarget.style.borderColor = "rgba(var(--forge-rgb),.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(${f.grad})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, color: "var(--text)", marginBottom: 8, fontSize: 16 }}>{f.title}</h3>
              <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ───────────────────────────── */
const steps = [
  { num: "01", icon: "⚙️", title: "Create Your Interview", desc: "Pick your role, stack, difficulty and add context. MockForge generates the perfect questions." },
  { num: "02", icon: "💬", title: "Answer AI Questions", desc: "Work through a timed session in an exam-like interface with flag & review-later tools." },
  { num: "03", icon: "📊", title: "Get Your Score", desc: "Submit and receive instant AI evaluation — score, per-question breakdown, and critique." },
  { num: "04", icon: "🚀", title: "Level Up", desc: "Review skill gaps, identify weak areas, and repeat until you're interview-ready." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>Process</span>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "clamp(2rem,4vw,3rem)", color: "var(--text)", margin: "12px 0", lineHeight: 1.15 }}>
            How it <span className="gradient-text">works</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={s.num} className={`reveal d${i + 1}`} style={{ textAlign: "center" }}>
              <div className="glass" style={{ width: 72, height: 72, borderRadius: 18, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: "1px solid var(--border)", transition: "transform .3s, border-color .3s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.borderColor = "rgba(var(--forge-rgb),.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                {s.icon}
              </div>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", fontWeight: 700, letterSpacing: ".1em" }}>{s.num}</span>
              <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, color: "var(--text)", margin: "4px 0 8px", fontSize: 15 }}>{s.title}</h3>
              <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="reveal" style={{ textAlign: "center", marginTop: 56 }}>
          <Link to="/login" className="bg-forge-gradient glow-blue btn-press"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 16, padding: "14px 32px", borderRadius: 12 }}>
            Start Your First Interview <ArrR />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Why Us ─────────────────────────────────── */
const pts = [
  { e: "⚡", t: "Instant setup", d: "Sign in with Google and start in under 60 seconds. Zero config." },
  { e: "🎯", t: "Role-specific", d: "Not generic — your exact role, stack, experience, and interview type." },
  { e: "🤖", t: "Frontier AI", d: "Built on cutting-edge language models for accurate, nuanced evaluation." },
  { e: "📈", t: "Progress tracking", d: "Every session logged. Watch your scores improve with a skill graph." },
  { e: "🔒", t: "Private & secure", d: "Your answers and results protected behind Firebase authentication." },
  { e: "💸", t: "Free to start", d: "Create your first mock interviews at no cost. Upgrade when ready." },
];

function WhyUs() {
  return (
    <section id="why-us" style={{ padding: "96px 24px", background: "var(--bg2)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>Why MockForge</span>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "clamp(2rem,4vw,3rem)", color: "var(--text)", margin: "12px 0", lineHeight: 1.15 }}>
            Built different. <span className="gradient-text">Designed to win.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {pts.map((p, i) => (
            <div key={p.t} className={`reveal glass d${(i % 6) + 1}`}
              style={{ borderRadius: 18, padding: "18px 22px", border: "1px solid var(--border)", display: "flex", gap: 14, alignItems: "flex-start", transition: "transform .3s, border-color .3s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(var(--forge-rgb),.28)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{p.e}</span>
              <div>
                <h3 style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, color: "var(--text)", margin: "0 0 5px", fontSize: 15 }}>{p.t}</h3>
                <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.65, margin: 0 }}>{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ────────────────────────────────────── */
function CTA() {
  return (
    <section style={{ padding: "72px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="reveal-scale bg-forge-gradient glow-blue"
          style={{ borderRadius: 28, padding: "64px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.12, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 360, height: 180, background: "rgba(255,255,255,0.06)", borderRadius: "50%", filter: "blur(40px)" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#fff", margin: "0 0 16px", lineHeight: 1.15 }}>
              Ready to ace your next interview?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, marginBottom: 32 }}>
              Join thousands of engineers who use MockForge to prepare smarter, not harder.
            </p>
            <Link to="/login" className="btn-press"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#065986", textDecoration: "none", fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
              Get Started — It's Free <ArrR />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="bg-forge-gradient" style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>M</span>
          </div>
          <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, color: "var(--text)" }}>Mock<span style={{ color: "var(--forge)" }}>Forge</span></span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {["Features", "How It Works", "Dashboard", "Login"].map(l => (
            <a key={l} href="#" style={{ color: "var(--text3)", textDecoration: "none", fontSize: 13, transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = "var(--text)"}
              onMouseLeave={e => e.target.style.color = "var(--text3)"}>
              {l}
            </a>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>© {new Date().getFullYear()} MockForge</p>
      </div>
    </footer>
  );
}

/* ── Export ─────────────────────────────────── */
export default function HomePage() {
  const { dark, toggle } = useTheme();
  useReveal();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <Navbar dark={dark} toggle={toggle} />
      <Hero />
      <LogosStrip />
      <WhatIs />
      <Features />
      <HowItWorks />
      <WhyUs />
      <CTA />
      <Footer />
    </div>
  );
}
