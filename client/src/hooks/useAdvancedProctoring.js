import { useState, useEffect, useRef, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/**
 * useAdvancedProctoring — Enterprise AI Proctoring Engine
 *
 * Features:
 * 1. Canvas luminance analysis → camera cover / light bleaching detection
 * 2. MediaPipe Face Landmarker → face count, head pose, gaze tracking
 * 3. Web Audio API → background noise / speech detection
 * 4. Strict tab-switch disqualification (3 strikes = auto-submit)
 * 5. Auto-pause on low visibility / camera obstruction
 */
export function useAdvancedProctoring(enabled = true) {
  // ── State ──
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [warningToast, setWarningToast] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [visibilityStatus, setVisibilityStatus] = useState("CLEAR"); // CLEAR | COVERED | BLEACHED | FACE_MISSING | MULTI_FACE | GAZE_AWAY

  // ── Refs ──
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // offscreen canvas for frame analysis
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const toastTimerRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const gazeAwayStartRef = useRef(null);
  const pausedBySystemRef = useRef(false);

  // Cooldown tracker — prevent spamming the same warning type
  const lastWarningTimeRef = useRef({});
  const WARNING_COOLDOWN_MS = 5000; // 5 seconds between same-type warnings

  // ── Add Incident (with cooldown) ──
  const addIncident = useCallback((type, detail, pointDeduction = 5) => {
    const now = Date.now();
    const lastTime = lastWarningTimeRef.current[type] || 0;
    if (now - lastTime < WARNING_COOLDOWN_MS) return; // skip if cooldown active
    lastWarningTimeRef.current[type] = now;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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

  // ── 1. Camera & Mic Stream Setup (with fallback) ──
  useEffect(() => {
    if (!enabled) return;
    let isMounted = true;

    async function initMedia() {
      try {
        let stream;
        let hasVideo = false;
        let hasAudio = false;

        // Try combined video + audio
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30 },
            },
            audio: true,
          });
          hasVideo = stream.getVideoTracks().length > 0;
          hasAudio = stream.getAudioTracks().length > 0;
        } catch (combinedErr) {
          console.warn("Combined media failed, trying video-only...", combinedErr.message);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 30 },
              },
            });
            hasVideo = stream.getVideoTracks().length > 0;
            hasAudio = false;
          } catch (vidErr) {
            console.warn("Video-only failed, trying audio-only...", vidErr.message);
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

        // Audio monitoring
        if (hasAudio) {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            audioCtxRef.current = audioCtx;
            analyserRef.current = analyser;
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

  // Keep videoRef bound
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [cameraActive]);

  // ── 2. Initialize MediaPipe Face Landmarker ──
  useEffect(() => {
    if (!enabled || !cameraActive) return;
    let cancelled = false;

    async function loadFaceLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        if (cancelled) return;

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 3,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }
        faceLandmarkerRef.current = landmarker;
        console.log("MediaPipe Face Landmarker loaded successfully.");
      } catch (err) {
        console.warn("MediaPipe Face Landmarker failed to load:", err);
        // Graceful degradation: continue with canvas-only analysis
      }
    }

    loadFaceLandmarker();

    return () => {
      cancelled = true;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, [enabled, cameraActive]);

  // ── 3. Main Frame Analysis Loop ──
  useEffect(() => {
    if (!enabled || !cameraActive || isDisqualified) return;

    // Create offscreen canvas once
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let consecutiveCoveredFrames = 0;
    let consecutiveBleachedFrames = 0;
    let consecutiveFaceMissing = 0;
    let consecutiveMultiFace = 0;
    let audioHighCount = 0;

    const COVERED_THRESHOLD = 8;      // frames (~0.8s at 100ms interval)
    const BLEACHED_THRESHOLD = 8;
    const FACE_MISSING_THRESHOLD = 15; // ~1.5s
    const MULTI_FACE_THRESHOLD = 10;   // ~1.0s
    const GAZE_AWAY_DURATION_MS = 3000; // 3 seconds of looking away

    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const w = video.videoWidth || 320;
      const h = video.videoHeight || 240;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      // ─── Canvas Luminance Analysis ───
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const totalPixels = w * h;

      let totalBrightness = 0;
      let darkPixels = 0;  // brightness < 15
      let whitePixels = 0; // brightness > 245
      let sumSqDiff = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += brightness;
        if (brightness < 15) darkPixels++;
        if (brightness > 245) whitePixels++;
      }

      const meanBrightness = totalBrightness / totalPixels;
      const darkRatio = darkPixels / totalPixels;
      const whiteRatio = whitePixels / totalPixels;

      // Compute variance for uniformity check (hand/shutter = uniform dark)
      for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel for perf
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        sumSqDiff += (brightness - meanBrightness) ** 2;
      }
      const sampledPixels = Math.ceil(data.length / 16);
      const variance = sumSqDiff / sampledPixels;

      // ─── Camera Covered Detection ───
      const isCovered = (meanBrightness < 15 && variance < 5) || darkRatio > 0.92;
      if (isCovered) {
        consecutiveCoveredFrames++;
        consecutiveBleachedFrames = 0;
      } else {
        consecutiveCoveredFrames = 0;
      }

      // ─── Light Bleaching / Overexposure Detection ───
      const isBleached = meanBrightness > 240 || whiteRatio > 0.75;
      if (isBleached && !isCovered) {
        consecutiveBleachedFrames++;
      } else if (!isCovered) {
        consecutiveBleachedFrames = 0;
      }

      // ─── MediaPipe Face Analysis ───
      let faceCount = -1; // -1 = not available
      let isGazeAway = false;

      if (faceLandmarkerRef.current) {
        try {
          const result = faceLandmarkerRef.current.detectForVideo(video, performance.now());
          faceCount = result.faceLandmarks?.length || 0;

          // Head pose / gaze estimation from facial transformation matrix
          if (faceCount === 1 && result.facialTransformationMatrixes?.length > 0) {
            const matrix = result.facialTransformationMatrixes[0];
            if (matrix && matrix.data) {
              // Extract yaw and pitch from the 4x4 transformation matrix
              // matrix.data is a Float32Array of 16 elements (column-major)
              const m = matrix.data;
              // Yaw (rotation around Y-axis)
              const yaw = Math.atan2(m[8], m[10]) * (180 / Math.PI);
              // Pitch (rotation around X-axis)
              const pitch = Math.atan2(-m[9], Math.sqrt(m[8] * m[8] + m[10] * m[10])) * (180 / Math.PI);

              // If head turned more than 30° in any direction
              if (Math.abs(yaw) > 30 || Math.abs(pitch) > 25) {
                isGazeAway = true;
              }
            }
          }
        } catch (err) {
          // MediaPipe frame processing error — skip this frame
        }
      }

      // Face missing tracking
      if (faceCount === 0 && !isCovered) {
        consecutiveFaceMissing++;
      } else {
        consecutiveFaceMissing = 0;
      }

      // Multi-face tracking
      if (faceCount > 1) {
        consecutiveMultiFace++;
      } else {
        consecutiveMultiFace = 0;
      }

      // Gaze away tracking
      if (isGazeAway) {
        if (!gazeAwayStartRef.current) {
          gazeAwayStartRef.current = Date.now();
        }
      } else {
        gazeAwayStartRef.current = null;
      }

      const gazeAwayDuration = gazeAwayStartRef.current
        ? Date.now() - gazeAwayStartRef.current
        : 0;

      // ─── Determine Visibility Status & Actions ───
      let newStatus = "CLEAR";
      let shouldPause = false;
      let reason = "";

      if (consecutiveCoveredFrames >= COVERED_THRESHOLD) {
        newStatus = "COVERED";
        shouldPause = true;
        reason = "Camera is obstructed. Please uncover your camera to continue.";
        addIncident("CAMERA_COVERED", "Camera was covered or obstructed.", 8);
      } else if (consecutiveBleachedFrames >= BLEACHED_THRESHOLD) {
        newStatus = "BLEACHED";
        shouldPause = true;
        reason = "Excessive light exposure detected. Adjust lighting so your face is clearly visible.";
        addIncident("LIGHT_BLEACHING", "Light bleaching / overexposure detected.", 5);
      } else if (consecutiveFaceMissing >= FACE_MISSING_THRESHOLD) {
        newStatus = "FACE_MISSING";
        shouldPause = true;
        reason = "No face detected. Please return to your seat and face the camera.";
        addIncident("FACE_MISSING", "No face detected in camera frame.", 8);
      } else if (consecutiveMultiFace >= MULTI_FACE_THRESHOLD) {
        newStatus = "MULTI_FACE";
        shouldPause = false; // warn but don't pause
        reason = "";
        addIncident("MULTIPLE_FACES", `${faceCount} faces detected. Only the candidate should be visible.`, 10);
      } else if (gazeAwayDuration >= GAZE_AWAY_DURATION_MS) {
        newStatus = "GAZE_AWAY";
        shouldPause = false; // warn only
        reason = "";
        addIncident("GAZE_AWAY", "Candidate looked away from screen for an extended period.", 5);
        gazeAwayStartRef.current = null; // reset after warning
      }

      setVisibilityStatus(newStatus);

      if (shouldPause && !pausedBySystemRef.current) {
        pausedBySystemRef.current = true;
        setIsPaused(true);
        setPauseReason(reason);
      } else if (!shouldPause && pausedBySystemRef.current) {
        // Auto-resume when visibility restores
        pausedBySystemRef.current = false;
        setIsPaused(false);
        setPauseReason("");
      }

      // ─── Audio Noise Check ───
      if (analyserRef.current) {
        const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < freqData.length; i++) sum += freqData[i];
        const avg = sum / freqData.length;

        if (avg > 60) {
          audioHighCount++;
          if (audioHighCount >= 5) {
            addIncident("AUDIO_SUSPICIOUS", "Suspicious background noise or speech detected.", 4);
            audioHighCount = 0;
          }
        } else {
          audioHighCount = Math.max(0, audioHighCount - 1);
        }
      }
    }, 100); // 10fps analysis rate

    analysisIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      analysisIntervalRef.current = null;
    };
  }, [enabled, cameraActive, isDisqualified, addIncident]);

  // ── 4. Tab Switch & Focus Detection (Strict 2-Strike Rule) ──
  useEffect(() => {
    if (!enabled || isDisqualified) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            addIncident(
              "DISQUALIFIED_TAB_SWITCH",
              "Test terminated: exceeded maximum tab switches (3/3).",
              30
            );
            setIsDisqualified(true);
          } else {
            addIncident(
              "TAB_SWITCH",
              `Tab switch detected (${newCount}/2 warnings). ${3 - newCount} remaining before disqualification.`,
              10
            );
          }
          return newCount;
        });
      }
    };

    const handlePaste = (e) => {
      const pastedText = e.clipboardData?.getData("text") || "";
      if (pastedText.length > 50) {
        addIncident(
          "PASTE_EVENT",
          `Pasted external text block (${pastedText.length} chars).`,
          8
        );
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      addIncident("CONTEXT_MENU", "Right-click context menu attempted.", 2);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [enabled, isDisqualified, addIncident]);

  return {
    videoRef,
    cameraActive,
    micActive,
    incidents,
    integrityScore,
    warningToast,
    tabSwitchCount,
    isDisqualified,
    isPaused,
    pauseReason,
    visibilityStatus,
  };
}
