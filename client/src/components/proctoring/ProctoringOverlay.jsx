import React, { useState, useRef, useEffect } from "react";

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
    COVERED: "Covered",
    BLEACHED: "Bleach",
    FACE_MISSING: "No Face",
    MULTI_FACE: "Multi",
    GAZE_AWAY: "Gaze",
    AUDIO_BURST: "Noise",
    AUDIO_SPEECH: "Speech",
  };
  const statusLabel = statusLabels[visibilityStatus];

  const tabColor =
    tabSwitchCount === 0 ? "#34d399" : tabSwitchCount <= 1 ? "#fbbf24" : "#f87171";

  // Draggable Movable Position State
  const [position, setPosition] = useState(() => ({
    x: Math.max(20, window.innerWidth - 310),
    y: Math.max(80, window.innerHeight - 260),
  }));
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 290, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 240, e.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

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
            maxWidth: "90vw",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "rgba(0,0,0,0.2)" }}>
            {warningToast.type === "DISQUALIFIED" ? "DISQUALIFIED" : "WARNING"}
          </span>
          <span>
            {warningToast.type === "DISQUALIFIED"
              ? warningToast.detail
              : `${warningCount}/${maxWarnings}: ${warningToast.detail}`}
          </span>
        </div>
      )}

      {/* Floating Movable WebCam Preview Widget (280px x 185px) */}
      <div
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: 999,
          width: 280,
          borderRadius: 20,
          background: "var(--surface)",
          border: `1px solid ${badgeColor}60`,
          boxShadow: `0 14px 36px rgba(0,0,0,0.45), 0 0 20px ${badgeColor}30`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
        }}
      >
        {/* Top Header Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          title="Click and drag to move camera preview anywhere"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "var(--bg2)",
            borderBottom: "1px solid var(--border)",
            cursor: "grab",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text3)", cursor: "grab" }}>⋮⋮</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text)", fontFamily: "monospace" }}>
              FORGE GUARD (DRAG TO MOVE)
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: badgeColor,
              fontFamily: "monospace",
            }}
          >
            {warningCount}/{maxWarnings}
          </span>
        </div>

        {/* Video Preview (Enlarged to 280px x 185px) */}
        <div style={{ position: "relative", width: 280, height: 185, background: "#000" }}>
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
              <span style={{ fontSize: 20, marginBottom: 4 }}>📷</span>
              <span style={{ fontSize: 11, lineHeight: 1.2 }}>Cam Inactive</span>
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
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#f43f5e",
                  boxShadow: "0 0 8px #f43f5e",
                }}
              />
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 800, fontFamily: "monospace" }}>
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
                padding: "3px 8px",
                borderRadius: 999,
                background: "rgba(248, 113, 113, 0.9)",
                backdropFilter: "blur(4px)",
                fontSize: 9,
                color: "#fff",
                fontWeight: 800,
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
            padding: "6px 12px",
            background: "var(--bg2)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: tabColor, fontWeight: 700, fontFamily: "monospace" }}>
              Tab Switches: {tabSwitchCount}/2
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {eyeTrackingActive && (
              <span style={{ fontSize: 10, color: "#34d399", fontFamily: "monospace" }} title="Eye tracking active">
                👁️ Eye Guard
              </span>
            )}
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: visibilityStatus === "CLEAR" ? "#34d399" : "#f87171",
              }}
            />
            <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "monospace", fontWeight: 700 }}>
              {visibilityStatus === "CLEAR" ? "OK" : "ALERT"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
