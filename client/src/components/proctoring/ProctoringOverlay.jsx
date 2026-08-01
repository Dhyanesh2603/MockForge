import React from "react";

export default function ProctoringOverlay({
  videoRef,
  cameraActive,
  warningCount = 0,
  maxWarnings = 5,
  warningToast = null,
  tabSwitchCount = 0,
  visibilityStatus = "CLEAR",
  eyeTrackingActive = false,
}) {
  const warningRatio = warningCount / maxWarnings;
  const badgeColor =
    warningRatio <= 0.4 ? "#34d399" : warningRatio <= 0.7 ? "#fbbf24" : "#f87171";

  const statusLabels = {
    CLEAR: null,
    COVERED: "🖐️ Covered",
    BLEACHED: "☀️ Bleach",
    FACE_MISSING: "👤 No Face",
    MULTI_FACE: "👥 Multi",
    GAZE_AWAY: "👁️ Gaze",
    AUDIO_BURST: "🔊 Noise",
    AUDIO_SPEECH: "🗣️ Speech",
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
            background: warningToast.type === "DISQUALIFIED"
              ? "rgba(220, 38, 38, 0.97)"
              : "rgba(244, 63, 94, 0.95)",
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
          <span style={{ fontSize: 18 }}>
            {warningToast.type === "DISQUALIFIED" ? "🚫" : "⚠️"}
          </span>
          <span>
            {warningToast.type === "DISQUALIFIED"
              ? warningToast.detail
              : `WARNING ${warningCount}/${maxWarnings}: ${warningToast.detail}`}
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
          width: 230,
          borderRadius: 20,
          background: "var(--surface)",
          border: `1px solid ${badgeColor}50`,
          boxShadow: `0 12px 32px rgba(0,0,0,0.4), 0 0 16px ${badgeColor}25`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "var(--bg2)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>🛡️</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text2)", fontFamily: "monospace" }}>
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
            {warningCount}/{maxWarnings}
          </span>
        </div>

        {/* Video Preview */}
        <div style={{ position: "relative", width: 230, height: 160, background: "#000" }}>
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

          {/* LIVE dot */}
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

          {/* Status badge (top-right) */}
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

        {/* Bottom Info Bar */}
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
            {eyeTrackingActive && (
              <span style={{ fontSize: 8, color: "#34d399", fontFamily: "monospace" }} title="Eye tracking active">
                👁️
              </span>
            )}
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
