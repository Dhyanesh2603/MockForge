import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Swords, Handshake, Crown, Trophy } from "lucide-react";
import MotionIcon from "../../components/common/MotionIcon";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavBar from "../../components/NavBar";

/* ── Comparative Radar Chart ── */
function DualRadar({ p1Scores, p2Scores, p1Name, p2Name }) {
  const labels = ["Technical", "Communication", "Clarity"];
  const v1 = labels.map((_, i) => (p1Scores[i] || 0) / 100);
  const v2 = labels.map((_, i) => (p2Scores[i] || 0) / 100);
  const cx = 110, cy = 110, R = 80;
  const a = (i) => (i / labels.length) * 2 * Math.PI - Math.PI / 2;
  const pt = (i, r) => [cx + r * Math.cos(a(i)), cy + r * Math.sin(a(i))];
  const poly = (pts) => pts.map((p) => p.join(",")).join(" ");

  const pts1 = v1.map((v, i) => pt(i, v * R));
  const pts2 = v2.map((v, i) => pt(i, v * R));

  return (
    <div>
      <svg viewBox="0 0 220 220" width="100%" style={{ maxWidth: 220, display: "block", margin: "0 auto" }}>
        {[0.25, 0.5, 0.75, 1].map((l) => (
          <polygon key={l} points={poly(labels.map((_, i) => pt(i, l * R)))} fill="none" stroke="var(--border)" strokeWidth="1" />
        ))}
        {labels.map((_, i) => {
          const [x, y] = pt(i, R);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
        })}
        {/* Player 1 (Blue) */}
        <polygon points={poly(pts1)} fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="2" />
        {/* Player 2 (Red) */}
        <polygon points={poly(pts2)} fill="rgba(244,63,94,0.2)" stroke="#f43f5e" strokeWidth="2" />
        {labels.map((l, i) => {
          const [x, y] = pt(i, R + 16);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--text3)" fontFamily="DM Sans,sans-serif">
              {l}
            </text>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#38bdf8" }} />
          <span>{p1Name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f43f5e" }} />
          <span>{p2Name}</span>
        </div>
      </div>
    </div>
  );
}

export default function ClashResultPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [matchData, setMatchData] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!matchData);

  useEffect(() => {
    if (matchData) {
      setLoading(false);
      return;
    }
    if (!user || !roomCode) return;

    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await api.get(`/clash/${roomCode}/result`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatchData(res.data.result);
      } catch (err) {
        console.error("Fetch Clash Result Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [matchData, user, roomCode]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #f43f5e", borderTopColor: "transparent", margin: "0 auto 12px" }} className="asp" />
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Loading match report...</p>
        </div>
      </div>
    );
  }

  const players = matchData?.players || [];
  const p1 = players[0] || { userName: "Candidate A", evaluation: { overallScore: 0 } };
  const p2 = players[1] || { userName: "Candidate B", evaluation: { overallScore: 0 } };

  const winnerId = matchData?.winnerUserId;
  const isTie = !winnerId;
  const isMeWinner = String(user?.uid) === String(winnerId);

  const p1Score = p1.evaluation?.overallScore || 0;
  const p2Score = p2.evaluation?.overallScore || 0;

  const questions = matchData?.questions || [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <NavBar showLogout={false} />

        <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 80px" }}>
          {/* Winner Banner */}
          <div className="glass glow-red-sm" style={{ borderRadius: 28, padding: 32, border: "1px solid var(--border)", textAlign: "center", marginBottom: 32 }}>
            <div style={{ marginBottom: 12 }}>
              <MotionIcon icon={isTie ? Handshake : isMeWinner ? Crown : Trophy} size={44} color={isTie ? "#fbbf24" : isMeWinner ? "#eab308" : "#f43f5e"} animate="bounce" />
            </div>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#f43f5e", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".15em" }}>
              MATCH RESULT
            </span>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 800, color: "var(--text)", margin: "8px 0 12px" }}>
              {isTie ? "It's a Tie Match!" : String(winnerId) === String(p1.userId) ? `${p1.userName} Wins!` : `${p2.userName} Wins!`}
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 15, margin: "0 0 16px" }}>
              {isTie ? "Both candidates delivered equal performances." : `${isMeWinner ? "Congratulations! You outperformed your opponent." : "Great effort! Practice more to top the next clash."}`}
            </p>

            {/* AI Winner Rationale Banner */}
            {matchData?.winnerRationale && (
              <div style={{ marginTop: 14, padding: "12px 18px", borderRadius: 14, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", maxWidth: 640, margin: "14px auto 0" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--forge)", fontFamily: "monospace", textTransform: "uppercase" }}>
                  AI WINNER DECISION RATIONALE
                </span>
                <p style={{ fontSize: 13, color: "var(--text)", margin: "4px 0 0", lineHeight: 1.6, fontWeight: 600 }}>
                  "{matchData.winnerRationale}"
                </p>
              </div>
            )}

            {/* Score Comparison Pods */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 540, margin: "24px auto 0" }}>
              {/* Player 1 Pod */}
              <div style={{
                padding: "20px", borderRadius: 20, background: String(winnerId) === String(p1.userId) ? "rgba(56,189,248,0.12)" : "var(--bg2)",
                border: String(winnerId) === String(p1.userId) ? "2px solid #38bdf8" : "1px solid var(--border)", textAlign: "center"
              }}>
                <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 700 }}>{p1.userName}</span>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text)", margin: "4px 0" }}>
                  {p1Score}
                </div>
                <span style={{ fontSize: 11, color: "var(--text3)", display: "block" }}>Overall Score</span>
                
                {p1.evaluation?.timeComplexity && (
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "rgba(56,189,248,0.15)", color: "#38bdf8", fontFamily: "monospace" }}>
                      Time: {p1.evaluation.timeComplexity}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#10b981", fontFamily: "monospace" }}>
                      Space: {p1.evaluation.spaceComplexity}
                    </span>
                  </div>
                )}
              </div>

              {/* Player 2 Pod */}
              <div style={{
                padding: "20px", borderRadius: 20, background: String(winnerId) === String(p2.userId) ? "rgba(244,63,94,0.12)" : "var(--bg2)",
                border: String(winnerId) === String(p2.userId) ? "2px solid #f43f5e" : "1px solid var(--border)", textAlign: "center"
              }}>
                <span style={{ fontSize: 12, color: "#f43f5e", fontWeight: 700 }}>{p2.userName}</span>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text)", margin: "4px 0" }}>
                  {p2Score}
                </div>
                <span style={{ fontSize: 11, color: "var(--text3)", display: "block" }}>Overall Score</span>

                {p2.evaluation?.timeComplexity && (
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontFamily: "monospace" }}>
                      Time: {p2.evaluation.timeComplexity}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#10b981", fontFamily: "monospace" }}>
                      Space: {p2.evaluation.spaceComplexity}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Radar */}
          <div className="glass" style={{ borderRadius: 24, padding: 24, border: "1px solid var(--border)", marginBottom: 32 }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", textAlign: "center", margin: "0 0 16px" }}>
              Side-by-Side Skill Radar
            </h3>
            <DualRadar
              p1Scores={[p1.evaluation?.technicalScore || 0, p1.evaluation?.communicationScore || 0, p1.evaluation?.clarityScore || 0]}
              p2Scores={[p2.evaluation?.technicalScore || 0, p2.evaluation?.communicationScore || 0, p2.evaluation?.clarityScore || 0]}
              p1Name={p1.userName}
              p2Name={p2.userName}
            />
          </div>

          {/* Per-Question Side-by-Side Answer Comparison */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
              Per-Question Comparative Breakdown
            </h3>

            {questions.map((q, i) => {
              const q1Score = p1.evaluation?.questionScores?.[i] ?? 0;
              const q2Score = p2.evaluation?.questionScores?.[i] ?? 0;

              return (
                <div key={q.id || i} className="glass" style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f43f5e", fontWeight: 700 }}>
                    QUESTION {i + 1}
                  </span>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "6px 0 16px" }}>
                    {q.question_text}
                  </h4>

                  {/* Side by Side Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Player 1 Card */}
                    <div style={{ padding: 16, borderRadius: 16, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 700 }}>{p1.userName}</span>
                        <span style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: q1Score >= 75 ? "#34d399" : q1Score >= 50 ? "#fbbf24" : "#f87171" }}>
                          {q1Score}/100
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text3)", margin: "0 0 4px", fontWeight: 600 }}>Critique</p>
                      <p style={{ fontSize: 13, color: "var(--text2)", margin: 0, lineHeight: 1.5 }}>
                        {p1.evaluation?.questionCritiques?.[i] || "No critique available."}
                      </p>
                    </div>

                    {/* Player 2 Card */}
                    <div style={{ padding: 16, borderRadius: 16, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#f43f5e", fontWeight: 700 }}>{p2.userName}</span>
                        <span style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: q2Score >= 75 ? "#34d399" : q2Score >= 50 ? "#fbbf24" : "#f87171" }}>
                          {q2Score}/100
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text3)", margin: "0 0 4px", fontWeight: 600 }}>Critique</p>
                      <p style={{ fontSize: 13, color: "var(--text2)", margin: 0, lineHeight: 1.5 }}>
                        {p2.evaluation?.questionCritiques?.[i] || "No critique available."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            <button onClick={() => navigate("/dashboard")} className="btn-press"
              style={{ padding: "11px 22px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text2)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              ← Dashboard
            </button>
            <Link to="/clash" className="btn-press glow-red-sm"
              style={{ padding: "11px 22px", borderRadius: 12, background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
              Play Another Clash <MotionIcon icon={Swords} size={16} animate="hover" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
