import React from "react";

/**
 * ProctoringPauseOverlay — Full-screen overlay that pauses the test
 * when camera/lighting/face/audio issues are detected.
 * Auto-dismisses when the issue is resolved.
 */
export default function ProctoringPauseOverlay({ reason, visibilityStatus, warningCount, maxWarnings }) {
  const icons = {
    COVERED: "🖐️",
    BLEACHED: "☀️",
    FACE_MISSING: "👤",
    MULTI_FACE: "👥",
    AUDIO_BURST: "🔊",
    AUDIO_SPEECH: "🗣️",
  };

  const titles = {
    COVERED: "Camera Obstructed",
    BLEACHED: "Excessive Light Detected",
    FACE_MISSING: "No Face Detected",
    MULTI_FACE: "Multiple Faces Detected",
    AUDIO_BURST: "Loud Noise Detected",
    AUDIO_SPEECH: "Background Speech Detected",
  };

  const icon = icons[visibilityStatus] || "⚠️";
  const title = titles[visibilityStatus] || "Proctoring Alert";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      />

      {/* Content Card */}
      <div
        style={{
          position: "relative",
          maxWidth: 440,
          width: "100%",
          borderRadius: 24,
          padding: "48px 36px 40px",
          background: "linear-gradient(145deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 28, 0.98))",
          border: "1px solid rgba(248, 113, 113, 0.3)",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(248, 113, 113, 0.1)",
          textAlign: "center",
        }}
      >
        {/* Pulsing warning ring */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(248, 113, 113, 0.12)",
            border: "2px solid rgba(248, 113, 113, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            animation: "pulseRing 2s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: 36 }}>{icon}</span>
        </div>

        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "#f87171",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "#fbbf24",
            margin: "0 0 20px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          ⏸ TEST PAUSED
        </p>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.7)",
            lineHeight: 1.7,
            margin: "0 0 28px",
          }}
        >
          {reason}
        </p>

        {/* Warning counter */}
        {warningCount != null && maxWarnings != null && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              Warnings:
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: warningCount >= maxWarnings - 1 ? "#f87171" : "#fbbf24",
                fontFamily: "monospace",
              }}
            >
              {warningCount} / {maxWarnings}
            </span>
          </div>
        )}

        {/* Status indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 999,
            background: "rgba(248, 113, 113, 0.1)",
            border: "1px solid rgba(248, 113, 113, 0.25)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f87171",
              animation: "blink 1s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#f87171",
              fontFamily: "monospace",
              textTransform: "uppercase",
            }}
          >
            Waiting for issue to resolve...
          </span>
        </div>

        <p
          style={{
            fontSize: 11,
            color: "rgba(255, 255, 255, 0.35)",
            marginTop: 24,
            lineHeight: 1.5,
          }}
        >
          Timer is paused. Your test will resume automatically
          once the issue is resolved.
        </p>
      </div>

      <style>{`
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
