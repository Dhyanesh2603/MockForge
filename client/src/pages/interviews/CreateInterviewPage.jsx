import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavBar from "../../components/NavBar";
import ResumeParserSection from "../../components/interviews/ResumeParserSection";

const ROLES = ["Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Data Scientist","Machine Learning Engineer","iOS Developer","Android Developer","QA Engineer","Product Manager"];
const STACKS = ["React, Node.js","Vue.js, Django","Angular, Spring Boot","Python, FastAPI","React Native","Flutter, Firebase","AWS, Docker, K8s","TensorFlow, PyTorch","Next.js, Prisma","Go, PostgreSQL"];
const EXP = ["Fresher (0-1 yr)","Junior (1-3 yrs)","Mid-level (3-5 yrs)","Senior (5-8 yrs)","Lead / Principal (8+ yrs)"];
const FOCUS = ["DSA","System Design","Behavioral","Frontend Concepts","Backend Architecture","DevOps & Cloud","Security","Performance","Testing & QA","Leadership"];
const ITYPES = ["Technical Screening","Full Technical Round","Behavioral Round","System Design Round","Full Interview Loop","Take-Home Prep"];

const Chip = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "5px 13px", borderRadius: 999, cursor: "pointer", fontSize: 12,
      fontWeight: active ? 600 : 400, transition: "all .18s",
      border: active ? "none" : "1px solid var(--border)",
      background: active ? "linear-gradient(135deg,#0ba5ec,#065986)" : "var(--surface)",
      color: active ? "#fff" : "var(--text2)",
    }}
  >{label}</button>
);

const Label = ({ children }) => (
  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
    {children}
  </label>
);

const inputStyle = {
  width: "100%", boxSizing: "border-box", borderRadius: 12,
  border: "1px solid var(--border)", background: "var(--bg2)",
  color: "var(--text)", padding: "11px 14px", fontSize: 14, resize: "none",
};

const StepDot = ({ n, label, active, done }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, transition: "all .3s",
      background: done ? "var(--forge)" : active ? "rgba(var(--forge-rgb),.15)" : "var(--bg2)",
      border: active || done ? "1px solid rgba(var(--forge-rgb),.4)" : "1px solid var(--border)",
      color: done ? "#fff" : active ? "var(--forge)" : "var(--text3)",
    }}>
      {done ? "✓" : n}
    </div>
    <span style={{ fontSize: 13, fontWeight: active || done ? 600 : 400, color: active ? "var(--text)" : "var(--text3)" }}>
      {label}
    </span>
  </div>
);

