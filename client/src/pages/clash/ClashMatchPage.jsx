import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getClashSocket, connectClashSocket } from "../../services/clashSocket";
import api from "../../services/api";
import { useProctoring } from "../../hooks/useProctoring";
import ProctoringOverlay from "../../components/proctoring/ProctoringOverlay";
import CodeCompilerSandbox from "../../components/compiler/CodeCompilerSandbox";

export default function ClashMatchPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProctored, setIsProctored] = useState(location.state?.proctored ?? true);
  const proctoring = useProctoring(isProctored);

  const [rawQuestions, setRawQuestions] = useState(location.state?.questions || []);
  const [matchType, setMatchType] = useState(location.state?.matchType || "coding");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [opponentIdx, setOpponentIdx] = useState(0);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [evaluatingMsg, setEvaluatingMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(location.state?.durationSeconds || 540);
  const [responseMode, setResponseMode] = useState("code");
  const [loading, setLoading] = useState(!location.state?.questions?.length);
  const [testResults, setTestResults] = useState({});
  const [isEvaluatingCode, setIsEvaluatingCode] = useState(false);
  const [leftWidthPct, setLeftWidthPct] = useState(44);
  const [isDragging, setIsDragging] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Normalize questions array safely for both text interview & coding challenges
  const questions = (rawQuestions || []).map((q, idx) => {
    if (typeof q === "string") {
      try {
        if (q.startsWith("{") && q.endsWith("}")) {
          const parsed = JSON.parse(q);
          return { id: String(parsed.id || idx + 1), ...parsed };
        }
      } catch (e) {}
      return { id: String(idx + 1), title: `Problem #${idx + 1}`, question_text: q, description: q };
    }
    return {
      id: String(q.id || q.questionId || idx + 1),
      title: q.title || `Problem #${idx + 1}`,
      question_text: q.question_text || q.description || q.title || `Question ${idx + 1}`,
      description: q.description || q.question_text || "",
      inputFormat: q.inputFormat || "Standard input arguments.",
      outputFormat: q.outputFormat || "Return value.",
      sampleTestCases: q.sampleTestCases || [
        { input: "nums = [1, 2, 3]", expected: "6" }
      ],
      hiddenTestCases: q.hiddenTestCases || [],
    };
  });

  useEffect(() => {
    if (!user || !roomCode) return;

    const socket = connectClashSocket();

    // Fetch questions if missing
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await api.get(`/clash/${roomCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.questions?.length) {
          setRawQuestions(res.data.questions);
        }
        if (res.data.room) {
          if (res.data.room.proctored !== undefined) {
            setIsProctored(Boolean(res.data.room.proctored));
          }
          if (res.data.room.match_type) {
            setMatchType(res.data.room.match_type);
          }
        }

        // Check if user already submitted
        const me = res.data.participants?.find((p) => String(p.user_id) === String(user.uid));
        if (me?.status === "submitted") {
          setIsSubmitted(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();

    socket.on("opponent_progress", (data) => {
      if (String(data.userId) !== String(user.uid)) {
        setOpponentIdx(data.questionIndex);
      }
    });

    socket.on("participant_submitted", (data) => {
      if (String(data.userId) !== String(user.uid)) {
        setOpponentSubmitted(true);
      }
    });

    socket.on("evaluating_match", (data) => {
      setEvaluatingMsg(data.message || "Both candidates submitted! AI evaluating match parallely...");
    });

    socket.on("match_completed", (data) => {
      navigate(`/clash/results/${roomCode}`, { state: { result: data.result } });
    });

    // Countdown Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          doAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      socket.off("opponent_progress");
      socket.off("participant_submitted");
      socket.off("evaluating_match");
      socket.off("match_completed");
    };
  }, [user, roomCode, navigate]);

  const handleAnswerChange = (qId, text) => {
    if (!qId) return;
    setAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const socket = getClashSocket();
      socket.emit("update_progress", {
        roomCode,
        userId: user.uid,
        questionIndex: nextIdx,
      });
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const doAutoSubmit = useCallback(() => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    setIsSubmitted(true);
    setShowAbortModal(false);

    const socket = getClashSocket();
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      answerText: answersRef.current[q.id] || "",
    }));

    socket.emit("submit_answers", {
      roomCode,
      userId: user?.uid,
      answers: formattedAnswers,
    });
  }, [isSubmitting, isSubmitted, questions, roomCode, user]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const currentQ = questions[currentIdx] || questions[0] || { id: "q-0", question_text: "Loading battle question..." };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #f43f5e", borderTopColor: "transparent", margin: "0 auto 16px" }} className="asp" />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif", margin: "0 0 6px" }}>
            Connecting to 1v1 Clash Arena...
          </h3>
          <p style={{ color: "var(--text2)", fontSize: 13, margin: 0 }}>
            Fetching battle questions and sync state...
          </p>
        </div>
      </div>
    );
  }

  {/* WAITING PAGE WHEN USER HAS SUBMITTED */}
  if (isSubmitted || isSubmitting) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <NavBar onLogoClick={() => navigate("/dashboard")} />
        <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1 }}>
          <div className="glass glow-red-sm afu" style={{ borderRadius: 28, padding: 40, border: "1px solid var(--border)", textAlign: "center", maxWidth: 540, width: "100%" }}>
            
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(10,165,236,0.12)", border: "1px solid rgba(10,165,236,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #0ba5ec", borderTopColor: "transparent" }} className="asp" />
            </div>

            <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--forge)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".15em" }}>
              1v1 CODE BATTLE
            </span>

            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "8px 0 12px" }}>
              {evaluatingMsg ? "AI Code & Complexity Evaluation in Progress..." : opponentSubmitted ? "Both Candidates Submitted!" : "Code Submitted! Waiting for Opponent Result..."}
            </h2>

            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
              {evaluatingMsg || (opponentSubmitted ? "Evaluating both code submissions for algorithmic correctness, time complexity, and efficiency..." : "Your code solutions have been submitted successfully. Waiting for your opponent to finish so the AI can declare the winner!")}
            </p>

            {/* Live Status Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
              {/* Your Status */}
              <div style={{ padding: "14px 18px", borderRadius: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 700, display: "block" }}>Your Submission</span>
                  <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>All questions answered & locked</span>
                </div>
                <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "#10b981", color: "#fff", fontWeight: 800, fontFamily: "monospace" }}>
                  ✓ SUBMITTED
                </span>
              </div>

              {/* Opponent Live Status & Progress */}
              <div style={{ padding: "16px 18px", borderRadius: 16, background: opponentSubmitted ? "rgba(16,185,129,0.08)" : "rgba(11,165,236,0.08)", border: opponentSubmitted ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(11,165,236,0.3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 700, display: "block" }}>Opponent Status</span>
                    <span style={{ fontSize: 11, color: opponentSubmitted ? "#10b981" : "var(--forge)", fontWeight: 600 }}>
                      {opponentSubmitted ? "✓ Submitted All Answers!" : `Currently working on Question ${opponentIdx + 1} of ${questions.length}`}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: opponentSubmitted ? "#10b981" : "#0ba5ec", color: "#fff", fontWeight: 800, fontFamily: "monospace" }}>
                    {opponentSubmitted ? "✓ SUBMITTED" : `ON Q${opponentIdx + 1}/${questions.length}`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: "100%", height: 6, background: "var(--bg3)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: opponentSubmitted ? "#10b981" : "#0ba5ec", width: `${((opponentIdx + 1) / (questions.length || 1)) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-press"
                style={{
                  padding: "10px 24px",
                  borderRadius: 12,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text2)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Exit to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <NavBar onLogoClick={() => setShowAbortModal(true)} />
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Proctoring Overlay */}
        {isProctored && <ProctoringOverlay proctoring={proctoring} />}

        {/* Abort / Exit Challenge Confirmation Modal */}
        {showAbortModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="glass glow-red-sm afu" style={{ borderRadius: 24, padding: 32, maxWidth: 440, width: "100%", border: "1px solid var(--border)", textAlign: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "var(--red)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>

              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
                Exit 1v1 Challenge?
              </h3>
              <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.5, margin: "0 0 24px" }}>
                Are you sure you want to exit the challenge? Your current code solutions will be submitted immediately for evaluation.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAbortModal(false)}
                  className="btn-press"
                  style={{
                    flex: 1,
                    padding: "11px 18px",
                    borderRadius: 12,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doAutoSubmit}
                  className="btn-press"
                  style={{
                    flex: 1,
                    padding: "11px 18px",
                    borderRadius: 12,
                    background: "var(--red)",
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
                  }}
                >
                  Exit & Submit
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Dedicated 1v1 Code Battle Arena Layout when matchType === "coding" */}
        {matchType === "coding" ? (
          <div style={{ display: "flex", flex: 1, height: "calc(100vh - 61px)", overflow: "hidden" }}>
            {/* Left Panel: Problem Statement, Test Cases, and Run Results */}
            <div
              style={{
                width: `${leftWidthPct}%`,
                height: "100%",
                overflowY: "auto",
                borderRight: "1px solid var(--border)",
                padding: "20px 24px 40px",
                background: "var(--surface)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Question Navigation Tabs & Header Controls */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12, gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionSwitch(idx)}
                      className="btn-press"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: currentIdx === idx ? "none" : "1px solid var(--border)",
                        background: currentIdx === idx ? "var(--forge)" : "var(--bg2)",
                        color: currentIdx === idx ? "#fff" : "var(--text2)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Q{idx + 1}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text2)", fontWeight: 700 }}>
                    ⏳ {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAbortModal(true)}
                    className="btn-press"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#f87171",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Exit Challenge
                  </button>
                </div>
              </div>

              {/* Header Title & Difficulty */}
              {currentQ && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--forge)", fontWeight: 800, textTransform: "uppercase" }}>
                      QUESTION {currentIdx + 1} OF {questions.length}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                      {currentQ.difficulty || "Medium"}
                    </span>
                  </div>

                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                    {currentQ.title || `Problem #${currentIdx + 1}`}
                  </h2>

                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: 0 }}>
                    {currentQ.description || currentQ.question_text}
                  </p>

                  {/* Input / Output Formats */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, borderRadius: 14, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 12, color: "var(--text)" }}>
                      <strong style={{ color: "var(--forge)" }}>Input Format:</strong> {currentQ.inputFormat}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text)" }}>
                      <strong style={{ color: "#10b981" }}>Output Format:</strong> {currentQ.outputFormat}
                    </div>
                  </div>

                  {/* Sample Test Cases */}
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8, fontFamily: "Syne, sans-serif" }}>
                      Sample Test Cases
                    </h4>
                    {(currentQ.sampleTestCases || []).map((tc, idx) => (
                      <div key={idx} style={{ padding: 10, borderRadius: 10, background: "var(--bg2)", border: "1px solid var(--border)", marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text2)" }}>
                          Input: <span style={{ color: "var(--forge)" }}>{tc.input}</span>
                        </div>
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text2)", marginTop: 2 }}>
                          Expected: <span style={{ color: "#10b981" }}>{tc.expected}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right Panel: Live Code Compiler IDE */}
            <div style={{ width: `${100 - leftWidthPct}%`, height: "100%", paddingLeft: 8 }}>
              {currentQ && (
                <CodeCompilerSandbox
                  initialLanguage="javascript"
                  defaultCode={answers[currentQ.id] || ""}
                  onCodeChange={(newCode) => handleAnswerChange(currentQ.id, newCode)}
                  onSubmitSolution={(newCode) => handleAnswerChange(currentQ.id, newCode)}
                />
              )}
            </div>
          </div>
        ) : (
          /* Standard Voice Interview Layout when matchType === "interview" */
          <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 80px" }}>
            {/* Top Bar: Progress, Timer, and Abort Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f43f5e", fontWeight: 700 }}>
                  QUESTION {currentIdx + 1} OF {questions.length || 1}
                </span>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                  1v1 Head-to-Head Clash
                </h2>
              </div>

              {/* Timer & Abort Control Bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ padding: "8px 16px", borderRadius: 14, background: timeLeft < 60 ? "rgba(248,113,113,0.15)" : "var(--bg2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>⏳</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 18, color: timeLeft < 60 ? "#f87171" : "var(--text)" }}>
                    {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAbortModal(true)}
                  className="btn-press"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 14,
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#f87171",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  🛑 End Challenge
                </button>
              </div>
            </div>

            {/* Opponent Progress Bar */}
            <div className="glass" style={{ borderRadius: 16, padding: "12px 18px", border: "1px solid var(--border)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>⚔️</span>
                <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>
                  Opponent Status: {opponentSubmitted ? "✓ Submitted All Answers!" : `Currently on Q${opponentIdx + 1}/${questions.length || 1}`}
                </span>
              </div>
              <div style={{ width: 120, height: 6, background: "var(--bg3)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#f43f5e", width: `${((opponentIdx + 1) / (questions.length || 1)) * 100}%`, transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Question Box */}
            {currentQ && (
              <div className="glass glow-red-sm" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)", marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                  QUESTION {currentIdx + 1}
                </span>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "8px 0 16px", lineHeight: 1.5 }}>
                  {currentQ.question_text}
                </h3>

                {/* Response Input */}
                <textarea
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Type your structured solution and explanation..."
                  rows={7}
                  style={{
                    width: "100%", borderRadius: 14, padding: 16, background: "var(--bg)",
                    border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, lineHeight: 1.6,
                    resize: "vertical", outline: "none"
                  }}
                />
              </div>
            )}

            {/* Bottom Nav Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="btn-press"
                style={{
                  padding: "10px 20px", borderRadius: 12, border: "1px solid var(--border)",
                  background: "var(--surface)", color: "var(--text2)", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  opacity: currentIdx === 0 ? 0.5 : 1
                }}
              >
                ← Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="btn-press"
                  style={{
                    padding: "10px 24px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff",
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer"
                  }}
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={() => setShowAbortModal(true)}
                  disabled={isSubmitting}
                  className="btn-press glow-red-sm"
                  style={{
                    padding: "10px 28px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff",
                    fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer"
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit All Answers 🚀"}
                </button>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
