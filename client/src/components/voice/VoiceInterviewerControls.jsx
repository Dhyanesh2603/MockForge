import React, { useState, useEffect, useRef } from "react";

/**
 * VoiceInterviewerControls
 * - Reads question aloud via Web Speech Synthesis (TTS)
 * - Dictates candidate answer via Web Speech Recognition (STT) with auto-restart and clean text stream
 */
export default function VoiceInterviewerControls({
  questionText = "",
  onTranscript = () => {},
  currentAnswer = "",
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  // Sync listening state to ref for auto-restart
  useEffect(() => {
    isListeningRef.current = isListening;
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
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalChunk += transcript + " ";
          }
        }

        if (finalChunk.trim() && onTranscriptRef.current) {
          onTranscriptRef.current(finalChunk.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition event notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        // Auto-restart if user has not explicitly stopped listening
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
            isListeningRef.current = false;
          }
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Read question aloud (TTS)
  const speakQuestion = () => {
    if (!("speechSynthesis" in window) || !questionText) return;

    if (isSpeaking || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

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

  // Toggle Microphone Dictation (STT)
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech-to-Text dictation is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening || isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    } else {
      if (recognitionRef.current) {
        try {
          isListeningRef.current = true;
          setIsListening(true);
          recognitionRef.current.start();
        } catch (err) {
          console.warn("STT start retry:", err);
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              recognitionRef.current.start();
            }, 150);
          } catch (e2) {
            setIsListening(false);
            isListeningRef.current = false;
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
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 14px",
        borderRadius: 14,
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        marginBottom: 14,
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
  );
}
