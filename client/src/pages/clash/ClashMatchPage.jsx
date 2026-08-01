import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getClashSocket, connectClashSocket } from "../../services/clashSocket";
import api from "../../services/api";
import NavBar from "../../components/NavBar";

export default function ClashMatchPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [opponentIdx, setOpponentIdx] = useState(0);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluatingMsg, setEvaluatingMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(location.state?.durationSeconds || 540); // 9 mins default

  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (!user || !roomCode) return;

    const socket = connectClashSocket();

    // Fetch questions if missing
    if (!questions.length) {
      (async () => {
        try {
          const token = await user.getIdToken();
          const res = await api.get(`/clash/${roomCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setQuestions(res.data.questions || []);
        } catch (e) {
          console.error(e);
        }
      })();
    }

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
      setEvaluatingMsg(data.message || "Evaluating match results...");
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
  }, [user, roomCode, questions.length, navigate]);

  const handleAnswerChange = (qId, text) => {
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setEvaluatingMsg("Submitting match answers & evaluating...");

    const socket = getClashSocket();
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      answerText: answersRef.current[q.id] || "",
    }));

    socket.emit("submit_answers", {
      roomCode,
      userId: user.uid,
      answers: formattedAnswers,
    });
  }, [isSubmitting, questions, roomCode, user]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const currentQ = questions[currentIdx];

  if (evaluatingMsg) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #f43f5e", borderTopColor: "transparent", margin: "0 auto 16px" }} className="asp" />
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
            ⚔️ Clash Finished!
          </h2>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>{evaluatingMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <NavBar showLogout={false} />

        <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 80px" }}>
          {/* Top Bar: Progress & Match Timer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f43f5e", fontWeight: 700 }}>
                QUESTION {currentIdx + 1} OF {questions.length}
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
                Opponent Status: {opponentSubmitted ? "✓ Submitted All Answers!" : `Currently on Q${opponentIdx + 1}/${questions.length}`}
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

              {/* Response Textarea */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: 8 }}>
                  Your Technical Answer
                </label>
                <textarea
                  rows={7}
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Write your explanation here..."
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 16,
                    background: "var(--bg2)", border: "1px solid var(--border)",
                    color: "var(--text)", fontSize: 14, lineHeight: 1.6, resize: "vertical"
                  }}
                />
              </div>
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
                  padding: "12px 32px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #34d399, #10b981)", color: "#fff",
                  fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer"
                }}
              >
                Submit Clash Answers ⚡
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
