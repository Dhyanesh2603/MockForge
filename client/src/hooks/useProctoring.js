import { useState, useEffect, useRef, useCallback } from "react";

export function useProctoring(enabled = true) {
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [warningToast, setWarningToast] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const toastTimerRef = useRef(null);

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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setCameraActive(true);
        setMicActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Web Audio API noise monitoring
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          audioCtxRef.current = audioCtx;
          analyserRef.current = analyser;

          // Poll audio level every 1 second
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          let highVolumeCount = 0;

          const audioInterval = setInterval(() => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;

            // Threshold for loud speech / background noise spike
            if (average > 65) {
              highVolumeCount++;
              if (highVolumeCount >= 3) {
                addIncident("AUDIO_ACTIVITY", "Unusual speech/noise activity detected.", 4);
                highVolumeCount = 0;
              }
            } else {
              highVolumeCount = 0;
            }
          }, 1000);

          return () => clearInterval(audioInterval);
        } catch (audioErr) {
          console.warn("AudioContext setup failed:", audioErr);
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
  };
}
