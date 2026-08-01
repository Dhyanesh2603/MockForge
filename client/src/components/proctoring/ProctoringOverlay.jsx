import React from "react";

export default function ProctoringOverlay({
  videoRef,
  cameraActive,
  integrityScore = 100,
  warningToast = null,
}) {
  const badgeColor =
    integrityScore >= 80 ? "#34d399" : integrityScore >= 60 ? "#fbbf24" : "#f87171";

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
          width: 160,
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
            {integrityScore}%
          </span>
        </div>

        {/* Video Preview Frame */}
        <div style={{ position: "relative", width: 160, height: 110, background: "#000" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)", // Mirror camera feed
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
        </div>
      </div>
    </>
  );
}
