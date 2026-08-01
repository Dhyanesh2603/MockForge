import { useState, useEffect, useRef, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/**
 * useAdvancedProctoring — Enterprise AI Proctoring Engine
 *
 * Warning System:
 * - Video warnings (camera cover, bleaching, face missing, multi-face): counted
 * - Audio warnings (noise burst, continuous speech): counted
 * - Eye gaze warnings (looking away from screen): counted
 * - Combined limit: 5 warnings (video+audio) OR 10 warnings if eye tracking active
 * - Tab switches: separate 3-strike disqualification
 * - Auto-pause on camera/lighting/face issues + audio issues
 */
export function useAdvancedProctoring(enabled = true) {
  // ── State ──
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [warningToast, setWarningToast] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [visibilityStatus, setVisibilityStatus] = useState("CLEAR");
  const [eyeTrackingActive, setEyeTrackingActive] = useState(false);

  // Max warnings: 10 if eye tracking loaded, 5 otherwise
  const maxWarnings = eyeTrackingActive ? 10 : 5;

  // ── Refs ──
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const toastTimerRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const gazeAwayStartRef = useRef(null);
  const pausedBySystemRef = useRef(false);
  const warningCountRef = useRef(0); // mirror for use inside intervals

  // Cooldown tracker
  const lastWarningTimeRef = useRef({});
  const WARNING_COOLDOWN_MS = 6000;

  // Audio pause tracking
  const audioPausedRef = useRef(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);

  // ── Add Warning (with cooldown & counting) ──
  const addWarning = useCallback((type, detail, isPauseWorthy = false) => {
    const now = Date.now();
    const lastTime = lastWarningTimeRef.current[type] || 0;
    if (now - lastTime < WARNING_COOLDOWN_MS) return;
    lastWarningTimeRef.current[type] = now;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setIncidents((prev) => [...prev, { timestamp: timeStr, type, detail }]);

    setWarningCount((prev) => {
      const newCount = prev + 1;
      warningCountRef.current = newCount;
      return newCount;
    });

    // Show warning toast
    setWarningToast({ type, detail });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setWarningToast(null), 4000);
  }, []);

  // ── Check disqualification on warning count change ──
  useEffect(() => {
    if (warningCount >= maxWarnings && !isDisqualified) {
      setIsDisqualified(true);
      setWarningToast({
        type: "DISQUALIFIED",
        detail: `Maximum warnings reached (${maxWarnings}/${maxWarnings}). Test terminated.`,
      });
    }
  }, [warningCount, maxWarnings, isDisqualified]);

  // ── 1. Camera & Mic Stream Setup (with fallback) ──
  useEffect(() => {
    if (!enabled) return;
    let isMounted = true;

    async function initMedia() {
      try {
        let stream;
        let hasVideo = false;
        let hasAudio = false;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
            audio: true,
          });
          hasVideo = stream.getVideoTracks().length > 0;
          hasAudio = stream.getAudioTracks().length > 0;
        } catch (combinedErr) {
          console.warn("Combined media failed, trying video-only...", combinedErr.message);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
            });
            hasVideo = stream.getVideoTracks().length > 0;
          } catch (vidErr) {
            console.warn("Video-only failed, trying audio-only...", vidErr.message);
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

        // Audio monitoring setup
        if (hasAudio) {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
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
          addWarning("MEDIA_DENIED", "Camera or microphone permission was denied.");
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
  }, [enabled, addWarning]);

  // Keep videoRef bound
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [cameraActive]);

  // ── 2. Initialize MediaPipe Face Landmarker (with eye tracking) ──
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
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }
        faceLandmarkerRef.current = landmarker;
        setEyeTrackingActive(true);
        console.log("MediaPipe Face Landmarker + Eye Tracking loaded.");
      } catch (err) {
        console.warn("MediaPipe Face Landmarker failed to load:", err);
        setEyeTrackingActive(false);
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

  // ── 3. Main Frame + Audio Analysis Loop ──
  useEffect(() => {
    if (!enabled || !cameraActive || isDisqualified) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let consecutiveCoveredFrames = 0;
    let consecutiveBleachedFrames = 0;
    let consecutiveFaceMissing = 0;
    let consecutiveMultiFace = 0;

    // Audio tracking
    let consecutiveHighAudio = 0;
    let continuousSpeechFrames = 0;

    const COVERED_THRESHOLD = 8;
    const BLEACHED_THRESHOLD = 8;
    const FACE_MISSING_THRESHOLD = 15;
    const MULTI_FACE_THRESHOLD = 10;
    const GAZE_AWAY_DURATION_MS = 3000;

    // Audio thresholds
    const NOISE_BURST_THRESHOLD = 85;   // sudden loud noise
    const SPEECH_THRESHOLD = 40;        // ongoing speech level
    const CONTINUOUS_SPEECH_FRAMES = 30; // ~3 seconds of continuous speech at 100ms

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
      let darkPixels = 0;
      let whitePixels = 0;
      let sumSqDiff = 0;

      for (let i = 0; i < data.length; i += 4) {
        const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        totalBrightness += brightness;
        if (brightness < 15) darkPixels++;
        if (brightness > 245) whitePixels++;
      }

      const meanBrightness = totalBrightness / totalPixels;
      const darkRatio = darkPixels / totalPixels;
      const whiteRatio = whitePixels / totalPixels;

      // Variance (sampled)
      for (let i = 0; i < data.length; i += 16) {
        const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sumSqDiff += (brightness - meanBrightness) ** 2;
      }
      const sampledPixels = Math.ceil(data.length / 16);
      const variance = sumSqDiff / sampledPixels;

      // Camera covered
      const isCovered = (meanBrightness < 15 && variance < 5) || darkRatio > 0.92;
      if (isCovered) {
        consecutiveCoveredFrames++;
        consecutiveBleachedFrames = 0;
      } else {
        consecutiveCoveredFrames = 0;
      }

      // Light bleaching
      const isBleached = meanBrightness > 240 || whiteRatio > 0.75;
      if (isBleached && !isCovered) {
        consecutiveBleachedFrames++;
      } else if (!isCovered) {
        consecutiveBleachedFrames = 0;
      }

      // ─── MediaPipe Face + Eye Gaze Analysis ───
      let faceCount = -1;
      let isGazeAway = false;

      if (faceLandmarkerRef.current) {
        try {
          const result = faceLandmarkerRef.current.detectForVideo(video, performance.now());
          faceCount = result.faceLandmarks?.length || 0;

          if (faceCount === 1 && result.faceLandmarks[0]) {
            const landmarks = result.faceLandmarks[0];

            // ── Eye Gaze Detection using Iris Landmarks ──
            // MediaPipe Face Landmarker provides 478 landmarks
            // Left iris center: 468, Right iris center: 473
            // Left eye corners: 33 (inner), 133 (outer)
            // Right eye corners: 362 (inner), 263 (outer)

            if (landmarks.length >= 478) {
              const leftIris = landmarks[468];
              const leftInner = landmarks[133];
              const leftOuter = landmarks[33];

              const rightIris = landmarks[473];
              const rightInner = landmarks[362];
              const rightOuter = landmarks[263];

              // Calculate horizontal gaze ratio for each eye
              // 0 = looking far left, 0.5 = center, 1 = looking far right
              const leftEyeWidth = Math.abs(leftOuter.x - leftInner.x);
              const leftGazeRatio = leftEyeWidth > 0.001
                ? (leftIris.x - Math.min(leftOuter.x, leftInner.x)) / leftEyeWidth
                : 0.5;

              const rightEyeWidth = Math.abs(rightOuter.x - rightInner.x);
              const rightGazeRatio = rightEyeWidth > 0.001
                ? (rightIris.x - Math.min(rightOuter.x, rightInner.x)) / rightEyeWidth
                : 0.5;

              const avgGaze = (leftGazeRatio + rightGazeRatio) / 2;

              // Vertical gaze — check if looking up or down
              const leftUpperLid = landmarks[159];
              const leftLowerLid = landmarks[145];
              const leftEyeHeight = Math.abs(leftUpperLid.y - leftLowerLid.y);
              const leftVerticalRatio = leftEyeHeight > 0.001
                ? (leftIris.y - Math.min(leftUpperLid.y, leftLowerLid.y)) / leftEyeHeight
                : 0.5;

              const rightUpperLid = landmarks[386];
              const rightLowerLid = landmarks[374];
              const rightEyeHeight = Math.abs(rightUpperLid.y - rightLowerLid.y);
              const rightVerticalRatio = rightEyeHeight > 0.001
                ? (rightIris.y - Math.min(rightUpperLid.y, rightLowerLid.y)) / rightEyeHeight
                : 0.5;

              const avgVertical = (leftVerticalRatio + rightVerticalRatio) / 2;

              // Eyes looking away: horizontal gaze too far left/right OR vertical too extreme
              // Center is ~0.5, looking away is <0.25 or >0.75
              if (avgGaze < 0.2 || avgGaze > 0.8 || avgVertical < 0.15 || avgVertical > 0.85) {
                isGazeAway = true;
              }
            }

            // Also check head pose from transformation matrix
            if (result.facialTransformationMatrixes?.length > 0) {
              const matrix = result.facialTransformationMatrixes[0];
              if (matrix && matrix.data) {
                const m = matrix.data;
                const yaw = Math.atan2(m[8], m[10]) * (180 / Math.PI);
                const pitch = Math.atan2(-m[9], Math.sqrt(m[8] * m[8] + m[10] * m[10])) * (180 / Math.PI);
                if (Math.abs(yaw) > 30 || Math.abs(pitch) > 25) {
                  isGazeAway = true;
                }
              }
            }
          }
        } catch (err) {
          // skip frame
        }
      }

      // Face missing
      if (faceCount === 0 && !isCovered) {
        consecutiveFaceMissing++;
      } else {
        consecutiveFaceMissing = 0;
      }

      // Multi-face
      if (faceCount > 1) {
        consecutiveMultiFace++;
      } else {
        consecutiveMultiFace = 0;
      }

      // Gaze away duration
      if (isGazeAway) {
        if (!gazeAwayStartRef.current) gazeAwayStartRef.current = Date.now();
      } else {
        gazeAwayStartRef.current = null;
      }
      const gazeAwayDuration = gazeAwayStartRef.current
        ? Date.now() - gazeAwayStartRef.current
        : 0;

      // ─── Audio Analysis ───
      let audioLevel = 0;
      if (analyserRef.current) {
        const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < freqData.length; i++) sum += freqData[i];
        audioLevel = sum / freqData.length;
      }

      // Sudden noise burst
      const isNoiseBurst = audioLevel > NOISE_BURST_THRESHOLD;

      // Continuous speech detection
      if (audioLevel > SPEECH_THRESHOLD) {
        continuousSpeechFrames++;
      } else {
        continuousSpeechFrames = Math.max(0, continuousSpeechFrames - 2); // decay
      }
      const isContinuousSpeech = continuousSpeechFrames >= CONTINUOUS_SPEECH_FRAMES;

      // ─── Determine Status & Actions ───
      let newStatus = "CLEAR";
      let shouldPause = false;
      let reason = "";

      if (consecutiveCoveredFrames >= COVERED_THRESHOLD) {
        newStatus = "COVERED";
        shouldPause = true;
        reason = "Camera is obstructed. Please uncover your camera to continue.";
        addWarning("CAMERA_COVERED", "Camera was covered or obstructed.");
      } else if (consecutiveBleachedFrames >= BLEACHED_THRESHOLD) {
        newStatus = "BLEACHED";
        shouldPause = true;
        reason = "Excessive light detected. Adjust lighting so your face is clearly visible.";
        addWarning("LIGHT_BLEACHING", "Light bleaching / overexposure detected.");
      } else if (consecutiveFaceMissing >= FACE_MISSING_THRESHOLD) {
        newStatus = "FACE_MISSING";
        shouldPause = true;
        reason = "No face detected. Please return to your seat and face the camera.";
        addWarning("FACE_MISSING", "No face detected in camera frame.");
      } else if (consecutiveMultiFace >= MULTI_FACE_THRESHOLD) {
        newStatus = "MULTI_FACE";
        shouldPause = true;
        reason = "Multiple faces detected. Only the candidate should be visible.";
        addWarning("MULTIPLE_FACES", `${faceCount} faces detected in frame.`);
      } else if (gazeAwayDuration >= GAZE_AWAY_DURATION_MS && eyeTrackingActive) {
        newStatus = "GAZE_AWAY";
        shouldPause = false;
        addWarning("GAZE_AWAY", "Eyes not focused on screen. Please look at your screen.");
        gazeAwayStartRef.current = null;
      } else if (isNoiseBurst) {
        newStatus = "AUDIO_BURST";
        shouldPause = true;
        reason = "Sudden loud noise detected. Please ensure a quiet environment to continue.";
        addWarning("AUDIO_BURST", "Sudden noise burst detected in microphone.");
        consecutiveHighAudio = 0;
      } else if (isContinuousSpeech) {
        newStatus = "AUDIO_SPEECH";
        shouldPause = true;
        reason = "Continuous speech detected. Ensure no one is speaking nearby.";
        addWarning("AUDIO_SPEECH", "Continuous background speech detected.");
        continuousSpeechFrames = 0;
      }

      setVisibilityStatus(newStatus);

      // Manage pause state
      if (shouldPause && !pausedBySystemRef.current) {
        pausedBySystemRef.current = true;
        audioPausedRef.current = newStatus === "AUDIO_BURST" || newStatus === "AUDIO_SPEECH";
        setIsPaused(true);
        setIsAudioPaused(newStatus === "AUDIO_BURST" || newStatus === "AUDIO_SPEECH");
        setPauseReason(reason);
      } else if (!shouldPause && pausedBySystemRef.current) {
        pausedBySystemRef.current = false;
        audioPausedRef.current = false;
        setIsPaused(false);
        setIsAudioPaused(false);
        setPauseReason("");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [enabled, cameraActive, isDisqualified, eyeTrackingActive, addWarning]);

  // ── 4. Tab Switch Detection (3 strikes) ──
  useEffect(() => {
    if (!enabled || isDisqualified) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            addWarning(
              "DISQUALIFIED_TAB_SWITCH",
              "Test terminated: exceeded maximum tab switches (3/3)."
            );
            setIsDisqualified(true);
          } else {
            addWarning(
              "TAB_SWITCH",
              `Tab switch detected (${newCount}/2 warnings). ${3 - newCount} remaining before disqualification.`
            );
          }
          return newCount;
        });
      }
    };

    const handlePaste = (e) => {
      const pastedText = e.clipboardData?.getData("text") || "";
      if (pastedText.length > 50) {
        addWarning("PASTE_EVENT", `Pasted external text block (${pastedText.length} chars).`);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [enabled, isDisqualified, addWarning]);

  return {
    videoRef,
    cameraActive,
    micActive,
    incidents,
    warningCount,
    maxWarnings,
    warningToast,
    tabSwitchCount,
    isDisqualified,
    isPaused,
    isAudioPaused,
    pauseReason,
    visibilityStatus,
    eyeTrackingActive,
  };
}
