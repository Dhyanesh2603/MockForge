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
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [opponentIdx, setOpponentIdx] = useState(0);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluatingMsg, setEvaluatingMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(location.state?.durationSeconds || 540);
  const [responseMode, setResponseMode] = useState("text");
  const [loading, setLoading] = useState(!location.state?.questions?.length);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Normalize questions array to handle string arrays or object structures safely
  const questions = (rawQuestions || []).map((q, idx) => {
    if (typeof q === "string") {
      return { id: `q-${idx}`, question_text: q };
    }
    return {
      id: q.id || q.questionId || `q-${idx}`,
      question_text: q.question_text || q.questionText || q.text || (typeof q === "object" ? JSON.stringify(q) : `Question ${idx + 1}`),
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
        if (res.data.room && res.data.room.proctored !== undefined) {
          setIsProctored(Boolean(res.data.room.proctored));
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
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
        <div className="glass glow-red-sm afu" style={{ borderRadius: 28, padding: 40, border: "1px solid var(--border)", textAlign: "center", maxWidth: 540, width: "100%", position: "relative", zIndex: 1 }}>
          
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 26 }}>
            {evaluatingMsg ? "🤖" : opponentSubmitted ? "⚔️" : "⏳"}
          </div>

          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f43f5e", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".15em" }}>
            1v1 CLASH ARENA
          </span>

          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "8px 0 12px" }}>
            {evaluatingMsg ? "AI Parallel Evaluation in Progress..." : opponentSubmitted ? "Both Candidates Submitted!" : "Waiting for Opponent to Finish..."}
          </h2>

          <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
            {evaluatingMsg || (opponentSubmitted ? "Evaluating both candidates parallely for technical accuracy and depth..." : "Your solutions have been recorded cleanly. You will automatically transition to results as soon as your opponent submits!")}
          </p>

          {/* Live Status Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
            {/* Candidate Status */}
            <div style={{ padding: "14px 18px", borderRadius: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>👤</span>
                <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 700 }}>Your Status</span>
              </div>
              <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "#10b981", color: "#fff", fontWeight: 800, fontFamily: "monospace" }}>
                ✓ SUBMITTED
              </span>
            </div>

            {/* Opponent Status */}
            <div style={{ padding: "14px 18px", borderRadius: 16, background: opponentSubmitted ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)", border: opponentSubmitted ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(244,63,94,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>⚔️</span>
                <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 700 }}>Opponent Status</span>
              </div>
              <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: opponentSubmitted ? "#10b981" : "#f43f5e", color: "#fff", fontWeight: 800, fontFamily: "monospace" }}>
                {opponentSubmitted ? "✓ SUBMITTED" : `ON Q${opponentIdx + 1}/${questions.length || 1}`}
              </span>
            </div>
          </div>

          {/* Loading Indicator */}
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text3)", fontSize: 12, fontFamily: "monospace" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #f43f5e", borderTopColor: "transparent" }} className="asp" />
            <span>{evaluatingMsg ? "Running parallel AI score analysis..." : "Syncing live opponent state..."}</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Proctoring Overlay */}
        {isProctored && <ProctoringOverlay proctoring={proctoring} />}

        <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 80px" }}>
          {/* Top Bar: Progress & Match Timer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f43f5e", fontWeight: 700 }}>
                QUESTION {currentIdx + 1} OF {questions.length || 1}
              </span>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                1v1 Head-to-Head Clash
              </h2>
            </div>

            {/* Timer */}
            <div style={{ padding: "8px 16px", borderRadius: 14, background: timeLeft < 60 ? "rgba(248,113,113,0.15)" : "var(--bg2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>⏳</span>
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 18, color: timeLeft < 60 ? "#f87171" : "var(--text)" }}>
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
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

              {/* Response Mode Selector */}
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => setResponseMode("text")}
                  style={{
                    padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: responseMode === "text" ? "none" : "1px solid var(--border)",
                    background: responseMode === "text" ? "#f43f5e" : "var(--surface)",
                    color: responseMode === "text" ? "#fff" : "var(--text2)",
                  }}
                >
                  📝 Text Explanation
                </button>
                <button
                  type="button"
                  onClick={() => setResponseMode("code")}
                  style={{
                    padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: responseMode === "code" ? "none" : "1px solid var(--border)",
                    background: responseMode === "code" ? "#f43f5e" : "var(--surface)",
                    color: responseMode === "code" ? "#fff" : "var(--text2)",
                  }}
                >
                  💻 Code Sandbox
                </button>
              </div>

              {/* Response Input */}
              {responseMode === "text" ? (
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
              ) : (
                <div style={{ height: 380 }}>
                  <CodeCompilerSandbox
                    initialLanguage="javascript"
                    defaultCode={answers[currentQ.id] || ""}
                    onCodeChange={(newCode) => handleAnswerChange(currentQ.id, newCode)}
                    onSubmitSolution={(newCode) => handleAnswerChange(currentQ.id, newCode)}
                  />
                </div>
              )}
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
                onClick={doAutoSubmit}
                disabled={isSubmitting}
                className="btn-press glow-red-sm"
                style={{
                  padding: "10px 28px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #f43f5e, #be123c)", color: "#fff",
                  fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer"
                }}
              >
                {isSubmitting ? "Submitting..." : "Finish Battle & Submit ⚔️"}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
