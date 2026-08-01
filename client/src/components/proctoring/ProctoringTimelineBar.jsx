import React, { useState } from "react";

/**
 * ProctoringTimelineBar — Interactive Session Incident Timeline Scrubber
 * Visualizes tab switches, camera covers, light bleaching, eye gaze, and audio incidents
 * across a 0:00 - 30:00 session timeline bar.
 */
export default function ProctoringTimelineBar({ incidents = [], totalDurationMinutes = 30 }) {
  const [hoveredIncident, setHoveredIncident] = useState(null);

  if (!incidents || incidents.length === 0) {
    return (
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 16,
          background: "rgba(52,211,153,0.06)",
          border: "1px solid rgba(52,211,153,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>🎬</span>
        <div>
          <h4 style={{ margin: 0, fontSize: 14, color: "var(--text)", fontWeight: 600 }}>
            Session Timeline Audit: 100% Clean Session
          </h4>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text3)" }}>
            Zero proctoring incidents or tab switches recorded across the session timeline.
          </p>
        </div>
      </div>
    );
  }

  // Incident Type Color Map
  const colorMap = {
    TAB_SWITCH: "#f43f5e",
    DISQUALIFIED_TAB_SWITCH: "#e11d48",
    CAMERA_COVERED: "#a855f7",
    LIGHT_BLEACHING: "#fbbf24",
    FACE_MISSING: "#ec4899",
    MULTIPLE_FACES: "#f97316",
    GAZE_AWAY: "#3b82f6",
    AUDIO_BURST: "#06b6d4",
    AUDIO_SPEECH: "#10b981",
  };

  // Convert timestamp HH:MM:SS string or index into percentage position on 0-100 timeline
  const parseTimestampPercent = (timestamp, idx) => {
    if (!timestamp) return (idx / incidents.length) * 90 + 5;
    const parts = timestamp.split(":");
    if (parts.length >= 2) {
      const mins = parseInt(parts[parts.length - 2], 10) || 0;
      const secs = parseInt(parts[parts.length - 1], 10) || 0;
      const totalSecs = (mins % totalDurationMinutes) * 60 + secs;
      return Math.min(95, Math.max(5, (totalSecs / (totalDurationMinutes * 60)) * 100));
    }
    return (idx / incidents.length) * 90 + 5;
  };

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 18,
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        marginTop: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🎬</span>
          <h4 style={{ margin: 0, fontSize: 14, color: "var(--text)", fontWeight: 700, fontFamily: "Syne, sans-serif" }}>
            Proctoring Incident Timeline Scrubber
          </h4>
        </div>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text3)" }}>
          {incidents.length} Incident{incidents.length > 1 ? "s" : ""} Recorded
        </span>
      </div>

      {/* Timeline Bar Track */}
      <div
        style={{
          position: "relative",
          height: 36,
          borderRadius: 12,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          marginBottom: 12,
        }}
      >
        {/* Timeline Line */}
        <div style={{ position: "absolute", left: 16, right: 16, height: 4, background: "var(--border)", borderRadius: 999 }} />

        {/* Incident Pins */}
        {incidents.map((inc, i) => {
          const posPct = parseTimestampPercent(inc.timestamp, i);
          const color = colorMap[inc.type] || "#f43f5e";
          const isHovered = hoveredIncident === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIncident(i)}
              onMouseLeave={() => setHoveredIncident(null)}
              style={{
                position: "absolute",
                left: `${posPct}%`,
                transform: "translateX(-50%)",
                cursor: "pointer",
                zIndex: isHovered ? 10 : 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Pin Head */}
              <div
                style={{
                  width: isHovered ? 16 : 12,
                  height: isHovered ? 16 : 12,
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid var(--surface)",
                  boxShadow: `0 0 10px ${color}`,
                  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                }}
              />

              {/* Tooltip Card on Hover */}
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "rgba(15, 23, 42, 0.95)",
                    border: `1px solid ${color}`,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    backdropFilter: "blur(8px)",
                    zIndex: 20,
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color, fontWeight: 800 }}>
                      [{inc.timestamp || "00:00"}]
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{inc.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{inc.detail}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "monospace", color: "var(--text3)" }}>
        <span>0:00 (Start)</span>
        <span>15:00 (Mid)</span>
        <span>30:00 (End)</span>
      </div>
    </div>
  );
}
