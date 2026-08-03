import React, { useState, useEffect, useRef } from "react";

/**
 * VoiceInterviewerControls
 * - Reads question aloud via Web Speech Synthesis (TTS)
 * - Dictates candidate answer via Web Speech Recognition (STT) with auto-restart, interim transcript feedback, and clean state sync
 * - Mutually exclusive: reading question aloud stops dictation to avoid transcribing TTS audio; dictating cancels TTS speech.
 * - Notifies parent of dictation state via onListeningStateChange to pause anti-cheat noise penalties during oral answers.
 */
export default function VoiceInterviewerControls({
  questionText = "",
  onTranscript = () => {},
  currentAnswer = "",
  onListeningStateChange = () => {},
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const restartTimerRef = useRef(null);
  const interimTextRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const onListeningStateChangeRef = useRef(onListeningStateChange);
  onListeningStateChangeRef.current = onListeningStateChange;

  // Sync listening state to ref and notify parent
  useEffect(() => {
    isListeningRef.current = isListening;
    if (onListeningStateChangeRef.current) {
      onListeningStateChangeRef.current(isListening);
    }
  }, [isListening]);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const engVoice =
        availableVoices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
        ) || availableVoices.find((v) => v.lang.startsWith("en"));
      if (engVoice) setSelectedVoice(engVoice.name);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Stop listening helper
  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText("");
    interimTextRef.current = "";
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web SpeechRecognition API is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event) => {
        let finalChunk = "";
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalChunk += transcript + " ";
          } else {
            currentInterim += transcript + " ";
          }
        }

        if (finalChunk.trim()) {
          if (onTranscriptRef.current) {
            onTranscriptRef.current(finalChunk.trim());
          }
        }
        
        const cleanInterim = currentInterim.trim();
        setInterimText(cleanInterim);
        interimTextRef.current = cleanInterim;
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition event notice:", event.error);
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed" ||
          event.error === "audio-capture"
        ) {
          stopListening();
        }
      };

      recognition.onend = () => {
        if (interimTextRef.current && onTranscriptRef.current) {
          onTranscriptRef.current(interimTextRef.current);
        }
        setInterimText("");
        interimTextRef.current = "";
        // Safe auto-restart if user did not stop listening
        if (isListeningRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.warn("STT restart suppressed:", e);
              }
            }
          }, 150);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Error instantiating SpeechRecognition:", err);
    }

    return () => {
      isListeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Read question aloud (TTS) - Cancels STT while speaking to avoid self-dictation
  const speakQuestion = () => {
    if (!("speechSynthesis" in window) || !questionText) return;

    if (isSpeaking || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Stop microphone listening so speakers don't feed into dictation box
    stopListening();

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    if (selectedVoice) {
      const vObj = voices.find((v) => v.name === selectedVoice);
      if (vObj) utterance.voice = vObj;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone Dictation (STT) - Cancels TTS so AI doesn't dictate to itself
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech-to-Text dictation is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Cancel TTS if currently speaking
    if (isSpeaking || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (isListening || isListeningRef.current) {
      stopListening();
    } else {
      if (recognitionRef.current) {
        try {
          isListeningRef.current = true;
          setIsListening(true);
          recognitionRef.current.start();
        } catch (err) {
          console.warn("STT start retry:", err);
          try {
            recognitionRef.current.abort();
            setTimeout(() => {
              if (isListeningRef.current && recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 150);
          } catch (e2) {
            stopListening();
          }
        }
      }
    }
  };

  if (!speechSupported) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 14,
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Read Question Aloud */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={speakQuestion}
            className="btn-press"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background: isSpeaking ? "rgba(239, 68, 68, 0.15)" : "var(--surface)",
              border: isSpeaking ? "1px solid var(--red)" : "1px solid var(--border)",
              color: isSpeaking ? "var(--red)" : "var(--text)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span>{isSpeaking ? "🔊 Pause AI Voice" : "📢 Read Question"}</span>
          </button>

          {voices.length > 0 && (
            <select
              value={selectedVoice || ""}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: 8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text3)",
                fontSize: 11,
                outline: "none",
                maxWidth: 140,
              }}
            >
              {voices
                .filter((v) => v.lang.startsWith("en"))
                .map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name.replace(/Google|Microsoft|Apple/g, "").trim()}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Voice Dictation (Mic to Text) */}
        <button
          type="button"
          onClick={toggleListening}
          className="btn-press"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 999,
            background: isListening
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "rgba(var(--forge-rgb), 0.12)",
            border: isListening ? "none" : "1px solid rgba(var(--forge-rgb), 0.3)",
            color: isListening ? "#fff" : "var(--forge)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: isListening ? "0 0 14px rgba(239,68,68,0.4)" : "none",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isListening ? "#fff" : "var(--forge)",
              animation: isListening ? "pulseGlow 1s infinite" : "none",
            }}
          />
          <span>{isListening ? "🎙️ Listening... (Click to Stop)" : "🎙️ Voice Answer"}</span>
        </button>
      </div>

      {/* Real-time Interim Listening Preview Badge */}
      {isListening && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px dashed rgba(239, 68, 68, 0.3)",
            fontSize: 12,
            color: "var(--text2)",
            fontStyle: "italic",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", fontStyle: "normal" }}>
            LIVE:
          </span>
          <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {interimText ? `"${interimText}"` : "Speak clearly into your microphone..."}
          </span>
        </div>
      )}
    </div>
  );
}

