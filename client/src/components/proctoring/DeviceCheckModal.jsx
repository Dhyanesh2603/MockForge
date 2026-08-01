import React, { useState, useEffect, useRef } from "react";

export default function DeviceCheckModal({ onReady, onCancel }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [testing, setTesting] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [hasDeviceError, setHasDeviceError] = useState(false);

  const requestPermissions = async () => {
    setTesting(true);
    setErrorMsg("");
    setHasDeviceError(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("WebRTC MediaDevices API is not supported in this browser environment.");
      setHasDeviceError(true);
      setTesting(false);
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 } },
          audio: true,
        });
        setCameraActive(true);
        setMicActive(true);
      } catch (firstErr) {
        // Fallback: Try Video only or Audio only if combined stream fails
        console.warn("Combined video+audio request failed, trying audio fallback...", firstErr);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicActive(true);
          setCameraActive(false);
          setErrorMsg("Camera device not detected or disabled. Microphone active.");
        } catch (audErr) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraActive(true);
            setMicActive(false);
            setErrorMsg("Microphone device not detected. Camera active.");
          } catch (vidErr) {
            throw firstErr;
          }
        }
      }

      streamRef.current = stream;

      if (videoRef.current && stream.getVideoTracks().length > 0) {
        videoRef.current.srcObject = stream;
      }

      // Audio volume meter
      if (stream.getAudioTracks().length > 0) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          audioCtxRef.current = audioCtx;
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const meterInterval = setInterval(() => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          }, 100);

          return () => clearInterval(meterInterval);
        } catch (aErr) {
          console.warn("Audio meter setup error:", aErr);
        }
      }
    } catch (err) {
      console.warn("Camera/Mic Permission Error:", err);
      setHasDeviceError(true);
      if (err.name === "NotFoundError" || err.message?.includes("not found")) {
        setErrorMsg("No physical camera/microphone hardware detected on this device. You may proceed in software-only mode.");
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg("Camera or Microphone permission was denied by browser settings. Please click the camera icon in your address bar to allow access.");
      } else {
        setErrorMsg(`Media Access Error (${err.name || "Device Error"}): ${err.message || "Failed to access media devices."}`);
      }
      setCameraActive(false);
      setMicActive(false);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="glass"
        style={{
          borderRadius: 24,
          padding: 32,
          maxWidth: 440,
          width: "100%",
          border: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
        <h3
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "var(--text)",
            margin: "0 0 6px",
          }}
        >
          Proctored Session Check
        </h3>
        <p style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 20px", lineHeight: 1.5 }}>
          This interview requires an active <strong>Camera & Microphone</strong> feed for anti-cheat verification.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#f87171",
              fontSize: 12,
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Video & Audio Preview Box */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 200,
            borderRadius: 16,
            background: "#000",
            overflow: "hidden",
            marginBottom: 20,
            border: cameraActive ? "2px solid #34d399" : "1px solid var(--border)",
          }}
        >
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
                padding: 16,
              }}
            >
              <span style={{ fontSize: 32, marginBottom: 8 }}>📷</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>
                Camera is Off
              </span>
              <span style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                Click below to grant permissions
              </span>
            </div>
          )}

          {/* Mic Volume Meter Bar Overlay */}
          {micActive && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                right: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
              }}
            >
              <span style={{ fontSize: 11, color: "#fff" }}>🎤</span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#34d399",
                    width: `${micVolume}%`,
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!cameraActive && !micActive ? (
            <>
              <button
                type="button"
                onClick={requestPermissions}
                disabled={testing}
                className="btn-press"
                style={{
                  padding: "13px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #38bdf8, #0284c7)",
                  color: "#fff",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                {testing ? "Testing Devices..." : "📷 Enable Camera & Microphone"}
              </button>
              {hasDeviceError && (
                <button
                  type="button"
                  onClick={onReady}
                  style={{
                    padding: "10px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text2)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ⚠️ Hardware Missing / Bypass to Start
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onReady}
              className="btn-press glow-blue-sm"
              style={{
                padding: "13px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #34d399, #10b981)",
                color: "#fff",
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              ✓ Devices Ready — Start Interview 🚀
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "10px",
                borderRadius: 12,
                border: "none",
                background: "transparent",
                color: "var(--text3)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
