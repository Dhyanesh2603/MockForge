import { useState, useEffect, useRef, useCallback } from "react";
import { AudioNoiseAnalyzer } from "../utils/audioNoiseAnalyzer";

export function useProctoring(enabled = true) {
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [warningToast, setWarningToast] = useState(null);
  const [isDictatingActive, setIsDictatingActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const audioAnalyzerRef = useRef(null);
  const isDictatingRef = useRef(false);
  const toastTimerRef = useRef(null);

  const setDictatingActive = useCallback((active) => {
    isDictatingRef.current = !!active;
    setIsDictatingActive(!!active);
  }, []);

  // Helper to trigger a warning toast & record an incident
  const addIncident = useCallback((type, detail, pointDeduction = 5) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newIncident = { timestamp: timeStr, type, detail };

    setIncidents((prev) => [...prev, newIncident]);
    setIntegrityScore((prev) => Math.max(0, prev - pointDeduction));

    // Show warning toast
    setWarningToast({ type, detail });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setWarningToast(null);
    }, 4000);
  }, []);

  // 1. Camera & Mic Permission & Stream Setup
  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    async function initMedia() {
      try {
        let stream;
        let hasVideo = false;
        let hasAudio = false;

        // Try combined video + audio first
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
            audio: true,
          });
          hasVideo = stream.getVideoTracks().length > 0;
          hasAudio = stream.getAudioTracks().length > 0;
        } catch (combinedErr) {
          console.warn("Combined media failed, attempting Video-Only fallback...", combinedErr.message);
          try {
            // Video-Only Fallback (solves defective laptop mic issue)
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
            });
            hasVideo = stream.getVideoTracks().length > 0;
            hasAudio = false;
          } catch (vidErr) {
            console.warn("Video-only media failed, attempting Audio-Only fallback...", vidErr.message);
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              hasVideo = false;
              hasAudio = stream.getAudioTracks().length > 0;
            } catch (audErr) {
              throw combinedErr;
            }
          }
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setCameraActive(hasVideo);
        setMicActive(hasAudio);

        if (videoRef.current && hasVideo) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Web Audio API adaptive noise monitoring if audio track exists
        if (hasAudio) {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);

            audioCtxRef.current = audioCtx;
            analyserRef.current = analyser;
            audioAnalyzerRef.current = new AudioNoiseAnalyzer(audioCtx, analyser);

            let highVolumeCount = 0;

            const audioInterval = setInterval(() => {
              if (!audioAnalyzerRef.current) return;
              
              // Skip audio warnings if candidate is actively dictating response
              if (isDictatingRef.current) {
                highVolumeCount = 0;
                return;
              }

              const metrics = audioAnalyzerRef.current.analyze();

              if (metrics.isNoiseBurst || metrics.isSpeech) {
                highVolumeCount++;
                if (highVolumeCount >= 3) {
                  addIncident(
                    metrics.isNoiseBurst ? "AUDIO_BURST" : "AUDIO_ACTIVITY",
                    metrics.isNoiseBurst
                      ? "Sudden loud noise burst detected."
                      : "Unusual background speech activity detected.",
                    4
                  );
                  highVolumeCount = 0;
                }
              } else {
                highVolumeCount = Math.max(0, highVolumeCount - 1);
              }
            }, 800);

            return () => clearInterval(audioInterval);
          } catch (audioErr) {
            console.warn("AudioContext setup failed:", audioErr);
          }
        }
      } catch (err) {
        console.warn("Proctoring Media access denied:", err.message);
        if (isMounted) {
          setCameraActive(false);
          setMicActive(false);
          addIncident("MEDIA_DENIED", "Camera or microphone permission was denied.", 10);
        }
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [enabled, addIncident]);

  // Keep videoRef.srcObject bound whenever camera becomes active or DOM renders videoRef
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [cameraActive]);

  // 2. Tab Switch & Window Focus Detection
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addIncident("TAB_SWITCH", "Candidate switched away from interview tab.", 10);
      }
    };

    const handleWindowBlur = () => {
      addIncident("WINDOW_BLUR", "Focus lost on interview window.", 5);
    };

    const handlePaste = (e) => {
      // Check if candidate pasted large block of text
      const pastedText = e.clipboardData?.getData("text") || "";
      if (pastedText.length > 50) {
        addIncident("PASTE_EVENT", `Pasted external text block (${pastedText.length} chars).`, 8);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("paste", handlePaste);
    };
  }, [enabled, addIncident]);

  return {
    videoRef,
    cameraActive,
    micActive,
    incidents,
    integrityScore,
    warningToast,
    isDictatingActive,
    setDictatingActive,
  };
}
