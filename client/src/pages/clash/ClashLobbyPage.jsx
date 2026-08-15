import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, AlertTriangle, Swords, ShieldCheck, Unlock, Key, Lightbulb } from "lucide-react";
import MotionIcon from "../../components/common/MotionIcon";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NavBar from "../../components/NavBar";

export default function ClashLobbyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Create Room state
  const [role, setRole] = useState("Frontend Developer");
  const [techStack, setTechStack] = useState("React, JavaScript, CSS");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(3);
  const [proctored, setProctored] = useState(true);
  const [matchType, setMatchType] = useState("coding"); // "interview" | "coding"
  const [creating, setCreating] = useState(false);

  // Join Room state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const res = await api.post(
        "/clash/create",
        { role, techStack, difficulty, numQuestions, proctored, matchType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const roomCode = res.data.roomCode;
      navigate(`/clash/room/${roomCode}`);
    } catch (err) {
      console.error("Create Room Error:", err);
      setError(err.response?.data?.message || "Failed to create clash room.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim() || !user) return;
    setJoining(true);
    setError("");

    const formattedCode = joinCode.trim().toUpperCase().startsWith("CLASH-")
      ? joinCode.trim().toUpperCase()
      : `CLASH-${joinCode.trim().toUpperCase()}`;

    try {
      const token = await user.getIdToken();
      const res = await api.get(`/clash/${formattedCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.room) {
        navigate(`/clash/room/${formattedCode}`);
      }
    } catch (err) {
      console.error("Join Room Error:", err);
      setError(err.response?.data?.message || "Invalid room code or room not found.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <NavBar showLogout={true} />

        <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#f43f5e", textTransform: "uppercase", letterSpacing: ".15em", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MotionIcon icon={Zap} size={14} color="#f43f5e" animate="pulse" /> REAL-TIME MULTIPLAYER
            </span>
            <h1 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
              background: "linear-gradient(135deg, #f43f5e, #fb7185, #fda4af)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "10px 0 12px", lineHeight: 1.1
            }}>
              1v1 Interview Clash
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              Challenge a friend to a live head-to-head interview. Both get the same questions — AI evaluates who performed best!
            </p>
          </div>

          {error && (
            <div style={{
              padding: "12px 18px", borderRadius: 14, background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: 14,
              marginBottom: 24, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              <MotionIcon icon={AlertTriangle} size={16} color="#f87171" animate="bounce" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Create Room Card */}
            <div className="glass glow-red-sm" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <MotionIcon icon={Swords} size={24} color="#f43f5e" animate="hover" />
                <div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                    Create a Match
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>Set rules & invite a friend</p>
                </div>
              </div>

              <form onSubmit={handleCreateRoom} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Clash Match Mode Selector */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", display: "block", marginBottom: 6 }}>
                    Clash Match Mode
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setMatchType("coding")}
                      className="btn-press"
                      style={{
                        padding: "10px",
                        borderRadius: 10,
                        border: matchType === "coding" ? "none" : "1px solid var(--border)",
                        background: matchType === "coding" ? "linear-gradient(135deg, #0ba5ec, #0284c7)" : "var(--bg2)",
                        color: matchType === "coding" ? "#fff" : "var(--text2)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      1v1 Code
                    </button>

                    <button
                      type="button"
                      onClick={() => setMatchType("interview")}
                      className="btn-press"
                      style={{
                        padding: "10px",
                        borderRadius: 10,
                        border: matchType === "interview" ? "none" : "1px solid var(--border)",
                        background: matchType === "interview" ? "var(--forge)" : "var(--bg2)",
                        color: matchType === "interview" ? "#fff" : "var(--text2)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Interview
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: 6 }}>
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    placeholder="e.g. Fullstack Engineer"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 12,
                      background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: 6 }}>
                    Tech Stack / Topics
                  </label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    required
                    placeholder="e.g. Node.js, PostgreSQL, System Design"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 12,
                      background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: 6 }}>
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12,
                        background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14
                      }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: 6 }}>
                      Questions
                    </label>
                    <select
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12,
                        background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14
                      }}
                    >
                      <option value={1}>1 Question (Quick Duel)</option>
                      <option value={2}>2 Questions</option>
                      <option value={3}>3 Questions (Standard)</option>
                      <option value={4}>4 Questions</option>
                      <option value={5}>5 Questions (Extended)</option>
                      <option value={7}>7 Questions</option>
                      <option value={10}>10 Questions (Marathon)</option>
                    </select>
                  </div>
                </div>

                {/* Session Mode Selector */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: 6 }}>
                    Session Mode
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setProctored(true)}
                      style={{
                        padding: "10px 8px", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 700,
                        border: proctored ? "1px solid #34d399" : "1px solid var(--border)",
                        background: proctored ? "rgba(52,211,153,0.12)" : "var(--bg2)",
                        color: proctored ? "#34d399" : "var(--text2)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4
                      }}
                    >
                      <MotionIcon icon={ShieldCheck} size={14} color="#34d399" /> Proctored
                    </button>
                    <button
                      type="button"
                      onClick={() => setProctored(false)}
                      style={{
                        padding: "10px 8px", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 700,
                        border: !proctored ? "1px solid #f43f5e" : "1px solid var(--border)",
                        background: !proctored ? "rgba(244,63,94,0.12)" : "var(--bg2)",
                        color: !proctored ? "#f43f5e" : "var(--text2)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4
                      }}
                    >
                      <MotionIcon icon={Unlock} size={14} color="#f43f5e" /> Unproctored
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="btn-press"
                  style={{
                    marginTop: 8, padding: "12px", borderRadius: 14, border: "none",
                    background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff",
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer"
                  }}
                >
                  {creating ? "Generating Match Room..." : "Create Clash Room →"}
                </button>
              </form>
            </div>

            {/* Join Room Card */}
            <div className="glass" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <MotionIcon icon={Key} size={24} color="var(--forge)" animate="hover" />
                  <div>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                      Join Match
                    </h2>
                    <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>Have an invite room code?</p>
                  </div>
                </div>

                <form onSubmit={handleJoinRoom} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: 6 }}>
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      required
                      placeholder="e.g. CLASH-89A2 or 89A2"
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 12,
                        background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)",
                        fontSize: 16, fontFamily: "monospace", letterSpacing: ".1em", textTransform: "uppercase"
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={joining || !joinCode.trim()}
                    className="btn-press"
                    style={{
                      padding: "12px", borderRadius: 14, border: "1px solid var(--border)",
                      background: "var(--surface)", color: "var(--text)",
                      fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer"
                    }}
                  >
                    {joining ? "Joining Room..." : "Enter Room →"}
                  </button>
                </form>
              </div>

              {/* Tips */}
              <div style={{ padding: "14px 16px", borderRadius: 16, background: "var(--bg3)", border: "1px solid var(--border)", marginTop: 24 }}>
                <p style={{ fontSize: 12, color: "var(--text2)", margin: 0, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                  <MotionIcon icon={Lightbulb} size={14} color="var(--forge)" />
                  <span><strong>How it works:</strong> Both candidates get the exact same AI questions at the same time. The AI evaluates depth, accuracy, and clarity to declare a winner!</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