export default function CreateInterviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestInProgress = useRef(false);

  // Step 1
  const [role, setRole] = useState("");
  const [techStack, setTechStack] = useState("");
  const [experience, setExperience] = useState("");
  const [interviewType, setInterviewType] = useState("");

  // Step 2
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [dynamic, setDynamic] = useState(false);
  const [proctored, setProctored] = useState(true);
  const [focusAreas, setFocusAreas] = useState([]);

  // Step 3
  const [targetCompany, setTargetCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  const toggleFocus = (f) =>
    setFocusAreas(a => a.includes(f) ? a.filter(x => x !== f) : [...a, f]);

  // ONLY called on step 3 submit button click — NOT a form submit
  const handleStart = async () => {
  if (step !== 3) return;

  // Prevent duplicate requests
  if (requestInProgress.current) return;

  requestInProgress.current = true;

  try {
    setLoading(true);
    setError("");

    const token = await user.getIdToken();

    const payload = {
      role,
      techStack,
      difficulty,
      numQuestions: Number(numQuestions),
      experience,
      interviewType,
      focusAreas: focusAreas.join(", "),
      targetCompany,
      jobDescription: jobDescription.slice(0, 600),
      additionalContext: additionalContext.slice(0, 300),
      dynamic,
      proctored,
    };

    const r = await api.post(
      "/interviews",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    navigate(`/interviews/${r.data.interview.id}`);
  } catch (err) {
    console.error(err);
    setError("Failed to create interview. Check your connection and try again.");
  } finally {
    requestInProgress.current = false;
    setLoading(false);
  }
};

  const dc = {
    Easy:   { c: "#34d399", bg: "rgba(52,211,153,.1)",  br: "rgba(52,211,153,.3)",  d: "Foundational concepts" },
    Medium: { c: "#fbbf24", bg: "rgba(251,191,36,.1)",  br: "rgba(251,191,36,.3)",  d: "Intermediate depth" },
    Hard:   { c: "#f87171", bg: "rgba(248,113,113,.1)", br: "rgba(248,113,113,.3)", d: "Advanced & edge cases" },
  };

  const canNext1 = role.trim() && techStack.trim();

  const goNext = () => {
    if (step === 1 && !canNext1) return;
    setStep(s => s + 1);
  };

  const goBack = () => setStep(s => s - 1);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 560, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(var(--forge-rgb),.07),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <NavBar showLogout={false} />

        <main style={{ maxWidth: 620, margin: "0 auto", padding: "30px 24px 80px" }}>
          {/* Top back to dashboard link */}
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-press"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
              borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--text2)", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 20
            }}
          >
            ← Back to Dashboard
          </button>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--forge)", textTransform: "uppercase", letterSpacing: ".1em" }}>New Session</span>
            <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem,3vw,2.2rem)", color: "var(--text)", margin: "10px 0 6px" }}>
              Create Interview
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 14, margin: 0 }}>
              More context = smarter, more personalised questions
            </p>
          </div>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
            <StepDot n={1} label="Role & Stack" active={step === 1} done={step > 1} />
            <div style={{ width: 28, height: 1, background: "var(--border)" }} />
            <StepDot n={2} label="Format" active={step === 2} done={step > 2} />
            <div style={{ width: 28, height: 1, background: "var(--border)" }} />
            <StepDot n={3} label="Context" active={step === 3} done={false} />
          </div>

          {/* Card — NOT a form, uses onClick only */}
          <div className="glass" style={{ borderRadius: 22, padding: 28, border: "1px solid var(--border)" }}>

            {/* ── STEP 1: Role & Stack ── */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <ResumeParserSection
                  onResumeParsed={(parsed) => {
                    if (parsed.detectedRole) setRole(parsed.detectedRole);
                    if (parsed.techStack) setTechStack(parsed.techStack);
                    if (parsed.weaknesses && parsed.weaknesses.length > 0) {
                      setFocusAreas((prev) => Array.from(new Set([...prev, ...parsed.weaknesses])));
                    }
                  }}
                />

                <div>
                  <Label>Target Role <span style={{ color: "var(--forge)" }}>*</span></Label>
                  <input
                    value={role} onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(var(--forge-rgb),.45)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {ROLES.map(r => <Chip key={r} label={r} active={role === r} onClick={() => setRole(r)} />)}
                  </div>
                </div>

                <div>
                  <Label>Tech Stack <span style={{ color: "var(--forge)" }}>*</span></Label>
                  <input
                    value={techStack} onChange={e => setTechStack(e.target.value)}
                    placeholder="e.g. React, Node.js, PostgreSQL"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(var(--forge-rgb),.45)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {STACKS.map(s => <Chip key={s} label={s} active={techStack === s} onClick={() => setTechStack(s)} />)}
                  </div>
                </div>

                <div>
                  <Label>Experience Level <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>(optional)</span></Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {EXP.map(e => <Chip key={e} label={e} active={experience === e} onClick={() => setExperience(experience === e ? "" : e)} />)}
                  </div>
                </div>

                <div>
                  <Label>Interview Type <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>(optional)</span></Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ITYPES.map(t => <Chip key={t} label={t} active={interviewType === t} onClick={() => setInterviewType(interviewType === t ? "" : t)} />)}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Format ── */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {/* Number of questions */}
                <div>
                  <Label>Number of Questions</Label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[5, 10, 15].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNumQuestions(n)}
                        style={{
                          flex: 1, padding: "14px 8px", borderRadius: 14, cursor: "pointer", textAlign: "center",
                          border: numQuestions === n ? "1px solid rgba(var(--forge-rgb),.45)" : "1px solid var(--border)",
                          background: numQuestions === n ? "rgba(var(--forge-rgb),.1)" : "var(--surface)",
                          color: numQuestions === n ? "var(--forge)" : "var(--text2)",
                          transition: "all .2s",
                        }}
                      >
                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 22, margin: "0 0 4px", color: "inherit" }}>{n}</p>
                        <p style={{ fontSize: 11, margin: 0, opacity: .7 }}>{n === 5 ? "~15 min" : n === 10 ? "~25 min" : "~40 min"}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proctored vs Unproctored Mode */}
                <div>
                  <Label>Session Mode</Label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setProctored(true)}
                      style={{
                        padding: "14px 12px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                        border: proctored ? "1px solid #34d399" : "1px solid var(--border)",
                        background: proctored ? "rgba(52,211,153,0.08)" : "var(--surface)",
                        transition: "all .2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: proctored ? "#34d399" : "var(--text)" }}>
                          🛡️ Proctored
                        </span>
                        <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(52,211,153,0.2)", color: "#34d399", fontWeight: 700 }}>
                          RECOMMENDED
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, lineHeight: 1.4 }}>
                        Camera/mic check, noise & tab-switch monitoring + Anti-Cheat Report.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProctored(false)}
                      style={{
                        padding: "14px 12px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                        border: !proctored ? "1px solid var(--forge)" : "1px solid var(--border)",
                        background: !proctored ? "rgba(var(--forge-rgb),0.08)" : "var(--surface)",
                        transition: "all .2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: !proctored ? "var(--forge)" : "var(--text)" }}>
                          🔓 Unproctored
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, lineHeight: 1.4 }}>
                        Casual practice mode without camera/mic or anti-cheat tracking.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Dynamic Engine toggle */}
                <div
                  className="glass"
                  style={{
                    borderRadius: 16, padding: 16, cursor: "pointer", transition: "border-color .25s",
                    border: dynamic ? "1px solid rgba(var(--forge-rgb),.4)" : "1px solid var(--border)",
                  }}
                  onClick={() => setDynamic(d => !d)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 15, color: "var(--text)", margin: "0 0 4px" }}>
                        ⚡ Dynamic Difficulty Engine
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text2)", margin: 0, lineHeight: 1.5 }}>
                        Questions adapt based on your responses — stronger answers unlock harder follow-ups.
                      </p>
                    </div>
                    <div style={{
                      flexShrink: 0, width: 44, height: 24, borderRadius: 999, position: "relative",
                      background: dynamic ? "var(--forge)" : "var(--bg3)",
                      border: "1px solid var(--border)", transition: "background .25s",
                    }}>
                      <div style={{
                        position: "absolute", top: 2, left: dynamic ? 22 : 2,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                        transition: "left .25s",
                      }} />
                    </div>
                  </div>
                </div>

                {/* Focus areas */}
                <div>
                  <Label>Focus Areas <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>(optional, pick any)</span></Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {FOCUS.map(f => <Chip key={f} label={f} active={focusAreas.includes(f)} onClick={() => toggleFocus(f)} />)}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Context ── */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(var(--forge-rgb),.07)", border: "1px solid rgba(var(--forge-rgb),.2)" }}>
                  <p style={{ fontSize: 13, color: "var(--forge)", margin: 0, lineHeight: 1.6 }}>
                    💡 This context is sent directly to the AI. The more detail you provide, the more personalised and unique your questions will be.
                  </p>
                </div>

                <div>
                  <Label>Target Company <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>(optional)</span></Label>
                  <input
                    value={targetCompany} onChange={e => setTargetCompany(e.target.value)}
                    placeholder="e.g. Google, a Series B fintech startup, FAANG…"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(var(--forge-rgb),.45)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>

                <div>
                  <Label>Paste Job Description <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>(optional but powerful)</span></Label>
                  <textarea
                    value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                    placeholder="Paste the JD here. AI will target questions to the specific requirements listed…"
                    rows={4}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(var(--forge-rgb),.45)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>

                <div>
                  <Label>What do you want to focus on? <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>(optional)</span></Label>
                  <textarea
                    value={additionalContext} onChange={e => setAdditionalContext(e.target.value)}
                    placeholder="e.g. I struggle with system design. I want deep React hooks questions. I have a final round tomorrow at Stripe…"
                    rows={3}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(var(--forge-rgb),.45)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>

                {/* Summary */}
                <div style={{ borderRadius: 14, padding: "14px 16px", background: "var(--bg2)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, color: "var(--text3)", margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Session Summary</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[role, techStack, experience || null, interviewType || null, `${numQuestions} questions`, difficulty, dynamic ? "Dynamic mode" : null, ...focusAreas].filter(Boolean).map(t => (
                      <span key={t} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 12, padding: "10px 16px", background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: 12, color: "#f87171", fontSize: 13, textAlign: "center" }}>
              {error}
            </div>
          )}

          {/* Navigation — all type="button", no form */}
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <button
              type="button"
              onClick={() => (step === 1 ? navigate("/dashboard") : goBack())}
              style={{ padding: "12px 24px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text2)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              ← Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={step === 1 && !canNext1}
                className="bg-forge-gradient glow-blue-sm btn-press"
                style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (step === 1 && !canNext1) ? "not-allowed" : "pointer", opacity: (step === 1 && !canNext1) ? .5 : 1 }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                disabled={loading}
                className="bg-forge-gradient glow-blue btn-press"
                style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
              >
                {loading ? (
                  <>
                    <svg className="asp" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity=".25" />
                      <path fill="white" opacity=".75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Questions…
                  </>
                ) : "✦ Start Interview Session"}
              </button>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text3)", marginTop: 10 }}>
            {step === 3 ? "AI will generate personalised questions using all context above" : `Step ${step} of 3`}
          </p>
        </main>
      </div>
    </div>
  );
}
