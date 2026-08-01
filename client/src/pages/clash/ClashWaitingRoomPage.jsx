import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { connectClashSocket, getClashSocket } from "../../services/clashSocket";
import api from "../../services/api";
import NavBar from "../../components/NavBar";

export default function ClashWaitingRoomPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    if (!user || !roomCode) return;

    let socket = null;

    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await api.get(`/clash/${roomCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRoom(res.data.room);
        setParticipants(res.data.participants || []);
        setQuestions(res.data.questions || []);
        setLoading(false);

        // Connect Socket.io
        socket = connectClashSocket();

        socket.emit("join_room", {
          roomCode,
          userId: user.uid,
          userName: user.displayName || user.email?.split("@")[0] || "Candidate",
          userPicture: user.photoURL || "",
        });

        socket.on("room_updated", (data) => {
          if (data.room) setRoom(data.room);
          if (data.participants) setParticipants(data.participants);
          if (data.questions) setQuestions(data.questions);

          // Find current user ready state
          const me = data.participants?.find((p) => String(p.user_id) === String(user.uid));
          if (me) {
            setIsReady(me.status === "ready");
          }
        });

        socket.on("match_started", (data) => {
          let count = 3;
          setCountdown(count);
          const interval = setInterval(() => {
            count -= 1;
            if (count > 0) {
              setCountdown(count);
            } else {
              clearInterval(interval);
              navigate(`/clash/match/${roomCode}`, { state: { questions: data.questions, durationSeconds: data.durationSeconds } });
            }
          }, 1000);
        });
      } catch (err) {
        console.error("Fetch Room Details Error:", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (socket) {
        socket.off("room_updated");
        socket.off("match_started");
      }
    };
  }, [user, roomCode, navigate]);

  const toggleReady = () => {
    const socket = getClashSocket();
    const nextState = !isReady;
    setIsReady(nextState);
    socket.emit("toggle_ready", {
      roomCode,
      userId: user.uid,
      ready: nextState,
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #f43f5e", borderTopColor: "transparent", margin: "0 auto 12px" }} className="asp" />
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Connecting to Clash Lobby...</p>
        </div>
      </div>
    );
  }

  const hostUser = participants.find((p) => String(p.user_id) === String(room?.host_user_id));
  const guestUser = participants.find((p) => String(p.user_id) !== String(room?.host_user_id));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bg-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <NavBar showLogout={false} onLogoClick={() => setShowExitModal(true)} />

        <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* Room Banner */}
          <div className="glass glow-red-sm" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)", textAlign: "center", marginBottom: 28 }}>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#f43f5e", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" }}>
              MATCH LOBBY · {room?.difficulty?.toUpperCase()}
            </span>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "8px 0 4px" }}>
              {room?.role}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 20px" }}>
              Tech Stack: {room?.tech_stack} · {questions.length} Questions
            </p>

            {/* Room Code Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 14, background: "var(--bg2)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>ROOM CODE:</span>
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 18, color: "#f43f5e", letterSpacing: ".1em" }}>{roomCode}</span>
              <button
                onClick={copyRoomCode}
                className="btn-press"
                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "var(--surface)", color: "var(--text2)", fontSize: 12, cursor: "pointer" }}
              >
                {copied ? "Copied! ✓" : "Copy Code 📋"}
              </button>
            </div>

            {/* Exit Room Top Action */}
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => setShowExitModal(true)}
                className="btn-press"
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Exit Room
              </button>
            </div>
          </div>

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div style={{
              borderRadius: 20, padding: 20, background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff",
              textAlign: "center", marginBottom: 28, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22
            }}>
              🚀 BOTH PLAYERS READY! Starting in {countdown}...
            </div>
          )}

          {/* Player Roster Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            {/* Player 1 (Host) */}
            <div className="glass" style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #38bdf8, #0284c7)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 700 }}>
                {hostUser?.user_name?.charAt(0)?.toUpperCase() || "H"}
              </div>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(56,189,248,0.15)", color: "#38bdf8", fontWeight: 700 }}>HOST</span>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "8px 0 4px" }}>
                {hostUser?.user_name || "Waiting for host..."}
              </h3>
              <span style={{ fontSize: 12, fontWeight: 600, color: hostUser?.status === "ready" ? "#34d399" : "var(--text3)" }}>
                {hostUser?.status === "ready" ? "✓ READY" : "⏳ Joined (Not Ready)"}
              </span>
            </div>

            {/* Player 2 (Guest) */}
            <div className="glass" style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: guestUser ? "linear-gradient(135deg, #f43f5e, #be123c)" : "var(--bg3)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 700 }}>
                {guestUser ? guestUser.user_name?.charAt(0)?.toUpperCase() : "?"}
              </div>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontWeight: 700 }}>CHALLENGER</span>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: guestUser ? "var(--text)" : "var(--text3)", margin: "8px 0 4px" }}>
                {guestUser?.user_name || "Waiting for opponent..."}
              </h3>
              <span style={{ fontSize: 12, fontWeight: 600, color: guestUser?.status === "ready" ? "#34d399" : "var(--text3)" }}>
                {guestUser ? (guestUser.status === "ready" ? "✓ READY" : "⏳ Joined (Not Ready)") : "Share room code to invite"}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={toggleReady}
              disabled={participants.length < 2 || countdown !== null}
              className="btn-press"
              style={{
                padding: "14px 40px", borderRadius: 16, border: "none",
                background: isReady ? "var(--surface)" : "linear-gradient(135deg, #34d399, #10b981)",
                color: isReady ? "var(--text)" : "#fff",
                fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer"
              }}
            >
              {participants.length < 2
                ? "Waiting for 2nd Player to Join..."
                : isReady
                ? "✓ You are Ready! (Click to cancel)"
                : "⚡ Click to Set READY"}
            </button>
          </div>
        </main>

        {/* ── EXIT ROOM CONFIRMATION MODAL ── */}
        {showExitModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              className="glass afu"
              style={{
                width: "100%",
                maxWidth: 420,
                borderRadius: 24,
                padding: 28,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                textAlign: "center",
              }}
            >
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

              <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "Syne, sans-serif" }}>
                Exit 1v1 Room?
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
                Are you sure you want to leave this room?
              </p>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowExitModal(false)}
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
                  onClick={() => navigate("/clash")}
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
                  Exit Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
