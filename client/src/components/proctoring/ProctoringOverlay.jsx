import React from "react";

export default function ProctoringOverlay({
  videoRef,
  cameraActive,
  integrityScore = 100,
  warningToast = null,
  tabSwitchCount = 0,
  visibilityStatus = "CLEAR",
}) {
  const badgeColor =
    integrityScore >= 80 ? "#34d399" : integrityScore >= 60 ? "#fbbf24" : "#f87171";

  const statusLabels = {
    CLEAR: null,
    COVERED: "🖐️ Covered",
    BLEACHED: "☀️ Bleach",
    FACE_MISSING: "👤 No Face",
    MULTI_FACE: "👥 Multi",
    GAZE_AWAY: "👁️ Gaze",
  };
  const statusLabel = statusLabels[visibilityStatus];

  const tabColor =
    tabSwitchCount === 0 ? "#34d399" : tabSwitchCount <= 1 ? "#fbbf24" : "#f87171";

  return (
    <>
      {/* Warning Toast Banner */}
      {warningToast && (
        <div
          style={{
            position: "fixed",
            top: 70,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "12px 24px",
            borderRadius: 16,
            background: "rgba(244, 63, 94, 0.95)",
            color: "#fff",
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 10px 30px rgba(244, 63, 94, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            backdropFilter: "blur(8px)",
            animation: "slideDown 0.3s ease-out",
            maxWidth: "90vw",
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span>
            PROCTORING WARNING: {warningToast.detail}
          </span>
        </div>
      )}

      {/* Floating WebCam Preview Widget */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 900,
          width: 176,
          borderRadius: 18,
          background: "var(--surface)",
          border: `1px solid ${badgeColor}40`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 12px ${badgeColor}20`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Trust Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 10px",
            background: "var(--bg2)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10 }}>🛡️</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text2)", fontFamily: "monospace" }}>
              FORGE GUARD
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: badgeColor,
              fontFamily: "monospace",
            }}
          >
            {integrityScore}%
          </span>
        </div>

        {/* Video Preview Frame */}
        <div style={{ position: "relative", width: 176, height: 120, background: "#000" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              display: cameraActive ? "block" : "none",
            }}
          />

          {!cameraActive && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text3)",
                padding: 10,
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 18, marginBottom: 4 }}>📷</span>
              <span style={{ fontSize: 10, lineHeight: 1.2 }}>Cam Inactive</span>
            </div>
          )}

          {/* Live Indicator Dot */}
          {cameraActive && (
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#f43f5e",
                  boxShadow: "0 0 6px #f43f5e",
                }}
              />
              <span style={{ fontSize: 8, color: "#fff", fontWeight: 700, fontFamily: "monospace" }}>
                LIVE
              </span>
            </div>
          )}

          {/* Visibility Status Badge (top-right) */}
          {statusLabel && (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                padding: "2px 6px",
                borderRadius: 999,
                background: "rgba(248, 113, 113, 0.85)",
                backdropFilter: "blur(4px)",
                fontSize: 8,
                color: "#fff",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              {statusLabel}
            </div>
          )}
        </div>

        {/* Bottom Info Bar — Tab Switch Counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 10px",
            background: "var(--bg2)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 9 }}>🔄</span>
            <span style={{ fontSize: 9, color: tabColor, fontWeight: 700, fontFamily: "monospace" }}>
              Tab: {tabSwitchCount}/2
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: visibilityStatus === "CLEAR" ? "#34d399" : "#f87171",
              }}
            />
            <span style={{ fontSize: 9, color: "var(--text3)", fontFamily: "monospace" }}>
              {visibilityStatus === "CLEAR" ? "OK" : "ALERT"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
